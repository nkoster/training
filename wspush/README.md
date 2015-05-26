# wspush

Very simple NodeJS/Express Websocket push example, extracted out of [ws/example](https://github.com/websockets/ws/tree/master/examples/serverstats), as a baseline for my future "Monitor Screen" project.

Set up:

    WORKSPACE=$HOME/Workspace
    cd /tmp
    git clone https://github.com/websockets/ws
    git clone https://github.com/nkoster/training
    cd $WORKSPACE
    mv /tmp/training/wspush .
    cd wspush
    mv /tmp/ws/lib .
    npm install --save ultron
    npm install --save options

Run:

    node server.js
