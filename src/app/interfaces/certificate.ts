export interface CertificateDetail {
    auditSeqNo: number,
    companyId: number,
    seqNo: number,
    certificateId: number,
    endorsementId: number,
    auditTypeId: number,
    auditSubTypeId: number,
    auditDate: Date,
    auditPlace: string,
    certificateNo: string,
    auditReportNo: string,
    utn: string,
    certificateIssueId: number,
    qrCode_url: string,
    certificateVersion: string,
    certIssuedDate: Date,
    certExpiryDate: Date,
    extendedIssueDate: Date,
    extendedExpiryDate: Date,
    endorsedDate: Date,
    publishStatus: number,
    activeStatus: number,
    notes: string,
    leadName: string,
    issuerId: string,
    issuerName: string,
    issuerSign: Blob,
    issuerSingDate: Date,
    nameToPrint: number,
    signToPrint: number,
    verifyDone: number,
    vesselId: number,
    vesselImoNo: string,
    vesselName: string,
    grt: string,
    vesselType: string,
    officialNo: number,
    portOfRegistry: string,
    dateOfRegistry: Date,
    companyImoNo: string,
    vesselCompanyName: string,
    vesselCompanyAddress: string,
    vesselUk: string,
    vesselPk: string,
    classSociety: string,
    callSign: string,
    docTypeNumber: string,
    docType: string,
    docIssuer: string,
    docExpiry: Date,
    userIns: string,
    dateIns: Date,
    title: string,
    seal: string,
    certificateLinkSeq: number,
    consectiveSubSequent: number,
    qid: string,
    completionDate: string,
    dmlcIssueDate: string,
    dmlcIssuePlace: string
}