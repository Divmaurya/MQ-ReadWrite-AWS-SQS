
const express = require('express');
const bodyparser = require('body-parser');

const port = process.argv.slice(2)[0];
const app = express();

app.use(bodyparser.json());

app.get('/index', (req, res) => {
    res.send("Welcome to NodeShop Orders.")
})

console.log(`Orders service listening on port ${port}`);
app.listen(port);