import { useState } from "react";
import type { DriverRegistrationData } from "../../../types";

import { MapPinIcon } from "lucide-react";
import RegistrationForm from "./RegistrationForm";
import VehicleDetailsForm from "./VehicleDetailsForm";
import PersonalDocuments from "./PersonalDocuments";
import DocumentUpload from "./DocumentUpload";
import DocumentChecklist from "./DocumentChecklist";
import BankDetailsForm from "./BankDetailsForm";
import type { UploadProgress } from "../../../services/uploadService";
import { deliveryPartnerAuthService } from "../../../services/deliveryPartnerAuth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout";

export const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center text-gray-600 hover:text-gray-800 mb-4 text-sm"
  >
    <svg
      className="w-4 h-4 mr-1"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
    Back
  </button>
);

const PartnerRegistration: React.FC = () => {
  const [currentStep, setCurrentStep] = useState("checklist");
  const [completedDocuments, setCompletedDocuments] = useState<string[]>([]);
  const [registrationData, setRegistrationData] = useState<
    Partial<DriverRegistrationData>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Handle personal form submission
  const handlePersonalSubmit = (data: Partial<DriverRegistrationData>) => {
    setRegistrationData((prev) => ({ ...prev, ...data }));
    if (!completedDocuments.includes("personal")) {
      setCompletedDocuments((prev) => [...prev, "personal"]);
    }
    setCurrentStep("checklist");
  };

  // Handle vehicle form submission
  const handleVehicleSubmit = (data: Partial<DriverRegistrationData>) => {
    setRegistrationData((prev) => ({ ...prev, ...data }));
    if (!completedDocuments.includes("vehicle")) {
      setCompletedDocuments((prev) => [...prev, "vehicle"]);
    }
    setCurrentStep("checklist");
  };

  // Handle bank form submission
  const handleBankSubmit = (data: Partial<DriverRegistrationData>) => {
    setRegistrationData((prev) => ({ ...prev, ...data }));
    if (!completedDocuments.includes("bank")) {
      setCompletedDocuments((prev) => [...prev, "bank"]);
    }
    setCurrentStep("checklist");
  };

  // Handle document click from checklist
  const handleDocumentClick = (documentId: string) => {
    setCurrentStep(documentId);
  };

  // Handle personal document click
  const handlePersonalDocumentClick = (documentType: string) => {
    setCurrentStep(`document-${documentType}`);
  };

  // Handle document upload completion
  const handleDocumentUploadComplete = (
    documentType: string,
    files: { front?: File; back?: File }
  ) => {
    // Save document files to registration data
    const updatedData = { ...registrationData };

    if (documentType === "aadhar") {
      updatedData.aadharFront = files.front;
      updatedData.aadharBack = files.back;
    } else if (documentType === "pan") {
      updatedData.panFront = files.front;
      updatedData.panBack = files.back;
    } else if (documentType === "license") {
      updatedData.licenseFront = files.front;
      updatedData.licenseBack = files.back;
    }

    setRegistrationData(updatedData);
    setCurrentStep("documents");
  };

  // Handle personal documents completion
  const handlePersonalDocumentsComplete = () => {
    if (!completedDocuments.includes("documents")) {
      setCompletedDocuments((prev) => [...prev, "documents"]);
    }
    setCurrentStep("checklist");
  };

  // Handle final submission
  // Add this function in your RegistrationLayout component

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setUploadProgress(null);

    try {
      const result = await deliveryPartnerAuthService.register(
        registrationData,
        (progress: UploadProgress) => {
          setUploadProgress(progress);
          console.log(`Upload progress: ${progress.percentage}%`);
        }
      );

      console.log("Registration successful:", result);
      toast.success("Registration successful!");
      navigate("/partner/verification", {
        replace: true,
        state: { email: registrationData.email },
      });
    } catch (error: any) {
      console.error(
        "Registration failed:",
        error.response?.data?.message || error.message
      );
      let errorMessage = "Registration failed. Please try again.";

      if (error.response?.data?.message?.includes("timeout")) {
        errorMessage =
          "Upload is taking longer than expected. Please check your internet connection and try again.";
      } else if (error.response?.data?.message?.includes("too large")) {
        errorMessage =
          "Some files are too large. Please compress your images and try again.";
      } else if (error.response?.data?.message?.includes("Invalid file type")) {
        errorMessage =
          "Some files have invalid formats. Please check your documents and try again.";
      } else if (error.response?.status === 413) {
        errorMessage =
          "Files are too large. Please reduce file sizes and try again.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again in a few minutes.";
      }
      setError(error.response?.data?.message || errorMessage);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case "personal":
        return (
          <RegistrationForm
            initialData={registrationData}
            onSubmit={handlePersonalSubmit}
            onBack={() => setCurrentStep("checklist")}
          />
        );
      case "vehicle":
        return (
          <VehicleDetailsForm
            initialData={registrationData}
            onSubmit={handleVehicleSubmit}
            onBack={() => setCurrentStep("checklist")}
          />
        );
      case "bank":
        return (
          <BankDetailsForm
            initialData={registrationData}
            onSubmit={handleBankSubmit}
            onBack={() => setCurrentStep("checklist")}
          />
        );
      case "documents":
        return (
          <PersonalDocuments
            onDocumentClick={handlePersonalDocumentClick}
            completedDocuments={["aadhar", "pan", "license"]} // For demo, all completed
            onBack={() => {
              handlePersonalDocumentsComplete();
            }}
          />
        );
      case "document-aadhar":
        return (
          <DocumentUpload
            documentType="Aadhar Card"
            onSubmit={(files) => handleDocumentUploadComplete("aadhar", files)}
            onBack={() => setCurrentStep("documents")}
            initialFiles={{
              front: registrationData.aadharFront,
              back: registrationData.aadharBack,
            }}
          />
        );
      case "document-pan":
        return (
          <DocumentUpload
            documentType="PAN Card"
            onSubmit={(files) => handleDocumentUploadComplete("pan", files)}
            onBack={() => setCurrentStep("documents")}
            initialFiles={{
              front: registrationData.panFront,
              back: registrationData.panBack,
            }}
          />
        );
      case "document-license":
        return (
          <DocumentUpload
            documentType="Driving License"
            onSubmit={(files) => handleDocumentUploadComplete("license", files)}
            onBack={() => setCurrentStep("documents")}
            initialFiles={{
              front: registrationData.licenseFront,
              back: registrationData.licenseBack,
            }}
          />
        );
      case "checklist":
      default:
        return (
          <DocumentChecklist
            onDocumentClick={handleDocumentClick}
            onNextClick={handleFinalSubmit}
            completedDocuments={completedDocuments}
            isSubmitting={isSubmitting}
            uploadProgress={uploadProgress}
            error={error}
          />
        );
    }
  };

  return (
       <Layout>
        <div className="bg-white p-4 md:p-6 flex items-center justify-center overflow-y-auto max-h-[90vh] lg:max-h-[90vh]">
          <div className="w-full max-w-md">
            {renderCurrentStep()}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have a partner account?
                <a
                  onClick={() => navigate("/partner/login")}
                  className="text-red-500 hover:underline ml-1 cursor-pointer"
                >
                  Login here
                </a>
              </p>
            </div>
          </div>
        </div>
       </Layout>
      
  );
};

export default PartnerRegistration;
