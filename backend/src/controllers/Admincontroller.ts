// // Admin controller methods for document verification

// // Get partner verification status
// getPartnerVerificationStatus = asyncHandler(async (req: Request, res: Response) => {
//   const { partnerId } = req.params;
  
//   const verificationData = await this.partnerService.getDetailedVerificationStatus(partnerId);
  
//   sendSuccess(res, 'Verification status retrieved successfully', verificationData);
// });

// // Admin approve a specific document
// approveDocument = asyncHandler(async (req: Request, res: Response) => {
//   const { partnerId } = req.params;
//   const { documentType } = req.body;
  
//   await this.partnerService.updateDocumentStatus(partnerId, documentType, 'approved');
  
//   const updatedStatus = await this.partnerService.getVerificationStatus(partnerId);
  
//   sendSuccess(res, `${documentType} document approved successfully`, updatedStatus);
// });

// // Admin reject a specific document
// rejectDocument = asyncHandler(async (req: Request, res: Response) => {
//   const { partnerId } = req.params;
//   const { documentType, rejectionReason } = req.body;
  
//   if (!rejectionReason) {
//     throw createError('Rejection reason is required', 400);
//   }
  
//   await this.partnerService.updateDocumentStatus(partnerId, documentType, 'rejected', rejectionReason);
  
//   const updatedStatus = await this.partnerService.getVerificationStatus(partnerId);
  
//   sendSuccess(res, `${documentType} document rejected`, updatedStatus);
// });

// // Get all partners with pending document verification
// getPendingVerifications = asyncHandler(async (req: Request, res: Response) => {
//   const pendingPartners = await this.partnerService.getPendingVerifications();
  
//   sendSuccess(res, 'Pending verifications retrieved successfully', {
//     total: pendingPartners.length,
//     partners: pendingPartners
//   });
// });

// // Admin dashboard - verification statistics
// getVerificationStats = asyncHandler(async (req: Request, res: Response) => {
//   const stats = await this.partnerService.getVerificationStatistics();
  
//   sendSuccess(res, 'Verification statistics retrieved successfully', stats);
// });