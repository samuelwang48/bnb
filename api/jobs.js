module.exports = function(agenda, helpers) {

  agenda.define('fetch_calendar', function(job, done) {
    if (job.attrs._validity === false) {
      job.fail('invalid schedule');
      done();
    } else {
      helpers.findHostIdByAirbnbPk(job.attrs.data.airbnb_pk, function(ids) {
        helpers.updateSchedule(ids, job.attrs.data.result, function() {
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
      helpers.findHostIdByAirbnbPk(job.attrs.data.airbnb_pk, function(ids) {
        helpers.updateHost(ids, job.attrs.data.result, function() {
          job.disable();
          done();
        })
      });
    }
  });
};
