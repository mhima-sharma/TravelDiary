import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Verify your TravelDiary account",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2>Welcome to TravelDiary!</h2>
        <p>Click the button below to verify your email address:</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;border-radius:8px;text-decoration:none">Verify Email</a>
        <p style="margin-top:16px;color:#6b7280">This link expires in 24 hours.</p>
      </div>
    `,
  });
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_USER,
    replyTo: data.email,
    subject: `[Contact] ${data.subject}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2>New Contact Message</h2>
        <p><strong>From:</strong> ${data.name} &lt;${data.email}&gt;</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
        <p style="white-space:pre-wrap">${data.message}</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Reset your TravelDiary password",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2>Password Reset</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;border-radius:8px;text-decoration:none">Reset Password</a>
        <p style="margin-top:16px;color:#6b7280">This link expires in 1 hour. Ignore if you didn't request this.</p>
      </div>
    `,
  });
}
