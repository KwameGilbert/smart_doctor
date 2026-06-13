/**
 * Generate a beautifully styled HTML email template for password reset requests.
 * @param firstName The recipient's first name.
 * @param otpCode The 6-digit password reset OTP code.
 */
export const getResetTemplate = (firstName: string, otpCode: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f4f6f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .header {
          background-color: #0f766e;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          font-size: 24px;
          margin: 0;
          font-weight: 700;
        }
        .content {
          padding: 40px 30px;
          color: #334155;
          line-height: 1.6;
        }
        .content h2 {
          font-size: 20px;
          color: #1e293b;
          margin-top: 0;
        }
        .otp-container {
          background-color: #f0fdfa;
          border: 2px dashed #0d9488;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-code {
          font-size: 36px;
          font-weight: 800;
          color: #0f766e;
          letter-spacing: 8px;
          margin: 0;
        }
        .footer {
          background-color: #f8fafc;
          padding: 20px 30px;
          text-align: center;
          font-size: 13px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        .footer a {
          color: #0f766e;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Smart Doctor</h1>
        </div>
        <div class="content">
          <h2>Hello ${firstName},</h2>
          <p>We received a request to reset your password. Please use the password reset code below to verify your request and set a new password:</p>
          <div class="otp-container">
            <div class="otp-code">${otpCode}</div>
          </div>
          <p style="margin-bottom: 0;">This password reset code is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Smart Doctor. All rights reserved.</p>
          <p>Need help? Contact our <a href="mailto:support@smartdoctor.com">Support Team</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};
