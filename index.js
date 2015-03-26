var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var message = require('./models/message');
var channel = require('./models/channel');
var passport = require('passport');
var flash    = require('connect-flash');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var expressSession = require('express-session');
var pingbot = require('./pingbot');

var dbConfig = require('./config/db.js');
mongoose.connect(dbConfig.url, function(err){
  if(err) {
    console.log(err);
  } else {
    console.log('Connected to mongodb!');
  }
});

require('./passport/config')(passport); // pass passport for configuration

app.set('port', (process.env.PORT || 3000));
//serve up our static js and css files
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.use(express.static(__dirname + '/app'));
app.use(express.static(__dirname + '/assets'));

// Configuring Passport
app.use(expressSession({secret: 'mySecretKey',resave: true,saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./routes/routes.js')(app, passport, io, message);

var onlineUsers = [];

io.on('connection', function(socket){
    console.log('a user connected');

    message.find({'channel' : 'General'},function (err, messages) {
      if (err) return console.error(err);
        io.to(socket.id).emit('current-channel', 'General');
        io.to(socket.id).emit('initialisation', messages);
    });

    channel.distinct('name', function (err, channels) {
      if (err) return console.error(err);
        console.log(channels);
        io.to(socket.id).emit('initialisation-channels', channels);
    });

    socket.on('changeChannel', function(channelName) {

      console.log('Change Channel '+channelName);

      message.find({'channel' : channelName},function (err, messages) {
        if (err) return console.error(err);
          console.log('fetching messages for '+channelName);
          io.to(socket.id).emit('current-channel', channelName);
          io.to(socket.id).emit('initialisation', messages);
      });
    });

    socket.on('disconnect', function(){
        console.log('user disconnected, sid:' + socket.id);

        for (var i = 0; i < onlineUsers.length; i++) {
          console.log('Checking user:' + JSON.stringify(onlineUsers[i]));
          if (onlineUsers[i].sid == socket.id) {
            onlineUsers.splice(i, 1);
          }
        }

        io.emit('refresh-users', onlineUsers);

        console.log('users:' + JSON.stringify(onlineUsers));
    });

    socket.on('channel', function(channelName){
        console.log('new channel: ' + channelName);

        var newChannel = new channel({
          name: channelName
        });

        console.log('saving channel: ' + newChannel);

        newChannel.save(function(err){
            console.log('saved, err = ' + err);
        });

        io.emit('channel', newChannel);
    });

    socket.on('message', function(msg){
        console.log('message: ' + msg);

        var newMsg = new message({
          content: msg.content,
          author: msg.author,
          type: "Message",
          channel: msg.channel
        });

        console.log('saving newMsg: ' + newMsg);

        newMsg.save(function(err){
            console.log('saved, err = ' + err);
        });

        io.emit('message', newMsg);

        pingbot.checkMessageContent(io, message, newMsg.content, newMsg.channel, newMsg.author);
    });

    socket.on('user-connect', function(username){
        console.log('user connected: ' + username);

        var userAlreadyHere = false;
        for (var i = 0; i < onlineUsers.length; i++) {
          console.log('Checking user:' + JSON.stringify(onlineUsers[i]));
          if (onlineUsers[i].sid == socket.id || onlineUsers[i].username == username) {
            userAlreadyHere = true;
          }
        }

        if(!userAlreadyHere) {
          onlineUsers.push({"username": username, "sid": socket.id});
          console.log('users:' + JSON.stringify(onlineUsers));
        }

        io.emit('refresh-users', onlineUsers);
    });

});

http.listen(app.get('port'), function(){
    console.log('listening on *:' + app.get('port'));
});
