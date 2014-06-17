## twitter-cmd

Execute functions in node when prompted by twitter direct messages.

## requirements

twit: https://github.com/ttezel/twit

## installation

```
npm install twit twitter-cmd
```

## usage

Sending the twitter message 'hello' to API account will log some output to console. 

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





## license

MIT
