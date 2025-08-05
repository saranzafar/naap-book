import { Client } from '../types/Client';
import { AddClientFormValues } from "../types/Client";

export function validateClient(client: Partial<Client>): { valid: boolean; errors: string[] } {
    const errors = [];
    if (!client.name || client.name.length < 2 || client.name.length > 50) {
        errors.push("Name must be between 2 and 50 characters.");
    }
    // More validations here (phone, email, address, notes)
    return { valid: errors.length === 0, errors };
}

export function validateMeasurement(value: number, type: keyof Client['measurements']): boolean {
    // Range-check by field (e.g., chest: 20-60, etc)
    // ...implement as per SRS
    return true;
}


export function validateUser(user: Partial<AddClientFormValues>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!user.name || user.name.length < 2) errors.push("Name required (2+ chars)");
  // ... more validation
  return { isValid: errors.length === 0, errors };
}
