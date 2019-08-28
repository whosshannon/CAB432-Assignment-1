const express = require('express');
const axios = require('axios');
const logger = require('morgan');
const router = express.Router();
const CONFIG = require("../config.json");

router.use(logger('tiny'));

router.get('/', (req, res) => {
    const query = req.query;
    const options = createNewsOptions(query['query'], query['sortBy'], query['pageSize']);

    const url = `https://${options.hostname}${options.path}`;

    console.log(url);
    
    axios.get(url)
        .then( (response) => {
            res.writeHead(response.status, {'content-type': 'text/html'});
            return response.data;
        })
        .then ( (rsp) => {
            const c = createNewsPage(query['query'], rsp);
            res.write(c);
            res.end();
        })
        .catch((error) => {
            console.error(error);
        })
})

const newsOptions = {
    api_key: CONFIG.newsapi_key,
    language: "en"
}

function createNewsOptions(query, sortBy, pageSize) {
    const options = {
        hostname: 'newsapi.org',
        port: 443,
        path: '/v2/everything?'
    }
    
    const str = 'q=' + query
    + '&pageSize=' + newsOptions.page_size
    + '&language=' + newsOptions.language
    + '&sortBy=' + sortBy
    + '&pageSize=' + pageSize
    + '&apiKey=' + newsOptions.api_key;
    
    options.path+=str;
    return options;
};

function createNewsPage(query, rsp) {
    let str = '<!DOCTYPE html>' +
        '<html><head><title>News</title></head>' +
        '<body>' +
        '<h1>Search results for: ' + query + '</h1>';

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