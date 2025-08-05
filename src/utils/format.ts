export function formatDate(date: string): string {
    // Simple: return date.split('T')[0]; or use dayjs for relative
    return new Date(date).toLocaleDateString();
}
