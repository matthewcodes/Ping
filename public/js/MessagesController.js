(function(){

  var app = angular.module('Ping');

  app.controller('MessagesController', function($scope) {
    this.socket = io.connect();
    this.messages = [];
    this.currentChannel = 'General';

    this.message = {};

    this.addMessage = function() {
      this.message.channel = this.currentChannel;
      this.socket.emit('message', this.message.content);
      this.message = {};
    };

    this.apply = function() {
      $scope.$apply();
    };

    var messagesController = this;

    this.socket.on('message', function (msg) {
      messagesController.messages.push(msg);
      messagesController.apply();
    });

    this.socket.on('initialisation', function(messages) {

      var persistedMessages = [];

      messagesController.messages = [];
      messagesController.apply();

      messages.forEach(function (message) {
        messagesController.messages.push(message);
      });

      messagesController.apply();

    });

    this.socket.on('current-channel', function(currentChannel) {
      messagesController.currentChannel = currentChannel;
    });

  });

})();
