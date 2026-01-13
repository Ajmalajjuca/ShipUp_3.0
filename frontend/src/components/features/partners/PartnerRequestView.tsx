import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  Truck,
  Building2,
  FileText,
  Shield,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { PartnerUser } from '../../../types';
import { adminService } from '../../../services/admin';
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';
import Loader from '../../../components/common/Loader/Loader';

interface VerificationField {
  key: keyof Pick<PartnerUser, 'bankDetailsCompleted' | 'personalDocumentsCompleted' | 'vehicleDetailsCompleted'>;
  label: string;
}

interface PartnerRequestViewProps {
  partnerId: string;
  onBack: () => void;
}

const PartnerRequestView: React.FC<PartnerRequestViewProps> = ({ partnerId, onBack }) => {
  const [partner, setPartner] = useState<PartnerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    fetchPartnerDetails();
  }, [partnerId]);

  const fetchPartnerDetails = async () => {
    try {
      const partnerRes = await adminService.getPartnerById(partnerId);
      console.log('Fetched partner details:', partnerRes);
      const vehicleId = partnerRes?.partner?.vehicleId;

      let vehicleDetails = null;

      if (vehicleId) {
        try {
          const vehicleRes =  {}; // Placeholder for vehicle details fetch if needed
          console.log('Fetched vehicle details:', vehicleRes);
          vehicleDetails = vehicleRes || null;
        }
        catch (error) {
            // Silently fail for vehicle details if not critical, or log
          console.error('Error fetching vehicle details:', error);
        }
      };
      setPartner(partnerRes.partner ? { ...partnerRes?.partner, vehicleDetails } : null);
    } catch (error) {
      console.error('Error fetching partner details:', error);
      toast.error('Failed to fetch partner details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    onBack();
  };

  const verificationFields: VerificationField[] = [
    { key: 'bankDetailsCompleted', label: 'Bank Details' },
    { key: 'personalDocumentsCompleted', label: 'Personal Documents' },
    { key: 'vehicleDetailsCompleted', label: 'Vehicle Details' }
  ];

  const handleVerification = async (field: string) => {
    try {
      const response = await adminService.verifyDocument(partnerId, field);

      if (response.success) {
        setPartner(prev => prev ? { ...prev, [field]: true } : null);
        toast.success('Verification updated successfully');
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification');
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <User size={18} /> },
    { id: 'vehicle', label: 'Vehicle Details', icon: <Truck size={18} /> },
    { id: 'bank', label: 'Bank Details', icon: <Building2 size={18} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={18} /> },
  ];

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader size="lg" text="Loading request details..." /></div>;
  
  if (!partner) {
      return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <Card className="text-center p-8 max-w-md">
                <div className="flex flex-col items-center">
                    <XCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Partner Request Not Found</h2>
                    <Button onClick={onBack} variant="primary">Go Back</Button>
                </div>
            </Card>
        </div>
      );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header with Status */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mr-4 rounded-full"
                leftIcon={<ArrowLeft size={24} />}
              >
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Partner Request Details</h2>
                <p className="text-sm text-gray-500 mt-1">Request ID: {partner.partnerId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Clock size={18} className="text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  Joined: {new Date(partner.createdAt).toLocaleDateString()}
                </span>
              </div>
              <VerificationBadge partner={partner} />
            </div>
          </div>

          {/* Profile Summary */}
          <div className="flex items-center mt-6">
             <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {partner.profilePicture ? (
                <img
                    src={`${partner.profilePicture}`}
                    alt={partner.fullName}
                    className="w-full h-full object-cover"
                />
                ) : (
                <User size={32} className="text-gray-400" />
                )}
             </div>
            <div className="ml-6">
              <h3 className="text-2xl font-bold text-gray-800">{partner.fullName}</h3>
              <div className="flex items-center mt-2 text-gray-600">
                <span className="mr-4">{partner.email}</span>
                <span>{partner.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <nav className="flex space-x-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard
              title="Personal Information"
              icon={<User className="text-blue-500" />}
              items={[
                { label: "Full Name", value: partner.fullName },
                { label: "Email", value: partner.email },
                { label: "Mobile", value: partner.phone },
                { label: "Date of Birth", value: partner.dateOfBirth || 'N/A' },
              ]}
            />
          </div>
        )}

        {activeTab === 'vehicle' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard
              title="Vehicle Details"
              icon={<Truck className="text-blue-500" />}
              items={[
                { label: "Vehicle Type", value: partner.vehicalDocuments?.vehicleType || 'N/A'
                },
                { label: "Registration Number", value: partner.vehicalDocuments?.registrationNumber || 'N/A' }
              ]}
            />
            <DocumentsCard
              title="Vehicle Documents"
              documents={[
                {
                  label: "License",
                  path: partner.personalDocuments?.licenseFront,
                  docType: "license",
                  isComplete: Boolean(partner.personalDocuments?.licenseFront),
                  verificationField: "vehicleDetailsCompleted"
                },
                {
                  label: "Insurance",
                  path: partner.vehicalDocuments?.insuranceDocument,
                  docType: "insurance",
                  isComplete: Boolean(partner.vehicalDocuments?.insuranceDocument),
                  verificationField: "vehicleDetailsCompleted"
                },
                {
                  label: "Pollution Certificate",
                  path: partner.vehicalDocuments?.pollutionDocument,
                  docType: "pollution",
                  isComplete: Boolean(partner.vehicalDocuments?.pollutionDocument),
                  verificationField: "vehicleDetailsCompleted"
                }
              ]}
              partner={partner}
              onVerify={() => handleVerification('vehicleDetailsCompleted')}
            />
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard
              title="Bank Account Details"
              icon={<Building2 className="text-purple-500" />}
              items={[
                { label: "Account Holder", value: partner.bankingDetails?.accountHolderName || 'N/A' },
                { label: "Account Number", value: partner.bankingDetails?.accountNumber || 'N/A' },
                { label: "IFSC Code", value: partner.bankingDetails?.ifscCode || 'N/A' },
                { label: "UPI ID", value: partner.bankingDetails?.upiId || 'N/A' }
              ]}
            />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DocumentsCard
              title="Identity Documents"
              documents={[
                {
                  label: "Aadhar Card",
                  path: partner.personalDocuments?.aadharFront,
                  docType: "aadhar",
                  isComplete: Boolean(partner.personalDocuments?.aadharFront),
                  verificationField: "personalDocumentsCompleted"
                },
                {
                  label: "PAN Card",
                  path: partner.personalDocuments?.panFront,
                  docType: "pan",
                  isComplete: Boolean(partner.personalDocuments?.panFront),
                  verificationField: "personalDocumentsCompleted"
                }
              ]}
              partner={partner}
              onVerify={() => handleVerification('personalDocumentsCompleted')}
            />
          </div>
        )}

        {/* Add Verification Status section */}
        <Card className="mt-8">
          <div className="mb-4">
             <h3 className="text-lg font-semibold">Verification Status</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {verificationFields.map((field) => (
              <VerificationCard
                key={field.key}
                label={field.label}
                isVerified={Boolean(partner[field.key])}
                onVerify={() => handleVerification(field.key)}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Helper Components
const InfoCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: Array<{ label: string; value: string }>;
  verificationStatus?: {
    isVerified: boolean;
    onVerify: () => void;
  };
}> = ({ title, icon, items, verificationStatus }) => (
  <Card className="h-full" padding="lg">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        {icon}
        <h3 className="text-lg font-semibold ml-2">{title}</h3>
      </div>
      {verificationStatus && (
        <div className="flex items-center">
          {verificationStatus.isVerified ? (
            <Badge variant="success" dot>
                <span className="flex items-center gap-1">
                    <CheckCircle size={14} />
                    Verified
                </span>
            </Badge>
          ) : (
            <Button size="sm" onClick={verificationStatus.onVerify}>Verify</Button>
          )}
        </div>
      )}
    </div>
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index}>
          <p className="text-sm text-gray-500">{item.label}</p>
          <p className="font-medium">{item.value}</p>
        </div>
      ))}
    </div>
  </Card>
);

const DocumentsCard: React.FC<{
  title: string;
  documents: Array<{
    label: string;
    path?: string;
    docType: string;
    isComplete: boolean;
    verificationField?: keyof Pick<PartnerUser, 'bankDetailsCompleted' | 'personalDocumentsCompleted' | 'vehicleDetailsCompleted' >;
  }>;
  partner: PartnerUser;
  onVerify: () => void;
}> = ({ title, documents, partner, onVerify }) => (
  <Card className="h-full" padding="lg">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
    <div className="space-y-4">
      {documents.map((doc, index) => (
        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="flex items-center">
            {doc.isComplete ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className="text-gray-700">{doc.label}</span>
          </div>
          <div className="flex items-center space-x-2">

            {doc.path && (
               <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.open(`${doc.path}`, '_blank')}
               >
                   View
               </Button>
            )}
            {doc.verificationField && !partner[doc.verificationField as keyof PartnerUser] && (
               <Button 
                variant="success" 
                size="sm" 
                onClick={onVerify}
               >
                   Verify
               </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  </Card>
);

const VerificationBadge: React.FC<{ partner: PartnerUser }> = ({ partner }) => {
  const isFullyVerified = partner.bankDetailsCompleted &&
    partner.personalDocumentsCompleted &&
    partner.vehicleDetailsCompleted;

  return (
    <Badge 
        variant={isFullyVerified ? 'success' : 'warning'}
        dot
    >
        <span className="flex items-center gap-1">
            {isFullyVerified ? <Shield className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            {isFullyVerified ? 'Verified Partner' : 'Verification Pending'}
        </span>
    </Badge>
  );
};

const VerificationCard: React.FC<{
  label: string;
  isVerified: boolean;
  onVerify: () => void;
}> = ({ label, isVerified, onVerify }) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
    <div className="flex items-center">
      {isVerified ? (
        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
      ) : (
        <Clock className="w-5 h-5 text-yellow-500 mr-2" />
      )}
      <span className="text-gray-700">{label}</span>
    </div>
    {!isVerified && (
       <Button variant="success" size="sm" onClick={onVerify}>Verify</Button>
    )}
  </div>
);

export default PartnerRequestView; 