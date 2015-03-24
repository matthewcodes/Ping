module.exports = function(app, passport, io, message) {
  app.get('/', isAuthenticated, function(req, res){
    if(req.user) {
      res.cookie('user', JSON.stringify(req.user.username));
    }

    res.sendFile(__dirname + '/index.html');
  });

  app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/login.html');
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login_error', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.get('/login_error', function(req, res) {
    res.sendFile(__dirname + '/login_error.html');
  });

  app.post('/login_error', passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login_error', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.get('/signup', function(req, res) {
    res.sendFile(__dirname + '/signup.html');
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/signup_error', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.get('/signup_error', function(req, res) {
    res.sendFile(__dirname + '/signup_error.html');
  });

  app.post('/signup_error', passport.authenticate('local-signup', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/signup_error', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.post('/notifications', function(request, response){
    console.log(request.body);      // your JSON
    response.send(request.body);    // echo the result back
    var messageObject = new message(request.body);
    messageObject.created = new Date();
    io.emit('message', messageObject);

    messageObject.save(function(err){
        console.log('saved, err = ' + err);
    });

  });

  function isAuthenticated (req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/login');
  }
};
