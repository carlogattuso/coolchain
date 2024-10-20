const fs = require('fs');
const path = require('path');

const basedir = '/sys/bus/w1/devices'
const interval = 5000 // 5s

function main() {
	const files = fs.readdirSync(basedir);
	var sensors = [];
	var device_temp = 0;
		
	files.forEach(file => { 
		if (file.startsWith('28-')) {
			sensors.push(path.join(basedir,file))
		}
	});

	console.log(`Reading ${sensors.length} temperature sensors:`);
	for(var i = 0; i < sensors.length; i++){
		const sensor = sensors[i]; 
		const sensor_name = path.basename(sensor);
		const sensor_temp = fs.readFileSync(sensor + '/w1_slave').toString().split('=')[2].trim();

		console.log(`- ${sensor_name}: ${sensor_temp.substring(0,2)},${sensor_temp.substring(2,3)}ºC`);
		device_temp += Number(sensor_temp);
	}
	device_temp = device_temp / sensors.length / 1000;

	console.log(`=> ${device_temp}ºC`);
	// console.log();
}
main();
setInterval(main, interval);
