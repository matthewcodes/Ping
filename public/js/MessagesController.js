(function(){

  var app = angular.module('Ping');

  app.controller('MessagesController', ['$cookies', '$scope', function($cookies, $scope) {
    this.socket = io.connect();
    this.messages = [];
    this.currentChannel = 'General';

    this.message = {};

    this.addMessage = function() {
      this.message.channel = this.currentChannel;
      this.message.author = this.getUser();
      this.socket.emit('message', this.message);
      this.message = {};
    };

    this.apply = function() {
      $scope.$apply();
    };

    this.getUser = function() {
      var userCookie = $cookies['user'];
      userCookie = userCookie.replace(/"/g, "");
      return userCookie;
    };

    var messagesController = this;

    this.socket.on('message', function (msg) {
      console.log(msg);
      messagesController.messages.push(msg);
      messagesController.apply();
    });

    this.socket.on('initialisation', function(messages) {
      messagesController.socket.emit('user-connect', messagesController.getUser());

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

  }]);

})();
