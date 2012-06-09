var fork = require('child_process').fork;

var count = process.argv[2] || 4 // maxes out locally at ~82
  , nodes = {
        announce: []
      , io: []
    }
  , ioPort = 8881;

process.on('message', function (m) {
  console.log('process message', m)
})

// announce data server
var announce = fork('data.js')
nodes.announce.push(announce)
console.log('announce', 'pid:', nodes.announce[0].pid)
announce.send({ m: 1 })

announce.on('message', function (m) {
  console.log('child message', m)
})

process.send('hi')

// socket.io instances
for (var i=0; i<count; i++) {
  var port = ioPort+i
    , nodeId = i+1;
  nodes.io[i] = fork('app.js', [port, nodeId]);
  console.log(
      'io'
    , 'nodeId:', nodeId
    , 'port:', port
    , 'pid:', nodes.io[i].pid
  );
}
