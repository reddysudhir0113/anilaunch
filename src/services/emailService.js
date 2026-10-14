/**
 * Email Service for AniLaunch
 * Uses EmailJS to send real emails (Gmail etc.) directly from the browser — no backend needed.
 *
 * SETUP STEPS for users:
 *  1. Sign up free at https://www.emailjs.com
 *  2. Create a Service (Gmail, Outlook, etc.) → copy the Service ID
 *  3. Create an Email Template with variables: {{to_email}}, {{subject}}, {{message}}, {{anime_title}}, {{episode_number}}
 *  4. Copy your Public Key from the EmailJS dashboard
 *  5. Enter these credentials in AniLaunch Settings → Email Notifications
 *
 * Free tier: 200 emails/month with no credit card required.
 */

import emailjs from '@emailjs/browser';
import { safeGetItem, safeSetItem } from './localStorage';

const EMAILJS_CONFIG_KEY = 'anilaunch_emailjs_config';

/**
 * Reads stored EmailJS configuration
 * @returns {{ serviceId: string, templateId: string, publicKey: string }}
 */
export function getEmailJSConfig() {
  return safeGetItem(EMAILJS_CONFIG_KEY, {
    serviceId: '',
    templateId: '',
    publicKey: '',
  });
}

/**
 * Saves EmailJS configuration
 * @param {{ serviceId: string, templateId: string, publicKey: string }} config
 */
export function saveEmailJSConfig(config) {
  safeSetItem(EMAILJS_CONFIG_KEY, config);
}

/**
 * Returns true if EmailJS is configured and ready to use
 * @returns {boolean}
 */
export function isEmailJSConfigured() {
  const { serviceId, templateId, publicKey } = getEmailJSConfig();
  return Boolean(serviceId?.trim() && templateId?.trim() && publicKey?.trim());
}

/**
 * Sends a test email immediately via EmailJS
 * @param {string} toEmail - Recipient email address
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function sendTestEmail(toEmail) {
  if (!toEmail?.trim()) {
    return { success: false, message: 'No destination email configured. Enter your email in Settings → Email.' };
  }

  const { serviceId, templateId, publicKey } = getEmailJSConfig();

  if (!serviceId || !templateId || !publicKey) {
    return {
      success: false,
      message: 'EmailJS not configured. Add your Service ID, Template ID, and Public Key in Settings → Email Setup.',
    };
  }

  try {
    const templateParams = {
      to_email: toEmail,
      subject: '🚀 AniLaunch Test Notification',
      message: 'This is a test notification from AniLaunch! Your email alerts are working correctly.',
      anime_title: 'Test Anime',
      episode_number: 'N/A',
      app_name: 'AniLaunch',
    };

    await emailjs.send(serviceId, templateId, templateParams, publicKey);
    return { success: true, message: `Test email sent to ${toEmail}` };
  } catch (err) {
    console.error('EmailJS send error:', err);
    return {
      success: false,
      message: `Email send failed: ${err?.text || err?.message || 'Unknown error. Check your EmailJS credentials.'}`,
    };
  }
}

/**
 * Sends an episode release notification email
 * @param {string} toEmail - Recipient email
 * @param {{ animeTitle: string, episodeNumber: number, message: string }} payload
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function sendEpisodeNotificationEmail(toEmail, { animeTitle, episodeNumber, message }) {
  if (!toEmail?.trim() || !isEmailJSConfigured()) return { success: false, message: 'Email not configured.' };

  const { serviceId, templateId, publicKey } = getEmailJSConfig();

  try {
    const templateParams = {
      to_email: toEmail,
      subject: `🚀 ${animeTitle} — Episode ${episodeNumber} is Launching!`,
      message: message || `${animeTitle} Episode ${episodeNumber} is launching soon!`,
      anime_title: animeTitle,
      episode_number: String(episodeNumber),
      app_name: 'AniLaunch',
    };

    await emailjs.send(serviceId, templateId, templateParams, publicKey);
    return { success: true, message: 'Email sent.' };
  } catch (err) {
    console.error('EmailJS episode notification error:', err);
    return { success: false, message: err?.text || err?.message || 'Email send failed.' };
  }
}
