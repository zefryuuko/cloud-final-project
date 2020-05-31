const express = require('express');
const { ExpressPeerServer } = require('peer');

const app = express();

app.get('/', (req, res, next) => res.send('OK').status(200));

const server = app.listen(9000);

const peerServer = ExpressPeerServer(server, {
  path: '/',
  proxied: true
});

app.use('/peer', peerServer);