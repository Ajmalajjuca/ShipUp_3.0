import { useState } from "react";
import type { DriverRegistrationData } from "../../../types";
import { BackButton } from "./PartnerRegistration";

const VehicleDetailsForm: React.FC<{
  initialData: Partial<DriverRegistrationData>;
  onSubmit: (data: Partial<DriverRegistrationData>) => void;
  onBack: () => void;
}> = ({ initialData, onSubmit, onBack }) => {
  const [formData, setFormData] = useState<Partial<DriverRegistrationData>>(initialData);
  const [documents, setDocuments] = useState<{
    insurance: File | null;
    pollution: File | null;
  }>({ 
    insurance: initialData.insuranceDocument || null, 
    pollution: initialData.pollutionDocument || null 
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const vehicleTypes = [
    { id: 'bike', label: 'Motorcycle' },
    { id: 'car', label: 'Car' },
    { id: 'van', label: 'Van' },
    { id: 'truck', label: 'Truck' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'registrationNumber') {
      const formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      let finalValue = '';
      for (let i = 0; i < formattedValue.length; i++) {
        if (i > 0 && i % 2 === 0 && i < 8) {
          finalValue += ' ';
        }
        finalValue += formattedValue[i];
      }
      if (finalValue.length <= 13) {
        setFormData(prev => ({ ...prev, [name]: finalValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (type: 'insurance' | 'pollution', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [type]: 'Please upload a PDF or image file' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [type]: 'File size should be less than 5MB' }));
      return;
    }

    setDocuments(prev => ({ ...prev, [type]: file }));
    setErrors(prev => ({ ...prev, [type]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
    if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration number is required';
    if (!documents.insurance) newErrors.insurance = 'Insurance document is required';
    if (!documents.pollution) newErrors.pollution = 'Pollution certificate is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        insuranceDocument: documents.insurance || undefined,
        pollutionDocument: documents.pollution || undefined
      });
    }
  };

  const renderFileUpload = (type: 'insurance' | 'pollution', label: string) => (
    <div className="mb-4">
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
        errors[type] ? 'border-red-500' : 'border-gray-300'
      }`}>
        {documents[type] ? (
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div className="ml-2 text-left">
                <p className="text-xs font-medium text-gray-900">{documents[type]?.name}</p>
                <p className="text-xs text-gray-500">
                  {documents[type] ? (documents[type].size / 1024 / 1024).toFixed(2) : '0'} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDocuments(prev => ({ ...prev, [type]: null }))}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <input
              type="file"
              id={type}
              accept=".pdf,image/*"
              onChange={(e) => handleFileChange(type, e)}
              className="hidden"
            />
            <label htmlFor={type} className="cursor-pointer">
              <svg className="w-10 h-10 text-red-500 mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm text-red-500">Upload Document</span>
              <div className="text-xs text-gray-500 mt-1">PDF or Image, max 5MB</div>
            </label>
          </>
        )}
        {errors[type] && <p className="text-xs text-red-500 mt-1">{errors[type]}</p>}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <BackButton onClick={onBack} />
      
      <div className="mb-3">
        <h2 className="text-base font-semibold text-gray-800">Vehicle Details</h2>
        <p className="text-xs text-gray-600">Enter your vehicle information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Vehicle Type</label>
          <select
            name="vehicleType"
            value={formData.vehicleType || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              errors.vehicleType ? 'border-red-500' : 'border-gray-200'
            } focus:border-red-300 focus:ring-1 focus:ring-red-200 outline-none transition-all`}
          >
            <option value="">Select vehicle type</option>
            {vehicleTypes.map(type => (
              <option key={type.id} value={type.label}>{type.label}</option>
            ))}
          </select>
          {errors.vehicleType && <p className="text-xs text-red-500 mt-1">{errors.vehicleType}</p>}
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Vehicle Registration Number</label>
          <input
            type="text"
            name="registrationNumber"
            placeholder="KA 01 AB 1234"
            value={formData.registrationNumber || ''}
            onChange={handleChange}
            maxLength={13}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              errors.registrationNumber ? 'border-red-500' : 'border-gray-200'
            } focus:border-red-300 focus:ring-1 focus:ring-red-200 outline-none transition-all uppercase`}
          />
          {errors.registrationNumber && <p className="text-xs text-red-500 mt-1">{errors.registrationNumber}</p>}
          <p className="text-xs text-gray-400 mt-1">Format: SS NN XX NNNN (S: State, N: Number, X: Letter)</p>
        </div>

        {renderFileUpload('insurance', 'Vehicle Insurance Document')}
        {renderFileUpload('pollution', 'Pollution Certificate')}

        <button
          type="submit"
          className="w-full mt-4 bg-indigo-900 hover:bg-indigo-800 text-white py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center text-sm"
        >
          NEXT <span className="ml-2">→</span>
        </button>
      </form>
    </div>
  );
};

export default VehicleDetailsForm;