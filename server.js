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
let measurement = Array(4095).fill(0);
let startTime = getCurrentDate();


function handleData(buffer) {
    let numbers = JSON.parse(JSON.stringify(buffer)).data;
    let result = getResult(numbers);
    if (result === -1) {
        console.log('Bad input');
        return;
    }

    fs.appendFileSync('am241_17_04_22_mca2.txt', result.toString() + '\n');

    measurement[result]++;
    counter++;

    // Broadcast result every 100 counts
    if(counter % 100 === 0) {
        broadcast(JSON.stringify(measurement));
        console.log('Broadcasted data');
        console.log('Start time: ' + startTime);
        console.log('Current time: ' + getCurrentDate());
        console.log('Total counts: ' + counter);
    }
}

function getResult(numbers) {
    let result = -1;
    // MCA returns total 5 numbers, first three are 77, 67, 65 and last two are measurement result
    if (numbers[0] === 77 && numbers[1] === 67 && numbers[2] === 65) {
        result = numbers[3] * 256 + numbers[4];
    }
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
        measurement = Array(4095).fill(0);
    });
}

function getCurrentDate() {
    var today = new Date();
    var date = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
    var time = ('0' + today.getHours()).slice(-2) + ":" + ('0' + today.getMinutes()).slice(-2) + ":" + ('0' + today.getSeconds()).slice(-2);
    return date + ' ' + time
}
