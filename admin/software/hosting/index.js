const express = require('express');
// create an instance of express to serve our end points
const app = express();
const cors = require('cors');
app.use(cors());
const static = require('node-static');
const file = new static.Server('./pages');
const http = require('http').createServer(function (req, res) {
    return file.serve(req, res);
});
const server = http.listen(80, () => {
    // console.log('listening on %s...', server.address());
});

// get local ip
const { networkInterfaces } = require('os');
const nets = networkInterfaces();
const results = Object.create(null); // or just '{}', an empty object

let empty = true;

console.log('\nKHÔNG ĐÓNG CÁC CỬA SỔ NÀY!\n');
console.log('Các thí sinh truy cập vào địa chỉ sau:');
console.log('(chọn card mạng đang kết nối chung với thí sinh)\n');

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
			
			empty = false;

            console.log(`card ${name}: * thí sinh: http://${net.address}`);
			console.log(`            * slide:    http://${net.address}/slide`);
            results[name].push(net.address);
        }
    }
}

if(empty)
	console.log("Không tìm thấy kết nối nào!");
