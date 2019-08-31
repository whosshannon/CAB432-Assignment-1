const express = require('express');
const axios = require('axios');
const logger = require('morgan');
const router = express.Router();
const CONFIG = require("../config.json");

router.use(logger('tiny'));

router.get('/', (req, res) => {
    const query = req.query;
    const options = createTmbdOptions(query['query'], query['year']);

    const url = `https://${options.hostname}${options.path}`;
    
    axios.get(url) 
        .then( (response) => {
            res.writeHead(response.status, {'content-type': 'text/html'});
            return response.data;
        })
        .then ( (rsp) => {
            const htmlResponse = createPageTMDB(query['query'], rsp);
            res.write(htmlResponse);
            res.end();
        })
        .catch((error) => {
            console.error(error);
        })
})

const tmdb = {
    api_key: CONFIG.tmdb_api_key,
    lang: 'en-US',
    include_adult: 'false'
}

function createTmbdOptions(query, year) {
    const options = {
        hostname: 'api.themoviedb.org',
        port: 443,
        path: '/3/search/movie?'
    }
    
    const str = 'api_key=' + tmdb.api_key +
    '&language=' + tmdb.lang +
    '&query=' + query +
    '&year=' + year +
    '&include_adult=' + tmdb.include_adult;
    
    options.path+=str;
    return options;
};

function createPageTMDB(title, rsp) {
    
    let str = '<!DOCTYPE html>' +
    '<html><head><title>TBDM</title></head>' +
    '<body>' +
    '<h1>Search results for: "' + title + '"</h1>';
    for (let counter in rsp.results) {
        const item = rsp.results[counter];

        const itemStr = '</br> <a href="http://127.0.0.1:3000/news?id='
        + item.id +  '"> <div style="background-color:rgb(250, 250, 250);">' +
        '<img src="https://image.tmdb.org/t/p/w600_and_h900_bestv2' + item.poster_path 
        + '" alt= "' + item.id + '" height="200">' 
        +'<p><b>' + item.title + '</b></p><p>Released date: ' + item.release_date + '</p><p>'  
        + item.overview + '</p>'
        + '</div> </a>';

        str+= itemStr;
    }
    str += '</body></html>';

    return str;
}

module.exports = router;