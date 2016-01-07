var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

// create a schema
var searchSchema = new Schema({
  body: String,
  created_at: Date,
  depth: Number,
  pages_searched: Number,
  pending: Boolean,
  urls: Object
});

var Search = mongoose.model('Search', searchSchema);

// on every save, add the date
searchSchema.pre('save', function(next) {
  this.created_at = new Date();
  next();
});

module.exports = Search;
