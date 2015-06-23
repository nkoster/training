#!/usr/bin/env node

var host = '127.0.0.1';
if (process.argv.indexOf("-h") != -1) {
  host = process.argv[process.argv.indexOf("-h") + 1];
}

var port_telnet = 6969;
if (process.argv.indexOf("-t") != -1) {
  port_telnet = process.argv[process.argv.indexOf("-t") + 1]; 
}

var port_web = 8080;
if (process.argv.indexOf("-w") != -1) {
  port_web = process.argv[process.argv.indexOf("-w") + 1]; 
}

var net = require('net');

var WebSocketServer = require('./').Server
  , http = require('http')
  , express = require('express')
  , app = express.createServer();

app.use(express.static(__dirname + '/public'));
app.listen(port_web);

var log = false;

var wss = new WebSocketServer({server: app});

wss.on('connection', function(ws) {
  if (log) console.log('DATA changed and sent');
  ws.on('close', function() {
    if (log) console.log('Client Closed');
  });
});

net.createServer(function(sock) {
  if (log) console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
  sock.on('data', function(data) {
    var dataToSend = '' + data;
    dataToSend = dataToSend.replace(/(\r\n|\n|\r)/, '');
    var monData = dataToSend.split(' ');
    var ipAddress = monData[2];
    var timeStamp = '' + monData[0].substring(12);
    var request = monData[4] + monData[7];
    var elapsed = parseFloat(monData[3]);
    var elapsedString = elapsed.toFixed(3);
    dataToSend = timeStamp + ' ' + elapsedString + ' ' + ipAddress + ' ' + request;
    wss.clients.forEach(function (conn) {
      conn.send(dataToSend, function() { /* no error handling */ });
    })
    if (log) console.log('DATA ' + sock.remoteAddress + ': ' + data);
    if (log) sock.write('You said "' + data + '"' + "\n");
  });
  sock.on('close', function(data) {
    if (log) console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
  });
}).listen(port_telnet, host);

console.log('Server listening on ' + host +':'+ port_telnet);

