/*!
 * mixture
 * Copyright(c) 2011 Daniel D. Shaw <dshaw@dshaw.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var assert = require('assert')
  , spawn = require('child_process').spawn
  , util = require('util')
  , EventEmitter = require('events').EventEmitter
  , cpu = require('./cpu')

/**
 * Exports.
 */

exports = module.exports = Task

/**
 * Task
 *
 * @param options
 * @api public
 */

function Task (options) {
  this.master = options.master
  this.name = options.name
  this.filename = options.filename
  this.args = options.args
  this.options = options.options
  this.workers = []
  this.initialized = !!(this.filename)
}

/**
 * Inherit EventEmitter.
 */

util.inherits(Task, EventEmitter)

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
    , forkOptions = {}
    , envCopy = {}
    , mergedOptions = {}

  if (!this.initialized) {
    if (!this.filename) this.filename = filename || this.name
    if (!this.args) this.args = args
    if (!this.options) this.options = options
    filename = this.filename
  } else {
    if ('object' == typeof filename) forkOptions = filename
    filename = forkOptions.filename || this.filename
    args = forkOptions.args || this.args
    options = forkOptions.options || this.options
  }

  args = args ? args.slice(0) : [];
  args.unshift(filename)

  for (var x in process.env) {
    envCopy[x] = process.env[x]
  }

  // Node's `NODE_WORKER_ID` has too much behavior attached to it.
  envCopy['MIXTURE_WORKER_ID'] = id
  envCopy['MIXTURE_TASK_NAME'] = this.name

  for (var x in this.options) {
    mergedOptions[x] = this.options[x]
  }

  for (var x in forkOptions) {
    mergedOptions[x] = forkOptions[x]
  }

  mergedOptions.env = envCopy

  // Just need to set this - child process won't actually use the fd.
  mergedOptions.env.NODE_CHANNEL_FD = 42;

  // Leave stdin open for the IPC channel. stdout and stderr should be the
  // same as the parent's.
//  mergedOptions.customFds = [ -1, 1, 2 ];

  // stdin is the IPC channel.
  mergedOptions.stdinStream = cpu.createPipe(true);

  var worker = spawn(process.execPath, args, mergedOptions)

  cpu.setupChannel(worker, mergedOptions.stdinStream);

  this.workers[id] = worker
  this.master.workers[id] = worker

  worker.on('message', function(message, handle) {
    self.master.onWorkerMessage(worker, self, message)
  })

  worker.on('exit', function() {
    delete self.workers[id]
    delete self.master.workers[id]
    self.master.emit('death', worker, self)
  })

  worker.send({ message: 'fork' });

  worker.started = true
  this.master.emit('worker:started', worker, self)
  this.initialized = true

  return worker
}

Task.prototype.kill = function () {
  var self = this
  this.master.eachWorker(this.name, function(worker) {
    console.log('Task '+ self.name + ': kill worker ' + worker.pid)
    worker.kill()
  })
}
