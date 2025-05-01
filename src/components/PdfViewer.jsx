import React from 'react'

const PdfViewer = () => {
  return (
    <div className='flex-grow flex flex-col items-center'>
      <div className='mb-4 flex items-center'>
        <button className='bg-blue-600 text-white px-4 py-2 rounded-l-md disabled:bg-gray-400'>
          Prev
        </button>
        <span className='bg-gray-200 px-4 py-2'>
          page 1 of 0
        </span>
        <button className='bg-blue-600 text-white px-4 py-2 rounded-r-md disabled:bg-gray-400'>
          Next
        </button>
      </div>
    </div>
  )
}

export default PdfViewer