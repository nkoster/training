/*jslint browser: true*/
/*jslint indent: 2 */
var lineHeight = 17;
var monitorHeight = window.innerHeight;
var numberOfLines = Math.floor(monitorHeight / lineHeight) - 1;
if (numberOfLines < 3) { numberOfLines = 3; }
var timeoutThreshold = 30;
var timeout = 0;
var monitor = [];
var counter = 0;
var div = '';
var screenChanged = false;
var filterMenu = false;
var filterText = '';
var inputMinSize = 200;

function filter(f) {
  filterText = f;
  var w = ((f.length + 1) * 9);
  if (w > inputMinSize) {
    document.getElementById('freetext').style.width = w + 'px';
    document.getElementById('freetext').style.minWidth = w + 'px';
    document.getElementById('freetext').style.maxWidth = w + 'px';
  } else {
    document.getElementById('freetext').style.width = inputMinSize + 'px';
    document.getElementById('freetext').style.minWidth = inputMinSize + 'px';
    document.getElementById('freetext').style.maxWidth = inputMinSize + 'px';
  }
  //document.getElementById('debug').innerHTML = '' + f;
}

function updateMonitor(dataReceived) {
  monitor[counter] = dataReceived;
  div = '';
  var i, mon_data, elapsed, elapsedString, timeStamp, ipAddress, request, weight, background, color;
  for (i = 0; i < monitor.length; i++) {
    mon_data = monitor[i].split(' ');
    elapsed = parseFloat(mon_data[1]);
    color = '#2f5';                     /* green */
    if (elapsed > 1) color = '#fa3';    /* orange */
    if (elapsed > 2) color = '#f32';    /* red */
    elapsedString = elapsed.toFixed(3);
    elapsedString = new Array(7 - elapsedString.length).join(' ') + elapsedString;
    timeStamp = mon_data[0];
    ipAddress = mon_data[2];
    ipAddress = new Array(17 - ipAddress.length).join(' ') + ipAddress;
    request = mon_data[3];
    weight = 'normal';
    background = 'none';
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
  if (screenChanged) {
    screenChanged = false;
    monitor.splice(numberOfLines);
    div.split("\n").slice(numberOfLines).join("\n");
    if (counter > numberOfLines) { counter = numberOfLines; }
  }
  document.getElementById('monitor').innerHTML = div;
  if (counter < (numberOfLines - 1)) {
    counter += 1;
  } else {
    counter = 0;
  }
  timeout = 0;
}

var alarmRed = 0;
var alarmBlack = 0;
var alarmEnabled = false;

var context = new AudioContext(); // Create audio container
var oscillator1;

function alarmOn(f) {
  if (alarmEnabled) {
    oscillator1 = context.createOscillator(); // Create sound source 1
    oscillator1.type = "sine"; // Sine wave
    oscillator1.connect(context.destination); // Connect sound source 1 to output
    oscillator1.frequency.value = f; // Default frequency in hertz
    oscillator1.start(0);
  }
}

function alarmOff() {
  if (alarmEnabled) {
    if (typeof oscillator1 != "undefined") { oscillator1.stop(0); }
  }
}

var host = window.document.location.host.replace(/:.*/, '');
//var ws = new ReconnectingWebSocket('ws://' + host + ':' + location.port);
var ws = new ReconnectingWebSocket('ws://' + host + ':8080');
ws.reconnectInterval = 10000;
ws.onmessage = function (event) {
  var d = String(event.data);
  var m = d.split(' ');
  /* Not enough data fields received? Skip. */
  if (m.length > 3) {
    var elapsed = parseFloat(m[1]);
    /* Unusable data received? Skip. */
    if (!isNaN(elapsed)) {
      var f = filterText.replace(/\s+$/, '').split(' ');
      /* Cycle through the filter arguments, prove to not to be filtered out */
      var filterShow = true;
      var filterANDCycles = f.length;
      var ff, nn, nnn, ft, ftt, filterNegate, filterElapsed, filterGt, filterSt, filterThreshold, filterORCycles, filterORShow;
      for (nn = 0; nn < filterANDCycles; nn++) {
        ft = f[nn];
        filterNegate = false;
        filterElapsed = false;
        filterGt = false;
        filterSt = false;
        filterThreshold = 0.0;
        if (ft[0] === '!') {
          ft = ft.replace(/\!/, '');
          filterNegate = true;
        }
        if (ft[0] === '>') {
          ft = ft.replace(/\>/, '');
          filterElapsed = true;
          filterGt = true;
        } else {
          filterGt = false;
        }
        if (ft[0] === '<') {
          ft = ft.replace(/</, '');
          filterElapsed = true;
          filterSt = true;
        } else {
          filterSt = false;
        }
        if (filterElapsed) {
          filterThreshold = parseFloat(ft);
          if (isNaN(filterThreshold)) { filterThreshold = 0.0; }
          ft = '';
        }
        if (ft.length === 0 && !filterElapsed) {
          filterShow = true;
        } else {
          if (filterGt) {
            if (elapsed < filterThreshold) { filterShow = false; }
          }
          if (filterSt) {
            if (elapsed > filterThreshold) { filterShow = false; }
          }
          if (!filterElapsed) {
            if (ft.indexOf('|') > 0) {
              ff = ft.replace(/\|$/, '').split('|');
              /* Cycle through the OR agruments, prove to not to be filtered out */
              filterORCycles = ff.length;
              filterORShow = false;
              for (nnn = 0; nnn < filterORCycles; nnn++) {
                ftt = ff[nnn];
                if (d.indexOf(ftt) > 0) {
                  filterORShow = true;
                }
              }
              if (!filterORShow) { filterShow = false; }
            } else {
              if (filterNegate) {
                if (d.indexOf(ft) >= 0) { filterShow = false; }
              } else {
                if (d.indexOf(ft) < 0) { filterShow = false; }
              }
            }
          }
        }
      }  // for loop nn
      if (filterText.indexOf('#') === 0) { filterShow = true; }
      if (filterShow) { updateMonitor(d); }
    }
  }
};

window.onresize = function () {
  monitorHeight = window.innerHeight;
  var newNumberOfLines = Math.floor(monitorHeight / lineHeight) - 1;
  if (newNumberOfLines < 3) { newNumberOfLines = 3; }
  numberOfLines = newNumberOfLines;
  screenChanged = true;
};

function handleKeyDown(e) {
  var ctrlPressed = 0;
  var altPressed = 0;
  // var shiftPressed = 0;
  var evt = (e === null ? event : e);
  // shiftPressed = evt.shiftKey;
  altPressed = evt.altKey;
  ctrlPressed = evt.ctrlKey;
//  self.status = "shiftKey=" + shiftPressed + ", altKey=" + altPressed + ", ctrlKey=" + ctrlPressed;
  /* Ctrl+Alt+F */
  if ((altPressed || ctrlPressed) && evt.keyCode === 70) {
    if (filterMenu) {
      document.getElementById("overlay").style.transition = 'opacity 0.4s';
      document.getElementById("filter").style.transition = 'opacity 0.5s';
      document.getElementById("overlay").style.opacity = '0.0';
      document.getElementById("filter").style.opacity = '0.0';
      filterMenu = false;
    } else {
      document.getElementById("overlay").style.transition = 'opacity 0.5s';
      document.getElementById("filter").style.transition = 'opacity 0.5s';
      document.getElementById("overlay").style.opacity = '0.4';
      document.getElementById("filter").style.opacity = '0.9';
      document.getElementById("freetext").focus();
      filterMenu = true;
    }
  }
  /* Ctrl-Alt-S */
  if ((altPressed || ctrlPressed) && evt.keyCode === 83) {
    if (alarmEnabled) {
      alarmEnabled = false;
    } else {
      alarmEnabled = true;
    }
  }
  return true;
}

document.onkeydown = handleKeyDown;

/* 1 Second checks: Update background + Update filter alert */
var stateFilter = 0;
var stateAlarm = 0;
var showFilterAlert = false;

setInterval(function () {
  if (timeout > timeoutThreshold) {
    document.getElementById("l2").style.transition = 'all 0.5s';
    document.getElementById("l2").style.background = '#700';
    if (alarmRed < 1 && alarmBlack !== 1) {
      alarmOn(380);
      alarmRed++;
    } else {
      alarmOff();
    }
    alarmBlack = 0;
  } else {
    document.getElementById("l2").style.background = 'black';
    if (alarmBlack < 1 && alarmRed !== 1) {
      alarmOn(190);
      alarmBlack++;
    } else {
      alarmOff();
    }
    alarmRed = 0;
    timeout++;
  }
  if ((filterText.length > 0) && (filterText.indexOf('#') !== 0)) {
    showFilterAlert = true;
    document.getElementById("filteralert").style.transition = 'all 0.9s';
    document.getElementById("filteralert").style.opacity = '0.9';
    if (stateFilter === 0) {
      document.getElementById("filteralert").style.background = '#fe0';
      stateFilter = 1;
    } else {
      document.getElementById("filteralert").style.background = '#330';
      stateFilter = 0;
    }
  } else {
    showFilterAlert = false;
    stateFilter = 0;
    document.getElementById("filteralert").style.opacity = '0';
  }
  if (alarmEnabled) {
    if (showFilterAlert) {
      document.getElementById("alarmalert").style.top = '25px';
    } else {
      document.getElementById("alarmalert").style.top = '2px';
    }
    document.getElementById("alarmalert").style.transition = 'all 0.9s';
    if (stateFilter === 1) { stateAlarm = 0; }
    if (stateAlarm === 0) {
      document.getElementById("alarmalert").style.opacity = '0.2';
      stateAlarm = 1;
    } else {
      document.getElementById("alarmalert").style.opacity = '0.9';
      stateAlarm = 0;
    }
  } else {
    document.getElementById("alarmalert").style.opacity = '0';
  }
}, 1000);
