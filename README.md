# code-collab
## Features

Collab-ide enables real-time bidirectional event-based communication. It consists of:

- a Node.js server (this repository)
- a [Javascript client library](https://github.com/socketio/socket.io-client) for the browser (or a Node.js client)


Its main features are:

#### Reliability

Connections are established even in the presence of:
  - proxies and load balancers.
  - personal firewall and antivirus software.

For this purpose, it relies on [Engine.IO](https://github.com/socketio/engine.io), which first establishes a long-polling connection, then tries to upgrade to better transports that are "tested" on the side, like WebSocket. Please see the [Goals](https://github.com/socketio/engine.io#goals) section for more information.

#### Auto-reconnection support

Unless instructed otherwise a disconnected client will try to reconnect forever, until the server is available again. Please see the available reconnection options [here](https://socket.io/docs/v3/client-api/#new-Manager-url-options).

#### Simple and convenient API

Sample code:

```js
io.on('connection', socket => {
  socket.emit('request', /* … */); // emit an event to the socket
  io.emit('broadcast', /* … */); // emit an event to all connected sockets
  socket.on('reply', () => { /* … */ }); // listen to the event
});
```

#### Multiplexing support

In order to create separation of concerns within your application (for example per module, or based on permissions), Socket.IO allows you to create several `Namespaces`, which will act as separate communication channels but will share the same underlying connection.

#### Room support

Within each `Namespace`, you can define arbitrary channels, called `Rooms`, that sockets can join and leave. You can then broadcast to any given room, reaching every socket that has joined it.

This is a useful feature to send notifications to a group of users, or to a given user connected on several devices for example.


**Note:** Socket.IO is not a WebSocket implementation. Although Socket.IO indeed uses WebSocket as a transport when possible, it adds some metadata to each packet: the packet type, the namespace and the ack id when a message acknowledgement is needed. That is why a WebSocket client will not be able to successfully connect to a Socket.IO server, and a Socket.IO client will not be able to connect to a WebSocket server (like `ws://echo.websocket.org`) either. Please see the protocol specification [here](https://github.com/socketio/socket.io-protocol).

## Installation

```bash
// with npm
npm install

// with yarn
yarn add socket.io
```

## How to use

The following example attaches socket.io to a plain Node.JS
HTTP server listening on port `3000`.

```js
const server = require('http').createServer();
const io = require('socket.io')(server);
io.on('connection', client => {
  client.on('event', data => { /* … */ });
  client.on('disconnect', () => { /* … */ });
});
server.listen(3000);
```

### Standalone

```js
const io = require('socket.io')();
io.on('connection', client => { ... });
io.listen(3000);
```

### In conjunction with Express

Starting with **3.0**, express applications have become request handler
functions that you pass to `http` or `http` `Server` instances. You need
to pass the `Server` to `socket.io`, and not the express application
function. Also make sure to call `.listen` on the `server`, not the `app`.

```js
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
io.on('connection', () => { /* … */ });
server.listen(3000);
```

## Documentation

Please see the documentation [here](https://socket.io/docs/).

## Testing

```
npm test
```
This runs the `gulp` task `test`. By default the test will be run with the source code in `lib` directory.

Set the environmental variable `TEST_VERSION` to `compat` to test the transpiled es5-compat version of the code.

The `gulp` task `test` will always transpile the source code into es5 and export to `dist` first before running the test.

Run using -- nodemon
