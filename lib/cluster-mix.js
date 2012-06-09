/*!
 * mixture
 * Copyright(c) 2011 Daniel D. Shaw <dshaw@dshaw.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var assert = require('assert')
  , fork = require('child_process').fork
  , net = require('net')
  , EventEmitter = require('events').EventEmitter

var cluster = module.exports = new EventEmitter();

var debug;
if (process.env.NODE_DEBUG && /cluster/.test(process.env.NODE_DEBUG)) {
  debug = function(x) {
    var prefix = process.pid + ',' + (process.env.NODE_WORKER_ID ? 'Worker' : 'Master');
    console.error(prefix, x);
  };
} else {
  debug = function() { };
}


// Used in the master:
var masterStarted = false;
var ids = 0;
var taskCount = 0;
var tasks = {};
var workers = [];
var servers = {};

// Used in the worker:
var workerId = 0;
var queryIds = 0;
var queryCallbacks = {};

cluster.isWorker = 'NODE_WORKER_ID' in process.env;
cluster.isMaster = ! cluster.isWorker;

// Call this from the master process. It will start child workers.
//
// options.workerFilename
// Specifies the script to execute for the child processes. Default is
// process.argv[1]
//
// options.args
// Specifies program arguments for the workers. The Default is
// process.argv.slice(2)
//
// options.workers
// The number of workers to start. Defaults to os.cpus().length.
function startMaster() {
  // This can only be called from the master.
  assert(cluster.isMaster);

  if (masterStarted) return;
  masterStarted = true;

  process.on('uncaughtException', function(e) {
    // Quickly try to kill all the workers.
    // TODO: be session leader - will cause auto SIGHUP to the children.
    cluster.eachWorker(function(worker) {
      debug("kill worker " + worker.pid);
      worker.kill();
    });

    console.error("Exception in cluster master process: " +
        e.message + '\n' + e.stack);
    console.error("Please report this bug.");
    process.exit(1);
  });
}


function handleWorkerMessage(worker, message) {
  // This can only be called from the master.
  assert(cluster.isMaster);

  debug("recv " + JSON.stringify(message));

  switch (message.cmd) {
    case 'online':
      console.log("Worker " + worker.pid + " online");
      workers.push(worker);
      break;

    case 'queryServer':
      var key = message.address + ":" +
                message.port + ":" +
                message.addressType;
      var response = { _queryId: message._queryId };

      if (key in servers == false) {
        // Create a new server.
        debug('create new server ' + key);
        servers[key] = net._createServerHandle(message.address,
                                               message.port,
                                               message.addressType);
      }
      worker.send(response, servers[key]);
      break;

    default:
      // Ignore.
      break;
  }
}


function eachWorker(task, cb) {
  // This can only be called from the master.
  assert(cluster.isMaster);

  var _workers = workers;

  if (arguments.length < 2) {
    cb = task;
  } else {
    _workers = tasks[task].workers
  }

  for (var id in _workers) {
    if (_workers[id]) {
      cb(_workers[id]);
    }
  }
}


cluster.fork = function(filename, args, options) {
  // This can only be called from the master.
  assert(cluster.isMaster);

  // Lazily start the master process stuff.
  startMaster();

  var id = ++ids;
  var envCopy = {};

  for (var x in process.env) {
    envCopy[x] = process.env[x];
  }

  envCopy['NODE_WORKER_ID'] = id;

  if ('object' == typeof filename) {
    var name = filename;
    filename = tasks[name].filename;
    args = tasks[name].args;
    options = tasks[name].options;
  } else {
    // new task
    filename || (fileName = process.argv[1]);
    args || (args = process.argv.slice(3));
    options || (options = {});

    var name = options.name || taskCount;
    options.name = name; // set if using default
    options.env = envCopy;

    tasks[name] = {
        workers: []
      , filename: filename
      , args: args
      , options: options
    };

    taskCount++;
  }

  var worker = fork(filename, args, options);

  tasks[name].workers.push(worker);

  worker.on('message', function(message) {
    handleWorkerMessage(worker, message);
  });

  worker.on('exit', function() {
    debug('worker id=' + id + ' died');
    delete workers[id];
    cluster.emit('death', worker);
  });

  return worker;
};


// Internal function. Called from src/node.js when worker process starts.
cluster._startWorker = function(id) {
  assert(cluster.isWorker);
  workerId = parseInt(process.env.NODE_WORKER_ID);

  queryMaster({ cmd: 'online' });

  // Make callbacks from queryMaster()
  process.on('message', function(msg, handle) {
    debug("recv " + JSON.stringify(msg));
    if (msg._queryId && msg._queryId in queryCallbacks) {
      var cb = queryCallbacks[msg._queryId];
      if (typeof cb == 'function') {
        cb(msg, handle);
      }
      delete queryCallbacks[msg._queryId]
    }
  });
};


function queryMaster(msg, cb) {
  assert(cluster.isWorker);

  debug('send ' + JSON.stringify(msg));

  // Grab some random queryId
  msg._queryId = (++queryIds);
  msg._workerId = workerId;

  // Store callback for later. Callback called in _startWorker.
  if (cb) {
    queryCallbacks[msg._queryId] = cb;
  }

  // Send message to master.
  process.send(msg);
}


// Internal function. Called by lib/net.js when attempting to bind a
// server.
cluster._getServer = function(address, port, addressType, cb) {
  assert(cluster.isWorker);

  queryMaster({
    cmd: "queryServer",
    address: address,
    port: port,
    addressType: addressType
  }, function(msg, handle) {
    cb(handle);
  });
};
