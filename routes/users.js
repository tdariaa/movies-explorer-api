const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  updateProfile,
  getMe,
} = require('../controllers/users');

router.get('/users/me', getMe);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email(),
  }),
}), updateProfile);

module.exports = router;
