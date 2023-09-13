const MovieModel = require('../models/movies');

const BadRequestError = require('../errors/bad-request-error');
const NotFoundError = require('../errors/not-found-error');
const ForbiddenError = require('../errors/forbidden-error');

module.exports.getSavedMovies = (req, res, next) => {
  MovieModel.find({ owner: req.user._id })
    .then((movies) => res.status(200).send(movies))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  MovieModel.create({ ...req.body, owner: req.user._id })
    .then((movie) => res.status(201).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные'));
      }
      return next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const { _id } = req.user;

  MovieModel.findById(movieId)
    .then((movie) => {
      if (!movie) {
        return next(new NotFoundError('Фильм с указанным id не найден'));
      }
      if (!(_id === movie.owner.toString())) {
        return next(new ForbiddenError('Доступ к запрошенному ресурсу запрещен'));
      }
      return MovieModel.deleteOne(movie)
        .then(() => res.status(200).send(movie));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Передан некорректный id'));
      }
      return next(err);
    });
};
