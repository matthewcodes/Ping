angular.module('pingFilters', []).filter('urlify', function() {
  return function(input) {

    this.urlify = function urlify(text) {
        var urlRegex = /(https?:\/\/[^\s]+)/g;

        if(text) {
          return text.replace(urlRegex, function(url) {

            if(url.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
              return '<img class="scaledImg" src="' + url + '"></img>';
            }

            return '<a href="' + url + '">' + url + '</a>';
          });
        } else {
          return text;
        }
    };

    return urlify(input);

  };
});
