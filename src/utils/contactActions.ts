import { Linking, Platform } from 'react-native';
import Toast from 'react-native-toast-message';

const showToast = (title: string, msg?: string) =>
    Toast.show({ type: 'error', text1: title, ...(msg ? { text2: msg } : {}) });

const sanitizePhone = (p?: string) => (p || '').replace(/[^\d+]/g, '');
const sanitizeEmail = (e?: string) => (e || '').trim();

export async function openDial(phone?: string) {
    const num = sanitizePhone(phone);
    if (!num) return showToast('Phone number missing');
    const url = `tel:${num}`;
    try {
        const ok = await Linking.canOpenURL(url);
        if (!ok) return showToast('No dialer app found', 'Install a Phone app to place calls.');
        await Linking.openURL(url);
    } catch {
        showToast('Could not open dialer');
    }
}

export async function openSms(phone?: string, body?: string) {
    const num = sanitizePhone(phone);
    if (!num) return showToast('Phone number missing');
    const base = Platform.select({ android: 'smsto', ios: 'sms' })!;
    const url = body ? `${base}:${num}?body=${encodeURIComponent(body)}` : `${base}:${num}`;
    try {
        const ok = await Linking.canOpenURL(url);
        if (!ok) return showToast('No SMS app found', 'Install Messages to send SMS.');
        await Linking.openURL(url);
    } catch {
        showToast('Could not open SMS');
    }
}

export async function openEmail(email?: string, subject?: string, body?: string) {
    const to = sanitizeEmail(email);
    if (!to) return showToast('Email address missing');
    const qs: string[] = [];
    if (subject) qs.push(`subject=${encodeURIComponent(subject)}`);
    if (body) qs.push(`body=${encodeURIComponent(body)}`);
    const url = `mailto:${to}${qs.length ? `?${qs.join('&')}` : ''}`;
    try {
        const ok = await Linking.canOpenURL(url);
        if (!ok) return showToast('No email app found', 'Install an email client (e.g., Gmail).');
        await Linking.openURL(url);
    } catch {
        showToast('Could not open email');
    }
}