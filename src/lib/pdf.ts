import { jsPDF } from "jspdf";
import type { Scholar, Project, WorkLog } from "./types";

const NAVY = "#0A1628";
const TEAL = "#0DA882";
const INK_SOFT = "#3D4A5F";
const INK_MUTED = "#7A8499";
const RULE = "#E4DFD3";

export function exportWorkLogsPdf({ scholar, project, mentorName, logs }: {
  scholar: Scholar; project: Project; mentorName?: string; logs: WorkLog[];
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;

  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const totalHours = sorted.reduce((s, l) => s + l.hoursSpent, 0);

  // ----- Cover header
  doc.setFillColor(NAVY);
  doc.rect(0, 0, pageW, 96, "F");
  doc.setTextColor("#FFFFFF");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("ATHENA EDUCATION  ·  MINERVA RESEARCH JOURNAL", margin, 38);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Scholar Work Log", margin, 66);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), pageW - margin, 38, { align: "right" });

  // ----- Meta block
  let y = 130;
  doc.setTextColor(NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(project.name, margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(INK_SOFT);
  const lines = [
    `Scholar: ${scholar.name}  ·  Grade ${scholar.grade}  ·  ${scholar.school}`,
    `Track: ${project.track}  ·  Mentor: ${mentorName ?? "Unassigned"}`,
    `Total entries: ${sorted.length}  ·  Total hours logged: ${totalHours}h  ·  Timeline: ${project.timeline}`,
  ];
  for (const l of lines) { doc.text(l, margin, y); y += 14; }

  y += 8;
  doc.setDrawColor(RULE);
  doc.line(margin, y, pageW - margin, y);
  y += 22;

  // ----- Entries
  for (const log of sorted) {
    const descLines = doc.splitTextToSize(log.description || "—", contentW - 14);
    const blockH = 18 /*date*/ + 18 /*title*/ + 14 /*meta*/ + descLines.length * 13 + (log.attachments.length ? 14 : 0) + 22;

    if (y + blockH > pageH - 60) {
      addFooter(doc, pageW, pageH, margin);
      doc.addPage();
      y = margin;
    }

    // teal accent bar
    doc.setFillColor(TEAL);
    doc.rect(margin, y - 10, 3, blockH - 8, "F");

    // date
    doc.setTextColor(TEAL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    const dateStr = new Date(log.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).toUpperCase();
    doc.text(dateStr, margin + 12, y);
    y += 14;

    // title
    doc.setTextColor(NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(log.title, margin + 12, y);
    y += 14;

    // meta
    doc.setTextColor(INK_MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const tagStr = log.tags.length ? log.tags.join(" · ") : "Untagged";
    doc.text(`${log.hoursSpent}h  ·  ${log.status}  ·  ${tagStr}`, margin + 12, y);
    y += 14;

    // description
    doc.setTextColor(INK_SOFT);
    doc.setFontSize(10);
    doc.text(descLines, margin + 12, y);
    y += descLines.length * 13;

    // attachments
    if (log.attachments.length) {
      doc.setTextColor(INK_MUTED);
      doc.setFontSize(9);
      doc.text(`Attachments: ${log.attachments.map(a => a.name).join(", ")}`, margin + 12, y);
      y += 14;
    }

    y += 14;
  }

  if (sorted.length === 0) {
    doc.setTextColor(INK_MUTED);
    doc.setFontSize(11);
    doc.text("No entries yet.", margin, y);
  }

  addFooter(doc, pageW, pageH, margin);

  const safeName = scholar.name.replace(/\s+/g, "_");
  doc.save(`${safeName}_work_log_${new Date().toISOString().slice(0,10)}.pdf`);
}

function addFooter(doc: jsPDF, pageW: number, pageH: number, margin: number) {
  const pageNum = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(INK_MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Athena Education · Minerva Ideation Platform", margin, pageH - 24);
  doc.text(`Page ${pageNum}`, pageW - margin, pageH - 24, { align: "right" });
}
