var mix = require('../../').mix('balanced')
  , bouncy = require('bouncy')

var count = process.argv[2] || 4
  , portmap = []
  , port = 8880
  , nodeId = 0

// announce data server
mix.task('announce').fork('data.js')

// socket.io instances
var socketio = mix.task('socket.io', { filename: 'app.js' })

for (var i = 0; i < count; i++) {
  port++;
  nodeId++;
  portmap.push(port)

  var worker = socketio.fork({ args: [port, nodeId] })
}

// load balance the socket.io instances
bouncy(function (req, bounce) {
  bounce(portmap[Math.random()*portmap.length|0])
}).listen(80)

console.log('bouncy listening on :%d', 80)