const express = require('express');
const axios = require('axios');
const logger = require('morgan');
const router = express.Router();
const CONFIG = require("../config.json");

router.use(logger('tiny'));

router.get('/', (req, res) => {
    const query = req.query;
    let searchCast=true;

    if (query['searchFor'] == 'cast' || query['searchFor'] == undefined) { //default to 
        searchCast = true;
    } else if (query['searchFor'] == 'production') {
        searchCast = false;
    }

    getDetails(query['id'], searchCast)
        .then( (cast) => {
            if (cast != null) {
                const options = createNewsOptions(cast);

                const url = `https://${options.hostname}${options.path}`;

                axios.get(url)
                .then( (response) => {
                    return response.data;
                })
                .then ( (rsp) => {
                        res.status(200).render('news', {cast: castString(cast), response:rsp.articles})
                        res.end();
                })
                .catch((error) => {
                    console.error(error);
                })
            } else {
                res.status(200).render('error', {error:"No news to show!", details:"Looks like that movie doesn't have any cast/production companies that we can show you."})
            }
        })
})

//returns the top three cast of a given movie
function getDetails(id, searchCast) {
    const options = createTmbdMovieOptions(id, searchCast);
    const url = `https://${options.hostname}${options.path}`;

    let cast = axios.get(url)
        .then( (response) => {
            if (searchCast && response.data.cast.length == 0) {
                return null;
            } else if (!searchCast && response.data.production_companies.length == 0) {
                return null;
            }

            topThreeCast = "";
            for (let i = 0; i < 3; i++) {
                if (searchCast) {
                    topThreeCast+= encodeURIComponent('"' + response.data.cast[i].name + '"OR');
                } else {
                    topThreeCast+= encodeURIComponent('"' + response.data.production_companies[i].name + '"OR');
                }
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
    cast = decodeURIComponent(cast);
    cast = cast.replace("OR", ", ").replace("OR", ", or ");
    cast = cast.replace(/"/g, "");
    return cast;
}

//compiles options for the request to TMDB
function createTmbdMovieOptions(id, searchCast) {
    let options = {
        hostname: 'api.themoviedb.org',
        port: 443,
        path: '/3/movie/'+id+'/credits?'
    }
    if (!searchCast) {
        options.path = '/3/movie/'+id+'?';
    }
    
    const str = 'api_key=' + CONFIG.other_tmbd_api_key; //DEBUG: will only let me use each config item once. otherwise undefined
    
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
    
    const str = 'q='+ cast
    + '&language=' + newsOptions.language
    + '&apiKey=' + newsOptions.api_key;

    console.log(str)
    
    options.path+=str;
    return options;
};

module.exports = router;