import { Outlet } from 'react-router-dom'
import { Footer, Header } from './components'
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();


const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-200">
      <Header />
        <main className='flex-grow container mx-auto px-4 py-8'>
          <Outlet />
        </main>
      <Footer />
    </div>
  )
}

export default App