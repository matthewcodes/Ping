var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var message = require('./models/message');
var channel = require('./models/channel');

mongoose.connect('mongodb://localhost/ping', function(err){
  if(err) {
    console.log(err);
  } else {
    console.log('Connected to mongodb!');
  }
});

app.set('port', (process.env.PORT || 3000));
//serve up our static js and css files
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){
    console.log('a user connected');

    message.find({'channel' : 'General'},function (err, messages) {
      if (err) return console.error(err);
        io.to(socket.id).emit('current-channel', 'General');
        io.to(socket.id).emit('initialisation', messages);
    });

    channel.find(function (err, channels) {
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
    });

});


http.listen(app.get('port'), function(){
    console.log('listening on *:' + app.get('port'));
});
