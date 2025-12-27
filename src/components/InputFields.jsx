import { useDrag } from 'react-dnd';
import { IoCheckbox, IoList, IoRadioButtonOn, IoText } from "react-icons/io5";

const FIELD_TYPES = [
  { type: "text", label: "Text", icon: IoText },
  { type: "checkbox", label: "Checkbox", icon: IoCheckbox },
  { type: "radio", label: "Radio", icon: IoRadioButtonOn },
  { type: "dropdown", label: "Dropdown", icon: IoList },
];

const InputFields = () => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
    <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Input Fields</h3>
    <div className="space-y-4">
      {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
        <DraggableField key={type} type={type} label={label} Icon={Icon} />
      ))}
    </div>
  </div>
);

const DraggableField = ({ type, label, Icon }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FIELD',
    item: { fieldType: type },
      collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

return (
    <div
      ref={drag}
      className={`flex items-center gap-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 p-4 rounded-lg cursor-move transition duration-300 ease-in-out group ${isDragging ? 'opacity-50' : ''}`}
    >
      {Icon && <Icon className="text-xl group-hover:scale-110 transition-transform duration-300" />}
      <span className="font-medium">{label}</span>
      <span className="ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Drag {type}
      </span>
    </div>
  );
};

export default InputFields;
