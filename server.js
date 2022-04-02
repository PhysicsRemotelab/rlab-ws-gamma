const http = require('http');
const ws = require('ws');
const Sensor = require("./Sensor.js");
const fs = require('fs');

const httpPort = process.env.npm_config_http_port ?? 5003;
const serialport = process.env.npm_config_serial_port ?? 'COM3';

let server = http.createServer((req, res) => {
    res.writeHead(200);
});
server.listen(httpPort, () => console.log('Started server on', httpPort));
const wss = new ws.Server({server, path: '/gamma'});
wss.on('connection', handleConnection);
let connections = new Array;

let sensor = new Sensor();
sensor.init(serialport);
sensor.parser.on('data', handleData);
sensor.port.pause();

let counter = 0;
let counts = Array(4095).fill(0);

function handleData(buffer) {
    let numbers = JSON.parse(JSON.stringify(buffer)).data;
    let result = getResult(numbers);
    console.log(numbers);
    fs.appendFileSync('measurement_020422.txt', result.toString() + '\n');

    if(result > 40 && result < 4096) {
        counts[result]++;
        counter++;
        // Collect 100 measurements, broadcast result and reset array
        if(counter % 100 === 0) {
            broadcast(JSON.stringify(counts));
            console.log('Broadcasted data');
            counts = Array(4095).fill(0);
        }
    }
}

function getResult(numbers) {
    let count = numbers.indexOf(77);
    count -= numbers.length * Math.floor(count / numbers.length);
    numbers.push.apply(numbers, numbers.splice(0, count));
    let result = numbers[3] * 256 + numbers[4];
    return result;
}

function broadcast(data) {
    for (connection in connections) {
      connections[connection].send(data);
    }
}

function handleConnection(client) {
    console.log('New connection');
    sensor.resume();
    connections.push(client);

    client.on('error', error => {
        console.log(error);
    });

    client.on('close', () => {
        console.log('Connection closed');
        let position = connections.indexOf(client);
        connections.splice(position, 1);
        sensor.pause();
    });
}
