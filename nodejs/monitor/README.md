# monitor

Online project example: [http://141.138.138.250/](http://141.138.138.250/)

The idea is: read the NGINX access log, and pipe it via Netcat into this NodeJS monitor example, and broadcast it via the WebSocket protocol to all connected browsers via an URL, thus `nc 127.0.0.1 6969`  _directly_ to http://127.0.0.1:8080

In this example project, updates are received from an NGINX access log file. Check the NGINX access log layout configuration below!

Set up:

    sudo npm install -g express
    sudo npm install -g gulp
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

    ./server.js -h 127.0.0.1 -t 6969 -w 8080

You can omit the arguments in case you want to use the default values, this is an example.

Test:

    echo hello | nc 127.0.0.1 6969

or

    for n in {1..25} ; do echo $(date) | nc 127.0.0.1 6969 ; sleep 1 ; done

or

    sudo tail -F /var/log/nginx/access_log | nc 127.0.0.1 6969

or even from a remote web server

    ssh webserver 'tail -F /var/log/nginx/access_log' | nc 127.0.0.1 6969

The `-F` is to make `tail` survive log rotations.

See result: browse to [http://127.0.0.1:8080](http://127.0.0.1:8080)

Data that comes in via 6969 is broadcasted _directly_ to every connected WebSocket client, into the 'ws' object in  `public/index.html`! No polling or whatever, just non-blocking I/O in event loops.

# Gulp

For ease of development, I've included a small Gulp set-up:

    gulp watch:js

# NGINX Access Log

Here the line from `/etc/nginx/nginx.conf`, where the NGINX access log layout is configured:

    log_format main '$time_local $remote_addr $request_time $host ...';

The important part here, is that the first four entities are available, and in above order. Otherwise, this project example will fail, because the browser Javascript that handles these log entities expects them to come in exactly like above. The ellipsis can be replaced with whatever you need more in your access log layout.
