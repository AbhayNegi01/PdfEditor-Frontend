import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/Button";
import InputFields from "../components/InputFields";
import { PreviewModal } from "../components";
import PdfViewer from "../components/PdfViewer";
import { FaCloudUploadAlt, FaEye, FaFile, FaSave, FaSpinner, FaUpload } from "react-icons/fa";
import { usePdf } from '../hooks/usePdf';
import { BsGear } from "react-icons/bs";

const EditPdf = () => {
  const { id } = useParams();
  const [localFile, setLocalFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const {
    loading, 
    fileName, 
    pdfUrl, 
    numPages, 
    currentPage,
    setNumPages, 
    setCurrentPage, 
    setPdfUrl, 
    fields, 
    setFields,
    handleSave, 
    uploadPdf,
    downloadPdf,
    generatePreviewPdf
  } = usePdf(id, localFile);

  // file input handler for new PDF uploads
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setLocalFile(file);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  // function to upload new PDF and redirect
  const handleUpload = async () => {
    if (!localFile) {
      alert("Please select a PDF file.");
      return;
    }
    try {
      const newPdf = await uploadPdf(localFile);
      window.location.href = `/edit/${newPdf._id}`;
    } catch (error) {
      alert("Failed to upload PDF.", error);
    }
  };

  const onUploadHandler = async () => {
    setIsUploading(true);
    try {
      if (id) {
        await handleSave();
      } else {
        await handleUpload();
      }
    } finally {
      setIsUploading(false);
    }
  };

  const closePreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setShowPreview(false);
  }, [previewUrl]);

  const handlePreview = useCallback(async () => {
    setIsPreviewLoading(true);
    const url = await generatePreviewPdf();
    setPreviewUrl(url);
    setShowPreview(true);
    setIsPreviewLoading(false);
  }, [generatePreviewPdf]);

  return (
    <div className='flex flex-col min-h-screen bg-gray-200'>
      <div className='bg-white/50 shadow p-6 rounded-md'>
        <div className='container mx-auto flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center space-x-4'>
            {!id && (
              <>
                <label
                  htmlFor="file-upload"
                  className='cursor-pointer bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 transition duration-300 inline-flex items-center gap-2'
                >
                  <FaUpload />
                  <span>Choose Pdf</span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </>
            )}
            <div className='flex items-center text-gray-600 gap-2'>
              <FaFile />
              <span className="truncate max-w-xs">{fileName}</span>
            </div>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button
              bgColor="bg-white" 
              textColor="text-gray-700" 
              className="border border-gray-300 hover:bg-gray-200"
              onClick={handlePreview}
              disabled={isPreviewLoading}
            >
              {isPreviewLoading ? (
                <BsGear className="animate-spin mr-2" />
              ) : (
                <FaEye className="mr-2" />
              )}
              {isPreviewLoading ? "Generating..." : "Preview"}
            </Button>

            <Button 
              bgColor="bg-white"
              textColor="text-gray-700" 
              className="border border-gray-300 hover:bg-gray-200"
              onClick={downloadPdf}
              disabled={!pdfUrl}
            >
              <FaSave />
              Download
            </Button>

            <Button
              onClick={onUploadHandler}
              className={`hover:bg-blue-700 ${isUploading ? "cursor-not-allowed opacity-50" : ""}`}
              disabled={isUploading}
            >
              {isUploading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaCloudUploadAlt className="mr-2" />
              )}
              {isUploading ? (id ? "Updating..." : "Uploading...") : id ? "Update" : "Upload"}
            </Button>
          </div>
        </div>
      </div>

      {loading && id ? (
        <div className='flex justify-center items-center h-40'>
          <BsGear className="h-20 w-20 animate-spin text-blue-300" />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row pt-4 gap-6">
          <div className="md:w-1/2 lg:w-1/4">
            <InputFields />
          </div>
          <div className="md:w-3/4 bg-white rounded-lg p-6">
            <PdfViewer
              pdfId={id}
              pdfUrl={pdfUrl}
              numPages={numPages}
              currentPage={currentPage}
              setNumPages={setNumPages}
              setCurrentPage={setCurrentPage}
              setPdfUrl={setPdfUrl}
              fields={fields}
              setFields={setFields}
            />
          </div>
        </div>
      )}

      <PreviewModal
        showPreview={showPreview}
        isPreviewLoading={isPreviewLoading}
        previewUrl={previewUrl}
        closePreview={closePreview}
      />

    </div>
  );
};

export default EditPdf;
