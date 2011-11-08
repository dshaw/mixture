var mix = require('../../').mix()

var count = process.argv[2] || 4 //  || maxes out locally at ~82
  , ioPort = 8880
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
