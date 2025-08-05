import { MMKV } from 'react-native-mmkv';
import { Client } from '../types/Client';
// import { v4 as uuidv4 } from 'uuid';

// === Type Definitions ===
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

interface RootData {
  app_settings: AppSettings;
  users: UsersMap;
  app_metadata: AppMetadata;
}

// === MMKV Setup ===
export const storage = new MMKV({
  id: 'naapbook',
  encryptionKey: 'naapbook-encryption-key', // Ideally set from env/secure store
});

// === Keys Used in MMKV ===
const ROOT_KEY = 'naapbook_data';

// === Utility Functions ===

// Safe JSON parsing
function safeParse<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// === Default Data for First Install ===
const getDefaultData = (): RootData => ({
  app_settings: {
    preferred_unit: 'inches',
    theme: 'light',
    language: 'en',
    version: '1.0.0',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  users: {},
  app_metadata: {
    total_clients: 0,
    last_backup: '',
    data_version: '1.0',
  },
});

// === Core Storage API ===

function getRootData(): RootData {
  return safeParse(storage.getString(ROOT_KEY), getDefaultData());
}

function setRootData(data: RootData): void {
  storage.set(ROOT_KEY, JSON.stringify(data));
}

// --- CRUD Operations for Users ---

export async function saveUser(user: User): Promise<void> {
  console.log("I got user: ", user);

  const data = getRootData();
  console.log("Current Data: ", data);

  const isNew = !data.users[user.id];
  data.users[user.id] = user;
  if (isNew) data.app_metadata.total_clients++;
  data.app_metadata.last_backup = new Date().toISOString();
  let res = setRootData(data);
  console.log("Res: ",res);
}

export async function getUser(id: string): Promise<User | null> {
  const data = getRootData();
  return data.users[id] || null;
}

export async function getAllUsers(): Promise<User[]> {
  const data = getRootData();
  return Object.values(data.users);
}

export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
  const data = getRootData();
  const user = data.users[id];
  if (!user) throw new Error('User not found');
  data.users[id] = {
    ...user,
    ...updates,
    updated_at: new Date().toISOString(),
  };
  setRootData(data);
}

export async function deleteUser(id: string): Promise<void> {
  const data = getRootData();
  if (!data.users[id]) throw new Error('User not found');
  delete data.users[id];
  data.app_metadata.total_clients = Math.max(0, data.app_metadata.total_clients - 1);
  setRootData(data);
}

// --- Search and Filter Operations ---

export async function searchUsers(query: string): Promise<User[]> {
  const users = await getAllUsers();
  const q = query.toLowerCase();
  return users.filter(
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
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    // sortBy === 'date'
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
  return order === 'desc' ? sorted.reverse() : sorted;
}

// --- Settings Management ---

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

// --- Data Management ---

export async function exportAllData(): Promise<string> {
  return JSON.stringify(getRootData(), null, 2);
}

export async function importData(jsonData: string): Promise<{ success: boolean; message: string }> {
  try {
    const imported = JSON.parse(jsonData) as RootData;
    setRootData(imported);
    return { success: true, message: 'Data imported successfully' };
  } catch {
    return { success: false, message: 'Invalid JSON format' };
  }
}

export async function clearAllData(): Promise<void> {
  setRootData(getDefaultData());
}

// --- Data Statistics ---

export async function getDataStatistics(): Promise<{
  totalClients: number;
  totalMeasurements: number;
  lastBackup: string;
}> {
  const data = getRootData();
  const totalClients = Object.keys(data.users).length;
  let totalMeasurements = 0;
  for (const user of Object.values(data.users)) {
    totalMeasurements += Object.keys(user.measurements).length;
  }
  return {
    totalClients,
    totalMeasurements,
    lastBackup: data.app_metadata.last_backup,
  };
}

// --- Validation Functions ---

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


// New Block 
// export async function getAllClients(): Promise<Client[]> {
//   const raw = storage.getString('users');
//   if (!raw) return [];
//   let data;
//   try {
//     data = JSON.parse(raw);
//     console.log("data: ", data);
    
//   } catch {
//     return [];
//   }
//   // Defensive: handle possible object shapes (_j, array, etc)
//   if (Array.isArray(data)) return data;
//   if (data && Array.isArray(data._j)) return data._j;
//   return Object.values(data); // fallback
// }


export async function getAllClients(): Promise<User[]> {
  const data = getRootData();
  return Object.values(data.users);
}
