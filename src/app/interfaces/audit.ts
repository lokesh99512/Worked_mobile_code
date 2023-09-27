export interface MaAuditCode {
    auditTypeId: number,
    auditCode: string,
    auditElements: string,
    companyId: number,
    activeStatus: boolean,
    userIns: string,
    dateIns: Date
}

export interface AuditDatails {
    auditSeqNo: string,
    companyId: number
    vesselImoNo: string,
    certificateNo: number,
    auditTypeId: number,
    auditSubTypeId: number,
    companyImoNo: string,
    companyDoc: string,
    certExpiryDate: Date,
    certIssueDate: Date,
    narrativeSummary: Blob,
    auditReportNo: string,
    auditDate: Date,
    auditPlace: string,
    auditStatusId: number,
    certificateIssuedId: number,
    internalAuidtDate: Date,
    openMeetingDate: Date,
    closeMeetingDate: Date,
    auditSummaryId: number,
    lockStatus: boolean,
    lockHolder: string,
    userIns: string,
    dateIns: Date,
    scope: number,
    maxStatusDateCAR: Date,
    endorseExpiryDate: Date,
    docFlag: number,
    allowNext: number,
    docTypeNumber: string,
    grt: number,
    dateOfRegistry: Date,
    seal: Blob,
    title: string,
    signature: Blob,
    qid: string,
    vesselNameAud:string,
	vesselTypeAud:string,
	docExpiryAud:Date,
	docIssuerAud:string,
	companyAddressAud:string,
	officialNoAud:string,
	docTypeNoAud:string,
	certificateVer:string,
}