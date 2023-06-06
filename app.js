const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const flash = require('connect-flash');
const fs = require('fs');
const { validateParameters, validateParametersPost } = require('./middleware');
const session = require('express-session');

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({limit: '10mb', extended: true, parameterLimit: 10000}));
app.use(methodOverride('_method'));
app.use('/node_modules', express.static(__dirname + '/node_modules/'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/view'))

app.engine('ejs', ejsMate)

app.use(express.static(path.join(__dirname, 'public')))
const sessionConfig = {
    name: 'mapsession',
    secret: 'thisisasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 86400000,
        maxAge: 86400000
    }
};
app.use(session(sessionConfig));
app.use(flash());



const sd = []
for (let i = 0; i < 58; i++) {
    sd.push(new Array());
}
var county = -1;
const jsonString = fs.readFileSync("./public/entities.json").toString();
const cmap = new Map(Object.entries(JSON.parse(jsonString)));
// console.log(cmap);
cmap.forEach(function (v, k) {
    county = parseInt(k.substring(0, 2)) - 1;
    sd[county].push(new Array(k, v));
})
global.sdi = sd;
global.names = ['Alameda', 'Alpine', 'Amador', 'Butte'
    , 'Calaveras', 'Colusa', 'Contra Costa', 'Del Norte'
    , 'El Dorado', 'Fresno', 'Glenn', 'Humboldt', 'Imperial'
    , 'Inyo', 'Kern', 'Kings', 'Lake', 'Lassen', 'Los Angeles'
    , 'Madera', 'Marin', 'Mariposa', 'Mendocino', 'Merced'
    , 'Modoc', 'Mono', 'Monterey', 'Napa', 'Nevada', 'Orange'
    , 'Placer', 'Plumas', 'Riverside', 'Sacramento'
    , 'San Benito', 'San Bernardino', 'San Diego'
    , 'San Francisco', 'San Joaquin', 'San Luis Obispo'
    , 'San Mateo', 'Santa Barbara', 'Santa Clara', 'Santa Cruz'
    , 'Shasta', 'Sierra', 'Siskiyou', 'Solano', 'Sonoma'
    , 'Stanislaus', 'Sutter', 'Tehama', 'Trinity', 'Tulare'
    , 'Tuolumne', 'Ventura', 'Yolo', 'Yuba'];
console.log(global.sdi[1]);

app.get('/', (req, res) => {
    console.log("Welcome!");
    res.render('index')
})

app.get('/map', (req, res) => {
    var item = req.query.item;
    var grade = req.query.grade;
    var year = req.query.year;
    res.render('deprecated', { item, grade, year });
})

// app.post('/map', (req, res) => {
//     console.log(req.body);
//     var item = req.body.item;
//     var grade = req.body.grade;
//     var year = req.body.year;
//     res.render('map', { item, grade, year });
// })

app.get('/california', validateParameters, (req, res) => {
    console.log("CA GET");
    var item = 'aero';
    var grade = '5';
    var year = '2019';
    var checkboxStr = 'all';
    var checkedLength = 1125;
    res.render('california', { item, grade, year, checkboxStr, checkedLength, messages: req.flash('error') });
})

app.post('/california', validateParametersPost, (req, res) => {
    console.log("CA POST");
    console.log(req.body);
    var item = req.body.item;
    var grade = req.body.grade;
    var year = req.body.year;
    var checkboxStr = req.body.checkboxStr;
    var checkedLength = req.body.checkedLength;
    res.render('california', { item, grade, year, checkboxStr, checkedLength, messages: req.flash('error') });
})

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