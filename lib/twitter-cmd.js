// designed for use with single user twitter streams

exports = module.exports = TwitterCmd;
var WS_REGEX = /\s+/;


function TwitterCmd (T, options) {
  var self = this;

  options = options || {};
  this.T = T;
  this.streamOptions = options.streamOptions || {};
  this.key = options.key || null;
  this.users = []; // users allowed to issue commands
  this.allowAll = options.allowAll || false;
  this.allCommands = [];
  
  this.commands = {
    echo: function (user) {
      var args = Array.prototype.slice.apply(arguments);
      var msg = args.slice(1).join(' ');
      self.message(user, msg);
    }
  };
  
  this.stream = T.stream('user', this.streamOptions);

  this.stream.on('direct_message', function (data) {
    var name = data.direct_message.sender.screen_name;
    var text = data.direct_message.text;
    var user = self.getUser(name);
    var args = text.split(WS_REGEX);

    if (self.key) {
      if (args[0] != self.key) return;
      args.shift();
    }

    var command = args.shift();

    if (self.commands[command]) {
      if (user && (!user.commands.length || user.commands.indexOf[command] != -1)) {
        args.unshift(name);
        self.commands[command].apply(null, args);
      } else if (self.allowAll && (!self.allCommands.length || self.allCommands.indexOf[command] != -1)) {
        args.unshift(null);
        self.commands[command].apply(null, args);
      }
    }
  });

  this.stream.on('user_event', function (data) {
    console.log(msg);
  });
};


TwitterCmd.prototype.getUsernames = function() {
  return this.users.map(function (e) {
    return e.name;
  });
};

TwitterCmd.prototype.getUser = function (name) {
  if (typeof(name) != 'string') throw new Error('invalid user name, expected [String]');
  var user = null;
  this.users.some(function (e) {
    if (e.name == name) return user = e;
  });
  return user || false;
};

TwitterCmd.prototype.addUserCmds = function (name, commands) {
  if (typeof(name) != 'string') throw new Error('invalid user name, expected [String]');
  return this.users.some(function (e) {
    if (e.name == name) {
      return e.commands = commands.filter(function (cmd) {
        if (e.commands.indexOf(cmd) == -1) return true;
      }).concat(e.commands);
    }
  });
};

TwitterCmd.prototype.removeUserCmds = function (name, commands) {
  if (typeof(name) != 'string') throw new Error('invalid user name, expected [String]');
  return this.users.some(function (e) {
    if (e.name == name) {
      return e.commands = e.commands.filter(function (cmd) {
        if (commands.indexOf(cmd) == -1) return true;
      });
    }
  });
};

TwitterCmd.prototype.addAllCmds = function (commands) {
  this.allCommands = commands.filter(function (cmd) {
    if (this.allCommands.indexOf(cmd) == -1) return true;
  }).concat(this.allCommands);
};

TwitterCmd.prototype.removeAllCmds = function (commands) {
  this.allCommands = this.allCommands.filter(function (cmd) {
    if (commands.indexOf(cmd) == -1) return true;
  });
};

TwitterCmd.prototype.addUser = function (user) {
  var userObj;

  if (typeof(user) == 'string') {
    userObj = {
      name: user,
      commands: []
    };
  } else {
    if (typeof(user.name) != 'string') throw new Error('user name required');
    userObj = {
      name: user.name,
      commands: Array.isArray(user.commands) ? user.commands.slice() : []
    };
  }

  if (this.users.some(function(e) { return e.name == userObj.name; })) {
    return false;
  } else {
    return !!this.users.push(userObj);
  }
};

TwitterCmd.prototype.removeUser = function (name) {
  if (typeof(name) != 'string') throw new Error('invalid user name, expected [String]');
  return this.users.some(function (e, i, arr) {
    if (e.name == name) return arr.splice(i, 1);
  });
};

TwitterCmd.prototype.bind = function (name, fn) {
  this.commands[name] = fn;
};

TwitterCmd.prototype.unbind = function (name) {
  delete this.commands[name];
};

// check typical cb params
TwitterCmd.prototype.message = function (target, msg, cb) {
  var isArr = Array.isArray(target);
  if (msg.length > 140) msg = msg.slice(0, 140);

  if (isArr && target.length < 1) {
      if (cb) cb();
  } else {
    this.T.post('direct_messages/new', {
      text: msg, 
      screen_name: isArr ? target.shift() : target
    }, function (err, data, res) {
      if (err) throw new Error(err.message);
      if (!isArr && cb) cb();
    });
    if (isArr) this.message(target, msg, cb);
  }
};