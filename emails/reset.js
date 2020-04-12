const keys = require('../keys');

module.exports = function (to, token) {
  return {
    to,
    from: keys.EMAIL_FROM,
    subject: 'Access recovery',
    html: `
      <h2>Have you reset your password?</h2>
      <p>If you did not, then ignore this letter.</p>
      <p>Otherwise, click on the link below:</p>
      <p><a href="${keys.BASE_URL}/auth/password/${token}">Restore access</a></p>
      <hr/>
      <a href="${keys.BASE_URL}">Course Shop</a>
    `,
  };
};
