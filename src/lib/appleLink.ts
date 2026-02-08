/**
 * Apple Calendar Link Generator
 * 
 * Generates iCloud "Add to Calendar" links for individual events
 * These links allow users to add events directly to their Apple Calendar
 */

import { Event } from './schema';

/**
 * Converts a local datetime string to Apple Calendar format (YYYYMMDDTHHMMSS)
 * 
 * @param localDateTime - ISO format datetime string (YYYY-MM-DDTHH:mm)
 * @returns Apple Calendar formatted datetime
 */
function formatDateForApple(localDateTime: string): string {
    // Parse the local datetime (format: YYYY-MM-DDTHH:mm)
    const date = new Date(localDateTime);

    // Format as YYYYMMDDTHHMMSS
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = '00';

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Generates an Apple iCloud Calendar link for a single event
 * 
 * Link format: https://www.icloud.com/calendar/event?title=...&starts=...&ends=...&details=...&location=...
 * 
 * @param event - The calendar event
 * @param timezone - IANA timezone identifier (e.g., "America/New_York")
 * @returns Complete iCloud calendar link
 */
export function generateAppleCalendarLink(event: Event, timezone: string): string {
    const params = new URLSearchParams();

    // Required fields
    params.append('title', event.title);
    params.append('starts', formatDateForApple(event.start_local));
    params.append('ends', formatDateForApple(event.end_local));

    // Optional fields
    if (event.description) {
        params.append('details', event.description);
    }

    if (event.location) {
        params.append('location', event.location);
    }

    // Note: iCloud doesn't have a direct timezone parameter in the URL,
    // but the dates are interpreted in the user's local timezone

    return `https://www.icloud.com/calendar/event?${params.toString()}`;
}

/**
 * Copies text to clipboard (client-side only)
 * Returns true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        return false;
    }
}
