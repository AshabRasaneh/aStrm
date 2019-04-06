var jalaali = require('jalaali-js')

var server = require('http').createServer();
var io = require('socket.io')(server);

var _ip = "188.253.2.147";

var _port = 3005;

let Players = new Map();

console.log("Hello Mahdi...");

io.on('connection', function (socket) {

    var myId = -1;
    var pkgs = [];

    var dtAdd = {
        Meskind: "Connected",
        MesMes: "hi"
    };
    socket.emit('new message', dtAdd);

    socket.on('disconnect', function () {
        PlayerDisonnectedSql(myId);
    });

    socket.on('add', function (msg) {
        try {

            var dt = JSON.parse(msg);
            var playerId = dt.playerId.toString();
            var pkgName = dt.pkgName;
            var phoneNo = dt.phoneNo;

            if (dt.hasOwnProperty('pkgs')) {
                pkgs = dt.pkgs;
            }

            var added = 0;
            myId = playerId;

            var myData = {
                playerId: playerId,
                phoneNo: phoneNo,
                socket: socket,
                pkgs: pkgs,
                alive: 0
            };
            var d = new Date();
            var n = d.getTime();
            if (pkgs != undefined) {
                for (var j = 0; j < pkgs.length; j++) {
                    var idd = playerId;
                    var canLog = 0;
                    if (pkgs[j] == "com.arp.testvideo") {
                        canLog = 1;
                    }


                    if (!Players.has("" + pkgs[j]) && pkgs[j] != "null") {

                        var players = new Map();
                        players.set("" + idd, myData);

                        Players.set("" + pkgs[j], players);

                    } else {

                        let p = Players.get("" + pkgs[j]);
                        p.set("" + idd, myData);
                        Players.set("" + pkgs[j], p);
                    }

                }

                PlayerConnectedSql(playerId, pkgs);
            }
        } catch (e) {
            console.log("addProblem: " + e.message);
        }
        //io.emit('chat message', msg);
    });

    socket.on('Alive', function (msg) {
        try {
            var dt = JSON.parse(msg);
            var playerId = dt.playerId.toString();
            var pkgName = dt.pkgName;
            var phoneNo = dt.phoneNo;

            if (dt.hasOwnProperty('pkgs')) {
                pkgs = dt.pkgs;
            }

            var data = {
                alive: true,
                Meskind: "Alive"
            };
            for (var j = 0; j < pkgs.length; j++) {
                if (Players.has("" + pkgs[j])) {
                    var idd = playerId;
                    let p = Players.get("" + pkgs[j]);
                    var data = p.get("" + idd);
                    data.alive = Date.now();
                    p.set("" + idd, data);
                    Players.set("" + pkgs[j], p);

                    socket.emit('new message', data);
                }
            }
        } catch (e) {
            console.log("Alive: " + e.message);
        }
        //io.emit('chat message', msg);
    });

    socket.on('Deliver', function (msg) {
        try {
            var dt = JSON.parse(msg);
            var playerId = dt.playerId.toString();
            var pkgName = dt.pkgName;
            var phoneNo = dt.phoneNo;

            if (dt.hasOwnProperty('pkgs')) {
                pkgs = dt.pkgs;
            }

            var nid = dt.nid;
            var idd = playerId;

            if (delivery.has("" + nid)) {
                let deliv = delivery.get("" + nid);
                deliv.set("" + idd, 1);
                delivery.set("" + nid, deliv);
            } else {
                let deliv = new Map();
                deliv.set("" + idd, 1);
                delivery.set("" + nid, deliv);
            }

            SetDeliverySql(nid, playerId);
        } catch (e) {
            console.log("Deliver: " + e.message);
        }
        //io.emit('chat message', msg);
    });

});



//------------------------------------------------------------------------
var audio = require('audio-stream');
 
navigator.getUserMedia({
    video: false,
    audio: true
}, function(mediaStream) {
    var stream = audio(mediaStream, {
        channels: 1,
        volume: 0.5
    });
 
    stream.on('header', function(header) {
        // Wave header properties
    });
 
    stream.on('data', function(data) {
        // Data is a Buffer instance (UInt8Array)
    });
 
    stream.on('end', function() {
        // End is emitted when media stream has ended
    });
 
    setTimeout(function() {
        mediaStream.stop();
    }, 2000);
}, function() {
    console.log('Failed to get media');
});



//************************************************************************ */
var http = require('http'),
    url = require('url'),
    fs   = require('fs'),
    filePath = '/home/risto/Downloads/oleg.mp4',
    stat = fs.statSync(filePath);

http.createServer(function(request, response) {        
    const fileSize = stat.size;
    const range = request.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] 
        ? parseInt(parts[1], 10)
        : fileSize - 1;
      const chunksize = (end - start) + 1;
      const readStream = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      response.writeHead(206, head);
      readStream.pipe(response);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      response.writeHead(200, head);
      fs.createReadStream(filePath).pipe(response);
    }
})



//---------------------------------------------
server.listen(_port);
