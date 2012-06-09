var mixture = require('../../')
  , Master = mixture.Master
  , isTop = !process.env['MIXTURE_WORKER_ID']
  , levels = {
        name: 'reality'
      , reality: { name: 'city' }
      , city: { name: 'hotel' }
      , hotel: { name: 'fortress' }
    }
  , level = levels.name
  , mix

console.log('MIXTURE_WORKER_ID:', process.env['MIXTURE_WORKER_ID'], 'top:', isTop)

dream(level)

process.emit('fork', 'hello')

process.on('fork', function (worker, task, master) {
  console.log('fork', arguments)
  process.exit()
  var level = levels(master || master.name)
  console.log(level + ': ' +  + ' mix online', arguments.length)
  //mix.emit('online', mix)
  if (level) dream(level) //mix.task('mix').fork()
})

function dream (level) {
  mix = mixture.mix(level);

  // mix master emitters
  mix.on('online', function (proc, task) {
    var isMaster = proc instanceof Master
      , name = proc.name || task.name
    console.log(mix.name + ': ' + name + ' mix online', arguments.length)
  })

  var worker = mix.task('mix').fork()

  if (isTop) mix.emit('online', mix)
  console.log(mix.name + ' hello')
}
