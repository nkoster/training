# monitor

In this example: `telnet localhost 21000` goes _directly_ to http://localhost:8080 (wow, I love it!)

Set up:

    WORKSPACE=$HOME/Workspace
    cd /tmp
    git clone https://github.com/websockets/ws
    git clone https://github.com/nkoster/training
    cd $WORKSPACE
    mv /tmp/training/nodejs/monitor .
    cd monitor
    mv /tmp/ws/lib .
    npm install

Run:

    ./server.js -h 127.0.0.1 -t 21000 -w 8000

You can omit the arguments in case you want to use the default values, this is an example.

Test:

    echo hello | nc localhost 21000

or

    for n in {1..25} ; do echo $(date) | nc localhost 21000 ; sleep 1 ; done

or

    ssh webserver 'tail -f /var/log/nginx/access_log' | nc localhost 21000

See result: browse to [http://localhost:8000](http://localhost:8000)

Data that comes in via 21000 is broadcasted _directly_ to every connected WebSocket client, into the 'ws' object in  `public/index.html`! No polling or whatever, just non-blocking i/o in an event loop.
