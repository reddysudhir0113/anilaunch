/**
 * Settings Page for AniLaunch (Clean Claymorphism Light Style)
 */

import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Mail,
  HardDrive,
  Download,
  Upload,
  Check,
  Info,
  Sparkles,
  Globe,
  Loader2,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { useAnime } from '../context/AnimeContext';
import { useNotifications } from '../context/NotificationContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { sendTestEmail, getEmailJSConfig, saveEmailJSConfig, isEmailJSConfigured } from '../services/emailService';

export default function Settings() {
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    clearAllData,
    loadDemoAnime,
  } = useAnime();

  const {
    permissionStatus,
    requestPermission,
    addToast,
  } = useNotifications();

  const [formData, setFormData] = useState({
    displayName: settings.displayName || 'Cosmic Pilot',
    themeAccent: settings.themeAccent || 'violet',
    defaultCalendarView: settings.defaultCalendarView || 'weekly',
    timezone: settings.timezone || 'UTC',
    emailReminders: {
      enabled: settings.emailReminders?.enabled || false,
      email: settings.emailReminders?.email || '',
      leadMinutes: settings.emailReminders?.leadMinutes ?? 60,
    },
    completedCleanup: {
      autoDelete: settings.completedCleanup?.autoDelete || false,
      retentionDays: settings.completedCleanup?.retentionDays || 30,
    },
  });

  // EmailJS credentials for real Gmail/email sending (no backend needed)
  const [emailJSConfig, setEmailJSConfig] = useState(() => getEmailJSConfig());
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef(null);


  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings(formData);
    saveEmailJSConfig(emailJSConfig); // persist EmailJS credentials alongside settings
    setIsSaved(true);
    addToast({
      title: 'Settings Saved',
      message: 'Your station configuration was saved locally.',
      type: 'success',
    });
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExportJSON = () => {
    const payload = exportData();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `anilaunch_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast({
      title: 'Backup Exported',
      message: 'AniLaunch library JSON was downloaded.',
      type: 'success',
    });
  };

  const handleImportFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const result = importData(parsed, false);
        if (result.success) {
          addToast({
            title: 'Import Successful',
            message: result.message,
            type: 'success',
          });
        } else {
          alert('Import failed: ' + result.message);
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /** In-app toast test only */
  const handleTestNotification = () => {
    addToast({
      title: 'Test Launch Alert! 🚀',
      message: 'In-app notification system is responsive and ready.',
      type: 'launch',
    });
  };

  /**
   * Immediately sends a real test email to Gmail via EmailJS — no backend needed.
   * Fires instantly when the user clicks "Send Test Email".
   */
  const handleTestEmailNotification = async () => {
    const email = formData.emailReminders.email?.trim();
    if (!email) {
      addToast({
        title: 'No Email Set',
        message: 'Enter your destination email address in the field above first.',
        type: 'warning',
      });
      return;
    }
    // Persist credentials before sending
    saveEmailJSConfig(emailJSConfig);

    const { serviceId, templateId, publicKey } = emailJSConfig;
    if (!serviceId?.trim() || !templateId?.trim() || !publicKey?.trim()) {
      addToast({
        title: 'EmailJS Not Configured',
        message: 'Fill in your EmailJS Service ID, Template ID, and Public Key in the Email Setup section below.',
        type: 'warning',
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      const result = await sendTestEmail(email);
      addToast({
        title: result.success ? '📧 Test Email Sent!' : 'Email Send Failed',
        message: result.message,
        type: result.success ? 'success' : 'warning',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const [copiedTemplate, setCopiedTemplate] = useState(false);

  /**
   * One-click immediate Gmail test: opens Gmail web directly with pre-composed notification
   */
  const handleDirectGmailTest = () => {
    const toEmail = formData.emailReminders.email?.trim() || '';
    const subject = encodeURIComponent('🚀 AniLaunch Test Alert: Episode Ready');
    const body = encodeURIComponent(
      `Cosmic Pilot Alert!\n\nThis is a test notification from AniLaunch Station.\nYour anime release countdown and reminder alerts are active!\n\nDestination: ${toEmail || 'Your Gmail'}\nStatus: System Operational\nTimestamp: ${new Date().toLocaleString()}`
    );
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    addToast({
      title: 'Gmail Web Opened 🚀',
      message: 'Direct Gmail compose window opened with test alert ready to dispatch.',
      type: 'success',
    });
  };

  /** Copies EmailJS template format */
  const handleCopyTemplateVariables = () => {
    const text = `Subject: {{subject}}\nTo Email: {{to_email}}\nMessage:\n{{message}}\n\nAnime: {{anime_title}}\nEpisode: {{episode_number}}`;
    navigator.clipboard.writeText(text);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
    addToast({
      title: 'Template Variables Copied',
      message: 'Paste these variables into your EmailJS template settings.',
      type: 'info',
    });
  };


  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-indigo-600" />
          Mission Settings & Station Config
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Customize your experience, configure browser alerts, and manage local data backup.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Pilot Profile with 3D Anime Pilot Character */}
        <div className="p-6 rounded-3xl clay-card space-y-5">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-clay-subtle border border-indigo-100 flex-shrink-0">
              <img src="./pilot-avatar.jpg" alt="Pilot Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                Pilot Profile & Station Setup
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Personal station call-sign and appearance
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Display Name / Call Sign
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full rounded-2xl px-4 py-2.5 clay-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Local Timezone
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full rounded-2xl pl-9 pr-4 py-2.5 clay-input text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Default Calendar View
              </label>
              <select
                value={formData.defaultCalendarView}
                onChange={(e) => setFormData({ ...formData, defaultCalendarView: e.target.value })}
                className="w-full rounded-2xl px-3 py-2.5 clay-input text-sm"
              >
                <option value="weekly">Weekly Columns (7-Day Overview)</option>
                <option value="monthly">Monthly Grid (Full Month Calendar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Theme Visual Style
              </label>
              <select
                value={formData.themeAccent}
                onChange={(e) => setFormData({ ...formData, themeAccent: e.target.value })}
                className="w-full rounded-2xl px-3 py-2.5 clay-input text-sm"
              >
                <option value="violet">Tactile Claymorphism (Light & Clean)</option>
                <option value="cyan">Soft Sky Pastel</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Browser Notifications */}
        <div className="p-6 rounded-3xl clay-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              Browser Notifications
            </h2>
            <span
              className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase font-mono ${
                permissionStatus === 'granted'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}
            >
              Status: {permissionStatus}
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            AniLaunch dispatches browser notification popups when upcoming episodes air while this website is open in your browser.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {permissionStatus !== 'granted' && (
              <button
                type="button"
                onClick={requestPermission}
                className="px-4 py-2 rounded-2xl clay-btn-primary text-white font-bold text-xs shadow-sm"
              >
                Request Browser Permission
              </button>
            )}

            <button
              type="button"
              onClick={handleTestNotification}
              className="px-4 py-2 rounded-2xl clay-btn-secondary text-slate-700 font-bold text-xs"
            >
              Trigger Test Notification
            </button>
          </div>
        </div>

        {/* Section 3: Email Reminder Preferences */}
        <div className="p-6 rounded-3xl clay-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-600" />
              Email Reminder Preferences
            </h2>
            {/* Enable toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs font-bold text-slate-600">Enable Emails</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.emailReminders.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emailReminders: { ...formData.emailReminders, enabled: e.target.checked },
                    })
                  }
                  className="sr-only"
                />
                <div
                  className={`w-10 h-5 rounded-full transition-colors ${
                    formData.emailReminders.enabled ? 'bg-indigo-500' : 'bg-slate-300'
                  }`}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      emailReminders: { ...formData.emailReminders, enabled: !formData.emailReminders.enabled },
                    })
                  }
                />
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    formData.emailReminders.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      emailReminders: { ...formData.emailReminders, enabled: !formData.emailReminders.enabled },
                    })
                  }
                />
              </div>
            </label>
          </div>

          {/* Info banner — powered by EmailJS now */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3 text-xs text-slate-600">
            <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-900 block mb-0.5">Powered by EmailJS — No Backend Needed:</strong>
              AniLaunch uses{' '}
              <a
                href="https://www.emailjs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 font-bold underline underline-offset-2"
              >
                EmailJS (free tier)
              </a>{' '}
              to send real Gmail alerts directly from your browser. Sign up free → create a Service + Template → paste
              your credentials below. 200 free emails/month, no credit card.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Destination Email (Gmail or any)
              </label>
              <input
                type="email"
                placeholder="pilot@gmail.com"
                value={formData.emailReminders.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emailReminders: { ...formData.emailReminders, email: e.target.value },
                  })
                }
                className="w-full rounded-2xl px-4 py-2.5 clay-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Default Launch Lead Time
              </label>
              <select
                value={formData.emailReminders.leadMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emailReminders: { ...formData.emailReminders, leadMinutes: Number(e.target.value) },
                  })
                }
                className="w-full rounded-2xl px-3 py-2.5 clay-input text-sm"
              >
                <option value={0}>At exact release time</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before (Recommended)</option>
                <option value={1440}>1 day before</option>
              </select>
            </div>
          </div>

          {/* EmailJS Credentials */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                EmailJS Setup Credentials
              </span>
              <a
                href="https://www.emailjs.com/docs/tutorial/overview/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-indigo-500 font-bold flex items-center gap-1 hover:underline"
              >
                Setup Guide <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Service ID</label>
                <input
                  type="text"
                  placeholder="service_xxxxxxx"
                  value={emailJSConfig.serviceId}
                  onChange={(e) => setEmailJSConfig({ ...emailJSConfig, serviceId: e.target.value })}
                  className="w-full rounded-xl px-3 py-2 clay-input text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Template ID</label>
                <input
                  type="text"
                  placeholder="template_xxxxxxx"
                  value={emailJSConfig.templateId}
                  onChange={(e) => setEmailJSConfig({ ...emailJSConfig, templateId: e.target.value })}
                  className="w-full rounded-xl px-3 py-2 clay-input text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Public Key</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••"
                  value={emailJSConfig.publicKey}
                  onChange={(e) => setEmailJSConfig({ ...emailJSConfig, publicKey: e.target.value })}
                  className="w-full rounded-xl px-3 py-2 clay-input text-xs font-mono"
                />
              </div>
            </div>

            {/* Template ID Explainer & Variable Helper */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-600" />
                  What is a Template ID?
                </span>
                <button
                  type="button"
                  onClick={handleCopyTemplateVariables}
                  className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  {copiedTemplate ? 'Copied to Clipboard!' : 'Copy Template Format'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                In EmailJS, your <strong>Template ID</strong> (e.g. <code className="bg-white px-1.5 py-0.5 rounded text-indigo-600 font-mono border border-indigo-100">template_xxxxxxx</code>) is the unique identifier of the email design created in your EmailJS dashboard. It tells EmailJS how to format your anime launch alerts:
              </p>
              <div className="bg-white p-2.5 rounded-xl border border-indigo-100/80 font-mono text-[10px] text-slate-600 space-y-1 select-all">
                <div><strong>To Email setting:</strong> <span className="text-indigo-600">{`{{to_email}}`}</span></div>
                <div><strong>Subject:</strong> <span className="text-indigo-600">{`{{subject}}`}</span></div>
                <div><strong>Content:</strong> <span className="text-indigo-600">{`{{message}}`}</span> (Anime: {`{{anime_title}}`}, Episode: {`{{episode_number}}`})</div>
              </div>
            </div>

            {/* Test email action buttons */}
            <div className="pt-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestEmailNotification}
                  disabled={isSendingEmail}
                  className="px-4 py-2 rounded-2xl clay-btn-primary text-white font-bold text-xs flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSendingEmail ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Mail className="w-3.5 h-3.5" />
                  )}
                  {isSendingEmail ? 'Sending via EmailJS...' : 'Send Test via EmailJS →'}
                </button>

                <button
                  type="button"
                  onClick={handleDirectGmailTest}
                  className="px-4 py-2 rounded-2xl clay-btn-secondary text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer hover:text-indigo-600"
                  title="Immediately opens Gmail compose with pre-filled test message without needing EmailJS setup"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Test Direct in Gmail (Instant) ↗</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 font-medium">
                Click <strong>Test Direct in Gmail</strong> for an immediate zero-setup test alert, or configure EmailJS above for automated background delivery.
              </p>
            </div>
          </div>
        </div>


        {/* Section 4: Completed Anime Auto-Cleanup */}
        <div className="p-6 rounded-3xl clay-card space-y-4">
          <h2 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-600" />
            Completed Anime Retention & Storage
          </h2>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoDelete"
              checked={formData.completedCleanup.autoDelete}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  completedCleanup: { ...formData.completedCleanup, autoDelete: e.target.checked },
                })
              }
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <label htmlFor="autoDelete" className="text-xs font-bold text-slate-700 cursor-pointer">
              Automatically delete completed anime and cached images after retention period
            </label>
          </div>

          {formData.completedCleanup.autoDelete && (
            <div className="max-w-xs pl-7">
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Retention Window
              </label>
              <select
                value={formData.completedCleanup.retentionDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    completedCleanup: { ...formData.completedCleanup, retentionDays: Number(e.target.value) },
                  })
                }
                className="w-full rounded-2xl px-3 py-2 clay-input text-xs"
              >
                <option value={15}>15 days after completion</option>
                <option value={30}>30 days after completion</option>
                <option value={60}>60 days after completion</option>
                <option value={90}>90 days after completion</option>
              </select>
            </div>
          )}

          <p className="text-[11px] text-slate-400 font-medium pl-7">
            Cleanup checks execute on app initialization. A frontend-only client cannot run tasks while the browser tab is closed.
          </p>
        </div>

        {/* Save Settings Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-7 py-3 rounded-2xl clay-btn-primary text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            {isSaved ? <Check className="w-4 h-4" /> : null}
            <span>{isSaved ? 'Preferences Saved!' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>

      {/* Section 5: Data Management & Backup */}
      <div className="p-6 rounded-3xl clay-card space-y-4">
        <h2 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-indigo-600" />
          Library Backup & Synchronization
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          Your data is stored locally in your browser's LocalStorage and IndexedDB. Export a JSON backup to transfer your watchlist between devices or browsers.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-4 py-2.5 rounded-2xl clay-btn-secondary text-slate-700 text-xs font-bold flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span>Export Library JSON</span>
          </button>

          <label className="px-4 py-2.5 rounded-2xl clay-btn-secondary text-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-indigo-500" />
            <span>Import JSON Backup</span>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportFileSelect}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={loadDemoAnime}
            className="px-4 py-2.5 rounded-2xl clay-btn-secondary text-indigo-600 text-xs font-bold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Reload Starter Demo Pack</span>
          </button>
        </div>

        {/* Clear Data */}
        <div className="mt-8 pt-6 border-t border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500">
              Clear All Local Data
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Permanently purges all anime records, IndexedDB image blobs, and settings from this browser origin.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all self-start sm:self-auto cursor-pointer"
          >
            Clear Station Data
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Wipe All AniLaunch Data?"
        message="This action will delete all tracked anime entries, custom uploaded posters from IndexedDB, and notification logs. Make sure you have exported a JSON backup first!"
        confirmText="Yes, Wipe All Data"
        cancelText="Cancel"
        variant="danger"
        onConfirm={async () => {
          await clearAllData();
          setShowClearConfirm(false);
          addToast({
            title: 'Station Cleared',
            message: 'All local data was reset.',
            type: 'info',
          });
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
