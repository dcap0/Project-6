const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const Json2csvTransform = require('json2csv').Transform;

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
        //let inventory = new Object();
        let shirtInv = [];
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
                               
                if (shirtInv.length === allShirts.length){
                    waitingAround(shirtInv);
                }
            })
        };
    } else if (error.code === 'ENOTFOUND'){
        console.log('404 Error, File not Found! Check your internet connection!')
    } else {console.log('Unknown Error!')}

})

function waitingAround(data){
    let today = new Date();
    let filePath = `./data/${today.getDate()}-${today.getMonth()}-${today.getFullYear()}`;
    let jsonData = JSON.stringify(data);
    //console.log(jsonData)
    if (fs.existsSync(filePath+'.json') === false){
        fs.appendFile(filePath+'.json', jsonData, function(err){
        if(err){throw err}
        console.log('Creating JSON file and converting to CSV');
        console.log('File Created!');
    }
    );
    } else {console.log('file already exists');}

    const fields = ['title', 'price', 'imgurl', 'url'];
    const opts = { fields };
    const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };
    
    const input = fs.createReadStream(filePath+'.json', { encoding: 'utf8' });
    const output = fs.createWriteStream(filePath+'.csv', { encoding: 'utf8' });
    const json2csv = new Json2csvTransform(opts, transformOpts);
    
    const processor = input.pipe(json2csv).pipe(output);

    try{
        fs.unlinkSync(filePath+'.json');
    } catch(err){
        console.error(err);
    }
    
}

