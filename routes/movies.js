const router = require('express').Router();
const { createMovieValidation, deleteMovieValidation } = require('../middlewares/celebrate-validation');

const {
  getSavedMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

router.get('/movies', getSavedMovies);

router.post('/movies', createMovieValidation, createMovie);

router.delete('/movies/:movieId', deleteMovieValidation, deleteMovie);

module.exports = router;
