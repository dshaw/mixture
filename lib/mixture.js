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

/**
 * Exports
 */

exports.mix = function () { return new Master() }
exports.Master = Master
exports.Task = Task

/**
 * Mix Master
 */

function Master () {
  this.ids = 0
  this.tasks = {}
  this.workers = []

  this.init()
}

/**
 * Inherit EventEmitter
 */

util.inherits(Master, EventEmitter)

/**
 * Initialize Master
 */

Master.prototype.init = function () {
  var self = this

  this.on('exit', function(e) {
    self.eachWorker(function(worker) {
      console.log('kill worker ' + worker.pid)
      worker.kill()
    });
  })

  this.on('death', function(task, worker) {
    console.log('kill worker ' + worker.pid + 'on task ' + task.name)
  })

  process.on('uncaughtException', function(e) {
    // Quickly try to kill all the workers.
    // TODO: be session leader - will cause auto SIGHUP to the children.
    self.eachWorker(function(worker) {
      console.log('kill worker ' + worker.pid);
      worker.kill();
    });

    console.error('Exception in cluster master process: ' + e.message + '\n' + e.stack);
    console.error("Please report this bug.");
    process.exit(1);
  });
}

/**
 * Task mix
 *
 * @param name
 * @return Task
 * @api public
 */

Master.prototype.task = function (name, options) {
  if (!this.tasks[name]) {
    options || (options = {})
    options.master = this
    options.name = name
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

Master.prototype.eachWorker = function (task, cb) {
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

/**
 * Handle Worker Message
 *
 * @param task
 * @param worker
 * @param message
 */

Master.prototype.onWorkerMessage = function (task, worker, message) {
  console.log(task.name, worker.id, message)
}