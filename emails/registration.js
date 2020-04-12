const keys = require('../keys');

module.exports = function (to) {
  return {
    to,
    from: keys.EMAIL_FROM,
    subject: 'Account created successfully',
    html: `
      <h2>Welcome to our shop!</h2>
      <p>You have successfully created account, your email  - ${to}</p>
      <hr/>
      <a href="${keys.BASE_URL}/courses">View course list</a>
    `,
  };
};
