var config = {};

config.mongoURI = {
  development: 'mongodb://localhost/wiki',
  production:  process.env.MONGOLAB_URI,
  test:        'mongodb://localhost/wiki-test'
}

module.exports = config;
