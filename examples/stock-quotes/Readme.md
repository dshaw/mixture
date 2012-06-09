# Stock Quote Stream powered by socket.io-announce, managed by mixture

### Setup

Runs on Node.js v0.5.9+.

    npm install

Note: If you're running Node v0.7+ you might have to run:

    npm install express --force

### Managed mixed cluster

* `node . [n]` - manage all processes, creating a data stream and n socket.io apps. defaults to 4.
