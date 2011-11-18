var mixture = require('..')
  , mix = mixture.mix()
  , Master = mixture.Master
  , Task = mixture.Task
  , tap = require('tap')
  , test = tap.test

//console.log(mix, Master, Task, mix instanceof Master)

test('mixture exports', function (t) {
  t.ok(Master, 'exports Master')
  t.ok(Task, 'exports Task')

  var version = require('../package.json').version
  t.equal(mixture.version, version, 'exports version')

  t.isa(mix, Master, 'mix is an instance of Master')
  t.ok(mix.tasks, 'initialized tasks hash')
  t.ok(mix.workers, 'initialized workers list')
  t.equal(mix.name, 'mixmaster', 'default mix name')
  t.equal(mixture.mix('dshaw').name, 'dshaw', 'assigned mix name')

  var master = new Master()
  var task = master.task('name')
  t.isa(master.task, 'function', 'task method defined')
  t.isa(task, Task, 'task returns a task')
  t.ok(task.master, 'task has a reference to the master')
  t.isa(task.master, Master, 'task master is an instance of Master')

  master.on('death', function(worker, task) {
    console.log('I died', arguments)
    t.equal(arguments.length, 2, 'death event has 2 arguments')
//    t.ok(worker, 'worker is defined')
//    t.ok(worker.pid, 'worker.pid is defined')
//    t.ok(task, 'task is defined')
  })

  var worker = task.fork('./test/fixtures/simple')
  worker.kill()

  t.end()
})


test('master child communications', function (t) {
  t.plan(1)

  var master = new Master()
  var task = master.task('name')
  var worker = task.fork('./test/fixtures/simple')

  master.on('message', function (m) {
    t.ok(m, 'message ok')
    t.equal('message', m, 'master received message from child')
  })

  var server = require('net').createServer();
  server.listen(1337, function() {
    worker.send('message', server._handle);
  });
  worker.send('message')

  t.end()
})
