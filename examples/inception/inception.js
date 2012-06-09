var charm = require('charm') 
  , mixture = require('../../')
  , mix = mixture.mix('inception')

// mix master emitters
mix.on('online', function (proc) {
  console.log(proc.name + ' mix online')
})
mix.emit('online', mix)

// fork a mix master instance
//var inception = mix.task('inception')

console.log(mix.name + ' hello')