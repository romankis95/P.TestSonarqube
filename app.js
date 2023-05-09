const express = require('express');
const app = express();
const config = require('./config/config.json');
if (config.system.env === 'DEV') {
  process.env.ENV = 'DEV';
} else {
  process.env.ENV = 'PROD';
}
process.env.SOCKET = config.system.socket;
process.env.SERVER = config.system.serverip;
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const scheduler = require('node-schedule');
const ip = require('ip');
const favicon = require('serve-favicon');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo');
// eslint-disable-next-line no-unused-vars
const dotenv = require('dotenv').config();
const PORT = config.system.serverport || 22000;
const myip = ip.address();


/**
 * routes
 */

const _mainRoutes = require('./routes/main');
const _ubicazioneRoutes = require('./routes/ubicazione');
const _tuttoRoutes = require('./routes/tutto');
const _zmatRoutes = require('./routes/zmat');
const _sapRoutes = require('./routes/sap');
const _loginRoutes = require('./routes/index');
const _richiesteRoutes = require('./routes/richieste');
const _movimentiRoutes = require('./routes/movimenti');
const _apiRoutes0 = require('./routes/api/test');
const _apiRoutes2 = require('./routes/api/sap_data');
const _apiRoutes4 = require('./routes/api/APP/users/users_data');
const _usersRoute = require('./routes/users');
const _job1Routes = require('./routes/jobs/updatestock');
const _apiRoutes6 = require('./routes/api/MES/mard');
const _apiRoutes7 = require('./routes/api/MES/manage/richieste');
const _apiMesRichieste = require('./routes/api/APP/richieste/manage');
const _apiMesUbicazioni = require('./routes/api/APP/ubicazioni/ubicazioni');
const _apiMesCercaUbi = require('./routes/api/MES/manage/ubicazioni');
const _apiInventarioRoutes = require('./routes/api/APP/ubicazioni/inventario');
const _apiMailCqRoutes = require('./routes/api/MAIL/sollecitocq');
const codifiFissiRoutes = require('./routes/api/codicifissi');
const User = require('./models/user');
/**
 * extensions
 */
const logger = require('./routes/extensions/logger');
const sendmail = require('./routes/extensions/nodemailer');

if (typeof process.env.NODE_APP_INSTANCE === 'undefined') {
  process.env.NODE_APP_INSTANCE = 0;
};

mongoose.Promise = global.Promise;
let mongoextURI = config.system.dbroot + '/' + config.system.dbname 

mongoose.connect(mongoextURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const db = mongoose.connection;
db.on('error',function(err){
  logger.error('Mongoose connection error: ' + err);
});
db.once('open', function() {
  logger.info(JSON.stringify('::ffff:' + myip + ' , ' + 'Connessione stabilita sul database ' + mongoextURI));
});

process.on('SIGINT', () => {
  db.close(() => {
    logger.warn(JSON.stringify('::ffff:' + myip + ' , ' + 'Connessione chiusa sul database ' + mongoextURI));
    logger.warn(JSON.stringify('::ffff:' + myip + ' , ' + 'Spegnimento sistema ' + mongoextURI));
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  db.close(() => {
    logger.warn(JSON.stringify('::ffff:' + myip + ' , ' + 'Connessione chiusa sul database ' + mongoextURI));
    logger.warn(JSON.stringify('::ffff:' + myip + ' , ' + 'Spegnimento sistema ' + mongoextURI));
    process.exit(0);
  });
});


app.use(bodyParser.urlencoded({
  extended: false,
}));

app.use(bodyParser.json());
app.set('view engine', 'ejs');

const path2icon = __dirname + '/public/favicon.ico'; // è il link all'icona dei preferiti del sito
const path2public = __dirname + '/public'; // è il link alla cartella public del sito
app.use(express.static(path2public));

// controlla che la favicon esista se esiste, la assegna, e già che c'ero ci ho messo anche pubblic come static
if (fs.existsSync(path2icon)) {
  logger.info(JSON.stringify('::ffff:' + myip + ' , ' + 'Icon Connection OK ' + path2icon));
  app.use(favicon(path2icon));
} else {
  logger.error(JSON.stringify('::ffff:' + myip + ' , ' + 'Icon Connection NOT OK ' + path2icon));
};

app.use(methodOverride('_method'));


app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl: mongoextURI,
        ttl: 20 * 60 * 60, // = 15 ore.  14 giorni is Default if the option is not declared
      }),
    }),
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());


app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.warning = req.flash('warning');
  res.locals.error = req.flash('error');
  next();
});
app.locals.moment = require('moment');


/**
 * Connection to my routes
 */
app.use('/', _loginRoutes);
app.use('/principale/', _mainRoutes);
app.use('/ub', _ubicazioneRoutes);
app.use('/inventario', _tuttoRoutes);
app.use('/sap', _sapRoutes);
app.use('/richieste', _richiesteRoutes);
app.use('/api', _zmatRoutes);
app.use('/api', _apiRoutes0);
app.use('/api', _apiRoutes2);
app.use('/api', _apiRoutes4);
app.use('/api', _apiRoutes6);
app.use('/api', _apiMesRichieste);
app.use('/api', _apiMesUbicazioni);
app.use('/api', _apiRoutes7);
app.use('/users', _usersRoute);
app.use('/jobs', _job1Routes);
app.use('/movimenti', _movimentiRoutes);
app.use('/api', _apiMesCercaUbi);
app.use('/api', _apiInventarioRoutes);
app.use('/api/mail/cq', _apiMailCqRoutes);
app.use('/api/codicifissi', codifiFissiRoutes);
app.get('*', function(req, res) {
  req.flash('warning', 'La pagina desiderata non è disponibile!');
  return res.redirect('/');
});

if (process.env.ENV != 'DEV') {
 scheduler.scheduleJob('45 6 * * *', function() {
    if (typeof process.env.NODE_APP_INSTANCE === 'undefined' || process.env.NODE_APP_INSTANCE == 0) {
      sendmail('Roman il magazzino è online', 'Ciao roman il magazzino è online, tutto tranquillo');
    }
  });
};

app.listen(PORT, function() {
  logger.info(JSON.stringify('::ffff:' + myip + ' , ' + 'Connessione stabilita sulla porta: ' + PORT));
});

