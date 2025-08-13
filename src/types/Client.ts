// types/clients.ts

/** ---------- Domain (persisted) types ---------- */

export interface MeasurementField {
    /** Optional so empty fields don’t force 0 and so patches can omit */
    value?: number;
    notes?: string;
}

export interface CustomField extends MeasurementField {
    name: string;
}

/**
 * Make each measurement optional so:
 * - new clients don’t need to fill all
 * - partial updates (edit) can deep-merge safely
 */
export interface Measurements {
    chest?: MeasurementField;
    shoulder?: MeasurementField;
    arm_length?: MeasurementField;
    collar?: MeasurementField;
    shirt_length?: MeasurementField;
    waist?: MeasurementField;
    hips?: MeasurementField;
    trouser_length?: MeasurementField;
    inseam?: MeasurementField;

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

/** ---------- UI / Form types (strings for stable typing) ---------- */

export interface MeasurementFieldInput {
    /** keep as string in UI to avoid keyboard closing on Android */
    value: string;     // e.g., "15.5" or ""
    notes?: string;
}

export interface CustomFieldInput extends MeasurementFieldInput {
    /** UI helper key to keep rows stable while editing */
    _key?: string;
    name: string;
}

/**
 * Form-friendly shape:
 * - standard measurements are edited as strings
 * - custom fields are an array for easy add/remove
 */
export interface MeasurementsFormValues {
    chest: MeasurementFieldInput;
    shoulder: MeasurementFieldInput;
    arm_length: MeasurementFieldInput;
    collar: MeasurementFieldInput;
    shirt_length: MeasurementFieldInput;
    waist: MeasurementFieldInput;
    hips: MeasurementFieldInput;
    trouser_length: MeasurementFieldInput;
    inseam: MeasurementFieldInput;

    custom_fields: CustomFieldInput[]; // UI array; map to Record<> on save
}

/** Your top-level Add/Edit form values now include measurements */
export interface AddClientFormValues {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;

    measurements: MeasurementsFormValues;
}

/** Optional: a handy type for updateClient patch payloads */
export type ClientPatch =
    Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>> & {
        measurements?: Measurements;
    };
