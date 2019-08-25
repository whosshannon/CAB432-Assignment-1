const express = require('express');
const axios = require('axios');
const logger = require('morgan');
const router = express.Router();
const CONFIG = require("../config.json");

router.use(logger('tiny'));

router.get('/test', (req, res) => {
    const query = req.query;
    const options = createTmbdOptions(query['query']);

    const url = `https://${options.hostname}${options.path}`;
    
    axios.get(url)
        .then( (response) => {
            res.writeHead(response.status, {'content-type': 'text/html'});
            return response.data;
        })
        .then ( (rsp) => {
            const s = JSON.stringify(rsp);
            res.write(s);
            res.end();
        })
        .catch((error) => {
            console.error(error);
        })

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

router.get('/:query/:number', (req, res) => {
    const options = createFlickrOptions(req.params.query,req.params.number);

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
});

//TODO: make a config file for api keys and whathaveyou


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
        path: '/3/search/multi?'
    }
    
    const str = 'api_key=' + tmdb.api_key +
    '&language=' + tmdb.lang +
    '&query=' + query +
    '&page=' + tmdb.page +
    '&include_adult=' + tmdb.include_adult;
    
    options.path+=str;
    return options;
};

// const flickr = {
//     method: 'flickr.photos.search',
//     api_key: "bb72d05f51ca06cd49676c5b457cfc46",
//     format: "json",
//     media: "photos",
//     nojsoncallback: 1
// };

// function createFlickrOptions(query,number) {
//     const options = {
//         hostname: 'api.flickr.com',
//         port: 443,
//         path: '/services/rest/?',
//         method: 'GET'
//     }

//     const str = 'method=' + flickr.method +
//             '&api_key=' + flickr.api_key +
//             '&tags=' + query +
//             '&per_page=' + number +
//             '&format=' + flickr.format +
//             '&media=' + flickr.media +
//             '&nojsoncallback=' + flickr.nojsoncallback;

//     options.path += str;
//     return options;
// }

function parsePhotoRsp(rsp) {
    let s = "";

    for (let i = 0; i < rsp.photos.photo.length; i++) {
        photo = rsp.photos.photo[i];
        t_url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_t.jpg`;
        p_url = `https://www.flickr.com/photos/${photo.owner}/${photo.id}`;
        s += `<a href="${p_url}"><img alt="${photo.title}" src="${t_url}"/></a>`;
    }

    return s;
}

function createPage(title,rsp) {
    const number = rsp.photos.photo.length;
    const imageString = parsePhotoRsp(rsp);
    //Headers and opening body, then main content and close
    const str = '<!DOCTYPE html>' +
        '<html><head><title>Flickr JSON</title></head>' +
        '<body>' +
        '<h1>' + title + '</h1>' +
        'Total number of entries is: ' + number + '</br>' +
        imageString +
        '</body></html>';
    return str;
}


module.exports = router;