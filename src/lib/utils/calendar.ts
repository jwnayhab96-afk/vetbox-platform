/**
 * Calendar Sync Utilities for Google Calendar and Apple / Outlook iCal (.ics)
 */

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: string; // YYYY-MM-DD or ISO string
  endDate?: string;
  petName?: string;
}

/**
 * Converts a date string (YYYY-MM-DD) into Google / iCal format: YYYYMMDDTHHmmssZ or YYYYMMDD
 */
function formatToIcsDate(dateStr: string, isAllDay: boolean = true): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const today = new Date();
    return today.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  if (isAllDay) {
    return `${year}${month}${day}`;
  }

  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  const secs = String(d.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${mins}${secs}Z`;
}

/**
 * Builds a direct Google Calendar Add Event URL
 */
export function getGoogleCalendarUrl(event: CalendarEvent): string {
  const title = encodeURIComponent(event.petName ? `[VETBOX] ${event.title} - ${event.petName}` : `[VETBOX] ${event.title}`);
  const details = encodeURIComponent(
    `${event.description || "موعد رعاية وتطعيم مسجل عبر منصة VETBOX للرعاية البيطرية."}\n\nالحيوان: ${event.petName || "حيوان مسجل"}\nرابط المنصة: https://vetbox.eg`
  );
  const location = encodeURIComponent(event.location || "العيادة البيطرية المعتمدة");

  const startFormatted = formatToIcsDate(event.startDate, true);
  // Next day for all day event
  const nextDay = new Date(event.startDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const endFormatted = formatToIcsDate(nextDay.toISOString(), true);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startFormatted}/${endFormatted}`;
}

/**
 * Generates and downloads a standard .ics (iCalendar) file compatible with Apple Calendar, iOS, macOS, Outlook & Android
 */
export function downloadIcsFile(event: CalendarEvent, filename?: string): void {
  if (typeof window === "undefined") return;

  const startFormatted = formatToIcsDate(event.startDate, true);
  const nextDay = new Date(event.startDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const endFormatted = formatToIcsDate(nextDay.toISOString(), true);

  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = `vetbox-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@vetbox.eg`;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VetBox Platform//Veterinary Care Egypt//AR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${startFormatted}`,
    `DTEND;VALUE=DATE:${endFormatted}`,
    `SUMMARY:${event.petName ? `[VETBOX] ${event.title} - ${event.petName}` : `[VETBOX] ${event.title}`}`,
    `DESCRIPTION:${(event.description || "موعد رعاية مسجل عبر منصة فيت بوكس").replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location || "العيادة البيطرية"}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:تذكير: موعد بيطري غداً عبر فيت بوكس",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename || `vetbox-${event.petName || "reminder"}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Exports multiple reminders into a single combined .ics calendar file
 */
export function downloadAllRemindersIcs(events: CalendarEvent[], filename = "vetbox-all-reminders.ics"): void {
  if (typeof window === "undefined" || !events.length) return;

  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const vevents = events.map((event, idx) => {
    const startFormatted = formatToIcsDate(event.startDate, true);
    const nextDay = new Date(event.startDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const endFormatted = formatToIcsDate(nextDay.toISOString(), true);
    const uid = `vetbox-${idx}-${Date.now()}@vetbox.eg`;

    return [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${startFormatted}`,
      `DTEND;VALUE=DATE:${endFormatted}`,
      `SUMMARY:${event.petName ? `[VETBOX] ${event.title} - ${event.petName}` : `[VETBOX] ${event.title}`}`,
      `DESCRIPTION:${(event.description || "تذكير طبي بيطري مسجل على فيت بوكس").replace(/\n/g, "\\n")}`,
      `LOCATION:${event.location || "العيادة البيطرية المعتمدة"}`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      "DESCRIPTION:تذكير غداً عبر فيت بوكس",
      "END:VALARM",
      "END:VEVENT",
    ].join("\r\n");
  }).join("\r\n");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VetBox Platform//Veterinary Care Egypt//AR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    vevents,
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
