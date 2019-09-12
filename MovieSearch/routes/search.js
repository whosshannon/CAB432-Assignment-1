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
            return response.data;
        })
        .then ( (rsp) => {
            res.render('search', {query: query['query'], response: rsp.results});
            res.end();
        })
        .catch((error) => {
            console.error(error);
        })
})

const tmdb = {
    api_key: CONFIG.tmbd_api_key,
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

module.exports = router;