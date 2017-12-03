const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'dist/assets')));
app.use('/public', express.static(path.join(__dirname, 'public')));
const port = process.env.PORT || '3001';
app.set('port', port);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './dist/index.html'));
});

server.listen(port, () => console.log(`running on localhost:${port}`));

