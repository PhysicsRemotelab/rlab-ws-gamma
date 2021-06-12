const SerialPort = require('serialport');
const ByteLength = SerialPort.parsers.ByteLength;

class Sensor {
    init(com) {
        this.port = new SerialPort(com, {
            baudRate: 115200,
            lock: false
        });
        this.parser = new ByteLength({ length: 5 });
        this.port.pipe(this.parser);
        console.log('Initialized serial port', com);
    }

    pause() {
        if (this.port.isOpen) {
            this.port.pause();
            console.log('Port paused');
        }
    }

    resume() {
        if (!this.port.isOpen) {
            this.port.resume();
            this.parser = new ByteLength({ length: 5 });
            this.port.pipe(this.parser);
            console.log('Port opened');
        }
    }
}

module.exports = Sensor;
