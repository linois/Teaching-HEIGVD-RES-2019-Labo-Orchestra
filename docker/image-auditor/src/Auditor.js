const protocol = require('./protocol');
const dgram = require('dgram');
const TIMEOUT = 5000;

const s = dgram.createSocket('udp4');

const soundsMap = new Map([
    ["ti-ta-ti", "piano"],
    ["pouet",    "trumpet"],
    ["trulu",    "flute"],
    ["gzi-gzi",  "violin"],
    ["boum-boum","drum"]
]);

var musiciens = [];

s.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

s.on('message', function(msg, source) {

    const jmessage = JSON.parse(msg);
    const uuid = jmessage.uuid;
    const instrument = soundsMap.get(jmessage.sound);
	const timestamp = jmessage.timestamp;
	
    musiciens.push({
        uuid: uuid,
        instrument: instrument,
        activeSince: timestamp,
    });

	console.log("Data has arrived: " + uuid + "  " + instrument + ". Source port: " + source.port);
});

const net = require('net');

const server = net.createServer(function (socket) {
    const json = [];

    for (var i = 0; i < musiciens.length; i++) {

        if (Date.now() - musiciens[i].activeSince <= MAX_DELAY) {
            json.push({
                uuid: musiciens[i].uuid,
                instrument: musiciens[i].instrument,
                activeSince: new Date(musiciens[i].activeSince),
            });
        }
    }
    
    const payload = JSON.stringify(json);

    socket.write(payload);
    socket.pipe(socket);
    socket.end();
});

server.listen(2205);