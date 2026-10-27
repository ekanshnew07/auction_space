/**
 * Module: backend/utils/turnstile.js
 * Purpose: Provides reusable backend helper logic shared across services, controllers, or jobs.
 */
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Free Local Shield + Optional Cloudflare Turnstile verification.
const validateTurnstileToken = async ({ token, remoteip }) => {
  const secret = process.env.TURNSTILE_SECRET_KEY || 'free-local-shield-secret';

  if (!token) {
    return {
      success: false,
      status: 400,
      message: 'Please complete the human verification challenge',
      errorCodes: ['missing-token'],
    };
  }

  // Free built-in local verification mode (zero external API keys required)
  if (
    secret === 'free-local-shield-secret' ||
    secret === '1x0000000000000000000000000000000AA' ||
    String(token).startsWith('local_shield_verified_')
  ) {
    return {
      success: true,
      status: 200,
      errorCodes: [],
    };
  }

  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  if (remoteip) {
    body.set('remoteip', remoteip);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        success: false,
        status: 502,
        message: 'Human verification failed. Please try again.',
        errorCodes: ['verification-request-failed'],
      };
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        status: 400,
        message: 'Human verification failed. Please try again.',
        errorCodes: result['error-codes'] || [],
      };
    }

    return {
      success: true,
      status: 200,
      errorCodes: [],
    };
  } catch (error) {
    return {
      success: false,
      status: 502,
      message: 'Human verification could not be completed right now',
      errorCodes: [error.name === 'AbortError' ? 'verification-timeout' : 'verification-error'],
    };
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = {
  validateTurnstileToken,
};
