// todo: move serial code from server here
const SerialPort = require('serialport');

const port = new SerialPort('COM3', {
    baudRate: 115200
});
const ByteLength = SerialPort.parsers.ByteLength;
const parser = new ByteLength({ length: 20 });
port.pipe(parser);
parser.on('data', handleData);
port.on('error', handleError);

function handleError(error) {
    console.log(error);
}

function handleData(buffer) {
    console.log(buffer);
    let json = JSON.stringify(buffer);
    let stringify = JSON.parse(json);
    let numbers = stringify.data;
    // let filteredNumbers = numbers.filter(n => n > 20);
    console.log(numbers);
    let string = buffer.toString('utf8');
    console.log(string);
    process.exit(1);
    //var dataNr = data.split(',');
    //console.log(dataNr.length);
}
