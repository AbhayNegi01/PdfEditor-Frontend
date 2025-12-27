import { Document, Page } from 'react-pdf';
import { useEffect, useRef } from 'react';
import { useDrop } from 'react-dnd';
import PDFFieldOverlay from './PdfFieldOverlay';

const PdfViewer = ({
  pdfId,
  pdfUrl,
  numPages,
  currentPage,
  setNumPages,
  setCurrentPage,
  setPdfUrl,
  fields,
  setFields,
}) => {
  const containerRef = useRef(null);

  const handlePrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, numPages));

  function generateTempId() {
    return 'temp-' + Math.random().toString(36).slice(2) + Date.now();
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Setup drop target for adding new fields via drag-and-drop
  const [{ isOver }, drop] = useDrop({
    accept: 'FIELD',
    drop: (item, monitor) => {
      const containerRect = containerRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) return;

      const x = clientOffset.x - containerRect.left;
      const y = clientOffset.y - containerRect.top;

      // If this is always a new field, generate a tempId.
      const newField = {
        // If item._id exists and is from backend: use it. Otherwise, assign tempId.
        _id: item._id,                     
        tempId: !item._id ? generateTempId() : undefined,
        fieldType: item.fieldType,
        label: capitalize(item.fieldType),
        value: ['checkbox', 'radio'].includes(item.fieldType) ? 'false' : '',
        pageNumber: currentPage,
        width: 200,
        height: 60,
        position: { x, y },
        options: item.fieldType === 'dropdown'
          ? ['select an option', 'Option 1', 'Option 2', 'Option 3']
          : [],
      };

      setFields(prev => [...prev, newField]);
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  });

  const onUpdateField = (id, updated) => {
    setFields(prev =>
      prev.map(field =>
        (field._id === id || field.tempId === id)
          ? { ...field, ...updated }
          : field
      )
    );
  };
  const onDeleteField = id => {
    setFields(prev =>
      prev.filter(field =>
        field._id !== id && field.tempId !== id
      )
    );
  };

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

      <div
        ref={containerRef}
        className={`relative flex justify-center border-2 shadow-md w-full max-w-[850px] ${isOver ? 'ring-4 ring-blue-300' : ''}`}
        style={{ minHeight: 900 }}
      >
        <div ref={drop} className="w-full h-full relative">
          {pdfUrl && (
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={null}
              error={null}
              noData={null}
            >
              <Page
                pageNumber={currentPage}
                width={800}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={null}
              />
            </Document>
          )}

          {/* The overlay for draggable & resizable input fields */}
          <PDFFieldOverlay 
            fields={fields} 
            currentPage={currentPage} 
            onUpdateField={onUpdateField} 
            onDeleteField={onDeleteField}
          />
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
