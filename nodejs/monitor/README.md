# monitor

Online project example: [http://141.138.138.250/](http://141.138.138.250/)

Pipe `telnet 127.0.0.1 6969`  _directly_ into http://127.0.0.1:8080

The updates are broadcast to the browsers via WebSocket. In this example project, updates are received from an NGINX access log file. Check the access log layout configuration below!

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

    ssh webserver 'tail -f /var/log/nginx/access_log' | nc 127.0.0.1 6969

See result: browse to [http://127.0.0.1:8080](http://127.0.0.1:8080)

Data that comes in via 21000 is broadcasted _directly_ to every connected WebSocket client, into the 'ws' object in  `public/index.html`! No polling or whatever, just non-blocking i/o in an event loop.

# Gulp

For ease of development, I've included a small Gulp set-up:

    gulp watch:js

# NGINX Access Log

Here the line from `/etc/nginx/nginx.conf`, where the NGINX access log layout is configured:

    log_format main '$time_local $remote_addr $request_time $host ...';

The important part here, is that the first four entities are available, and in above order. Otherwise, this project example will fail, because the browser Javascript that handles these log entities expects them exactly like above. The ellipsis can be replaced with whatever you need more in your access log layout.
