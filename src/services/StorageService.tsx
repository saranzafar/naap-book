// services/StorageService.ts
import { MMKV } from 'react-native-mmkv';
import { Client, AddClientFormValues, Measurements } from '../types/Client';

// ---------- MMKV ----------
const storage = new MMKV({ id: 'naapbook' });
const ROOT_KEY = 'naapbook_data';
const CLIENTS_KEY = 'clients';

// ---------- Internal shapes ----------
type UsersMap = Record<string, Client>;

interface AppMetadata {
  total_clients?: number;
  last_backup?: string;
  data_version?: string;
  /** Next number to use for n-X ID generation */
  next_client_seq?: number;
}

interface RootData {
  users: UsersMap;
  app_metadata?: AppMetadata;
}

// ---------- Helpers ----------
function safeParse<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

function getDefaultData(): RootData {
  return {
    users: {},
    app_metadata: {
      total_clients: 0,
      last_backup: '',
      data_version: '1.0',
      next_client_seq: 1, // start from n-1
    },
  };
}

function getRootData(): RootData {
  return safeParse(storage.getString(ROOT_KEY), getDefaultData());
}

function setRootData(data: RootData): void {
  storage.set(ROOT_KEY, JSON.stringify(data));
}

/** Ensure `next_client_seq` exists and is correct even with legacy IDs. */
function ensureNextSeq(data: RootData): number {
  if (!data.app_metadata) data.app_metadata = {};
  let seq = data.app_metadata.next_client_seq;

  if (typeof seq === 'number' && seq > 0) {
    return seq;
  }

  // Compute from existing users:
  // - Parse all ids that look like "n-<number>" and take max+1
  // - If none found, fallback to (count + 1)
  const ids = Object.keys(data.users || {});
  let maxSeen = 0;

  for (const id of ids) {
    const m = /^n-(\d+)$/.exec(id);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n)) maxSeen = Math.max(maxSeen, n);
    }
  }

  seq = maxSeen > 0 ? maxSeen + 1 : ids.length + 1;
  data.app_metadata.next_client_seq = seq;
  return seq;
}

function bumpSeq(data: RootData): void {
  if (!data.app_metadata) data.app_metadata = {};
  const cur = ensureNextSeq(data);
  data.app_metadata.next_client_seq = cur + 1;
}

function defaultMeasurements(): Measurements {
  return {
    chest: { value: 0, notes: "" },
    shoulder: { value: 0, notes: "" },
    arm_length: { value: 0, notes: "" },
    collar: { value: 0, notes: "" },
    shirt_length: { value: 0, notes: "" },
    waist: { value: 0, notes: "" },
    hips: { value: 0, notes: "" },
    trouser_length: { value: 0, notes: "" },
    inseam: { value: 0, notes: "" },
    custom_fields: {},
  };
}

// ---------- Public API ----------

/** Get all clients as an array */
export async function getAllClients(): Promise<Client[]> {
  const data = getRootData();
  return Object.values(data.users);
}

/** Add a new client with ID "n-<seq>" */
export async function addClient(
  form: AddClientFormValues,
  initialMeasurements?: Partial<Measurements>
): Promise<Client> {
  const now = new Date().toISOString();
  const data = getRootData();

  // Generate sequential id
  const seq = ensureNextSeq(data);
  const id = `n-${seq}`;

  const base = defaultMeasurements();
  const measurements: Measurements = {
    ...base,
    ...(initialMeasurements || {}),
    chest: initialMeasurements?.chest ?? base.chest,
    shoulder: initialMeasurements?.shoulder ?? base.shoulder,
    arm_length: initialMeasurements?.arm_length ?? base.arm_length,
    collar: initialMeasurements?.collar ?? base.collar,
    shirt_length: initialMeasurements?.shirt_length ?? base.shirt_length,
    waist: initialMeasurements?.waist ?? base.waist,
    hips: initialMeasurements?.hips ?? base.hips,
    trouser_length: initialMeasurements?.trouser_length ?? base.trouser_length,
    inseam: initialMeasurements?.inseam ?? base.inseam,
    custom_fields: initialMeasurements?.custom_fields ?? base.custom_fields,
  };

  const newClient: Client = {
    id,
    name: form.name?.trim() || "",
    phone: form.phone?.trim(),
    email: form.email?.trim(),
    address: form.address?.trim(),
    notes: form.notes?.trim(),
    created_at: now,
    updated_at: now,
    measurements,
  };

  data.users[id] = newClient;
  if (!data.app_metadata) data.app_metadata = {};
  data.app_metadata.total_clients = Object.keys(data.users).length;
  data.app_metadata.last_backup = now;

  // bump sequence for next add
  bumpSeq(data);

  setRootData(data);
  return newClient;
}

/** Delete a client by id (idempotent) */
export async function deleteClient(id: string): Promise<void> {
  const data = getRootData();
  if (!data.users[id]) return; // ignore if not found
  delete data.users[id];

  if (!data.app_metadata) data.app_metadata = {};
  data.app_metadata.total_clients = Object.keys(data.users).length;
  data.app_metadata.last_backup = new Date().toISOString();

  // NOTE: we DON'T decrement next_client_seq — IDs are monotonically increasing.
  setRootData(data);
}


export function readClients(): Client[] {
  const raw = storage.getString(CLIENTS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Client[]; } catch { return []; }
}

export function writeClients(list: Client[]): void {
  storage.set(CLIENTS_KEY, JSON.stringify(list));
}

export function getClientByIdSync(id: string): Client | null {
  const list = readClients();
  return list.find(c => String(c.id) === String(id)) ?? null;
}

// Copy legacy array into root map once, then delete the old key.
function migrateClientsArrayIntoRoot(): void {
  const raw = storage.getString(CLIENTS_KEY);
  if (!raw) return;

  let arr: Client[] = [];
  try { arr = JSON.parse(raw) as Client[]; } catch { arr = []; }
  if (!arr.length) {
    storage.delete(CLIENTS_KEY);
    return;
  }

  const data = getRootData();
  let changed = false;

  for (const c of arr) {
    const id = String(c.id);
    if (!data.users[id]) {
      data.users[id] = c;
      changed = true;
    }
  }

  if (changed) {
    if (!data.app_metadata) data.app_metadata = {};
    data.app_metadata.total_clients = Object.keys(data.users).length;
    data.app_metadata.last_backup = new Date().toISOString();
    ensureNextSeq(data); // keep n-<seq> correct
    setRootData(data);
  }

  // Clear legacy key so we never read it again.
  storage.delete(CLIENTS_KEY);
}

// Run migration once at module load
try { migrateClientsArrayIntoRoot(); } catch { /* ignore */ }

// ----------------- Lookup & Update on ROOT MAP ONLY -----------------

// Deep-ish merge that preserves nested measurement/custom_fields trees
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

  // bump updated_at if your model has it
  if ('updated_at' in current) {
    (merged as any).updated_at = new Date().toISOString();
  }
  return merged;
}

export async function getClientById(id: string): Promise<Client | null> {
  // Safety: migration already ran once, but harmless to call again
  migrateClientsArrayIntoRoot();

  const data = getRootData();
  const key = String(id);
  return data.users[key] ?? null;
}

export async function updateClient(id: string, patch: Partial<Client>): Promise<Client> {
  migrateClientsArrayIntoRoot();

  const data = getRootData();
  const key = String(id);
  const current = data.users[key];

  console.log('id for update', key);
  console.log('Users keys in root:', Object.keys(data.users));

  if (!current) throw new Error('Client not found');

  const updated = mergeClient(current, patch);
  data.users[key] = updated;

  if (!data.app_metadata) data.app_metadata = {};
  data.app_metadata.total_clients = Object.keys(data.users).length;
  data.app_metadata.last_backup = new Date().toISOString();

  setRootData(data);
  return updated;
}
