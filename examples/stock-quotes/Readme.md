# Stock Quote Stream powered by socket.io-announce, managed by mixture

### Setup

Runs on Node.js v0.5.9+.

    npm install

Note: If you're running Node v0.7+ you might have to run:

    npm install express --force

### Managed mixed cluster

* `node mix [n]` - manage all processes, creating a data stream and n socket.io apps. defaults to 4. try 80.

### Fun with Mix Masters

* `node mix-death [n]` - force the death of one of the socket.io processes
* `node mix-balanced [n]` - add load balancing with [bouncy](https://github.com/substack/bouncy) to managed processes with 3 lines of code.
* `sudo node mix-lb80 [n]` - run the load balancer on port 80.
