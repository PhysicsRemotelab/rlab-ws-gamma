const http = require('http');
const ws = require('ws');
const Sensor = require("./Sensor.js");

let counter = 0;
let counts = Array(4095).fill(0);

let server = http.createServer((req, res) => {
    res.writeHead(200);
});
server.listen(5002, () => console.log('Http running.'));
const wss = new ws.Server({server, path: '/gamma'});
wss.on('connection', handleConnection);
let connections = new Array;

let sensor = new Sensor();
sensor.init('COM3');
sensor.parser.on('data', handleData);
sensor.port.pause();

function handleData(buffer) {
    console.log(buffer);
    let numbers = JSON.parse(JSON.stringify(buffer)).data;
    let result = getResult(numbers);
    if(result > 40 && result < 4096) {
        counts[result]++;
        counter++;
        if(counter % 100 === 0) {
            broadcast(JSON.stringify(counts));
            console.log(JSON.stringify(counts));
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
