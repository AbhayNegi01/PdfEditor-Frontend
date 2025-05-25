import { Document, Page } from 'react-pdf';
import { useEffect } from 'react';

const PdfViewer = ({
  pdfId,
  pdfUrl, 
  numPages, 
  currentPage, 
  setNumPages, 
  setCurrentPage,
  setPdfUrl
}) => {

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, numPages));

  useEffect(() => {
  setPdfUrl(pdfUrl);
  setCurrentPage(1);
  setNumPages(0);
}, [pdfId, pdfUrl, setCurrentPage, setNumPages, setPdfUrl]);

  return (
    <div className="flex-grow flex flex-col items-center">
      <div className="mb-4 flex items-center">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-l-md disabled:bg-gray-400"
          onClick={handlePrev}
          disabled={currentPage <= 1}
        >
          Prev
        </button>
        <span className="bg-gray-200 px-4 py-2">
          Page {currentPage} of {numPages}
        </span>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md disabled:bg-gray-400"
          onClick={handleNext}
          disabled={currentPage >= numPages}
        >
          Next
        </button>
      </div>

      <div className="flex justify-center border-2 shadow-md">
      {pdfUrl ? (
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
            setCurrentPage(currentPage); // Reset to first page on load
          }}
          loading={null} // ⛔ prevent react-pdf's default loader
          error={null}   // ⛔ prevent error messages like "No PDF specified"
          noData={null} // ⛔ prevent "No PDF file specified" message
        >
          <Page
            pageNumber={currentPage}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            loading={null}
          />
        </Document>
      ) : null}
      </div>
    </div>
  );
};

export default PdfViewer;