import React from 'react';
import { BackButton } from "./PartnerRegistration";

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const DocumentChecklist: React.FC<{
  onDocumentClick: (documentId: string) => void;
  onNextClick: () => Promise<void>;
  completedDocuments: string[];
  isSubmitting?: boolean;
  uploadProgress?: UploadProgress | null;
  error?: string | null;
  onBack?: () => void;
}> = ({ 
  onDocumentClick, 
  onNextClick, 
  completedDocuments, 
  isSubmitting = false,
  uploadProgress = null,
  error = null,
  onBack 
}) => {
  const documents = [
    { id: 'personal', title: 'Personal Information' },
    { id: 'documents', title: 'Personal Documents' },
    { id: 'vehicle', title: 'Vehicle Details' },
    { id: 'bank', title: 'Bank Account Details' },
  ];

  const allCompleted = documents.every(doc => completedDocuments.includes(doc.id));

 

  return (
    <div className="w-full max-w-md mx-auto p-6">
      {onBack && <BackButton onClick={onBack} />}
      
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-800">Registration Checklist</h2>
        <p className="text-xs text-gray-600">Complete all sections to proceed</p>
      </div>

      <div className="space-y-3">
        {documents.map(doc => (
          <button
            key={doc.id}
            onClick={() => onDocumentClick(doc.id)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            <span className="text-gray-800">{doc.title}</span>
            <div className="flex items-center">
              <span className={`text-sm ${
                completedDocuments.includes(doc.id) ? 'text-green-500' : 'text-red-500'
              }`}>
                {completedDocuments.includes(doc.id) ? '✓' : '→'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Upload Failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      

      {/* Submit Button */}
      <button
        onClick={onNextClick}
        disabled={!allCompleted || isSubmitting}
        className={`w-full mt-6 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center font-medium
          ${(!allCompleted || isSubmitting) 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-indigo-900 text-white hover:bg-indigo-800 active:bg-indigo-950'
          }`}
      >
        {isSubmitting ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {uploadProgress ? `UPLOADING ${uploadProgress.percentage}%` : 'SUBMITTING...'}
          </span>
        ) : (
          <>
            SUBMIT APPLICATION
            <span className="ml-2">→</span>
          </>
        )}
      </button>

      {/* Progress Summary */}
      {isSubmitting && !uploadProgress && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Processing your application, this may take a few minutes...
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentChecklist;