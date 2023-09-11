const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validationRegex = require('../utils/constants');

const {
  getSavedMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

router.get('/movies', getSavedMovies);

router.post(
  '/movies',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required().length(4),
      description: Joi.string().required(),
      image: Joi.string().required().pattern(validationRegex),
      trailerLink: Joi.string().required().pattern(validationRegex),
      thumbnail: Joi.string().required().pattern(validationRegex),
      movieId: Joi.number().required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  }),
  createMovie,
);

router.delete(
  '/movies/:movieId',
  celebrate({
    params: Joi.object().keys({
      movieId: Joi.string().length(24).hex().required(),
    }),
  }),
  deleteMovie,
);

module.exports = router;
