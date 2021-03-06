## twitter-cmd

Execute functions in node when prompted by twitter direct messages. Uses twitter user stream.

## requirements

twit (1.1.x): https://github.com/ttezel/twit

## installation

```
npm install twit twitter-cmd
```

## usage

Sending the twitter message 'hello' to the attached API account will log some output to console. 

```javascript
var T = require('twit');
var TC = require('twitter-cmd');

var twitter = new T({
  consumer_key: '...',
  consumer_secret: '...',
  access_token: '...',
  access_token_secret: '...'
});

var twitterCmd = new TC(twitter);

twitterCmd.addUser('kaftz');
twitterCmd.bind('hello', function (user) {
  console.log('hello ' + user);
});
```

### options

You may pass an options object when initializing.

```javascript
var twitterCmd = new TC(twitter, { /* options */ });
```

- `streamOptions` an object containing twitter stream options
- `key` keyword required before command, default none ([keyword] [command] [args])
- `allowAll` boolean allowing or disallowing any DM capable users to access commands, default false

### API

- `addUser(user)`, `removeUser(user)` add or remove a user from access list
- `getUsernames()` returns an array of usernames
- `getUser(name)` returns user object or false if not found
- `addUserCmds(name, commands)`, `removeUserCmds(name, commands)` allow or disallow user to call commands (String or Array)
- `addAllCmds(commands)`, `removeAllCmds()` allow or disallow all users to call commands
- `bind(name, fn)`, `unbind(name)` bind or unbind command, fn args: user making call followed by DM strings
- `message(target, msg, cb)` send a DM to target user, optional callback

## license

MIT
