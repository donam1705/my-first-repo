// lib/sendmail.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async ({ email, token }) => {
  if (!email || !token) return;

  const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: 'Xác nhận tài khoản của bạn',
    html: `
      <h3>Chào bạn!</h3>
      <p>Cảm ơn vì đã đăng ký tài khoản tại <b>MyShop</b>.</p>
      <p>Vui lòng nhấn vào liên kết dưới đây để xác nhận email:</p>
      <a href="${verifyLink}" target="_blank" style="color: #1a73e8; font-weight: bold;">
        Xác nhận tài khoản
      </a>
      <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
    `,
  });
};

export const sendResetPasswordEmail = async ({ email, token }) => {
  if (!email || !token) return;

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: 'Đặt lại mật khẩu của bạn',
    html: `
      <h3>Khôi phục mật khẩu</h3>
      <p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
      <p>Nhấn vào liên kết dưới đây để đặt lại mật khẩu (link có hiệu lực trong <b>5 phút</b>):</p>
      <a href="${resetLink}" target="_blank" style="color: red; font-weight: bold;">
        Đặt lại mật khẩu
      </a>
      <p>Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email.</p>
    `,
  });
};

export { transporter };
