var express = require('express')
  , sio = require('socket.io')
  , RedisStore = sio.RedisStore

var port = process.argv[2] || 8880
  , id = process.argv[3] || 0
  , delay = process.argv[4] || 800
  , app = app = express.createServer(express.static(__dirname + '/.'))
  , io = sio.listen(app)

io.configure(function () {
io.set('store', new RedisStore({ nodeId: function () { return id } }))
})

io.sockets.on('connection', function (socket) {
  socket.emit('nodeId', id)

  socket.on('purchase', function (data, fn) {
    data.timestamp = Date.now()

    setTimeout(function () { // without a delay the transition between purchase and confirm is imperceptible
      socket.emit('confirm', data)
      socket.broadcast.emit('activity', data)
    }, delay)
  });

  socket.on('restart', function (data) {
    io.sockets.in('').emit('restart')
  })
})

app.listen(port)

app.on('listening', function () {
  console.log('listening on :', app.address())
})
