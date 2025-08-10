import { Measurements } from "../types/Client";

/** Optional: if you don't already have this */
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
  const [min, max] = ranges[field] || [0, Number.POSITIVE_INFINITY];
  if (typeof value !== "number" || Number.isNaN(value)) {
    return { isValid: false, error: `${field} must be a number.` };
  }
  if (value < min || value > max) {
    return { isValid: false, error: `${field} must be between ${min} and ${max}.` };
  }
  return { isValid: true };
}

/** You already wrote this; keeping for context */
export function validateMeasurementNotes(m: Measurements): string[] {
  const max = 100;
  const errs: string[] = [];
  const check = (label: string, notes?: string) => {
    if (notes && notes.length > max) {
      errs.push(`${label} note must be ≤ ${max} characters.`);
    }
  };
  check("Chest", m.chest?.notes);
  check("Shoulder", m.shoulder?.notes);
  check("Arm length", m.arm_length?.notes);
  check("Collar", m.collar?.notes);
  check("Shirt length", m.shirt_length?.notes);
  check("Waist", m.waist?.notes);
  check("Hips", m.hips?.notes);
  check("Trouser length", m.trouser_length?.notes);
  check("Inseam", m.inseam?.notes);

  Object.values(m.custom_fields || {}).forEach((cf) => check(cf.name || "Custom field", cf.notes));
  return errs;
}

/** NEW: validate the numeric values using ranges per field */
export function validateMeasurementValues(m: Measurements): string[] {
  const errs: string[] = [];
  const std: Array<[keyof Measurements, string]> = [
    ["chest", "chest"],
    ["shoulder", "shoulder"],
    ["arm_length", "arm_length"],
    ["collar", "collar"],
    ["shirt_length", "shirt_length"],
    ["waist", "waist"],
    ["hips", "hips"],
    ["trouser_length", "trouser_length"],
    ["inseam", "inseam"],
  ];

  std.forEach(([k, keyName]) => {
    const v = m[k]?.value ?? 0;
    const r = typeof v === "number" ? validateMeasurement(v, keyName) : { isValid: false, error: `${keyName} must be a number.` };
    if (!r.isValid && r.error) errs.push(capitalizeLabel(keyName) + ": " + r.error);
  });

  // Custom fields (positive numbers only; no global ranges defined)
  Object.values(m.custom_fields || {}).forEach((cf) => {
    const v = cf?.value ?? 0;
    if (typeof v !== "number" || Number.isNaN(v) || v <= 0) {
      errs.push(`${cf?.name || "Custom field"} must be a positive number.`);
    }
  });

  return errs;
}

/** NEW: SRS says up to 5 custom fields */
export function validateCustomFieldsLimit(m: Measurements, max = 5): string[] {
  const count = Object.keys(m.custom_fields || {}).length;
  return count > max ? [`Custom fields cannot exceed ${max}.`] : [];
}

/** NEW: optional—ensure custom fields have non-empty names */
export function validateCustomFieldNames(m: Measurements): string[] {
  const errs: string[] = [];
  Object.values(m.custom_fields || {}).forEach((cf) => {
    if (!cf.name || !cf.name.trim()) {
      errs.push("Custom field name is required.");
    }
  });
  return errs;
}

function capitalizeLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
