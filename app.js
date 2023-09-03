const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const flash = require('connect-flash');
const fs = require('fs');
const { validateParameters, validateParametersPost, uploadSuccess } = require('./middleware');
const { getAverage, getRange } = require('./helper');
const session = require('express-session');
const multer  = require('multer')
const storage = multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null, path.join(__dirname, './uploads'));
    },
    filename: function (req, file, callback) {
      callback(null, file.fieldname + '-' + Date.now());
    }
  });
const upload = multer({storage});
const {PythonShell} = require("python-shell");

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

const sd = [];
const latlon = [];
for (let i = 0; i < 58; i++) {
    sd.push(new Array());
    latlon.push(new Array());
}
var county = -1;
const jsonString = fs.readFileSync("./public/entities.json").toString();
const customString = fs.readFileSync("./public/custom.json").toString();
const cmap = new Map(Object.entries(JSON.parse(jsonString)));
const mmap = new Map(Object.entries(JSON.parse(customString)));
console.log(mmap.get('insurance'));
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
// console.log(global.sdi[1]);
global.custom_map = mmap;

const latlonString = fs.readFileSync("./public/latlon.json").toString();
const lmap = new Map(Object.entries(JSON.parse(latlonString)));

var parsed = [];
var lat = 0.0;
var lon = 0.0;
lmap.forEach(function (v, k) {
    parsed = v.split(',');
    county = parseInt(k) - 1;
    lat = parseFloat(parsed[0]);
    lon = parseFloat(parsed[1]);
    latlon[county].push(lat);
    latlon[county].push(lon);
})
// console.log(latlon[0]);

app.get('/', (req, res) => {
    console.log("Welcome!");
    const page_name = 'index';
    res.render('index', {page_name})
})

app.get('/map', (req, res) => {
    var item = req.query.item;
    var grade = req.query.grade;
    var year = req.query.year;
    const page_name = 'deprecated';
    res.render('deprecated', { item, grade, year, page_name });
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
    var mapLat = 37.1661;
    var mapLon = -119.4494;
    var zoom = 7;
    const page_name = 'california';
    res.render('california', { item, grade, year, checkboxStr, checkedLength, mapLat, mapLon, zoom, messages: req.flash('error'), page_name });
})

app.post('/california', validateParametersPost, (req, res) => {
    console.log("CA POST");
    var item = req.body.item;
    var grade = req.body.grade;
    var year = req.body.year;
    var checkboxStr = req.body.checkboxStr;
    var checkedLength = req.body.checkedLength;
    console.log(checkedLength);
    var mapLat = 37.1661;
    var mapLon = -119.4494;
    var zoom = 7;
    const page_name = 'california';
    if (checkboxStr != 'all') {
        var cts = new Set();
        var c = 0;
        for (var i=0; i<checkboxStr.length; i+=15) {
            c = parseInt(checkboxStr.substring(i, i+2)) - 1;
            cts.add(c);
        }
        cts = Array.from(cts);
        if (cts.length == 1) {
            mapLat = latlon[cts[0]][0];
            mapLon = latlon[cts[0]][1];
            zoom = 10;
        }
        else {
            // console.log(cts);
            lats = [];
            lons = [];
            for (var i=0; i<cts.length; i++) {
                lats.push(latlon[cts[i]][0]);
                lons.push(latlon[cts[i]][1]);
            }
            mapLat = getAverage(lats);
            mapLon = getAverage(lons);
            // console.log(typeof lats[0]);
            var range = [getRange(lats), getRange(lons)];
            zoom = Math.round(10.0 - Math.sqrt(Math.max.apply(null, range)));
            if (zoom < 7) {
                zoom = 7;
            }
            console.log(zoom);
        }
    }
    res.render('california', { item, grade, year, checkboxStr, checkedLength, mapLat, mapLon, zoom, messages: req.flash('error'), page_name });
})

app.get('/custom', validateParameters, (req, res) => {
    console.log("CUSTOM GET");
    var item = 'insurance';
    var checkboxStr = 'all';
    var checkedLength = 1125;
    var mapLat = 37.1661;
    var mapLon = -119.4494;
    var zoom = 7;
    const page_name = 'custom';
    res.render('custom', { item, checkboxStr, checkedLength, mapLat, mapLon, zoom, messages: req.flash('error'), page_name });
})

app.post('/custom', validateParametersPost, (req, res) => {
    console.log("CUSTOM POST");
    var item = req.body.item;
    var checkboxStr = req.body.checkboxStr;
    var checkedLength = req.body.checkedLength;
    console.log(checkedLength);
    var mapLat = 37.1661;
    var mapLon = -119.4494;
    var zoom = 7;
    const page_name = 'custom';
    if (checkboxStr != 'all') {
        var cts = new Set();
        var c = 0;
        for (var i=0; i<checkboxStr.length; i+=15) {
            c = parseInt(checkboxStr.substring(i, i+2)) - 1;
            cts.add(c);
        }
        cts = Array.from(cts);
        if (cts.length == 1) {
            mapLat = latlon[cts[0]][0];
            mapLon = latlon[cts[0]][1];
            zoom = 10;
        }
        else {
            // console.log(cts);
            lats = [];
            lons = [];
            for (var i=0; i<cts.length; i++) {
                lats.push(latlon[cts[i]][0]);
                lons.push(latlon[cts[i]][1]);
            }
            mapLat = getAverage(lats);
            mapLon = getAverage(lons);
            // console.log(typeof lats[0]);
            var range = [getRange(lats), getRange(lons)];
            zoom = Math.round(10.0 - Math.sqrt(Math.max.apply(null, range)));
            if (zoom < 7) {
                zoom = 7;
            }
            console.log(zoom);
        }
    }
    res.render('custom', { item, checkboxStr, checkedLength, mapLat, mapLon, zoom, messages: req.flash('error'), page_name });
})

app.get('/upload', (req, res) => {
    const page_name = 'upload';
    res.render('upload', {page_name, messages: req.flash('success')});
})

app.post('/upload', upload.single('dataSet'), uploadSuccess, (req, res) => {
    const py = new PythonShell('./script.py');
    py.on('message', function (message) {
        console.log(message);
    });

    py.send(req.file.path);
    py.send(req.body.mapName);
    
    py.end(function (err) {
        if (err){
            throw err;
        };
        console.log('finished');
    });
    const page_name = 'upload';
    res.render('upload', {page_name, messages: req.flash('success')});
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    const page_name = 'err';
    if (!err.message) err.message = 'Error!'
    res.status(statusCode).render('error', { err, page_name })
})

app.listen(3000, () => {
    console.log("LISTENING ON PORT 3000")
})