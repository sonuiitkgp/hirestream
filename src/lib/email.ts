import nodemailer from "nodemailer";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "sonuamex721@gmail.com";

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function notifyAdminNewUser({
  name,
  email,
  role,
}: {
  name: string | null;
  email: string;
  role: string;
}) {
  const roleName = role.replace("_", " ");
  const displayName = name || email;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"HireStream" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `New ${roleName} joined HireStream: ${displayName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="background: #0f172a; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0; font-size: 18px;">New User Signup</h2>
            <p style="margin: 4px 0 0; opacity: 0.7; font-size: 13px;">HireStream Platform Notification</p>
          </div>
          <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 16px; font-size: 14px; color: #475569;">
              A new user has joined HireStream:
            </p>
            <table style="width: 100%; font-size: 14px; color: #334155;">
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; width: 80px;">Name</td>
                <td style="padding: 6px 0; font-weight: 600;">${displayName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Email</td>
                <td style="padding: 6px 0;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Role</td>
                <td style="padding: 6px 0;">
                  <span style="display: inline-block; background: ${role === "RECRUITER" ? "#dbeafe" : "#d1fae5"}; color: ${role === "RECRUITER" ? "#1d4ed8" : "#059669"}; padding: 2px 10px; border-radius: 99px; font-size: 12px; font-weight: 600;">
                    ${roleName}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Date</td>
                <td style="padding: 6px 0;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>
        </div>
      `,
    });
  } catch {
    // Email is best-effort — don't fail the signup
  }
}
