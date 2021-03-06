/**
 * twitter-cmd
 *
 * designed for use with single user twitter streams
 * requires twit (tested for version > 1.1.x)
 */

exports = module.exports = TwitterCmd;
var WS_REGEX = /\s+/;


/**
 * initialize TwitterCmd with a single command 'echo'
 *
 * options:
 * streamOptions    - twitter stream options
 * key              - require keyword before command
 * allowAll         - allow any DM-capable users to access commands
 *
 * @param {Twit}
 * @param {Object} options
 */

function TwitterCmd (T, options) {
  var self = this;

  options = options || {};
  this.T = T;
  this.streamOptions = options.streamOptions || {};
  this.key = options.key || null;
  this.users = [];
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
};


/**
 * adds a user to access list
 *
 * @param {String|Object} user name or user object
 */

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

/**
 * removes a user from access list
 *
 * @param {String} user name
 */

TwitterCmd.prototype.removeUser = function (name) {
  if (typeof(name) != 'string') throw new Error('invalid user name, expected [String]');
  return this.users.some(function (e, i, arr) {
    if (e.name == name) return arr.splice(i, 1);
  });
};

/**
 * returns an array of usernames
 */

TwitterCmd.prototype.getUsernames = function() {
  return this.users.map(function (e) {
    return e.name;
  });
};

/**
 * returns user object or false if not found
 *
 * @param {String} name
 */

TwitterCmd.prototype.getUser = function (name) {
  if (typeof(name) != 'string') throw new Error('invalid user name, expected [String]');
  var user = null;
  this.users.some(function (e) {
    if (e.name == name) return user = e;
  });
  return user || false;
};

/**
 * allows user to call commands
 *
 * @param {String} user name
 * @param {String|Array} command or commands to allow
 */

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

/**
 * disallows user from calling commands
 *
 * @param {String} user name
 * @param {String|Array} command or commands to disallow
 */

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

/**
 * allows all users to call commands
 *
 * @param {String|Array} command or commands to allow
 */

TwitterCmd.prototype.addAllCmds = function (commands) {
  this.allCommands = commands.filter(function (cmd) {
    if (this.allCommands.indexOf(cmd) == -1) return true;
  }).concat(this.allCommands);
};

/**
 * disallows all users from calling commands
 *
 * @param {String|Array} command or commands to disallow
 */

TwitterCmd.prototype.removeAllCmds = function (commands) {
  this.allCommands = this.allCommands.filter(function (cmd) {
    if (commands.indexOf(cmd) == -1) return true;
  });
};

/**
 * add a command to command list
 *
 * function params:
 * name             - name of the user making the call
 * arguments        - arguments from DM following command string
 *
 * @param {String} command name
 * @param {Function} command function
 */

TwitterCmd.prototype.bind = function (name, fn) {
  this.commands[name] = fn;
};

/**
 * removes a command from command list
 *
 * @param {String} command name
 */

TwitterCmd.prototype.unbind = function (name) {
  delete this.commands[name];
};

/**
 * sends a DM to target user
 *
 * @param {String} user
 * @param {String} message body
 * @param {Function} optional callback
 */

TwitterCmd.prototype.message = function (target, msg, cb) {
  if (msg.length > 140) msg = msg.slice(0, 140);
  this.T.post('direct_messages/new', {
    text: msg, 
    screen_name: target
  }, function (err, data, res) {
    if (cb) cb(err);
  });
};