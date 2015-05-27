# monitor

Work in progress!

* Working now: `telnet localhost 6969` goes to http://localhost:8080 (wow, I love it!)

Set up:

    WORKSPACE=$HOME/Workspace
    cd /tmp
    git clone https://github.com/websockets/ws
    git clone https://github.com/nkoster/training
    cd $WORKSPACE
    mv /tmp/training/nodejs/monitor .
    cd monitor
    mv /tmp/ws/lib .
    npm install --save ultron
    npm install --save options

Run:

    node server.js

Test:

    echo aap | nc localhost 6969

See result: browse to http://localhost:8080
