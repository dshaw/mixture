/**
 * Announce doesn't bind a port.
 * Announce also doesn't have to worry about where it's sending the data.
 * It simply broadcasts to the Redis pub/sub backbone.
 */

var announce = require('socket.io-announce').createClient()
  , worker = require('../../').worker

/* fake data stream */
var symbols = 'THOO GOOF EXIT BOP SDD ALPP RIGM OPPL HPBG'.split(' ')

function dataStream () {
  var n = Math.round(Math.random()*5)
    , data = {
      id: (Math.abs(Math.random() * Math.random() * Date.now() | 0))
    , symbol: symbols[n]
    , price: (Math.random()*1000).toFixed(2)
    , n: n
  }
  announce.emit('quote', data)
}

dataStream()
setInterval(dataStream, 800)
