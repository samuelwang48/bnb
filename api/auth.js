var cookieParser = require('cookie-parser');
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var OAuth = require('wechat-oauth');
var client = new OAuth(process.env.BNB_WECHAT_APPID, process.env.BNB_WECHAT_SECRET);
var wechatCallbackPath = '/wechat';

module.exports = function(app, MongoClient, url) {

  var whiteList = {
      "http://192.168.0.148:3000": true,
      "http://localhost:3000": true,
      "http://localhost:5000": true,
      "http://cnjpbnb.com": true,
      "http://www.cnjpbnb.com": true,
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
    } else {
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
    },
    maxAge: new Date(Date.now() + 3600000),
    store: new MongoStore({
      url: url,
    }),
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
          delete user.password;
          return done(null, user);
        });
      });
    }
  ));
  
  passport.serializeUser(function(user, done) {
    console.log('serialize user')
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    console.log('deserialize user')
    done(null, user);
  });

  app.get(wechatCallbackPath, function (req, res) {
    var data = req.query;
    var code = data.code;
    var state = data.state;
    var login = function(openid) {
      MongoClient.connect(url, function(err, db) {
        db.collection('users')
          .findOne({openid: openid}, {}, function(err, doc) {
             db.close();
             req.logIn(doc, function(err) {
                return res.redirect(state + '/user/search');
             });
          })
      });
    };

    client.getAccessToken(code, function (err, result) {
      if (err) return;
      var accessToken = result.data.access_token;
      var openid = result.data.openid;

      client.getUser(openid, function (err, result) {
        var userInfo = result;

        MongoClient.connect(url, function(err, db) {
          db.collection('users').findOne({openid: userInfo.openid}, {}, function(err, doc) {
            if (!doc) {
              db.collection('users')
                .insertOne(userInfo)
                .then(function() {
                  db.close();
                  login(userInfo.openid);
                });
            } else {
              db.collection('users')
                .updateOne({openid: userInfo.openid}, {
                  $set: userInfo
                })
                .then(function() {
                  db.close();
                  login(userInfo.openid);
                });
            }
          });
        });

      });

    });
  });

  app.post('/login', function(req, res) {
    var data = req.query;
    if (data.strategy === '' || data.strategy === 'local') {
      passport.authenticate('local', function(err, user) {
        if (err) {
          return res.redirect(req.headers.origin + '/login?auth=0');
        }
        if (!user) {
          return res.redirect(req.headers.origin + '/login?auth=0');
        }
        req.logIn(user, function(err) {
           return res.redirect(req.headers.origin + '/user/search');
        });
      })(req, res);
    } else if (data.strategy === 'wechat') {
      var method = '';
      if (/MicroMessenger/i.test(req.headers['user-agent'])) {
        method = 'getAuthorizeURL';
      } else {
        method = 'getAuthorizeURLForWebsite';
      }
      var url = client[method](
        'http://' + req.headers.host + wechatCallbackPath,
         req.headers.origin,
        'snsapi_login'
      );
      return res.redirect(url);
    }
  });

  app.post('/logout', function(req, res){
    req.logout();
    res.redirect(req.headers.origin + '/login');
  });

  return {
    isLoggedIn: function(req, res, next) {
        // if user is authenticated in the session, carry on
        console.log('logged in or not', req.isAuthenticated())
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.setHeader('Content-Type', 'application/json');
        res.status(401).send(JSON.stringify('please log in first'));
    }
  }
};
