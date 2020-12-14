const https = require('https');
const http = require('http');
const ws = require('ws');
const fs = require('fs');

const options = {
    key: fs.readFileSync('./ssl/server.key'),
    cert: fs.readFileSync('./ssl/public-certificate.pem'),
};

//let server = https.createServer(options, (req, res) => {
//    res.writeHead(200);
//});
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
    client.on('message', message => {
        console.log(message);
    });
    client.on('error', error => {
        console.log(error);
    });
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
port.on('error', handleError);
port.pause(); // Pause data stream on application start

function handleError(error) {
    console.log(error);
}

let counter = 0;
let counts = Array(4095).fill(0);

function handleData(buffer) {
    let numbers = JSON.parse(JSON.stringify(buffer)).data;

    if(numbers[0] === 77 && numbers[1] === 67 && numbers[2] === 65) { // Check if first three codes are MCA
        const result = numbers[3] * 256 + numbers[4]; // Calculate result in decimal
        if(result > 40 && result < 4096) { // Filter outliers
            counts[result]++;
            counter++;
        }
    }
    if(numbers[1] === 77 && numbers[2] === 67 && numbers[3] === 65) { // Check if first three codes are MCA
        const result = numbers[4] * 256 + numbers[0]; // Calculate result in decimal
        if(result > 40 && result < 4096) { // Filter outliers
            counts[result]++;
            counter++;
        }
    }
    if(numbers[2] === 77 && numbers[3] === 67 && numbers[4] === 65) { // Check if first three codes are MCA
        const result = numbers[0] * 256 + numbers[1]; // Calculate result in decimal
        if(result > 40 && result < 4096) { // Filter outliers
            counts[result]++;
            counter++;
        }
    }
    if(numbers[3] === 77 && numbers[4] === 67 && numbers[0] === 65) { // Check if first three codes are MCA
        const result = numbers[1] * 256 + numbers[2]; // Calculate result in decimal
        if(result > 40 && result < 4096) { // Filter outliers
            counts[result]++;
            counter++;
        }
    }
    if(numbers[4] === 77 && numbers[0] === 67 && numbers[1] === 65) { // Check if first three codes are MCA
        const result = numbers[2] * 256 + numbers[3]; // Calculate result in decimal
        if(result > 40 && result < 4096) { // Filter outliers
            counts[result]++;
            counter++;
        }
    }

    if(counter % 1000 === 0) {
        broadcast(JSON.stringify(counts));
        console.log('Broadcasted result.');
    }

    console.log(counter);
}
