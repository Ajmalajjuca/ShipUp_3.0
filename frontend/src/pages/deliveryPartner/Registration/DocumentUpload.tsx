import { useState } from "react";
import { BackButton } from "./PartnerRegistration";

const DocumentUpload: React.FC<{
  documentType: string;
  onSubmit: (files: { front?: File; back?: File }) => void;
  onBack: () => void;
  initialFiles?: { front?: File; back?: File };
}> = ({ documentType, onSubmit, onBack, initialFiles }) => {
  const [files, setFiles] = useState<{ front?: File; back?: File }>(initialFiles || {});
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});

  const handleFileChange = (side: 'front' | 'back', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [side]: 'Please upload an image file' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [side]: 'File size should be less than 5MB' }));
      return;
    }

    setFiles(prev => ({ ...prev, [side]: file }));
    setErrors(prev => ({ ...prev, [side]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.front && files.back) {
      onSubmit(files);
    } else {
      const newErrors: { front?: string; back?: string } = {};
      if (!files.front) newErrors.front = 'Front side photo is required';
      if (!files.back) newErrors.back = 'Back side photo is required';
      setErrors(newErrors);
    }
  };

  const renderUploadBox = (side: 'front' | 'back') => (
    <div className={`border-2 border-dashed rounded-lg p-4 text-center h-[160px] flex flex-col justify-center items-center
      ${errors[side] ? 'border-red-500' : 'border-gray-300'}`}
    >
      <p className="text-xs text-gray-600 mb-2">
        {side === 'front' ? 'Front' : 'Back'} side photo of your {documentType}
      </p>
      
      {files[side] ? (
        <div className="relative w-full h-[90px]">
          <img
            src={URL.createObjectURL(files[side])}
            alt={`${side} side`}
            className="w-full h-full object-contain rounded-lg"
          />
          <button
            type="button"
            onClick={() => setFiles(prev => ({ ...prev, [side]: undefined }))}
            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs"
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <input
            type="file"
            id={`${side}Side`}
            accept="image/*"
            onChange={(e) => handleFileChange(side, e)}
            className="hidden"
          />
          <label htmlFor={`${side}Side`} className="inline-flex items-center px-3 py-1.5 text-xs text-red-500 cursor-pointer">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Upload Photo
          </label>
        </>
      )}
      
      {errors[side] && <p className="text-xs text-red-500 mt-1">{errors[side]}</p>}
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <BackButton onClick={onBack} />
      
      <div className="mb-3">
        <h2 className="text-base font-semibold text-gray-800">Upload {documentType}</h2>
        <p className="text-sm text-gray-600">
          Upload focused photo of your {documentType} for faster verification
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {renderUploadBox('front')}
        {renderUploadBox('back')}

        <button
          type="submit"
          className="w-full bg-indigo-900 text-white py-3 px-4 rounded-lg hover:bg-indigo-800 transition-colors"
        >
          NEXT
        </button>
      </form>
    </div>
  );
};

export default DocumentUpload;