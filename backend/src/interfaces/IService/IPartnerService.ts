import { UserRole, OTPType, JWTPayload, PartnerRegistrationData } from '../../types';
import { IPartner } from '../IModel/IPartner';

export interface IPartnerService {
    register(registrationData: PartnerRegistrationData, fileUrls: { [key: string]: string }): Promise<{ partner: IPartner; message: string }>;
    requestLoginOtp(email: string): Promise<{ message: string }>;
    verifyLoginOtp(email: string, otp: string): Promise<{ user: any; accessToken: string; refreshToken: string }>;
    getVerificationStatus(partnerId: string): Promise<{ isVerified: boolean; verificationStatus: { personalInformation: boolean; personalDocuments: boolean; vehicalDocuments: boolean; bankingDetails: boolean }; }>;
    getCurrentPartner(partnerId: string): Promise<IPartner>;
    refreshToken(refreshToken: string): Promise<{ accessToken: string }>;
    updateDocumentStatus(partnerId: string, documentType: 'aadhar' | 'pan' | 'license' | 'insurance' | 'pollution' | 'banking', status: 'approved' | 'rejected' | 'pending', rejectionReason?: string): Promise<void>;
    getPendingVerifications(): Promise<any[]>;
    getDetailedVerificationStatus(partnerId: string): Promise<{
        isVerified: boolean;
        overallStatus: string;
        sections: {
            personalInformation: {
                status: string;
                isApproved: boolean;
            }
            personalDocuments: {
                status: string;
                isApproved: boolean;
                documents: {
                    aadhar: {
                        status: string;
                        isApproved: boolean;
                        hasFile: boolean;
                        frontUrl?: string; 
                        backUrl?: string;
                    };
                    pan: {
                        status: string;
                        isApproved: boolean;
                        hasFile: boolean;
                        frontUrl?: string; 
                        backUrl?: string;
                    };
                    license: {
                        status: string;
                        isApproved: boolean;
                        hasFile: boolean;
                        frontUrl?: string; 
                        backUrl?: string;
                    };
                }
            };
            vehicalDocuments: {
                status: string;
                isApproved: boolean;
                documents: {
                    insurance: {
                        status: string;
                        isApproved: boolean;
                        hasFile: boolean;
                        url?: string;
                    };
                    pollution: {
                        status: string;
                        isApproved: boolean;
                        hasFile: boolean;
                        url?: string;
                    };
                };
            };
            bankingDetails: {
                status: string;
                isApproved: boolean;
            };
        };
    }>;
    
}