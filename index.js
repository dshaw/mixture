/*!
 * mixture
 * Copyright(c) 2011-2012 Daniel D. Shaw <dshaw@dshaw.com>
 * MIT Licensed
 */

/**
 * Mixture
 */

var mixture = exports = module.exports = require('./mixture.js')

/**
 * Version
 */

mixture.version = require('./package.json').version

/**
 * Worker mixin
 */

mixture.worker = require('./lib/worker')
