const express = require('express');
const axios = require('axios');
const logger = require('morgan');
const router = express.Router();
const CONFIG = require("../config.json");

router.use(logger('tiny'));

router.get('/', (req, res) => {
    const query = req.query;
    const options = createTmbdOptions(query['query']);

    const url = `https://${options.hostname}${options.path}`;
    
    axios.get(url) 
        .then( (response) => {
            return response.data;
        })
        .then ( (rsp) => {
            if (rsp.results.length != 0) { //search is valid and successful
                res.status(200).render('search', {query: query['query'], response: rsp.results});
                res.end();
            } else if (query['query']) { //search is valid (exists) but no data to return
                res.status(200).render('error', {error: 'No movies!', details: 'No movies matching the search "' + query['query'] + '"'});
                res.end();
            } else { //search is not valid
                res.status(400).render('error', {error: 'Invalid search', details: 'It looks like you might have an invalid url. Double check that it follows "/search?query=movie%20name" where the name of the movie is url encoded.'});
                res.end();
            }
        })
        .catch((error) => {
            console.error(error);
        })
})

//fixed TMDB request options
const tmdbOptions = {
    api_key: CONFIG.tmbd_api_key,
    lang: 'en-US',
    include_adult: 'false'
}

//compiles options for the request to TMDB
function createTmbdOptions(query) {
    const options = {
        hostname: 'api.themoviedb.org',
        port: 443,
        path: '/3/search/movie?'
    }
    
    const str = 'api_key=' + tmdbOptions.api_key +
    '&language=' + tmdbOptions.lang +
    '&query=' + query +
    '&include_adult=' + tmdbOptions.include_adult;
    
    console.log(str);
    options.path+=str;
    return options;
};

module.exports = router;