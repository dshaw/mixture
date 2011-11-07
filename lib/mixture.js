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

exports = module.exports = new Master();

/**
 * Mix Master
 */

function Master () {
  this.ids = 0
  this.tasks = {}
  this.workers = []
}

/**
 * Inherit EventEmitter
 */

util.inherit(Master, EventEmitter)

/**
 * Task mix
 *
 * @param name
 * @return Task
 * @api public
 */

Master.prototype.mix = function (name) {
  if (!this.tasks[name]) {
    this.tasks[name] = new Task({ name: name })
  }
  return this.tasks[name]
}

var debug;
if (process.env.NODE_DEBUG && /cluster/.test(process.env.NODE_DEBUG)) {
  debug = function(x) {
    var prefix = process.pid + ',' + (process.env.NODE_WORKER_ID ? 'Worker' : 'Master');
    console.error(prefix, x);
  };
} else {
  debug = function() { };
}
