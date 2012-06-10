/*!
 * mixture
 * Copyright(c) 2011-2012 Daniel D. Shaw <dshaw@dshaw.com>
 * MIT Licensed
 */

/**
 * Child Process Utilities - largely adapted from internal Node.js child_process.js functions.
 */

/**
 * Module dependencies.
 */

var net = require('net')

/**
 * Exports
 */

exports.createPipe = createPipe
exports.createSocket = createSocket
exports.mergeOptions = mergeOptions
exports.setupChannel = setupChannel


/**
 * Create Pipe
 * - constructors for lazy loading
 *
 * @param ipc
 */

function createPipe(ipc) {
  var Pipe;

  // Lazy load
  if (!Pipe) {
    Pipe = new process.binding('pipe_wrap').Pipe;
  }

  return new Pipe(ipc);
}

/**
 * Create Socket
 *
 * @param pipe
 * @param readable
 */

function createSocket(pipe, readable) {
  var s = new net.Socket({ handle: pipe });

  if (readable) {
    s.writable = false;
    s.readable = true;
    s.resume();
  } else {
    s.writable = true;
    s.readable = false;
  }

  return s;
}

/**
 * Merge options
 *
 * @param target
 * @param overrides
 */

function mergeOptions(target, overrides) {
  if (overrides) {
    var keys = Object.keys(overrides);
    for (var i = 0, len = keys.length; i < len; i++) {
      var k = keys[i];
      if (overrides[k] !== undefined) {
        target[k] = overrides[k];
      }
    }
  }
  return target;
}

/**
 * noop
 */

function nop() { }

/**
 * Setup Channel
 *
 * @param target
 * @param channel
 */

function setupChannel(target, channel) {
  var isWindows = process.platform === 'win32';
  target._channel = channel;

  var jsonBuffer = '';

  if (isWindows) {
    var setSimultaneousAccepts = function(handle) {
      var simultaneousAccepts = (process.env.NODE_MANY_ACCEPTS
        && process.env.NODE_MANY_ACCEPTS != '0') ? true : false;

      if (handle._simultaneousAccepts != simultaneousAccepts) {
        handle.setSimultaneousAccepts(simultaneousAccepts);
        handle._simultaneousAccepts = simultaneousAccepts;
      }
    }
  }

  channel.onread = function(pool, offset, length, recvHandle) {
    if (recvHandle && setSimultaneousAccepts) {
      // Update simultaneous accepts on Windows
      setSimultaneousAccepts(recvHandle);
    }

    if (pool) {
      jsonBuffer += pool.toString('ascii', offset, offset + length);

      var i, start = 0;
      while ((i = jsonBuffer.indexOf('\n', start)) >= 0) {
        var json = jsonBuffer.slice(start, i);
        var message = JSON.parse(json);

        target.emit('message', message, recvHandle);
        start = i+1;
      }
      jsonBuffer = jsonBuffer.slice(start);

    } else {
      channel.close();
      target._channel = null;
    }
  };

//  console.log('setting up target send', target)
  target.send = function(message, sendHandle) {
    if (!target._channel) throw new Error("channel closed");

    // For overflow protection don't write if channel queue is too deep.
    if (channel.writeQueueSize > 1024 * 1024) {
      return false;
    }

    var buffer = Buffer(JSON.stringify(message) + '\n');

    if (sendHandle && setSimultaneousAccepts) {
      // Update simultaneous accepts on Windows
      setSimultaneousAccepts(sendHandle);
    }

    var writeReq = channel.write(buffer, 0, buffer.length, sendHandle);

    if (!writeReq) {
      throw new Error(errno + " cannot write to IPC channel.");
    }

    writeReq.oncomplete = nop;

    return true;
  };

  channel.readStart();
}
