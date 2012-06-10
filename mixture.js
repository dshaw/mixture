/*!
 * mixture
 * Copyright(c) 2011-2012 Daniel D. Shaw <dshaw@dshaw.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var util = require('util')
  , EventEmitter = require('events').EventEmitter
  , Task = require('./lib/task')
  , Worker = require('./lib/worker')
  , debug = function () {}

/**
 * Exports.
 */

exports.mix = Mix
exports.Task = Task
exports.worker = Worker

/**
 * Mix
 *
 * @param options
 * @return {Mix}
 * @constructor
 */

function Mix (options) {
  if (!(this instanceof Mix)) return new Mix(options)

  options || (options = {})

  this.name = (typeof options === 'string') ? options : options.name || 'mix'
  this.ids = 0
  this.tasks = {}
  this.workers = []

  if (options.debug) debug = console.log

  this.init()
}

util.inherits(Mix, EventEmitter)

/**
 * Initialize Mix
 */

Mix.prototype.init = function () {
  var self = this

  this.on('exit', function(e) {
    self.eachWorker(function(worker) {
      console.log('kill worker ' + worker.pid)
      worker.kill()
    })
  })

  this.on('worker:started', function(worker, task) {
    if (!worker || !task) return console.log('incomplete online notification')
    debug(self.name + ': Task ', task.name, ' worker ', worker.pid, 'worker:started')
  })

  this.on('death', function(worker, task) {
    debug(self.name + ': Task ', task.name, ' worker ', worker.pid, 'died')
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

Mix.prototype.onWorkerMessage = function (worker, task, message) {
  task || (task = {})
  worker || (worker = {})
  console.log(this.name + ': Task ', task.name, ' worker ', worker.pid, message)
}
