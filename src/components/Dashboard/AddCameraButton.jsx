import React, { useState } from 'react';
import { Plus, Video } from 'lucide-react';
import AddCameraModal from './AddCameraModal';

const AddCameraButton = ({ onCameraAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="group flex w-full align-center items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-200"
      >
        <div className="relative">
          <Video className="w-5 h-5" />
          <Plus className="w-3 h-3 absolute -top-1 -right-1 bg-white text-cyan-600 rounded-full" />
        </div>
        <span>Add Camera</span>
      </button>

      <AddCameraModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCameraAdded={onCameraAdded}
      />
    </>
  );
};

export default AddCameraButton;