const { SerialPort } = require('serialport');
const { ByteLengthParser } = require('@serialport/parser-byte-length');

class Sensor {
    init(com) {
        this.port = new SerialPort({
            path: com,
            baudRate: 115200
        });
        this.parser = new ByteLengthParser({ length: 5 });
        this.port.pipe(this.parser);
        console.log('Initialized serial port', com);
    }

    pause() {
        this.port.pause();
        console.log('Port paused');
    }

    resume() {
        this.port.resume();
        console.log('Port resumed');
    }
}

module.exports = Sensor;
