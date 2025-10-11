export interface MeasurementEntry {
    /** Optional so empty fields don't force 0 and so patches can omit */
    value?: string;
    notes?: string;
}

export interface CustomField extends MeasurementEntry {
    name: string;
    value?: string;
    notes?: string;
}

/**
 * Make each measurement optional so:
 * - new clients don't need to fill all
 * - partial updates (edit) can deep-merge safely
 */
export interface Measurements {
    Qameez?: MeasurementEntry;
    Bazu?: MeasurementEntry;
    Teera?: MeasurementEntry;
    Gala?: MeasurementEntry;
    Chati?: MeasurementEntry;
    Qamar?: MeasurementEntry;
    Ghera?: MeasurementEntry;
    Shalwar?: MeasurementEntry;
    Pancha?: MeasurementEntry;
    /** Stored as a map in storage for stable keys */
    custom_fields?: Record<string, CustomField>;
}

export interface Client {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    measurements: Measurements;
}

/** Optional: a handy type for updateClient patch payloads */
export type ClientPatch =
    Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>> & {
        measurements?: Partial<Measurements>;
    };

// Legacy aliases for backward compatibility
export type MeasurementField = MeasurementEntry;