var ConnectRoles = require('connect-roles');

var acl = new ConnectRoles({
  failureHandler: function (req, res, action) {
    res.status(403).send('Access Denied');
  }
});

acl.use('admin', function (req) {
  if (req.user.isAdmin === 1) return true;
});

acl.use('broker', function (req) {
  if (req.user.isBroker === 1) return true;
});

module.exports = acl;
