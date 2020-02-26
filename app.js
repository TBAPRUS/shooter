const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

const messages = require('./middleware/messages');
const player = require('./middleware/player');
const validate = require('./middleware/validate');

const register = require('./routes/register');
const login = require('./routes/login');
const error404 = require('./routes/error404');
const game = require('./routes/game').game;
const main = require('./routes/main');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static('public'));
app.use(messages);
app.use(player);

app.get('/register', register.form);
app.post('/register',
  validate.password,
  validate.name,
  register.submit);
app.get('/login', login.form);
app.post('/login', login.submit);
app.get('/logout', login.logout);

app.get('/', main);
app.get('/game', game);

app.use(error404);

module.exports = app;