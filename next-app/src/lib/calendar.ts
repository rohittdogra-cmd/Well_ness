"use client";

import type { Session } from "@/backend.types";
function escape(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
function date(value: number) {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z/, "Z");
}
export function downloadCalendar(session: Session) {
  const start = Number(session.dateTime / 1_000_000n);
  const text = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//stress-unwind//Activities//EN",
    "BEGIN:VEVENT",
    `UID:stress-unwind-${session.id}@${window.location.hostname}`,
    `DTSTAMP:${date(Date.now())}`,
    `DTSTART:${date(start)}`,
    `DTEND:${date(start + 3600000)}`,
    `SUMMARY:${escape(session.title)}`,
    `DESCRIPTION:${escape(session.description)}`,
    `LOCATION:${escape(session.location ?? session.spaceName ?? "")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/calendar;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `wellness-${session.id}.ics`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
