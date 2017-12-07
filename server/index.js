const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');
const bodyParser = require('body-parser')

require('./app/dbModule/index.js');

app.use(bodyParser.json({ limit: '10mb' }));
app.use("/client", express.static(path.join(__dirname, './../client')));

const port = process.env.PORT || '3000';
app.set('port', port);

require('./app/routing/routes.js')(app)

server.listen(port, () => console.log(`running on localhost:${port}`));

