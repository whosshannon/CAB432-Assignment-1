const express = require('express');
const flickrRouter = require('./routes/flickr');
const helmet = require('helmet');

const app = express();

const hostname = '127.0.0.1';
const port = 3000;

app.use(helmet());

app.get('/', (req, res) => {
    const str = '<!DOCTYPE html>' +
    '<html><head><title>Flickr Demo</title></head>' +
    '<body>' +
    '<h1>' + 'The Flickr API Demo' + '</h1>' +
    'Usage: http://localhost:3000/search/query/number <br>' +
    '<ul>' + '<li>query - corresponds to Flickr tags</li>'
    + '<li>number - max number of results returned</li>'
    + '<li>Example: <a href="http://localhost:3000/search/golden-retriever/100">http://localhost:3000/search/golden-retriever/100</a></li>' +
    '</ul>' +
    '</body></html>';

    res.writeHead(200,{'content-type': 'text/html'});
    res.write(str);
    res.end();
});

app.use('/search',flickrRouter); 

app.listen(port, function () {
    console.log(`Express app listening at http://${hostname}:${port}/`);
});
