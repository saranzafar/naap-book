import { MMKV } from 'react-native-mmkv';
import { getClientByIdSync, readClients, writeClients } from '../services/StorageService';
import { Client } from '../types/Client';
// import { v4 as uuidv4 } from 'uuid';

/* === TYPE DEFINITIONS === */

export type Measurement = {
    value: number;
    notes?: string;
};

export type CustomField = {
    name: string;
    value: number;
    notes?: string;
};

export type Measurements = {
    chest?: Measurement;
    shoulder?: Measurement;
    arm_length?: Measurement;
    collar?: Measurement;
    shirt_length?: Measurement;
    waist?: Measurement;
    hips?: Measurement;
    trouser_length?: Measurement;
    inseam?: Measurement;
    custom_fields?: Record<string, CustomField>;
};

export type User = {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    measurements: Measurements;
};

export type AppSettings = {
    preferred_unit: 'inches' | 'cm';
    theme: 'light' | 'dark';
    language: string;
    version: string;
    created_at: string;
    updated_at: string;
};

export type AppMetadata = {
    total_clients: number;
    last_backup: string;
    data_version: string;
};

type UsersMap = Record<string, User>;

export interface RootData {
    app_settings: AppSettings;
    users: UsersMap;
    app_metadata: AppMetadata;
}

/* === MMKV STORAGE === */

const MMKV_STORAGE_KEY = 'naapbook_data';

export const storage = new MMKV({
    id: 'naapbook',
    encryptionKey: 'naapbook-encryption-key', // Should be securely generated/stored in prod!
});

/* === UTILS === */

// Safe JSON parse with fallback
function safeParse<T>(data: string | undefined, fallback: T): T {
    try {
        return data ? JSON.parse(data) as T : fallback;
    } catch {
        return fallback;
    }
}

// Default data structure (for first launch/reset)
function getDefaultData(): RootData {
    const now = new Date().toISOString();
    return {
        app_settings: {
            preferred_unit: 'inches',
            theme: 'light',
            language: 'en',
            version: '1.0.0',
            created_at: now,
            updated_at: now,
        },
        users: {},
        app_metadata: {
            total_clients: 0,
            last_backup: '',
            data_version: '1.0',
        },
    };
}

// Read whole root data
function getRootData(): RootData {
    return safeParse(storage.getString(MMKV_STORAGE_KEY), getDefaultData());
}

// Write whole root data
function setRootData(data: RootData): void {
    storage.set(MMKV_STORAGE_KEY, JSON.stringify(data));
}

/* === USER CRUD === */

// Add or update user (idempotent, timestamped)
export async function saveUser(user: User): Promise<void> {
    const data = getRootData();
    const isNew = !data.users[user.id];
    data.users[user.id] = user;
    if (isNew) data.app_metadata.total_clients++;
    data.app_metadata.last_backup = new Date().toISOString();
    setRootData(data);
}

export async function getUser(id: string): Promise<User | null> {
    return getRootData().users[id] || null;
}

export async function getAllUsers(): Promise<User[]> {
    return Object.values(getRootData().users);
}

export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
    const data = getRootData();
    if (!data.users[id]) throw new Error('User not found');
    data.users[id] = {
        ...data.users[id],
        ...updates,
        updated_at: new Date().toISOString(),
    };
    setRootData(data);
}

export async function deleteUser(id: string): Promise<void> {
    const data = getRootData();
    if (data.users[id]) {
        delete data.users[id];
        data.app_metadata.total_clients = Math.max(0, data.app_metadata.total_clients - 1);
        setRootData(data);
    }
}

/* === SEARCH, FILTER, SORT === */

export async function searchUsers(query: string): Promise<User[]> {
    const q = query.trim().toLowerCase();
    return (await getAllUsers()).filter(
        u =>
            u.name.toLowerCase().includes(q) ||
            (u.phone && u.phone.includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q))
    );
}

export async function sortUsers(
    users: User[],
    sortBy: 'name' | 'date' = 'name',
    order: 'asc' | 'desc' = 'asc'
): Promise<User[]> {
    const sorted = [...users].sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        // sortBy === 'date'
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    return order === 'desc' ? sorted.reverse() : sorted;
}

/* === SETTINGS MANAGEMENT === */

export async function getAppSettings(): Promise<AppSettings> {
    return getRootData().app_settings;
}

export async function updateAppSettings(settings: Partial<AppSettings>): Promise<void> {
    const data = getRootData();
    data.app_settings = {
        ...data.app_settings,
        ...settings,
        updated_at: new Date().toISOString(),
    };
    setRootData(data);
}

export async function resetAppSettings(): Promise<void> {
    const data = getRootData();
    data.app_settings = getDefaultData().app_settings;
    setRootData(data);
}

/* === DATA BACKUP/RESTORE === */

export async function exportAllData(): Promise<string> {
    return JSON.stringify(getRootData(), null, 2);
}

export async function importData(jsonData: string): Promise<{ success: boolean; message: string }> {
    try {
        const imported = JSON.parse(jsonData) as RootData;
        setRootData(imported);
        return { success: true, message: 'Data imported successfully.' };
    } catch {
        return { success: false, message: 'Invalid JSON format.' };
    }
}

export async function clearAllData(): Promise<void> {
    setRootData(getDefaultData());
}

/* === DATA STATISTICS === */

export async function getDataStatistics(): Promise<{
    totalClients: number;
    totalMeasurements: number;
    lastBackup: string;
}> {
    const data = getRootData();
    let totalMeasurements = 0;
    for (const user of Object.values(data.users)) {
        totalMeasurements += Object.keys(user.measurements).length;
    }
    return {
        totalClients: Object.keys(data.users).length,
        totalMeasurements,
        lastBackup: data.app_metadata.last_backup,
    };
}

/* === VALIDATION FUNCTIONS === */

export function validateUser(user: Partial<User>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!user.name || user.name.trim().length < 2 || user.name.trim().length > 50) {
        errors.push('Name is required and must be 2-50 characters.');
    }
    if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        errors.push('Invalid email format.');
    }
    if (user.phone && !/^\+?\d{7,15}$/.test(user.phone)) {
        errors.push('Invalid phone number.');
    }
    if (user.address && user.address.length > 200) {
        errors.push('Address max length is 200 characters.');
    }
    if (user.notes && user.notes.length > 300) {
        errors.push('Notes max length is 300 characters.');
    }
    return { isValid: errors.length === 0, errors };
}

export function validateMeasurement(value: number, field: string): { isValid: boolean; error?: string } {
    const ranges: Record<string, [number, number]> = {
        chest: [20, 60],
        shoulder: [10, 30],
        arm_length: [15, 40],
        collar: [10, 25],
        shirt_length: [20, 50],
        waist: [20, 60],
        hips: [25, 70],
        trouser_length: [25, 50],
        inseam: [20, 40],
    };
    const [min, max] = ranges[field] || [0, 9999];
    if (typeof value !== 'number' || value < min || value > max) {
        return { isValid: false, error: `Value for ${field} must be between ${min} and ${max}.` };
    }
    return { isValid: true };
}


// Deep-ish merge that preserves nested measurements/custom_fields
function mergeClient(current: Client, patch: Partial<Client>): Client {
    const merged: Client = { ...current, ...patch, id: current.id };

    if (patch.measurements) {
        merged.measurements = {
            ...(current.measurements || {}),
            ...patch.measurements,
            custom_fields: {
                ...(current.measurements?.custom_fields || {}),
                ...(patch.measurements as any)?.custom_fields,
            },
        } as any;
    }
    // Optional updated_at maintenance
    if ('updated_at' in current) {
        (merged as any).updated_at = new Date().toISOString();
    }
    return merged;
}

export async function getClientById(id: string): Promise<Client | null> {
    return getClientByIdSync(id);
}

export async function updateClient(id: string, patch: Partial<Client>): Promise<Client> {
    const list = readClients();
    const idx = list.findIndex(c => String(c.id) === String(id));
    if (idx === -1) throw new Error('Client not found');

    const updated = mergeClient(list[idx], patch);
    list[idx] = updated;
    writeClients(list);
    return updated;
}