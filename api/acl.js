var ConnectRoles = require('connect-roles');

var acl = new ConnectRoles({
  failureHandler: function (req, res, action) {
    res.status(403).send('Access Denied');
  }
});

acl.use('admin', function (req) {
  return req.user.isAdmin === 1;
});

acl.use('broker', function (req) {
  return req.user.isBroker === 1;
});

acl.use('broker or admin', function (req) {
  return (req.user.isBroker === 1 || req.user.isAdmin === 1);
});

acl.use('himself', function (req) {
  return false;
});

module.exports = acl;
