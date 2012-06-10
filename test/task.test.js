var mixture = require('..')
  , Mix = mixture.mix
  , Task = require('../lib/task')
  , tap = require('tap')
  , test = tap.test

test('task test', function (t) {
  t.ok(Task, 'exports Task')

  var mix = mixture.mix()
    , task = mix.task('name')

  t.isa(mix.task, 'function', 'task method defined')
  t.isa(task, Task, 'task returns a task')
  t.ok(task.master, 'task has a reference to the master')
  t.isa(task.master, Mix, 'task master is an instance of Mix')

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
