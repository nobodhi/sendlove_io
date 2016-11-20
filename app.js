/*
  Module dependencies.
*/
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const sass = require('node-sass-middleware');
const multer = require('multer');
const uploadMulter = multer({ dest: path.join(__dirname, 'uploads') });

/*
  Load environment variables from .env file, where API keys and passwords are configured.
*/
dotenv.load({ path: '.env.example' });

/*
  Controllers (route handlers).
*/
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');

/*
  API keys and Passport configuration.
*/
const passportConfig = require('./config/passport');

/*
  Create Express server.
*/
const app = express();

/*
  Connect to MongoDB.
*/
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

/*
  Express configuration.
*/
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use("/uploads", express.static(__dirname + '/uploads'));



app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/api/upload' || req.path === '/api/new_intention') { // TODO KLUDGE: CSRF multipart issue.
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use(function(req, res, next) {
  // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/*
  Primary app routes.
*/
app.get('/reply', function (req, res) {
  res.render('reply', { title: 'SendLove I/O SMS'});
});
app.get('/privacy', function (req, res) {
  res.render('privacy', { title: 'Privacy Policy'});
});

// APP routes call the API functions by name.

app.get('/', homeController.index);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);
app.get('/contact', contactController.getContact);
app.get('/forgot', userController.getForgot);
app.get('/login', userController.getLogin);
app.get('/logout', userController.logout);
app.get('/reset/:token', userController.getReset);
app.get('/signup', userController.getSignup);

app.post('/', homeController.postContact);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/contact', contactController.postContact);
app.post('/forgot', userController.postForgot);
app.post('/login', userController.postLogin);
app.post('/reset/:token', userController.postReset);
app.post('/signup', userController.postSignup);

/*
  API get routes. See passport.js for authentication and authorization functions
*/

app.get('/api', apiController.getApi);
app.get('/api/aviary', apiController.getAviary);
app.get('/api/clockwork', apiController.getClockwork);
app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
app.get('/api/foursquare', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFoursquare);
app.get('/api/github', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGithub);
app.get('/api/goodnews', apiController.getGoodNews);
app.get('/api/google-maps', apiController.getGoogleMaps);
app.get('/api/instagram', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getInstagram);
app.get('/api/lastfm', apiController.getLastfm);
app.get('/api/linkedin', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getLinkedin);
app.get('/api/lob', apiController.getLob);
app.get('/api/nyt', apiController.getNewYorkTimes);
app.get('/api/paypal', apiController.getPayPal);
app.get('/api/paypal/cancel', apiController.getPayPalCancel);
app.get('/api/paypal/success', apiController.getPayPalSuccess);
app.get('/api/pinterest', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getPinterest);
app.get('/api/scraping', apiController.getScraping);
app.get('/api/steam', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getSteam);
app.get('/api/stripe', apiController.getStripe);
app.get('/api/tumblr', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTumblr);
app.get('/api/twilio', apiController.getTwilio);
app.get('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTwitter);
app.get('/api/upload', apiController.getFileUpload);
app.get('/api/new_intention', passportConfig.isAuthenticated, apiController.getNewIntention); 
app.get('/api/intention/:token', apiController.getIntention); 
app.get('/api/message', passportConfig.isAuthenticated, apiController.getMessage); 
app.get('/api/map', apiController.getMap); 
app.get('/api/feed', apiController.getFeed); 
// app.get('/api/detail', passportConfig.isAuthenticated, apiController.getDetail);  // details will be tied to intentions
app.get('/api/testmap', apiController.getTestMap); 

/*
  API Post Routes
*/
app.post('/api/new_intention', passportConfig.isAuthenticated, uploadMulter.single('myFile'), apiController.postIntention);
app.post('/api/intention/:token', passportConfig.isAuthenticated, apiController.postIntention); // todo postintentionByToken. file upload?
app.post('/api/message', passportConfig.isAuthenticated, apiController.postMessage);
app.post('/api/intention', passportConfig.isAuthenticated, apiController.postDetail);
app.post('/api/detail', passportConfig.isAuthenticated, apiController.postDetail);
// app.post('/api/testmap', apiController.postTestMap); 

// app.post('/api/clockwork', passportConfig.isAuthenticated, apiController.postClockwork);
// app.post('/api/pinterest', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postPinterest);
// app.post('/api/stripe', passportConfig.isAuthenticated, apiController.postStripe);
// app.post('/api/twilio', passportConfig.isAuthenticated, apiController.postTwilio);
// app.post('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postTwitter);
// app.post('/api/upload', passportConfig.isAuthenticated, uploadMulter.single('myFile'), apiController.postFileUpload); // imgur vs upload

/*
  OAuth authentication routes. (Sign in)
**/
app.get('/auth/instagram', passport.authenticate('instagram'));
app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location', 'user_friends'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter', passport.authenticate('twitter')); // TODO test if www is working - if not try setting it in login.pug
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});

/*
  OAuth authorization routes. (API examples)
*/

app.get('/auth/foursquare', passport.authorize('foursquare'));
app.get('/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/api' }), (req, res) => {
  res.redirect('/api/foursquare');
});
app.get('/auth/tumblr', passport.authorize('tumblr'));
app.get('/auth/tumblr/callback', passport.authorize('tumblr', { failureRedirect: '/api' }), (req, res) => {
  res.redirect('/api/tumblr');
});
app.get('/auth/steam', passport.authorize('openid', { state: 'SOME STATE' }));
app.get('/auth/steam/callback', passport.authorize('openid', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/pinterest', passport.authorize('pinterest', { scope: 'read_public write_public' }));
app.get('/auth/pinterest/callback', passport.authorize('pinterest', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/api/pinterest');
});

/*
  Error Handler.
*/
app.use(errorHandler());

/*
  Start Express server.
*/

app.listen(app.get('port'), () => {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
