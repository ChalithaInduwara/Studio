'use strict';

const nodemailer = require('nodemailer');

// ─── Transporter (lazy-init so missing SMTP config doesn't crash startup) ──
let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return _transporter;
};

const FROM = `"StudioSync" <${process.env.SMTP_USER || 'noreply@studiosync.com'}>`;

// ─── Booking confirmation ──────────────────────────────────────────────────
/**
 * Send a booking confirmation email to the client.
 * @param {object} booking — populated Booking document
 */
const sendBookingConfirmation = async (booking) => {
  if (!process.env.SMTP_USER) return; // Skip in dev if not configured

  const user = booking.userId;
  const studio = booking.studioId;
  const dateStr = new Date(booking.date).toDateString();

  await getTransporter().sendMail({
    from: FROM,
    to: user.email,
    subject: `✅ Booking Confirmed — ${studio?.name || 'Studio'} on ${dateStr}`,
    html: `
      <h2>Your booking is confirmed!</h2>
      <p>Hi ${user.name},</p>
      <p>Here are your booking details:</p>
      <table cellpadding="8">
        <tr><td><strong>Studio</strong></td><td>${studio?.name}</td></tr>
        <tr><td><strong>Date</strong></td><td>${dateStr}</td></tr>
        <tr><td><strong>Time</strong></td><td>${booking.startTime} – ${booking.endTime}</td></tr>
        <tr><td><strong>Total</strong></td><td>LKR ${booking.totalAmount?.toFixed(2)}</td></tr>
        <tr><td><strong>Status</strong></td><td>${booking.status}</td></tr>
      </table>
      <p>Thank you for choosing Sasitha Audio Production!</p>
    `,
  });
};

// ─── Enrollment confirmation ───────────────────────────────────────────────
/**
 * Send a class enrollment confirmation email.
 * @param {object} enrollment — populated Enrollment document
 * @param {object} classDoc   — Class document
 */
const sendEnrollmentConfirmation = async (enrollment, classDoc) => {
  if (!process.env.SMTP_USER) return;

  const student = enrollment.studentId;

  await getTransporter().sendMail({
    from: FROM,
    to: student.email,
    subject: `🎵 Enrolled — ${classDoc.className}`,
    html: `
      <h2>Enrollment Confirmed!</h2>
      <p>Hi ${student.name},</p>
      <p>You're now enrolled in <strong>${classDoc.className}</strong>.</p>
      <table cellpadding="8">
        <tr><td><strong>Day</strong></td><td>${classDoc.schedule?.day}</td></tr>
        <tr><td><strong>Time</strong></td><td>${classDoc.schedule?.startTime} – ${classDoc.schedule?.endTime}</td></tr>
        <tr><td><strong>Recurring</strong></td><td>${classDoc.isRecurring ? 'Yes' : 'No'}</td></tr>
      </table>
      <p>Welcome to Swara Academy of Music!</p>
    `,
  });
};

// ─── Invoice Sending ───────────────────────────────────────────────────────
/**
 * Send an invoice email with PDF attachment.
 * @param {object} payment - Populated payment document
 * @param {string} pdfPath - Path to the generated PDF
 */
const sendInvoiceEmail = async (payment, pdfPath) => {
  if (!process.env.SMTP_USER) return;

  const user = payment.userId;

  await getTransporter().sendMail({
    from: FROM,
    to: user.email,
    subject: `📄 Invoice ${payment.invoiceNumber || 'New'} — StudioSync`,
    html: `
      <h2>New Invoice from StudioSync</h2>
      <p>Hi ${user.name},</p>
      <p>Please find attached the invoice for your recent ${payment.type} activity.</p>
      <table cellpadding="8">
        <tr><td><strong>Invoice #</strong></td><td>${payment.invoiceNumber || 'N/A'}</td></tr>
        <tr><td><strong>Amount</strong></td><td>LKR ${payment.amount?.toFixed(2)}</td></tr>
        <tr><td><strong>Due Date</strong></td><td>${payment.dueDate ? new Date(payment.dueDate).toDateString() : 'N/A'}</td></tr>
      </table>
      <p>You can pay via the dashboard or at the studio counter.</p>
      <p>Regards,<br/>StudioSync Team</p>
    `,
    attachments: [
      {
        filename: `Invoice_${payment.invoiceNumber || 'StudioSync'}.pdf`,
        path: pdfPath,
      },
    ],
  });
};

// ─── Payment Reminder ──────────────────────────────────────────────────────
/**
 * Send an overdue payment reminder.
 * @param {object} payment - Populated payment document
 */
const sendPaymentReminder = async (payment) => {
  if (!process.env.SMTP_USER) return;

  const user = payment.userId;

  await getTransporter().sendMail({
    from: FROM,
    to: user.email,
    subject: `⚠️ Overdue Payment Reminder — StudioSync`,
    html: `
      <h2 style="color: #dc2626;">Payment Overdue</h2>
      <p>Hi ${user.name},</p>
      <p>This is a friendly reminder that your payment of <strong>LKR ${payment.amount?.toFixed(2)}</strong> for ${payment.type} is currently overdue.</p>
      <p><strong>Invoice #:</strong> ${payment.invoiceNumber || 'N/A'}</p>
      <p><strong>Original Due Date:</strong> ${payment.dueDate ? new Date(payment.dueDate).toDateString() : 'N/A'}</p>
      <br/>
      <p>Please settle this as soon as possible to avoid any service interruptions.</p>
      <p>Regards,<br/>StudioSync Team</p>
    `,
  });
};

/**
 * Send a support request email to the admin.
 * @param {object} user - The user reporting the issue
 * @param {string} message - The issue description
 */
const sendSupportEmail = async (user, message) => {
  if (!process.env.SMTP_USER) return;

  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

  await getTransporter().sendMail({
    from: FROM,
    to: adminEmail,
    replyTo: user.email,
    subject: `🆘 New Support Request from ${user.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #4f46e5; padding: 20px; color: white;">
          <h2 style="margin: 0;">Support Request Received</h2>
        </div>
        <div style="padding: 24px;">
          <p style="color: #4b5563; font-size: 14px;">A new support request has been submitted through the StudioSync dashboard.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px; width: 100px;">User</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600;">${user.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px;">Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${user.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px;">Role</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827; text-transform: capitalize;">${user.role}</td>
            </tr>
          </table>

          <div style="margin-top: 30px;">
            <p style="color: #6b7280; font-size: 13px; margin-bottom: 8px;">Message:</p>
            <div style="padding: 20px; background: #f9fafb; border-radius: 8px; color: #111827; line-height: 1.6; border: 1px solid #f3f4f6;">
              ${message.replace(/\n/g, '<br/>')}
            </div>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <a href="mailto:${user.email}" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Reply Directly
            </a>
          </div>
        </div>
        <div style="background: #f9fafb; padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
          This is an automated notification from StudioSync.
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendBookingConfirmation,
  sendEnrollmentConfirmation,
  sendInvoiceEmail,
  sendPaymentReminder,
  sendSupportEmail
};
