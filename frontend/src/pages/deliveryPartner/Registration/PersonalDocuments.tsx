import { BackButton } from "./PartnerRegistration";

const PersonalDocuments: React.FC<{
  onDocumentClick: (documentType: string) => void;
  completedDocuments: string[];
  onBack: () => void;
}> = ({ onDocumentClick, completedDocuments, onBack }) => {
  const documents = [
    { id: 'aadhar', title: 'Aadhar Card' },
    { id: 'pan', title: 'PAN Card' },
    { id: 'license', title: 'Driving License' },
  ];

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <BackButton onClick={onBack} />
      
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-800">Personal Documents</h2>
        <p className="text-xs text-gray-600">Upload your identity documents</p>
      </div>

      <div className="space-y-3">
        {documents.map(doc => (
          <button
            key={doc.id}
            onClick={() => onDocumentClick(doc.id)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
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

      <button
        onClick={() => {/* Handle next - all documents completed */}}
        disabled={documents.length !== completedDocuments.length}
        className={`w-full mt-6 py-3 px-4 rounded-lg transition-colors text-sm font-medium ${
          documents.length === completedDocuments.length
            ? 'bg-indigo-900 text-white hover:bg-indigo-800'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        NEXT
      </button>
    </div>
  );
};

export default PersonalDocuments;