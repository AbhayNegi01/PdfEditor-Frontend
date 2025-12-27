import { FaTimes } from 'react-icons/fa';
import { Rnd } from "react-rnd";

const PDFFieldOverlay = ({ fields, currentPage, onUpdateField, onDeleteField }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {fields
        .filter((field) => field.pageNumber === currentPage)
        .map((field) => {
          const fontSize = Math.max(12, Math.min(18, field.height / 4));

          return (
            <Rnd
                key={field._id || field.tempId}
              default={{
                x: field.position.x,
                y: field.position.y,
                width: field.width,
                height: field.height,
              }}
              bounds="parent"
              enableResizing
              dragHandleClassName="drag-handle"
              className="absolute pointer-events-auto" /*bg-white rounded-md border border-gray-300*/
              onDragStop={(e, d) =>
                onUpdateField(field._id || field.tempId, { ...field, position: { x: d.x, y: d.y } })
              }
              onResizeStop={(e, dir, ref, delta, pos) =>
                onUpdateField(field._id || field.tempId, {
                  ...field,
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  position: { x: pos.x, y: pos.y },
                })
              }
              minWidth={50}
              minHeight={30}
            >
              <div key={field._id || field.tempId} className="group w-full h-full flex flex-col select-text">
                <div className="bg-blue-400 text-white p-1 rounded-t-md cursor-move drag-handle flex justify-between items-center invisible group-hover:visible">
                  <span className="text-sm truncate">{field.fieldType}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteField(field._id || field.tempId)}
                    className="hover:text-red-600 hover:text-lg font-bold focus:outline-none"
                    title="Delete Field"
                  >
                    <FaTimes />
                  </button>
                </div>

                {field.fieldType === "text" && (
                  <textarea
                    className="w-full h-full px-2 py-1 text-sm border border-gray-300 hover:border-blue-300 rounded-md outline-none"
                    value={field.value || ""}
                    placeholder="Enter text here..."
                    onChange={(e) => 
                      onUpdateField(field._id || field.tempId, { ...field, value: e.target.value })
                    }
                    style={{ fontSize: `${fontSize}px`, width: `${field.width}px`, height: `${field.height}px` }}
                  />
                )}

                {(field.fieldType === "checkbox" || field.fieldType === "radio") && (
                  <div className="w-full h-full flex items-center px-2 py-1 bg-white border border-gray-300 hover:border-blue-300 rounded-md truncate select-text">
                    <input
                      type={field.fieldType}
                      checked={field.value === "true"}
                      onChange={(e) =>
                        onUpdateField(field._id || field.tempId, { ...field, value: e.target.checked.toString() })
                      }
                      className="mr-2 w-5 h-5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => 
                        onUpdateField(field._id || field.tempId, { ...field, label: e.target.value })
                      }
                      className="flex-grow rounded px-2 py-1 text-sm outline-none truncate"
                      placeholder={`Enter ${field.fieldType} label...`}
                      style={{ fontSize: `${fontSize}px` }}
                    />
                  </div>
                )}

                {field.fieldType === "dropdown" && (
                  <select
                    style={{ fontSize: `${fontSize}px` }}
                    className="w-full h-full text-sm border border-gray-300 hover:border-blue-300 rounded-md outline-none"
                    value={field.value || ""}
                    onChange={(e) => 
                      onUpdateField(field._id || field.tempId, { ...field, value: e.target.value })
                    }
                  >
                    {field.options?.length > 0 ? (
                      field.options.map((opt, idx) => (
                        <option key={idx} value={opt}>
                          {opt}
                        </option>
                      ))
                    ) : (
                      <option disabled>No options</option>
                    )}
                  </select>
                )}
              </div>
            </Rnd>
          );
        })}
    </div>
  );
};

export default PDFFieldOverlay;