const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const tmdbRouter = require('./routes/tmdb');
const newsRouter = require('./routes/news');
const testRouter = require('./routes/test');

const app = express();

const hostname = '127.0.0.1';
const port = 3000;

app.use(helmet());

app.get('/', (req, res) => {
    res.writeHead(200,{'content-type': 'text/html'});

    fs.readFile('index.html', 'utf8', (err, data) => {
        if (err) {
            res.end('Could not find or open file for reading\n');
        } else {
            res.end(data);
        }
    });
});

app.use('/search',tmdbRouter); 
app.use('/news', newsRouter);
app.use('/test', testRouter);

app.listen(port, function () {
    console.log(`Express app listening at http://${hostname}:${port}/`);
});
