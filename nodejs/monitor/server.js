var net = require('net');

var WebSocketServer = require('./').Server
  , http = require('http')
  , express = require('express')
  , app = express.createServer();

app.use(express.static(__dirname + '/public'));
app.listen(8080);

var dataToSend = "";

var log = false;

var wss = new WebSocketServer({server: app});
wss.on('connection', function(ws) {
  var id = setInterval(function() {
    if (dataToSend.length != "") {
      ws.send(dataToSend, function() { /* ignore errors */ });
      if (log) console.log('DATA changed and sent');
      dataToSend = "";
    }
  }, 100);
  ws.on('close', function() {
    if (log) console.log('Client Closed');
    clearInterval(id);
  });
});

var HOST = '127.0.0.1';
var PORT = 6969;

net.createServer(function(sock) {
    
    if (log) console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
    sock.on('data', function(data) {
        var dataString = "" + data;
        dataToSend = dataString.replace(/(\r\n|\n|\r)/, '');
        if (log) console.log('DATA ' + sock.remoteAddress + ': ' + dataToSend);
        sock.write('You said "' + dataToSend + '"' + "\n");
    });
    
    sock.on('close', function(data) {
        if (log) console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });
    
}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);

