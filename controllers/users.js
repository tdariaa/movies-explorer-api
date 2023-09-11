const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/users');

const { NODE_ENV, SECRET_KEY } = process.env;

const BadRequestError = require('../errors/bad-request-error');
const NotFoundError = require('../errors/not-found-error');
const ConflictEerror = require('../errors/conflict-error');
const UnauthorizedError = require('../errors/unauthorized-error');

module.exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => UserModel.create({
      email: req.body.email,
      password: hash,
      name: req.body.name,
    }))
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'Error') {
        return next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      }
      if (err.code === 11000) {
        return next(new ConflictEerror('При регистрации указан email, который уже существует на сервере'));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return UserModel.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? SECRET_KEY : 'some-secret-key', { expiresIn: '7d' });
      return res.status(200).cookie('jwt', token, {
        maxAge: 720 * 1000, httpOnly: true, sameSite: 'None', secure: true,
      }).send({ token }).end();
    })
    .catch((err) => next(new UnauthorizedError(err.message)));
};

module.exports.logout = (req, res) => res.clearCookie('jwt').status(200).send({ message: 'Выход' });

module.exports.getMe = (req, res, next) => {
  const { _id } = req.user;
  UserModel.findById(_id)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь по указанному id не найден'));
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Передан некорректный id'));
      }
      return next(err);
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, email } = req.body;
  UserModel.findByIdAndUpdate(req.user._id, { name, email }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь по указанному id не найден'));
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      }
      return next(err);
    });
};
