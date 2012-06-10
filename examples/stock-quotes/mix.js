var mix = require('../../').mix()

var count = process.argv[2] || 5 //  || maxes out locally at ~82
  , ioPort = 8880
  , nodeId = 0

// announce data server
mix.task('announce').fork('data.js')

// socket.io instances
var socketio = mix.task('socket.io', { filename: 'app.js' })

for (var i = 0; i < count; i++) {
  ioPort++;
  nodeId++;

  var worker = socketio.fork({ args: [ioPort, nodeId] })
}

console.log('Kill off one of the managed workers. Just for fun.')
var lastSio = socketio.workers.pop()
lastSio.kill()