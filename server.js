// Standard Modules for Express Node Js
var express       = require('express');
var path          = require('path');
var bodyParser    = require('body-parser');
var pug           = require('pug');

// Declare App to Express
var app           = express();

// Socket-io Modules
var http          = require('http').Server(app);
var io            = require('socket.io')(http);

//Setup Socket Server
var socket_server = require('./socket_server')(io);

// Declare Port
var port          = 8888;

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Sockets Route
require('./routes/sockets')(io);

// MC-Board Route
require('./routes/mc-board')(app);

// User-Board Route
require('./routes/user-board')(app);

// Listen on port
http.listen(port, function(){
  console.log('server started on port ' + port)
});
