const express = require('express');
const axios = require('axios');
const logger = require('morgan');
const router = express.Router();
const CONFIG = require("../config.json");

router.use(logger('tiny'));

router.get('/', (req, res) => {
    const query = req.query;

    getCast(query['id'])
        .then( (cast) => {
            const options = createNewsOptions(cast);

            const url = `https://${options.hostname}${options.path}`;

            axios.get(url)
            .then( (response) => {
                return response.data;
            })
            .then ( (rsp) => {
                res.render('news', {cast: castString(cast), response:rsp.articles})
                res.end();
            })
            .catch((error) => {
                console.error(error);
            })

        })
})

//returns the top three cast of a given movie
function getCast(id) {
    const options = createTmbdMovieOptions(id);
    const url = `https://${options.hostname}${options.path}`;

    let cast = axios.get(url)
        .then( (response) => {
            topThreeCast = "";
            for (let i = 0; i < 3; i++) {
                topThreeCast+= encodeURI('"' + response.data.cast[i].name + '"OR');
            }
            return topThreeCast.slice(0, topThreeCast.length-2);
        })
        .catch((error) => {
            console.error(error);
        })
    return cast;
}

//returns a nicely readable version of the returned cast
function castString(cast) {
    cast = decodeURI(cast);
    cast = cast.replace("OR", ", ").replace("OR", ", or ");
    cast = cast.replace(/"/g, "");
    return cast;
}

//compiles options for the request to TMDB
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

//fixed news request options
const newsOptions = {
    api_key: CONFIG.newsapi_key,
    language: "en"
}

//compiles options for the request to NewsAPI
function createNewsOptions(cast) {
    const options = {
        hostname: 'newsapi.org',
        port: 443,
        path: '/v2/everything?'
    }
    
    const str = 'q=' + cast
    + '&language=' + newsOptions.language
    + '&apiKey=' + newsOptions.api_key;
    
    options.path+=str;
    return options;
};

module.exports = router;