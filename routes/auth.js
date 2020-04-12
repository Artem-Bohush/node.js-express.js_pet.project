const { Router } = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');

const User = require('../models/user');
const keys = require('../keys');
const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');
const { registerValidators, loginValidators } = require('../utils/validators');

const router = Router();

const transporter = nodemailer.createTransport(sendgrid({
  auth: { api_key: keys.SENDGRID_API_KEY },
}));

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Log in',
    isLogin: true,
    loginError: req.flash('login-error'),
    registerError: req.flash('register-error'),
  });
});

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login');
  });
});

router.post('/login', loginValidators, async (req, res) => {
  try {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('login-error', errors.array()[0].msg);
      return res.status(422).redirect('/auth/login#login');
    }

    const candidate = await User.findOne({ email });

    if (candidate) {
      const isSamePassword = await bcrypt.compare(password, candidate.password);

      if (isSamePassword) {
        req.session.user = candidate;
        req.session.isAuthenticated = true;
        req.session.save(err => {
          if (err) {
            throw err;
          }
          res.redirect('/');
        });
      } else {
        req.flash('login-error', 'Wrong password');
        res.redirect('/auth/login#login');
      }
    } else {
      req.flash('login-error', 'Wrong email');
      res.redirect('/auth/login#login');
    }
  } catch (error) {
    console.log(error);
  }
});

router.post('/register', registerValidators, async (req, res) => {
  try {
    const { email, name, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('register-error', errors.array()[0].msg);
      return res.status(422).redirect('/auth/login#register');
    }

    const encodedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      name,
      password: encodedPassword,
      cart: { items: [] },
    });
    await user.save();
    res.redirect('/auth/login#login');
    await transporter.sendMail(regEmail(email));
  } catch (error) {
    console.log(error);
  }
});

router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Reset password',
    error: req.flash('error'),
  });
});

router.get('/password/:token', async (req, res) => {
  if (!req.params.token) {
    return res.redirect('/auth/login');
  }

  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect('/auth/login');
    }

    res.render('auth/password', {
      title: 'Recover access',
      error: req.flash('error'),
      userId: user._id.toString(),
      token: req.params.token,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash('error', 'Something went wrong, try again later');
        return res.redirect('/auth/reset');
      }

      const token = buffer.toString('hex');
      const candidate = await User.findOne({ email: req.body.email });

      if (candidate) {
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
        await candidate.save();
        await transporter.sendMail(resetEmail(candidate.email, token));
        res.redirect('/auth/login');
      } else {
        req.flash('error', 'There is no such email!');
        res.redirect('/auth/reset');
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.post('/password', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      await user.save();
      res.redirect('/auth/login');
    } else {
      req.flash('loginError', 'Token expired!');
      res.redirect('/auth/login');
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
