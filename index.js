const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/view'))

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/aero', (req, res) => {
    res.render('aero')
})

app.listen(3000, () => {
    console.log("LISTENING ON PORT 3000")
})