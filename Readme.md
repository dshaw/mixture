# Mixture - Heterogeneous cluster task manager

## Install

    npm install mixture

## Cluster more.

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

## Sample Apps

* [Stock Quote Stream](https://github.com/dshaw/mixture/tree/master/examples/stock-quotes)

## License

* MIT
