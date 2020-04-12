const { Router } = require('express');

const auth = require('../middleware/auth');

const router = Router();

const User = require('../models/user');

router.get('/', auth, (req, res) => {
  res.render('profile', {
    title: 'My profile',
    isProfile: true,
    user: req.user.toObject(),
  });
});

router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const toChange = {
      name: req.body.name,
    };

    if (req.file) {
      toChange.avatarURL = req.file.path;
    }

    Object.assign(user, toChange);
    await user.save();
    res.redirect('/profile');
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
