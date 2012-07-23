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
  , util = require('util')
  , EventEmitter = require('events').EventEmitter

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
    if (!this.filename) this.filename = filename
    if (!this.args) this.args = args
    if (!this.options) this.options = options
  } else {
    if ('object' == typeof filename) forkOptions = filename
    filename = forkOptions.filename || this.filename
    args = forkOptions.args || this.args
    options = forkOptions.options || this.options
  }

  for (var x in process.env) {
    envCopy[x] = process.env[x]
  }

  // Node's `NODE_WORKER_ID` has too much behavior attached to it.
  envCopy['MIXTURE_WORKER_ID'] = id

  for (var x in this.options) {
    mergedOptions[x] = this.options[x]
  }

  for (var x in forkOptions) {
    mergedOptions[x] = forkOptions[x]
  }

  mergedOptions.env = envCopy

  var worker = fork(filename, args, mergedOptions)
  this.workers.push(worker)
  this.master.workers.push(worker)

  worker.on('message', function(message) {
    self.master.onWorkerMessage(worker, self, message)
  })

  worker.on('exit', function() {
    self.master.emit('death', worker, self)
    delete self.workers[id]
    delete self.master.workers[id]
  })

  this.master.emit('online', worker, self)
  this.initialized = true

  return worker
}
