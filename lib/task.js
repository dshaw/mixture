/*!
 * mixture
 * Copyright(c) 2011 Daniel D. Shaw <dshaw@dshaw.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var assert = require('assert')
  , fork = require('fork')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter

/**
 * Exports
 */

exports = module.exports = Task;

/**
 * Cluster-like debug handler
 */

var debug;
if (process.env.NODE_DEBUG && /cluster/.test(process.env.NODE_DEBUG)) {
  debug = function(x) {
    var prefix = process.pid + ',' + (process.env.NODE_WORKER_ID ? 'Worker' : 'Master');
    console.error(prefix, x);
  };
} else {
  debug = function() { };
}

/**
 * Task
 *
 * @param options
 * @api public
 */
function Task (options) {
  this.master = options.master
  this.name = options.name
  this.filename = options.filname
  this.args = options.args
  this.options = options.options
  this.workers = []
  this.initiazed = false
}

/**
 * Inherit EventEmitter
 */

util.inherits(Task, EventEmitter);

/**
 * fork it real good. dun duh duh dun duh duh dunna dunaa.
 *
 * @param filename
 * @param args
 * @param options
 */

Task.prototype.fork = function(filename, args, options) {
  var self = this
    , id = ++this.master.ids
    , envCopy = {}
    , options = {}

  for (var x in process.env) {
    envCopy[x] = process.env[x]
  }

  // Node's `NODE_WORKER_ID` has too much behavior attached to it.
  envCopy['MIXTURE_WORKER_ID'] = id

  for (var x in this.options) {
    options[x] = this.options[x]
  }

  options.env = envCopy

  var worker = fork(this.filename, this.args, this.options)
  workers.push(worker)
  master.workers.push(workers)

  worker.on('message', function(message) {
    self.master.onWorkerMessage(worker, self, message)
  });

  worker.on('exit', function() {
    debug('worker id=' + id + ' died')
    delete this.workers[id]
    delete workers[id]
    self.master.emit('death', worker, self)
  });

  this.master.emit('online', worker, self)
  this.initialized = true

  return this
}

