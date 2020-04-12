const { body } = require('express-validator');
const User = require('../models/user');

exports.registerValidators = [
  body('email')
    .isEmail().withMessage('Enter a valid email!')
    .custom(async (value) => {
      try {
        const candidate = await User.findOne({ email: value });
        if (candidate) {
          return Promise.reject('This email is already taken!');
        }
      } catch (error) {
        console.log(error);
      }
    })
    .normalizeEmail(),
  body('password', 'Password must consist of 0-9, a-z, A-Z characters and contain from 6 to 56 characters!')
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .trim(),
  body('repeat')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password mismatch!');
      } else {
        return true;
      }
    })
    .trim(),
  body('name')
    .isLength({ min: 2 }).withMessage('The name must be at least 2 characters long!')
    .trim(),
];

exports.loginValidators = [
  body('email')
    .isEmail().withMessage('Enter a valid email!')
    .normalizeEmail(),
  body('password')
    .trim(),
];

exports.courseValidators = [
  body('title').isLength({ min: 2 }).withMessage('The course title must contain at least 2 characters!')
    .trim(),
  body('price').isNumeric().withMessage('Enter the correct price!'),
  body('img', 'Enter the correct url of the picture!').isURL(),
];
