const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '你的Gmail@gmail.com',
    pass: '你的應用程式密碼',
  },
});

async function sendResetPasswordEmail(toEmail, resetUrl) {
  await transporter.sendMail({
    from: '"你的網站名稱" <你的Gmail@gmail.com>',
    to: toEmail,
    subject: '重設密碼通知',
    html: `<p>請點擊以下連結重設密碼：</p>
           <a href="${resetUrl}">${resetUrl}</a>
           <p>連結有效時間：1 小時。</p>`,
  });
}

module.exports = { sendResetPasswordEmail };
