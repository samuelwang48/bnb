'use strict';

const ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/db';

const readline = require('readline');

const Bpmn = require('bpmn-engine');
const EventEmitter = require('events').EventEmitter;
const fs = require('fs');

const listener = new EventEmitter();

let engine;
let cursor = null;
let persistState = (inbound, outbound) => {
  if (inbound) {
    cursor.inbound = inbound;
  }
  if (outbound) {
    cursor.outbound = outbound;
  }
  cursor.state = JSON.stringify(engine.getState());
  MongoClient.connect(url, function(err, db) {
    db.collection('orders')
      .replaceOne({_id: ObjectId(cursor._id)}, cursor)
      .then(function() {
        db.close();
      });
  });
}

let waitInput = (inbound, outbound, cb) => {
  console.log('Available Outbounds', outbound);
  persistState(inbound, outbound);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Please type the outbound name: ', (answer) => {
    cb(answer);
    rl.close();
  });
}

listener.on('enter-received', (task) => {
  console.log('BEGIN\n')
});

listener.on('wait-reviewed', (task, instance) => {
  console.log('Reviewing')
  const inbound = task.inbound[0].sourceId;
  waitInput('received', ['approve', 'reject'], (answer) => {
    let isApproved = new Boolean();
    if (answer === 'approve') {
      isApproved = true;
    }
    if (answer === 'reject') {
      isApproved = false;
    }
    console.log(`isApproved: ${isApproved}`);
    task.signal({
      isApproved: isApproved
    })
  })
});

listener.on('end-reviewed', (task, instance) => {
  console.log('Reviewed')
});

/*
listener.on('enter-isApproved', (task, instance) => {
  console.log('Deciding...')
});
*/

listener.on('wait-paid', (task, instance) => {
  console.log('Paying')
  waitInput('approved', ['pay'], (answer) => {
    task.signal(1);
  })
});

listener.on('end-paid', (task, instance) => {
  console.log('Paid')
});

listener.on('wait-checkedOut', (task, instance) => {
  console.log('Checking out')
  const inbound = task.inbound[0].sourceId;
  waitInput('paid', ['checkout'], (answer) => {
    task.signal(1);
  })
});

listener.on('end-checkedOut', (task) => {
  console.log('Checked Out')
});

listener.on('end-archived', (task) => {
  console.log('Archived')
  persistState('finished', []);
});

listener.on('end-rejected', (task, instance) => {
  console.log('Rejected')
  const inbound = task.inbound[0].targetId;
  persistState('rejected', []);
});

/*
listener.on('wait', (task) => {
  //task.signal(1);
});
*/

listener.on('taken', (flow) => {
  //console.log(JSON.stringify(engine.getState()))
  //console.log(`\nFlow -> State: \t<${flow.activity.id}>, \tPending: <${flow.activity.element.name}>\n`);
  //console.log(`\nFlow -> \t<${flow.id}>, sourceId -> ${flow.targetId}\n`);
});


let main = () => {
  if (cursor.state) {
    engine = Bpmn.Engine.resume(JSON.parse(cursor.state), {
      listener: listener,
    }, (err, instance) => {
      //console.log('pending', instance.getPendingActivities())
      if (err) throw err;
    });
  } else {
    engine = new Bpmn.Engine({
      name: 'Order Process',
      source: fs.readFileSync('./order.bpmn'),
      moddleOptions: {
        camunda: require('camunda-bpmn-moddle/resources/camunda')
      }
    });
    engine.execute({
      listener: listener,
    }, (err, instance) => {
      //console.log('pending', instance.getPendingActivities())
      if (err) throw err;
    });
  }
  engine.once('end', (definition) => {
    console.log(`All tasks executed`);
    persistState();
  });
}


MongoClient.connect(url, function(err, db) {
   db.collection('orders').find().toArray(function(err, orders) {
     let pretty = orders.map((d, i)=>{return `[${i}] ${d._id}`});
     console.log(pretty.join('\n'));
     db.close();
     const rl = readline.createInterface({
       input: process.stdin,
       output: process.stdout
     });
     rl.question('Please select order: ', (i) => {
       cursor = orders[i];
       rl.close();
       main();
     });
   });
});
