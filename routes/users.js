const router = require('express').Router();
const { updateProfileValidation } = require('../middlewares/celebrate-validation');

const {
  updateProfile,
  getMe,
} = require('../controllers/users');

router.get('/users/me', getMe);

router.patch('/users/me', updateProfileValidation, updateProfile);

module.exports = router;
