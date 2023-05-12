const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use('/node_modules', express.static(__dirname + '/node_modules/'));
app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/view'))

app.engine('ejs', ejsMate)

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/map', catchAsync(async (req, res) => {
    var item = req.query.item;
    var grade = req.query.grade;
    var year = req.query.year;
    res.render('deprecated', {item, grade, year});
}))

app.get('/california', catchAsync(async (req, res) => {
    var item = req.query.item;
    var grade = req.query.grade;
    var year = req.query.year;
    res.render('california', {item, grade, year});
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;	
    if (!err.message) err.message = 'Error!'	
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log("LISTENING ON PORT 3000")
})