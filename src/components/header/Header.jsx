import { Link } from 'react-router-dom';
import { FaHome, FaFilePdf, FaSlack } from "react-icons/fa";

const Header = () => {
  return (
    <header className='bg-slate-500 border-b border-black/10 w-full z-40 backdrop-blur-lg p-1'>
      <div className="container mx-auto px-5 h-16">
        <div className="flex items-center justify-between h-full">
          
          <div className="flex items-center gap-8 text-white">
            <Link
              to='/'
              className="flex items-center gap-2 hover:opacity-60 transition-all"
            >
              <div className="flex items-center justify-center size-9 rounded-lg">
                <FaSlack className="w-6 h-6"/>
              </div>
              <h1 className="text-2xl font-bold text-blue-400">Pdf<span className='text-white'>Ease</span></h1>
            </Link>
          </div>

          <nav className="flex items-center gap-6 text-white">
            <Link
              to='/'
              className='flex items-center gap-2 hover:text-blue-400 transition-all'
            >
              <FaHome className="w-5 h-5"/>
              <span className="text-md font-normal hidden sm:inline">Home</span>
            </Link>

            <Link
              to='/edit'
              className='flex items-center gap-2 hover:text-blue-400 transition-all'
            >
              <FaFilePdf className="w-5 h-5"/>
              <span className="text-md font-normal hidden sm:inline">Add Pdf</span>
            </Link>
          </nav>

        </div>
      </div>
    </header>
  )
}

export default Header