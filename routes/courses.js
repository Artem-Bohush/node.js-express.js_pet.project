const { Router } = require('express');
const { validationResult } = require('express-validator');

const Course = require('../models/course');
const { courseValidators } = require('../utils/validators');


const auth = require('../middleware/auth');

const router = Router();

function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString();
}

router.get('/', async (req, res) => {
  try {
    let courses = await Course.find()
      .populate('userId', 'email name')
      .select('title price img');

    if (req.user) {
      courses = courses.map(course => ({
        ...course._doc,
        id: course._id,
        userId: course.userId._id.toString(),
        isMy: course.userId._id.toString() === req.user._id.toString(),
      }));
    } else {
      courses = courses.map(course => ({ ...course._doc, id: course._id }));
    }

    res.render('courses', {
      title: 'Courses',
      isCourses: true,
      userId: req.user ? req.user._id.toString() : null,
      courses,
    });
  } catch (e) {
    console.log(e);
  }
});

router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) {
    res.redirect('/');
  } else {
    try {
      const course = await Course.findById(req.params.id);

      if (!isOwner(course, req)) {
        return res.redirect('/courses');
      }

      res.render('course-edit', {
        title: `Edit ${course.title}`,
        course: { ...course._doc, id: course._id },
      });
    } catch (e) {
      console.log(e);
    }
  }
});

router.post('/edit', courseValidators, auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    const { id } = req.body;
    const course = await Course.findById(id);

    if (!errors.isEmpty()) {
      return res.status(422).render('course-edit', {
        title: `Edit ${req.body.title}`,
        error: errors.array()[0].msg,
        course: { ...course._doc, id: course._id },
      });
    }
    delete req.body.id;

    if (!isOwner(course, req)) {
      return res.redirect('/courses');
    }
    Object.assign(course, req.body);
    await course.save();
    res.redirect('/courses');
  } catch (error) {
    console.log(error);
  }
});

router.post('/remove', auth, async (req, res) => {
  try {
    await Course.deleteOne({ _id: req.body.id, userId: req.user._id });
    res.redirect('/courses');
  } catch (error) {
    console.log(error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.render('course', {
      layout: 'course-datails',
      title: `Course ${course.title}`,
      course: course._doc,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
