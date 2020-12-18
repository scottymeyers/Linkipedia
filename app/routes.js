const searchController = require('./controllers/search');

module.exports = (app) => {
	app.use((req, res, next) => {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Origin, Content-type, Accept, Authorization');
		res.header('Access-Control-Allow-Credentials', 'true');
		next();
	});
	app.get('/', (req, res) => res.render('index', { path: req.path }));
	app.post('/scrape', (req, res) => searchController.createSearch(req, res));
	app.get('*', (req, res) => res.redirect('/'));
};
