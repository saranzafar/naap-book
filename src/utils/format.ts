import { Client } from "../types/Client";

export function formatDate(date: string): string {
    // Simple: return date.split('T')[0]; or use dayjs for relative
    return new Date(date).toLocaleDateString();
}

/**
 * Format a measurement entry into a string.
 * Returns null if the entry is empty or has no value.
 */
export function formatMeasurement(label: string, entry: any): string | null {
    if (!entry || entry.value == null || entry.value === 0) return null;
    return `- ${label}: ${entry.value} ${entry.notes ? `(${entry.notes})` : ""}`;
}

/**
 * Format a client record into a shareable plain text string.
 * This works dynamically with any measurement fields, including custom ones.
 */
export function formatClientForShare(client: Client): string {
    const { name, phone, email, notes, measurements } = client;

    const lines: string[] = [];

    lines.push("📏 Naap Record – NaapBook\n");
    lines.push(`👤 Client: ${name}`);
    if (phone) lines.push(`📞 Phone: ${phone}`);
    if (email) lines.push(`✉️ Email: ${email}`);
    lines.push(""); // blank line

    // Known groups
    const upperKeys = ["chest", "shoulder", "arm_length", "collar", "shirt_length"];
    const lowerKeys = ["waist", "hips", "trouser_length", "inseam"];

    // Upper body
    const upper = upperKeys
        .map((k) => formatMeasurement(k.replace("_", " "), (measurements as any)[k])!)
        .filter((entry): entry is string => Boolean(entry));
    if (upper.length) {
        lines.push("Upper Body:");
        lines.push(...upper);
        lines.push("");
    }

    // Lower body
    const lower = lowerKeys
        .map((k) => formatMeasurement(k.replace("_", " "), (measurements as any)[k])!)
        .filter(Boolean);
    if (lower.length) {
        lines.push("Lower Body:");
        lines.push(...lower);
        lines.push("");
    }

    // Custom fields
    if (measurements?.custom_fields) {
        const custom = Object.values(measurements.custom_fields)
            .map((cf: any) => formatMeasurement(cf.name || "Custom", cf))
            .filter(Boolean);
        if (custom.length) {
            lines.push("Custom Measurements:");
            lines.push(...custom.filter((entry): entry is string => entry !== null));
            lines.push("");
        }
    }

    // Notes
    if (notes) {
        lines.push(`📝 Notes: ${notes}`);
    }

    return lines.join("\n").trim();
}

