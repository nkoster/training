A "scrolling lines" monitor shows Portavita web page response times in
real-time, in a web page.

#### Notes

-   The scrolling lines in the monitor are collected and broadcast by a
    [NodeJS](https://nodejs.org/) server via
    [WebSocket](https://en.wikipedia.org/wiki/WebSocket)
-   Data is read from the Apache timing log file,
    `/home/httpd/logs/pvt_timimg.txt`
-   The NodeJS project JavaScript files are in
    [Gitanos](http://gitanos.portavita.nl/cgit/pvmon/), and also in
    [Github](https://github.com/Portavita/scrolling-lines). Both
    repositories are automatically updated on every commit, they are
    equal
-   If you like to commit stuff to the project, you are very welcome -
    let me know! (Niels)
-   You have to install **NodeJS** and **npm**, the NodeJS package
    ('module') manager, before you can continue
-   [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
    seems to be still an experimental technique
-   No sensitive data is broadcast to browsers: sensitive data, like
    person names or IP numbers, is cut out at server level

#### Install

In the steps below, as an example, a working directory 'Workspace' is
assumed, and **`node`** and **`npm`** installed. Also, assumed is that
**`screen`** is available. Other dependencies, within the Node project,
are automatically handled by **`npm`**. (Mac and Linux tested)

    WORKSPACE=$HOME/Workspace
    cd /tmp
    git clone https://github.com/websockets/ws
    cd $WORKSPACE
    git clone http://gitanos.portavita.nl/cgit/pvmon/gitanos@areca.portavita.nl:pvmon
    cd pvmon
    mv /tmp/ws/lib .
    npm install

Run it:

`screen -mS scroll_pvprodweb01`\
`./server.js -t 6969 -w 8080 -h 192.168.1.213 &`\
`ssh httpd@pvprodweb01 'tail -F logs/pvt_timing.txt' | nc 192.168.1.213 6969`

Arguments are:

:   **`-t  telnet server port`**
:   **`-w  web server port`**
:   **`-h  host`**

Forward the timing log stream to the telnet server port:

`ssh httpd@pvprodweb01 'tail -F logs/pvt_timing.txt' | nc 192.168.1.213 6969`

-   The capital **`-F`** makes **`tail`** survive log rotations

You can omit the **'`-h 192.168.1.213`**', which defaults to
**`localhost`**. In that case, you would pipeline into
**`nc localhost 6969`**, but you can still browse to the external
address on port **`8080`**, because the web server listens to all
interfaces by default.

In fact, you could also omit the other arguments, since above values are
defaults too...

Leave your **`screen`** session by pressing the **`Ctrl-A`** and **`Z`**
key, and browse to **<http://192.168.1.213:8080>**, to view the
Scrolling Lines.

#### Time-outs in Browsers

In case clients (browsers) do not receive data (a filter might
influence, see below) for more than **30 seconds**, the scrolling lines
background will turn into a dark red colour. This is to make viewers
aware of the possible time-out condition. Once data starts to come in,
the background will turn into black again. If the data flow doesn't
automatically recover, please check if the **`tail`** / **`nc`** line
still runs. The client (browser) will *always* try to set up a new
WebSocket connection, the retry interval is 10 seconds. Basically, this
means that you should *never* have to refresh (F5) the scrolling lines
page in the browser. For some conditions, e.g. the VPN went down while
browsing via the Portavita proxy: it can take a few minutes to recover
the WebSocket connection. If you're impatient, press F5...

#### Filter

![](yellow_filter.png "fig:yellow_filter.png") A simple real-time filter
is available while the lines are scrolling. Press **`Ctrl-Alt-F`** to
*toggle* the filter input. For example, when you like to see *only* the
Saltro lines, press **`Ctrl-Alt-F`** and type "**SALTRO**". Press
**`Ctrl-Alt-F`** again to exit the filter input. The filter text is
case-sensitive. In case you want to *exclude* Saltro lines, you make a
negate text filter by typing an exclamation mark first: "**!SALTRO**".
You can also use the logical operators "**\<**" and "**\>**", to filter
lines that are faster or slower than the threshold you define
*immediately* after the operator. For example, "**\>1.5**" shows only
the lines with a response time longer than 1.5 second. You can combine
filter arguments, and you can use more than two filter arguments. The
order for the filter arguments does not matter. Basically, a space is a
logical "`AND`" operator. You can also use a logical "`OR`" operator
within text arguments. Use the "**|**" for this. For example,
"**EEMLA|EEMVA|SALTRO**" shows the lines for Eemland, Eemvallei and
Saltro, only. You can disable a filter, and enable it again later, by
using the "**\#**" as first character.

Filter hints:

:   See only logged in users: **!-**
:   See only logged in users from Saltro: **!- SALTRO**
:   Filter within Saltro lines: **SALTRO \>0.5 !php !xml**
:   Filter php and xml within Saltro lines: **SALTRO \>0.5 php|xml**
:   Show only Eemland, Eemvallei and Saltro: **EEMLA|EEMVA|SALTRO**
:   Show only Eemland, Eemvallei and Saltro slow pages:
    **EEMLA|EEMVA|SALTRO \>1**
:   Or like this: **EEMLA|EEMVA|SALTRO \>1 \<2 php|html !/algemeen**
:   Disable: **\#EEMLA|EEMVA|SALTRO \>1 \<2 php|html !/algemeen**
:   Show all except Eemland, Eemvallei and Saltro: **!EEMLA !EEMVA
    !SALTRO**
:   Make the screen very red: **\>2**
:   Make the screen very green: **\<1**
:   Make the screen very orange: **\>1 \<2**

-   When real-time filtering is active, a yellow alert
    "<small><span style="background:#fe0;color:#fe0;border-radius:50%">oo</span></small>"
    is in the top-right of the window, to keep you aware of the
    activated filter. Keep in mind that a filter might trigger a red
    time-out background more often, see
    [above](http://wiki.portavita.nl/wiki/index.php/De_database_en_webserver_Monitor_pagina#Time-outs_in_Browsers)

#### Start-up after reboot

(Until fully automated; Work in progress)

Since the '192.168.1.213' machine for now has become the 'Scrolling
Lines Hub', below is an 'after reboot' manual.

Log-in as user **`sysdesk`**, with the Mars password. Do:

`screen -mS scroll_pvprodweb01`\
`./server.js -t 6969 -w 8080 -h 192.168.1.213 &`\
`ssh httpd@pvprodweb01 'tail -F logs/pvt_timing.txt' | nc 192.168.1.213 6969`

-   Press the **`Ctrl-A`** and **`Z`** key, to leave **`screen`**

`screen -mS scroll_webxsprod`\
`./server.js -t 6970 -w 8081 -h 192.168.1.213 &`\
`ssh httpd@webxsprod 'tail -F logs/pvt_timing.txt' | nc 192.168.1.213 6970`

-   Press the **`Ctrl-A`** and **`Z`** key, to leave **`screen`**

Now both VANCIS and XS4ALL should show their Scrolling Lines:

-   VANCIS: **<http://192.168.1.213:8080>**
-   XS4ALL: **<http://192.168.1.213:8081>**
