const express = require('express');
const axios = require('axios');
const logger = require('morgan');
const router = express.Router();
const CONFIG = require("../config.json");

router.use(logger('tiny'));

router.get('/', async (req, res) => {
    const query = req.query;
    
    const cast = await getCast(query['id']);

    const options = createNewsOptions(cast, query['sortBy']);

    const url = `https://${options.hostname}${options.path}`;

    console.log(url);
    
    axios.get(url)
        .then( (response) => {
            res.writeHead(response.status, {'content-type': 'text/html'});
            return response.data;
        })
        .then ( (rsp) => {
            const c = createNewsPage(cast, rsp);
            res.write(c);
            res.end();
        })
        .catch((error) => {
            console.error(error);
        })
})

async function getCast(id) {
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

const newsOptions = {
    api_key: CONFIG.newsapi_key,
    language: "en",
    page_size: 10
}

function createNewsOptions(cast, sortBy) {
    const options = {
        hostname: 'newsapi.org',
        port: 443,
        path: '/v2/everything?'
    }
    
    const str = 'q=' + cast
    + '&pageSize=' + newsOptions.page_size
    + '&language=' + newsOptions.language
    + '&sortBy=' + sortBy
    + '&apiKey=' + newsOptions.api_key;
    
    options.path+=str;
    return options;
};

function createNewsPage(query, rsp) {
    let str = '<!DOCTYPE html>' +
        '<html><head><title>News</title></head>' +
        '<body>' +
        '<h1>Search results for: ' + decodeURI(query) + '</h1>';

    for (let i = 0; i < rsp.articles.length; i++) {
        const item = rsp.articles[i];

        const itemStr = '</br> <a href="' + item.url + '">'
        + '<div style="background-color:rgb(250, 250, 250);">'
        +'<p><b>' + item.title + '</b></p>'
        + '<p>By: ' + item.author + '</p> <p>Published at: ' + item.publishedAt
        + '</p> <p>' + item.description + '</p>'
        + '</div> </a>';

        str+= itemStr;
    }
    str += '</body></html>';

    return str;
}

module.exports = router;