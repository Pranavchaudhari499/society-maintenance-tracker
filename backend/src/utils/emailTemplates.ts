const STATUS_DISPLAY: Record<string, string> = {
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
};

export function statusChangeTemplate(params: {
    residentName: string;
    category: string;
    description: string;
    newStatus: string;
    note?: string | null;
}) {
    const { residentName, category, description, newStatus, note } = params;
    const statusLabel = STATUS_DISPLAY[newStatus] || newStatus;

    return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1f2937;">Complaint Status Updated</h2>
      <p>Hi ${residentName},</p>
      <p>Your complaint has been updated to <strong>${statusLabel}</strong>.</p>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin: 16px 0;">
        <p style="margin: 0 0 4px;"><strong>Category:</strong> ${category}</p>
        <p style="margin: 0;"><strong>Description:</strong> ${description}</p>
      </div>
      ${note ? `<p><strong>Note from admin:</strong> ${note}</p>` : ""}
      <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
        This is an automated message from Society Maintenance Tracker.
      </p>
    </div>
  `;
}

export function importantNoticeTemplate(params: {
    residentName: string;
    title: string;
    body: string;
}) {
    const { residentName, title, body } = params;

    return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1f2937;">📌 Important Notice</h2>
      <p>Hi ${residentName},</p>
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin: 16px 0;">
        <p style="margin: 0 0 8px; font-weight: 600;">${title}</p>
        <p style="margin: 0; white-space: pre-wrap;">${body}</p>
      </div>
      <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
        This is an automated message from Society Maintenance Tracker.
      </p>
    </div>
  `;
}