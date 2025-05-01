import { useParams } from "react-router-dom";
import Button from "../components/Button";
import InputFields from "../components/InputFields";
import PdfViewer from "../components/PdfViewer";
import { 
  FaCloudUploadAlt,
  FaEye, 
  FaFile, 
  FaSave, 
  FaUpload 
} from "react-icons/fa";

const EditPdf = () => {
  const { id } = useParams();

  return (
    <div className='flex flex-col min-h-screen bg-gray-200'>
      <div className='bg-white/50 shadow p-6 rounded-md'>
        <div className='container mx-auto flex flex-wrap items-center justify-between gap-4'>
          
          <div className='flex items-center space-x-4'>
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
              className="hidden"
            />

            <div className='flex items-center text-gray-600 gap-2'>
              <FaFile />
              <span className="truncate max-w-xs">No file selected</span>
            </div>
          </div>

          <div className='flex flex-wrap gap-2'>
            <Button bgColor="bg-white" textColor="text-gray-700" className="border border-gray-300 hover:bg-gray-200">
              <FaEye />
              Preview
            </Button>

            <Button 
              bgColor="bg-white"
              textColor="text-gray-700" 
              // onClick={() => handleSave()}
              className="border border-gray-300 hover:bg-gray-200"
            >
              <FaSave />
              Save Pdf
            </Button>

            <Button className="hover:bg-blue-700">
              <FaCloudUploadAlt />
              {id ? "Update Pdf" : "Upload Pdf"}
            </Button>
          </div>

        </div>
      </div>

      <div className="flex flex-col md:flex-row pt-4 gap-6">
        <div className="md:w-1/2 lg:w-1/4">
          <InputFields />
        </div>
        <div className="md:w-3/4 bg-white rounded-lg p-6">
          <PdfViewer />
        </div>
      </div>

    </div>
  )
}

export default EditPdf