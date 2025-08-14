// services/StorageService.ts
import { MMKV } from 'react-native-mmkv';
import { Client, AddClientFormValues, Measurements } from '../types/Client';

// ---------- MMKV ----------
const storage = new MMKV({ id: 'naapbook' });
const ROOT_KEY = 'naapbook_data';

// ---------- Shapes ----------
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

/** Ensure `next_client_seq` exists and is correct even with pre-existing IDs. */
function ensureNextSeq(data: RootData): number {
  if (!data.app_metadata) data.app_metadata = {};
  let seq = data.app_metadata.next_client_seq;

  if (typeof seq === 'number' && seq > 0) return seq;

  // Compute from existing users: take max n-<num> + 1, fallback to count + 1
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

  if ('updated_at' in current) {
    (merged as any).updated_at = new Date().toISOString();
  }
  return merged;
}

// Coerce any incoming "measurements" shape (string/number values, optional unit) into our persisted Measurements.
// - Drops "unit"
// - Parses numbers safely
// - Accepts both record maps for custom_fields and arrays like [{_key,name,value,notes}]
export function coerceMeasurementsAny(m?: any): Partial<Measurements> | undefined {
  if (!m) return undefined;

  const num = (x: any) => {
    if (x == null) return undefined;
    const n = Number(String(x).replace(',', '.'));
    return Number.isFinite(n) ? n : undefined;
  };

  const fixEntry = (e: any) => {
    if (!e) return undefined;
    const v = num(e.value);
    const out: any = {};
    if (v != null) out.value = v;       // keep only value
    if (e.notes?.trim) {
      const n = e.notes.trim();
      if (n) out.notes = n;             // keep notes
    }
    // ignore unit
    return Object.keys(out).length ? out : undefined;
  };

  const out: any = {};

  // Fixed keys
  for (const k of ['chest', 'shoulder', 'arm_length', 'collar', 'shirt_length', 'waist', 'hips', 'trouser_length', 'inseam']) {
    const e = fixEntry(m[k]);
    if (e) out[k] = e;
  }

  // Custom fields: accept map or array
  if (m.custom_fields) {
    if (Array.isArray(m.custom_fields)) {
      const map: any = {};
      m.custom_fields.forEach((item: any, idx: number) => {
        const key = (item?._key as string) || (item?.name?.trim() || `custom_${idx}`);
        const e = fixEntry(item);
        if (!item?.name && !e) return;
        map[key] = { name: (item?.name || '').trim(), ...(e || {}) };
      });
      if (Object.keys(map).length) out.custom_fields = map;
    } else if (typeof m.custom_fields === 'object') {
      const map: any = {};
      for (const [key, cf] of Object.entries(m.custom_fields)) {
        const e = fixEntry(cf);
        const name = (cf as any)?.name?.trim?.() || String(key);
        if (!name && !e) continue;
        map[key] = { name, ...(e || {}) };
      }
      if (Object.keys(map).length) out.custom_fields = map;
    }
  }

  return Object.keys(out).length ? out : {};
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

  // NEW: accept from either place (2nd arg wins), then coerce
  const src = initialMeasurements ?? (form as any)?.measurements;
  const coerced = coerceMeasurementsAny(src) || {};

  const measurements: Measurements = {
    ...base,
    ...coerced,
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

  bumpSeq(data);
  setRootData(data);
  return newClient;
}


/** Get a client by id */
export async function getClientById(id: string): Promise<Client | null> {
  const data = getRootData();
  const key = String(id);
  return data.users[key] ?? null;
}

/** Update a client by id */
export async function updateClient(id: string, patch: Partial<Client>): Promise<Client> {
  const data = getRootData();
  const key = String(id);
  const current = data.users[key];
  if (!current) throw new Error('Client not found');

  // NEW: coerce any incoming measurement shape in the patch
  const patch2: Partial<Client> = { ...patch };
  if (patch.measurements) {
    patch2.measurements = coerceMeasurementsAny(patch.measurements) as any;
  }

  const updated = mergeClient(current, patch2);
  data.users[key] = updated;

  if (!data.app_metadata) data.app_metadata = {};
  data.app_metadata.total_clients = Object.keys(data.users).length;
  data.app_metadata.last_backup = new Date().toISOString();

  setRootData(data);
  return updated;
}

/** Delete a client by id (idempotent) */
export async function deleteClient(id: string): Promise<void> {
  const data = getRootData();
  if (!data.users[id]) return; // ignore if not found
  delete data.users[id];

  if (!data.app_metadata) data.app_metadata = {};
  data.app_metadata.total_clients = Object.keys(data.users).length;
  data.app_metadata.last_backup = new Date().toISOString();

  // IDs remain monotonically increasing; do not decrement next_client_seq
  setRootData(data);
}
