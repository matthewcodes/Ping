var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var message = require('./models/message');

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

    message.find(function (err, messages) {
      if (err) return console.error(err);
        io.to(socket.id).emit('initialisation', messages);
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('message', function(msg){
        console.log('message: ' + msg);

        var newMsg = new message({
          content: msg,
          author: "Anonymous",
          type: "Message"
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
