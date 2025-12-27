import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const usePdf = (pdfId, localFile) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fileName, setFileName] = useState('No file selected');
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [fields, setFields] = useState([]);         // renamed for clarity
  const [loading, setLoading] = useState(false);

  // Reset all state
  const reset = () => {
  setPdfUrl(null);
  setFileName('No file selected');
  setNumPages(0);
  setCurrentPage(1);
  setFields([]);
  setLoading(false);
};


  // Load from backend
  const loadPdfFromBackend = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/pdfs/${pdfId}`);
      const data = res.data.data;
      setPdfUrl(data.pdfUrl);
      setFileName(data.name);
      setFields(data.fields || []);
    } catch (err) {
      console.error("Failed to load PDF", err);
    } finally {
      setLoading(false);
    }
  }, [pdfId]);

  // Load from local file
  const handleLocalPdf = useCallback(() => {
    if (!localFile) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPdfUrl(reader.result);
      setFileName(localFile.name);
      setFields([]); // No fields for a new file until they’re added
      setLoading(false);
    };
    reader.readAsDataURL(localFile);
  }, [localFile]);

  // Respond to new id or file
  useEffect(() => {
    reset();
    if (localFile) {
      handleLocalPdf();
    } else if (pdfId) {
      loadPdfFromBackend();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [pdfId, localFile, loadPdfFromBackend, handleLocalPdf]);

  // Save updated fields to backend for existing PDFs
  const handleSave = async () => {
    try {
      const cleanedFields = fields.map(field => ({
        _id       : field._id && /^[a-f\d]{24}$/i.test(field._id) ? field._id : undefined,
        fieldType : field.fieldType,
        label     : field.label || '',
        value     : field.value || '',
        pageNumber: field.pageNumber,
        position  : {
          x: field.position?.x || 0,
          y: field.position?.y || 0,
        },
        width     : field.width || 200,
        height    : field.height || 40,
        options   : field.options || []
      }));

      console.log("first: ", cleanedFields)

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/v1/pdfs/${pdfId}`, {
        fields: cleanedFields
      });
      // pdf.save("edited_pdf.pdf");
      // alert("PDF fields saved!");
    } catch (error) {
      console.error("Failed to save fields:", error);
      // alert("Failed to save.");
    }
  };

  // Upload a NEW PDF (call this with a File object)
  const uploadPdf = async (file) => {
    const formData = new FormData();
    formData.append('pdfFile', file);
    // Include fields when uploading a new PDF so the server stores them together
    if (fields && fields.length > 0) {
      formData.append('fields', JSON.stringify(fields));
    }
    // Optionally: formData.append('name', file.name);
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/pdfs`, formData);
      // Optionally redirect to /edit/:res.data.data._id after upload
      return res.data.data;
    } catch (err) {
      console.error("Failed to upload PDF", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Generate preview PDF (merged with fields) — defined before downloadPdf to avoid TDZ
  const generatePreviewPdf = useCallback(async () => {
    // If there are no extra fields, reuse the original/source pdf
    if (!fields || fields.length === 0) {
      if (localFile) return URL.createObjectURL(localFile);
      if (pdfUrl) return pdfUrl;
      throw new Error('No PDF available for preview.');
    }

    // Load PDF bytes (from local file or remote url)
    let arrayBuffer;
    if (localFile) {
      arrayBuffer = await localFile.arrayBuffer();
    } else if (pdfUrl) {
      const res = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
      arrayBuffer = res.data;
    } else {
      throw new Error('No PDF available to generate preview.');
    }

    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // We assume viewer renders pages at width 800px (see PdfViewer Page width prop)
    const viewerRenderWidth = 800;

    for (const field of fields) {
      const pageIndex = Math.max(0, (field.pageNumber || 1) - 1);
      if (pageIndex >= pdfDoc.getPageCount()) continue;
      const page = pdfDoc.getPage(pageIndex);
      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();

      const scale = pageWidth / viewerRenderWidth;

      const x = (field.position?.x || 0) * scale;
      // Convert y from top-origin (viewer) to bottom-origin (PDF)
      const yTop = (field.position?.y || 0) * scale;
      const width = (field.width || 200) * scale;
      const height = (field.height || 40) * scale;
      const y = pageHeight - yTop - height;

      // Draw a white background for the field (so it sits above PDF content)
      // NOTE: no outer border - input fields should appear without border in preview/download
      page.drawRectangle({
        x,
        y,
        width,
        height,
        color: rgb(1, 1, 1),
      });

      const fontSize = Math.max(8, Math.min(14, height / 4));

      if (field.fieldType === 'text' || field.fieldType === 'dropdown') {
        const textToDraw = field.value || field.label || '';
        page.drawText(textToDraw, {
          x: x + 4,
          y: y + height - fontSize - 4,
          size: fontSize,
          font: helveticaFont,
          color: rgb(0, 0, 0),
          maxWidth: width - 8,
        });
      } else if (field.fieldType === 'checkbox' || field.fieldType === 'radio') {
        const label = field.label || '';
        const boxX = x + 6;
        // slightly smaller boxes for checkbox/radio
        const boxSize = Math.max(6, Math.min(10, fontSize + 1, height - 10));
        const boxY = y + (height - boxSize) / 2;

        if (field.fieldType === 'checkbox') {
          // checkbox: small square with optional checkmark
          page.drawRectangle({ x: boxX, y: boxY, width: boxSize, height: boxSize, borderColor: rgb(0,0,0), borderWidth: 1, color: rgb(1,1,1) });
          if (String(field.value) === 'true') {
            page.drawLine({ start: { x: boxX + 2, y: boxY + boxSize/2 }, end: { x: boxX + boxSize/2, y: boxY + 3 }, thickness: 1.2, color: rgb(0,0,0) });
            page.drawLine({ start: { x: boxX + boxSize/2 - 1, y: boxY + 3 }, end: { x: boxX + boxSize - 2, y: boxY + boxSize - 3 }, thickness: 1.2, color: rgb(0,0,0) });
          }
        } else {
          // radio: draw circular outline and small filled dot when selected
          const centerX = boxX + boxSize / 2;
          const centerY = boxY + boxSize / 2;
          page.drawEllipse({ x: centerX, y: centerY, xScale: boxSize / 2, yScale: boxSize / 2, color: rgb(1,1,1), borderColor: rgb(0,0,0), borderWidth: 1 });
          if (String(field.value) === 'true') {
            const dotRadius = Math.max(1.2, boxSize / 5);
            page.drawEllipse({ x: centerX, y: centerY, xScale: dotRadius, yScale: dotRadius, color: rgb(0,0,0) });
          }
        }

        page.drawText(label, { x: boxX + boxSize + 6, y: boxY + (boxSize - fontSize) / 2, size: fontSize, font: helveticaFont, color: rgb(0,0,0) });
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  }, [fields, localFile, pdfUrl]);

  // Download a PDF binary (triggers user download for current pdfId)
const downloadPdf = useCallback(async () => {
  // If there are fields present, generate merged PDF client-side and download that
  try {
    setLoading(true);
    if (fields && fields.length > 0) {
      const mergedUrl = await generatePreviewPdf();
      const link = document.createElement('a');
      link.href = mergedUrl;
      link.setAttribute('download', fileName || 'document.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Revoke the object URL after a short timeout to ensure download starts
      setTimeout(() => URL.revokeObjectURL(mergedUrl), 1000);
      return;
    }

    if (!pdfId) return;

    // Fallback: fetch the original stored PDF from backend
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/pdfs/download/${pdfId}`,
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'document.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download PDF', error);
  } finally {
    setLoading(false);
  }
}, [pdfId, fileName, fields, generatePreviewPdf]);


  return {
    pdfUrl,
    fileName,
    numPages,
    currentPage,
    setNumPages,
    setCurrentPage,
    setPdfUrl,
    loading,
    fields,
    setFields,
    handleSave,
    uploadPdf,
    downloadPdf,
    generatePreviewPdf
  };
};
