export class finding {
  constructor(
    public currSeqNo: number,
    public origSeqNo: number,
    public findingsNo: string,
    public auditDate: string,
    public auditCode: string,
    public serialNo: string
  ) {}
}

export interface FindingDetail {
  updateDescription: string;
  auditPlace: string;
  nextActionDesc: string;
  currSeqNo: number;
  ORIG_SEQ_NO: number;
  findingsNo: string;
  findingSeqNo: string;
  categoryId: number;
  statusId: number;
  statusDate: string;
  nextActionId: string;
  dueDate: string;
  description: string;
  userIns: string;
  dateIns: string;
  updateFlag?: any;      // added by archana for jira-id-MOBILE-704
  checkboxUpdate?: any;   // added by archana for jira-id-MOBILE-704
  findingRptAttachs: Array<any>;
  statusDesc?: string;
}

export interface FindingDataDescriptions {
  pageTitle: string;
  auditType: string;
  majorCountDesc: string;
  minorCountDesc: string;
  obsCountDesc: string;
  auditauditType: string;
  auditTypeDesc: string;
}

export interface FindingAttachment {}

export class findingDetails {
  constructor(
    public currSeqNo: number,
    public ORIG_SEQ_NO: number,
    public findingsNo: string,
    public findingSeqNo: string,
    public categoryId: number,
    public statusId: number,
    public statusDate: string,
    public nextActionId: number,
    public dueDate: string,
    public description: string
  ) {}
}

export class findingAttachments {
  constructor(
    public currSeqNo: number,
    public origSeqNo: number,
    public findingsNo: string,
    public findingSeqNo: string,
    public fileSeqNo: number,
    public fileName: number,
    public flag: number
  ) {}
}

export let CurrentFinding = {
  finding: [],
  findingDetails: [],
  findingAttachments: [],
};
export let findingao = [];
export let findingDetailsao = [];
export let findingAttachmentsao = [];

export let PrevAuditDetail = {
  auditDate: '',
  certIssueDate: '',
  certExpiryDate: '',
  auditSubTypeId: '',
  prevAuditReportNo: '',
  prevCertificateNo: '',
  prevCertificateIssuedId: '',
};
