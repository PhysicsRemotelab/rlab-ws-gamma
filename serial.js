// todo: move serial code from server here
const SerialPort = require('serialport');
const fs = require('fs');

const port = new SerialPort('COM3', {
    baudRate: 115200
});
const ByteLength = SerialPort.parsers.ByteLength;
const parser = new ByteLength({ length: 5 });
port.pipe(parser);
parser.on('data', handleData);
port.on('error', handleError);

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
        var data = counts.join(",");
        fs.writeFileSync('data.csv', data);
        console.log('Saved to file ', counter);
    }
}
