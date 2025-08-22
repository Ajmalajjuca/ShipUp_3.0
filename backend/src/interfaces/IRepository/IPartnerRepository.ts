import { PartnerDocumentType } from "../../types";
import { IPartner } from "../IModel/IPartner";

export interface IPartnerRepository {
  create(partnerData: Partial<IPartner>): Promise<IPartner>;
  findByEmail(email: string): Promise<IPartner | null>;
  findByEmailOrMobile(email: string, phone: string): Promise<IPartner | null>;
  findByPartnerId(partnerId: string): Promise<IPartner | null>;
  updateLastLogin(partnerId: string): Promise<IPartner | null>;
  findById(id: string): Promise<IPartner | null>;
  update(id: string, data: Partial<IPartner>): Promise<IPartner | null>;
  addDocument(partnerId: string, document: any): Promise<IPartner | null>;
  updateDocumentStatus(partnerId: string, documentType: string, status: string, rejectionReason?: string): Promise<IPartner | null>;
  updateVerificationStatus(partnerId: string, isVerified: boolean): Promise<IPartner | null>;
  searchPartners(searchTerm: string, pagination: any): Promise<any>;
  findVerifiedPartners(pagination?: any): Promise<any>;
  findByStatus(status: string, pagination: any): Promise<any>;
  findActivePartners(pagination: any): Promise<any>;
  findByMobileNumber(phone: string): Promise<IPartner | null>;
  getDocumentsByPartnerId(partnerId: string): Promise<IPartner | null>;
}