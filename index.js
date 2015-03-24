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

mongoose.connect('mongodb://localhost/ping', function(err){
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
app.use(express.static(__dirname + '/public'));

// Configuring Passport
app.use(expressSession({secret: 'mySecretKey',resave: true,saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./routes.js')(app, passport);

io.on('connection', function(socket){
    console.log('a user connected');

    message.find({'channel' : 'General'},function (err, messages) {
      if (err) return console.error(err);
        io.to(socket.id).emit('current-channel', 'General');
        io.to(socket.id).emit('initialisation', messages);
    });

    channel.distinct('name', function (err, channels) {
      if (err) return console.error(err);
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
        console.log('user disconnected');
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
          author: "Anonymous",
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

});


http.listen(app.get('port'), function(){
    console.log('listening on *:' + app.get('port'));
});
