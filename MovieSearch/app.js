const express = require('express');
const helmet = require('helmet');
const path = require('path');
const searchRouter = require('./routes/search');
const newsRouter = require('./routes/news');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use("/static", express.static(path.join(__dirname, "public")));

const hostname = '127.0.0.1';
const port = 3000;

app.use(helmet());

//serve the 'home page'
app.get('/', (req, res) => {
    res.status(200).render('index');
});

//make available all the other routes
app.use('/search',searchRouter); 
app.use('/news', newsRouter);

//handle 404 errors
app.use(function(req, res) {
    return res.status(404).send('Route '+req.url+' Not found.');
  });

app.listen(port, function () {
    console.log(`Express app listening at http://${hostname}:${port}/`);
});
