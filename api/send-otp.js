import tls from 'tls';

// In-memory OTP storage for rapid verification
// In serverless, also supplemented by quick signature/timestamp check
globalThis.__SMARTHUB_OTPS__ = globalThis.__SMARTHUB_OTPS__ || new Map();

function sendSmtpEmail({ to, subject, body }) {
  return new Promise((resolve, reject) => {
    const from = 'sc7348509580@gmail.com';
    const pass = 'ohafegthrkmnyiak';

    const socket = tls.connect(465, 'smtp.gmail.com', { rejectUnauthorized: false }, () => {});

    let step = 0;
    socket.setEncoding('utf8');

    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error('SMTP timeout'));
    }, 12000);

    socket.on('data', (data) => {
      try {
        if (data.startsWith('220') && step === 0) {
          step = 1;
          socket.write('EHLO localhost\r\n');
        } else if (step === 1 && data.includes('250')) {
          step = 2;
          socket.write('AUTH LOGIN\r\n');
        } else if (step === 2 && data.includes('334')) {
          step = 3;
          socket.write(Buffer.from(from).toString('base64') + '\r\n');
        } else if (step === 3 && data.includes('334')) {
          step = 4;
          socket.write(Buffer.from(pass).toString('base64') + '\r\n');
        } else if (step === 4 && data.includes('235')) {
          step = 5;
          socket.write(`MAIL FROM:<${from}>\r\n`);
        } else if (step === 5 && data.includes('250')) {
          step = 6;
          socket.write(`RCPT TO:<${to}>\r\n`);
        } else if (step === 6 && data.includes('250')) {
          step = 7;
          socket.write('DATA\r\n');
        } else if (step === 7 && data.includes('354')) {
          step = 8;
          const msg = [
            `From: "Smart Hub Repair" <${from}>`,
            `To: <${to}>`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=utf-8',
            '',
            body,
            '.\r\n',
          ].join('\r\n');
          socket.write(msg);
        } else if (step === 8 && data.includes('250')) {
          clearTimeout(timeout);
          socket.write('QUIT\r\n');
          resolve(true);
        }
      } catch (e) {
        clearTimeout(timeout);
        reject(e);
      }
    });

    socket.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { email } = body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    globalThis.__SMARTHUB_OTPS__.set(cleanEmail, { otp, expiresAt });

    const subject = `Your Smart Hub Login Verification Code: ${otp}`;
    const emailBody = `Hello,

Your 6-digit verification code for Smart Hub Repair is:

  ${otp}

This code is valid for 10 minutes. Please enter it on the website to complete your sign-in.

If you did not request this code, you can safely ignore this email.

Best regards,
Smart Hub Repair Management Team
https://repairshop-iota.vercel.app/`;

    await sendSmtpEmail({ to: cleanEmail, subject, body: emailBody });

    return res.status(200).json({ success: true, message: `OTP sent to ${cleanEmail}` });
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ error: err.message || 'Failed to deliver OTP email' });
  }
}
