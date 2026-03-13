'use strict';

const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');

/**
 * Generate a PDF invoice for a given payment.
 * @param {object} payment - Populated payment document
 * @returns {Promise<string>} - Path to the generated PDF file
 */
const generateInvoicePDF = async (payment) => {
    const doc = new PDFDocument({ margin: 50 });
    const invoiceDir = path.join(__dirname, '../../uploads/invoices');
    await fs.ensureDir(invoiceDir);

    const fileName = `invoice_${payment.invoiceNumber || payment._id}.pdf`;
    const filePath = path.join(invoiceDir, fileName);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // ─── Header ─────────────────────────────────────────────────────────────
    doc.fillColor('#444444')
        .fontSize(20)
        .text('StudioSync', 50, 57)
        .fontSize(10)
        .text('StudioSync Inc.', 200, 50, { align: 'right' })
        .text('123 Music Lane, Colombo 07', 200, 65, { align: 'right' })
        .text('Sri Lanka', 200, 80, { align: 'right' })
        .moveDown();

    // ─── Invoice Info ───────────────────────────────────────────────────────
    doc.fillColor('#000000')
        .fontSize(20)
        .text('INVOICE', 50, 160);

    doc.strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(50, 190)
        .lineTo(550, 190)
        .stroke();

    doc.fontSize(10)
        .text(`Invoice Number: ${payment.invoiceNumber || 'N/A'}`, 50, 200)
        .text(`Invoice Date: ${new Date(payment.createdAt).toLocaleDateString()}`, 50, 215)
        .text(`Due Date: ${payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'N/A'}`, 50, 230)
        .text(`Balance Due: LKR ${payment.amount.toLocaleString()}`, 50, 245)

        .text('Bill To:', 300, 200)
        .font('Helvetica-Bold')
        .text(payment.userId?.name || 'Valued Client', 300, 215)
        .font('Helvetica')
        .text(payment.userId?.email || '', 300, 230)
        .moveDown();

    // ─── Table ──────────────────────────────────────────────────────────────
    const tableTop = 330;
    doc.font('Helvetica-Bold');
    doc.text('Description', 50, tableTop);
    doc.text('Service Type', 200, tableTop);
    doc.text('Amount', 400, tableTop, { align: 'right' });
    doc.font('Helvetica');

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    const itemDescription = payment.type === 'studio' ? 'Studio Booking Session' : 'Academy Tuition Fees';
    doc.text(itemDescription, 50, tableTop + 30);
    doc.text(payment.type.toUpperCase(), 200, tableTop + 30);
    doc.text(`LKR ${payment.amount.toLocaleString()}`, 400, tableTop + 30, { align: 'right' });

    doc.moveTo(50, tableTop + 50).lineTo(550, tableTop + 50).stroke();

    // ─── Summary ────────────────────────────────────────────────────────────
    const summaryTop = tableTop + 100;
    doc.fontSize(10)
        .text('Subtotal:', 350, summaryTop)
        .text(`LKR ${payment.amount.toLocaleString()}`, 450, summaryTop, { align: 'right' })
        .text('Total:', 350, summaryTop + 20)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`LKR ${payment.amount.toLocaleString()}`, 450, summaryTop + 20, { align: 'right' });

    // ─── Footer ─────────────────────────────────────────────────────────────
    doc.fontSize(10)
        .fillColor('#aaaaaa')
        .text('Thank you for choosing StudioSync. Professional Audio and Music Education.', 50, 700, { align: 'center', width: 500 });

    doc.end();

    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
};

module.exports = { generateInvoicePDF };
