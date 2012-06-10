var net = require('net')
  , tap = require('tap')
  , test = tap.test
  , mixture = require('..')
  , Mix = mixture.mix
  , mix = Mix()
  , Task = mixture.Task

console.log(mix, Task, mix instanceof Mix)

test('mixture exports', function (t) {
  t.ok(Mix, 'exports Mix')
  t.ok(Task, 'exports Task')

  t.isa(mix, Mix, 'mix is an instance of Mix')
  t.ok(mix.tasks, 'initialized tasks hash')
  t.ok(mix.workers, 'initialized workers list')
  t.equal(mix.name, 'mix', 'default mix name')
  t.equal(mixture.mix('dshaw').name, 'dshaw', 'assigned mix name')

  var master = new Mix()
  var task = master.task('name')
  t.isa(master.task, 'function', 'task method defined')
  t.isa(task, Task, 'task returns a task')
  t.ok(task.master, 'task has a reference to the master')
  t.isa(task.master, Mix, 'task master is an instance of Master')

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

  var master = mixture.mix()
  var task = master.task('name')
  var worker = task.fork('./test/fixtures/simple')

  master.on('message', function (m) {
    t.ok(m, 'message ok')
    t.equal('message', m, 'master received message from child')
  })

  var server = net.createServer();
  server.listen(1337, function() {
    worker.send('message', server._handle);
  });
  worker.send('message')

  t.end()
})
