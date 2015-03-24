(function(){

  var app = angular.module('Ping');

  app.controller('SidebarController', function($scope) {
    this.socket = io.connect();
    this.channels = [];

    this.channel = {};

    this.addChannel = function() {
      this.socket.emit('channel', this.channel.name);
      this.channel = {};
    };

    this.changeChannel = function(channelName) {
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

      var persistedChannels = [];

      sidebarController.channels = [];
      sidebarController.apply();

      sidebarController.channels.push({name: 'General', current:true});

      channels.forEach(function (channel) {
        if(channel.name != 'General') {
          sidebarController.channels.push(channel);
        }
      });

      sidebarController.apply();

    });

  });

})();
