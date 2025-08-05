export interface MeasurementField {
    value: number;
    notes?: string;
}

export interface CustomField extends MeasurementField {
    name: string;
}

export interface Measurements {
    chest: MeasurementField;
    shoulder: MeasurementField;
    arm_length: MeasurementField;
    collar: MeasurementField;
    shirt_length: MeasurementField;
    waist: MeasurementField;
    hips: MeasurementField;
    trouser_length: MeasurementField;
    inseam: MeasurementField;
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

export interface AddClientFormValues {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}
