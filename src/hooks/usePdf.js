import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

export const usePdf = (pdfId, localFile) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fileName, setFileName] = useState('No file selected');
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // ✅ Resets state
  const reset = () => {
    setPdfUrl(null);
    setFileName('No file selected');
    setNumPages(0);
    setCurrentPage(1);
  };

  // ✅ Load from backend
  const loadPdfFromBackend = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/pdfs/${pdfId}`);
      const data = res.data.data;
      setPdfUrl(data.pdfUrl);
      setFileName(data.name);
    } catch (err) {
      console.error("Failed to load PDF", err);
    } finally {
      setLoading(false);
    }
  }, [pdfId]);

  // ✅ Load from local file
  const handleLocalPdf = useCallback(() => {
    if (!localFile) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPdfUrl(reader.result);
      setFileName(localFile.name);
      setLoading(false);
    };
    reader.readAsDataURL(localFile);
  }, [localFile]);

  // ✅ Effect to react to changes
  useEffect(() => {
    reset();
    if (localFile) {
      handleLocalPdf();
    } else if (pdfId) {
      loadPdfFromBackend();
    } else {
      setLoading(false);
    }
  }, [pdfId, localFile, loadPdfFromBackend, handleLocalPdf]);

  return {
    pdfUrl,
    fileName,
    numPages,
    currentPage,
    setNumPages,
    setCurrentPage,
    setPdfUrl,
    loading,
  };
};
