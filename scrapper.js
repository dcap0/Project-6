const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');


const dataDir = './data';

//Look for data directory. Make it if it's not there
if (fs.existsSync(dataDir) === true){
    console.log('Data file found!');
} else {
    console.log('Data file not found, creating now!');
    fs.mkdirSync(dataDir);
};

request('http://shirts4mike.com/shirts.php', function (error, response, body){
    if(!error){
        var $ = cheerio.load(body);
        let allShirts = $('.products').children();
        for(let i=0; i<allShirts.length; i++){
            let thisShirtQuery = $(allShirts[i]).html().substr(9, 16);
            let thisShirtUrl = `http://shirts4mike.com/${thisShirtQuery}`
            console.log(thisShirtUrl)
            request(thisShirtUrl ,function(error, res, body){
                var thisShirt = cheerio.load(body);
                let price = thisShirt('.shirt-details').children('h1').children('.price').text();
                let title = thisShirt('.shirt-details').children('h1').text().substr(4);
                console.log(price);
                console.log(title);
                
            })
        };
    } else if (error.code === 'ENOTFOUND'){
        console.log('404 Error, File not Found! Check your internet connection!')
    } else {console.log('Unknown Error!')}
})


//price, title, url and image url
//Title, Price, ImageURL, URL, and Time