var mixture = require('..')
  , mix = mixture.mix()
  , Master = mixture.Master
  , Task = mixture.Task
  , tap = require('tap')
  , test = tap.test

//console.log(mix, Master, Task, mix instanceof Master)

test('task test', function (t) {
  t.ok(Task, 'exports Task')

  var master = new Master()
  var task = master.task('name')
  t.isa(master.task, 'function', 'task method defined')
  t.isa(task, Task, 'task returns a task')
  t.ok(task.master, 'task has a reference to the master')
  t.isa(task.master, Master, 'task master is an instance of Master')

  var worker1 = task.fork('./test/fixtures/simple')
  t.ok(worker1, 'worker is defined')
  t.equal(task.workers.length, 1, 'task now has 1 worker')

  for (var i = 0; i < 4; i++) task.fork()
  t.equal(task.workers.length, 5, 'task now has 5 workers')

  task.kill()
  t.equal(task.workers.length, 5, 'task now has 5 workers')

  task.fork()
  t.equal(task.workers.length, 1, 'task restored. has 1 worker')

  t.end()
})
