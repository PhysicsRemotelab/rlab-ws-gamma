const http = require('http');
const ws = require('ws');

let server = http.createServer((req, res) => {
    res.writeHead(200);
});
server.listen(5002, () => console.log('Http running.'));

const wss = new ws.Server({server, path: '/gamma'});

wss.on('connection', handleConnection);

let connections = new Array;

function handleConnection(client) {
    console.log('New connection');
    connections.push(client);
    port.resume();

    client.on('close', () => {
        console.log('Connection closed');
        let position = connections.indexOf(client);
        connections.splice(position, 1);
        if (connections.length === 0) {
            port.pause();
        }
    });
}

function broadcast(data) {
    for (myConnection in connections) {   // iterate over the array of connections
      connections[myConnection].send(data); // send the data to each connection
    }
}

function handleData(data) {
    var dataNr = data.split(',');
    // console.log(dataNr.length);
    if (connections.length > 0) {
        broadcast(JSON.stringify(data));
    }
}

const SerialPort = require('serialport');

const port = new SerialPort('COM3', {
    baudRate: 115200
});
const ByteLength = SerialPort.parsers.ByteLength;
const parser = new ByteLength({ length: 5 });
port.pipe(parser);
parser.on('data', handleData);
port.pause(); // Pause data stream on application start


let counter = 0;
let counts = Array(4095).fill(0);

function getResult(numbers) {
    let count = numbers.indexOf(77);
    count -= numbers.length * Math.floor(count / numbers.length);
    numbers.push.apply(numbers, numbers.splice(0, count));
    let result = numbers[3] * 256 + numbers[4];
    return result;
}

function handleData(buffer) {
    let numbers = JSON.parse(JSON.stringify(buffer)).data;
    let result = getResult(numbers);
    if(result > 40 && result < 4096) {
        counts[result]++;
        counter++;
    }

    if(counter % 1000 === 0) {
        broadcast(JSON.stringify(counts));
        console.log('Broadcasted result.');
    }

    console.log(counter);
}
