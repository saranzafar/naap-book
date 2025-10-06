// services/SessionStorage.ts
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'naapbook-auth' });

const SessionStorage = {
    async save(key: string, value: unknown) {
        storage.set(key, JSON.stringify(value));
    },
    async get<T = any>(key: string): Promise<T | null> {
        const raw = storage.getString(key);
        return raw ? (JSON.parse(raw) as T) : null;
    },
    async remove(key: string) {
        storage.delete(key);
    },
};

export default SessionStorage;
