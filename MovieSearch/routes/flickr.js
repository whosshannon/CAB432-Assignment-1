const express = require('express');
const axios = require('axios');
const logger = require('morgan');
const router = express.Router();

router.use(logger('tiny'));

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

const flickr = {
    method: 'flickr.photos.search',
    api_key: "acf9768ff287f329da45f722ab560cd0",
    format: "json",
    media: "photos",
    nojsoncallback: 1
};

function createFlickrOptions(query,number) {
    const options = {
        hostname: 'api.flickr.com',
        port: 443,
        path: '/services/rest/?',
        method: 'GET'
    }

    const str = 'method=' + flickr.method +
            '&api_key=' + flickr.api_key +
            '&tags=' + query +
            '&per_page=' + number +
            '&format=' + flickr.format +
            '&media=' + flickr.media +
            '&nojsoncallback=' + flickr.nojsoncallback;

    options.path += str;
    return options;
}

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