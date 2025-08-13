// src/utils/messagingActions.ts
import { Linking, Platform } from 'react-native';
import Toast from 'react-native-toast-message';

const showToast = (title: string, msg?: string) =>
    Toast.show({ type: 'error', text1: title, ...(msg ? { text2: msg } : {}) });

const DEFAULT_COUNTRY_CODE = '92'; // Pakistan. Change if needed.

function normalizeForIntl(phone?: string, cc: string = DEFAULT_COUNTRY_CODE) {
    let p = (phone || '').replace(/\s+/g, '');
    if (!p) return '';

    // Already +E.164
    if (p.startsWith('+')) return p;

    // Local 03XXXXXXXXX → +92XXXXXXXXXX
    if (/^0\d{9,}$/.test(p)) return `+${cc}${p.slice(1)}`;

    // Bare digits without plus (assume they already included country code)
    if (/^\d{10,15}$/.test(p)) return `+${p}`;

    // Fallback: strip junk and add plus
    p = p.replace(/[^\d]/g, '');
    return p ? `+${p}` : '';
}

export async function openSms(phone?: string, body?: string) {
    const num = (phone || '').replace(/[^\d+]/g, '');
    if (!num) return showToast('Phone number missing');
    const scheme = Platform.select({ android: 'smsto', ios: 'sms' })!;
    const url = body ? `${scheme}:${num}?body=${encodeURIComponent(body)}` : `${scheme}:${num}`;
    try {
        const ok = await Linking.canOpenURL(url);
        if (!ok) return showToast('No SMS app found', 'Install Messages to send SMS.');
        await Linking.openURL(url);
    } catch {
        showToast('Could not open SMS');
    }
}

export async function openWhatsApp(phone?: string, text?: string) {
    const intl = normalizeForIntl(phone);
    if (!intl) return showToast('Phone number missing');

    // Both forms usually work; prefer the app URL first.
    const appUrl = `whatsapp://send?phone=${encodeURIComponent(intl)}${text ? `&text=${encodeURIComponent(text)}` : ''}`;
    const webUrl = `https://wa.me/${encodeURIComponent(intl.replace('+', ''))}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

    try {
        const ok = await Linking.canOpenURL(appUrl);
        if (ok) return Linking.openURL(appUrl);

        const okWeb = await Linking.canOpenURL(webUrl);
        if (okWeb) return Linking.openURL(webUrl);

        showToast('WhatsApp not available', 'Install WhatsApp to send messages.');
    } catch {
        showToast('Could not open WhatsApp');
    }
}

export async function openTelegram(phone?: string, text?: string) {
    // Telegram can’t start by phone-only reliably; a username link is best.
    // If you have usernames, use tg://resolve?domain=<username>
    // Here we fallback to share text.
    const appUrl = `tg://msg?text=${encodeURIComponent(text || '')}`;
    const webUrl = `https://t.me/share/url?url=${encodeURIComponent(text || '')}`;
    try {
        const ok = await Linking.canOpenURL(appUrl);
        if (ok) return Linking.openURL(appUrl);

        const okWeb = await Linking.canOpenURL(webUrl);
        if (okWeb) return Linking.openURL(webUrl);

        showToast('Telegram not available', 'Install Telegram to send messages.');
    } catch {
        showToast('Could not open Telegram');
    }
}
