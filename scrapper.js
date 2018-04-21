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
        let inventory = new Object();
        let shirtInv = inventory.shirts = [];
        var $ = cheerio.load(body);
        let allShirts = $('.products').children();
        for(let i=0; i<allShirts.length; i++){
            let thisShirtQuery = $(allShirts[i]).html().substr(9, 16);
            let thisShirtUrl = `http://shirts4mike.com/${thisShirtQuery}`
            //console.log(thisShirtUrl)
            request(thisShirtUrl ,function(error, res, body){
                var thisShirt = cheerio.load(body);
                let price = thisShirt('.shirt-details').children('h1').children('.price').text();
                let title = thisShirt('.shirt-details').children('h1').text().substr(4);
                let imgUrl = thisShirt('img').attr('src');
                let thisObj = {"title":title, "price":price, "imgurl":imgUrl, "url":thisShirtUrl}
                
                shirtInv.push(thisObj);
                console.log(shirtInv.length);
                
                if (shirtInv.length === allShirts.length){
                    waitingAround(inventory);
                }
            })
        };
    } else if (error.code === 'ENOTFOUND'){
        console.log('404 Error, File not Found! Check your internet connection!')
    } else {console.log('Unknown Error!')}

})

function waitingAround(data){
    console.log(data);
}


//Title, Price, ImageURL, URL, and Time

/*JSON OBJECT 
let inventory = {
    "shirts":[
        //0 {"title":"hellothere", "price":, "imgurl":"", "url":"", "time":""}
        //1 {"title":"", "price":, "imgurl":"", "url":"", "time":""}
        //2 {"title":"", "price":, "imgurl":"", "url":"", "time":""}
        //3 {"title":"", "price":, "imgurl":"", "url":"", "time":""}
    ]
}
In theory:
inventory.shirts[0].title === "hellothere"


*/