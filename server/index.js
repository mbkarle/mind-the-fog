const express = require('express')
const path = require('path')
const app = express()

app.get('/', (req, res) => res.redirect('/home.html'))

app.use(express.static(path.join(__dirname, '..', 'game')))
app.listen(3000, () => console.log('Example app listening on port 3000!'))
