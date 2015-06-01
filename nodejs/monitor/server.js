var net = require('net');

var WebSocketServer = require('./').Server
  , http = require('http')
  , express = require('express')
  , app = express.createServer();

app.use(express.static(__dirname + '/public'));
app.listen(8080);

var log = false;

var wss = new WebSocketServer({server: app});

wss.on('connection', function(ws) {
  if (log) console.log('DATA changed and sent');
  ws.on('close', function() {
    if (log) console.log('Client Closed');
  });
});

var HOST = '127.0.0.1';
var PORT = 6969;

net.createServer(function(sock) {
  if (log) console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
  sock.on('data', function(data) {
    var dataToSend = '' + data;
    dataToSend = dataToSend.replace(/(\r\n|\n|\r)/, '');
    wss.clients.forEach(function (conn) {
      conn.send(dataToSend, function() { /* no error handling */ });
    })
    if (log) console.log('DATA ' + sock.remoteAddress + ': ' + data);
    if (log) sock.write('You said "' + data + '"' + "\n");
  });
  sock.on('close', function(data) {
    if (log) console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
  });
}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);

