const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');

app.use('/node_modules', express.static(__dirname + '/node_modules/'));
app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/view'))

app.engine('ejs', ejsMate)

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/aero', (req, res) => {
    res.render('aero')
})

app.listen(3000, () => {
    console.log("LISTENING ON PORT 3000")
})