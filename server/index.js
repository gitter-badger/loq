'use strict';
var express    = require('express');
var bodyParser = require('body-parser');
var Sequelize  = require('sequelize');
var passport   = require('passport');
var log4js     = require('log4js');
var app = express();

/**
 * mode
 */
var mode = process.env.NODE_ENV || 'development';

/**
 * load configuration files
 */
var config = {
  //config:         require('../config/config'),
  logger:         require('../config/logger'),
  database:       require('../config/database'),
  authentication: require('../config/authentication'),
  //oauthProviders: require('../config/oauth-providers'),
};
app.set('config', config);

/**
 * TODO: start logger
 */
log4js.configure(config.logger);
var logger = log4js.getLogger();

/**
 * middleware
 * configuration
 */
app.use(log4js.connectLogger(logger, { level: 'auto' }));
app.use('/assets', express.static(__dirname + '/../public/assets'));
app.use('/favicon.ico', express.static(__dirname + '/../public/favicon.ico'))
app.use('/robots.txt', express.static(__dirname + '/../public/robots.txt'))
app.set('views', __dirname+'/views');
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

/**
 * authentication
 * configuration
 */
require('./middlewares/passport')(app, passport, config);
app.set('passport', passport);

/**
 * define model schemas
 */
var sequelize = new Sequelize(config.database[mode]);
var models = {
  User: require('./models/user')(sequelize, Sequelize),
};
app.set('models', models);

/**
 * create controller
 * instances
 */
var PageController  = require('./controllers/page-controller');
var UserController  = require('./controllers/user-controller');
var AdminController = require('./controllers/admin-controller');
var controllers = {
  page:  new PageController(),
  user:  new UserController(),
  admin: new AdminController(),
};
app.set('controllers', controllers);

/**
 * routing middleware
 * configuration
 */
var pageRouter  = require('./routes/page-routes')(controllers);
var authRouter  = require('./routes/authenticate-routes')(controllers);
var userRouter  = require('./routes/user-routes')(controllers);
var adminRouter = require('./routes/admin-routes')(controllers);
app.use(pageRouter);
app.use(authRouter);
app.use('/users', userRouter);
app.use('/admin', adminRouter);


app.listen(process.env.PORT || 3000);
