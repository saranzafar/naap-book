// services/StorageService.ts
import { MMKV } from 'react-native-mmkv';
import { Client, Measurements } from '../types/Client';

// ---------- MMKV ----------
const storage = new MMKV({ id: 'naapbook' });
const ROOT_KEY = 'naapbook_data';

// ---------- Shapes ----------
type UsersMap = Record<string, Client>;

interface AppMetadata {
  total_clients?: number;
  last_backup?: string;
  data_version?: string;
  next_client_seq?: number;
}

interface RootData {
  users: UsersMap;
  app_metadata?: AppMetadata;
}

// ---------- Helpers ----------
function safeParse<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function getDefaultData(): RootData {
  return {
    users: {},
    app_metadata: {
      total_clients: 0,
      last_backup: '',
      data_version: '1.0',
      next_client_seq: 1,
    },
  };
}

// --- Pagination + filtering helpers ---
type FilterMode = 'all' | 'name' | 'phone' | 'id';

const _norm = (s: any) => String(s ?? '').toLowerCase().trim();
const _digits = (s: any) => String(s ?? '').replace(/\D+/g, '');
const _idMatches = (idVal: any, q: string) => {
  const idStr = _norm(idVal);
  const qStr = _norm(q);
  if (!qStr) return true;
  if (idStr.includes(qStr)) return true;
  const qNum = _digits(qStr);
  const idNum = _digits(idStr);
  return qNum && idNum ? idNum.includes(qNum) : false;
};

// Stable sort: newest first
function _sortClients(a: Client, b: Client): number {
  const ua = Date.parse(a.updated_at || '') || 0;
  const ub = Date.parse(b.updated_at || '') || 0;
  if (ub !== ua) return ub - ua;

  const ca = Date.parse(a.created_at || '') || 0;
  const cb = Date.parse(b.created_at || '') || 0;
  if (cb !== ca) return cb - ca;

  return (a.name || '').localeCompare(b.name || '');
}

// ---------- Core Accessors ----------
function getRootData(): RootData {
  return safeParse(storage.getString(ROOT_KEY), getDefaultData());
}

function setRootData(data: RootData): void {
  storage.set(ROOT_KEY, JSON.stringify(data));
}

function ensureNextSeq(data: RootData): number {
  if (!data.app_metadata) data.app_metadata = {};
  let seq = data.app_metadata.next_client_seq;
  if (typeof seq === 'number' && seq > 0) return seq;

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

// ---------- Default Measurements ----------
function defaultMeasurements(): Measurements {
  return {
    Qameez: { value: '', notes: '' },
    Bazu: { value: '', notes: '' },
    Teera: { value: '', notes: '' },
    Gala: { value: '', notes: '' },
    Chati: { value: '', notes: '' },
    Qamar: { value: '', notes: '' },
    Ghera: { value: '', notes: '' },
    Shalwar: { value: '', notes: '' },
    Pancha: { value: '', notes: '' },
    custom_fields: {},
  };
}

// ---------- Merge Helper ----------
function mergeClient(current: Client, patch: Partial<Client>): Client {
  const merged: Client = { ...current, ...patch, id: current.id };

  if (patch.measurements) {
    merged.measurements = {
      ...(current.measurements || {}),
      ...patch.measurements,
      custom_fields: {
        ...(current.measurements?.custom_fields || {}),
        ...(patch.measurements?.custom_fields || {}),
      },
    };
  }

  merged.updated_at = new Date().toISOString();
  return merged;
}

// ---------- Coerce Measurement Data ----------
export function coerceMeasurementsAny(m?: any): Partial<Measurements> | undefined {
  if (!m) return undefined;

  const fixEntry = (e: any) => {
    if (!e) return undefined;
    const val = e.value != null ? String(e.value).trim() : '';
    const notes = e.notes?.trim() || '';
    const out: any = {};
    if (val) out.value = val;
    if (notes) out.notes = notes;
    return Object.keys(out).length ? out : undefined;
  };

  const keys = [
    'Qameez',
    'Bazu',
    'Teera',
    'Gala',
    'Chati',
    'Qamar',
    'Ghera',
    'Shalwar',
    'Pancha',
  ] as const;

  const out: any = {};
  for (const k of keys) {
    const e = fixEntry(m[k]);
    if (e) out[k] = e;
  }

  if (m.custom_fields) {
    const map: Record<string, any> = {};
    if (Array.isArray(m.custom_fields)) {
      m.custom_fields.forEach((cf: any, idx: number) => {
        const key = cf._key || cf.name?.trim() || `custom_${idx}`;
        const e = fixEntry(cf);
        if (!key && !e) return;
        map[key] = { name: cf.name?.trim() || key, ...(e || {}) };
      });
    } else {
      for (const [key, cf] of Object.entries(m.custom_fields)) {
        const e = fixEntry(cf);
        const name = (cf as any)?.name?.trim?.() || key;
        if (!name && !e) continue;
        map[key] = { name, ...(e || {}) };
      }
    }
    if (Object.keys(map).length) out.custom_fields = map;
  }

  return Object.keys(out).length ? out : {};
}

// ---------- Public API ----------

export async function getClientsPage(opts: {
  offset?: number;
  limit?: number;
  query?: string;
  mode?: FilterMode;
} = {}): Promise<{
  items: Client[];
  total: number;
  hasMore: boolean;
  offset: number;
  limit: number;
}> {
  const { offset = 0, limit = 20, query = '', mode = 'all' } = opts;

  const data = getRootData();
  const list = Object.values(data.users || {});

  const q = _norm(query);
  const filtered = !q
    ? list
    : list.filter((c) => {
      const nameStr = _norm(c.name);
      const phoneStr = _digits(c.phone || '');
      const idVal = c.id;

      if (mode === 'name') return nameStr.includes(q);
      if (mode === 'phone') {
        const qDigits = _digits(q);
        return qDigits ? phoneStr.includes(qDigits) : false;
      }
      if (mode === 'id') return _idMatches(idVal, q);

      const qDigits = _digits(q);
      return (
        nameStr.includes(q) ||
        (qDigits ? phoneStr.includes(qDigits) : false) ||
        _idMatches(idVal, q)
      );
    });

  filtered.sort(_sortClients);
  const total = filtered.length;
  const slice = filtered.slice(offset, offset + limit);
  const hasMore = offset + slice.length < total;
  return { items: slice, total, hasMore, offset, limit };
}

/** Get all clients */
export async function getAllClients(): Promise<Client[]> {
  return Object.values(getRootData().users);
}

/** Add a new client */
export async function addClient(
  form: Partial<Client>,
  initialMeasurements?: Partial<Measurements>
): Promise<Client> {
  const now = new Date().toISOString();
  const data = getRootData();

  const seq = ensureNextSeq(data);
  const id = `n-${seq}`;

  const base = defaultMeasurements();
  const src = initialMeasurements ?? form.measurements;
  const coerced = coerceMeasurementsAny(src) || {};

  const newClient: Client = {
    id,
    name: form.name?.trim() || '',
    phone: form.phone?.trim(),
    email: form.email?.trim(),
    address: form.address?.trim(),
    notes: form.notes?.trim(),
    created_at: now,
    updated_at: now,
    measurements: { ...base, ...coerced },
  };

  data.users[id] = newClient;
  if (!data.app_metadata) data.app_metadata = {};
  data.app_metadata.total_clients = Object.keys(data.users).length;
  data.app_metadata.last_backup = now;

  bumpSeq(data);
  setRootData(data);
  return newClient;
}

/** Get a client by ID */
export async function getClientById(id: string): Promise<Client | null> {
  return getRootData().users[String(id)] ?? null;
}

/** Update an existing client */
export async function updateClient(id: string, patch: Partial<Client>): Promise<Client> {
  const data = getRootData();
  const key = String(id);
  const current = data.users[key];
  if (!current) throw new Error('Client not found');

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

/** Delete client */
export async function deleteClient(id: string): Promise<void> {
  const data = getRootData();
  if (!data.users[id]) return;
  delete data.users[id];

  if (!data.app_metadata) data.app_metadata = {};
  data.app_metadata.total_clients = Object.keys(data.users).length;
  data.app_metadata.last_backup = new Date().toISOString();

  setRootData(data);
}
