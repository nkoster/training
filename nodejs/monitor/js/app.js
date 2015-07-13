var lineHeight = 17;
var monitorHeight = window.innerHeight;
var numberOfLines = Math.floor(monitorHeight / lineHeight) - 1;
if (numberOfLines < 3) numberOfLines = 3;
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
  if (counter < (numberOfLines - 1)) {
    counter += 1;
  } else {
    counter = 0;
  }
  timeout = 0;
}

var host = window.document.location.host.replace(/:.*/, '');
ws = new ReconnectingWebSocket('ws://' + host + ':' + location.port);
ws.reconnectInterval = 10000;
ws.onmessage = function (event) {
  var d = '' + event.data;
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
      for (nn = 0; nn < filterANDCycles; nn++) {
        var ft = f[nn];
        var filterNegate = false;
        var filterElapsed = false;
        var filterGt = false;
        var filterSt = false;
        var filterThreshold = 0.0;
        if (ft[0] == '!') {
          ft = ft.replace(/\!/, '');
          filterNegate = true;
        }
        if (ft[0] == '>') {
          ft = ft.replace(/\>/, '');
          filterElapsed = true;
          filterGt = true;
        } else {
          filterGt = false;
        }
        if (ft[0] == '<') {
          ft = ft.replace(/\</, '');
          filterElapsed = true;
          filterSt = true;
        } else {
          filterSt = false;
        }
        if (filterElapsed) {
          filterThreshold = parseFloat(ft);
          if (isNaN(filterThreshold)) filterThreshold = 0.0;
          ft = '';
        }
        if (ft.length == 0 && !filterElapsed) {
          filterShow = true;
        } else {
          if (filterGt) {
            if (elapsed > filterThreshold) {
              // nothing
            } else {
              filterShow = false;
            }
          }
          if (filterSt) { 
            if (elapsed < filterThreshold) {
              // nothing
            } else {
              filterShow = false;
            }
          }
          if (!filterElapsed) {
            if (ft.indexOf('|') > 0) {
              var ff = ft.replace(/\|$/, '').split('|');
              /* Cycle through the OR agruments, prove to not to be filtered out */
              var filterORCycles = ff.length;
              var filterORShow = false;
              for (nnn = 0; nnn < filterORCycles; nnn++) {
                var ftt = ff[nnn];
                if (d.indexOf(ftt) > 0) {
                  filterORShow = true;
                } else {
                  // nothing
                }
              }
              if (!filterORShow) filterShow = false;
            } else {
              if (filterNegate) {
                if (d.indexOf(ft) < 0) {
                  // nothing
                } else {
                  filterShow = false;
                }
              } else {
                if (d.indexOf(ft) > 0) {
                  // nothing
                } else {
                  filterShow = false;
                }
              }
            }
          }
        }
      }  // for loop nn
      if (filterText.indexOf('#') == 0) filterShow = true;
      if (filterShow) updateMonitor(d);
    }
  }
};

window.onresize = function() {
  monitorHeight = window.innerHeight;
  var newNumberOfLines = Math.floor(monitorHeight / lineHeight) - 1;
  if (newNumberOfLines < 3) newNumberOfLines = 3;
  numberOfLines = newNumberOfLines;
  screenChanged = true;
}

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
  if ((altPressed || ctrlPressed) && evt.keyCode == 70) {
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
  return true;
}

document.onkeydown = handleKeyDown;

/* 1 Second checks: Update background + Update filter alert */
var state = 0;
setInterval(function() {
  if (timeout > timeoutThreshold) { 
    document.getElementById("l2").style.transition = 'all 0.5s';
    document.getElementById("l2").style.background = '#700';
  } else {
    document.getElementById("l2").style.background = 'black';
    timeout++;
  }
  if ((filterText.length > 0) && (filterText.indexOf('#') != 0)) {
    document.getElementById("filteralert").style.transition = 'all 0.9s';
    document.getElementById("filteralert").style.opacity = '0.9';
    if (state == 0) {
      document.getElementById("filteralert").style.background = '#fe0';
      state = 1;
    } else {
      document.getElementById("filteralert").style.background = '#330';
      state = 0;
    }
  } else {
    document.getElementById("filteralert").style.opacity = '0';
  }
}, 1000);
