# monitor

In this example: `telnet localhost 6969` goes _directly_ to http://localhost:8080 (wow, I love it!)

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

    node server.js

Test:

    echo hello | nc localhost 6969

or

    for n in {1..25} ; do echo $(date) | nc localhost 6969 ; sleep 1 ; done

or

    ssh webserver 'tail -f /var/log/nginx/access_log' | nc localhost 6969

See result: browse to [http://localhost:8080](http://localhost:8080)

What do you have now? Data that comes in via 6969 is broadcasted to every connected WebSocket client, into the 'ws' object in  `public/index.html`!
