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

router.get('/movie', (req, res) => {
    const query = req.query;
    const options = createTmbdMovieOptions(query['id']);
    
    const url = `https://${options.hostname}${options.path}`;

    axios.get(url)
        .then( (response) => {
            res.writeHead(response.status, {'content-type': 'text/html'});
            return response.data;
        })
        .then ( (rsp) => {
            const htmlResponse = createPageMovie(query['id'], rsp);
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

function createTmbdMovieOptions(id) {
    const options = {
        hostname: 'api.themoviedb.org',
        port: 443,
        path: '/3/movie/'+id+'/credits?'
    }
    
    const str = 'api_key=' + CONFIG.other_tmbd_api_key; //TODO: figure out why the hell it wont let me use the one?? like nothing happened to the first one???
    
    options.path+=str;
    return options;
};

//TODO: convert into React
function createPageTMDB(title, rsp) {
    const results = rsp.total_results;
    console.log("results: " + results);
    console.log();

    let str = '<!DOCTYPE html>' +
        '<html><head><title>TBDM</title></head>' +
        '<body>' +
        '<h1>Search results for: "' + title + '"</h1>';
    for (let counter in rsp.results) {
        const item = rsp.results[counter];

        const itemStr = '</br> <a href="http://127.0.0.1:3000/search/movie?id=' //DEBUG: not actually debug, just for development
        + item.id+  '"> <div style="background-color:rgb(250, 250, 250);">' +
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

function createPageMovie(id, rsp) {

    let str = '<!DOCTYPE html>' +
        '<html><head><title>TBDM</title></head>' +
        '<body>' +
        '<h1>Search results for movie id: "' + id + '"</h1>';
    for (let i = 0; i < rsp.cast.length; i++) {
        const item = rsp.cast[i];

        const itemStr = '</br> <div style="background-color:rgb(250, 250, 250);">'
        +'<p><b>' + item.name + '</b> plays ' + item.character + '</p>'
        + '</div>';

        str+= itemStr;
    }
    str += '</body></html>';

    return str;
}

module.exports = router;