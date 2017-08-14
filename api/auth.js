var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function(app, MongoClient, url) {

  var whiteList = {
      "http://localhost:3000": true,
      "http://localhost:5000": true,
      "https://cnjpbnb.com": true,
      "https://www.cnjpbnb.com": true,
      "https://zh.airbnb.com": true,
  };
  
  var allowCrossDomain = function(req, res, next) {
    if(whiteList[req.headers.origin]){            
      res.header('Access-Control-Allow-Credentials', true);
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers',
                 'Content-Type, Content-Length, X-Requested-With, Origin, Accept');        
      next();
    } 
  };
  app.use(allowCrossDomain);
  app.use(cookieParser());
  app.use(session({
    secret: 'ilovescotchscotchyscotchscotch',
    resave: true,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: false
    }
  })); // session secret
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions

  passport.use(new LocalStrategy(
    function(username, password, done) {
      MongoClient.connect(url, function(err, db) {
        db.collection('users').findOne({
          username: username,
          password: password,
        }, {}, function (err, user) {
          db.close();
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false);
          }
          return done(null, user);
        });
      });
    }
  ));
  
  passport.serializeUser(function(user, done) {
    console.log('serialize user')
    done(null, user.username);
  });
  
  passport.deserializeUser(function(username, done) {
    console.log('deserialize user')
    MongoClient.connect(url, function(err, db) {
      db.collection('users').findOne({
        username: username,
      }, {}, function (err, user) {
        db.close();
        done(err, user);
      });
    });
  });

  app.post('/login', function(req, res) {
    passport.authenticate('local', function(err, user) {
      if (err) {
        return res.redirect(req.headers.origin + '/login?auth=0');
      }
      if (!user) {
        return res.redirect(req.headers.origin + '/login?auth=0');
      }
      req.logIn(user, function(err) {
         return res.redirect(req.headers.origin + '/user/account');
      });
    })(req, res);
  });

  app.post('/logout', function(req, res){
    req.logout();
    res.redirect(req.headers.origin + '/login');
  });

  return {
    isLoggedIn: function(req, res, next) {
        // if user is authenticated in the session, carry on 
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.setHeader('Content-Type', 'application/json');
        res.status(401).send(JSON.stringify('please log in first'));
    }
  }
};
