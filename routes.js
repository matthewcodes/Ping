module.exports = function(app, passport) {
  app.get('/', isAuthenticated, function(req, res){
    res.sendFile(__dirname + '/index.html');
  });

  app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/login.html');
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.get('/signup', function(req, res) {
    res.sendFile(__dirname + '/signup.html');
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  function isAuthenticated (req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/login');
  }
};
