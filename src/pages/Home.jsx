import { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  BsCalendar3,
  BsFileEarmarkPdfFill,
  BsGear,
  BsPencilSquare,
  BsTrash2Fill 
} from "react-icons/bs";

const Home = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletePdfId, setDeletePdfId] = useState(null);

  const fetchPdfs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/pdfs`);
      setPdfs(response.data.data);
    } catch (error) {
      console.error("Failed to fetch PDFs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateAndTime = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  const handleDelete = (id) => {
    setDeletePdfId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/v1/pdfs/${deletePdfId}`);
      setShowModal(false);
      setDeletePdfId(null);

      setPdfs((prevPdfs) => prevPdfs.filter((pdf) => pdf._id !== deletePdfId));
    } catch (error) {
      console.error("Error deleting PDF:", error);
    }
  }

  useEffect(() => {
    fetchPdfs();
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-40'>
        <BsGear className="h-20 w-20 animate-spin text-blue-300"/>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-4xl font-bold text-center text-slate-600 relative pb-3 mb-10">
        Your PDFs
        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-500"></span>
      </h2>
      {pdfs.length === 0 ? (
        <p className="text-center text-gray-500 my-8">No PDFs uploaded yet.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pdfs.map((pdf) => (
            <li
              key={pdf._id}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
            >

              <div className='flex items-center gap-2 mb-2'>
                <BsFileEarmarkPdfFill className='text-red-500 text-xl'/>
                <span className="truncate text-lg text-slate-700 font-medium">
                  {pdf.name}
                </span>
              </div>

              <div className='flex items-center text-sm text-gray-600 mb-5 gap-2'>
                <BsCalendar3 />
                <span className='font-normal'>
                  Uploaded: {formatDateAndTime(pdf.createdAt)}
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <Link
                  to={`/edit/${pdf._id}`}
                  className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-600 hover:bg-green-200 transition-colors duration-200 -mx-2'
                >
                  <BsPencilSquare /> Edit
                </Link>

                <button
                  onClick={() => handleDelete(pdf._id)}
                  className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200'
                >
                  <BsTrash2Fill /> Delete
                </button>
              </div>
              
            </li>
          ))}
        </ul>
      )}

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-500 bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-2">Confirm Delete</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this PDF?
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 hover:scale-105 dur"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home