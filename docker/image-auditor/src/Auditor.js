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

let map = new Map();
let timeMap = new Map();

s.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

s.on('message', function(msg, source) {

    const jmessage = JSON.parse(msg);
    const uuid = jmessage['id'];
    const instrument = soundsMap.get(jmessage['sound']);
	const timestamp = jmessage['timestamp'];
	
    const json = {
        uuid: uuid,
        instrument: instrument,
        activeSince: timestamp
    };

    if(!map.has(uuid))
        map.set(uuid,json);

    timeMap.set(uuid,Date.now());

	console.log("Data has arrived: " + uuid + "  " + instrument + ". Source port: " + source.port);
});

const net = require('net');

const server = net.createServer(function (socket) {
    const json = [];

    map.forEach(function (sound, pos) {
        const start = timeMap.get(pos);
        const end = Date.now();

        if (end - start < TIMEOUT) 
        {
            json.push(sound);
        }
    });
    
    const readJSON = JSON.stringify(json, null, 2);

    socket.write(jsonPretty);
    socket.pipe(socket);
    socket.end();
});

server.listen(2205);