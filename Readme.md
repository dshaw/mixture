# Mixture - Heterogeneous cluster task manager

## Install

```
npm install mixture
```

## Cluster more.

```javascript
var mix = require('mixture').mix()

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
```

## API

### Mix Master

require mixture, create a mix
```javascript
var mix = require('mixture').mix()
```
optionally, name your mix (for network identification)
```javascript
var mixture = require('mixture')
  , mix = mixture.mix('jupiter')
```

### Tasks
define a simple task with straightforward [fork](http://nodejs.org/docs/v0.6.0/api/child_processes.html#child_process.fork) semantics.
```javascript
mix.task('express').fork('server.js')
console.log(mix.name, mix.workers.length)
```

task returns a reference to the task that you can refer to at any point
task fork accepts an options argument so you can pass in args or options for a spefic forked worker instance.
```javascript
// spin up a second instance
var task = mix.task('express')
task.fork({ args: [9001]})
console.log(task.name, task.workers.length)
```

when you don't need a task worker anymore, just [kill](http://nodejs.org/docs/v0.6.0/api/child_processes.html#child.kill) it
```javascript
var worker = task.workers.pop()
worker.kill()
```

## Sample Apps

* [Stock Quote Stream](https://github.com/dshaw/mixture/tree/master/examples/stock-quotes)

## License

* MIT
