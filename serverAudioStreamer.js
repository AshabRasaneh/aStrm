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


const context = require('audio-context')
const Generator = require('audio-generator')
const {Readable, Writable} = require('web-audio-stream/stream')
 
let oscillator = context.createOscillator()
oscillator.type = 'sawtooth'
oscillator.frequency.value = 440
oscillator.start()
 
//pipe oscillator audio data to stream
Readable(oscillator).on('data', (audioBuffer) => {
    console.log(audioBuffer.getChannelData(0))
})
 
//pipe generator stream to audio destination
Generator(time => Math.sin(Math.PI * 2 * time * 440))
server.pipe(Writable(context.destination))

server.listen(_port);
