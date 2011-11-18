/*!
 * mixture
 * Copyright(c) 2011 Daniel D. Shaw <dshaw@dshaw.com>
 * MIT Licensed
 */

/**
 * Exports.
 */

var send     = exports.send     = process.send || noop
var taskName = exports.taskName = process.env.MIXTURE_TASK_NAME
var workerId = exports.workerId = parseInt(process.env.MIXTURE_WORKER_ID)

/**
 * Noop.
 */

function noop () { console.log('worker noop', arguments) }

/**
 * Master Message handler.
 */

function onMasterMessage () { console.log('worker message', arguments) }

/**
 * Receive messages from Mix Master.
 */

process.on('message', onMasterMessage)

/**
 * Notify Mix Master.
 */

send({ 'worker:online' : workerId, task: taskName, pid: process.pid })