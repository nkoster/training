var monitorHeight = 0;

function getHeight() {
  if (typeof(window.innerWidth) == 'number') {
    /* normal browsers */
    return window.innerHeight;
  } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
    /* IE6+ */
    return document.documentElement.clientHeight;
  } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
    /* IE 4 compatible */
    return document.body.clientHeight;
  }
}

/* 13px font + 4px padding/margin */
var lineHeight = 17;

var monitorHeight = getHeight();

var numberOfLines = Math.floor(monitorHeight / lineHeight) - 1;
if (numberOfLines < 3) numberOfLines = 3;

/* Red background after 30 seconds of
   inactivity (no data received) */
var timeoutThreshold = 30;
var timeout = 0;

var monitor = [];
var counter = 0;

var div = '';

var screenChanged = false;

function updateMonitor(dataReceived) {
  monitor[counter] = dataReceived;
  div = '';
  for (i = 0; i < monitor.length; i++) {
    var mon_data = monitor[i].split(' ');
    var elapsed = parseFloat(mon_data[1]);
    var              color = '#2f5';    /* green */
    if (elapsed > 1) color = '#fa3';    /* orange */
    if (elapsed > 2) color = '#f32';    /* red */
    /* 3 decimals for elapse time */
    var elapsedString = elapsed.toFixed(3);
    /* Column 'elapsed' is exact 8 characters */
    elapsedString = new Array(7 - elapsedString.length).join(' ') + elapsedString;
    var timeStamp = mon_data[0];
    var ipAddress = mon_data[2];
    ipAddress = new Array(17 - ipAddress.length).join(' ') + ipAddress;
    var request = mon_data[3];
    var weight = 'normal';
    var background = 'none';
    /* The active line */
    if (i == counter) {
       weight = "bold";
       background = color;
       color = "black";
    }
    div += '<div class="monitor" style="color:' + color + ';font-weight:' + 
           weight + ';background:' + background + '">' + ' ' +
           timeStamp + '   ' + elapsedString + ' ' + ipAddress + '   ' + request + "</div>\n";
  }
  /* The screen has resized, let's adjust the array and the div */
  if (screenChanged) {
    screenChanged = false;
    monitor.splice(numberOfLines);
    div.split("\n").slice(numberOfLines).join("\n");
    if (counter > numberOfLines) counter = numberOfLines;
  }
  document.getElementById('monitor').innerHTML = '' + div;
  /* 'terminal rotation' within numberOfLines */
  if (counter < (numberOfLines - 1)) {
    counter += 1;
  } else {
    counter = 0;
  }
  timeout = 0;
}

/* Open the WebSocket connection. */
var host = window.document.location.host.replace(/:.*/, '');
var ws = new WebSocket('ws://' + host + ':' + location.port);
ws.onmessage = function (event) {
  updateMonitor(event.data);
};

window.onresize = function() {
  monitorHeight = getHeight();
  var newNumberOfLines = Math.floor(monitorHeight / lineHeight) - 1;
  if (newNumberOfLines < 3) newNumberOfLines = 3;
  numberOfLines = newNumberOfLines;
  screenChanged = true;
}

/* Preparation for filter menu */
function handleKeyDown(e) {
  var ctrlPressed = 0;
  var altPressed = 0;
  var shiftPressed = 0;
  var evt = (e == null ? event:e);
  shiftPressed = evt.shiftKey;
  altPressed = evt.altKey;
  ctrlPressed = evt.ctrlKey;
  self.status = ""
    + "shiftKey=" + shiftPressed 
    + ", altKey=" + altPressed 
    + ", ctrlKey=" + ctrlPressed;
  /* Ctrl+Alt+F */
  if ((altPressed || ctrlPressed) && evt.keyCode == 70) alert('Filter menu not available');
  return true;
}

document.onkeydown = handleKeyDown;

/* Turn background into red after temoutThreshold,
   and turn into black again on new data  */
setInterval(function() {
  if (timeout > timeoutThreshold) { 
    document.getElementById("l2").style.transition = 'all 0.5s';
    document.getElementById("l2").style.background = '#400';
  } else {
    document.getElementById("l2").style.background = 'black';
    timeout++;
  }
}, 1000);
