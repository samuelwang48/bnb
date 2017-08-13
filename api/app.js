var express = require('express');
var cors = require('cors')
var airbnb = require('./airapi');
var app = express();
var bodyParser = require('body-parser');
var Agenda = require('agenda');
var R = require('ramda');
var moment = require('moment');
var mm = require('micromatch');
var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/db';
var agendaMongo = 'mongodb://localhost:27017/agenda';
var agenda = new Agenda({db: {address: agendaMongo}});
var session = require('express-session');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


app.use(bodyParser.json({ limit: '5mb' })); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' })); // support encoded bodies

var whiteList = {
    "http://localhost:3000": true,
    "http://localhost:5000": true,
    "https://cnjpbnb.com": true,
    "https://www.cnjpbnb.com": true,
};

var allowCrossDomain = function(req, res, next) {
  if(whiteList[req.headers.origin]){            
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, X-Requested-With, Origin, Accept');        
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

var isLoggedIn = function(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.setHeader('Content-Type', 'application/json');
    res.status(401).send(JSON.stringify('please log in first'));
};

app.post('/poke',
  [isLoggedIn],
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify('poked'));
  });

app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    if (req.isAuthenticated()) {
      res.redirect(req.headers.origin + '/login');
    } else {
      res.redirect(req.headers.origin + '/login');
    }
  });

var findHostIdByAirbnbPk = function(airbnb_pk, callback) {
  MongoClient.connect(url, function(err, db) {
     db.collection('hosts').find({
       airbnb_pk: airbnb_pk
     }).toArray(function(err, docs) {
       var ids = docs.map(function(d) { return d._id; });
       db.close();
       callback(ids);
     });
  });
}

var updateSchedule = function(ids, calendar_months, callback) {
  MongoClient.connect(url, function(err, db) {
     var days = R.pipe(
       R.map(R.prop('days')),
       R.flatten,
       R.map(function(d) {
         d.local_price = d.price.local_price;
         d.local_currency = d.price.local_currency; 
         delete d.price;
         return d;
       })
     )(calendar_months);
     db.collection('hosts').updateMany(
       { _id: {$in: ids.map(function(id) { return ObjectId(id); })} },
       { $set: { 'schedule': days, 'tf': moment().format('M/D HH:mm') } }
     ).then(function() {
       //console.log(JSON.stringify(arguments))
       db.close();
       callback(days);
     })
  });
}

var updateHost = function(ids, doc, callback) {
  MongoClient.connect(url, function(err, db) {
    var updated = {
      list_city: doc.listing.city,
      list_bedrooms: doc.listing.bedrooms,
      list_beds: doc.listing.beds,
      list_bathrooms: doc.listing.bathrooms,
      list_min_nights: doc.listing.min_nights,
      list_person_capacity: doc.listing.person_capacity,
      list_native_currency: doc.listing.native_currency,
      list_price: doc.listing.price,
      list_price_for_extra_person_native: doc.listing.price_for_extra_person_native,
      list_cleaning_fee_native: doc.listing.cleaning_fee_native,
      list_security_deposit_native: doc.listing.security_deposit_native,
      list_primary_host: {
        first_name: doc.listing.primary_host.first_name
      },
      list_check_out_time: doc.listing.check_out_time,
      list_property_type: doc.listing.property_type,
      list_reviews_count: doc.listing.reviews_count,
      list_star_rating: doc.listing.star_rating,
      list_room_type_category: doc.listing.room_type_category,
      list_check_in_time: doc.listing.check_in_time,
      list_check_in_time_ends_at: doc.listing.check_in_time_ends_at,
      list_guest_included: doc.listing.guest_included,
      list_thumbnail_urls: doc.listing.thumbnail_urls,
      list_map_image_url: doc.listing.map_image_url,
      'hf': moment().format('M/D HH:mm'),
    };
    db.collection('hosts')
      .updateMany(
        {_id: {$in: ids.map(function(id) { return ObjectId(id); })}},
        {$set: updated}
      )
      .then(function() {
        db.close();
        callback(updated);
      });
  });
}

agenda.define('fetch_calendar', function(job, done) {
  if (job.attrs._validity === false) {
    job.fail('invalid schedule');
    done();
  } else {
    findHostIdByAirbnbPk(job.attrs.data.airbnb_pk, function(ids) {
      updateSchedule(ids, job.attrs.data.result, function() {
        job.disable();
        done();
      })
    });
  }
});

agenda.define('fetch_host', function(job, done) {
  if (job.attrs._validity === false) {
    job.fail('invalid schedule');
    done();
  } else {
    findHostIdByAirbnbPk(job.attrs.data.airbnb_pk, function(ids) {
      updateHost(ids, job.attrs.data.result, function() {
        job.disable();
        done();
      })
    });
  }
});

app.post('/queue/execute', function (req, res) {
  var data = req.body.data;
  var id = data.id;
  var result = data.result;
  var _validity = data._validity;

  agenda.jobs({_id: ObjectId(id)}, function(err, jobs) {
    job = jobs[0];
    job.attrs._validity = _validity;
    job.attrs.data.result = result;
    job.save();

    job.run(function(err, job) {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify([job, err]));
    })
  });
});

app.post('/queue/jobs', function (req, res) {
  var data = req.body.data;
  var task_type = data.type;
  agenda.jobs({
    name: task_type,
    disabled: {$exists: false}
  }, function(err, jobs) {
    var jobs = jobs.map(function(j) {
      return {
        id: j.attrs._id,
        airbnb_pk: j.attrs.data.airbnb_pk,
      }
    });
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(jobs));
  });
});

app.post('/queue/purge', function (req, res) {
  var data = req.body.data;
  var task_type = data.type;
  agenda.cancel({name: task_type}, function(err, numRemoved) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify([err, numRemoved]));
  });
})

app.post('/queue/create', function (req, res) {
  var data = req.body.data;
  var task_type = data.type;
  var airbnb_pk = data.airbnb_pk;

  var create_jobs = function(airbnb_pk) {
    var promises = airbnb_pk.map(function(pk) {
      return new Promise(function(resolve, reject) {
        var job = agenda.create(task_type, {airbnb_pk: pk});
        job.save(function(err) {
          if (!err) {
            //console.log('Job successfully saved');
            resolve(pk);
          } else {
            reject(pk);
          }
        });
      });
    });

    Promise.all(promises).then(function(results) {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(results));
    });
  }

  if (!airbnb_pk) {
    agenda.cancel({name: task_type}, function(err, numRemoved) {
      MongoClient.connect(url, function(err, db) {
         db.collection('hosts').find().toArray(function(err, docs) {
           airbnb_pk = docs.map(function(d) { return d.airbnb_pk; });
           airbnb_pk = R.pipe(
             R.uniq,
             R.reject(function(x) { return x === ''})
           )(airbnb_pk);
           db.close();
           create_jobs(airbnb_pk);
         });
      });
    });
  } else {
    create_jobs(airbnb_pk);
  }
})

app.post('/ip', function(req, res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(ip));
})

app.post('/schedule', function (req, res) {
  var data = req.body.data;

  var promises = data.map(function(d) {
    var airbnb_pk = d.airbnb_pk;
    var _id = d._id;
    var dt = new Date();
    return new Promise(function(resolve, reject) {
      airbnb.getCalendar(airbnb_pk, {
        currency: 'USD',
        month: dt.getMonth() + 1,
        year: dt.getFullYear(),
        count: 2
      }).then(function(schedule) {
        updateSchedule([_id], schedule.calendar_months, resolve);
      }, function() {
        resolve({airbnb_pk: airbnb_pk, error: 'airbnb not found'});
      });
    });
  });

  Promise.all(promises).then(function(results) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(results));
  });

})

app.get('/search', function(req, res) {
  var match = [];
  var data = req.query;
  var numberOfGuests = data.numberOfGuests || 0;
  var city = data.city ? ['*' + data.city.toLowerCase() + '*'] : ['*', ''];
  var startDate = data.startDate;
  var endDate = data.endDate;

  var d0 = moment(startDate);
  var d1 = moment(endDate);
  var delta = d1.diff(d0, 'days');

  if (delta <= 0) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify([]));
    return;
  }

  console.log('delta', delta);

  MongoClient.connect(url, function(err, db) {
     db.collection('hosts').find().toArray(function(err, docs) {
       match = getHostsWithSchedule(
         docs,
         startDate,
         endDate
       );

       match = match.filter(function(doc) {
         return R.filter(R.propEq('available', false))(doc.availability).length === 0
             &&
             (
                  mm([(doc.city || '').toLowerCase()], city).length > 0
               || mm([(doc.list_city || '').toLowerCase()], city).length > 0
             )
             && numberOfGuests <= doc.list_person_capacity
       });

       res.setHeader('Content-Type', 'application/json');
       res.send(JSON.stringify(match));
       db.close();
     });
  });
  // numberOfGuests <= list_person_capacity
  // date between start and end
  // city ~= city
});

getHostsWithSchedule = function(docs, startDate, endDate) {
  var match = [];
  docs.forEach(function(doc) {
    var days = doc.schedule;
    if (days) {
      var d0 = moment(startDate);
      var d1 = moment(endDate);
      var delta = d1.diff(d0, 'days');
      var availability = [];
  
      for (var i=0; i<delta; i++) {
         var d = d0.format('YYYY-MM-DD');
         var avail = R.pipe(
           R.find(R.propEq('date', d))
         )(days);

         availability.push(avail || {});
  
         d0.add(1, 'days');
      }
  
      delete doc.schedule;
      doc.availability = availability;
      match.push(doc);
    } else {
      delete doc.schedule;
      doc.availability = [];
      match.push(doc);
    }
  });
  return match;
}

app.get('/filter', function(req, res) {
  var match = [];
  MongoClient.connect(url, function(err, db) {
     db.collection('hosts').find().toArray(function(err, docs) {
       match = getHostsWithSchedule(
         docs,
         req.query.scheduleStartDate,
         req.query.scheduleEndDate
       );
       res.setHeader('Content-Type', 'application/json');
       res.send(JSON.stringify(match));
       db.close();
     });
  });
})

app.get('/', function (req, res) {
  airbnb.search({
   location: '大阪',
   checkin: '06/03/2017',
   checkout: '06/06/2017',
   guests: 2,
   page: 5000,
  }).then(function(searchResults) {
    console.log(searchResults);
    res.send(searchResults)
  });
})

app.post('/fetch', function (req, res) {
  var data = req.body.data;

  var promises = data.map(function(d) {
    var airbnb_pk = d.airbnb_pk;
    var _id = d._id;
    return new Promise(function(resolve, reject) {
      airbnb.getInfo(airbnb_pk).then(function(doc) {
        updateHost([_id], doc, resolve);
      }, function() {
        resolve({airbnb_pk: airbnb_pk, error: 'airbnb not found'});
      });
    });
  });

  Promise.all(promises).then(function(results) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(results));
  });
})

app.get('/host', function (req, res) {
    // Connect using MongoClient
    MongoClient.connect(url, function(err, db) {
       db.collection('hosts').find().toArray(function(err, docs) {
         docs.forEach(function(d) { delete d.schedule; });
         res.setHeader('Content-Type', 'application/json');
         res.send(JSON.stringify(docs));
         db.close();
       });
    });
})

app.get('/host/:id', function (req, res) {
    var _id = req.params.id;
    // Connect using MongoClient
    MongoClient.connect(url, function(err, db) {
       db.collection('hosts').findOne({_id: ObjectId(_id)}, {}, function(err, doc) {
         res.setHeader('Content-Type', 'application/json');
         res.send(JSON.stringify(doc));
         db.close();
       });
    });
})

app.post('/host', function (req, res) {
    var data = req.body.data;
    // Connect using MongoClient
    MongoClient.connect(url, function(err, db) {
       data.forEach(function(d) {
           var _id = d._id;
           if (_id) {
               delete d._id;
               db.collection('hosts')
                 .replaceOne({_id: ObjectId(_id)}, d)
                 .then(function() {
                   db.close();
                 });
           } else {
               db.collection('hosts')
                 .insertOne(d)
                 .then(function() {
                   db.close();
                 });
           }
       })
       res.setHeader('Content-Type', 'application/json');
       res.send(JSON.stringify(data));
    });
})

app.delete('/host', function (req, res) {
    var data = req.body;
    // Connect using MongoClient
    MongoClient.connect(url, function(err, db) {
       data.forEach(function(_id) {
         db.collection('hosts')
           .deleteOne({_id: ObjectId(_id)})
           .then(function() {
             db.close();
             res.setHeader('Content-Type', 'application/json');
             res.send(JSON.stringify(arguments));
           });
       })
    });
})

app.get('/currency',  function (req, res) {
    MongoClient.connect(url, function(err, db) {
      db.collection('currency').find().toArray(function(err, rates) {
        if (rates.length === 1) {
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(rates));
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify([{
            usd2jpy: -1,
            usd2cny: -1,
          }]));
        }
        db.close();
      });
    });
})

app.post('/currency', function (req, res) {
    var data = req.body.data;
    var _db;
    var insertOne = function() {
      _db.collection('currency')
        .insertOne(data.currency)
        .then(function(err, r) {
           res.setHeader('Content-Type', 'application/json');
           res.send(JSON.stringify(data));
           db.close();
        });
    };

    MongoClient.connect(url, function(err, db) {
       _db = db;
       db.collection('currency').find().toArray(function(err, rates) {
         if (rates.length === 0 && data.currency) {
            insertOne();
         } else {
            db.collection('currency').drop(insertOne);
         }
       });
    });
})

app.post('/request', function (req, res) {
    var data = req.body.data;
    if (!Array.isArray(data)) {
        data = [data];
    }
    console.log(111, data);
    // Connect using MongoClient
    MongoClient.connect(url, function(err, db) {
       data.forEach(function(d) {
          db.collection('requests')
            .insertOne(d)
            .then(function() {
              db.close();
            });
       })
       res.setHeader('Content-Type', 'application/json');
       res.send(JSON.stringify(data));
    });
})

app.get('/request', function (req, res) {
    // Connect using MongoClient
    MongoClient.connect(url, function(err, db) {
       db.collection('requests').find().toArray(function(err, docs) {
         res.setHeader('Content-Type', 'application/json');
         res.send(JSON.stringify(docs));
         db.close();
       });
    });
})

app.post('/book', function (req, res) {
    var data = req.body.data;
    if (!Array.isArray(data)) {
        data = [data];
    }
    console.log(111, data);
    // Connect using MongoClient
    MongoClient.connect(url, function(err, db) {
       data.forEach(function(d) {
          db.collection('orders')
            .insertOne(d)
            .then(function() {
              db.close();
            });
       })
       res.setHeader('Content-Type', 'application/json');
       res.send(JSON.stringify(data));
    });
})

app.get('/order', function (req, res) {
    // Connect using MongoClient
    MongoClient.connect(url, function(err, db) {
       db.collection('orders').find().toArray(function(err, docs) {
         res.setHeader('Content-Type', 'application/json');
         res.send(JSON.stringify(docs));
         db.close();
       });
    });
})

app.get('/user', function (req, res) {
    // Connect using MongoClient
    MongoClient.connect(url, function(err, db) {
       db.collection('users').find().toArray(function(err, docs) {
         res.setHeader('Content-Type', 'application/json');
         res.send(JSON.stringify(docs));
         db.close();
       });
    });
})

app.post('/user', function (req, res) {
    var data = req.body.data;
    // Connect using MongoClient
    MongoClient.connect(url, function(err, db) {
       data.forEach(function(d) {
           var _id = d._id;
           if (_id) {
               delete d._id;
               db.collection('users')
                 .replaceOne({_id: ObjectId(_id)}, d)
                 .then(function() {
                   db.close();
                 });
           } else {
               db.collection('users')
                 .insertOne(d)
                 .then(function() {
                   db.close();
                 });
           }
       })
       res.setHeader('Content-Type', 'application/json');
       res.send(JSON.stringify(data));
    });
})

app.listen(8000, function () {
  console.log('Example app listening on port 8000!')
})
