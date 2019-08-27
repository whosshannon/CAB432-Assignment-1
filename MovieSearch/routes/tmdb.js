const express = require('express');
const axios = require('axios');
const logger = require('morgan');
const Twit = require('twit');
const router = express.Router();
const CONFIG = require("../config.json");

router.use(logger('tiny'));

router.get('/test/tmdb', (req, res) => {
    const query = req.query;
    const options = createTmbdOptions(query['query']);

    const url = `https://${options.hostname}${options.path}`;
    
    axios.get(url)
        .then( (response) => {
            res.writeHead(response.status, {'content-type': 'text/html'});
            return response.data;
        })
        .then ( (rsp) => {
            const c = createPageTMDB("wahoo", rsp);
            res.write(c);
            res.end();
        })
        .catch((error) => {
            console.error(error);
        })

})

router.get('/test/twitter', (req, res) => {
    const query = req.query;
    const options = createTwitterOptions(query['query'], query['count']);

    T.get('search/tweets', options, function(err, data, response) {
        for (i = 0; i < data.statuses.length; i++) {
            console.log(data.statuses[i].text);
        }
    }) 

    res.write('yeet');
    res.end(); 
})

router.get('/full', (req, res) => {
    const query = req.query;
    const options = createFlickrOptions(query['query'],query['number']);

    const url = `https://${options.hostname}${options.path}`;

    axios.get(url)
        .then( (response) => {
            res.writeHead(response.status, {'content-type': 'text/html'});
            return response.data;
        })
        .then ( (rsp) => {
            const s = createPage('Flickr Photo Search', rsp);
            res.write(s);
            res.end();
        })
        .catch((error) => {
            console.error(error);
        })
})

var T = new Twit({
    consumer_key: CONFIG.twitter_consumer_key,
    consumer_secret: CONFIG.twitter_consumer_secret,
    access_token: CONFIG.twitter_access_token,
    access_token_secret: CONFIG.twitter_access_token_secret,
  })

const tmdb = {
    api_key: CONFIG.tmdb_api_key,
    lang: 'en-US',
    page: '1',
    include_adult: 'false'
}

function createTmbdOptions(query) {
    const options = {
        hostname: 'api.themoviedb.org',
        port: 443,
        path: '/3/search/person?'
    }
    
    const str = 'api_key=' + tmdb.api_key +
    '&language=' + tmdb.lang +
    '&query=' + query +
    '&page=' + tmdb.page +
    '&include_adult=' + tmdb.include_adult;
    
    options.path+=str;
    return options;
};

function createTwitterOptions(query, count) {
    const options = {
         q: query, 
         count: count 
    }
    return options;
}

function createPageTMDB(title, rsp) {
    const results = rsp.total_results;
    console.log("results: " + results);
    console.log();

    let str = '<!DOCTYPE html>' +
        '<html><head><title>TBDM</title></head>' +
        '<body>' +
        '<h1>' + title + '</h1>';
    for (let counter in rsp.results) {
        const item = rsp.results[counter];
        console.log("item " + item + ": " + item.name + " with ID " + item.id);
        console.log();

        const itemStr = '</br> <a href="https://www.themoviedb.org/person/' 
        + item.id + '"> <div style="background-color:rgb(250, 250, 250);">' +
        '<img src="https://image.tmdb.org/t/p/w600_and_h900_bestv2' + item.profile_path 
        + '" alt= "' + item.id + '" height="200">' +
        '<p><b>' + item.name + '</b> known for ' 
        + item.known_for_department + ' with id ' + item.id + '</p>'
        + '</div> </a>';

        str+= itemStr;
    }
    str += '</body></html>';

    return str;
}


module.exports = router;