import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * Export data to PDF.
 * @param {string} title - Report title shown in the header
 * @param {string[]} headers - Column headers
 * @param {Array[]} rows - 2D array of row values
 * @param {string} filename - Output file name (without extension)
 */
export const exportToPDF = (title, headers, rows, filename = "report") => {
    const doc = new jsPDF({ orientation: "landscape" });

    // Header bar
    doc.setFillColor(15, 23, 42); // #0f172a
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 22, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, 13);

    // Timestamp
    const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 170);
    doc.text(`Generated: ${now}`, doc.internal.pageSize.getWidth() - 14, 13, { align: "right" });

    autoTable(doc, {
        startY: 28,
        head: [headers],
        body: rows,
        theme: "grid",
        styles: {
            fontSize: 9,
            cellPadding: 4,
            textColor: [30, 30, 50],
        },
        headStyles: {
            fillColor: [6, 182, 212],   // cyan-500
            textColor: [10, 14, 26],
            fontStyle: "bold",
            halign: "center",
        },
        alternateRowStyles: { fillColor: [240, 245, 255] },
        columnStyles: { 0: { fontStyle: "bold" } },
    });

    doc.save(`${filename}.pdf`);
};

/**
 * Export data to Excel (.xlsx).
 * @param {string} sheetName - Name of the worksheet
 * @param {string[]} headers - Column headers
 * @param {Array[]} rows - 2D array of row values
 * @param {string} filename - Output file name (without extension)
 */
export const exportToExcel = (sheetName, headers, rows, filename = "report") => {
    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Bold header row style (basic)
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (worksheet[cellRef]) {
            worksheet[cellRef].s = { font: { bold: true } };
        }
    }

    // Auto column widths
    worksheet["!cols"] = headers.map((h) => ({
        wch: Math.max(h.length + 4, 12),
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};
