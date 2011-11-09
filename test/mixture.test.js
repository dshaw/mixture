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
