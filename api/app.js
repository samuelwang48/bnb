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

app.use(bodyParser.json({ limit: '5mb' })); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' })); // support encoded bodies

var auth = require('./auth')(app, MongoClient, url);
var helpers = require('./helpers')(MongoClient, url);
var jobs = require('./jobs')(agenda, helpers);
var acl = require('./acl');

app.post('/poke',
  [auth.isLoggedIn, acl.is('admin')],
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(['poked', req.user]));
  });

app.post('/queue/execute',
  [auth.isLoggedIn, acl.is('admin')],
  function (req, res) {
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

app.post('/queue/jobs',
  [auth.isLoggedIn, acl.is('admin')],
  function (req, res) {
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

app.post('/queue/purge',
  [auth.isLoggedIn, acl.is('admin')],
  function (req, res) {
  var data = req.body.data;
  var task_type = data.type;
  agenda.cancel({name: task_type}, function(err, numRemoved) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify([err, numRemoved]));
  });
})

app.post('/queue/create',
  [auth.isLoggedIn, acl.is('admin')],
  function (req, res) {
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
        helpers.updateSchedule([_id], schedule.calendar_months, resolve);
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
  var page = data.page;
  var size = 4;

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
       }).map(function(doc, index) {
         doc.index = index;
         return doc;
       });

       match = match.splice(page * size, size);

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
        helpers.updateHost([_id], doc, resolve);
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

app.delete('/user', function (req, res) {
    var data = req.body;
    // Connect using MongoClient
    MongoClient.connect(url, function(err, db) {
       data.forEach(function(_id) {
         db.collection('users')
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
