module.exports = {

  checkMessageContent : function(io, message, msgText, channel, author) {

    var sendMessage = function(io, message, pingbotMessageText, channel, author) {
      if(pingbotMessageText) {

        var pingbotMessage = new message({
          content: pingbotMessageText,
          author: "PingBot",
          type: "Message",
          channel: channel
        });


        io.emit('message', pingbotMessage);

        pingbotMessage.save(function(err){
            console.log('saved, err = ' + err);
        });
      }
    };

    var pingbotMessageText;

    var greetings = ['ahoy ','hello ','hey ','hi ','hiya ','howdy ','yo '];

    if(msgText.toLowerCase().indexOf("pingbot") > -1) {

        var pingbotIndex = msgText.toLowerCase().indexOf("pingbot");
        var searchQuery = msgText.substring(pingbotIndex+7, msgText.length);

        console.log(searchQuery.length > 5);

        if(searchQuery && searchQuery.length > 5) {

          searchQuery = searchQuery.trim();

          var wolfram = require('wolfram').createClient("4837R7-LGJAX27872");

          sendMessage(io, message, "hmm, let me think...", channel, author);

          wolfram.query(searchQuery, function(err, result) {

            if(err)
            {
              console.log(err);
            }
            console.log("Result: %j", result);

            var sentResponse = false;

            result.forEach(function(result) {
              if(result.title.toLowerCase().indexOf('result') > -1 ||
                 result.title == 'Definitions' ||
                 result.title.indexOf('Latest') > -1 ||
                 result.title.toLowerCase().indexOf('info') > -1 ||
                 result.title.toLowerCase().indexOf('approximation') > -1 ||
                 result.title.toLowerCase().indexOf('members') > -1) {

                 if(pingbotMessageText)
                 {
                   pingbotMessageText = pingbotMessageText + ' ' + result.subpods[0].value;
                 }
                 else
                 {
                   pingbotMessageText = result.subpods[0].value;
                 }
              }
            });

            if(pingbotMessageText) {
              sentResponse = true;
              sendMessage(io, message, pingbotMessageText, channel, author);
            }

            if(result.length === 0 || !sentResponse) {
              pingbotMessageText = "http://lmgtfy.com/?q="+searchQuery;
              sendMessage(io, message, pingbotMessageText, channel, author);
            }

          });
        }

        if(!pingbotMessageText) {
          greetings.forEach(function(greeting) {
            if(msgText.toLowerCase().indexOf(greeting) > -1) {
              pingbotMessageText = greeting+" "+author;
              sendMessage(io, message, pingbotMessageText, channel, author);
            }
            return;
          });
        }

    }
  }

};
