/*!
 * mixture
 * Copyright(c) 2011 Daniel D. Shaw <dshaw@dshaw.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var assert = require('assert')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter
  , Task = require('./task')
  , noop = function () {}
  , debug = noop

/**
 * Exports
 */

exports.mix = Mix
exports.Task = Task

/**
 * Mix Master
 */

function Mix (name) {
  if (!(this instanceof Mix)) return new Mix(name)

  this.name = name
  this.ids = 0
  this.tasks = {}
  this.workers = []

  this.init()
}

/**
 * Inherit EventEmitter
 */

util.inherits(Mix, EventEmitter)

/**
 * Initialize Mix
 */

Mix.prototype.init = function () {
  var self = this

  this.on('exit', function(e) {
    self.eachWorker(function(worker) {
      debug('kill worker ' + worker.pid)
      worker.kill()
    })
  })

  this.on('death', function(worker, task) {
    debug('Task ' + task.name + ' worker ' + worker.pid + ' died')
  })

  process.on('uncaughtException', function(e) {
    self.eachWorker(function(worker) {
      debug('kill worker ' + worker.pid)
      worker.kill()
    })

    console.error('Exception in mix master process: ' + e.message + '\n' + e.stack)
    process.exit(1)
  })
}

/**
 * Enable debugging.
 * - pass falsey to disable.
 *
 * @param enable
 */

Mix.prototype.debug = function (enable) {
  debug = (typeof enable === 'undefined' || enable) ? console.log : noop;
}

/**
 * Task mix
 *
 * @param name
 * @return Task
 * @api public
 */

Mix.prototype.task = function (name, options) {
  if (!this.tasks[name]) {
    options || (options = {})
    options.master = this
    options.name = this.name
    this.tasks[name] = new Task(options)
  }
  return this.tasks[name]
}

/**
 * Send message to all
 *
 * @param task (optional)
 * @param cb
 */

Mix.prototype.eachWorker = function (task, cb) {
  var workers = null

  if (typeof cb === 'undefined') {
    cb = task
    workers = this.workers
  } else {
    workers = this.tasks[task].workers
  }

  for (var id in workers) {
    if (workers[id]) {
      cb(workers[id])
    }
  }
}

/**
 * Handle Worker Message
 *
 * @param task
 * @param worker
 * @param message
 */

Mix.prototype.onWorkerMessage = function (task, worker, message) {
  debug(task.name, worker.id, message)
}
