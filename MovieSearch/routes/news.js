const express = require('express');
const axios = require('axios');
const logger = require('morgan');
const router = express.Router();
const CONFIG = require("../config.json");

router.use(logger('tiny'));

router.get('/', (req, res) => {
    const query = req.query;
    const options = createNewsOptions(query['query']);

    const url = `https://${options.hostname}${options.path}`;

    console.log(url);
    
    axios.get(url)
        .then( (response) => {
            res.writeHead(response.status, {'content-type': 'text/html'});
            return response.data;
        })
        .then ( (rsp) => {
            // const c = createPageTMDB(query['query'], rsp);
            res.write(JSON.stringify(rsp));
            res.end();
        })
        .catch((error) => {
            console.error(error);
        })
})

const newsOptions = {
    api_key: CONFIG.newsapi_key,
}

function createNewsOptions(query) {
    const options = {
        hostname: 'newsapi.org',
        port: 443,
        path: '/v2/everything?'
    }
    
    const str = 'q=' + query
    + '&apiKey=' + newsOptions.api_key;
    
    options.path+=str;
    return options;
};

module.exports = router;