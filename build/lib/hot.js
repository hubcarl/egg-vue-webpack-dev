'use strict';
require('eventsource-polyfill');
const hotClient = require('webpack-hot-middleware/client?noInfo=false&reload=false&quiet=false');
hotClient.subscribe(function(event) {
  if (event.action === 'reload') {
    window.location.reload();
  }
});
