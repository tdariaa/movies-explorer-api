require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const cors = require('cors');

const UsersRouter = require('./routes/users');
const CardsRouter = require('./routes/movies');
const NotFoundError = require('./errors/not-found-error');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/error-handler');
const {
  signinValidation,
  signupValidation,
} = require('./middlewares/celebrate-validation');

const { PORT = 3000, DB_URL = 'mongodb://localhost:27017/testdiplom' } = process.env;
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4,
});

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const {
  login,
  createUser,
  logout,
} = require('./controllers/users');

app.use(cookieParser());

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', signinValidation, login);
app.post('/signup', signupValidation, createUser);
app.get('/signup', logout);

app.use(auth);

app.use(UsersRouter);
app.use(CardsRouter);
app.use('*', (req, res, next) => next(new NotFoundError('Не найдено')));

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

app.listen(PORT);
