import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertController,
  ModalController,
  Platform,
  NavController,
} from '@ionic/angular';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AppConstant } from 'src/app/constants/app.constants';
import { FindingDetail } from 'src/app/interfaces/finding';
import { DatabaseService } from 'src/app/providers/database.service';
import { ToastService } from 'src/app/providers/toast.service';
import { threadId } from 'worker_threads';
import { BreakpointObserver } from '@angular/cdk/layout';
import { FileManagerService } from 'src/app/providers/file-manager.service';
import { FindingService } from 'src/app/providers/finding.service';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';

@Component({
  selector: 'app-previous-finding-details',
  templateUrl: './previous-finding-details.page.html',
  styleUrls: ['./previous-finding-details.page.scss'],
})
export class PreviousFindingDetailsPage implements OnInit {
   /**added by archana for Jira ID-MOBILE-715 start */
  mimeType: { type: string; value: string }[] = [
    { type: 'pdf', value: 'application/pdf' },
    { type: 'jpeg', value: 'image/jpeg' },
    { type: 'txt', value: 'text/plain' },
    { type: 'png', value: 'image/png' },
  ];
   /**added by archana for Jira ID-MOBILE-715 end */
  dataFromPrevFindingListScreen: { [k: string]: any };
  findingInfo: any;
  categoryId: any;
  findingNo: any;
  auditTypeId: any;
  dataFromAuditDetailPage: any;
  auditSeqNo: any;
  presentSeqNo: any;
  auditDate: any;
  portArr: any;
  auditReportNo: any;
  closeMeetingDate: Date;
  openMeetingDate: Date;
  companyId: any;
  userIns: any;
  dateIns: any;
  vesselImoNo: any;
  companyImoNo: any;
  docTypeNo: any;
  categoryDesc: any;
  auditTypeDesc: any;

  checkboxData:any ; // added by lokesh for jira_id(635)
  verifyAndCloseauditPlace:any;// added by lokesh for jira_id(634)
  planeAcceptplace:any; // added by lokesh for jira_id(634)

  orgSeqNo: any;

  isStatusOpened: boolean = false;
  openStatusBlock: FindingDetail;
  nxtActionDisableArrayOfOpenStatus: any;
  disableWholeOpenStatusBlock: boolean = false;

  isStatusDowngraded: boolean = false;
  downgradedStatusBlock: FindingDetail;
  nxtActionDisableArrayOfDowngradeStatus: any;
  disableWholeDownGradeStatusBlock: boolean = false;

  isStatusPlanAccepted: boolean = false;
  planAcceptedStausBlock: FindingDetail;
  nxtActionDisableArrayOfPlanAcceptedStatus: any;
  disableWholePlanAcceptedStatusBlock: boolean = false;

  isStatusVerifiedAndClosed: boolean = false;
  verifiedAndClosedStausBlock: FindingDetail;
  nxtActionDisableArrayOfVerifyCloseStatus: any;
  disableWholeVerifyCloseStatusBlock: boolean = false;

  isStatusNil: boolean = false;

  minStatusDate;
  maxStatusDate;
  minDueDate;

  openStatusMaxDueDate;
  downgradStatusMaxDueDate;
  planAcceptedStatusMaxDueDate;
  verifyCloseStatusMaxDueDate;

  planAcceptedBlockMinStatusDate;

  isOpenStatusStatusDateDisabled: boolean;
  isOpenStatusDueDateDisabled: boolean;
  isOpenStatusDescriptionDisabled: boolean;

  isDowngradedStatusStatusDateDisabled: boolean;
  isDowngradedStatusDueDateDisabled: boolean;
  isDowngradedStatusDescriptionDisabled: boolean;

  isPlanAcceptedStatusStatusDateDisabled: boolean;
  isPlanAcceptedStatusDueDateDisabled: boolean;
  isPlanAcceptedStatusDescriptionDisabled: boolean;
  isNewFinding: boolean;
  backButtonSubscription: any;

  openStatusPlaceHolder: string = '';
  downgradeStatusPlaceHolder: string = '';
  planAcceptedPlaceholder: string = '';
  verifiedClosedStatusPlaceHolder: string = '';
  restoreCompliancedPlaceHolder: string = '';    //added by archana for jira ID-MOBILE-762

  saveInFileSystemFiles = [];
  deleteInFileSystemFiles = [];

  findingDetails;
  masterData: Object;
  findingStatusList: any;
  findingStatusObjs: any;
  portList: any = [];
  portsStringArray: any = [];

  downGradeAuditPlace = new FormControl();
  complianceRestoredAuditPlace = new FormControl();
  planacceptAuditPlace = new FormControl();
  verifyCloseAuditPlace = new FormControl();

  downGradeFilteredOptions: Observable<string[]>;
  complianceRestoredFilterOptions: Observable<string[]>;
  planacceptFilteredOptions: Observable<string[]>;
  verifyCloseFilteredOptions: Observable<string[]>;
  dirName: any;
  isIOS: boolean;
  auditData: any;
  prevVesselImoNumber: any;
  /**added by archana for jira-id-704,720 start */
  pfList: any;
  enableCheck: boolean;
  checkBoxChecked: any;
  prevFindList: any;
  disableFindingDetailsBasedonCheckBox: boolean = false;
  /**added by archana for jira-id-704,720 end */
  priviousdata:any=[]; /*added by lokesh for jira_id(63)*/
  auditSubtype:any; /*added by lokesh for jira_id(63)*/
  nextActionsplace:any='    ';//added by lokesh for jira_id(758)
  isStatusRestoreComplianced: boolean = false;
  RestoreCompliancedStausBlock: FindingDetail;
  disableWholeRestoreCompliancedStausBlock: boolean = false;
  auditSubTypeID: any;
  constructor(
    private findingService: FindingService,
    private breakpointObserver: BreakpointObserver,
    public appConstant: AppConstant,
    private db: DatabaseService,
    public fileManager: FileManagerService,
    private router: Router,
    public alertController: AlertController,
    private modalCtrl: ModalController,
    public toast: ToastService,
    private platform: Platform,
    private navController: NavController,
    private filesys: File,
    private fileOpener: FileOpener,          //added by archana for Jira ID-MOBILE-715 
  ) {

    if (
      this.platform.is('ipad') ||
      this.platform.is('ios') ||
      this.platform.is('iphone')
    ) {
      this.dirName = this.filesys.documentsDirectory;
      this.isIOS = true;
    } else {
      this.dirName = this.filesys.externalDataDirectory;
      console.log(this.dirName);
      
      this.isIOS = false;
    }
    this.dataFromPrevFindingListScreen =
      this.router.getCurrentNavigation().extras.state;
    console.log(this.dataFromPrevFindingListScreen);
    this.presentSeqNo = this.dataFromPrevFindingListScreen.auditSeqNo;
    this.findingInfo = this.dataFromPrevFindingListScreen.findingInfo;
    console.log(this.findingInfo);
    this.findingDetails = this.findingInfo.findingDetail;
    this.auditTypeDesc = this.dataFromPrevFindingListScreen.auditTypeDesc;
    this.minStatusDate = this.dataFromPrevFindingListScreen.openMeetingDate;
    this.maxStatusDate = this.dataFromPrevFindingListScreen.closeMeetingDate;
    this.minDueDate = this.findingService.addDays(
      this.dataFromPrevFindingListScreen.closeMeetingDate,
      0                                                 // changed by archana for Jira Id-Mobile-820
    );
    this.categoryId = this.dataFromPrevFindingListScreen.findingCategoryId;
    this.auditSubTypeID = this.dataFromPrevFindingListScreen.auditData.auditSubTypeID;
      /*added by lokesh for jira_id(63)*/
      this.db.getPreviousAuditdatails(this.dataFromPrevFindingListScreen.auditData.vesselImoNo)
      .then(data=>{
        console.log(data);
        this.priviousdata=data;
        /**added by archana for jira ID-Mobile-810 start*/
        this.priviousdata.forEach((res)=>{
             if(res.auditSeqNo == this.findingInfo.orgSeqNo){
              this.priviousdata = res;
             }
        });
        /**added by archana for jira ID-Mobile-810 end*/
        if(this.priviousdata.auditSubTypeID==1001){
       this.auditSubtype="INTERIM"
        }else if(this.priviousdata.auditSubTypeID==1002){
          this.auditSubtype="INITIAL"
        }else if(this.priviousdata.auditSubTypeID==1003){
          this.auditSubtype="INTERMEDIATE"
        }else if(this.priviousdata.auditSubTypeID==1004){
          this.auditSubtype="RENEWAL"
        }else if(this.priviousdata.auditSubTypeID==1005){
          this.auditSubtype="INTERIM"
        }
      })
      /*added by lokesh for jira_id(63)*/
    //this.categoryId = this.findingInfo.findingDtl.length > 0 ? this.categoryId = this.findingInfo.findingDtl[0].categoryId : '';

    // this.auditType = this.dataFromAuditDetailPage.auditTypeId;
    // this.auditSeqNo = this.dataFromPrevFindingListScreen.auditSeqNo;
    this.auditSeqNo = this.dataFromPrevFindingListScreen.findingInfo.orgSeqNo;
    this.orgSeqNo = this.dataFromPrevFindingListScreen.findingInfo.orgSeqNo;
    this.portList = this.dataFromPrevFindingListScreen.port;
    this.auditData=this.dataFromPrevFindingListScreen.auditData;  //added for jira id - MOBILE-658
    this.portList.forEach((data) => {
      let portPlace = data.portName ? data.portName : '';
      portPlace = portPlace
        ? data.countryName
          ? portPlace + ', ' + data.countryName
          : portPlace
        : data.countryName
          ? data.countryName
          : '';
      this.portsStringArray.push(portPlace);
    });
   /**added by archana for jira-id-704 start */
    // let req={
    //   vesselImoNo: this.dataFromPrevFindingListScreen.vesselImoNo,
    //   companyImoNo: this.dataFromPrevFindingListScreen.companyImoNo,
    //   docTypeNo:this.dataFromPrevFindingListScreen.docTypeNo,
    //   auditDate:this.dataFromPrevFindingListScreen.auditDate,
    //   auditTypeId: this.dataFromPrevFindingListScreen.auditTypeId,
    //   }
    // this.db.getPrevFindingDetails(req).then((pfData: any) => {
    //    this.prevFindList = pfData.finding;
    //    this.prevFindList.forEach((element)=>{
    //     element.findingDetail.forEach((data)=>{
    //      if(data.checkboxUpdate == 1){
    //       // this.disableFindingDetailsBasedonCheckBox = true;
    //      } 
    //      });
    //      });
    //   });
      /**added by archana for jira-id-704 end */
  }

  getValueFromMIME(key: string): string {
    console.log(key);
    for (let index = 0; index < this.mimeType.length; index++) {
      if (key == this.mimeType[index].type) {
        return this.mimeType[index].value;
      }
    }
    return 'unsupported';
  }

  ngOnInit() {
    /**added by archana 01-07-2022 for jira id-MOBILE-440 start */
    this.db
      .getFindingsCategory(this.findingInfo.findingDetail[0].auditTypeId, this.findingInfo.findingDetail[0].categoryId)
      .then((findingCategory: any) => {
        console.log(findingCategory);
        this.categoryDesc = findingCategory;
      });
    /**added by archana 01-07-2022 for jira id-MOBILE-440 end*/       ////commented for jira id - MOBILE-658
    // this.db.getAuditdata(this.auditSeqNo).then((auditData) => {
    //   console.log('auditData', auditData);
      this.auditTypeId = this.auditData.auditTypeId;
      this.openMeetingDate = this.auditData.openMeetingDate;
      this.closeMeetingDate = this.auditData.closeMeetingDate;
      this.userIns = this.auditData.userIns;
      this.dateIns = this.auditData.dateOfIns;
      this.auditReportNo = this.auditData.auditReportNo;
      this.companyId = this.auditData.companyId;
      this.auditDate = this.auditData.auditDate;
      this.prevVesselImoNumber = this.auditData.vesselImoNo;
      this.db
        .getVesselCompanyData(this.prevVesselImoNumber)
        .then((vesselData: any) => {
          console.log('vesselData', vesselData);
          this.vesselImoNo = vesselData[0].vesselImoNo;
          this.companyImoNo = vesselData[0].companyImoNo;
          this.docTypeNo = vesselData[0].docTypeNo;

          //code

          this.findingNo = this.findingDetails[0].findingsNo;
          this.categoryId = this.findingInfo.findingDetail[0].categoryId;

          if (
            this.auditTypeId == this.appConstant.ISM_TYPE_ID ||
            this.auditTypeId == this.appConstant.ISPS_TYPE_ID ||
            this.auditTypeId == this.appConstant.MLC_TYPE_ID
          ) {
            if (
              this.findingDetails[0] &&
              this.categoryId == this.appConstant.MAJOR_FINDING_CATEGORY
            ) {
              //Major Category
              console.log('ISM/ISPS/MLC type major category Finding');

              if (
                this.findingDetails[0] &&
                this.findingDetails[0].statusId == 1001
              ) {
                //open_status
                this.isStatusOpened = true;
                this.openStatusBlock = this.findingDetails[0];
                if (this.openStatusBlock.nextActionId) {
                  this.isStatusDowngraded = true;
                  //set due date
                  if (
                    this.openStatusBlock.dueDate == 'CURRENT AUDIT' ||
                    this.openStatusBlock.dueDate == 'DURING CURRENT AUDIT.' ||
                    this.openStatusBlock.dueDate == 'DURING CURRENT AUDIT' ||
                    this.openStatusBlock.dueDate == 'CURRENT INSPECTION'||
                    this.openStatusBlock.dueDate == 'CURRENT INSPECTION.'   //added by lokesh for jira_id(632)
                  ) {
                    this.openStatusPlaceHolder = this.openStatusBlock.dueDate;
                  } else {
                    this.openStatusBlock.dueDate = moment(
                      this.openStatusBlock.dueDate
                    ).format('YYYY-MM-DD');
                  }
                  // this.openStatusBlock.dueDate == 'CURRENT AUDIT' ? this.openStatusPlaceHolder = this.openStatusBlock.dueDate : '';
                  this.downgradedStatusBlock = {
                    ORIG_SEQ_NO: this.auditSeqNo,
                    currSeqNo: Number(this.auditSeqNo),
                    categoryId: this.categoryId,
                    statusDate: '',
                    dueDate: '',
                    description: '',
                    findingSeqNo: '2',
                    findingsNo: this.findingNo.toString(),
                    statusId: Number(this.appConstant.DOWNGRADED),
                    nextActionDesc: '',
                    nextActionId: '',
                    updateDescription: '',
                    auditPlace: '',
                    userIns: '',
                    dateIns: '',
                    updateFlag: 1,
                    checkboxUpdate: 0,
                    findingRptAttachs: [],
                  };
                  console.log('this.openStatusBlock =>', this.openStatusBlock);
                }
              }
              if (
                this.findingDetails[1] &&
                this.findingDetails[1].statusId == 1003
              ) {
                //added by lokesh for mobile jira_id(632) START HERE
                // if (
                //   this.dataFromPrevFindingListScreen.findilist == 'DURING CURRENT AUDIT' ||
                //   this.dataFromPrevFindingListScreen.findilist == 'DURING CURRENT AUDIT.' ||
                //   this.dataFromPrevFindingListScreen.findilist == 'DURING CURRENT INSPECTION' ||
                //   this.dataFromPrevFindingListScreen.findilist == 'DURING CURRENT INSPECTION.'||
                //   this.dataFromPrevFindingListScreen.findilist=='Invalid date' ||
                //   this.dataFromPrevFindingListScreen.findilist=='INTERMEDIATE INSPECTION'                                               
                // ) {
                //   this.downgradeStatusPlaceHolder = this.dataFromPrevFindingListScreen.findilist=='Invalid date'? 'DURING CURRENT INSPECTION.':this.dataFromPrevFindingListScreen.findilist;
                // }//added by lokesh for mobile jira_id(632) END HERE
                //downgrade_status
                this.isStatusDowngraded = true;
                this.downgradedStatusBlock = this.findingDetails[1];
                console.log(this.downgradedStatusBlock);
                if(this.downgradedStatusBlock.dueDate != ''){
                  this.downgradeStatusPlaceHolder = this.downgradedStatusBlock.dueDate;
                }
                // this.downgradedStatusBlock.dueDate = moment(
                //   this.downgradedStatusBlock.dueDate
                // ).format('YYYY-MM-DD');

                if (this.downgradedStatusBlock.statusDate) {
                  this.disableWholeOpenStatusBlock = true;
                }
                if (this.downgradedStatusBlock.nextActionId) {
                  this.isStatusPlanAccepted = true;
                  this.planAcceptedStausBlock = {
                    ORIG_SEQ_NO: this.orgSeqNo,
                    currSeqNo: Number(this.auditSeqNo),
                    categoryId: this.categoryId,
                    statusDate: '',
                    dueDate: '',
                    description: '',
                    findingSeqNo: '3',
                    findingsNo: this.findingNo.toString(),
                    statusId: Number(this.appConstant.PLAN_ACCEPTED),
                    nextActionDesc: '',
                    nextActionId: '',
                    updateDescription: '',
                    auditPlace: '',
                    userIns: '',
                    dateIns: '',
                    updateFlag: 1,
                    checkboxUpdate: 0,
                    findingRptAttachs: [],
                  };
                  console.log(
                    'this.downgradedStatusBlock =>',
                    this.downgradedStatusBlock
                  );
                }
              }
              if (
                this.findingDetails[2] &&
                this.findingDetails[2].statusId == 1006
              ) {
                //plan_accept_status
                this.isStatusPlanAccepted = true;
                this.planAcceptedStausBlock = this.findingDetails[2];
                this.planAcceptedStausBlock.dueDate = moment(
                  this.planAcceptedStausBlock.dueDate
                ).format('YYYY-MM-DD');
                if (this.planAcceptedStausBlock.statusDate) {
                  this.disableWholeDownGradeStatusBlock = true;
                }
                if (this.planAcceptedStausBlock.nextActionId) {
                  this.isStatusVerifiedAndClosed = true;
                  this.verifiedAndClosedStausBlock = {
                    ORIG_SEQ_NO: this.orgSeqNo,
                    currSeqNo: Number(this.presentSeqNo),
                    categoryId: this.categoryId,
                    statusDate: '',
                    dueDate: '',
                    description: '',
                    findingSeqNo: '4',
                    findingsNo: this.findingNo.toString(),
                    statusId: Number(this.appConstant.VERIFIED_CLOSED),
                    nextActionDesc: '',
                    nextActionId: '',
                    updateDescription: '',
                    auditPlace: '',
                    userIns: '',
                    dateIns: '',
                    updateFlag: 1,
                    checkboxUpdate: 0,
                    findingRptAttachs: [],
                  };
                  console.log(
                    'this.planAcceptedStausBlock =>',
                    this.planAcceptedStausBlock
                  );
                }
              }
                // added by lokesh for  jira_id(630) START HERE
                if(this.verifyAndCloseauditPlace!=''){
                  this.planeAcceptplace=this.findingDetails[2]?this.findingDetails[2].auditPlace:''
                  this.verifyAndCloseauditPlace=this.findingDetails[3]?this.findingDetails[3].auditPlace:''
                  }
                  // added by lokesh for  jira_id(630) END HERE
              if (
                this.findingDetails[3] &&
                this.findingDetails[3].statusId == 1008
              ) {
                //verify_close_status
                this.isStatusVerifiedAndClosed = true;
                this.verifiedAndClosedStausBlock = this.findingDetails[3];

                if (this.verifiedAndClosedStausBlock.statusDate) {
                  this.disableWholePlanAcceptedStatusBlock = true;
                }
                if (this.verifiedAndClosedStausBlock.nextActionId) {
                  if (this.verifiedAndClosedStausBlock.dueDate == 'N.A.') {
                    this.verifiedClosedStatusPlaceHolder =
                      this.verifiedAndClosedStausBlock.dueDate;
                  } else {
                    this.verifiedAndClosedStausBlock.dueDate = moment(
                      this.verifiedAndClosedStausBlock.dueDate
                    ).format('YYYY-MM-DD');
                  }
                  // this.disableWholeVerifyCloseStatusBlock = true;
                }
              }
            } else if (
              this.findingDetails[0] &&
              this.categoryId == this.appConstant.MINOR_FINDING_CATEGORY
            ) {
              console.log('ISM/ISPS/MLC type minor category Finding');
              /** added by archana for jira ID-MOBILE-761 start  */ 
              if(this.auditTypeId != this.appConstant.ISPS_TYPE_ID || (this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
                (this.findingDetails[1] ? this.findingDetails[1].statusId != 1005 : true))){
                   /** added by archana for jira ID-MOBILE-761 end  */ 
              if (
                this.findingDetails[0] &&
                this.findingDetails[0].statusId == 1001
              ) {
                //open_status
                this.isStatusOpened = true;
                this.openStatusBlock = this.findingDetails[0];
                if (this.openStatusBlock.nextActionId) {
                  this.isStatusPlanAccepted = true;
                  this.planAcceptedStausBlock = {
                    ORIG_SEQ_NO: this.orgSeqNo,
                    currSeqNo: Number(this.auditSeqNo),
                    categoryId: this.categoryId,
                    statusDate: '',
                    dueDate: '',
                    description: '',
                    findingSeqNo: '2',
                    findingsNo: this.findingNo.toString(),
                    statusId: Number(this.appConstant.PLAN_ACCEPTED),
                    nextActionDesc: '',
                    nextActionId: '',
                    updateDescription: '',
                    auditPlace: '',
                    userIns: '',
                    dateIns: '',
                    updateFlag: 1,
                    checkboxUpdate: 0,
                    findingRptAttachs: [],
                  };

                  if(this.openStatusBlock.dueDate != ''){
                    this.openStatusPlaceHolder = this.openStatusBlock.dueDate;
                  }
                  // if (
                  //   this.openStatusBlock.dueDate == 'DURING CURRENT AUDIT' ||
                  //   this.openStatusBlock.dueDate == 'DURING CURRENT AUDIT.' ||
                  //   this.openStatusBlock.dueDate == 'DURING CURRENT INSPECTION'
                  // ) {
                  //   this.openStatusPlaceHolder = this.openStatusBlock.dueDate;
                  // } else {
                  //   this.openStatusBlock.dueDate = moment(
                  //     this.openStatusBlock.dueDate
                  //   ).format('YYYY-MM-DD');
                  // }
                  console.log('this.openStatusBlock =>', this.openStatusBlock);
                }
                console.log(this.findingDetails);
                
              }
              if (
                this.findingDetails[1] &&
                this.findingDetails[1].statusId == 1006 
              ) {
                console.log(this.findingDetails[1]);
                
                //plan_accept_status
                this.isStatusPlanAccepted = true;
                this.planAcceptedStausBlock = this.findingDetails[1];
                if (this.planAcceptedStausBlock.statusDate) {
                  this.disableWholeOpenStatusBlock = true;
                }
                if (this.planAcceptedStausBlock.nextActionId) {
                  this.isStatusVerifiedAndClosed = true;
                  this.verifiedAndClosedStausBlock = {
                    ORIG_SEQ_NO: this.orgSeqNo,
                    currSeqNo: Number(this.presentSeqNo),
                    categoryId: this.categoryId,
                    statusDate: '',
                    dueDate: '',
                    description: '',
                    findingSeqNo: '3',
                    findingsNo: this.findingNo.toString(),
                    statusId: Number(this.appConstant.VERIFIED_CLOSED),
                    nextActionDesc: '',
                    nextActionId: '',
                    updateDescription: '',
                    auditPlace: '',
                    userIns: '',
                    dateIns: '',
                    updateFlag: 1,
                    checkboxUpdate: 0,
                    findingRptAttachs: [],
                  };
                  if (/[A-Z]/.test(this.planAcceptedStausBlock.dueDate)                   //added by archana for jira ID-MOBILE-762
                  ) {
                    this.planAcceptedPlaceholder =
                      this.planAcceptedStausBlock.dueDate;
                  } else {
                    this.planAcceptedStausBlock.dueDate = moment(
                      this.planAcceptedStausBlock.dueDate
                    ).format('YYYY-MM-DD');
                  }
                  console.log(
                    'this.planAcceptedStausBlock =>',
                    this.planAcceptedStausBlock
                  );
                }
              }
              if (
                this.findingDetails[2] &&
                this.findingDetails[2].statusId == 1008
              ) {
                //verify_close_status
                this.isStatusVerifiedAndClosed = true;
                this.verifiedAndClosedStausBlock = this.findingDetails[2];
                if (this.verifiedAndClosedStausBlock.statusDate) {
                  this.disableWholePlanAcceptedStatusBlock = true;
                }
                if (this.verifiedAndClosedStausBlock.nextActionId) {
                  // this.disableWholeVerifyCloseStatusBlock = true;
                  if (this.verifiedAndClosedStausBlock.dueDate == 'N.A.') {
                    this.verifiedClosedStatusPlaceHolder =
                      this.verifiedAndClosedStausBlock.dueDate;
                  } else {
                    this.verifiedAndClosedStausBlock.dueDate = moment(
                      this.verifiedAndClosedStausBlock.dueDate
                    ).format('YYYY-MM-DD');
                  }
                }
              }
               /** added by archana for jira ID-MOBILE-761 start  */ 
            } else {
            if (
                this.findingDetails[0] &&
                this.findingDetails[0].statusId == 1001
              ) {
                //open_status
                this.isStatusOpened = true;
                this.openStatusBlock = this.findingDetails[0];
                if (this.openStatusBlock.nextActionId) {
                  this.isStatusRestoreComplianced = true;
                  this.RestoreCompliancedStausBlock = {
                    ORIG_SEQ_NO: this.orgSeqNo,
                    currSeqNo: Number(this.auditSeqNo),
                    categoryId: this.categoryId,
                    statusDate: '',
                    dueDate: '',
                    description: '',
                    findingSeqNo: '2',
                    findingsNo: this.findingNo.toString(),
                    statusId: Number(this.appConstant.COMPLAINCE_RESTORED),
                    nextActionDesc: '',
                    nextActionId: '',
                    updateDescription: '',
                    auditPlace: '',
                    userIns: '',
                    dateIns: '',
                    updateFlag: 1,
                    checkboxUpdate: 0,
                    findingRptAttachs: [],
                  };
                  if (
                    this.openStatusBlock.dueDate == 'DURING CURRENT AUDIT' ||
                    this.openStatusBlock.dueDate == 'DURING CURRENT AUDIT.' ||
                    this.openStatusBlock.dueDate == 'DURING CURRENT INSPECTION'
                  ) {
                    this.openStatusPlaceHolder = this.openStatusBlock.dueDate;
                  } else {
                    this.openStatusBlock.dueDate = moment(
                      this.openStatusBlock.dueDate
                    ).format('YYYY-MM-DD');
                  }
                  console.log('this.openStatusBlock =>', this.openStatusBlock);
                }
              }
              if (
                this.findingDetails[1] &&
                this.findingDetails[1].statusId == 1005
              ) {
                //plan_accept_status
                this.isStatusRestoreComplianced = true;
                this.RestoreCompliancedStausBlock = this.findingDetails[1];
                if (this.RestoreCompliancedStausBlock.statusDate) {
                  this.disableWholeOpenStatusBlock = true;
                }
                if (this.RestoreCompliancedStausBlock.nextActionId) {
                  this.isStatusPlanAccepted = true;
                  this.planAcceptedStausBlock = {
                    ORIG_SEQ_NO: this.orgSeqNo,
                    currSeqNo: Number(this.auditSeqNo),
                    categoryId: this.categoryId,
                    statusDate: '',
                    dueDate: '',
                    description: '',
                    findingSeqNo: '3',
                    findingsNo: this.findingNo.toString(),
                    statusId: Number(this.appConstant.PLAN_ACCEPTED),
                    nextActionDesc: '',
                    nextActionId: '',
                    updateDescription: '',
                    auditPlace: '',
                    userIns: '',
                    dateIns: '',
                    updateFlag: 1,
                    checkboxUpdate: 0,
                    findingRptAttachs: [],
                  };
                    if(/[A-Z]/.test(this.RestoreCompliancedStausBlock.dueDate)){                 //added by archana for jira ID-MOBILE-762
                      this.restoreCompliancedPlaceHolder = this.RestoreCompliancedStausBlock.dueDate;  //changed by archana for jira ID-MOBILE-762
                    } else{
                    this.RestoreCompliancedStausBlock.dueDate = moment(
                      this.RestoreCompliancedStausBlock.dueDate
                    ).format('YYYY-MM-DD');
                    }
                }
              }
              if (
                this.findingDetails[2] &&
                this.findingDetails[2].statusId == 1006
              ) {
                //plan_accept_status
                this.isStatusPlanAccepted = true;
                this.planAcceptedStausBlock = this.findingDetails[2];
                if (this.planAcceptedStausBlock.statusDate) {
                  this.disableWholeRestoreCompliancedStausBlock = true;
                }
                if (this.planAcceptedStausBlock.nextActionId) {
                  this.isStatusVerifiedAndClosed = true;
                  this.verifiedAndClosedStausBlock = {
                    ORIG_SEQ_NO: this.orgSeqNo,
                    currSeqNo: Number(this.presentSeqNo),
                    categoryId: this.categoryId,
                    statusDate: '',
                    dueDate: '',
                    description: '',
                    findingSeqNo: '4',
                    findingsNo: this.findingNo.toString(),
                    statusId: Number(this.appConstant.VERIFIED_CLOSED),
                    nextActionDesc: '',
                    nextActionId: '',
                    updateDescription: '',
                    auditPlace: '',
                    userIns: '',
                    dateIns: '',
                    updateFlag: 1,
                    checkboxUpdate: 0,
                    findingRptAttachs: [],
                  };
                  if (/[A-Z]/.test(this.planAcceptedStausBlock.dueDate)) {
                    this.planAcceptedPlaceholder =
                      this.planAcceptedStausBlock.dueDate;
                  } else {
                    this.planAcceptedStausBlock.dueDate = moment(
                      this.planAcceptedStausBlock.dueDate
                    ).format('YYYY-MM-DD');
                  }
              }
              }
              if (
                this.findingDetails[3] &&
                this.findingDetails[3].statusId == 1008
              ) {
                //verify_close_status
                this.isStatusVerifiedAndClosed = true;
                this.verifiedAndClosedStausBlock = this.findingDetails[3];
                if (this.verifiedAndClosedStausBlock.statusDate) {
                  this.disableWholePlanAcceptedStatusBlock = true;
                }
                if (this.verifiedAndClosedStausBlock.nextActionId) {
                  // this.disableWholeVerifyCloseStatusBlock = true;
                  if (this.verifiedAndClosedStausBlock.dueDate == 'N.A.') {
                    this.verifiedClosedStatusPlaceHolder =
                      this.verifiedAndClosedStausBlock.dueDate;
                  } else {
                    this.verifiedAndClosedStausBlock.dueDate = moment(
                      this.verifiedAndClosedStausBlock.dueDate
                    ).format('YYYY-MM-DD');
                  }
                }
              }
              console.log(this.openStatusBlock);
    
              console.log(this.RestoreCompliancedStausBlock);
             
            }
             /** added by archana for jira ID-MOBILE-761 end  */ 
            } else if (
              this.findingDetails[0] &&
              this.categoryId == this.appConstant.OBS_FINDING_CATEGORY
            ) {
              console.log('ISM/ISPS/MLC type OBS category Finding');
              if (
                this.findingDetails[0] &&
                this.findingDetails[0].statusId == 1001
              ) {
                //open_status
                this.isStatusOpened = true;
                this.openStatusBlock = this.findingDetails[0];
                if (this.openStatusBlock.dueDate == 'N.A.') {
                  this.openStatusPlaceHolder = this.openStatusBlock.dueDate;
                } else {
                  this.openStatusBlock.dueDate = moment(
                    this.openStatusBlock.dueDate
                  ).format('YYYY-MM-DD');
                }
              }
            }
          } else if (this.auditTypeId == this.appConstant.DMLC_TYPE_ID) {
            if (
              this.findingDetails[0] &&
              this.findingDetails[0].statusId == 1001
            ) {
              //open_status
              this.isStatusOpened = true;
              console.log('this.findingDetails[0]', this.findingDetails[0]);
              this.openStatusBlock = this.findingDetails[0];

              if (this.openStatusBlock.nextActionId) {
                this.isStatusVerifiedAndClosed = true;
                this.verifiedAndClosedStausBlock = {
                  ORIG_SEQ_NO: this.orgSeqNo,
                  currSeqNo: Number(this.presentSeqNo),
                  categoryId: this.categoryId,
                  statusDate: '',
                  dueDate: '',
                  description: '',
                  findingSeqNo: '2',
                  findingsNo: this.findingNo.toString(),
                  statusId: Number(this.appConstant.VERIFIED_CLOSED),
                  nextActionDesc: '',
                  nextActionId: '',
                  updateDescription: '',
                  auditPlace: '',
                  userIns: '',
                  dateIns: '',
                  updateFlag: 1,
                  checkboxUpdate: 0,
                  findingRptAttachs: [],
                };
                if (
                  this.openStatusBlock.dueDate ==
                  'DURING NEXT SCHEDULED INSPECTION.'
                ) {
                  this.openStatusPlaceHolder = this.openStatusBlock.dueDate;
                } else {
                  this.openStatusBlock.dueDate = moment(
                    this.openStatusBlock.dueDate
                  ).format('YYYY-MM-DD');
                }
                console.log('this.openStatusBlock =>', this.openStatusBlock);
              }
            }
            if (
              this.findingDetails[1] &&
              this.findingDetails[1].statusId == 1008
            ) {
              //verify_close_status
              this.isStatusVerifiedAndClosed = true;
              this.verifiedAndClosedStausBlock = this.findingDetails[1];
              if (this.verifiedAndClosedStausBlock.statusDate) {
                this.disableWholeOpenStatusBlock = true;
              }
              if (this.verifiedAndClosedStausBlock.nextActionId) {
                if (this.verifiedAndClosedStausBlock.dueDate == 'N.A.') {
                  this.verifiedClosedStatusPlaceHolder =
                    this.verifiedAndClosedStausBlock.dueDate;
                } else {
                  this.verifiedAndClosedStausBlock.dueDate = moment(
                    this.verifiedAndClosedStausBlock.dueDate
                  ).format('YYYY-MM-DD');
                }
                // this.disableWholeVerifyCloseStatusBlock = true;
              }
            }
          }
        });
      console.log(this.auditTypeId);
      this.db.getMaDatasForFindings(this.auditTypeId).then((masterData) => {
        console.log('masterData', masterData);
        this.masterData = masterData;
        this.findingStatusObjs = this.masterData[1];
        this.findingStatusList = this.findingStatusObjs.map(
          (res) => res.FINDINGS_STATUS_DESC
        );
        console.log(this.findingStatusList);
        this.setDisableNxtActionArrays();
        this.initializeFindingDetailBlocks();

        //this.auditCategoryList = auditCodes[2];
        // this.findingCategoryOptionsList = this.auditCategoryList.map(res => res.FINDINGS_CATEGORY_DESC);
      // });
    });
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log('isStatusOpened = ', this.isStatusOpened);
    console.log('isStatusDowngraded = ', this.isStatusDowngraded);
    console.log('isStatusPlanAccepted = ', this.isStatusPlanAccepted);
    console.log('isStatusVerifiedAndClosed = ', this.isStatusVerifiedAndClosed);
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');


    this.downGradeFilteredOptions = this.downGradeAuditPlace.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value.trim()))//added by lokeshh for jira_id(791)
    );
    /** added by archana for jira ID-MOBILE-761 start  */ 
    this.complianceRestoredFilterOptions = this.complianceRestoredAuditPlace.valueChanges.pipe(
      startWith(''),
      map((value)=>this._filter(value))
    );
    /** added by archana for jira ID-MOBILE-761 end  */ 
    this.planacceptFilteredOptions =
      this.planacceptAuditPlace.valueChanges.pipe(
        startWith(''),
        map((value) => this._filter(value.trim()))  //modified by lokesh for jira_id(791) 
      );

    this.verifyCloseFilteredOptions =
      this.verifyCloseAuditPlace.valueChanges.pipe(
        startWith(''),
        map((value) => this._filter(value.trim()))//modified by lokesh for jira_id(791) 
      );

    this.setMaxDueDates(this.closeMeetingDate);
  }

  initializeFindingDetailBlocks() {
    console.log(this.findingDetails);
    this.findingDetails.forEach((findingDetail, i) => {
      this.findingDetails[i].nextActionDesc =
        findingDetail.nextActionId != ''
          ? this.findingStatusObjs.filter(
            (res) => res.FINDINGS_STATUS_ID === findingDetail.nextActionId
          )[0].FINDINGS_STATUS_DESC
          : '';
    });
  }

 /*  added by lokesh for jira_id(587) START HERE*/
 nextActionEmpty(status){
  console.log(status);
  console.log(status=='planAccept');
  
   /**added by archana for jira ID-MOBILE-878 start */
   if(status=='open'&&  this.openStatusBlock.statusDate == 'Invalid date'){
    this.openStatusBlock.statusDate = '';
  }else if(status=='downgrade' && this.downgradedStatusBlock.statusDate == 'Invalid date'){
    this.downgradedStatusBlock.statusDate='';
  }else if(status=='restoreCompliance' && this.RestoreCompliancedStausBlock.statusDate == 'Invalid date'){
    this.RestoreCompliancedStausBlock.statusDate='';
  } else if(status=='planAccept'&& this.planAcceptedStausBlock.statusDate == 'Invalid date'){
    this.planAcceptedStausBlock.statusDate='';
  }else if(status=='verifyClose'&& this.verifiedAndClosedStausBlock.statusDate == 'Invalid date'){
    this.verifiedAndClosedStausBlock.statusDate='';
  }
  /**added by archana for jira ID-MOBILE-878 end */
  
  if(status=='open'){
  this.openStatusBlock.nextActionDesc ='';
  }else if(status=='downgrade'){
    this.downgradedStatusBlock.nextActionDesc='';
  }else if(status=='planAccept'){
    this.planAcceptedStausBlock.nextActionDesc='';
  }else if(status=='verifyClose'){
    this.verifiedAndClosedStausBlock.nextActionDesc=''
  }
}
/*added by lokesh for jira_id(587) END HERE*/
 setDisableNxtActionArrays() {
    if (
      this.auditTypeId == this.appConstant.ISM_TYPE_ID ||
      this.auditTypeId == this.appConstant.ISPS_TYPE_ID ||
      this.auditTypeId == this.appConstant.MLC_TYPE_ID
    ) {
      console.log(this.findingStatusList);

      switch (this.categoryId) {
        case this.appConstant.MAJOR_FINDING_CATEGORY:
          {
            this.nxtActionDisableArrayOfOpenStatus =
              this.findingStatusList.filter((res) => {
                if (this.auditTypeId === this.appConstant.ISM_TYPE_ID)
                  return res != 'DOWNGRADE' && res != 'PREVIOUS STATUS';
                else if (this.auditTypeId === this.appConstant.ISPS_TYPE_ID)
                  return (
                    res != 'DOWNGRADE (RESTORE COMPLIANCE)' &&
                    res != 'PREVIOUS STATUS'
                  );
                else if (this.auditTypeId === this.appConstant.MLC_TYPE_ID)
                  return (
                    res != 'DOWNGRADE (RECTIFY)' && res != 'PREVIOUS STATUS'
                  );
              });
            this.nxtActionDisableArrayOfDowngradeStatus =
              this.findingStatusList.filter((res) => {
                return res != 'PLAN ACCEPTED' && res != 'PREVIOUS STATUS';
              });
            this.nxtActionDisableArrayOfPlanAcceptedStatus =
              this.findingStatusList.filter((res) => {
                return res != 'VERIFY / CLOSE' && res != 'PREVIOUS STATUS';
              });
            this.nxtActionDisableArrayOfVerifyCloseStatus =
              this.findingStatusList.filter((res) => {
                return res != 'NIL' && res != 'PREVIOUS STATUS';
              });
          }
          break;

        case this.appConstant.MINOR_FINDING_CATEGORY:
          {
            this.nxtActionDisableArrayOfOpenStatus =
              this.findingStatusList.filter((res) => {
                return res != 'PLAN ACCEPTED' && res != 'PREVIOUS STATUS';
              });
            this.nxtActionDisableArrayOfPlanAcceptedStatus =
              this.findingStatusList.filter((res) => {
                return res != 'VERIFY / CLOSE' && res != 'PREVIOUS STATUS';
              });
            this.nxtActionDisableArrayOfVerifyCloseStatus =
              this.findingStatusList.filter((res) => {
                return res != 'NIL' && res != 'PREVIOUS STATUS';
              });
          }
          break;

        case this.appConstant.OBS_FINDING_CATEGORY:
          {
            this.nxtActionDisableArrayOfOpenStatus =
              this.findingStatusList.filter((res) => {
                return res != 'NIL';
              });
          }
          break;

        default:
          break;
      }
    } else if (this.auditTypeId == this.appConstant.DMLC_TYPE_ID) {
      this.nxtActionDisableArrayOfOpenStatus = this.findingStatusList.filter(
        (res) => {
          return res != 'VERIFY / CLOSE' && res != 'PREVIOUS STATUS';
        }
      );
      this.nxtActionDisableArrayOfVerifyCloseStatus =
        this.findingStatusList.filter((res) => {
          return res != 'NIL' && res != 'PREVIOUS STATUS';
        });
    }
  }

  NxtActionChange(event, currentBlock) {
    /**   added by archana for jira id MOBILE-704 start */
    let findingsCount = 0;
    let req={
      vesselImoNo: this.dataFromPrevFindingListScreen.vesselImoNo,
      companyImoNo: this.dataFromPrevFindingListScreen.companyImoNo,
      docTypeNo:this.dataFromPrevFindingListScreen.docTypeNo,
      auditDate:this.dataFromPrevFindingListScreen.auditDate,
      auditTypeId: this.dataFromPrevFindingListScreen.auditTypeId,
      }
      /**   added by archana for jira id MOBILE-704 end */
    if (
      this.auditTypeId == this.appConstant.ISM_TYPE_ID ||
      this.auditTypeId == this.appConstant.ISPS_TYPE_ID ||
      this.auditTypeId == this.appConstant.MLC_TYPE_ID
    ) {
      /**   added by archana for jira id MOBILE-704 start */
      this.db.getPrevFindingDetails(req).then((pfData: any) => {
        console.log('getPrevFindingDetails RES : ', pfData);
       pfData = pfData.finding.filter((res)=>{     // added by archana for jira Id-Mobile-794,Mobile-810
             return res.orgSeqNo == this.auditSeqNo;
        });                               
       this.pfList = pfData;
        if (this.pfList.length > 0) {
          let len = this.pfList.length-1;
         this.pfList = this.pfList.forEach((element) => {
            findingsCount= element.findingDetail[element.findingDetail.length-1].nextActionId == 1010?findingsCount+1:findingsCount;
            });
         if(len == findingsCount || findingsCount > len){
          console.log("check");
          this.enableCheck = true;
        }
       }
      })
      /**   added by archana for jira id MOBILE-704 end */
      if (this.categoryId == this.appConstant.MAJOR_FINDING_CATEGORY)
        this.nextActionChangeMajorCategory(event, currentBlock);
      else if (this.categoryId == this.appConstant.MINOR_FINDING_CATEGORY)
        this.nextActionChangeMinorCategory(event, currentBlock);
      else if (this.categoryId == this.appConstant.OBS_FINDING_CATEGORY)
        this.nextActionChangeObsCategory(event, currentBlock);
    } else if (this.auditTypeId == this.appConstant.DMLC_TYPE_ID) {
      this.nextActionChangeDMLCCategory(event, currentBlock);
    }
  }

  //ism/isps/mlc major typenext Action on change
  nextActionChangeMajorCategory(event, currentBlock) {
    console.log(
      'major finding selected value and current block => ',
      event.value,
      currentBlock
    );
    switch (currentBlock) {
      case 'open':
        console.log(event.value);
        if (
          event.value == 'DOWNGRADE' ||
          'DOWNGRADE (RESTORE COMPLIANCE' ||
          'DOWNGRADE (RECTIFY)'
        ) {
          this.downgradedStatusBlock = {
            ORIG_SEQ_NO: this.auditSeqNo,
            currSeqNo: this.auditSeqNo,
            categoryId: this.categoryId,
            statusDate: '',
            dueDate: '',
            description: '',
            findingSeqNo: '2',
            findingsNo: this.findingNo.toString(),
            statusId: Number(this.appConstant.DOWNGRADED),
            nextActionDesc: '',
            nextActionId: '',
            updateDescription: '',
            auditPlace: '',
            userIns: '',
            dateIns: '',
            updateFlag: 1,
            checkboxUpdate: 0,
            findingRptAttachs: [],
          };
          this.isStatusDowngraded = true;
          //this.openStatusBlock.dueDate = 'Current Audit';
          //this.openStatusBlock.statusId = Number(this.appConstant.OPEN);
          this.openStatusBlock.nextActionId = this.appConstant.DOWNGRADE;
          console.log(this.isStatusDowngraded);
          if (
            this.auditTypeId == this.appConstant.ISM_TYPE_ID &&
            this.openStatusBlock.dueDate === ''
          ) {
            this.openStatusPlaceHolder = 'CURRENT AUDIT';
          } else if (
            this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
            this.openStatusBlock.dueDate === ''
          ) {
            this.openStatusPlaceHolder = 'DURING CURRENT AUDIT';
          } else if (
            this.auditTypeId == this.appConstant.MLC_TYPE_ID &&
            this.openStatusBlock.dueDate === ''
          ) {
            this.openStatusPlaceHolder = 'CURRENT INSPECTION';
          }
        }
       // Previous_status 'findingRptAttachs = []' added by archana for jira-Id -MOBILE-879 
        if (event.value == 'PREVIOUS STATUS') {
          //clear fields
          this.isStatusDowngraded = false;
          this.openStatusBlock.statusDate = '';
          this.openStatusBlock.dueDate = '';
          this.openStatusBlock.nextActionId = '';
          this.openStatusBlock.nextActionDesc = ' ';
          this.openStatusBlock.description = '';
          this.openStatusPlaceHolder = '';
          this.openStatusBlock.findingRptAttachs = [];
        }
        break;
      case 'downgrade':
        console.log(event.value);
        if (event.value == 'PLAN ACCEPTED') {
          // this.downgradedStatusBlock.statusId = Number(this.appConstant.DOWNGRADED);
          this.downgradedStatusBlock.nextActionId =
            this.appConstant.PLAN_ACCEPTED;
          //disable previous block
          this.disableWholeOpenStatusBlock = true;
          this.isStatusPlanAccepted = true;
          this.planAcceptedStausBlock = {
            ORIG_SEQ_NO: this.auditSeqNo,
            currSeqNo: this.auditSeqNo,
            categoryId: this.categoryId,
            statusDate: '',
            dueDate: '',
            description: '',
            findingSeqNo: '3',
            findingsNo: this.findingNo.toString(),
            statusId: Number(this.appConstant.PLAN_ACCEPTED),
            nextActionDesc: '',
            nextActionId: '',
            updateDescription: '',
            auditPlace: '',
            userIns: '',
            dateIns: '',
            updateFlag: 1,
            checkboxUpdate: 0,
            findingRptAttachs: [],
          };
          this.planAcceptedBlockMinStatusDate =
            this.downgradedStatusBlock.statusDate;
        }
        if (event.value == 'PREVIOUS STATUS') {
          this.disableWholeOpenStatusBlock = false;
          this.isStatusPlanAccepted = false;
          this.planeAcceptplace='';// added by lokesh for jira_id(634)
          //clear fields
          this.downgradedStatusBlock.nextActionDesc = ' ';
          this.downgradedStatusBlock.dueDate = '';
          this.downgradedStatusBlock.nextActionId = '';
          this.downgradedStatusBlock.description = '';
          this.downgradedStatusBlock.statusDate = '';
          this.downgradedStatusBlock.findingRptAttachs = [];
          //enable previous block
          this.isOpenStatusStatusDateDisabled = false;
          this.isOpenStatusDueDateDisabled = false;
          this.isOpenStatusDescriptionDisabled = false;
        }
        break;
      case 'planAccept':
        console.log(event.value);
        if (event.value == 'VERIFY / CLOSE') {
                   /* added by lokesh for check box and binding data jira_id(635) STart */
          if(this.planacceptAuditPlace.value==null||this.planacceptAuditPlace.value==''){
            this.toast.presentToast('Please enter '+this.dataFromPrevFindingListScreen.auditTypeTitle+' place', 'danger');
            let nextActionsplace=' ';
          this.nextActionsplace =this.nextActionsplace+nextActionsplace;
            this.planAcceptedStausBlock.nextActionDesc =this.nextActionsplace;
          this.planAcceptedStausBlock.dueDate = ''; //modified by lokesh for jira_id(744)
          }else{
        this.planAcceptedStausBlock.updateDescription='Plan has been accepted as part of '+ this.dataFromPrevFindingListScreen.auditType+' '+ this.dataFromPrevFindingListScreen.auditTypeTitle +' at '+this.planacceptAuditPlace.value+' by '+ this.dataFromPrevFindingListScreen.auditorName.toUpperCase()+' on '+ moment(this.planAcceptedStausBlock.statusDate).format('DD-MMM-YYYY');
          }
          /**jira_id(635) end  */
          this.planAcceptedStausBlock.statusId = Number(
            this.appConstant.PLAN_ACCEPTED
          );
          this.planAcceptedStausBlock.nextActionId =
            this.appConstant.VERIFY_CLOSE;
          this.disableWholeDownGradeStatusBlock = true;
          this.isStatusVerifiedAndClosed = true;
          this.verifiedAndClosedStausBlock = {
            ORIG_SEQ_NO: this.auditSeqNo,
            currSeqNo: this.presentSeqNo,
            categoryId: this.categoryId,
            statusDate: '',
            dueDate: '',
            description: '',
            findingSeqNo: '4',
            findingsNo: this.findingNo.toString(),
            statusId: Number(this.appConstant.VERIFIED_CLOSED),
            nextActionDesc: '',
            nextActionId: '',
            updateDescription: '',
            auditPlace: '',
            userIns: '',
            dateIns: '',
            updateFlag: 1,
            checkboxUpdate: 0,
            findingRptAttachs: [],
          };
        }

        if (
         (this.auditTypeId == this.appConstant.ISM_TYPE_ID || 
          this.auditTypeId == this.appConstant.MLC_TYPE_ID ||
          this.auditTypeId == this.appConstant.ISPS_TYPE_ID) &&
          this.planAcceptedStausBlock.dueDate === '' 
        ) {
           this.planAcceptedPlaceholder = moment(this.findingService.addDays(
            this.dataFromPrevFindingListScreen.closeMeetingDate,
            90
          )).format('DD-MMM-YYYY');
        }
        if (event.value == 'PREVIOUS STATUS') {
          this.disableWholeDownGradeStatusBlock = false;
          this.isStatusVerifiedAndClosed = false;
          this.planeAcceptplace='';//added by lokesh for jira_id(698)
          this.planAcceptedStausBlock.updateDescription='';//added by lokesh for jira_id(698)
          this.planAcceptedStausBlock.nextActionDesc = ' ';
          this.planAcceptedStausBlock.statusDate = '';
          this.planAcceptedStausBlock.dueDate = '';
          this.planAcceptedStausBlock.nextActionId = '';
          this.planAcceptedStausBlock.description = '';
          this.planAcceptedStausBlock.auditPlace = '';
          this.planAcceptedPlaceholder = '';
          this.planAcceptedStausBlock.findingRptAttachs = [];

          //enable previous block
          this.isDowngradedStatusStatusDateDisabled = false;
          this.isDowngradedStatusDueDateDisabled = false;
          this.isDowngradedStatusDescriptionDisabled = false;
        }
        break;
      case 'verifyClose':
        console.log(event.value);
        if (event.value == 'NIL') {
          console.log(this.verifyCloseAuditPlace);
          if (
            this.verifiedAndClosedStausBlock.updateFlag == 1 &&
            this.verifyCloseAuditPlace.value == null ||this.verifyCloseAuditPlace.value=='' //added by lokesh for check box and binding data jira_id(635)
          ) {
            this.toast.presentToast('Please enter '+this.dataFromPrevFindingListScreen.auditTypeTitle+' place', 'danger');
            this.verifiedAndClosedStausBlock.dueDate = '';
            this.verifiedAndClosedStausBlock.nextActionId = '';
            let nextActionsplace=' ';
            this.nextActionsplace =this.nextActionsplace+nextActionsplace;
            this.verifiedAndClosedStausBlock.nextActionDesc =this.nextActionsplace; //added by lokesh for check box and binding data jira_id(635)//modified by lokesh for jira_id(744)
            this.verifiedClosedStatusPlaceHolder = '';
          } else {
            if (
              this.verifiedAndClosedStausBlock.updateFlag == 1 &&
              this.verifyCloseAuditPlace.value != null
            ) {
              /* added by lokesh for check box and binding data jira_id(635) STart */
            this.verifiedAndClosedStausBlock.updateDescription =
              'Verify/Close status has been updated as part of '+ this.dataFromPrevFindingListScreen.auditType+' '+ this.dataFromPrevFindingListScreen.auditTypeTitle +' at '+ this.verifyCloseAuditPlace.value + ' by ' + this.dataFromPrevFindingListScreen.auditorName.toUpperCase()+ ' on ' + moment(this.verifiedAndClosedStausBlock.statusDate).format('DD-MMM-YYYY');
            this.checkboxData = 'Complete '+ this.auditSubtype+' '+ this.dataFromPrevFindingListScreen.auditTypeTitle ;
             /* added by lokesh for check box and binding jira_id(635) data end*/
              }  
            
            this.verifiedAndClosedStausBlock.statusId = Number(
              this.appConstant.VERIFIED_CLOSED
            );
            this.verifiedAndClosedStausBlock.nextActionId =
              this.appConstant.NIL;
            console.log('verified and closed value is nil');
            this.isStatusNil = true;
            this.disableWholePlanAcceptedStatusBlock = true;
            this.verifiedAndClosedStausBlock.dueDate == ''
              ? (this.verifiedClosedStatusPlaceHolder = 'N.A.')
              : '';
          }
        } else if ('PREVIOUS STATUS') {
          console.log('Previous status of verify closed');
          this.disableWholePlanAcceptedStatusBlock = false;

          this.verifiedAndClosedStausBlock.statusDate = '';
          this.verifiedAndClosedStausBlock.dueDate = '';
          this.verifiedAndClosedStausBlock.nextActionId = '';
          this.verifiedAndClosedStausBlock.nextActionDesc = ' ';
          this.verifiedAndClosedStausBlock.description = '';
          this.verifiedClosedStatusPlaceHolder = '';
          this.verifiedAndClosedStausBlock.auditPlace = '';
          this.verifyAndCloseauditPlace='';// added by lokesh for jira_id(634)
          this.verifiedAndClosedStausBlock.updateDescription='';//added by lokesh for jira_id(698)
          this.verifiedAndClosedStausBlock.findingRptAttachs = [];
          //enable previous blocksS
          this.isPlanAcceptedStatusStatusDateDisabled = false;
          this.isPlanAcceptedStatusDueDateDisabled = false;//changed by lokesh for jira_id(732)
          this.isPlanAcceptedStatusDescriptionDisabled = false;
        }
        if(currentBlock == 'verifyClose' && this.planAcceptedStausBlock.dueDate == '' &&  this.planAcceptedPlaceholder == '' && event.value != 'PREVIOUS STATUS'){
          this.toast.presentToast('Please select Due Date for VERIFY / CLOSE', 'danger');
          this.disableWholePlanAcceptedStatusBlock = false;

          this.verifiedAndClosedStausBlock.statusDate = '';
          this.verifiedAndClosedStausBlock.dueDate = '';
          this.verifiedAndClosedStausBlock.nextActionId = '';
          this.verifiedAndClosedStausBlock.nextActionDesc = ' ';
          this.verifiedAndClosedStausBlock.description = '';
          this.verifiedClosedStatusPlaceHolder = '';
          this.verifiedAndClosedStausBlock.auditPlace = '';
          this.verifyAndCloseauditPlace='';
          this.verifiedAndClosedStausBlock.updateDescription='';
          //enable previous blocksS
          this.isPlanAcceptedStatusStatusDateDisabled = false;
          this.isPlanAcceptedStatusDueDateDisabled = false;
          this.isPlanAcceptedStatusDescriptionDisabled = false;
        
        }

        break;

      default:
        break;
    }
  }

  //ism/isps/mlc minor type next Action on change
  nextActionChangeMinorCategory(event, currentBlock) {
    if ((this.auditTypeId == this.appConstant.ISPS_TYPE_ID && this.priviousdata.auditSubTypeID != this.appConstant.INTERMEDIATE_SUB_TYPE_ID) &&
      (this.auditTypeId == this.appConstant.ISPS_TYPE_ID && this.priviousdata.auditSubTypeID != this.appConstant.ADDITIONAL_SUB_TYPE_ID)                      //changed by archana for jira ID-MOBILE-762
    ) {
    switch (currentBlock) {
      case 'open':
        console.log(event.value);

        if (event.value == 'RESTORE COMPLIANCE') {
          this.isStatusRestoreComplianced = true;
          this.RestoreCompliancedStausBlock = {
            ORIG_SEQ_NO: this.auditSeqNo,
            currSeqNo: this.auditSeqNo,
            categoryId: this.categoryId,
            statusDate: '',
            dueDate: '',
            description: '',
            findingSeqNo: '2',
            findingsNo: this.findingNo.toString(),
            statusId: Number(this.appConstant.COMPLAINCE_RESTORED),
            nextActionDesc: '',
            nextActionId: '',
            updateDescription: '',
            auditPlace: '',
            userIns: '',
            dateIns: '',
            updateFlag: 1,
            checkboxUpdate: 0,
            findingRptAttachs: [],
          };
          this.planAcceptedBlockMinStatusDate = this.openStatusBlock.statusDate;
          this.openStatusBlock.nextActionId = this.appConstant.COMPLAINCE_RESTORED;
          if (
            this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
            this.openStatusBlock.dueDate === ''
          ) {
            this.openStatusPlaceHolder = 'DURING CURRENT AUDIT';
          } else if (
            this.auditTypeId == this.appConstant.MLC_TYPE_ID &&
            this.openStatusBlock.dueDate === ''
          ) {
            this.openStatusPlaceHolder = 'DURING CURRENT INSPECTION';
          }
        }
        if (event.value == 'PREVIOUS STATUS') {
          //clear fields
          this.openStatusBlock.statusDate = '';
          this.openStatusBlock.dueDate = '';
          this.openStatusBlock.nextActionId = '';
          this.openStatusBlock.nextActionDesc = ' ';
          this.openStatusBlock.description = '';
          this.isStatusPlanAccepted = false;
          this.openStatusBlock.nextActionId = '';
          this.openStatusBlock.findingRptAttachs = [];
        }
        break;

        case 'restoreCompliance':
          console.log(event.value);
  
          if (event.value == 'PLAN ACCEPTED') {
            this.isStatusPlanAccepted = true;
            this.planAcceptedStausBlock = {
              ORIG_SEQ_NO: this.auditSeqNo,
              currSeqNo: this.auditSeqNo,
              categoryId: this.categoryId,
              statusDate: '',
              dueDate: '',
              description: '',
              findingSeqNo: '3',
              findingsNo: this.findingNo.toString(),
              statusId: Number(this.appConstant.PLAN_ACCEPTED),
              nextActionDesc: '',
              nextActionId: '',
              updateDescription: '',
              auditPlace: '',
              userIns: '',
              dateIns: '',
              updateFlag: 1,
              checkboxUpdate: 0,
              findingRptAttachs: [],
            };
            this.planAcceptedBlockMinStatusDate = this.openStatusBlock.statusDate;
            this.openStatusBlock.nextActionId = this.appConstant.PLAN_ACCEPTED;
          
          }
          if (event.value == 'PREVIOUS STATUS') {
            //clear fields
            this.RestoreCompliancedStausBlock.statusDate = '';
            this.RestoreCompliancedStausBlock.dueDate = '';
            this.RestoreCompliancedStausBlock.nextActionId = '';
            this.RestoreCompliancedStausBlock.nextActionDesc = ' ';
            this.RestoreCompliancedStausBlock.description = '';
            this.isStatusPlanAccepted = false;
            this.RestoreCompliancedStausBlock.nextActionId = '';
            this.RestoreCompliancedStausBlock.findingRptAttachs = [];
          }
          break;

      case 'planAccept':
        console.log(event.value);
        if (event.value == 'VERIFY / CLOSE') {
         
          if(this.planacceptAuditPlace.value==null||this.planacceptAuditPlace.value==''){
            this.toast.presentToast('Please enter '+this.dataFromPrevFindingListScreen.auditTypeTitle+' place', 'danger');
           
            let nextActionsplace=' ';
            this.nextActionsplace =this.nextActionsplace+nextActionsplace;
            this.planAcceptedStausBlock.nextActionDesc =this.nextActionsplace;
          this.planAcceptedStausBlock.dueDate = '';
          this.verifiedClosedStatusPlaceHolder = '';
          this.planAcceptedPlaceholder='  ';
          
          }else{
        this.planAcceptedStausBlock.updateDescription='Plan has been accepted as part of '+ this.dataFromPrevFindingListScreen.auditType+' '+ this.dataFromPrevFindingListScreen.auditTypeTitle +' at '+this.planacceptAuditPlace.value+' by '+ this.dataFromPrevFindingListScreen.auditorName.toUpperCase()+' on '+ moment(this.planAcceptedStausBlock.statusDate).format('DD-MMM-YYYY');
          }
          
          this.disableWholeOpenStatusBlock = true;
          this.isStatusVerifiedAndClosed = true;
          this.verifiedAndClosedStausBlock = {
            ORIG_SEQ_NO: this.auditSeqNo,
            currSeqNo: this.presentSeqNo,
            categoryId: this.categoryId,
            statusDate: '',
            dueDate: '',
            description: '',
            findingSeqNo: '4',
            findingsNo: this.findingNo.toString(),
            statusId: Number(this.appConstant.VERIFIED_CLOSED),
            nextActionDesc: '',
            nextActionId: '',
            updateDescription: '',
            auditPlace: '',
            userIns: '',
            dateIns: '',
            updateFlag: 1,
            checkboxUpdate: 0,
            findingRptAttachs: [],
          };
          this.planAcceptedStausBlock.nextActionId =
            this.appConstant.VERIFY_CLOSE;                       //changed by archana for jira ID-MOBILE-762
          if (
            this.auditTypeId == this.appConstant.ISPS_TYPE_ID && 
            this.planAcceptedStausBlock.dueDate === '' &&this.planacceptAuditPlace.value!=''
          ) {
            if(this.auditSubTypeID == this.appConstant.INTERIM_SUB_TYPE_ID ){
              this.planAcceptedPlaceholder = 'INITIAL AUDIT';
            } else if(this.auditSubTypeID == this.appConstant.INITIAL_SUB_TYPE_ID){
              this.planAcceptedPlaceholder = 'INTERMEDIATE AUDIT';
            } else if(this.auditSubTypeID == this.appConstant.INTERMEDIATE_SUB_TYPE_ID){
              this.planAcceptedPlaceholder = 'RENEWAL AUDIT';
            } else if(this.auditSubTypeID == this.appConstant.RENEWAL_SUB_TYPE_ID ){
              this.planAcceptedPlaceholder = 'INTERMEDIATE AUDIT';
            } else if(this.auditSubTypeID == this.appConstant.ADDITIONAL_SUB_TYPE_ID){
              this.planAcceptedPlaceholder = 'INTERMEDIATE AUDIT';
            }
          } 
        }
        if (event.value == 'PREVIOUS STATUS') {
          this.disableWholeOpenStatusBlock = false;
          this.isStatusVerifiedAndClosed = false;

          this.planAcceptedStausBlock.statusDate = '';
          this.planAcceptedStausBlock.dueDate = '';
          this.planAcceptedStausBlock.nextActionId = '';
          this.planAcceptedStausBlock.nextActionDesc = ' ';
          this.planAcceptedStausBlock.findingRptAttachs = [];
          this.planAcceptedStausBlock.description = '';
          this.planAcceptedStausBlock.auditPlace = '';
          this.planAcceptedStausBlock.updateDescription='';
          this.planacceptAuditPlace.value==''
          this.planAcceptedPlaceholder ='';
          this.isOpenStatusStatusDateDisabled = false;
          this.isOpenStatusDueDateDisabled = false;
          this.isOpenStatusDescriptionDisabled = false;
        }
        break;
      case 'verifyClose':
        console.log(event.value);
        if (event.value == 'NIL') {
          
          if( this.verifiedAndClosedStausBlock.updateFlag == 1 &&
            this.verifyCloseAuditPlace.value == null ||this.verifyCloseAuditPlace.value=='')
            {
              this.toast.presentToast('Please enter '+this.dataFromPrevFindingListScreen.auditTypeTitle+' place', 'danger');
              let nextActionsplace=' ';
              this.nextActionsplace =this.nextActionsplace+nextActionsplace;
              this.verifiedAndClosedStausBlock.dueDate = '';
            this.verifiedAndClosedStausBlock.nextActionId = '';
            this.verifiedAndClosedStausBlock.nextActionDesc = this.nextActionsplace ; 
            this.verifiedClosedStatusPlaceHolder = '';
        } else {
          if (
            this.verifiedAndClosedStausBlock.updateFlag == 1 &&
            this.verifyCloseAuditPlace.value != null
          ) {
           this.verifiedAndClosedStausBlock.updateDescription =
           'Verify/Close status has been updated as part of '+ this.dataFromPrevFindingListScreen.auditType+' '+ this.dataFromPrevFindingListScreen.auditTypeTitle +' at '+ this.verifyCloseAuditPlace.value + ' by ' + this.dataFromPrevFindingListScreen.auditorName.toUpperCase()+ ' on ' + moment(this.verifiedAndClosedStausBlock.statusDate).format('DD-MMM-YYYY');
         this.checkboxData = 'Complete '+this.auditSubtype+' '+ this.dataFromPrevFindingListScreen.auditTypeTitle ;
          }
         
          console.log('verified and closed value is nil');
          this.isStatusNil = true;
          this.disableWholePlanAcceptedStatusBlock = true;
          this.verifiedAndClosedStausBlock.nextActionId = this.appConstant.NIL;
          this.verifiedAndClosedStausBlock.dueDate == ''
            ? (this.verifiedClosedStatusPlaceHolder = 'N.A.')
            : '';
        }
        } else if ('PREVIOUS STATUS') {
          console.log('Previous status of verify closed');
          this.disableWholePlanAcceptedStatusBlock = false;

          this.verifiedAndClosedStausBlock.statusDate = '';
          this.verifiedAndClosedStausBlock.dueDate = '';
          this.verifiedAndClosedStausBlock.nextActionId = '';
          this.verifiedClosedStatusPlaceHolder='';
          this.verifiedAndClosedStausBlock.nextActionDesc = ' ';
          this.verifiedAndClosedStausBlock.description = '';
          this.verifiedAndClosedStausBlock.auditPlace = '';
          this.verifiedAndClosedStausBlock.updateDescription='';
          this.verifiedAndClosedStausBlock.findingRptAttachs = [];

          //enable previous block
          this.isPlanAcceptedStatusStatusDateDisabled = false;
          //this.isOpenStatusDueDateDisabled = false;
          this.isPlanAcceptedStatusDueDateDisabled = false;
          this.isPlanAcceptedStatusDescriptionDisabled = false;
        }
        if(currentBlock=='verifyClose' && this.planAcceptedStausBlock.dueDate == '' && this.planAcceptedPlaceholder == '' && event.value != 'PREVIOUS STATUS'){
          this.toast.presentToast('Please select Due Date for VERIFY / CLOSE', 'danger');
          this.disableWholePlanAcceptedStatusBlock = false;

          this.verifiedAndClosedStausBlock.statusDate = '';
          this.verifiedAndClosedStausBlock.dueDate = '';
          this.verifiedAndClosedStausBlock.nextActionId = '';
          this.verifiedClosedStatusPlaceHolder='';
          this.verifiedAndClosedStausBlock.nextActionDesc = ' ';
          this.verifiedAndClosedStausBlock.description = '';
          this.verifiedAndClosedStausBlock.auditPlace = '';
          this.verifiedAndClosedStausBlock.updateDescription='';

          //enable previous block
          this.isPlanAcceptedStatusStatusDateDisabled = false;
          this.isPlanAcceptedStatusDueDateDisabled = false;
          this.isPlanAcceptedStatusDescriptionDisabled = false;
        }
        break;
      default:
        break;
    }
  } else{
     /** added by archana for jira ID-MOBILE-761 end  */ 
    switch (currentBlock) {
      case 'open':
        console.log(event.value);

        if (event.value == 'PLAN ACCEPTED') {
          this.isStatusPlanAccepted = true;
          this.planAcceptedStausBlock = {
            ORIG_SEQ_NO: this.auditSeqNo,
            currSeqNo: this.auditSeqNo,
            categoryId: this.categoryId,
            statusDate: '',
            dueDate: '',
            description: '',
            findingSeqNo: '2',
            findingsNo: this.findingNo.toString(),
            statusId: Number(this.appConstant.PLAN_ACCEPTED),
            nextActionDesc: '',
            nextActionId: '',
            updateDescription: '',
            auditPlace: '',
            userIns: '',
            dateIns: '',
            updateFlag: 1,
            checkboxUpdate: 0,
            findingRptAttachs: [],
          };
          this.planAcceptedBlockMinStatusDate = this.openStatusBlock.statusDate;
          this.openStatusBlock.nextActionId = this.appConstant.PLAN_ACCEPTED;
          if (
            this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
            this.openStatusBlock.dueDate === ''
          ) {
            this.openStatusPlaceHolder = 'DURING CURRENT AUDIT';
          } else if (
            this.auditTypeId == this.appConstant.MLC_TYPE_ID &&
            this.openStatusBlock.dueDate === ''
          ) {
            this.openStatusPlaceHolder = 'DURING CURRENT INSPECTION';
          }
        }
        if (event.value == 'PREVIOUS STATUS') {
          //clear fields
          this.openStatusBlock.statusDate = '';
          this.openStatusBlock.dueDate = '';
          this.openStatusBlock.nextActionId = '';
          this.openStatusBlock.nextActionDesc = ' ';
          this.openStatusBlock.description = '';
          this.isStatusPlanAccepted = false;
          this.openStatusBlock.nextActionId = '';
          this.openStatusBlock.findingRptAttachs = [];
        }
        break;

      case 'planAccept':
        console.log(event.value);
        if (event.value == 'VERIFY / CLOSE') {
          /**added by archana for jira-id-MOBILE-752 start */
          if(this.planacceptAuditPlace.value==null||this.planacceptAuditPlace.value==''){
            this.toast.presentToast('Please enter '+this.dataFromPrevFindingListScreen.auditTypeTitle+' place', 'danger');
            //added by lokesh for jira_id(758) Start here
            let nextActionsplace=' ';
            this.nextActionsplace =this.nextActionsplace+nextActionsplace;
            this.planAcceptedStausBlock.nextActionDesc =this.nextActionsplace;
          this.planAcceptedStausBlock.dueDate = '';
          this.verifiedClosedStatusPlaceHolder = '';
          this.planAcceptedPlaceholder='  ';
          //added by lokesh for jira_id(758)end here
          }else{
           this.planAcceptedStausBlock.updateDescription='Plan has been accepted as part of '+ this.dataFromPrevFindingListScreen.auditType+' '+ this.dataFromPrevFindingListScreen.auditTypeTitle +' at '+this.planacceptAuditPlace.value+' by '+ this.dataFromPrevFindingListScreen.auditorName.toUpperCase()+' on '+ moment(this.planAcceptedStausBlock.statusDate).format('DD-MMM-YYYY');
          }
          /**added by archana for jira-id-MOBILE-752 end */
          this.disableWholeOpenStatusBlock = true;
          this.isStatusVerifiedAndClosed = true;
          this.verifiedAndClosedStausBlock = {
            ORIG_SEQ_NO: this.auditSeqNo,
            currSeqNo: this.presentSeqNo,
            categoryId: this.categoryId,
            statusDate: '',
            dueDate: '',
            description: '',
            findingSeqNo: '3',
            findingsNo: this.findingNo.toString(),
            statusId: Number(this.appConstant.VERIFIED_CLOSED),
            nextActionDesc: '',
            nextActionId: '',
            updateDescription: '',
            auditPlace: '',
            userIns: '',
            dateIns: '',
            updateFlag: 1,
            checkboxUpdate: 0,
            findingRptAttachs: [],
          };
          this.planAcceptedStausBlock.nextActionId =
            this.appConstant.VERIFY_CLOSE;
          if (
            (this.auditTypeId == this.appConstant.ISM_TYPE_ID &&
            this.planAcceptedStausBlock.dueDate === ''&&this.planacceptAuditPlace.value!='') || //added by lokesh for jira_id(758)
            ( this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
            this.planAcceptedStausBlock.dueDate === '' &&this.planacceptAuditPlace.value!='')
            ) {
           if(this.auditSubTypeID == this.appConstant.INTERIM_SUB_TYPE_ID ){
              this.planAcceptedPlaceholder = 'INITIAL AUDIT';
            } else if(this.auditSubTypeID == this.appConstant.INITIAL_SUB_TYPE_ID){
              this.planAcceptedPlaceholder = 'INTERMEDIATE AUDIT';
            } else if(this.auditSubTypeID == this.appConstant.INTERMEDIATE_SUB_TYPE_ID){
              this.planAcceptedPlaceholder = 'RENEWAL AUDIT';
            } else if(this.auditSubTypeID == this.appConstant.RENEWAL_SUB_TYPE_ID ){
              this.planAcceptedPlaceholder = 'INTERMEDIATE AUDIT';
            } else if(this.auditSubTypeID == this.appConstant.ADDITIONAL_SUB_TYPE_ID){
              this.planAcceptedPlaceholder = 'INTERMEDIATE AUDIT';
            }
          }  else if (
            this.auditTypeId == this.appConstant.MLC_TYPE_ID &&
            this.planAcceptedStausBlock.dueDate === ''&&this.planacceptAuditPlace.value!=''//added by lokesh for jira_id(758)
          ) {
            if(this.auditSubTypeID == this.appConstant.INTERIM_SUB_TYPE_ID ){
              this.planAcceptedPlaceholder = 'INITIAL INSPECTION';
            } else if(this.auditSubTypeID == this.appConstant.INITIAL_SUB_TYPE_ID){
              this.planAcceptedPlaceholder = 'INTERMEDIATE INSPECTION';
            } else if(this.auditSubTypeID == this.appConstant.INTERMEDIATE_SUB_TYPE_ID){
              this.planAcceptedPlaceholder = 'RENEWAL INSPECTION';
            } else if(this.auditSubTypeID == this.appConstant.RENEWAL_SUB_TYPE_ID ){
              this.planAcceptedPlaceholder = 'INTERMEDIATE INSPECTION';
            } else if(this.auditSubTypeID == this.appConstant.ADDITIONAL_SUB_TYPE_ID){
              this.planAcceptedPlaceholder = 'INTERMEDIATE INSPECTION';
            }
          }
        }
        if (event.value == 'PREVIOUS STATUS') {
          this.disableWholeOpenStatusBlock = false;
          this.isStatusVerifiedAndClosed = false;

          this.planAcceptedStausBlock.statusDate = '';
          this.planAcceptedStausBlock.dueDate = '';
          this.planAcceptedStausBlock.nextActionId = '';
          this.planAcceptedStausBlock.nextActionDesc = ' ';
          this.planAcceptedStausBlock.nextActionId = '';
          this.planAcceptedStausBlock.description = '';
          this.planAcceptedStausBlock.auditPlace = '';
          this.planAcceptedStausBlock.updateDescription='';
          this.planacceptAuditPlace.value==''//added by lokesh for jira_id(758)
          this.planAcceptedPlaceholder ='';
          this.planAcceptedStausBlock.findingRptAttachs = [];
          //enable previous block
          this.isOpenStatusStatusDateDisabled = false;
          this.isOpenStatusDueDateDisabled = false;
          this.isOpenStatusDescriptionDisabled = false;
        }
        break;
      case 'verifyClose':
        console.log(event.value);
        if (event.value == 'NIL') {
          /**added by archana for jira-id-MOBILE-752 start */
          if( this.verifiedAndClosedStausBlock.updateFlag == 1 &&
            this.verifyCloseAuditPlace.value == null ||this.verifyCloseAuditPlace.value=='')
            {
              this.toast.presentToast('Please enter '+this.dataFromPrevFindingListScreen.auditTypeTitle+' place', 'danger');
              let nextActionsplace=' ';
              this.nextActionsplace =this.nextActionsplace+nextActionsplace;
              this.verifiedAndClosedStausBlock.dueDate = '';
            this.verifiedAndClosedStausBlock.nextActionId = '';
            this.verifiedAndClosedStausBlock.nextActionDesc = this.nextActionsplace ; //added by lokesh for jira_id(758)
            this.verifiedClosedStatusPlaceHolder = '';//added by lokesh for jira_id(758)
        } else {
          if (
            this.verifiedAndClosedStausBlock.updateFlag == 1 &&
            this.verifyCloseAuditPlace.value != null
          ) {
           this.verifiedAndClosedStausBlock.updateDescription =
           'Verify/Close status has been updated as part of '+ this.dataFromPrevFindingListScreen.auditType+' '+ this.dataFromPrevFindingListScreen.auditTypeTitle +' at '+ this.verifyCloseAuditPlace.value + ' by ' + this.dataFromPrevFindingListScreen.auditorName.toUpperCase()+ ' on ' + moment(this.verifiedAndClosedStausBlock.statusDate).format('DD-MMM-YYYY');
         this.checkboxData = 'Complete '+this.auditSubtype+' '+ this.dataFromPrevFindingListScreen.auditTypeTitle ;
          }
          /**added by archana for jira-id-MOBILE-752 end */
          console.log('verified and closed value is nil');
          this.isStatusNil = true;
          this.disableWholePlanAcceptedStatusBlock = true;
          this.verifiedAndClosedStausBlock.nextActionId = this.appConstant.NIL;
          this.verifiedAndClosedStausBlock.dueDate == ''
            ? (this.verifiedClosedStatusPlaceHolder = 'N.A.')
            : '';
        }
        } else if ('PREVIOUS STATUS') {
          console.log('Previous status of verify closed');
          this.disableWholePlanAcceptedStatusBlock = false;

          this.verifiedAndClosedStausBlock.statusDate = '';
          this.verifiedAndClosedStausBlock.dueDate = '';
          this.verifiedAndClosedStausBlock.nextActionId = '';
          this.verifiedClosedStatusPlaceHolder='';//added by lokesh for jira_id(758)
          this.verifiedAndClosedStausBlock.nextActionDesc = ' ';//added by lokesh for jira_id(758)
          this.verifiedAndClosedStausBlock.description = '';
          this.verifiedAndClosedStausBlock.auditPlace = '';
          this.verifiedAndClosedStausBlock.updateDescription='';
          this.verifiedAndClosedStausBlock.findingRptAttachs = [];

          //enable previous block
          this.isPlanAcceptedStatusStatusDateDisabled = false;
          //this.isOpenStatusDueDateDisabled = false;
          this.isPlanAcceptedStatusDueDateDisabled = false;
          this.isPlanAcceptedStatusDescriptionDisabled = false;
        }
        if(currentBlock=='verifyClose' && this.planAcceptedStausBlock.dueDate == '' && this.planAcceptedPlaceholder == '' && event.value != 'PREVIOUS STATUS'){
          this.toast.presentToast('Please select Due Date for VERIFY / CLOSE', 'danger');
          this.disableWholePlanAcceptedStatusBlock = false;

          this.verifiedAndClosedStausBlock.statusDate = '';
          this.verifiedAndClosedStausBlock.dueDate = '';
          this.verifiedAndClosedStausBlock.nextActionId = '';
          this.verifiedClosedStatusPlaceHolder='';
          this.verifiedAndClosedStausBlock.nextActionDesc = ' ';
          this.verifiedAndClosedStausBlock.description = '';
          this.verifiedAndClosedStausBlock.auditPlace = '';
          this.verifiedAndClosedStausBlock.updateDescription='';

          //enable previous block
          this.isPlanAcceptedStatusStatusDateDisabled = false;
          this.isPlanAcceptedStatusDueDateDisabled = false;
          this.isPlanAcceptedStatusDescriptionDisabled = false;
        }
        break;
      default:
        break;
    }
  }
  }

  //ism/isps/mlc obs type next Action on change
  nextActionChangeObsCategory(event, currentBlock) {
    switch (currentBlock) {
      case 'open':
        console.log(event.value);
        if (event.value == 'NIL') {
          this.isStatusNil = true;
          this.openStatusBlock.findingsNo = this.findingNo.toString();
          this.openStatusBlock.nextActionId = this.appConstant.NIL;
          this.openStatusBlock.dueDate == ''
            ? (this.openStatusPlaceHolder = 'N.A.')
            : '';
        }
        /*  else if (event.value == 'PREVIOUS STATUS') {
           //clear fields
           this.openStatusBlock.statusDate = '';
           this.openStatusBlock.dueDate = '';
           this.openStatusBlock.nextActionId = '';
           this.openStatusBlock.nextActionDesc = '';
           this.openStatusBlock.description = '';
         } */
        break;

      default:
        break;
    }
  }
  //DMLc type next Action on change
  nextActionChangeDMLCCategory(event, currentBlock) {
    switch (currentBlock) {
      case 'open':
        console.log(event.value);

        if (event.value == 'VERIFY / CLOSE') {
          this.openStatusBlock.nextActionId = this.appConstant.VERIFY_CLOSE;              //changed by archana for jira ID-MOBILE-916
          this.isStatusVerifiedAndClosed = true;
          if (this.openStatusBlock.dueDate === '')
            this.openStatusPlaceHolder = 'DURING NEXT SCHEDULED INSPECTION.';
          this.verifiedAndClosedStausBlock = {
            ORIG_SEQ_NO: this.auditSeqNo,
            currSeqNo: this.presentSeqNo,
            categoryId: this.categoryId,
            statusDate: '',
            dueDate: '',
            description: '',
            findingSeqNo: '2',
            findingsNo: this.findingNo.toString(),
            statusId: Number(this.appConstant.VERIFIED_CLOSED),
            nextActionDesc: '',
            nextActionId: '',
            updateDescription: '',
            auditPlace: '',
            userIns: '',
            dateIns: '',
            updateFlag: 1,
            checkboxUpdate: 0,
            findingRptAttachs: [],
          };
          // this.planAcceptedBlockMinStatusDate = this.openStatusBlock.statusDate;
        }
        if (event.value == 'PREVIOUS STATUS') {
          //clear fields
          this.openStatusBlock.statusDate = '';
          this.openStatusBlock.dueDate = '';
          this.openStatusBlock.nextActionId = '';
          this.openStatusBlock.nextActionDesc = '';
          this.isStatusVerifiedAndClosed = false;
          this.openStatusBlock.findingRptAttachs = [];
          this.openStatusBlock.description = '';
        }
        break;

      case 'verifyClose':
        console.log(event.value);
        if (event.value == 'NIL') {
          console.log('verified and closed value is nil');

          this.verifiedAndClosedStausBlock.nextActionId = this.appConstant.NIL;
          this.isStatusNil = true;
          this.disableWholeOpenStatusBlock = true;
          this.verifiedAndClosedStausBlock.dueDate == ''
            ? (this.verifiedClosedStatusPlaceHolder = 'N.A.')
            : '';
        } else if ('PREVIOUS STATUS') {
          console.log('Previous status of verify closed');
          this.disableWholeOpenStatusBlock = false;
          this.verifiedAndClosedStausBlock.statusDate = '';
          this.verifiedAndClosedStausBlock.dueDate = '';
          this.verifiedAndClosedStausBlock.nextActionId = '';
          this.verifiedAndClosedStausBlock.nextActionDesc = ' ';//added by lokesh for jira_id(758)
          this.verifiedAndClosedStausBlock.findingRptAttachs = [];
          this.verifiedAndClosedStausBlock.description = '';
          this.verifiedAndClosedStausBlock.auditPlace = '';
          this.verifiedAndClosedStausBlock.updateDescription='';
          this.verifiedClosedStatusPlaceHolder='';

          //enable previous block
          this.isPlanAcceptedStatusStatusDateDisabled = false;
          this.isOpenStatusDueDateDisabled = false;
          this.isPlanAcceptedStatusDescriptionDisabled = false;
        }
        break;
      default:
        break;
    }
  }

  /* finding the category description of the selected finding */
  // getCategoryDesc(auditTypeId: any, categoryId: any): any {
  //   console.log("cat");

  //   let category = '';
  //   if (auditTypeId == this.appConstant.ISM_TYPE_ID) {
  //     if (categoryId == this.appConstant.MAJOR_FINDING_CATEGORY) {
  //       category = 'MNC';
  //     } else if (categoryId == this.appConstant.MINOR_FINDING_CATEGORY) {
  //       category = 'NC';
  //     } else {
  //       category = 'OBS';
  //     }
  //   }
  //   return category;
  // }


  /**added by archana for jira-id MOBILE-599 start  */ 
  async deleteOptions(attachment, block) {
    const alert = this.alertController.create({
      mode: 'ios',
      header: 'Delete Attachment',
      message: 'Are you sure you want to delete this attachment?',
      cssClass: 'alertCancel',  /**added by lokesh for changing text into bold jira-ID=650*/
      buttons: [
        {
          text: 'Yes',
          cssClass: 'alertButton',  /**added by lokesh for changing text into bold mobile_jira jira-ID=650*/
          handler: () => {
            console.log('Delete Confired');
            this.deleteAttachment(attachment, block);
          },
        },
        {
          text: 'No',
          handler: () => {
            console.log('Delete Rejected');
          },
        },
      ],
    });
    (await alert).present();
  }


  deleteAttachment(attachment, block) {
    console.log(attachment);
    console.log(block);

    switch (block) {
      case 'open':
        {
          this.openStatusBlock.findingRptAttachs =
            this.openStatusBlock.findingRptAttachs.filter(
              (attachItem) => attachItem.fileSeqNo !== attachment.fileSeqNo
            );
        }
        break;
      case 'downgrade':
        {
          this.downgradedStatusBlock.findingRptAttachs =
            this.downgradedStatusBlock.findingRptAttachs.filter(
              (attachItem) => attachItem.fileSeqNo !== attachment.fileSeqNo
            );
        }
        break;
      case 'planAccept':
        {
          this.planAcceptedStausBlock.findingRptAttachs =
            this.planAcceptedStausBlock.findingRptAttachs.filter(
              (attachItem) => attachItem.fileSeqNo !== attachment.fileSeqNo
            );
        }
        break;
      case 'verifyClose':
        {
          this.verifiedAndClosedStausBlock.findingRptAttachs =
            this.verifiedAndClosedStausBlock.findingRptAttachs.filter(
              (attachItem) => attachItem.fileSeqNo !== attachment.fileSeqNo
            );
        }
        break;
    }

    let isRecentlyAdded: boolean;

    if (this.saveInFileSystemFiles.length > 0) {
      isRecentlyAdded = this.saveInFileSystemFiles.some((ele) => {
        return ele.fileSeqNo == attachment.fileSeqNo;
      });
    } else {
      isRecentlyAdded = false;
    }

    if (isRecentlyAdded) {
      this.saveInFileSystemFiles = this.saveInFileSystemFiles.filter(
        (saveItem) => saveItem.fileSeqNo !== attachment.fileSeqNo
      );
    } else {
      this.deleteInFileSystemFiles.push({
        fileName: attachment.fileName,
        findingNo: attachment.findingNo ? attachment.findingNo : attachment.findingsNo,
        findingSeqNo: attachment.findingSeqNo ? attachment.findingSeqNo : attachment.findingsSeqNo,
        fileSeqNo: attachment.fileSeqNo,
      });
      console.log(this.deleteInFileSystemFiles);
      this.toast.presentToast('Previous Finding(s) attachment removed Successfully, Please save findings', 'success');
    }
    console.log(this.deleteInFileSystemFiles);
    console.log(this.saveInFileSystemFiles);
    // this.db
    // .deleteFindingAttach(attachment, attachment.orgSeqNo)
    // .then((res) => {


    //   this.toast.presentToast('Previous Finding(s) attachment removed Successfully', 'danger');
    //   this.db.getCurrentDbRecords();
    // })

  }
  pickAttachmentFile(event, statusBlock) {
    console.log(event);
    console.log(this.findingDetails);
    if(event.target.files[0].name.length > 70){  // added by archana for Jira Id-MOBILE-903
      this.toast.presentToast(
        'File Name should be less than 70 characters'
      );
    } else {
       switch (statusBlock) {
      case 'open':
        {
          this.validateAndAddPickedAttachment(
            event.target.files[0],
            this.openStatusBlock
          );
          console.log(this.findingDetails[0].findingRptAttachs);
          }
        break;
      case 'downgrade':
        {
          this.validateAndAddPickedAttachment(
            event.target.files[0],
            this.downgradedStatusBlock
          );
        }
        break;
      case 'planAccept':
        {
          this.validateAndAddPickedAttachment(
            event.target.files[0],
            this.planAcceptedStausBlock
          );
        }
        break;
      case 'verifyClose':
        {
          this.validateAndAddPickedAttachment(
            event.target.files[0],
            this.verifiedAndClosedStausBlock
          );
        }
        break;
    }
    event.target.value = '';
  }
   }


  validateAndAddPickedAttachment(file, block) {

    let isNotTheExistingFile: Boolean = true;
    let newFileSeqNo = 1;
    console.log(file);
    console.log(file.name);
    console.log(block);
    console.log(block.findingRptAttachs);

    if (block.findingRptAttachs.length > 0) {
      block.findingRptAttachs.forEach((existingAttachment) => {
        if (existingAttachment.fileName == file.name) {
          this.toast.presentToast(
            file.name + ' ' + 'file name already Exists',
            ''
          );
          isNotTheExistingFile = false;
        } else {
          isNotTheExistingFile = true;
          newFileSeqNo = Math.max.apply(
            Math,
            block.findingRptAttachs.map(function (attachment) {
              return Number(attachment.fileSeqNo) + 1;
            })
          );
        }
      });
    }
    let attDuplicateFiles = block.findingRptAttachs.map((res) => res.fileName);
    isNotTheExistingFile = attDuplicateFiles.includes(file.name) ? false : true;
    console.log(this.dataFromPrevFindingListScreen);
    console.log(this.findingInfo);


    if (isNotTheExistingFile) {
      block.findingRptAttachs.push({
        companyId: 2,
        currentAuditSeq: block.updateFlag == 0 ? this.auditSeqNo : Number(this.presentSeqNo),       //added by archana for jira Id-Mobile-765
        dateIns: moment(new Date()).format('YYYY-MM-DD'),
        fileName: file.name,
        fileSeqNo: newFileSeqNo.toString(),
        findingNo: this.findingInfo.findingsNo,
        findingSeqNo: block.findingsSeqNo ? block.findingsSeqNo : block.findingSeqNo,
        origAuditSeqNo: this.findingInfo.orgSeqNo,
        ownerFlag: 0,
        statusSeqNo: block.findingsSeqNo ? block.findingsSeqNo : block.findingSeqNo,
        userIns: this.dataFromPrevFindingListScreen.findingInfo.userIns,
      });

      console.log(block);

      this.saveInFileSystemFiles.push({
        file: file,
        fileName: file.name,
        findingNo: this.findingInfo.findingsNo,
        findingSeqNo: block.findingsSeqNo ? block.findingsSeqNo : block.findingSeqNo,
        fileSeqNo: newFileSeqNo.toString(),
      });

      console.log(this.saveInFileSystemFiles);
    }
    console.log(block.findingRptAttachs);
  }

  /**added by archana for jira-id MOBILE-599 end  */ 

  save() {
    this.findingValidation() ? this.saveOptions() : '';
  }
  findingValidation(): Boolean {
    let saveFlag = true;
    //get and set current finding's finding details in finding info
    let currentFindingDetails = [];
    console.log(
      'finding validation starts here..' /* , this.openStatusBlock, this.downgradedStatusBlock, this.planAcceptedStausBlock, this.verifiedAndClosedStausBlock */
    );

    if (
      this.auditTypeId == this.appConstant.ISM_TYPE_ID ||
      this.auditTypeId == this.appConstant.ISPS_TYPE_ID ||
      this.auditTypeId == this.appConstant.MLC_TYPE_ID
    ) {
      if (this.categoryId == this.appConstant.MAJOR_FINDING_CATEGORY) {
        if (this.openStatusBlock && this.openStatusBlock.nextActionId != '') {
          this.openStatusBlock.dueDate == ''
            ? (this.openStatusBlock.dueDate = this.openStatusPlaceHolder)
            : '';
          currentFindingDetails.push(this.openStatusBlock);

          if (
            this.downgradedStatusBlock &&
            this.downgradedStatusBlock.nextActionId != ''
          ) {
            currentFindingDetails.push(this.downgradedStatusBlock);

            if (
              this.downGradeAuditPlace != null &&
              this.downgradedStatusBlock.updateFlag === 1
            ) {
              this.downgradedStatusBlock.auditPlace =
                this.downGradeAuditPlace.value;
            } else if (
              this.downGradeAuditPlace == null &&
              this.downgradedStatusBlock.updateFlag === 1
            ) {
              saveFlag = false;
              this.toast.presentToast('Please enter '+this.dataFromPrevFindingListScreen.auditTypeTitle+' Place 1', 'danger');
            }

            if (
              this.planAcceptedStausBlock &&
              this.planAcceptedStausBlock.nextActionId != ''
            ) {
              currentFindingDetails.push(this.planAcceptedStausBlock);
              console.log(
                this.planacceptAuditPlace != null,
                this.planAcceptedStausBlock.updateFlag === 1
              );

              if (
                this.planacceptAuditPlace != null &&
                this.planAcceptedStausBlock.updateFlag === 1
              ) {
                this.planAcceptedStausBlock.auditPlace =
                  this.planacceptAuditPlace.value;
              } else if (
                this.planacceptAuditPlace == null &&
                this.planAcceptedStausBlock.updateFlag === 1
              ) {
                saveFlag = false;
                this.toast.presentToast('Please enter '+this.dataFromPrevFindingListScreen.auditTypeTitle+' Place 2', 'danger');
              }
              if (
                (this.planAcceptedStausBlock &&
                this.planAcceptedStausBlock.statusDate != '') ||
                (this.planAcceptedStausBlock &&
                  this.planAcceptedStausBlock.dueDate != '') 
              ) {
                
                  this.planAcceptedStausBlock.dueDate == '' 
                ? (this.planAcceptedStausBlock.dueDate =
                    this.planAcceptedPlaceholder)
                : '';
                
                // currentFindingDetails.push(this.planAcceptedStausBlock);
             
              }

              if (
                this.verifiedAndClosedStausBlock &&
                this.verifiedAndClosedStausBlock.nextActionId != ''
              ) {
                this.verifiedAndClosedStausBlock.dueDate == ''
                  ? (this.verifiedAndClosedStausBlock.dueDate =
                    this.verifiedClosedStatusPlaceHolder)
                  : '';
                currentFindingDetails.push(this.verifiedAndClosedStausBlock);

                if (
                  this.verifyCloseAuditPlace != null &&
                  this.verifiedAndClosedStausBlock.updateFlag === 1
                ) {
                  this.verifiedAndClosedStausBlock.auditPlace =
                    this.verifyCloseAuditPlace.value;
                } else if (
                  this.verifyCloseAuditPlace == null &&
                  this.verifiedAndClosedStausBlock.updateFlag === 1
                ) {
                  saveFlag = false;
                  this.toast.presentToast(
                    'Please enter '+this.dataFromPrevFindingListScreen.auditTypeTitle+' Place 3',
                    'danger'
                  );
                }
                if (
                  ( this.verifiedAndClosedStausBlock &&
                  this.verifiedAndClosedStausBlock.statusDate != '') ||
                  ( this.verifiedAndClosedStausBlock &&
                    this.verifiedAndClosedStausBlock.dueDate != '')
                ) {
                  this.verifiedAndClosedStausBlock.dueDate == ''
                    ? (this.verifiedAndClosedStausBlock.dueDate =
                        this.verifiedClosedStatusPlaceHolder)
                    : '';
                  // currentFindingDetails.push(this.verifiedAndClosedStausBlock);
                }
                if(this.enableCheck == true && this.verifiedAndClosedStausBlock.checkboxUpdate == 0){
                  this.toast.presentToast(
                    "please mark to complete previous "+this.dataFromPrevFindingListScreen.auditTypeTitle,
                    'danger'
                  );
                  saveFlag = false;
                }
              }
            }
          }
        }
         //toasters added by archana for JIra ID-MOBILE-880
        if(this.planAcceptedStausBlock){
          if((this.planAcceptedStausBlock.nextActionId != '' && this.planAcceptedStausBlock.statusDate == '') || (this.planAcceptedStausBlock.dueDate != '' && this.planAcceptedStausBlock.statusDate == '')){
            this.toast.presentToast('Please Enter the Status Date for PLAN ACCEPTED status', 'danger');
            saveFlag = false;
          }else if(this.planAcceptedStausBlock.statusDate != '' && (this.planAcceptedStausBlock.nextActionId == '' || this.planAcceptedStausBlock.nextActionDesc == '')){
            this.toast.presentToast('Please Enter the Next Action for PLAN ACCEPTED status', 'danger');
            saveFlag = false;
          }else if(this.planAcceptedStausBlock.statusDate != '' && this.planAcceptedStausBlock.nextActionId != '' && this.planAcceptedStausBlock.dueDate == ''){
            this.toast.presentToast('Please Enter the Due Date for PLAN ACCEPTED status', 'danger');
            saveFlag = false;
          }
        } 
        if(this.verifiedAndClosedStausBlock){
          if((this.verifiedAndClosedStausBlock.nextActionId != '' && this.verifiedAndClosedStausBlock.statusDate == '') || (this.verifiedAndClosedStausBlock.dueDate != '' && this.verifiedAndClosedStausBlock.statusDate == '')){
            this.toast.presentToast('Please Enter the Status Date for VERIFIED/CLOSED status', 'danger');
            saveFlag = false;
          }else if(this.verifiedAndClosedStausBlock.statusDate != '' && (this.verifiedAndClosedStausBlock.nextActionId == '' || this.verifiedAndClosedStausBlock.nextActionDesc == '')){
            this.toast.presentToast('Please Enter the Next Action for  VERIFIED/CLOSED status', 'danger');
            saveFlag = false;
          }else if(this.verifiedAndClosedStausBlock.statusDate != '' && this.verifiedAndClosedStausBlock.nextActionId != '' && this.verifiedAndClosedStausBlock.dueDate == ''){
            this.toast.presentToast('Please Enter the Due Date for  VERIFIED/CLOSED status', 'danger');
            saveFlag = false;
          }
  
        }
        
      } else if (this.categoryId == this.appConstant.MINOR_FINDING_CATEGORY) {
        
        if(this.auditTypeId != this.appConstant.ISPS_TYPE_ID || (this.auditTypeId == this.appConstant.ISPS_TYPE_ID && this.priviousdata.auditSubTypeID == this.appConstant.INTERMEDIATE_SUB_TYPE_ID) ||
        (this.auditTypeId == this.appConstant.ISPS_TYPE_ID && this.priviousdata.auditSubTypeID == this.appConstant.ADDITIONAL_SUB_TYPE_ID)){     //changed by archana for jira-ID-MOBILE-762
         if (this.openStatusBlock && this.openStatusBlock.nextActionId != '') {
          this.openStatusBlock.dueDate == ''
            ? (this.openStatusBlock.dueDate = this.openStatusPlaceHolder)
            : '';
          currentFindingDetails.push(this.openStatusBlock);

          if (
            this.planAcceptedStausBlock &&
            this.planAcceptedStausBlock.nextActionId != ''
          ) {
            this.planAcceptedStausBlock.dueDate == ''
              ? (this.planAcceptedStausBlock.dueDate =
                this.planAcceptedPlaceholder)
              : '';
            currentFindingDetails.push(this.planAcceptedStausBlock);

            if (
              this.planacceptAuditPlace != null &&
              this.planAcceptedStausBlock.updateFlag == 1
            ) {
              this.planAcceptedStausBlock.auditPlace =
                this.planacceptAuditPlace.value;
            } else if (
              this.planacceptAuditPlace == null &&
              this.planAcceptedStausBlock.updateFlag === 1
            ) {
              saveFlag = false;
              this.toast.presentToast('Please enter '+this.dataFromPrevFindingListScreen.auditTypeTitle+' Place', 'danger');
            }

            if (
              this.verifiedAndClosedStausBlock &&
              this.verifiedAndClosedStausBlock.nextActionId != ''
            ) {
              this.verifiedAndClosedStausBlock.dueDate == ''
                ? (this.verifiedAndClosedStausBlock.dueDate =
                  this.verifiedClosedStatusPlaceHolder)
                : '';
              currentFindingDetails.push(this.verifiedAndClosedStausBlock);

              if (
                this.verifyCloseAuditPlace != null &&
                this.verifiedAndClosedStausBlock.updateFlag == 1
              ) {
                this.verifiedAndClosedStausBlock.auditPlace =
                  this.verifyCloseAuditPlace.value;
              } else if (
                this.verifyCloseAuditPlace == null &&
                this.verifiedAndClosedStausBlock.updateFlag === 1
              ) {
                saveFlag = false;
                this.toast.presentToast('Please enter '+this.dataFromPrevFindingListScreen.auditTypeTitle+' Place', 'danger');//moidified by lokesh for jira_id(890)
              }

              if(this.enableCheck == true && this.verifiedAndClosedStausBlock.checkboxUpdate == 0){
                this.toast.presentToast(
                  "please mark to complete previous "+this.dataFromPrevFindingListScreen.auditTypeTitle,
                  'danger'
                );
                saveFlag = false;
              }
            }
          }
        }
            /** added by archana for jira ID-MOBILE-761 start  */ 
          } else {
            if (this.openStatusBlock && this.openStatusBlock.nextActionId != '') {
              this.openStatusBlock.dueDate == ''
                ? (this.openStatusBlock.dueDate = this.openStatusPlaceHolder)
                : '';
              currentFindingDetails.push(this.openStatusBlock);
              if(this.RestoreCompliancedStausBlock &&
                this.RestoreCompliancedStausBlock.nextActionId != ''){
                  currentFindingDetails.push(this.RestoreCompliancedStausBlock);

                  if (
                    this.complianceRestoredAuditPlace != null &&
                    this.RestoreCompliancedStausBlock.updateFlag === 1
                  ) {
                    this.RestoreCompliancedStausBlock.auditPlace =
                      this.complianceRestoredAuditPlace.value;
                  } else if (
                    this.complianceRestoredAuditPlace == null &&
                    this.RestoreCompliancedStausBlock.updateFlag === 1
                  ) {
                    saveFlag = false;
                    this.toast.presentToast('Please enter '+this.dataFromPrevFindingListScreen.auditTypeTitle+' Place 2', 'danger');
                  }
    
                }
                if (
                  this.planAcceptedStausBlock &&
                  this.planAcceptedStausBlock.nextActionId != ''
                ) {
                  this.planAcceptedStausBlock.dueDate == ''
                    ? (this.planAcceptedStausBlock.dueDate =
                      this.planAcceptedPlaceholder)
                    : '';
                  currentFindingDetails.push(this.planAcceptedStausBlock);
      
                  if (
                    this.planacceptAuditPlace != null &&
                    this.planAcceptedStausBlock.updateFlag == 1
                  ) {
                    this.planAcceptedStausBlock.auditPlace =
                      this.planacceptAuditPlace.value;
                  } else if (
                    this.planacceptAuditPlace == null &&
                    this.planAcceptedStausBlock.updateFlag === 1
                  ) {
                    saveFlag = false;
                    this.toast.presentToast('Please enter '+this.dataFromPrevFindingListScreen.auditTypeTitle+' Place', 'danger');
                  }
      
                  if (
                    this.verifiedAndClosedStausBlock &&
                    this.verifiedAndClosedStausBlock.nextActionId != ''
                  ) {
                    this.verifiedAndClosedStausBlock.dueDate == ''
                      ? (this.verifiedAndClosedStausBlock.dueDate =
                        this.verifiedClosedStatusPlaceHolder)
                      : '';
                    currentFindingDetails.push(this.verifiedAndClosedStausBlock);
      
                    if (
                      this.verifyCloseAuditPlace != null &&
                      this.verifiedAndClosedStausBlock.updateFlag == 1
                    ) {
                      this.verifiedAndClosedStausBlock.auditPlace =
                        this.verifyCloseAuditPlace.value;
                    } else if (
                      this.verifyCloseAuditPlace == null &&
                      this.verifiedAndClosedStausBlock.updateFlag === 1
                    ) {
                      saveFlag = false;
                      this.toast.presentToast('Please enter '+this.dataFromPrevFindingListScreen.auditTypeTitle+' Place', 'danger');
                    }
      
                    if(this.enableCheck == true && this.verifiedAndClosedStausBlock.checkboxUpdate == 0){
                      this.toast.presentToast(
                        "please mark to complete previous "+this.dataFromPrevFindingListScreen.auditTypeTitle,
                        'danger'
                      );
                      saveFlag = false;
                    }
                  }
                }
              }
        }
         /** added by archana for jira ID-MOBILE-761 end  */ 
          //toasters added by archana for JIra ID-MOBILE-880
         if(this.planAcceptedStausBlock){
          if((this.planAcceptedStausBlock.nextActionId != '' && this.planAcceptedStausBlock.statusDate == '') || (this.planAcceptedStausBlock.dueDate != '' && this.planAcceptedStausBlock.statusDate == '')){
            this.toast.presentToast('Please Enter the Status Date for PLAN ACCEPTED status', 'danger');
            saveFlag = false;
          }else if(this.planAcceptedStausBlock.statusDate != '' && (this.planAcceptedStausBlock.nextActionId == '' || this.planAcceptedStausBlock.nextActionDesc == '')){
            this.toast.presentToast('Please Enter the Next Action for PLAN ACCEPTED status', 'danger');
            saveFlag = false;
          }else if(this.planAcceptedStausBlock.statusDate != '' && this.planAcceptedStausBlock.nextActionId != '' && this.planAcceptedStausBlock.dueDate == ''){
            this.toast.presentToast('Please Enter the Due Date for PLAN ACCEPTED status', 'danger');
            saveFlag = false;
          }
        } 
        if(this.verifiedAndClosedStausBlock){
          if((this.verifiedAndClosedStausBlock.nextActionId != '' && this.verifiedAndClosedStausBlock.statusDate == '') || (this.verifiedAndClosedStausBlock.dueDate != '' && this.verifiedAndClosedStausBlock.statusDate == '')){
            this.toast.presentToast('Please Enter the Status Date for VERIFIED/CLOSED status', 'danger');
            saveFlag = false;
          }else if(this.verifiedAndClosedStausBlock.statusDate != '' && (this.verifiedAndClosedStausBlock.nextActionId == '' || this.verifiedAndClosedStausBlock.nextActionDesc == '')){
            this.toast.presentToast('Please Enter the Next Action for  VERIFIED/CLOSED status', 'danger');
            saveFlag = false;
          }else if(this.verifiedAndClosedStausBlock.statusDate != '' && this.verifiedAndClosedStausBlock.nextActionId != '' && this.verifiedAndClosedStausBlock.dueDate == ''){
            this.toast.presentToast('Please Enter the Due Date for  VERIFIED/CLOSED status', 'danger');
            saveFlag = false;
          }
  
        }
      } else if (this.categoryId == this.appConstant.OBS_FINDING_CATEGORY) {
        if (this.openStatusBlock) {
          if (
            this.openStatusBlock.statusDate &&
            this.openStatusBlock.nextActionId != ''
          ) {
            this.openStatusBlock.dueDate == ''
              ? (this.openStatusBlock.dueDate = this.openStatusPlaceHolder)
              : '';
            currentFindingDetails.push(this.openStatusBlock);
          }
        }
      }
      // this.findingInfo.findingDtl = currentFindingDetails;
      console.log('findingdetails to validate : ', currentFindingDetails);
    } else if (this.auditTypeId == this.appConstant.DMLC_TYPE_ID) {
      if (this.auditTypeId == this.appConstant.REVIEW_NOTE) {
        if (this.openStatusBlock && this.openStatusBlock.nextActionId != '') {
          this.openStatusBlock.dueDate == ''
            ? (this.openStatusBlock.dueDate = this.openStatusPlaceHolder)
            : '';
          currentFindingDetails.push(this.openStatusBlock);

          if (
            this.verifiedAndClosedStausBlock &&
            this.verifiedAndClosedStausBlock.nextActionId != ''
          ) {
            this.verifiedAndClosedStausBlock.dueDate == ''
              ? (this.verifiedAndClosedStausBlock.dueDate =
                this.verifiedClosedStatusPlaceHolder)
              : '';
            currentFindingDetails.push(this.verifiedAndClosedStausBlock);
          }
        }
      }
      //toasters added by archana for JIra ID-MOBILE-880
      if(this.verifiedAndClosedStausBlock){
        if((this.verifiedAndClosedStausBlock.nextActionId != '' && this.verifiedAndClosedStausBlock.statusDate == '') || (this.verifiedAndClosedStausBlock.dueDate != '' && this.verifiedAndClosedStausBlock.statusDate == '')){
          this.toast.presentToast('Please Enter the Status Date for VERIFIED/CLOSED status', 'danger');
          saveFlag = false;
        }else if(this.verifiedAndClosedStausBlock.statusDate != '' && (this.verifiedAndClosedStausBlock.nextActionId == '' || this.verifiedAndClosedStausBlock.nextActionDesc == '')){
          this.toast.presentToast('Please Enter the Next Action for  VERIFIED/CLOSED status', 'danger');
          saveFlag = false;
        }else if(this.verifiedAndClosedStausBlock.statusDate != '' && this.verifiedAndClosedStausBlock.nextActionId != '' && this.verifiedAndClosedStausBlock.dueDate == ''){
          this.toast.presentToast('Please Enter the Due Date for  VERIFIED/CLOSED status', 'danger');
          saveFlag = false;
        }

      }
    }

    //validation
    currentFindingDetails.forEach((findingDetail, index) => {
      if (!this.auditSeqNo) {
        saveFlag = false;
        this.toast.presentToast('Audit No is Missing', 'danger');
      } else if (!this.findingInfo.findingsNo) {
        saveFlag = false;

        this.toast.presentToast('Finding No Missing', 'danger');
      } else if (
        findingDetail.categoryId &&
        (findingDetail.statusDate || findingDetail.nextActionId) &&
        !this.findingInfo.auditCode
      ) {
        saveFlag = false;

        this.toast.presentToast('Please Enter ISM Code', 'danger');
      } else if (!this.findingInfo.serialNo) {
        saveFlag = false;

        this.toast.presentToast('No is Missing', 'danger');
      }

      if (saveFlag) {
        if (
          (findingDetail.nextActionId && !findingDetail.statusDate) ||
          (!findingDetail.statusDate && index == 0)
        ) {
          saveFlag = false;

          this.toast.presentToast('please enter the status date', 'danger');
        } else if (
          findingDetail.statusDate &&
          findingDetail.categoryId != this.appConstant.OBS_FINDING_CATEGORY &&
          (!findingDetail.nextActionId ||
            findingDetail.nextActionId == this.appConstant.PREVIOUS_STATUS)
        ) {
          saveFlag = false;

          this.toast.presentToast('please select the next action', 'danger');
        } else if (
          findingDetail.statusDate &&
          findingDetail.nextActionId &&
          !findingDetail.dueDate
        ) {
          saveFlag = false;
          this.toast.presentToast('please enter due date', 'danger');
        } else if (
          findingDetail.dueDate == '.' &&
          findingDetail.dueDate.length == 1
        ) {
          saveFlag = false;

          this.toast.presentToast('Please Select Due Date', 'danger');
        } else if (
          findingDetail.categoryId == 1004 &&
          findingDetail.nextActionId2 &&
          !findingDetail.dueDate
        ) {
          saveFlag = false;

          this.toast.presentToast('Please Select Due Date', 'danger');
        }
      }
    });

    this.findingInfo.findingDtl = currentFindingDetails;
    console.log('validated findingdetails : ', currentFindingDetails);

    return saveFlag;
  }
  async saveOptions(isBackButtonPressed?: boolean) {
    const alert = this.alertController.create({
      mode: 'ios',
      header: 'Update Finding',
      message: 'Do you want to save the changes?',
      cssClass: 'alertCancel',/**added by lokesh for changing text into bold mobile_jira(648)*/
      buttons: [
        {
          text: 'Yes',
          cssClass: 'alertButton',/**added by lokesh for changing text into bold mobile_jira(648)*/
          handler: () => {
            console.log('Save Confired');
            this.saveConfirmed(isBackButtonPressed);
          },
        },
        {
          text: 'No',
          handler: () => {
            console.log('Save Rejected');
            this.goBack(); //added by archana for jira id-MOBILE-907
          },
        },
      ],
    });
    (await alert).present();
  }
  //added by lokesh for  jira_id(788)
  ngAfterViewInit() {
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      this.router.navigateByUrl('/perform/previous-findings-list');
    });
  } //added by lokesh for  jira_id(788)

  ngOnDestroy() {
    console.log('ngOnDestroy');
    //this.setFindingToCurrentFindingsObj();
    this.backButtonSubscription.unsubscribe();
  }
  // Check if device is phone or tablet
  get isMobile() {
    return this.breakpointObserver.isMatched('(max-width: 767px)');
  }
/**added by archana for jira-id MOBILE-599 start  */ 
 async saveConfirmed(isBackButtonPressed?: boolean) {
    console.log(this.auditSeqNo);
    console.log(this.findingInfo.orgSeqNo);
   /**added by archana for jira ID-MOBILE-922 start*/
   await this.deleteInFileSystemFiles.forEach((attachmentObj) => {
     this.db
       .deleteFindingAttach(attachmentObj, this.auditSeqNo)
       .then((res) => {
         this.db.getCurrentDbRecords();
       })

     this.fileManager.deletePrevFindingAttachment(this.auditTypeDesc, this.auditSeqNo, attachmentObj, this.presentSeqNo);
   });
   /**added by archana for jira ID-MOBILE-922 end*/



    this.db
      .getPrevFindingDataList(this.findingInfo.orgSeqNo)
      .then((existingFindings: any) => {
        let findings = [];
        let findingDetails = [];
        let findingAttachments = [];

        console.log('Existing findings', existingFindings);
        console.log('Finding Information', this.findingInfo);
         const updateIndex = existingFindings.findIndex(
          (finding) => finding.findingsNo === this.findingInfo.findingsNo
        );
        console.log('updated index : ', updateIndex);
        if (updateIndex >= 0)
          existingFindings[updateIndex] = this.findingInfo;
        
        console.log('final findings array :', existingFindings);

        let finalFindigData = existingFindings;



        finalFindigData.forEach((finding, findIndex) => {
          console.log(finding);
          /**added by archana for jira Id-Mobile-765 start*/
          if (
            (finding.findingDtl[finding.findingDtl.length - 1].statusId ==
              this.appConstant.VERIFIED_CLOSED &&
              finding.findingDtl[finding.findingDtl.length - 1].statusDate) ||
            finding.findingDtl[0].categoryId ==
            this.appConstant.OBS_FINDING_CATEGORY
          ) {
            finding.findingStatus = 1;
          } else {
            finding.findingStatus = 0;
          }
         /**added by archana for jira Id-Mobile-765 end*/
          findings.push({
            seqNo: findIndex + 1,
            currSeqNo: finding.currSeqNo ? finding.currSeqNo : '',
            origSeqNo: finding.origSeqNo ? finding.origSeqNo : '',
            findingsNo: finding.findingsNo,
            auditDate: finding.auditDate ? finding.auditDate : '',
            auditCode: finding.auditCode,
            companyId: this.companyId,
            userIns: finding.userIns ? finding.userIns : this.userIns,
            findingStatus: finding.findingStatus,                          //added by archana for jira Id-Mobile-765
            dateIns: finding.dateIns
              ? finding.dateIns
              : moment(new Date()).format(this.appConstant.YYYYMMDD),
            serialNo: finding.serialNo,
          });

          
          if (finding.findingDtl.length > 0) {
            /**removed by archana for jira Id-Mobile-765 */
            //finding status is 1 if completed.
            // if (
            //   (finding.findingDtl[finding.findingDtl.length - 1].statusId ==
            //     this.appConstant.VERIFIED_CLOSED &&
            //     finding.findingDtl[finding.findingDtl.length - 1].statusDate) ||
            //   finding.findingDtl[0].categoryId ==
            //   this.appConstant.OBS_FINDING_CATEGORY
            // ) {
            //   findings[findIndex].findingStatus = 1;
            // } else {
            //   findings[findIndex].findingStatus = 0;
            // }

            finding.findingDtl.forEach((findingDetail, findDtlIndex) => {
              console.log(finding.findingDtl);
              console.log(findingDetail);
             

              if (
                findingDetail.nextActionId &&
                findingDetail.nextActionId != ''
              ) {
                if(findingDetail.updateFlag == 0){
               findingDetails.push({
                  seqNo: findDtlIndex + 1,
                  currSeqNo: findingDetail.currSeqNo
                    ? findingDetail.currSeqNo
                    : '',
                  origSeqNo: findingDetail.ORIG_SEQ_NO
                    ? findingDetail.ORIG_SEQ_NO
                    : '',
                  findingsNo: finding.findingsNo,
                  findingSeqNo: findDtlIndex + 1 + '',
                  categoryId: findingDetail.categoryId,
                  statusId: findingDetail.statusId,
                  statusDate: findingDetail.statusDate,
                  companyId: this.companyId,
                  nextActionId: Number(findingDetail.nextActionId),
                  dueDate: findingDetail.dueDate,
                  description: findingDetail.description
                    ? findingDetail.description
                    : '',
                  userIns: this.userIns ? this.userIns : '',
                  dateIns: findingDetail.dateIns
                    ? findingDetail.dateIns
                    : moment(new Date()).format(this.appConstant.YYYYMMDD),
                  auditTypeId: this.auditTypeId ? this.auditTypeId : '',
                  updateDescription: findingDetail.updateDescription
                    ? findingDetail.updateDescription
                    : '',
                    updateFlag: findingDetail.updateFlag ? findingDetail.updateFlag : 0,   // added by archana for jira-id-720
                    enableCheck:this.enableCheck,                                           // added by archana for jira-id-704
                    checkboxUpdate: findingDetail.checkboxUpdate? findingDetail.checkboxUpdate : 0, // added by archana for jira-id-704
                    // checkBoxChecked: this.checkBoxChecked,
                    auditPlace:findingDetail.auditPlace ? findingDetail.auditPlace : '',  //added by lokesh for  jira_id(630)
                });
                console.log(findingDetails);
               } else { 
                /**added by archana for jira Id-Mobile-765 start*/
                findingDetails.push({
                  seqNo: findDtlIndex + 1,
                  currSeqNo: this.presentSeqNo
                    ? this.presentSeqNo
                    : '',
                  origSeqNo: findingDetail.ORIG_SEQ_NO
                    ? findingDetail.ORIG_SEQ_NO
                    : '',
                  findingsNo: finding.findingsNo,
                  findingSeqNo: findDtlIndex + 1 + '',
                  categoryId: findingDetail.categoryId,
                  statusId: findingDetail.statusId,
                  statusDate: findingDetail.statusDate,
                  companyId: this.companyId,
                  nextActionId: Number(findingDetail.nextActionId),
                  dueDate: findingDetail.dueDate,
                  description: findingDetail.description
                    ? findingDetail.description
                    : '',
                  userIns: this.userIns ? this.userIns : '',
                  dateIns: findingDetail.dateIns
                    ? findingDetail.dateIns
                    : moment(new Date()).format(this.appConstant.YYYYMMDD),
                  auditTypeId: this.auditTypeId ? this.auditTypeId : '',
                  updateDescription: findingDetail.updateDescription
                    ? findingDetail.updateDescription
                    : '',
                    updateFlag: findingDetail.updateFlag ? findingDetail.updateFlag : 0,   
                    enableCheck:this.enableCheck,                                           
                    checkboxUpdate: findingDetail.checkboxUpdate? findingDetail.checkboxUpdate : 0, 
                    auditPlace:findingDetail.auditPlace ? findingDetail.auditPlace : '',  
                });
              }
              /**added by archana for jira Id-Mobile-765 end*/
                console.log(findingDetail);

                console.log(findingDetail.findingRptAttachs);


                if (findingDetail.findingRptAttachs.length > 0) {
                  console.log(findingDetail.findingRptAttachs.length);

                  findingDetail.findingRptAttachs.forEach(
                    (findingAttachment) => {
                      findingAttachments.push(
                        findingAttachment
                      );
                      console.log(findingAttachment);

                    }
                  );
                }
              }
            
            });
          }
        });
        console.log('Findings : ', findings);
        console.log('findingDetails : ', findingDetails);

        this.db
          .savePrevFindingData(
            { findings, findingDetails, findingAttachments }, this.auditSeqNo, this.presentSeqNo            //added by archana for jira Id-Mobile-765 start
          )
          .then(() => {
            this.deleteInFileSystemFiles.forEach((attachmentObj) => {
              console.log('deleteFindingAttachment01');
              console.log(attachmentObj);
               this.db
              .deleteFindingAttach(attachmentObj, this.auditSeqNo)
              .then((res) => {
               this.db.getCurrentDbRecords();
              })

              this.fileManager.deletePrevFindingAttachment(this.auditTypeDesc, this.auditSeqNo, attachmentObj, this.presentSeqNo);
             });
          })
          .then(() => {
            this.saveInFileSystemFiles.forEach((attachmentObj) => {
              console.log(attachmentObj);

              this.fileManager.savePrevFindingAttachmentFile(
                this.auditTypeDesc,
                this.auditSeqNo,
                attachmentObj,
                this.presentSeqNo
              );
            });
          })
          .then(() => {
            console.log('Findings has been saved in sqlite db');
            this.db.getCurrentDbRecords();
            this.saveInFileSystemFiles = [];            //added by archana for jira ID-MOBILE-922

            this.toast.presentToast('Finding(s) Updated Successfully', 'success'); //modified by lokesh for jira_id(590)
            //this.goBack(); //comment by lokesh for jira_id(670)
          });

      });

  }
/**added by archana for jira-id MOBILE-599 end  */ 

  goBack() {
    this.router.navigate(['/perform/previous-findings-list',{
      findingDetails: JSON.stringify(this.dataFromPrevFindingListScreen),
    }],{ replaceUrl: true } );//added by lokesh for jira_id(858)
  }

  private _filter(value: string): string[] {
    const filterValue = value.toString().toLowerCase();
 //added by lokesh for jira_id(759) START HERE
 let portArray:any=[];
 portArray=  this.portsStringArray.filter((item,
   index) => this.portsStringArray.indexOf(item) === index);
    return portArray.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
    //added by lokesh for jira_id(759) END HERE
  }

  //OpenStatus
  openStatusDateChange(event) {
    console.log(event);
    // convert object to string then trim it to yyyy-mm-dd
    this.openStatusBlock.statusDate = moment(event.value).format('YYYY-MM-DD');
  }
  openStatusBlockStatusDateClear(event) {
    event.stopPropagation();
    this.openStatusBlock.statusDate = '';
  }

  openDueDateChange(event) {
    this.openStatusBlock.dueDate = moment(event.value).format('YYYY-MM-DD');
    this.openStatusPlaceHolder = '';
  }

  openStatusBlockDueDateClear(event) {
    event.stopPropagation();
    this.openStatusBlock.dueDate = '';
  }

  //DowngradeStatus
  downGradeStatusBlockStatusDateOnChange(event) {
    if (event.value != '') {
      this.downgradedStatusBlock.statusDate = moment(event.value).format(
        'YYYY-MM-DD'
      );
      this.isOpenStatusStatusDateDisabled = true;
      this.isOpenStatusDueDateDisabled = true;
      this.isOpenStatusDescriptionDisabled = true;
    }
  }
  downGradedStatusBlockStatusDateClear(event) {
    event.stopPropagation();
    this.downgradedStatusBlock.statusDate = '';
    this.isOpenStatusStatusDateDisabled = false;
    this.isOpenStatusDueDateDisabled = false;
    this.isOpenStatusDescriptionDisabled = false;
  }

  downgradedStatusBlockDueDateChange(event) {
    this.downgradedStatusBlock.dueDate = moment(event.value).format(
      'YYYY-MM-DD'
    );
  }

  downgradedStatusBlockDueDateClear(event) {
    event.stopPropagation();
    this.downgradedStatusBlock.dueDate = '';
  }

  //planAcceptStatus
  planAcceptedStausBlockStatusDateOnChange(event) {
    if (event.value != '') {
      this.planAcceptedStausBlock.statusDate = moment(event.value).format(
        'YYYY-MM-DD'
      );

      if (this.categoryId == this.appConstant.MAJOR_FINDING_CATEGORY) {
        this.isDowngradedStatusStatusDateDisabled = true;
        this.isDowngradedStatusDueDateDisabled = true;
        this.isDowngradedStatusDescriptionDisabled = true;
      } else if (this.categoryId == this.appConstant.MINOR_FINDING_CATEGORY) {
        this.isOpenStatusStatusDateDisabled = true;
        this.isOpenStatusDueDateDisabled = true;
        this.isOpenStatusDescriptionDisabled = true;
      }
    }
  }
  planAcceptedStausBlockStatusDateClear(event) {
    event.stopPropagation();
    this.planAcceptedStausBlock.statusDate = '';
    if (this.categoryId == this.appConstant.MAJOR_FINDING_CATEGORY) {
      this.isDowngradedStatusStatusDateDisabled = false;
      this.isDowngradedStatusDueDateDisabled = false;
      this.isDowngradedStatusDescriptionDisabled = false;
    } else if (this.categoryId == this.appConstant.MINOR_FINDING_CATEGORY) {
      this.isOpenStatusStatusDateDisabled = false;
      this.isOpenStatusDueDateDisabled = false;
      this.isOpenStatusDescriptionDisabled = false;
    }
  }

  planAcceptedStausBlockDueDateChange(event) {
    this.planAcceptedStausBlock.dueDate = moment(event.value).format(
      'YYYY-MM-DD'
    );
  }

  planAcceptedStausBlockDueDateClear(event) {
    event.stopPropagation();
    this.planAcceptedStausBlock.dueDate = '';
    this.planAcceptedPlaceholder = '';
  }

  //verifyCloseStatus
  verifiedAndClosedStausBlockStatusDateOnChange(event) {
    if (event.value != '') {
      this.verifiedAndClosedStausBlock.statusDate = moment(event.value).format(
        'YYYY-MM-DD'
      );
      this.verifiedAndClosedStausBlock.dueDate == ''
        ? (this.verifiedClosedStatusPlaceHolder = 'N.A.')
        : '';
      this.isPlanAcceptedStatusStatusDateDisabled = true;
      this.isPlanAcceptedStatusDueDateDisabled = true;
      this.isPlanAcceptedStatusDescriptionDisabled = true;
    }
  }
  verifiedAndClosedStausBlockStatusDateClear(event) {
    event.stopPropagation();
    this.verifiedAndClosedStausBlock.statusDate = '';
    this.isPlanAcceptedStatusStatusDateDisabled = false;
    this.isPlanAcceptedStatusDueDateDisabled = false;
    this.isPlanAcceptedStatusDescriptionDisabled = false;
  }
  verifiedAndClosedStausBlockDueDateChange(event) {
    this.verifiedAndClosedStausBlock.dueDate = moment(event.value).format(
      'YYYY-MM-DD'
    );
    this.verifiedClosedStatusPlaceHolder = '';
  }
  verifiedAndClosedStausBlockDueDateClear(event) {
    event.stopPropagation();
    this.verifiedAndClosedStausBlock.dueDate = '';
    this.verifiedClosedStatusPlaceHolder = '';
  }

  addDays(date, daysNumber) {
    // return (new Date(date.getFullYear(), date.getMonth(), date.getDate() + daysNumber).toISOString());
    return new Date(moment(date).add(daysNumber, 'days').toString());
  }

  setMaxDueDates(closeMeetingDate) {
    console.log('DueDate maxDate setting starts here..');
    console.log('CloseMeetingDate', closeMeetingDate);
    if (
      (this.auditTypeId == this.appConstant.ISM_TYPE_ID ||
        this.appConstant.ISPS_TYPE_ID) &&
      this.categoryId == this.appConstant.MAJOR_FINDING_CATEGORY
    ) {
      console.log('audit Type : ISM/ISPS', 'category : Major');
      this.openStatusMaxDueDate = this.addDays(closeMeetingDate, 30);
      this.downgradStatusMaxDueDate = this.addDays(closeMeetingDate, 30);
      console.log(
        'this.downgradStatusMaxDueDate',
        this.downgradStatusMaxDueDate
      );
      this.planAcceptedStatusMaxDueDate = this.addDays(closeMeetingDate, 90);
      //this.verifyCloseStatusMaxDueDate = this.addDays(closeMeetingDate, 89);
      console.log(
        'this.planAcceptedStatusMaxDueDate',
        this.planAcceptedStatusMaxDueDate
      );
    } else if (
      this.auditTypeId == this.appConstant.ISM_TYPE_ID &&
      this.categoryId == this.appConstant.MINOR_FINDING_CATEGORY
    ) {
      console.log('audit Type : ISM', 'category : Minor');
      this.openStatusMaxDueDate = this.addDays(closeMeetingDate, 30);
      this.planAcceptedStatusMaxDueDate = this.addDays(closeMeetingDate, 90);
      // this.verifyCloseStatusMaxDueDate = this.addDays(closeMeetingDate, 89);
      console.log('this.openStatusMaxDueDate', this.openStatusMaxDueDate);
    }

    if (
      this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
      this.categoryId == this.appConstant.MINOR_FINDING_CATEGORY
    ) {

      this.planAcceptedStatusMaxDueDate = this.addDays(closeMeetingDate, 90);
      /* if () {

      } else if () {

      } */
    }

    if (
      this.auditTypeId == this.appConstant.MLC_TYPE_ID &&
      this.categoryId == this.appConstant.MINOR_FINDING_CATEGORY
    ) {
      this.planAcceptedStatusMaxDueDate = this.addDays(closeMeetingDate, 90);
      // this.verifyCloseStatusMaxDueDate = this.addDays(closeMeetingDate, 89);
    }
    /*    this.openStatusMaxDueDate;
       this.downgradStatusMaxDueDate;
       this.planAcceptedStatusMaxDueDate;
       this.verifyCloseStatusMaxDueDate; */
    console.log('DueDate maxDate setting ends here..');
  }
  //added by ramya on 13-06-2022 for jira id - MOBILE-571
  descriptionMaxLengthValidation(desc) {
    if (desc.length > 2500) {
      desc = desc.slice(0, 2500);
      this.toast.presentToast('Description should be less than 2500 characters', 'danger',20000);//modified by lokesh for jira_id(726)
    }
  }
  textBoxRequir(e){
    console.log(e);
    console.log(e.currentTarget.checked);
    console.log("checkMaster....",e.target.value);
    if(e.currentTarget.checked == true){
      this.checkBoxChecked = 1;
      this.verifiedAndClosedStausBlock.checkboxUpdate = 1;
    } else {
      this.enableCheck = true;     // added by archana for jira Id-Mobile-794,Mobile-810
      this.checkBoxChecked = 0;
      this.verifiedAndClosedStausBlock.checkboxUpdate = 0;
    }
    

  }

  /**added by archana for download attachment implementation start */
  downloadAttachment(attachment, block){
    console.log(attachment);
    console.log(block);
    console.log(this.filesys.externalRootDirectory + 'Download/AUDITING_APP_DOWNLOADS/',
      attachment.fileName);
      this.checkFileExistToDownload(attachment, block).then((res) => {
        if (res) {
          console.log('FILE EXISTS ');
          this.copyFileToDownloadsFolder(attachment);
        } else {
          console.log('FILE NOT EXISTS ');
  
          this.toast.presentToast('File not found to download', 'danger');
        }
        console.log(res);
       
      });
  }
  checkFileExistToDownload(attachment, block): Promise<boolean> {
    console.log('attachment.fileName', attachment.fileName);
    let directory = this.dirName;
    console.log(this.dirName);
    console.log(this.filesys);
     return new Promise<boolean>((resolve, reject) => {
       this.filesys.checkFile
         ( directory +
             '/AuditDetails/' +
               this.auditTypeDesc +
            '/' +
            this.presentSeqNo +
            '/'+
             'pf/'+
            this.auditSeqNo +
            '/'+
            attachment.findingsNo +
            '/'+
            attachment.findingsSeqNo +'/',
            
            attachment.fileName
            
        )
        .then((res) => {
          console.log('checkFileExistToDownload', res);
          resolve(res);
        })
        .catch((err) => {
          this.toast.presentToast('please save findings to download the file', 'danger');
          console.log('checkFileExistToDownload', err);
          reject(err);
        });
    });
  }
  copyFileToDownloadsFolder(attachment){
    let directory = this.dirName;
    this.checkAuditingAppDownloadsFolder().then((res)=>{
      console.log(res);

      this.checkAuditingAppDownloadsFolderPrevFindings()
      .then((res)=>{
        this.saveattachmentFolder(directory,attachment);
     })
     .catch((err)=>{
        this.createAuditingAppDownloadsFolderPrevFindings().then((res)=>{
          this.saveattachmentFolder(directory,attachment);
        })
      })

      
      
    }).catch((err)=>{
      if(!this.isIOS){
      this.createAuditingAppDownloadsFolder().then((res)=>{
        console.log(res);
        this.checkAuditingAppDownloadsFolderPrevFindings()
        .then((res)=>{
          this.saveattachmentFolder(directory,attachment);
       })
       .catch((err)=>{
          this.createAuditingAppDownloadsFolderPrevFindings().then((res)=>{
            this.saveattachmentFolder(directory,attachment);
          })
        })
        })
        /**added by archana for Jira ID-MOBILE-715 start */
    }else if(this.isIOS){
      let mime = this.getValueFromMIME(
        attachment.fileName.split('.').pop()
      );
      this.fileOpener.open(
        directory +
          'AuditDetails/' +
          this.auditTypeDesc +
          '/' +
          this.presentSeqNo +
          '/' +
          'pf/'+
          this.auditSeqNo +
          '/'+
          attachment.findingsNo +
          '/'+
          attachment.findingsSeqNo +
          '/' +
          attachment.fileName,
        mime
      );
    }
     /**added by archana for Jira ID-MOBILE-715 end */
  })
  }

  createAuditingAppDownloadsFolder(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.filesys
        .createDir(
          this.filesys.externalRootDirectory + 'Download/',
          'AUDITING_APP_DOWNLOADS',
          false
        )
        .then((res) => {
          console.log('createAuditingAppDownloadsFolder', res);
          resolve(true);
        })
        .catch((err) => {
          console.log('createAuditingAppDownloadsFolder', err);
          resolve(false);
        });
    });
  }
   

  
  checkAuditingAppDownloadsFolder(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.filesys
        .checkDir(
          this.filesys.externalRootDirectory + 'Download/',
          'AUDITING_APP_DOWNLOADS'
        )
        .then((res) => {
          console.log('checkAuditingAppDownloadsFolder', res);
          resolve(true);
        })
        .catch((err) => {
          console.log('checkAuditingAppDownloadsFolder', err);
          reject(err);
        });
    });
  }
  checkAuditingAppDownloadsFolderPrevFindings(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.filesys
        .checkDir(
          this.filesys.externalRootDirectory + 'Download/'+
          'AUDITING_APP_DOWNLOADS/', 'PreviousFindings'
        )
        .then((res) => {
          console.log('checkAuditingAppDownloadsFolderPrevFindings', res);
          resolve(true);
        })
        .catch((err) => {
          console.log('checkAuditingAppDownloadsFolderPrevFindings', err);
          reject(err);
        });
    });
  }
  createAuditingAppDownloadsFolderPrevFindings(){
    return new Promise<boolean>((resolve, reject) => {
      this.filesys
        .createDir(
          this.filesys.externalRootDirectory + 'Download/'+ 'AUDITING_APP_DOWNLOADS/', 
          'PreviousFindings',
          false
        )
        .then((res) => {
          console.log('createAuditingAppDownloadsFolderPrevFindings', res);
          resolve(true);
        })
        .catch((err) => {
          console.log('createAuditingAppDownloadsFolderPrevFindings', err);
          reject(err);
        });
    });
  }

  saveattachmentFolder(directory,attachment){
    this.filesys
    .copyFile(
      directory +
      '/AuditDetails/' +
        this.auditTypeDesc +
     '/' +
     this.presentSeqNo +
     '/'+
      'pf/'+
     this.auditSeqNo +
     '/'+
     attachment.findingsNo +
     '/'+
     attachment.findingsSeqNo +'/',
     
     attachment.fileName,
     this.filesys.externalRootDirectory + 'Download/AUDITING_APP_DOWNLOADS/'+ 'PreviousFindings/',
     attachment.fileName
    );
    /** added by archana for jira-id MOBILE-715 start */
    var attach =  '/AuditDetails/' + this.auditTypeDesc + '/' + this.presentSeqNo + '/'+ 'pf/'+ this.auditSeqNo +'/'+ attachment.findingsNo +'/'+ attachment.findingsSeqNo +'/'+attachment.fileName;
    this.toast.presentToast(
      'File Downloaded successfully in Download/AUDITING_APP_DOWNLOADS/  PreviousFindings Folder',
          'success'
    );
    // this.fileManager.openPdfFindings(directory,attach).then(() => {
    //   // resolve({ data: "Success" });
    // });
    /** added by archana for jira-id MOBILE-715 end */
  }
  
/**added by archana for download attachment implementation end */
}
