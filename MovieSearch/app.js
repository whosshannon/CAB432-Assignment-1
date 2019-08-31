const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const searchRouter = require('./routes/search');
const newsRouter = require('./routes/news');
const testRouter = require('./routes/test');
var path = require('path');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const hostname = '127.0.0.1';
const port = 3000;

app.use(helmet());

app.get('/', (req, res) => {
    //res.writeHead(200,{'content-type': 'text/html'});
    res.render('index');
});

app.use('/search',searchRouter); 
app.use('/news', newsRouter);
app.use('/test', testRouter);

app.listen(port, function () {
    console.log(`Express app listening at http://${hostname}:${port}/`);
});
