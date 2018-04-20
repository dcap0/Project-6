const fs = require('fs');
const dataDir = './data';

if (fs.existsSync(dataDir) === true){
    console.log('Data file found!');
} else {
    console.log('Data file not found, creating now!');
    fs.mkdirSync(dataDir);
};