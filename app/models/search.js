var mongoose   = require('mongoose');

// grab the things we need
var Schema = mongoose.Schema;

// create a schema
var searchSchema = new Schema({
  body: String,
  created_at: Date,
  depth: Number,
  pages_searched: Number
});

// the schema is useless so far
// we need to create a model using it
var Search = mongoose.model('Search', searchSchema);

// on every save, add the date
searchSchema.pre('save', function(next) {
  this.created_at = new Date();
  next();
});

// make this available to our searches in our Node applications
module.exports = Search;
