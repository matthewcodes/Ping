(function(){

  var app = angular.module('Ping');

  app.controller('SidebarController', function($scope) {
    this.socket = io.connect();
    this.channels = [];
    this.onlineUsers = [];

    this.channel = {};

    this.addChannel = function() {
      this.socket.emit('channel', this.channel.name);
      this.channel = {};

      $('#myModal').modal('hide');

    };

    this.changeChannel = function(channelName) {

      this.channels.forEach(function (channel) {
        if(channel.name == channelName) {
          channel.current = true;
        } else {
          channel.current = false;
        }
      });

      this.socket.emit('changeChannel', channelName);
    };

    this.apply = function() {
      $scope.$apply();
    };

    var sidebarController = this;

    this.socket.on('channel', function (chan) {
      chan.current = false;
      sidebarController.channels.push(chan);
      sidebarController.apply();
    });

    this.socket.on('initialisation-channels', function(channels) {

      console.log(channels);

      var persistedChannels = [];

      sidebarController.channels = [];
      sidebarController.apply();

      sidebarController.channels.push({name: 'General', current:true});

      channels.forEach(function (channel) {
        if(channel != 'General') {
          sidebarController.channels.push({name:channel, current:false});
        }
      });

      sidebarController.apply();

    });

    this.socket.on('refresh-users', function(onlineUsers) {
      sidebarController.onlineUsers = onlineUsers;

      console.log(onlineUsers);

      sidebarController.apply();
    });

  });

})();
