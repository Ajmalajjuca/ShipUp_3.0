import { useState } from "react";
import type { DriverRegistrationData } from "../../../types";
import { BackButton } from "./PartnerRegistration";

const BankDetailsForm: React.FC<{
  initialData: Partial<DriverRegistrationData>;
  onSubmit: (data: Partial<DriverRegistrationData>) => void;
  onBack: () => void;
}> = ({ initialData, onSubmit, onBack }) => {
  const [formData, setFormData] = useState<Partial<DriverRegistrationData>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountHolderName) newErrors.accountHolderName = 'Account holder name is required';
    if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
    else if (!/^\d{9,18}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account number should be between 9-18 digits';
    }
    
    if (!formData.ifscCode) newErrors.ifscCode = 'IFSC code is required';
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
      newErrors.ifscCode = 'Invalid IFSC code format';
    }

    if (formData.upiId && !/^[\w.\-_]{3,}@[a-zA-Z]{3,}$/.test(formData.upiId)) {
      newErrors.upiId = 'Invalid UPI ID format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <BackButton onClick={onBack} />
      
      <div className="mb-3">
        <h2 className="text-base font-semibold text-gray-800">Bank Details</h2>
        <p className="text-xs text-gray-600">Enter your banking information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Account Holder Name</label>
          <input
            type="text"
            name="accountHolderName"
            placeholder="Enter account holder name"
            value={formData.accountHolderName || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              errors.accountHolderName ? 'border-red-500' : 'border-gray-200'
            } focus:border-red-300 focus:ring-1 focus:ring-red-200 outline-none transition-all`}
          />
          {errors.accountHolderName && <p className="text-xs text-red-500 mt-1">{errors.accountHolderName}</p>}
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Account Number</label>
          <input
            type="text"
            name="accountNumber"
            placeholder="Enter account number"
            value={formData.accountNumber || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              errors.accountNumber ? 'border-red-500' : 'border-gray-200'
            } focus:border-red-300 focus:ring-1 focus:ring-red-200 outline-none transition-all`}
          />
          {errors.accountNumber && <p className="text-xs text-red-500 mt-1">{errors.accountNumber}</p>}
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">IFSC Code</label>
          <input
            type="text"
            name="ifscCode"
            placeholder="e.g. SBIN0000123"
            value={formData.ifscCode || ''}
            onChange={handleChange}
            maxLength={11}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              errors.ifscCode ? 'border-red-500' : 'border-gray-200'
            } focus:border-red-300 focus:ring-1 focus:ring-red-200 outline-none transition-all uppercase`}
          />
          {errors.ifscCode && <p className="text-xs text-red-500 mt-1">{errors.ifscCode}</p>}
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">UPI ID (Optional)</label>
          <input
            type="text"
            name="upiId"
            placeholder="e.g. username@upi"
            value={formData.upiId || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              errors.upiId ? 'border-red-500' : 'border-gray-200'
            } focus:border-red-300 focus:ring-1 focus:ring-red-200 outline-none transition-all`}
          />
          {errors.upiId && <p className="text-xs text-red-500 mt-1">{errors.upiId}</p>}
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-indigo-900 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-800 transition-colors flex items-center justify-center text-sm"
        >
          NEXT <span className="ml-2">→</span>
        </button>
      </form>
    </div>
  );
};

export default BankDetailsForm;