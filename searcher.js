var async = require('async');
    fs = require('fs');
    hexRgb = require('hex-rgb');

fs.readFile('Steganography-900748585.png.html', 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }

    data = data.substring(data.indexOf('<td>'), data.indexOf('</table>')).replace(/<tr>/g, '').replace(/<\/tr>/g, '').replace(/\n\r/g, '');
    lines = data.split('\n');
    imageObject = {};

    for (var i = 0; i < lines.length; i++) {
        coords = lines[i].substring(lines[i].indexOf('>') + 1, lines[i].indexOf('</td>'));
        hex = lines[i].substring(lines[i].indexOf('#'), lines[i].indexOf('<td st') - 5);
        
        imageObject[coords] = hex;
    }

    i = 0;

    async.each(lines, function (item, callback) {
        coords = lines[i].substring(lines[i].indexOf('>') + 1, lines[i].indexOf('</td>'));
        hex = lines[i].substring(lines[i].indexOf('#'), lines[i].indexOf('<td st') - 5);
        
        imageObject[coords] = hex;

        i++
        callback();
    }, function (err) {
        delete imageObject[''];
        getLength(imageObject);
    });

    function getLength(imageObject) {
        first = [];
        binary = '';
        for (var i = 0; i <= 10; i++) {
            first.push(imageObject[Object.keys(imageObject)[i]])
        }

        j = 0;

        async.each(first, function (hex, callback) {
            var rgb = hexRgb(hex, {format: 'array'});
            delete rgb[3];
            for (i in rgb) {
                if (j == 8 || j == 16 || j == 24) {
                    binary+= ' '
                }
                j++;
                if (rgb[i] % 2 == 1) {
                    binary += '1';
                } else {
                    binary += '0';
                }
            }

            callback();
        }, function (err) {
            binary = binary.substring(0, binary.indexOf(' '));
        });

        keyLength = parseInt(binary, 2);
        console.log('Key length is ' + keyLength + '.');

        getMessage(keyLength, imageObject);
    }

    function getMessage(keyLength, imageObject) {
        messageHex = '';

        for (var y = 0; y <= Math.ceil(keyLength)/3 + 30; y++) {
            curHex = imageObject[Object.keys(imageObject)[y]];
            rgb = hexRgb(curHex, {format: 'array'});
            delete rgb[3];

            for (x in rgb) {
                if (rgb[x] % 2 == 1) {
                    messageHex += '1';
                } else {
                    messageHex += '0';
                }
            }
            
        }

        messageBinary = messageHex.substring(32, 32 + keyLength);
        console.log(messageHex)
        console.log('...///...')
        console.log(messageBinary)
    }
});