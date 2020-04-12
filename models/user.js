const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  name: String,
  password: {
    type: String,
    required: true,
  },
  avatarURL: String,
  resetToken: String,
  resetTokenExp: Date,
  cart: {
    items: [
      {
        count: {
          type: Number,
          default: 1,
        },
        courseId: {
          required: true,
          type: Schema.Types.ObjectId,
          ref: 'Course',
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (course) {
  const clonedItems = [...this.cart.items];
  const idx = clonedItems.findIndex(c => c.courseId.toString() === course._id.toString());

  if (idx >= 0) {
    clonedItems[idx].count += 1;
  } else {
    clonedItems.push({
      courseId: course._id,
    });
  }

  this.cart.items = clonedItems;
  return this.save();
};

userSchema.methods.removeFromCart = function (id) {
  const clonedItems = [...this.cart.items];
  const idx = clonedItems.findIndex(c => c.courseId.toString() === id.toString());
  if (clonedItems[idx].count === 1) {
    clonedItems.splice(idx, 1);
  } else {
    clonedItems[idx].count -= 1;
  }
  this.cart.items = clonedItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

userSchema.method('toClient', function () {
  const course = this.toObject();
  course.id = course._id;
  delete course._id;
  return course;
});

module.exports = model('User', userSchema);
