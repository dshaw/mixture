var mixture = require('..')
  , Mix = mixture.mix
  , mix = Mix()
  , Task = mixture.Task
  , tap = require('tap')
  , test = tap.test

console.log(mix, Task, mix instanceof Mix)

test('mixture exports', function (t) {
  t.ok(Mix, 'exports Mix')
  t.ok(Task, 'exports Task')

  var version = require('../package.json').version
  t.equal(mixture.version, version, 'exports version')

  t.isa(mix, Mix, 'mix is an instance of Mix')
  t.ok(mix.tasks, 'initialized tasks hash')
  t.ok(mix.workers, 'initialized workers list')

  var master = new Mix()
  var task = master.task('name')
  t.isa(master.task, 'function', 'task method defined')
  t.isa(task, Task, 'task returns a task')
  t.ok(task.master, 'task has a reference to the master')
  t.isa(task.master, Mix, 'task master is an instance of Master')

  master.on('death', function() {
    console.log('I died', arguments)
  })

  var worker1 = task.fork('./test/fixtures/simple')
  t.ok(worker1, 'worker is defined')
  t.equal(task.workers.length, 1, 'task now has one worker')

  // fork a new instance of the task
  var worker2 = task.fork()
  t.equal(task.workers.length, 2, 'task now has two workers')

  t.end()
})
