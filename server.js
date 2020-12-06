const https = require('https');
const ws = require('ws');
const fs = require('fs');

const options = {
    key: fs.readFileSync('./ssl/server.key'),
    cert: fs.readFileSync('./ssl/public-certificate.pem'),
};

let server = https.createServer(options, (req, res) => {
    res.writeHead(200);
});
server.listen(2087, () => console.log('Https running.'));

const wss = new ws.Server({server, path: '/data'});

wss.on('connection', handleConnection);

let connections = new Array;

function handleConnection(client) {
    console.log('New connection');
    connections.push(client);
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
const parser = new SerialPort.parsers.Readline();
port.pipe(parser);
parser.on('data', handleData);
port.on('error', handleError);

function handleError(error) {
    console.log(error);
}
