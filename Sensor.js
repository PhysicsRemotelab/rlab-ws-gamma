const SerialPort = require('serialport');

class Sensor {
    init(com) {
        this.port = new SerialPort(com, {
            baudRate: 115200
        });
        const ByteLength = SerialPort.parsers.ByteLength;
        this.parser = new ByteLength({ length: 5 });
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
