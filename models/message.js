var mongoose = require('mongoose');

module.exports = mongoose.model('Message', {
  content: String,
  created: {type: Date, default: Date.now},
  author: String,
  type: String
});
