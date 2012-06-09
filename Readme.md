# Mixture

  Heterogeneous cluster task manager designed to manage and coordinate tasks amongst multiple, diverse child processes.

## Status

![Travis Build Status](https://secure.travis-ci.org/dshaw/mixture.png)

## Install

    npm install mixture

## Usage - Cluster More!

    var mix = require('mixture').mix('epic')

    var ioPort = 8880
      , nodeId = 0

    // announce data server
    mix.task('announce').fork('data.js');

    // socket.io instances
    var socketio = mix.task('socket.io', { filename: 'app.js' })

    for (var i = 0; i < count; i++) {
      ioPort++;
      nodeId++;

      var worker = socketio.fork({ args: [ioPort, nodeId] })
    }

## Sample App

* [Stock Quote Stream](https://github.com/dshaw/mixture/tree/master/examples/stock-quotes)

## License

(The MIT License)

Copyright (c) 2012 Daniel D. Shaw, http://dshaw.com

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.