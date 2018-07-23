const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const Raven = require('raven');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const config = require ('./conf/conf.js')
var creds = '';
const redis = require('redis');
var client = '';
const port = process.env.PORT || 8080;

Raven.config(process.env.dsn).install();
app.use(Raven.errorHandler());

// Express Middleware for serving static
// files and parsing the request body
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(Raven.requestHandler());
// Start the Server
http.listen(port, function() {
	console.log('Server Started. Listening on *:' + port);
});

// Store people in chatroom
var chatters = [];
// Store messages in chatroom
var chat_messages = [];

// Read credentials from JSON
fs.readFile('creds.json', 'utf-8', function(err, data) {
	if(err) throw err;
	creds = JSON.parse(data);
	client = redis.createClient('redis://' + creds.user + ':' + creds.password + '@' + creds.host + ':' + creds.port);
	// Redis Client Ready
	client.once('ready', function() {
			// Flush Redis DB
			// client.flushdb();
			// Initialize Chatters
		client.get('chat_users', function(err, reply) {
			if (reply) {
					chatters = JSON.parse(reply);
				}
			});
			// Initialize Messages
			client.get('chat_app_messages', function(err, reply) {
				if (reply) {
					chat_messages = JSON.parse(reply);
				}
			});
		});
});

// Render Main HTML file
app.get('/', function (req, res) {
	res.sendFile('views/index.html', {
		root: __dirname
	});
});

// API - Join Chat
app.post('/join', function(req, res) {
	var username = req.body.username;
	if (chatters.indexOf(username) === -1) {
		chatters.push(username);
		client.set('chat_users', JSON.stringify(chatters));
		res.send({
			'chatters': chatters,
			'status': 'OK'
		});
	} else {
		res.send({
			'status': 'FAILED'
		});
	}
});

// API - Leave Chat
app.post('/leave', function(req, res) {
	var username = req.body.username;
	chatters.splice(chatters.indexOf(username), 1);
	client.set('chat_users', JSON.stringify(chatters));
	res.send({
		'status': 'OK'
	});
});

// API - Send + Store Message
app.post('/send_message', function(req, res) {
	var username = req.body.username;
	var message = req.body.message;
	chat_messages.push({
		'sender': username,
		'message': message
	});
	client.set('chat_app_messages', JSON.stringify(chat_messages));
	res.send({
		'status': 'OK'
	});
});

// API - Get Messages
app.get('/get_messages', function(req, res) {
	res.send(chat_messages);
});

// API - Get Chatters
app.get('/get_chatters', function(req, res) {
	res.send(chatters);
});

app.get('*', function(req, res) {
	Raven.captureException("ERR");
	res.send("ERROR: 404 NOT FOUND");
});

// Socket Connection
// UI Stuff
io.on('connection', function(socket) {
	// Fire 'send' event for updating Message list in UI
	socket.on('message', function(data) {
		io.emit('send', data);
	});
	// Fire 'count_chatters' for updating Chatter Count in UI
	socket.on('update_chatter_count', function(data) {
		io.emit('count_chatters', data);
	});
});
