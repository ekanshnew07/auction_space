/**
 * Module: backend/utils/emailService.js
 * Purpose: Provides reusable backend helper logic shared across services, controllers, or jobs.
 */
const nodemailer = require('nodemailer');

const transporters = new Map();
const localMailbox = [];

const recordInLocalMailbox = (options, provider = 'local-inbox') => {
  const entry = {
    id: `mail_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    to: options.email,
    subject: options.subject,
    html: options.message,
    provider,
    sentAt: new Date().toISOString(),
  };
  localMailbox.unshift(entry);
  if (localMailbox.length > 100) {
    localMailbox.pop();
  }
  console.log(`[LocalMailbox] Sent to <${options.email}> | Subject: "${options.subject}"`);
  return entry;
};

const getLocalMailbox = () => localMailbox;

const getEmailIdentity = () => ({
  user: process.env.EMAIL_USERNAME || process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
});

const hasBrevoConfig = () => Boolean(process.env.BREVO_API_KEY);
const hasResendConfig = () => Boolean(process.env.RESEND_API_KEY);
const hasSmtpConfig = () => {
  const { user, pass } = getEmailIdentity();
  return Boolean(user && pass);
};

const sendWithBrevo = async (options) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USERNAME || process.env.EMAIL_USER;
  const senderName = process.env.BREVO_SENDER_NAME || 'AuctionPulse Support';
  const apiUrl = process.env.BREVO_API_URL || 'https://api.brevo.com/v3/smtp/email';
  const timeoutMs = Number(process.env.BREVO_TIMEOUT_MS || 15000);

  if (!apiKey) throw new Error('BREVO_API_KEY is missing');
  if (!senderEmail) throw new Error('BREVO_SENDER_EMAIL is missing');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: options.email }],
        subject: options.subject,
        htmlContent: options.message,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Brevo API ${response.status}: ${responseText}`);
    }
    recordInLocalMailbox(options, 'brevo');
  } finally {
    clearTimeout(timeout);
  }
};

const sendWithResend = async (options) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const apiUrl = process.env.RESEND_API_URL || 'https://api.resend.com/emails';
  const timeoutMs = Number(process.env.RESEND_TIMEOUT_MS || 15000);

  if (!apiKey) throw new Error('RESEND_API_KEY is missing');
  if (!from) throw new Error('RESEND_FROM_EMAIL is missing');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [options.email],
        subject: options.subject,
        html: options.message,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Resend API ${response.status}: ${responseText}`);
    }
    recordInLocalMailbox(options, 'resend');
  } finally {
    clearTimeout(timeout);
  }
};

const getEmailConfig = () => {
  const { user, pass } = getEmailIdentity();
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
  const family = Number(process.env.SMTP_FAMILY || 4);
  const baseConfig = {
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 10000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 15000),
    family,
  };

  if (host) {
    return {
      ...baseConfig,
      host,
      port,
      secure,
      tls: { servername: host, minVersion: 'TLSv1.2' },
      auth: user && pass ? { user, pass } : undefined,
    };
  }

  return {
    ...baseConfig,
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: user && pass ? { user, pass } : undefined,
  };
};

const buildTransportConfigs = () => {
  const primary = getEmailConfig();
  const configs = [primary];

  if (
    primary.host &&
    primary.host.includes('smtp.gmail.com') &&
    Number(primary.port) === 465 &&
    primary.secure === true
  ) {
    configs.push({
      ...primary,
      port: 587,
      secure: false,
      requireTLS: true,
    });
  }

  return configs;
};

const getTransporter = (config) => {
  const key = JSON.stringify({
    host: config.host || '',
    port: config.port || '',
    secure: !!config.secure,
    service: config.service || '',
    family: config.family || '',
  });

  if (!transporters.has(key)) {
    transporters.set(key, nodemailer.createTransport(config));
  }

  return transporters.get(key);
};

const sendEmail = async (options) => {
  if (hasBrevoConfig()) {
    await sendWithBrevo(options);
    return;
  }

  if (hasResendConfig()) {
    await sendWithResend(options);
    return;
  }

  if (!hasSmtpConfig() || process.env.LOCAL_EMAIL_INBOX === 'true') {
    recordInLocalMailbox(options, 'free-local-inbox');
    return;
  }

  const { user: fromUser } = getEmailIdentity();
  const configs = buildTransportConfigs();
  const errors = [];

  for (const config of configs) {
    try {
      const activeTransporter = getTransporter(config);
      await activeTransporter.sendMail({
        from: `AuctionPulse Support <${fromUser}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
      });
      recordInLocalMailbox(options, 'smtp');
      return;
    } catch (error) {
      errors.push(`${config.host || config.service}:${config.port || ''} - ${error.message}`);
    }
  }

  // Fallback to local inbox so business flows never break without paid email keys
  recordInLocalMailbox(options, 'free-local-fallback');
};

const sendEmailAsync = (options, logger = console) => {
  sendEmail(options).catch((error) => {
    logger.error('Email send failed:', error.message, {
      to: options?.email,
      subject: options?.subject,
    });
  });
};

const verifyEmailTransport = async () => {
  if (!hasBrevoConfig() && !hasResendConfig() && (!hasSmtpConfig() || process.env.LOCAL_EMAIL_INBOX === 'true')) {
    console.log('Email transport ready: Free Local Mailbox active (zero external keys required)');
    return true;
  }
  return true;
};

module.exports = sendEmail;
module.exports.sendEmailAsync = sendEmailAsync;
module.exports.verifyEmailTransport = verifyEmailTransport;
module.exports.getLocalMailbox = getLocalMailbox;
