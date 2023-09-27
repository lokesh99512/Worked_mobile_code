import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  ModalController,
  Platform,
} from '@ionic/angular';
import * as moment from 'moment';
import { AppConstant } from 'src/app/constants/app.constants';
import { FindingDetail, findingDetails } from 'src/app/interfaces/finding';
import { DatabaseService } from 'src/app/providers/database.service';
import { ToastService } from 'src/app/providers/toast.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { FindingService } from 'src/app/providers/finding.service';
import { FileManagerService } from 'src/app/providers/file-manager.service';
import { File } from '@ionic-native/file/ngx';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { LoginPage } from 'src/app/pages/auth/login/login.page';
import { FileOpener } from '@ionic-native/file-opener/ngx';


@Component({
  selector: 'app-finding-details',
  templateUrl: './finding-details.page.html',
  styleUrls: ['./finding-details.page.scss'],
})
export class FindingDetailsPage implements OnInit {
  findingInfo: any;
   /**added by archana for Jira ID-MOBILE-715 start */
   mimeType: { type: string; value: string }[] = [
    { type: 'pdf', value: 'application/pdf' },
    { type: 'jpeg', value: 'image/jpeg' },
    { type: 'txt', value: 'text/plain' },
    { type: 'png', value: 'image/png' },
  ];
   /**added by archana for Jira ID-MOBILE-715 end */

  dataFromFindingListScreen: any;
  findingDetails: any;
  auditTypeId: any;
  auditTypeDesc: any;
  auditSubTypeId: any;
  findingStatusList;
  categoryId: any;
  categoryDesc: any;
  auditSeqNo: any;
  userIns: string;
  companyId: number;

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

  /* place holders */
  openStatusPlaceHolder: any;
  downgradeStatusPlaceHolder: any;
  planAcceptedPlaceholder: any;
  verifiedClosedStatusPlaceHolder: string = '';

  /* file attachment members */
  saveInFileSystemFiles = [];
  deleteInFileSystemFiles = [];
  dirName: any;
  isIOS: boolean;

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
    private filesys: File,
    private fileOpener: FileOpener,          //added by archana for Jira ID-MOBILE-715 
  ) {
    /**added by archana for download attachment implementation start*/
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
    /**added by archana for download attachment implementation end*/
    this.dataFromFindingListScreen =
      this.router.getCurrentNavigation().extras.state;
    console.log(
      'this.dataFromFindingListScreen',
      this.dataFromFindingListScreen
    );
    this.auditTypeId = this.dataFromFindingListScreen.auditInfo.auditTypeId;
    this.auditSubTypeId =
      this.dataFromFindingListScreen.auditInfo.auditSubTypeId;
    this.auditTypeDesc = this.dataFromFindingListScreen.auditInfo.auditTypeDesc;
    this.findingInfo = this.dataFromFindingListScreen.findingInfo;
    this.auditSeqNo = this.dataFromFindingListScreen.auditInfo.auditSeqNo
      ? this.dataFromFindingListScreen.auditInfo.auditSeqNo
      : toast.presentToast('Audit No is Missing');
    this.minStatusDate =
      this.dataFromFindingListScreen.auditInfo.openMeetingDate;
    this.maxStatusDate =
      this.dataFromFindingListScreen.auditInfo.closeMeetingDate;
      /**added by archana for jira Id-MOBILE-853 start */
    if (this.dataFromFindingListScreen.auditInfo.auditTypeId != 1005) {
      this.minDueDate = this.findingService.addDays(
        this.dataFromFindingListScreen.auditInfo.closeMeetingDate,
        0                                                 // changed by archana for Jira Id-Mobile-820
      );
    } else {
      this.minDueDate = this.findingService.addDays(
        this.dataFromFindingListScreen.auditInfo.auditDate,
        0
      );
    }
    /**added by archana for jira Id-MOBILE-853 end */
    this.userIns = this.dataFromFindingListScreen.auditInfo.userIns;
    // this.categoryId = this.findingInfo.findingDtl.length > 0 ? this.categoryId = this.findingInfo.findingDtl[0].categoryId : '';
    this.companyId = this.dataFromFindingListScreen.auditInfo.companyId;
    this.findingStatusList =
      this.dataFromFindingListScreen.findingStatusList.map(
        (res) => res.FINDINGS_STATUS_DESC
      );
    // this.categoryDesc = this.dataFromFindingListScreen.findingCatDesc;
    console.log('findingData', this.dataFromFindingListScreen);
    this.isNewFinding = this.dataFromFindingListScreen.isNewFinding;
    this.categoryId = this.dataFromFindingListScreen.findingCategoryId;
    //newly created
    if (
      this.findingInfo.findingDtl.length == 0 ||
      this.findingInfo.findingDtl.length == undefined
    ) {
      console.log('Newly created');
      this.isStatusOpened = true;

      this.findingInfo.findingDtl.push({
        currSeqNo: this.auditSeqNo,
        ORIG_SEQ_NO: this.auditSeqNo,
        findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
        findingSeqNo: '1',
        categoryId: this.categoryId,
        statusId: 1001,
        statusDate: this.dataFromFindingListScreen.auditInfo.closeMeetingDate
          ? this.dataFromFindingListScreen.auditInfo.closeMeetingDate
          : '',
        nextActionId: '',
        dueDate: '',
        description: '',
        nextActionDesc: '',
        findingRptAttachs: [],
      });
    }
    // this.db.getCurrentfindingDetailData(this.findingInfo.origSeqNo, this.findingInfo.findingsNo).then((this.findingDetails) => {
    this.findingDetails = this.findingInfo.findingDtl;
    console.log('findingDetails', this.findingDetails);
    console.log('this.categoryId', this.categoryId);

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

        if (this.findingDetails[0] && this.findingDetails[0].statusId == 1001) {
          //open_status
          this.isStatusOpened = true;

          this.findingDetails[0].statusDesc =
            this.findingService.getFindingStatusDesc(
              this.findingDetails[0].statusId
            );

          this.openStatusBlock = this.findingDetails[0];
          if (this.openStatusBlock.nextActionId) {
            this.isStatusDowngraded = true;
            //set due date
            //if condisions changed by  lokesh for jira_(667)
            if (
              this.openStatusBlock.dueDate =='CURRENT INSPECTION'||
              this.openStatusBlock.dueDate =='CURRENT AUDIT'||
              this.openStatusBlock.dueDate =='DURING CURRENT AUDIT'||
              this.openStatusBlock.dueDate =='DURING CURRENT AUDIT.'||
              this.openStatusBlock.dueDate =='CURRENT INSPECTION.'
            ) {
              this.openStatusPlaceHolder = this.openStatusBlock.dueDate;
            }
            // this.openStatusBlock.dueDate == 'CURRENT AUDIT' ? this.openStatusPlaceHolder = this.openStatusBlock.dueDate : '';
            this.downgradedStatusBlock = {
              ORIG_SEQ_NO: this.auditSeqNo,
              currSeqNo: this.auditSeqNo,
              categoryId: this.categoryId,
              statusDate: '',
              dueDate: '',
              description: '',
              findingSeqNo: '2',
              findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
              statusId: Number(this.appConstant.DOWNGRADED),
              nextActionDesc: '',
              nextActionId: '',
              updateDescription: '',
              auditPlace: '',
              userIns: '',
              dateIns: '',
              findingRptAttachs: [],
              statusDesc: this.findingService.getFindingStatusDesc(
                Number(this.appConstant.DOWNGRADED)
              ),
            };

            this.findingDetails[0].statusDesc =
              this.findingService.getFindingStatusDesc(
                this.findingDetails[0].statusId
              );

            console.log('this.openStatusBlock =>', this.openStatusBlock);
          }
        }
        if (this.findingDetails[1] && this.findingDetails[1].statusId == 1003) {
        if(this.findingDetails[1].dueDate != "DURING CURRENT INSPECTION"){
          this.findingDetails[1].dueDate = moment(this.findingDetails[1].dueDate).format('YYYY-MM-DD');   // added by archana for Jira Id-Mobile-820
        }
          //downgrade_status
          this.isStatusDowngraded = true;

          this.findingDetails[1].statusDesc =
            this.findingService.getFindingStatusDesc(
              this.findingDetails[1].statusId
            );

          this.downgradedStatusBlock = this.findingDetails[1];
          this.planAcceptedBlockMinStatusDate =
            this.downgradedStatusBlock.statusDate;
          if (this.downgradedStatusBlock.statusDate) {
            this.disableWholeOpenStatusBlock = true;
          }
          if (this.downgradedStatusBlock.nextActionId) {
            this.isStatusPlanAccepted = true;
            this.planAcceptedStausBlock = {
              ORIG_SEQ_NO: this.auditSeqNo,
              currSeqNo: this.auditSeqNo,
              categoryId: this.categoryId,
              statusDate: '',
              dueDate: '',
              description: '',
              findingSeqNo: '3',
              findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
              statusId: Number(this.appConstant.PLAN_ACCEPTED),
              nextActionDesc: '',
              nextActionId: '',
              updateDescription: '',
              auditPlace: '',
              userIns: '',
              dateIns: '',
              findingRptAttachs: [],
              statusDesc: this.findingService.getFindingStatusDesc(
                Number(this.appConstant.PLAN_ACCEPTED)
              ),
            };
            console.log(
              'this.downgradedStatusBlock =>',
              this.downgradedStatusBlock
            );
            if (
              this.auditTypeId == this.appConstant.MLC_TYPE_ID &&
              (this.downgradedStatusBlock.dueDate ==
                'DURING CURRENT INSPECTION.' ||
                this.downgradedStatusBlock.dueDate ==
                  'DURING CURRENT INSPECTION')
            ) {
              this.downgradeStatusPlaceHolder =
                this.downgradedStatusBlock.dueDate;
            }
          }
        }
        if (this.findingDetails[2] && this.findingDetails[2].statusId == 1006) {
          this.findingDetails[2].dueDate = moment(this.findingDetails[2].dueDate).format('YYYY-MM-DD');
          //plan_accept_status
          this.isStatusPlanAccepted = true;

          this.findingDetails[2].statusDesc =
            this.findingService.getFindingStatusDesc(
              this.findingDetails[2].statusId
            );

          this.planAcceptedStausBlock = this.findingDetails[2];

          if (this.planAcceptedStausBlock.statusDate) {
            this.disableWholeDownGradeStatusBlock = true;
          }
          if (this.planAcceptedStausBlock.nextActionId) {
            this.isStatusVerifiedAndClosed = true;
            this.verifiedAndClosedStausBlock = {
              ORIG_SEQ_NO: this.auditSeqNo,
              currSeqNo: this.auditSeqNo,
              categoryId: this.categoryId,
              statusDate: '',
              dueDate: '',
              description: '',
              findingSeqNo: '4',
              findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
              statusId: Number(this.appConstant.VERIFIED_CLOSED),
              nextActionDesc: '',
              nextActionId: '',
              updateDescription: '',
              auditPlace: '',
              userIns: '',
              dateIns: '',
              findingRptAttachs: [],
              statusDesc: this.findingService.getFindingStatusDesc(
                Number(this.appConstant.VERIFIED_CLOSED)
              ),
            };
            console.log(
              'this.planAcceptedStausBlock =>',
              this.planAcceptedStausBlock
            );
          }
        }
        if (this.findingDetails[3] && this.findingDetails[3].statusId == 1008) {
          //verify_close_status
          this.isStatusVerifiedAndClosed = true;

          this.findingDetails[3].statusDesc =
            this.findingService.getFindingStatusDesc(
              this.findingDetails[3].statusId
            );

          this.verifiedAndClosedStausBlock = this.findingDetails[3];

          if (this.verifiedAndClosedStausBlock.statusDate) {
            this.disableWholePlanAcceptedStatusBlock = true;
          }
          if (this.verifiedAndClosedStausBlock.nextActionId) {
            if (this.verifiedAndClosedStausBlock.dueDate == 'N.A.') {
              this.verifiedClosedStatusPlaceHolder =
                this.verifiedAndClosedStausBlock.dueDate;
            }
            // this.disableWholeVerifyCloseStatusBlock = true;
          }
        }
      } else if (
        this.findingDetails[0] &&
        this.categoryId == this.appConstant.MINOR_FINDING_CATEGORY
      ) {
        console.log('ISM/ISPS/MLC type minor category Finding');

        /* only for ism and mlc minor category */

        if (
          this.auditTypeId != this.appConstant.ISPS_TYPE_ID ||
          (this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
            this.auditSubTypeId == this.appConstant.INTERMEDIATE_SUB_TYPE_ID) ||
          (this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
            this.auditSubTypeId == this.appConstant.ADDITIONAL_SUB_TYPE_ID)
        ) {
          if (
            this.findingDetails[0] &&
            this.findingDetails[0].statusId == 1001
          ) {
            if(this.findingDetails[0].dueDate != 'DURING CURRENT INSPECTION'){
            this.findingDetails[0].dueDate = moment(this.findingDetails[0].dueDate).format('YYYY-MM-DD');   
            }
            //open_status
            this.isStatusOpened = true;

            this.findingDetails[0].statusDesc =
              this.findingService.getFindingStatusDesc(
                this.findingDetails[0].statusId
              );

            this.openStatusBlock = this.findingDetails[0];
            this.planAcceptedBlockMinStatusDate =
              this.openStatusBlock.statusDate;
            if (this.openStatusBlock.nextActionId) {
              this.isStatusPlanAccepted = true;
              this.planAcceptedStausBlock = {
                ORIG_SEQ_NO: this.auditSeqNo,
                currSeqNo: this.auditSeqNo,
                categoryId: this.categoryId,
                statusDate: '',
                dueDate: '',
                description: '',
                findingSeqNo: '2',
                findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
                statusId: Number(this.appConstant.PLAN_ACCEPTED),
                nextActionDesc: '',
                nextActionId: '',
                updateDescription: '',
                auditPlace: '',
                userIns: '',
                dateIns: '',
                findingRptAttachs: [],
                statusDesc: this.findingService.getFindingStatusDesc(
                  Number(this.appConstant.PLAN_ACCEPTED)
                ),
              };
              if (
                this.openStatusBlock.dueDate == 'DURING CURRENT AUDIT' ||
                this.openStatusBlock.dueDate == 'DURING CURRENT AUDIT.' ||
                this.openStatusBlock.dueDate == 'DURING CURRENT INSPECTION' ||
                this.openStatusBlock.dueDate == 'DURING CURRENT INSPECTION.'
              ) {
                this.openStatusPlaceHolder = this.openStatusBlock.dueDate;
              }
              console.log('this.openStatusBlock =>', this.openStatusBlock);
            }
          }
          if (
            this.findingDetails[1] &&
            this.findingDetails[1].statusId == 1006
          ) {
            //plan_accept_status
            this.isStatusPlanAccepted = true;

            this.findingDetails[1].statusDesc =
              this.findingService.getFindingStatusDesc(
                this.findingDetails[1].statusId
              );

            this.planAcceptedStausBlock = this.findingDetails[1];
            if (this.planAcceptedStausBlock.statusDate) {
              this.disableWholeOpenStatusBlock = true;
            }
            if (this.planAcceptedStausBlock.nextActionId) {
              this.isStatusVerifiedAndClosed = true;
              this.verifiedAndClosedStausBlock = {
                ORIG_SEQ_NO: this.auditSeqNo,
                currSeqNo: this.auditSeqNo,
                categoryId: this.categoryId,
                statusDate: '',
                dueDate: '',
                description: '',
                findingSeqNo: '3',
                findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
                statusId: Number(this.appConstant.VERIFIED_CLOSED),
                nextActionDesc: '',
                nextActionId: '',
                updateDescription: '',
                auditPlace: '',
                userIns: '',
                dateIns: '',
                findingRptAttachs: [],
                statusDesc: this.findingService.getFindingStatusDesc(
                  Number(this.appConstant.VERIFIED_CLOSED)
                ),
              };
              if (
                this.planAcceptedStausBlock.dueDate == 'INITIAL AUDIT' ||
                this.planAcceptedStausBlock.dueDate == 'INTERMEDIATE AUDIT' ||
                this.planAcceptedStausBlock.dueDate == 'RENEWAL AUDIT' || 
                this.planAcceptedStausBlock.dueDate == 'INITIAL INSPECTION' ||
                this.planAcceptedStausBlock.dueDate == 'INTERMEDIATE INSPECTION' ||
                this.planAcceptedStausBlock.dueDate == 'RENEWAL INSPECTION'
              ) {
                this.planAcceptedPlaceholder =
                  this.planAcceptedStausBlock.dueDate;
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

            this.findingDetails[2].statusDesc =
              this.findingService.getFindingStatusDesc(
                this.findingDetails[2].statusId
              );

            this.verifiedAndClosedStausBlock = this.findingDetails[2];
            if (this.verifiedAndClosedStausBlock.statusDate) {
              this.disableWholePlanAcceptedStatusBlock = true;
            }
            if (this.verifiedAndClosedStausBlock.nextActionId) {
              // this.disableWholeVerifyCloseStatusBlock = true;
              if (this.verifiedAndClosedStausBlock.dueDate == 'N.A.') {
                this.verifiedClosedStatusPlaceHolder =
                  this.verifiedAndClosedStausBlock.dueDate;
              }
            }
          }
        } else {
          /* this block is only for isps minor category */
          /* open status */

          if (
            this.findingDetails[0] &&
            this.findingDetails[0].statusId == 1001
          ) {
            this.isStatusOpened = true;

            this.findingDetails[0].statusDesc =
              this.findingService.getFindingStatusDesc(
                this.findingDetails[0].statusId
              );

            this.openStatusBlock = this.findingDetails[0];
            if (this.openStatusBlock.nextActionId) {
              this.isStatusDowngraded = true;
              //set due date
              if (
                this.openStatusBlock.dueDate == 'DURING CURRENT AUDIT' ||
                this.openStatusBlock.dueDate == 'DURING CURRENT AUDIT.' ||
                this.openStatusBlock.dueDate == 'DURING CURRENT INSPECTION' ||
                this.openStatusBlock.dueDate == 'DURING CURRENT INSPECTION.'
              ) {
                this.openStatusPlaceHolder = this.openStatusBlock.dueDate;
              }
              // this.openStatusBlock.dueDate == 'CURRENT AUDIT' ? this.openStatusPlaceHolder = this.openStatusBlock.dueDate : '';
              this.downgradedStatusBlock = {
                ORIG_SEQ_NO: this.auditSeqNo,
                currSeqNo: this.auditSeqNo,
                categoryId: this.categoryId,
                statusDate: '',
                dueDate: '',
                description: '',
                findingSeqNo: '2',
                findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
                statusId: Number(this.appConstant.COMPLAINCE_RESTORED),
                nextActionDesc: '',
                nextActionId: '',
                updateDescription: '',
                auditPlace: '',
                userIns: '',
                dateIns: '',
                findingRptAttachs: [],
                statusDesc: this.findingService.getFindingStatusDesc(
                  Number(this.appConstant.COMPLAINCE_RESTORED)
                ),
              };
              console.log('this.openStatusBlock =>', this.openStatusBlock);
            }
          }

          /* Complience restored status*/

          if (
            this.findingDetails[1] &&
            this.findingDetails[1].statusId ==
              this.appConstant.COMPLAINCE_RESTORED
          ) {
            this.findingDetails[1].dueDate = moment(this.findingDetails[1].dueDate).format('YYYY-MM-DD');
            this.isStatusDowngraded = true;

            this.findingDetails[1].statusDesc =
              this.findingService.getFindingStatusDesc(
                this.findingDetails[1].statusId
              );

            this.downgradedStatusBlock = this.findingDetails[1];
            this.planAcceptedBlockMinStatusDate =
              this.downgradedStatusBlock.statusDate;
            if (this.downgradedStatusBlock.statusDate) {
              this.disableWholeOpenStatusBlock = true;
            }
            if (this.downgradedStatusBlock.nextActionId) {
              this.isStatusPlanAccepted = true;
              this.planAcceptedStausBlock = {
                ORIG_SEQ_NO: this.auditSeqNo,
                currSeqNo: this.auditSeqNo,
                categoryId: this.categoryId,
                statusDate: '',
                dueDate: '',
                description: '',
                findingSeqNo: '3',
                findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
                statusId: Number(this.appConstant.PLAN_ACCEPTED),
                nextActionDesc: '',
                nextActionId: '',
                updateDescription: '',
                auditPlace: '',
                userIns: '',
                dateIns: '',
                findingRptAttachs: [],
                statusDesc: this.findingService.getFindingStatusDesc(
                  Number(this.appConstant.PLAN_ACCEPTED)
                ),
              };
              console.log(
                'this.downgradedStatusBlock =>',
                this.downgradedStatusBlock
              );
              if (
                this.auditTypeId == this.appConstant.MLC_TYPE_ID &&
                (this.downgradedStatusBlock.dueDate ==
                  'DURING CURRENT AUDIT.' ||
                  this.downgradedStatusBlock.dueDate == 'DURING CURRENT AUDIT')
              ) {
                this.downgradeStatusPlaceHolder =
                  this.downgradedStatusBlock.dueDate;
              }
            }
          }

          /* Plan accepted status */

          if (
            this.findingDetails[2] &&
            this.findingDetails[2].statusId == 1006
          ) {
            this.isStatusPlanAccepted = true;

            this.findingDetails[2].statusDesc =
              this.findingService.getFindingStatusDesc(
                this.findingDetails[2].statusId
              );

            this.planAcceptedStausBlock = this.findingDetails[2];

            if (this.planAcceptedStausBlock.statusDate) {
              this.disableWholeDownGradeStatusBlock = true;
            }
            if (this.planAcceptedStausBlock.nextActionId) {
              this.isStatusVerifiedAndClosed = true;
              this.verifiedAndClosedStausBlock = {
                ORIG_SEQ_NO: this.auditSeqNo,
                currSeqNo: this.auditSeqNo,
                categoryId: this.categoryId,
                statusDate: '',
                dueDate: '',
                description: '',
                findingSeqNo: '4',
                findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
                statusId: Number(this.appConstant.VERIFIED_CLOSED),
                nextActionDesc: '',
                nextActionId: '',
                updateDescription: '',
                auditPlace: '',
                userIns: '',
                dateIns: '',
                findingRptAttachs: [],
                statusDesc: this.findingService.getFindingStatusDesc(
                  Number(this.appConstant.VERIFIED_CLOSED)
                ),
              };
              if (
                this.planAcceptedStausBlock.dueDate == 'INITIAL AUDIT' ||
                this.planAcceptedStausBlock.dueDate == 'INTERMEDIATE AUDIT' ||
                this.planAcceptedStausBlock.dueDate == 'RENEWAL AUDIT' ||
                this.planAcceptedStausBlock.dueDate == 'INTERMEDIATE INSPECTION'
              ) {
                this.planAcceptedPlaceholder =
                  this.planAcceptedStausBlock.dueDate;
              }
              console.log(
                'this.planAcceptedStausBlock =>',
                this.planAcceptedStausBlock
              );
            }
          }

          /* Verified and Closed status */

          if (
            this.findingDetails[3] &&
            this.findingDetails[3].statusId == 1008
          ) {
            this.isStatusVerifiedAndClosed = true;

            this.findingDetails[3].statusDesc =
              this.findingService.getFindingStatusDesc(
                this.findingDetails[3].statusId
              );

            this.verifiedAndClosedStausBlock = this.findingDetails[3];

            if (this.verifiedAndClosedStausBlock.statusDate) {
              this.disableWholePlanAcceptedStatusBlock = true;
            }
            if (this.verifiedAndClosedStausBlock.nextActionId) {
              if (this.verifiedAndClosedStausBlock.dueDate == 'N.A.') {
                this.verifiedClosedStatusPlaceHolder =
                  this.verifiedAndClosedStausBlock.dueDate;
              }
              // this.disableWholeVerifyCloseStatusBlock = true;
            }
          }
        }
      } else if (
        this.findingDetails[0] &&
        this.categoryId == this.appConstant.OBS_FINDING_CATEGORY
      ) {
        console.log('ISM/ISPS/MLC type OBS category Finding');
        if (this.findingDetails[0] && this.findingDetails[0].statusId == 1001) {
          //open_status
          this.isStatusOpened = true;

          this.findingDetails[0].statusDesc =
            this.findingService.getFindingStatusDesc(
              this.findingDetails[0].statusId
            );

          this.openStatusBlock = this.findingDetails[0];
          if (this.openStatusBlock.dueDate == 'N.A.') {
            this.openStatusPlaceHolder = this.openStatusBlock.dueDate;
          }
        }
      }
    } else if (this.auditTypeId == this.appConstant.DMLC_TYPE_ID) {
      if (this.findingDetails[0] && this.findingDetails[0].statusId == 1001) {
        //open_status
        this.isStatusOpened = true;

        this.findingDetails[0].statusDesc =
          this.findingService.getFindingStatusDesc(
            this.findingDetails[0].statusId
          );

        console.log('this.findingDetails[0]', this.findingDetails[0]);
        this.openStatusBlock = this.findingDetails[0];

        if (this.openStatusBlock.nextActionId) {
          this.isStatusVerifiedAndClosed = true;
          this.verifiedAndClosedStausBlock = {
            ORIG_SEQ_NO: this.auditSeqNo,
            currSeqNo: this.auditSeqNo,
            categoryId: this.categoryId,
            statusDate: '',
            dueDate: '',
            description: '',
            findingSeqNo: '2',
            findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
            statusId: Number(this.appConstant.VERIFIED_CLOSED),
            nextActionDesc: '',
            nextActionId: '',
            updateDescription: '',
            auditPlace: '',
            userIns: '',
            dateIns: '',
            updateFlag: true,
            findingRptAttachs: [],
            statusDesc: this.findingService.getFindingStatusDesc(
              Number(this.appConstant.VERIFIED_CLOSED)
            ),
          };
          if (
            this.openStatusBlock.dueDate == 'DURING NEXT SCHEDULED INSPECTION.'
          ) {
            this.openStatusPlaceHolder = this.openStatusBlock.dueDate;
          }
          console.log('this.openStatusBlock =>', this.openStatusBlock);
        }
      }
      if (this.findingDetails[1] && this.findingDetails[1].statusId == 1008) {
        //verify_close_status
        this.isStatusVerifiedAndClosed = true;

        this.findingDetails[1].statusDesc =
          this.findingService.getFindingStatusDesc(
            this.findingDetails[1].statusId
          );
        this.verifiedAndClosedStausBlock = this.findingDetails[1];
        if (this.verifiedAndClosedStausBlock.statusDate) {
          this.disableWholeOpenStatusBlock = true;
        }
        if (this.verifiedAndClosedStausBlock.nextActionId) {
          if (this.verifiedAndClosedStausBlock.dueDate == 'N.A.') {
            this.verifiedClosedStatusPlaceHolder =
              this.verifiedAndClosedStausBlock.dueDate;
          }
          // this.disableWholeVerifyCloseStatusBlock = true;
        }
      }
    }

    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log('isStatusOpened = ', this.isStatusOpened);
    console.log('isStatusDowngraded = ', this.isStatusDowngraded);
    console.log('isStatusPlanAccepted = ', this.isStatusPlanAccepted);
    console.log('isStatusVerifiedAndClosed = ', this.isStatusVerifiedAndClosed);
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    this.setDisableNxtActionArrays();
    this.initializeFindingDetailBlocks();
    // });
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
    this.db
      .getFindingsCategory(this.auditTypeId, this.categoryId)
      .then((findingCategory: any) => {
        this.categoryDesc = findingCategory;
      });
    this.setMaxDueDates(
      this.dataFromFindingListScreen.auditInfo.closeMeetingDate
    );

    //this.initializeFindingDetailBlocks();
  }

  setMaxDueDates(closeMeetingDate) {
    console.log('DueDate maxDate setting starts here..');
    console.log('CloseMeetingDate', closeMeetingDate);
    /** changed by archana for Jira Id-Mobile-820 start */
    if (
      (this.auditTypeId == this.appConstant.ISM_TYPE_ID ||
        this.appConstant.ISPS_TYPE_ID || this.appConstant.MLC_TYPE_ID) &&
      this.categoryId == this.appConstant.MAJOR_FINDING_CATEGORY
    ) {
      console.log('audit Type : ISM/ISPS', 'category : Major');
      // this.openStatusMaxDueDate = this.findingService.addDays(
      //   closeMeetingDate,
      //   29
      // );
      this.downgradStatusMaxDueDate = this.findingService.addDays(
        closeMeetingDate,
        30
      );
    
      this.planAcceptedStatusMaxDueDate = this.findingService.addDays(
        closeMeetingDate,
        90
      );
   } else if (
      this.auditTypeId == this.appConstant.ISM_TYPE_ID &&
      this.categoryId == this.appConstant.MINOR_FINDING_CATEGORY
    ) {
      console.log('audit Type : ISM', 'category : Minor');
      this.openStatusMaxDueDate = this.findingService.addDays(
        closeMeetingDate,
        30
      );
      this.planAcceptedStatusMaxDueDate = this.findingService.addDays(
        closeMeetingDate,
        90
      );
      console.log('this.openStatusMaxDueDate', this.openStatusMaxDueDate);
    }

  else  if (
      this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
      this.categoryId == this.appConstant.MINOR_FINDING_CATEGORY && 
      (this.auditSubTypeId != this.appConstant.INTERMEDIATE_SUB_TYPE_ID &&
        this.auditSubTypeId != this.appConstant.ADDITIONAL_SUB_TYPE_ID)
    ) {
      this.downgradStatusMaxDueDate = this.findingService.addDays(
        closeMeetingDate,
        30
      );

      this.planAcceptedStatusMaxDueDate = this.findingService.addDays(
        closeMeetingDate,
        90
      );
     
    } else if( this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
      this.categoryId == this.appConstant.MINOR_FINDING_CATEGORY && 
      (this.auditSubTypeId == this.appConstant.INTERMEDIATE_SUB_TYPE_ID ||
        this.auditSubTypeId == this.appConstant.ADDITIONAL_SUB_TYPE_ID)
        ){
      this.openStatusMaxDueDate = this.findingService.addDays(
        closeMeetingDate,
        30
      );
      this.planAcceptedStatusMaxDueDate = this.findingService.addDays(
        closeMeetingDate,
        90
      );

    }

 else if (
      this.auditTypeId == this.appConstant.MLC_TYPE_ID &&
      this.categoryId == this.appConstant.MINOR_FINDING_CATEGORY
    ) { 
      this.openStatusMaxDueDate = this.findingService.addDays(
        closeMeetingDate,
        30
      );
      this.planAcceptedStatusMaxDueDate = this.findingService.addDays(
        closeMeetingDate,
        90
      );
    }
   /**added by archana for jira Id-MOBILE-853 start */
    if(this.auditTypeId == this.appConstant.DMLC_TYPE_ID){
      this.openStatusMaxDueDate = this.findingService.addDays(
        this.minDueDate,
        90
      );
    }
    /**added by archana for jira Id-MOBILE-853 end */

    /** changed by archana for Jira Id-Mobile-820 end */
    /*    this.openStatusMaxDueDate;
       this.downgradStatusMaxDueDate;
       this.planAcceptedStatusMaxDueDate;
       this.verifyCloseStatusMaxDueDate; */
    console.log('DueDate maxDate setting ends here..');
  }

  /*  addDays(date, daysNumber) {
    // return (new Date(date.getFullYear(), date.getMonth(), date.getDate() + daysNumber).toISOString());
    return new Date(moment(date).add(daysNumber, 'days').toString());
  } */

  initializeFindingDetailBlocks() {
    this.findingDetails.forEach((findingDetail, i) => {
      /**changed by archana for jira-Id-MOBILE-832 start */
      this.findingDetails[i].nextActionDesc =
        findingDetail.nextActionId != ''
        ?((this.dataFromFindingListScreen.findingStatusList.filter(
          (res) => res.FINDINGS_STATUS_ID === findingDetail.nextActionId
        )[0].FINDINGS_STATUS_DESC) == 'VERIFIED /CLOSED'? 'VERIFY / CLOSE':
        (this.dataFromFindingListScreen.findingStatusList.filter(
          (res) => res.FINDINGS_STATUS_ID === findingDetail.nextActionId
        )[0].FINDINGS_STATUS_DESC) )
          : '';
          /**changed by archana for jira-Id-MOBILE-832 end */
    });
    //this.setDisableNxtActionArrays();
  }

  setDisableNxtActionArrays() {
    if (
      this.auditTypeId == this.appConstant.ISM_TYPE_ID ||
      this.auditTypeId == this.appConstant.ISPS_TYPE_ID ||
      this.auditTypeId == this.appConstant.MLC_TYPE_ID
    ) {
      switch (this.categoryId) {
        case this.appConstant.MAJOR_FINDING_CATEGORY:
          {
            this.nxtActionDisableArrayOfOpenStatus =
              this.findingStatusList.filter((res) => {
              //condisions modified by lokesh for jira_id(679) START HERE
                if (this.auditTypeId === this.appConstant.ISM_TYPE_ID)
                  return   this.openStatusBlock.nextActionDesc!=''||null?res != 'DOWNGRADE'&& res != 'PREVIOUS STATUS':res != 'DOWNGRADE'
                else if (this.auditTypeId === this.appConstant.ISPS_TYPE_ID)
                  return (
                      this.openStatusBlock.nextActionDesc!=''||null? res != 'DOWNGRADE (RESTORE COMPLIANCE)'&& res != 'PREVIOUS STATUS': res != 'DOWNGRADE (RESTORE COMPLIANCE)' );
                else if (this.auditTypeId === this.appConstant.MLC_TYPE_ID)
                  return (
                      this.openStatusBlock.nextActionDesc!=''||null?res != 'DOWNGRADE (RECTIFY)'&& res != 'PREVIOUS STATUS':res != 'DOWNGRADE (RECTIFY)' 
                  );
              });
              //condisions modified by lokesh for jira_id(679) END HERE

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
        /* Minor category */
        case this.appConstant.MINOR_FINDING_CATEGORY:
          if (
            this.auditTypeId != this.appConstant.ISPS_TYPE_ID ||
            (this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
              this.auditSubTypeId ==
                this.appConstant.INTERMEDIATE_SUB_TYPE_ID) ||
            (this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
              this.auditSubTypeId == this.appConstant.ADDITIONAL_SUB_TYPE_ID)
          ) {
            this.nxtActionDisableArrayOfOpenStatus =
              this.findingStatusList.filter((res) => {
                return  this.openStatusBlock.nextActionDesc!=''||null?res != 'PLAN ACCEPTED' && res != 'PREVIOUS STATUS':res != 'PLAN ACCEPTED' //condisions modified by lokesh for jira_id(679) 
              });
            this.nxtActionDisableArrayOfPlanAcceptedStatus =
              this.findingStatusList.filter((res) => {
                return res != 'VERIFY / CLOSE' && res != 'PREVIOUS STATUS';
              });
            this.nxtActionDisableArrayOfVerifyCloseStatus =
              this.findingStatusList.filter((res) => {
                return res != 'NIL' && res != 'PREVIOUS STATUS';
              });
          } else {
            this.nxtActionDisableArrayOfOpenStatus =
              this.findingStatusList.filter((res) => {
                return this.openStatusBlock.nextActionDesc!=''||null?res != 'RESTORE COMPLIANCE' && res != 'PREVIOUS STATUS':res != 'RESTORE COMPLIANCE' //condisions modified by lokesh for jira_id(679) END HERE
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

        case this.appConstant.OBS_FINDING_CATEGORY:
          {
            this.nxtActionDisableArrayOfOpenStatus =
              this.findingStatusList.filter((res) => {
                return this.openStatusBlock.nextActionDesc!=''||null? res != 'NIL' && res != 'PREVIOUS STATUS' : res != 'NIL';
              });
          }
          break;

        default:
          break;
      }
    } else if (this.auditTypeId == this.appConstant.DMLC_TYPE_ID) {
      this.nxtActionDisableArrayOfOpenStatus = this.findingStatusList.filter(
        (res) => {
          return this.openStatusBlock.nextActionDesc!=''||null?res != 'VERIFY / CLOSE' && res != 'PREVIOUS STATUS':res != 'VERIFY / CLOSE' //condisions modified by lokesh for jira_id(679) END HERE
        }
      );
      this.nxtActionDisableArrayOfVerifyCloseStatus =
        this.findingStatusList.filter((res) => {
          return res != 'NIL' && res != 'PREVIOUS STATUS';
        });
    }
  }

  NxtActionChange(event, currentBlock) {
    if (
      this.auditTypeId == this.appConstant.ISM_TYPE_ID ||
      this.auditTypeId == this.appConstant.ISPS_TYPE_ID ||
      this.auditTypeId == this.appConstant.MLC_TYPE_ID
    ) {
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
  // under PREVIOUS STATUS event 'findingRptAttachs = []'added by archana for jira Id-MOBILE-870
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
            findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
            statusId: Number(this.appConstant.DOWNGRADED),
            nextActionDesc: '',
            nextActionId: '',
            updateDescription: '',
            auditPlace: '',
            userIns: '',
            dateIns: '',
            findingRptAttachs: [],
            statusDesc: this.findingService.getFindingStatusDesc(
              Number(this.appConstant.DOWNGRADED)
            ),
          };
          this.isStatusDowngraded = true;
          //this.openStatusBlock.dueDate = 'Current Audit';
          //this.openStatusBlock.statusId = Number(this.appConstant.OPEN);
          this.openStatusBlock.nextActionId = this.appConstant.DOWNGRADE;
          console.log(this.isStatusDowngraded);
          if (
            this.auditTypeId == this.appConstant.ISM_TYPE_ID &&
           ( this.openStatusBlock.dueDate === '' || !this.openStatusBlock.dueDate) 
          ) {
            this.openStatusPlaceHolder = 'CURRENT AUDIT';
          } else if (
            this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
           (this.openStatusBlock.dueDate === '' || !this.openStatusBlock.dueDate)
          ) {
            this.openStatusPlaceHolder = 'DURING CURRENT AUDIT';
          } else if (
            this.auditTypeId == this.appConstant.MLC_TYPE_ID &&
            (this.openStatusBlock.dueDate === '' || !this.openStatusBlock.dueDate)
          ) {
            this.openStatusPlaceHolder = 'CURRENT INSPECTION';
          }
        }
        //added  by lokesh for jira_id(679) Start HERE
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
                  else if (this.auditTypeId == this.appConstant.DMLC_TYPE_ID) {
                    this.nxtActionDisableArrayOfOpenStatus = this.findingStatusList.filter(
                      (res) => {
                        return res != 'VERIFY / CLOSE' && res != 'PREVIOUS STATUS'
                      }
                    );
                  }
              });
                   //added  by lokesh for jira_id(679) end here
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

          if (
            this.auditTypeId == this.appConstant.MLC_TYPE_ID &&
            this.downgradedStatusBlock.dueDate === ''
          ) {
            this.downgradeStatusPlaceHolder = 'DURING CURRENT INSPECTION';
          }
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
            findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
            statusId: Number(this.appConstant.PLAN_ACCEPTED),
            nextActionDesc: '',
            nextActionId: '',
            updateDescription: '',
            auditPlace: '',
            userIns: '',
            dateIns: '',
            findingRptAttachs: [],
            statusDesc: this.findingService.getFindingStatusDesc(
              Number(this.appConstant.PLAN_ACCEPTED)
            ),
          };
        }
        /** added by archana for Jira Id-Mobile-820 start */
        if (
          this.auditTypeId == this.appConstant.ISM_TYPE_ID &&
          (this.downgradedStatusBlock.dueDate === '' || !this.downgradedStatusBlock.dueDate)
        ) {
           this.downgradeStatusPlaceHolder = moment(this.findingService.addDays(
            this.dataFromFindingListScreen.auditInfo.closeMeetingDate,
            30
          )).format('DD-MMM-YYYY');
        } else if (
          this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
          (this.downgradedStatusBlock.dueDate === '' || !this.downgradedStatusBlock.dueDate)
        ) {
          this.downgradeStatusPlaceHolder = moment(this.findingService.addDays(
            this.dataFromFindingListScreen.auditInfo.closeMeetingDate,
            30
          )).format('DD-MMM-YYYY');
        } else if (
          this.auditTypeId == this.appConstant.MLC_TYPE_ID &&
          (this.downgradedStatusBlock.dueDate === '' || !this.downgradedStatusBlock.dueDate)
        ) {
          this.downgradeStatusPlaceHolder = 'DURING CURRENT INSPECTION';
        }

        
         if(currentBlock=='downgrade' && this.openStatusBlock.dueDate == '' && this.openStatusPlaceHolder == '' && event.value != 'PREVIOUS STATUS'){
          this.toast.presentToast('Please select Due Date for DOWNGRADE', 'danger');
          this.disableWholeOpenStatusBlock = false;
          this.isStatusPlanAccepted = false;
          this.downgradedStatusBlock.nextActionDesc = ' ';
          this.downgradedStatusBlock.dueDate = '';
          this.downgradedStatusBlock.nextActionId = '';
          this.downgradedStatusBlock.description = '';
          this.downgradedStatusBlock.statusDate = '';
          this.downgradeStatusPlaceHolder = '';
          this.downgradedStatusBlock.findingRptAttachs = [];
          //enable previous block
          this.isOpenStatusStatusDateDisabled = false;
          this.isOpenStatusDueDateDisabled = false;
          this.isOpenStatusDescriptionDisabled = false;
        }
         /** added by archana for Jira Id-Mobile-820 end */
        if (event.value == 'PREVIOUS STATUS') {
          this.disableWholeOpenStatusBlock = false;
          this.isStatusPlanAccepted = false;

          //clear fields
          this.downgradedStatusBlock.nextActionDesc = ' ';
          this.downgradedStatusBlock.dueDate = '';
          this.downgradedStatusBlock.nextActionId = '';
          this.downgradedStatusBlock.description = '';
          this.downgradedStatusBlock.statusDate = '';
          this.downgradeStatusPlaceHolder = '';
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
          this.planAcceptedStausBlock.statusId = Number(
            this.appConstant.PLAN_ACCEPTED
          );
          this.planAcceptedStausBlock.nextActionId =
            this.appConstant.VERIFY_CLOSE;                              //changed by archana for jira ID-MOBILE-916
          this.disableWholeDownGradeStatusBlock = true;
          this.isStatusVerifiedAndClosed = true;
          this.verifiedAndClosedStausBlock = {
            ORIG_SEQ_NO: this.auditSeqNo,
            currSeqNo: this.auditSeqNo,
            categoryId: this.categoryId,
            statusDate: '',
            dueDate: '',
            description: '',
            findingSeqNo: '4',
            findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
            statusId: Number(this.appConstant.VERIFIED_CLOSED),
            nextActionDesc: '',
            nextActionId: '',
            updateDescription: '',
            auditPlace: '',
            userIns: '',
            dateIns: '',
            findingRptAttachs: [],
            statusDesc: this.findingService.getFindingStatusDesc(
              Number(this.appConstant.VERIFIED_CLOSED)
            ),
          };
        }
         /** added by archana for Jira Id-Mobile-820 start */
        if (
          this.auditTypeId == this.appConstant.ISM_TYPE_ID &&
          (this.planAcceptedStausBlock.dueDate === '' || !this.planAcceptedStausBlock.dueDate)
        ) {
           this.planAcceptedPlaceholder = moment(this.findingService.addDays(
            this.dataFromFindingListScreen.auditInfo.closeMeetingDate,
            90
          )).format('DD-MMM-YYYY');
        } else if (
          this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
          (this.planAcceptedStausBlock.dueDate === '' || !this.planAcceptedStausBlock.dueDate)
        ) {
          this.planAcceptedPlaceholder = moment(this.findingService.addDays(
            this.dataFromFindingListScreen.auditInfo.closeMeetingDate,
            90
          )).format('DD-MMM-YYYY');
        } else if (
          this.auditTypeId == this.appConstant.MLC_TYPE_ID &&
          (this.planAcceptedStausBlock.dueDate === '' || !this.planAcceptedStausBlock.dueDate)
        ) {
          this.planAcceptedPlaceholder = moment(this.findingService.addDays(
            this.dataFromFindingListScreen.auditInfo.closeMeetingDate,
            90
          )).format('DD-MMM-YYYY');
        }
        
         if(currentBlock=='planAccept' && this.downgradedStatusBlock.dueDate == '' && this.downgradeStatusPlaceHolder == '' && event.value != 'PREVIOUS STATUS'){
          this.toast.presentToast('Please select Due Date for PLAN ACCEPTED', 'danger');
          this.disableWholeDownGradeStatusBlock = false;
          this.isStatusVerifiedAndClosed = false;

          this.planAcceptedStausBlock.nextActionDesc = ' ';
          this.planAcceptedStausBlock.statusDate = '';
          this.planAcceptedStausBlock.dueDate = '';
          this.planAcceptedStausBlock.nextActionId = '';
          this.planAcceptedStausBlock.description = '';
          this.planAcceptedPlaceholder = '';
          this.planAcceptedStausBlock.findingRptAttachs = [];
         //enable previous block
          this.isDowngradedStatusStatusDateDisabled = false;
          this.isDowngradedStatusDueDateDisabled = false;
          this.isDowngradedStatusDescriptionDisabled = false;
         }
          /** added by archana for Jira Id-Mobile-820 end */
        if (event.value == 'PREVIOUS STATUS') {
          this.disableWholeDownGradeStatusBlock = false;
          this.isStatusVerifiedAndClosed = false;

          this.planAcceptedStausBlock.nextActionDesc = '';
          this.planAcceptedStausBlock.statusDate = '';
          this.planAcceptedStausBlock.dueDate = '';
          this.planAcceptedStausBlock.nextActionId = '';
          this.planAcceptedStausBlock.description = '';
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
          this.verifiedAndClosedStausBlock.statusId = Number(
            this.appConstant.VERIFIED_CLOSED
          );
          this.verifiedAndClosedStausBlock.nextActionId = this.appConstant.NIL;
          console.log('verified and closed value is nil');
          this.isStatusNil = true;
          this.disableWholePlanAcceptedStatusBlock = true;
         (this.verifiedAndClosedStausBlock.dueDate == '' || !this.planAcceptedStausBlock.dueDate)
            ? (this.verifiedClosedStatusPlaceHolder = 'N.A.')
            : '';
        } else if ('PREVIOUS STATUS') {
          console.log('Previous status of verify closed');
          this.disableWholePlanAcceptedStatusBlock = false;

          this.verifiedAndClosedStausBlock.statusDate = '';
          this.verifiedAndClosedStausBlock.dueDate = '';
          this.verifiedAndClosedStausBlock.nextActionId = '';
          this.verifiedAndClosedStausBlock.nextActionDesc = ' '; //added by lokesh for jira_id(587)
          this.verifiedAndClosedStausBlock.description = '';
          this.verifiedClosedStatusPlaceHolder = '';
          this.verifiedAndClosedStausBlock.findingRptAttachs = [];

          //enable previous block
          this.isPlanAcceptedStatusDueDateDisabled = false; // added by archana for jira id-MOBILE-421
          this.isPlanAcceptedStatusStatusDateDisabled = false;
          this.isOpenStatusDueDateDisabled = false;
          this.isPlanAcceptedStatusDescriptionDisabled = false;
        }
        if(currentBlock=='verifyClose' && this.planAcceptedStausBlock.dueDate == '' && this.planAcceptedPlaceholder == '' && event.value != 'PREVIOUS STATUS'){
          this.toast.presentToast('Please select Due Date for VERIFY / CLOSE', 'danger');
          this.disableWholePlanAcceptedStatusBlock = false;

          this.verifiedAndClosedStausBlock.statusDate = '';
          this.verifiedAndClosedStausBlock.dueDate = '';
          this.verifiedAndClosedStausBlock.nextActionId = '';
          this.verifiedAndClosedStausBlock.nextActionDesc = ' '; 
          this.verifiedAndClosedStausBlock.description = '';
          this.verifiedClosedStatusPlaceHolder = '';
          this.verifiedAndClosedStausBlock.findingRptAttachs = [];

          //enable previous block
          this.isPlanAcceptedStatusDueDateDisabled = false; 
          this.isPlanAcceptedStatusStatusDateDisabled = false;
          this.isOpenStatusDueDateDisabled = false;
          this.isPlanAcceptedStatusDescriptionDisabled = false;
        }
        break;

      default:
        break;
    }
  }

  //ism/isps/mlc minor type next Action on change
  nextActionChangeMinorCategory(event, currentBlock) {
    if (
      this.auditTypeId != this.appConstant.ISPS_TYPE_ID ||
      (this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
        this.auditSubTypeId == this.appConstant.INTERMEDIATE_SUB_TYPE_ID) ||
      (this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
        this.auditSubTypeId == this.appConstant.ADDITIONAL_SUB_TYPE_ID)
    ) {
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
              findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
              statusId: Number(this.appConstant.PLAN_ACCEPTED),
              nextActionDesc: '',
              nextActionId: '',
              updateDescription: '',
              auditPlace: '',
              userIns: '',
              dateIns: '',
              findingRptAttachs: [],
              statusDesc: this.findingService.getFindingStatusDesc(
                Number(this.appConstant.PLAN_ACCEPTED)
              ),
            };

            this.openStatusBlock.nextActionId = this.appConstant.PLAN_ACCEPTED;
            /** added by archana for Jira Id-Mobile-820 start */
            if(this.openStatusBlock.dueDate == 'Invalid date'){
              this.openStatusBlock.dueDate = '';
            }
            
            /* only for ism */
            if (
              this.auditTypeId == this.appConstant.ISM_TYPE_ID &&
              (!this.openStatusBlock.dueDate || this.openStatusBlock.dueDate === '' || this.openStatusBlock.dueDate == 'Invalid date')
            ) { 
              this.openStatusPlaceHolder = moment(this.findingService.addDays(
                this.dataFromFindingListScreen.auditInfo.closeMeetingDate,
                30
              )).format('DD-MMM-YYYY');
              if(this.openStatusBlock.dueDate == 'Invalid date'){
                this.openStatusBlock.dueDate = '';
              }
            }
            /* only for isps */
             else if (
              this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
              (this.openStatusBlock.dueDate === '' || this.openStatusBlock.dueDate == 'Invalid date' || !this.openStatusBlock.dueDate)
            ) {
              this.openStatusPlaceHolder = moment(this.findingService.addDays(
                this.dataFromFindingListScreen.auditInfo.closeMeetingDate,
                30
              )).format('DD-MMM-YYYY');
              /* only for mlc */
            } else if (
              this.auditTypeId == this.appConstant.MLC_TYPE_ID &&
              (this.openStatusBlock.dueDate === '' || !this.openStatusBlock.dueDate)
            ) {
              this.openStatusPlaceHolder = 'DURING CURRENT INSPECTION';
            }
             /** added by archana for Jira Id-Mobile-820 end */
          }

          this.nxtActionDisableArrayOfOpenStatus =
          this.findingStatusList.filter((res) => {
            if (this.auditTypeId === this.appConstant.ISM_TYPE_ID)
              return res != 'PLAN ACCEPTED' && res != 'PREVIOUS STATUS';
            else if (this.auditTypeId === this.appConstant.ISPS_TYPE_ID)
              return (
                res != 'PLAN ACCEPTED' &&
                res != 'PREVIOUS STATUS'
              );
            else if (this.auditTypeId === this.appConstant.MLC_TYPE_ID)
              return (
                res != 'PLAN ACCEPTED' && res != 'PREVIOUS STATUS'
              );
         });
          if (event.value == 'PREVIOUS STATUS') {
            //clear fields
            this.openStatusBlock.statusDate = '';
            this.openStatusBlock.dueDate = '';
            this.openStatusBlock.nextActionId = '';
            this.openStatusBlock.nextActionDesc = ' ';
            this.openStatusBlock.description = '';
            this.isStatusPlanAccepted = false;
            this.openStatusBlock.nextActionId = '';
            this.openStatusPlaceHolder = '';
            this.openStatusBlock.findingRptAttachs = [];

          }
          break;

        case 'planAccept':
          console.log(event.value);
          if (event.value == 'VERIFY / CLOSE') {
            this.disableWholeOpenStatusBlock = true;
            this.isStatusVerifiedAndClosed = true;
            this.verifiedAndClosedStausBlock = {
              ORIG_SEQ_NO: this.auditSeqNo,
              currSeqNo: this.auditSeqNo,
              categoryId: this.categoryId,
              statusDate: '',
              dueDate: '',
              description: '',
              findingSeqNo: '3',
              findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
              statusId: Number(this.appConstant.VERIFIED_CLOSED),
              nextActionDesc: '',
              nextActionId: '',
              updateDescription: '',
              auditPlace: '',
              userIns: '',
              dateIns: '',
              findingRptAttachs: [],
              statusDesc: this.findingService.getFindingStatusDesc(
                Number(this.appConstant.VERIFIED_CLOSED)
              ),
            };
            this.planAcceptedStausBlock.nextActionId =
              this.appConstant.VERIFY_CLOSE;                        //changed by archana for jira ID-MOBILE-916
            if (
              this.auditTypeId == this.appConstant.ISM_TYPE_ID &&
              (this.planAcceptedStausBlock.dueDate === '' || !this.planAcceptedStausBlock.dueDate)
            ) {

              if(this.auditSubTypeId == this.appConstant.INTERIM_SUB_TYPE_ID ){
                this.planAcceptedPlaceholder = 'INITIAL AUDIT';
              } else if(this.auditSubTypeId == this.appConstant.INITIAL_SUB_TYPE_ID){
                this.planAcceptedPlaceholder = 'INTERMEDIATE AUDIT';
              } else if(this.auditSubTypeId == this.appConstant.INTERMEDIATE_SUB_TYPE_ID){
                this.planAcceptedPlaceholder = 'RENEWAL AUDIT';
              } else if(this.auditSubTypeId == this.appConstant.RENEWAL_SUB_TYPE_ID ){
                this.planAcceptedPlaceholder = 'INTERMEDIATE AUDIT';
              } else if(this.auditSubTypeId == this.appConstant.ADDITIONAL_SUB_TYPE_ID){
                this.planAcceptedPlaceholder = 'INTERMEDIATE AUDIT';
              }
              
              } 
            
            if (
              this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
              (this.planAcceptedStausBlock.dueDate === '' || !this.planAcceptedStausBlock.dueDate)
            ) {
              if(this.auditSubTypeId == this.appConstant.INTERMEDIATE_SUB_TYPE_ID){
                this.planAcceptedPlaceholder = 'RENEWAL AUDIT';
              } else if(this.auditSubTypeId == this.appConstant.ADDITIONAL_SUB_TYPE_ID){
                this.planAcceptedPlaceholder = 'INTERMEDIATE AUDIT';
              }
            }

            if (
              this.auditTypeId == this.appConstant.MLC_TYPE_ID &&
              (this.planAcceptedStausBlock.dueDate === '' || !this.planAcceptedStausBlock.dueDate)
            ) {
              if(this.auditSubTypeId == this.appConstant.INTERIM_SUB_TYPE_ID ){
                this.planAcceptedPlaceholder = 'INITIAL INSPECTION';
              } else if(this.auditSubTypeId == this.appConstant.INITIAL_SUB_TYPE_ID){
                this.planAcceptedPlaceholder = 'INTERMEDIATE INSPECTION';
              } else if(this.auditSubTypeId == this.appConstant.INTERMEDIATE_SUB_TYPE_ID){
                this.planAcceptedPlaceholder = 'RENEWAL INSPECTION';
              } else if(this.auditSubTypeId == this.appConstant.RENEWAL_SUB_TYPE_ID ){
                this.planAcceptedPlaceholder = 'INTERMEDIATE INSPECTION';
              } else if(this.auditSubTypeId == this.appConstant.ADDITIONAL_SUB_TYPE_ID){
                this.planAcceptedPlaceholder = 'INTERMEDIATE INSPECTION';
              }
            }

            // else if (
            //   this.dataFromFindingListScreen.auditInfo.auditSubType=="INTERMEDIATE"
            // ) {
            //   this.planAcceptedPlaceholder = 'RENEWAL '+this.dataFromFindingListScreen.auditInfo.auditType .toUpperCase();
            // } else if( this.dataFromFindingListScreen.auditInfo.auditSubType=="INTERIM"){
            //   this.planAcceptedPlaceholder = 'INITIAL '+this.dataFromFindingListScreen.auditInfo.auditType .toUpperCase();
            // }
            // else {
            //   this.planAcceptedPlaceholder = 'INTERMEDIATE '+this.dataFromFindingListScreen.auditInfo.auditType .toUpperCase();
            // }/**condisions changed by lokesh for jira_id(728,727) END HERE */
          }
          if(currentBlock=='planAccept' && this.openStatusBlock.dueDate == '' && this.openStatusPlaceHolder == '' && event.value != 'PREVIOUS STATUS'){
            this.toast.presentToast('Please select Due Date for PLAN ACCEPTED', 'danger');
            this.disableWholeOpenStatusBlock = false;
            this.isStatusVerifiedAndClosed = false;

            this.planAcceptedStausBlock.statusDate = ' ';
            this.planAcceptedStausBlock.dueDate = '';
            this.planAcceptedStausBlock.nextActionId = '';
            this.planAcceptedStausBlock.nextActionDesc = ' ';
            this.planAcceptedStausBlock.nextActionId = '';
            this.planAcceptedStausBlock.description = '';
            this.planAcceptedStausBlock.findingRptAttachs = [];

            this.planAcceptedPlaceholder = '';
            //enable previous block
            this.isOpenStatusStatusDateDisabled = false;
            this.isOpenStatusDueDateDisabled = false;
            this.isOpenStatusDescriptionDisabled = false;
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
            this.planAcceptedStausBlock.findingRptAttachs = [];

            this.planAcceptedPlaceholder = '';
            //enable previous block
            this.isOpenStatusStatusDateDisabled = false;
            this.isOpenStatusDueDateDisabled = false;
            this.isOpenStatusDescriptionDisabled = false;
          }
          break;
        case 'verifyClose':
          console.log(event.value);
          if (event.value == 'NIL') {
            console.log('verified and closed value is nil');
            this.isStatusNil = true;
            this.disableWholePlanAcceptedStatusBlock = true;
            this.verifiedAndClosedStausBlock.nextActionId =
              this.appConstant.NIL;
            (this.verifiedAndClosedStausBlock.dueDate == '' || !this.verifiedAndClosedStausBlock.dueDate)
              ? (this.verifiedClosedStatusPlaceHolder = 'N.A.')
              : '';
          } else if ('PREVIOUS STATUS') {
            console.log('Previous status of verify closed');
            this.disableWholePlanAcceptedStatusBlock = false;

            this.verifiedAndClosedStausBlock.statusDate = '';
            this.verifiedClosedStatusPlaceHolder = '';
            this.verifiedAndClosedStausBlock.dueDate = '';
            this.verifiedAndClosedStausBlock.nextActionId = '';
            this.verifiedAndClosedStausBlock.nextActionDesc = ' '; //added by lokesh for jira_id(587)
            this.verifiedAndClosedStausBlock.description = '';
            this.verifiedAndClosedStausBlock.findingRptAttachs = [];


            //enable previous block
            this.isPlanAcceptedStatusStatusDateDisabled = false;
            // this.isOpenStatusDueDateDisabled = false;
            this.isPlanAcceptedStatusDueDateDisabled = false;
            this.isPlanAcceptedStatusDescriptionDisabled = false;
          }
          /**added by archana for jira ID-MOBILE-820 start*/
          if(currentBlock=='verifyClose' && this.planAcceptedStausBlock.dueDate == '' && this.planAcceptedPlaceholder == '' && event.value != 'PREVIOUS STATUS'){
            this.toast.presentToast('Please select Due Date for VERIFY / CLOSE', 'danger');
            this.disableWholePlanAcceptedStatusBlock = false;

            this.verifiedAndClosedStausBlock.statusDate = '';
            this.verifiedClosedStatusPlaceHolder = '';
            this.verifiedAndClosedStausBlock.dueDate = '';
            this.verifiedAndClosedStausBlock.nextActionId = '';
            this.verifiedAndClosedStausBlock.nextActionDesc = ' '; 
            this.verifiedAndClosedStausBlock.description = '';
            this.verifiedAndClosedStausBlock.findingRptAttachs = [];

            //enable previous block
            this.isPlanAcceptedStatusStatusDateDisabled = false;
            this.isPlanAcceptedStatusDueDateDisabled = false;
            this.isPlanAcceptedStatusDescriptionDisabled = false;
          }
          /**added by archana for jira ID-MOBILE-820 end*/
          break;
        default:
          break;
      }
    } else {
      switch (currentBlock) {
        case 'open':
          console.log(event.value);
          if (event.value == 'RESTORE COMPLIANCE') {
            this.downgradedStatusBlock = {
              ORIG_SEQ_NO: this.auditSeqNo,
              currSeqNo: this.auditSeqNo,
              categoryId: this.categoryId,
              statusDate: '',
              dueDate: '',
              description: '',
              findingSeqNo: '2',
              findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
              statusId: Number(this.appConstant.COMPLAINCE_RESTORED),
              nextActionDesc: '',
              nextActionId: '',
              updateDescription: '',
              auditPlace: '',
              userIns: '',
              dateIns: '',
              findingRptAttachs: [],
              statusDesc: this.findingService.getFindingStatusDesc(
                Number(this.appConstant.COMPLAINCE_RESTORED)
              ),
            };
            this.isStatusDowngraded = true;
            //this.openStatusBlock.dueDate = 'Current Audit';
            //this.openStatusBlock.statusId = Number(this.appConstant.OPEN);
            this.openStatusBlock.nextActionId = this.appConstant.RESTORE_COMPLAINCE;           //changed by archana for jira-ID-MOBILE-888
            console.log(this.isStatusDowngraded);
            if (this.openStatusBlock.dueDate === '' || !this.openStatusBlock.dueDate) {
              this.openStatusPlaceHolder = 'DURING CURRENT AUDIT';
            }
          }

          this.nxtActionDisableArrayOfOpenStatus =
          this.findingStatusList.filter((res) => {
            if (this.auditTypeId === this.appConstant.ISPS_TYPE_ID)
              return (
                res != 'RESTORE COMPLIANCE' &&
                res != 'PREVIOUS STATUS'
              );
            
         });
          
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
              findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
              statusId: Number(this.appConstant.PLAN_ACCEPTED),
              nextActionDesc: '',
              nextActionId: '',
              updateDescription: '',
              auditPlace: '',
              userIns: '',
              dateIns: '',
              findingRptAttachs: [],
              statusDesc: this.findingService.getFindingStatusDesc(
                Number(this.appConstant.PLAN_ACCEPTED)
              ),
            };
          }

          if (
            this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
            (this.downgradedStatusBlock.dueDate === '' || !this.downgradedStatusBlock.dueDate)
          ) { 
            this.downgradeStatusPlaceHolder = moment(this.findingService.addDays(
              this.dataFromFindingListScreen.auditInfo.closeMeetingDate,
              30
            )).format('DD-MMM-YYYY');
          
          }
          if (event.value == 'PREVIOUS STATUS') {
            this.disableWholeOpenStatusBlock = false;
            this.isStatusPlanAccepted = false;

            //clear fields
            this.downgradedStatusBlock.nextActionDesc = ' ';
            this.downgradedStatusBlock.dueDate = '';
            this.downgradedStatusBlock.nextActionId = '';
            this.downgradedStatusBlock.description = '';
            this.downgradedStatusBlock.statusDate = '';
            this.downgradeStatusPlaceHolder = '';
            this.downgradedStatusBlock.findingRptAttachs = [];
            //enable previous block
            this.isOpenStatusStatusDateDisabled = false;
            this.isOpenStatusDueDateDisabled = false;
            this.isOpenStatusDescriptionDisabled = false;
          }
          if(currentBlock=='downgrade' && this.openStatusBlock.dueDate == '' && this.openStatusPlaceHolder == '' && event.value != 'PREVIOUS STATUS'){
            this.toast.presentToast('Please select Due Date for RESTORE COMPLIANCE', 'danger');
            this.disableWholeOpenStatusBlock = false;
            this.isStatusPlanAccepted = false;

            //clear fields
            this.downgradedStatusBlock.nextActionDesc = ' ';
            this.downgradedStatusBlock.dueDate = '';
            this.downgradedStatusBlock.nextActionId = '';
            this.downgradedStatusBlock.description = '';
            this.downgradedStatusBlock.statusDate = '';
            this.downgradeStatusPlaceHolder = '';
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
            this.planAcceptedStausBlock.statusId = Number(
              this.appConstant.PLAN_ACCEPTED
            );
            this.planAcceptedStausBlock.nextActionId =
              this.appConstant.VERIFY_CLOSE;                  //changed by archana for jira ID-MOBILE-916
           
                /**condisions added by lokesh for jira_id(728,727) */
          //   if (this.planAcceptedStausBlock.dueDate === ''&&
          //     this.dataFromFindingListScreen.auditInfo.auditSubType=="INTERIM") {
          //     this.planAcceptedPlaceholder = 'INITIAL AUDIT';
          //   }else if (this.planAcceptedStausBlock.dueDate === ''&&
          //   this.dataFromFindingListScreen.auditInfo.auditSubType=="INTERMEDIATE") {
          //   this.planAcceptedPlaceholder = 'RENEWAL AUDIT';
          // }else this.planAcceptedPlaceholder = 'INTERMEDIATE AUDIT';

            this.disableWholeDownGradeStatusBlock = true;
            this.isStatusVerifiedAndClosed = true;
            this.verifiedAndClosedStausBlock = {
              ORIG_SEQ_NO: this.auditSeqNo,
              currSeqNo: this.auditSeqNo,
              categoryId: this.categoryId,
              statusDate: '',
              dueDate: '',
              description: '',
              findingSeqNo: '4',
              findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
              statusId: Number(this.appConstant.VERIFIED_CLOSED),
              nextActionDesc: '',
              nextActionId: '',
              updateDescription: '',
              auditPlace: '',
              userIns: '',
              dateIns: '',
              findingRptAttachs: [],
              statusDesc: this.findingService.getFindingStatusDesc(
                Number(this.appConstant.VERIFIED_CLOSED)
              ),
            };

            if (
              this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
             (this.planAcceptedStausBlock.dueDate === '' || !this.planAcceptedStausBlock.dueDate)
            ) {
            if(this.auditSubTypeId == this.appConstant.INTERIM_SUB_TYPE_ID ){
              this.planAcceptedPlaceholder = 'INITIAL AUDIT';
            } else if(this.auditSubTypeId == this.appConstant.INITIAL_SUB_TYPE_ID){
              this.planAcceptedPlaceholder = 'INTERMEDIATE AUDIT';
            } else if(this.auditSubTypeId == this.appConstant.INTERMEDIATE_SUB_TYPE_ID){
              this.planAcceptedPlaceholder = 'RENEWAL AUDIT';
            } else if(this.auditSubTypeId == this.appConstant.RENEWAL_SUB_TYPE_ID ){
              this.planAcceptedPlaceholder = 'INTERMEDIATE AUDIT';
            } else if(this.auditSubTypeId == this.appConstant.ADDITIONAL_SUB_TYPE_ID){
              this.planAcceptedPlaceholder = 'INTERMEDIATE AUDIT';
            }
          }
          }

          
          if (event.value == 'PREVIOUS STATUS') {
            this.disableWholeDownGradeStatusBlock = false;
            this.isStatusVerifiedAndClosed = false;

            this.planAcceptedStausBlock.nextActionDesc = ' ';
            this.planAcceptedStausBlock.statusDate = '';
            this.planAcceptedStausBlock.dueDate = '';
            this.planAcceptedStausBlock.nextActionId = '';
            this.planAcceptedStausBlock.description = '';
            this.planAcceptedPlaceholder = '';
            this.planAcceptedStausBlock.findingRptAttachs = [];
            //enable previous block
            this.isDowngradedStatusStatusDateDisabled = false;
            this.isDowngradedStatusDueDateDisabled = false;
            this.isDowngradedStatusDescriptionDisabled = false;
          }
          if(currentBlock=='planAccept' && this.downgradedStatusBlock.dueDate == '' && this.downgradeStatusPlaceHolder == '' && event.value != 'PREVIOUS STATUS'){
            this.toast.presentToast('Please select Due Date for PLAN ACCEPTED', 'danger');
            this.disableWholeDownGradeStatusBlock = false;
            this.isStatusVerifiedAndClosed = false;

            this.planAcceptedStausBlock.nextActionDesc = ' ';
            this.planAcceptedStausBlock.statusDate = '';
            this.planAcceptedStausBlock.dueDate = '';
            this.planAcceptedStausBlock.nextActionId = '';
            this.planAcceptedStausBlock.description = '';
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
            this.verifiedAndClosedStausBlock.statusId = Number(
              this.appConstant.VERIFIED_CLOSED
            );
            this.verifiedAndClosedStausBlock.nextActionId =
              this.appConstant.NIL;
            console.log('verified and closed value is nil');
            this.isStatusNil = true;
            this.disableWholePlanAcceptedStatusBlock = true;
            (this.verifiedAndClosedStausBlock.dueDate == '' || !this.verifiedAndClosedStausBlock.dueDate)
              ? (this.verifiedClosedStatusPlaceHolder = 'N.A.')
              : '';
          } else if ('PREVIOUS STATUS') {
            console.log('Previous status of verify closed');
            this.disableWholePlanAcceptedStatusBlock = false;

            this.verifiedAndClosedStausBlock.statusDate = '';
            this.verifiedAndClosedStausBlock.dueDate = '';
            this.verifiedAndClosedStausBlock.nextActionId = '';
            this.verifiedAndClosedStausBlock.nextActionDesc = ' '; //added by lokesh for jira_id(587)
            this.verifiedAndClosedStausBlock.description = '';
            this.verifiedClosedStatusPlaceHolder = '';
            this.verifiedAndClosedStausBlock.findingRptAttachs = [];

            //enable previous block
            this.isPlanAcceptedStatusStatusDateDisabled = false;
            this.isPlanAcceptedStatusDueDateDisabled = false;
            this.isPlanAcceptedStatusDescriptionDisabled = false;
          }
          if(currentBlock=='verifyClose' && this.planAcceptedStausBlock.dueDate == '' && this.planAcceptedPlaceholder == '' && event.value != 'PREVIOUS STATUS'){
            this.toast.presentToast('Please select Due Date for VERIFY / CLOSE', 'danger');
            this.disableWholePlanAcceptedStatusBlock = false;

            this.verifiedAndClosedStausBlock.statusDate = '';
            this.verifiedAndClosedStausBlock.dueDate = '';
            this.verifiedAndClosedStausBlock.nextActionId = '';
            this.verifiedAndClosedStausBlock.nextActionDesc = ' '; 
            this.verifiedAndClosedStausBlock.description = '';
            this.verifiedClosedStatusPlaceHolder = '';
            this.verifiedAndClosedStausBlock.findingRptAttachs = [];

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

    /* added by lokesh for jira_id(587) START HERE*/
    nextActionEmpty(status){
      console.log(status);
      /**added by archana for jira ID-MOBILE-875 start */
     if(status=='open'&&  this.openStatusBlock.statusDate == 'Invalid date'){
        this.openStatusBlock.statusDate = '';
      }else if(status=='downgrade' && this.downgradedStatusBlock.statusDate == 'Invalid date'){
        this.downgradedStatusBlock.statusDate='';
      }else if(status=='planAccept'&& this.planAcceptedStausBlock.statusDate == 'Invalid date'){
        this.planAcceptedStausBlock.statusDate='';
      }else if(status=='verifyClose'&& this.verifiedAndClosedStausBlock.statusDate == 'Invalid date'){
        this.verifiedAndClosedStausBlock.statusDate='';
      }
      /**added by archana for jira ID-MOBILE-875 end */
      if(status=='open'&&  this.openStatusBlock.nextActionDesc ==' '||this.openStatusBlock.nextActionDesc ==''){
      this.openStatusBlock.nextActionDesc ='';
      }else if(status=='downgrade'&& ( this.downgradedStatusBlock.nextActionDesc==' '||this.downgradedStatusBlock.nextActionDesc=='')){
        this.downgradedStatusBlock.nextActionDesc='';
      }else if(status=='planAccept'&&  (this.planAcceptedStausBlock.nextActionDesc==' '||this.planAcceptedStausBlock.nextActionDesc=='')){
        this.planAcceptedStausBlock.nextActionDesc='';
      }else if(status=='verifyClose'&&  (this.verifiedAndClosedStausBlock.nextActionDesc==' '||this.verifiedAndClosedStausBlock.nextActionDesc=='')){
        this.verifiedAndClosedStausBlock.nextActionDesc=''
      }
    }
    /* added by lokesh for jira_id(587) END HERE*/

  //ism/isps/mlc obs type next Action on change
  nextActionChangeObsCategory(event, currentBlock) {
    switch (currentBlock) {
      case 'open':
        console.log(event.value);
        if (event.value == 'NIL') {
          this.isStatusNil = true;
          this.openStatusBlock.findingsNo =
            this.dataFromFindingListScreen.findingNo.toString();
          this.openStatusBlock.nextActionId = this.appConstant.NIL;
          this.openStatusBlock.dueDate == ''
            ? (this.openStatusPlaceHolder = 'N.A.')
            : '';
        }
        this.nxtActionDisableArrayOfOpenStatus =
              this.findingStatusList.filter((res) => {
                return res != 'NIL'  && res != 'PREVIOUS STATUS';
              });
         if(event.value == 'PREVIOUS STATUS') {
           //clear fields
           this.openStatusBlock.statusDate = '';
           this.openStatusBlock.dueDate = '';
           this.openStatusBlock.nextActionId = '';
           this.openStatusBlock.nextActionDesc = ' ';
           this.openStatusBlock.description = '';
           this.openStatusPlaceHolder = '';
           this.openStatusBlock.findingRptAttachs = [];
         }
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
          this.openStatusBlock.nextActionId = this.appConstant.VERIFY_CLOSE;          //changed by archana for jira ID-MOBILE-916
          this.isStatusVerifiedAndClosed = true;
          if (this.openStatusBlock.dueDate === '' || !this.openStatusBlock.dueDate)
            this.openStatusPlaceHolder = 'DURING NEXT SCHEDULED INSPECTION.';
          this.verifiedAndClosedStausBlock = {
            ORIG_SEQ_NO: this.auditSeqNo,
            currSeqNo: this.auditSeqNo,
            categoryId: this.categoryId,
            statusDate: '',
            dueDate: '',
            description: '',
            findingSeqNo: '2',
            findingsNo: this.dataFromFindingListScreen.findingNo.toString(),
            statusId: Number(this.appConstant.VERIFIED_CLOSED),
            nextActionDesc: '',
            nextActionId: '',
            updateDescription: '',
            auditPlace: '',
            userIns: '',
            dateIns: '',
            findingRptAttachs: [],
            statusDesc: this.findingService.getFindingStatusDesc(
              Number(this.appConstant.VERIFIED_CLOSED)
            ),
          };
        }
        /**added by archana for jira ID-MOBILE-866 start*/
        if (this.auditTypeId == this.appConstant.DMLC_TYPE_ID) {
          this.nxtActionDisableArrayOfOpenStatus = this.findingStatusList.filter(
            (res) => {
              return res != 'VERIFY / CLOSE' && res != 'PREVIOUS STATUS'
            }
          );
        }
         /**added by archana for jira ID-MOBILE-866 end*/
        if (event.value == 'PREVIOUS STATUS') {
          //clear fields
          this.openStatusBlock.statusDate = '';
          this.openStatusBlock.dueDate = '';
          this.openStatusBlock.nextActionId = '';
          this.openStatusBlock.nextActionDesc = '';
          this.openStatusPlaceHolder = ''; //added by archana for jira ID-MOBILE-855
          this.openStatusBlock.findingRptAttachs = [];
          this.openStatusBlock.description = '';
          this.isStatusVerifiedAndClosed = false;
        }
        break;

      case 'verifyClose':
        console.log(event.value);
        if (event.value == 'NIL') {
          console.log('verified and closed value is nil');

          this.verifiedAndClosedStausBlock.nextActionId = this.appConstant.NIL;
          this.isStatusNil = true;
          this.disableWholeOpenStatusBlock = true;
          (this.verifiedAndClosedStausBlock.dueDate == '' || !this.verifiedAndClosedStausBlock.dueDate)
            ? (this.verifiedClosedStatusPlaceHolder = 'N.A.')
            : '';
        } else if ('PREVIOUS STATUS') {
          console.log('Previous status of verify closed');
          this.disableWholeOpenStatusBlock = false;
          this.verifiedAndClosedStausBlock.statusDate = '';
          this.verifiedAndClosedStausBlock.dueDate = '';
          this.verifiedAndClosedStausBlock.nextActionId = '';
          this.verifiedAndClosedStausBlock.nextActionDesc = ' '; //added by lokesh for jira_id(587)
          this.verifiedClosedStatusPlaceHolder = ''; //added by archana for jira ID-MOBILE-855
          this.verifiedAndClosedStausBlock.findingRptAttachs = [];
          this.verifiedAndClosedStausBlock.description = '';

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

  //attachments starts here..
  async deleteOptions(attachment, block) {
    const alert = this.alertController.create({
      mode: 'ios',
      header: 'Delete Attachment',
      message: 'Are you sure you want to delete this attachment?',
      cssClass: 'alertCancel', //added by lokesh for jira id-MOBILE-648
      buttons: [
        {
          text: 'Yes',
          cssClass: 'alertButton', //added by lokesh for jira id-MOBILE-648
          handler: () => {
            console.log('Delete Confired');
            this.deleteAttachment(attachment, block);
          },
        },
        {
          text: 'No',
          cssClass: 'alertButton', //added by lokesh for jira id-MOBILE-648
          handler: () => {
            console.log('Delete Rejected');
          },
        },
      ],
    });
    (await alert).present();
  }

  deleteAttachment(attachment, block) {
    console.log(attachment, block);
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
       //modified by lokesh for jira_id(625)
       this.toast.presentToast( (this.dataFromFindingListScreen.auditInfo.auditTypeId==this.appConstant.DMLC_TYPE_ID?'Review Note(s)':'Findings')+' attachment removed Successfully, Please save '+(this.dataFromFindingListScreen.auditInfo.auditTypeId==this.appConstant.DMLC_TYPE_ID?'Review Notes':'Finding(s)'), 'success'); // modified by lokesh for jira_id(860)// added by archana for jira-id-MOBILE-640
    } else {
      this.deleteInFileSystemFiles.push({
        fileName: attachment.fileName,
        findingNo: attachment.findingNo,
        findingSeqNo: attachment.findingSeqNo,
        fileSeqNo: attachment.fileSeqNo,
      });
      console.log(this.deleteInFileSystemFiles);
     //modified by lokesh for jira_id(625)
     this.toast.presentToast((this.dataFromFindingListScreen.auditInfo.auditTypeId==this.appConstant.DMLC_TYPE_ID?'Review Note(s)':'Finding(s)')+' attachment removed Successfully, Please save '+(this.dataFromFindingListScreen.auditInfo.auditTypeId==this.appConstant.DMLC_TYPE_ID?'Review Notes':'Findings'), 'success'); // modified by lokesh for jira_id(860)
    }
  }

  

  pickAttachmentFileListener(event, statusBlock) {
    console.log(event);
    
    if(event.target.files[0].name.length > 70){      // added by archana for Jira Id-MOBILE-903
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
    console.log(block.findingRptAttachs);

    if (block.findingRptAttachs.length > 0) {
      block.findingRptAttachs.forEach((existingAttachment) => {
        if (existingAttachment.fileName == file.name) {
          this.toast.presentToast(
            file.name + ' ' + 'file name already Exists',
            "danger"// modified by lokesh for jira_id(860)
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
    isNotTheExistingFile = attDuplicateFiles.includes(file.name)?false:true;        //added by @Ramya on 15-06-2022 for jira id - mobile-516
    if (isNotTheExistingFile) {
      block.findingRptAttachs.push({
        companyId: 2,
        currentAuditSeq: Number(this.auditSeqNo),
        dateIns: moment(new Date()).format('YYYY-MM-DD'),
        fileName: file.name,
        fileSeqNo: newFileSeqNo.toString(),
        findingNo: this.findingInfo.findingsNo,
        findingSeqNo: block.findingSeqNo,
        origAuditSeqNo: this.findingInfo.origSeqNo,
        ownerFlag: 0,
        statusSeqNo: block.findingSeqNo,
        userIns: this.dataFromFindingListScreen.auditInfo.userIns,
      });

      this.saveInFileSystemFiles.push({
        file: file,
        fileName: file.name,
        findingNo: this.findingInfo.findingsNo,
        findingSeqNo: block.findingSeqNo,
        fileSeqNo: newFileSeqNo.toString(),
      });

      console.log(this.saveInFileSystemFiles);
    }
    console.log(block.findingRptAttachs);
  }

  //OpenStatus
  openStatusDateChange(event) {
    console.log(event);
    // convert object to string then trim it to yyyy-mm-dd
    this.openStatusBlock.statusDate = moment(event.value).format('YYYY-MM-DD');

    if (
      this.auditTypeId != this.appConstant.ISPS_TYPE_ID ||
      (this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
        this.auditSubTypeId == this.appConstant.INTERMEDIATE_SUB_TYPE_ID) ||
      (this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
        this.auditSubTypeId == this.appConstant.ADDITIONAL_SUB_TYPE_ID &&
        this.categoryId == this.appConstant.MINOR_FINDING_CATEGORY)
    )
      this.planAcceptedBlockMinStatusDate = this.openStatusBlock.statusDate;
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
    this.openStatusPlaceHolder = '';
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

      if (
        (this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
          this.categoryId == this.appConstant.MINOR_FINDING_CATEGORY) ||
        this.categoryId == this.appConstant.MAJOR_FINDING_CATEGORY
      )
        this.planAcceptedBlockMinStatusDate =
          this.downgradedStatusBlock.statusDate;
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
    this.downgradeStatusPlaceHolder = '';
  }

  downgradedStatusBlockDueDateClear(event) {
    event.stopPropagation();
    this.downgradedStatusBlock.dueDate = '';
    this.downgradeStatusPlaceHolder = '';
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
    this.planAcceptedPlaceholder = '';
  }

  planAcceptedStausBlockDueDateClear(event) {
    event.stopPropagation();
    this.planAcceptedStausBlock.dueDate = '';
    this.planAcceptedPlaceholder = ''
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

  findingValidation(): boolean {
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
       if (this.openStatusBlock && this.openStatusBlock.statusDate != '') {
          this.openStatusBlock.dueDate == ''
            ? (this.openStatusBlock.dueDate = this.openStatusPlaceHolder ? this.openStatusPlaceHolder : '')
            : '';
          currentFindingDetails.push(this.openStatusBlock);
          if (
            (this.downgradedStatusBlock &&
            this.downgradedStatusBlock.statusDate != '') ||
            (this.downgradedStatusBlock &&
              this.downgradedStatusBlock.dueDate != '')//added by archana 29-06-2022 for jira id=>MOBILE-484
          ) {
            this.downgradedStatusBlock.dueDate == ''
              ? (this.downgradedStatusBlock.dueDate =
                  this.downgradeStatusPlaceHolder ? this.downgradeStatusPlaceHolder : '')
              : '';
            currentFindingDetails.push(this.downgradedStatusBlock);
            if (
              (this.planAcceptedStausBlock &&
              this.planAcceptedStausBlock.statusDate != '') ||
              (this.planAcceptedStausBlock &&
                this.planAcceptedStausBlock.dueDate != '') 
            ) {
              
              this.planAcceptedStausBlock.dueDate == ''
              ? (this.planAcceptedStausBlock.dueDate =
                  this.planAcceptedPlaceholder ? this.planAcceptedPlaceholder : '')
              : '';
              
              currentFindingDetails.push(this.planAcceptedStausBlock);
              if (
                ( this.verifiedAndClosedStausBlock &&
                this.verifiedAndClosedStausBlock.statusDate != '') ||
                ( this.verifiedAndClosedStausBlock &&
                  this.verifiedAndClosedStausBlock.dueDate != '')
              ) {
                this.verifiedAndClosedStausBlock.dueDate == ''
                  ? (this.verifiedAndClosedStausBlock.dueDate =
                      this.verifiedClosedStatusPlaceHolder ? this.verifiedClosedStatusPlaceHolder : '' )
                  : '';
                currentFindingDetails.push(this.verifiedAndClosedStausBlock);
              }
            }
          }
        }
        // TOASTERS added by archana for jira ID-MOBILE-869
        if (this.openStatusBlock) {
        if(this.openStatusBlock.nextActionId != '' && this.openStatusBlock.statusDate == ''){
          this.toast.presentToast('Please Enter the Status Date for OPEN status', 'danger');
          saveFlag = false;
        }else if(this.openStatusBlock.statusDate != '' && this.openStatusBlock.nextActionId == ''){
          this.toast.presentToast('Please Enter the Next Action for OPEN status', 'danger');
          saveFlag = false;
        }else if(this.openStatusBlock.statusDate != '' && this.openStatusBlock.nextActionId != '' && (this.openStatusBlock.dueDate == '' && this.openStatusPlaceHolder == '')){
          this.toast.presentToast('Please Enter the Due Date for OPEN status', 'danger');
          saveFlag = false;
        }
      }
      if(this.downgradedStatusBlock){
        if(this.downgradedStatusBlock.nextActionId != '' && this.downgradedStatusBlock.statusDate == ''){
          this.toast.presentToast('Please Enter the Status Date for DOWNGRADED status', 'danger');
          saveFlag = false;
        }else if(this.downgradedStatusBlock.statusDate != '' && this.downgradedStatusBlock.nextActionId == ''){
          this.toast.presentToast('Please Enter the Next Action for DOWNGRADED status', 'danger');
          saveFlag = false;
        }else if(this.downgradedStatusBlock.statusDate != '' && this.downgradedStatusBlock.nextActionId != '' && this.downgradedStatusBlock.dueDate == ''){
          this.toast.presentToast('Please Enter the Due Date for DOWNGRADED status', 'danger');
          saveFlag = false;
        }

      }

      if(this.planAcceptedStausBlock){
        if(this.planAcceptedStausBlock.nextActionId != '' && this.planAcceptedStausBlock.statusDate == ''){
          this.toast.presentToast('Please Enter the Status Date for PLAN ACCEPTED status', 'danger');
          saveFlag = false;
        }else if(this.planAcceptedStausBlock.statusDate != '' && this.planAcceptedStausBlock.nextActionId == ''){
          this.toast.presentToast('Please Enter the Next Action for PLAN ACCEPTED status', 'danger');
          saveFlag = false;
        }else if(this.planAcceptedStausBlock.statusDate != '' && this.planAcceptedStausBlock.nextActionId != '' && this.planAcceptedStausBlock.dueDate == ''){
          this.toast.presentToast('Please Enter the Due Date for PLAN ACCEPTED status', 'danger');
          saveFlag = false;
        }
      }

      if(this.verifiedAndClosedStausBlock){
        if(this.verifiedAndClosedStausBlock.nextActionId != '' && this.verifiedAndClosedStausBlock.statusDate == ''){
          this.toast.presentToast('Please Enter the Status Date for VERIFIED/CLOSED status', 'danger');
          saveFlag = false;
        }else if(this.verifiedAndClosedStausBlock.statusDate != '' && this.verifiedAndClosedStausBlock.nextActionId == ''){
          this.toast.presentToast('Please Enter the Next Action for  VERIFIED/CLOSED status', 'danger');
          saveFlag = false;
        }else if(this.verifiedAndClosedStausBlock.statusDate != '' && this.verifiedAndClosedStausBlock.nextActionId != '' && this.verifiedAndClosedStausBlock.dueDate == ''){
          this.toast.presentToast('Please Enter the Due Date for  VERIFIED/CLOSED status', 'danger');
          saveFlag = false;
        }

      }
      } else if (this.categoryId == this.appConstant.MINOR_FINDING_CATEGORY) {
         if (
          this.auditTypeId != this.appConstant.ISPS_TYPE_ID ||
          (this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
            this.auditSubTypeId == this.appConstant.INTERMEDIATE_SUB_TYPE_ID) ||
          (this.auditTypeId == this.appConstant.ISPS_TYPE_ID &&
            this.auditSubTypeId == this.appConstant.ADDITIONAL_SUB_TYPE_ID)
        ) {
          if (this.openStatusBlock && this.openStatusBlock.statusDate != '') {
            this.openStatusBlock.dueDate == ''
              ? (this.openStatusBlock.dueDate = this.openStatusPlaceHolder ? this.openStatusPlaceHolder : '')           //changed by archana for jira ID-MOBILE-909
              : '';
            currentFindingDetails.push(this.openStatusBlock);
            if (
             ( this.planAcceptedStausBlock &&
              this.planAcceptedStausBlock.statusDate != '')||
              ( this.planAcceptedStausBlock &&
                this.planAcceptedStausBlock.dueDate != '')
            ) {
              this.planAcceptedStausBlock.dueDate == ''
                ? (this.planAcceptedStausBlock.dueDate =
                    this.planAcceptedPlaceholder ? this.planAcceptedPlaceholder : '')
                : '';
              currentFindingDetails.push(this.planAcceptedStausBlock);
              if (
                (this.verifiedAndClosedStausBlock &&
                this.verifiedAndClosedStausBlock.statusDate != '') ||
                (this.verifiedAndClosedStausBlock &&
                  this.verifiedAndClosedStausBlock.dueDate != '')
              ) {
                this.verifiedAndClosedStausBlock.dueDate == ''
                  ? (this.verifiedAndClosedStausBlock.dueDate =
                      this.verifiedClosedStatusPlaceHolder ? this.verifiedClosedStatusPlaceHolder : '')
                  : '';
                currentFindingDetails.push(this.verifiedAndClosedStausBlock);
              }
            }
          }
        } else {
           if (this.openStatusBlock && this.openStatusBlock.statusDate != '') {
            this.openStatusBlock.dueDate == ''
              ? (this.openStatusBlock.dueDate = this.openStatusPlaceHolder ? this.openStatusPlaceHolder : '')
              : '';
            currentFindingDetails.push(this.openStatusBlock);
            if (
              (this.downgradedStatusBlock &&
              this.downgradedStatusBlock.statusDate != '') || 
              (this.downgradedStatusBlock &&
                this.downgradedStatusBlock.dueDate != '')
            ) {
              this.downgradedStatusBlock.dueDate == ''
                ? (this.downgradedStatusBlock.dueDate =
                    this.downgradeStatusPlaceHolder ? this.downgradeStatusPlaceHolder : '')
                : '';
              currentFindingDetails.push(this.downgradedStatusBlock);
              
              if (
                (this.planAcceptedStausBlock &&
                this.planAcceptedStausBlock.statusDate != '') ||
                (this.planAcceptedStausBlock &&
                  this.planAcceptedStausBlock.dueDate != '')
              ) {
                this.planAcceptedStausBlock.dueDate == ''
                ? (this.planAcceptedStausBlock.dueDate =
                    this.planAcceptedPlaceholder ? this.planAcceptedPlaceholder : '')
                : '';
                currentFindingDetails.push(this.planAcceptedStausBlock);
                if (
                  (this.verifiedAndClosedStausBlock &&
                  this.verifiedAndClosedStausBlock.statusDate != '')||
                  (this.verifiedAndClosedStausBlock &&
                    this.verifiedAndClosedStausBlock.dueDate != '')
                ) {
                  this.verifiedAndClosedStausBlock.dueDate == ''
                    ? (this.verifiedAndClosedStausBlock.dueDate =
                        this.verifiedClosedStatusPlaceHolder ? this.verifiedClosedStatusPlaceHolder : '')
                    : '';
                  currentFindingDetails.push(this.verifiedAndClosedStausBlock);
                }
              }
            }
          }
        }
         if (this.openStatusBlock) {
        if(this.openStatusBlock.nextActionId != '' && this.openStatusBlock.statusDate == ''){
          this.toast.presentToast('Please Enter the Status Date for OPEN status', 'danger');
          saveFlag = false;
        }else if(this.openStatusBlock.statusDate != '' && this.openStatusBlock.nextActionId == ''){
          this.toast.presentToast('Please Enter the Next Action for OPEN status', 'danger');
          saveFlag = false;
        }else if(this.openStatusBlock.statusDate != '' && this.openStatusBlock.nextActionId != '' && (this.openStatusBlock.dueDate == '' && this.openStatusPlaceHolder == '')){
          this.toast.presentToast('Please Enter the Due Date for OPEN status', 'danger');
          saveFlag = false;
        }
      }
      if(this.downgradedStatusBlock){
        if(this.downgradedStatusBlock.nextActionId != '' && this.downgradedStatusBlock.statusDate == ''){
          this.toast.presentToast('Please Enter the Status Date for COMPLIANCE RESTORED status', 'danger');
          saveFlag = false;
        }else if(this.downgradedStatusBlock.statusDate != '' && this.downgradedStatusBlock.nextActionId == ''){
          this.toast.presentToast('Please Enter the Next Action for COMPLIANCE RESTORED status', 'danger');
          saveFlag = false;
        }else if(this.downgradedStatusBlock.statusDate != '' && this.downgradedStatusBlock.nextActionId != '' && this.downgradedStatusBlock.dueDate == ''){
          this.toast.presentToast('Please Enter the Due Date for COMPLIANCE RESTORED status', 'danger');
          saveFlag = false;
        }

      }

      if(this.planAcceptedStausBlock){
        if(this.planAcceptedStausBlock.nextActionId != '' && this.planAcceptedStausBlock.statusDate == ''){
          this.toast.presentToast('Please Enter the Status Date for PLAN ACCEPTED status', 'danger');
          saveFlag = false;
        }else if(this.planAcceptedStausBlock.statusDate != '' && this.planAcceptedStausBlock.nextActionId == ''){
          this.toast.presentToast('Please Enter the Next Action for PLAN ACCEPTED status', 'danger');
          saveFlag = false;
        }else if(this.planAcceptedStausBlock.statusDate != '' && this.planAcceptedStausBlock.nextActionId != '' && this.planAcceptedStausBlock.dueDate == ''){
          this.toast.presentToast('Please Enter the Due Date for PLAN ACCEPTED status', 'danger');
          saveFlag = false;
        }
      }

      if(this.verifiedAndClosedStausBlock){
        if(this.verifiedAndClosedStausBlock.nextActionId != '' && this.verifiedAndClosedStausBlock.statusDate == ''){
          this.toast.presentToast('Please Enter the Status Date for VERIFIED/CLOSED status', 'danger');
          saveFlag = false;
        }else if(this.verifiedAndClosedStausBlock.statusDate != '' && this.verifiedAndClosedStausBlock.nextActionId == ''){
          this.toast.presentToast('Please Enter the Next Action for  VERIFIED/CLOSED status', 'danger');
          saveFlag = false;
        }else if(this.verifiedAndClosedStausBlock.statusDate != '' && this.verifiedAndClosedStausBlock.nextActionId != '' && this.verifiedAndClosedStausBlock.dueDate == ''){
          this.toast.presentToast('Please Enter the Due Date for  VERIFIED/CLOSED status', 'danger');
          saveFlag = false;
        }

      }
      } else if (this.categoryId == this.appConstant.OBS_FINDING_CATEGORY) {
         if (this.openStatusBlock && this.openStatusBlock.statusDate) {
          if (
            this.openStatusBlock.statusDate &&
            this.openStatusBlock.nextActionId != ''
          ) {
            this.openStatusBlock.dueDate == ''
              ? (this.openStatusBlock.dueDate = this.openStatusPlaceHolder ? this.openStatusPlaceHolder : '')            //changed by archana for jira ID-MOBILE-909
              : '';
            currentFindingDetails.push(this.openStatusBlock);
          }
        }
        if (this.openStatusBlock) {
          if(this.openStatusBlock.nextActionId != '' && this.openStatusBlock.statusDate == ''){
            this.toast.presentToast('Please Enter the Status Date for OPEN status', 'danger');
            saveFlag = false;
          }else if(this.openStatusBlock.statusDate != '' && this.openStatusBlock.nextActionId == ''){
            this.toast.presentToast('Please Enter the Next Action for OPEN status', 'danger');
            saveFlag = false;
          }else if(this.openStatusBlock.statusDate != '' && this.openStatusBlock.nextActionId != '' && (this.openStatusBlock.dueDate == '' && this.openStatusPlaceHolder == '')){
            this.toast.presentToast('Please Enter the Due Date for OPEN status', 'danger');
            saveFlag = false;
          }
        }
      }
      // this.findingInfo.findingDtl = currentFindingDetails;
      console.log('findingdetails to validate : ', currentFindingDetails);
    } else if (this.auditTypeId == this.appConstant.DMLC_TYPE_ID) {
      if (this.auditTypeId == this.appConstant.REVIEW_NOTE) {
        if (this.openStatusBlock && this.openStatusBlock.statusDate!='') {
          this.openStatusBlock.dueDate == ''
            ? (this.openStatusBlock.dueDate = this.openStatusPlaceHolder ? this.openStatusPlaceHolder : '')           //changed by archana for jira ID-MOBILE-909
            : '';
          currentFindingDetails.push(this.openStatusBlock);

          if (
            (this.verifiedAndClosedStausBlock &&
            this.verifiedAndClosedStausBlock.statusDate != '') ||
            (this.verifiedAndClosedStausBlock &&
              this.verifiedAndClosedStausBlock.dueDate != '')
          ) {
            this.verifiedAndClosedStausBlock.dueDate == ''
              ? (this.verifiedAndClosedStausBlock.dueDate =
                  this.verifiedClosedStatusPlaceHolder ? this.verifiedClosedStatusPlaceHolder : '')
              : '';
            currentFindingDetails.push(this.verifiedAndClosedStausBlock);
          }
        }
      }
      if (this.openStatusBlock) {
        if(this.openStatusBlock.nextActionId != '' && this.openStatusBlock.statusDate == ''){
          this.toast.presentToast('Please Enter the Status Date for OPEN status', 'danger');
          saveFlag = false;
        }else if(this.openStatusBlock.statusDate != '' && this.openStatusBlock.nextActionId == ''){
          this.toast.presentToast('Please Enter the Next Action for OPEN status', 'danger');
          saveFlag = false;
        }else if(this.openStatusBlock.statusDate != '' && this.openStatusBlock.nextActionId != '' && (this.openStatusBlock.dueDate == '' && this.openStatusPlaceHolder == '')){
          this.toast.presentToast('Please Enter the Due Date for OPEN status', 'danger');
          saveFlag = false;
        }
      }
      if(this.verifiedAndClosedStausBlock){
        if(this.verifiedAndClosedStausBlock.nextActionId != '' && this.verifiedAndClosedStausBlock.statusDate == ''){
          this.toast.presentToast('Please Enter the Status Date for VERIFIED/CLOSED status', 'danger');
          saveFlag = false;
        }else if(this.verifiedAndClosedStausBlock.statusDate != '' && this.verifiedAndClosedStausBlock.nextActionId == ''){
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
          // saveFlag = false;
          // this.toast.presentToast('please enter due date', 'danger');
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
        /**added by archana 29-06-2022 for jira id=>MOBILE-484 start*/
        else if(findingDetail.dueDate && !findingDetail.statusDate){
          saveFlag = false;
          this.toast.presentToast('Please Select status date', 'danger');
        }
        /**added by archana 29-06-2022 for jira id=>MOBILE-484 end*/
      }
    });

    this.findingInfo.findingDtl = currentFindingDetails;
    console.log('validated findingdetails : ', currentFindingDetails);
    /**added by archana jira id=>MOBILE-591 start */
    if(currentFindingDetails.length == 0){
      //added by lokesh for jira_id(819)
      if(this.openStatusBlock.statusDate=='')
          this.toast.presentToast('Please Enter the Status date for OPEN status', 'danger');// modified by lokesh for jira_id(862)
          else if(this.openStatusBlock.nextActionDesc=='')
          this.toast.presentToast('please select the next action for OPEN status', 'danger');
          else if(this.openStatusBlock.dueDate=='')
          this.toast.presentToast('Please Select Due Date', 'danger');
          saveFlag = false;
      }
    /**added by archana jira id=>MOBILE-591 end */
    return saveFlag;
  }

  save() {
    this.findingValidation() ? this.saveOptions() : '';
  }
  async saveOptions(isBackButtonPressed?: boolean) {
    const alert = this.alertController.create({
      mode: 'ios',
      header: this.dataFromFindingListScreen.auditInfo.auditTypeId == 1005?'Save Review Notes' :'Save Finding', //added by archana 23-06-2022 for jira-id=>MOBILE-562
      message: 'Do you want to save the changes?',
      cssClass: 'alertCancel', //added by archana for jira id-MOBILE-519
      buttons: [
        {
          text: 'Yes',
          cssClass: 'alertButton', //added by archana for jira id-MOBILE-519
          handler: () => {
            console.log('Save Confired');
            this.saveConfirmed(isBackButtonPressed);
          },
        },
        { 
          text: 'No',
          cssClass: 'alertButton', //added by archana for jira id-MOBILE-519
          handler: () => {
            console.log('Save Rejected');
            this.goBack();      //added by archana for jira id-MOBILE-907
          },
        },
      ],
    });
    (await alert).present();
  }
  saveConfirmed(isBackButtonPressed?: boolean) {
    this.db
      .getCurrentFindingDataList(this.auditSeqNo)
      .then((existingFindings: any) => {
        //update new changes in findingInfo
        //this.pushFindingDetailsInFindingInfo();

        let findings = [];
        let findingDetails = [];
        let findingAttachments = [];

        console.log('Existing findings', existingFindings);
        console.log('Finding Information', this.findingInfo);

        //merge finding with existing findings
        if (this.isNewFinding) {
           this.isNewFinding=false;    //added by lokesh for jira_id(672)  
          existingFindings.length > 0
            ? (this.findingInfo.findingsNo = (
                parseInt(
                  existingFindings[existingFindings.length - 1].findingsNo
                ) + 1
              ).toString())
            : (this.findingInfo.findingsNo = '1');
          existingFindings.push(this.findingInfo);
        } else {
          const updateIndex = existingFindings.findIndex(
            (finding) => finding.findingsNo === this.findingInfo.findingsNo
          );
          console.log('updated index : ', updateIndex);
          if (updateIndex >= 0)
            existingFindings[updateIndex] = this.findingInfo;
        }
        console.log('final findings array :', existingFindings);

        let finalFindigData = existingFindings;

        finalFindigData.forEach((finding, findIndex) => {
          findings.push({
            seqNo: findIndex + 1,
            currSeqNo: finding.currSeqNo ? finding.currSeqNo : '',
            origSeqNo: finding.origSeqNo ? finding.origSeqNo : '',
            findingsNo: finding.findingsNo,
            auditDate: finding.auditDate ? finding.auditDate : '',
            auditCode: finding.auditCode,
            companyId: this.companyId,
            userIns: finding.userIns ? finding.userIns : this.userIns,
            findingStatus: 0,
            dateIns: finding.dateIns
              ? finding.dateIns
              : moment(new Date()).format(this.appConstant.YYYYMMDD),
            serialNo: finding.serialNo,
          });

          //moment(new Date()).format(YYYYMMDD)
          if (finding.findingDtl.length > 0) {
            //finding status is 1 if completed.
            if (
              (finding.findingDtl[finding.findingDtl.length - 1].statusId ==
                this.appConstant.VERIFIED_CLOSED &&
                finding.findingDtl[finding.findingDtl.length - 1].statusDate) ||
              finding.findingDtl[0].categoryId ==
                this.appConstant.OBS_FINDING_CATEGORY
            ) {
              findings[findIndex].findingStatus = 1;
            } else {
              findings[findIndex].findingStatus = 0;
            }

            finding.findingDtl.forEach((findingDetail, findDtlIndex) => {
              if (
                findingDetail.nextActionId &&
                findingDetail.nextActionId != ''
              ) {
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
                  auditPlace: '',
                });

                if (findingDetail.findingRptAttachs.length > 0) {
                  findingDetail.findingRptAttachs.forEach(
                    (findingAttachment) => {
                      findingAttachments.push(
                        findingAttachment
                        /* {
                    seqNo: findAttachIndex + 1,
                    currSeqNo: findingAttachment.auditSeqNo
                      ? findingAttachment.auditSeqNo
                      : '',
                    origSeqNo: this.dataFromAuditDetailPage.auditSeqNo
                      ? this.dataFromAuditDetailPage.auditSeqNo
                      : '',
                    findingsNo: findIndex + 1 + '',
                    findingSeqNo: findDtlIndex + 1 + '',
                    fileSeqNo: findAttachIndex + 1 + '',
                    fileName: findingAttachment.fileName,
                    flag: findingAttachment.ownerFlag,
                    companyId: finding.companyId,
                    userIns: this.dataFromAuditDetailPage.userIns
                      ? this.dataFromAuditDetailPage.userIns
                      : '',
                    dateIns: this.dataFromAuditDetailPage.dateIns
                      ? this.dataFromAuditDetailPage.dateIns
                      : '',
                  } */
                      );
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
          .saveFindingData(
            { findings, findingDetails, findingAttachments },
            this.auditSeqNo
          )
          .then(() => {
            this.deleteInFileSystemFiles.forEach((attachmentObj) => {
              console.log('deleteFindingAttachment01');
               /**added by archana for jira-id MOBILE-600 start */ 
              this.db
              .deleteFindingAttach(attachmentObj, this.auditSeqNo)
              .then((res) => {
              
                 this.db.getCurrentDbRecords();
              })
               /**added by archana for jira-id MOBILE-600 end  */ 

              this.fileManager.deleteFindingAttachment(
                this.auditTypeDesc,
                this.auditSeqNo,
                attachmentObj
              );
            });
          })
          .then(() => {
            this.saveInFileSystemFiles.forEach((attachmentObj) => {
              this.fileManager.saveFindingAttachment(
                this.auditTypeDesc,
                this.auditSeqNo,
                attachmentObj
              );
            });
          })
          .then(() => {
            console.log('Findings has been saved in sqlite db');
            this.db.getCurrentDbRecords();
            /**Added by sudharsan for JIRA-ID=575 */
            if(!this.dataFromFindingListScreen.isNewFinding){
              var warnMsg=this.dataFromFindingListScreen.auditInfo.auditTypeId==this.appConstant.DMLC_TYPE_ID?'Review Note(s)':'Finding(s)';  //Added by @Ramya on 12-08-2022 for jira id - Mobile- 641
              this.toast.presentToast(warnMsg+' Updated Successfully', 'success');  
            }
            else{
              var warnMsg=this.dataFromFindingListScreen.auditInfo.auditTypeId==this.appConstant.DMLC_TYPE_ID?'Review Note(s)':'Finding(s)';   //Added by @Ramya on 12-08-2022 for jira id - Mobile- 645
              this.toast.presentToast(warnMsg+' Added Successfully', 'success');  
            }
            /**End here */
            // isBackButtonPressed ? this.router.navigateByUrl("/audit/perform/audit-details") : ''
            //this.currentFindingNew(); //comment by lokesh for jira_id(670)
          });
      });
      //added by lokesh for jira_id(667)
      // this.db.updateNewfindings(this.findingDetails);   //commented by archana for jira Id-MOBILE-792
  }

  //pushFindingDetailsInFindingInfo() { }
  currentFindingNew() {
    var findingdata= {
      auditTypeId: this.auditTypeId,
      openMeetingDate:
        this.dataFromFindingListScreen.auditInfo.openMeetingDate,
      closeMeetingDate:
        this.dataFromFindingListScreen.auditInfo.closeMeetingDate,
      auditDate: this.dataFromFindingListScreen.auditInfo.auditDate,
      userIns: this.dataFromFindingListScreen.auditInfo.userIns,
      dateIns: this.dataFromFindingListScreen.auditInfo.dateIns,
      auditReportNo: this.dataFromFindingListScreen.auditInfo.auditReportNo,
      auditSeqNo: this.auditSeqNo,
      companyId: this.companyId,
    }
    this.router.navigate(['/perform/findings-list' , {
     findingDetails: JSON.stringify(findingdata),
  }],{ replaceUrl: true } );
  }

  async goBack() {
    //this.navController.back();
    this.currentFindingNew();
  }

  ngAfterViewInit() {
    //added by lokesh for jira_id(788) START HERE
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      this.router.navigateByUrl("/perform/findings-list")
    }); //added by lokesh for jira_id(788) END HERE
  }
  ngOnDestroy() {
    console.log('ngOnDestroy');
    //this.setFindingToCurrentFindingsObj();
    this.backButtonSubscription.unsubscribe();
  }
  // Check if device is phone or tablet
  get isMobile() {
    return this.breakpointObserver.isMatched('(max-width: 767px)');
  }
//added by ramya on 13-06-2022 for jira id - MOBILE-571
  descriptionMaxLengthValidation(desc){
    if (desc.length > 2500) {
      desc= desc.slice(0, 2500);
      this.toast.presentToast('Description should be less than 2500 characters', 'danger',20000);//modified by lokesh for jira_id(726)
    }
  }


  /**added by archana for jira-id MOBILE-600 start  */ 
  downloadAttachment(attachment, block) {
    console.log(attachment);
    console.log(block);
    console.log(this.filesys.externalRootDirectory + 'Download/AUDITING_APP_DOWNLOADS_1/',
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
    if(this.auditTypeDesc == 'DMLC II'){  //added by archana for jira ID-MOBILE-808 
      this.auditTypeDesc = 'DMLC_II';
    }
     return new Promise<boolean>((resolve, reject) => {
       this.filesys.checkFile
         ( directory +
             '/AuditDetails/' +
               this.auditTypeDesc +
            '/' +
             this.auditSeqNo +
            '/'+
            attachment.findingNo +
            '/'+
            attachment.findingSeqNo +'/',
            
            attachment.fileName
            
        )
        .then((res) => {
          console.log('checkFileExistToDownload', res);
          resolve(res);
        })
        .catch((err) => {
         //toster modifid by lokesh  for jira_id(640)
         this.toast.presentToast('Please save '+( this.auditTypeId ==this.appConstant.DMLC_TYPE_ID ? 'Review Note(s) ' : 'Findings ' )+'to download the file', 'danger');
          console.log('checkFileExistToDownload', err);
          reject(err);
        });
    });
  }
  copyFileToDownloadsFolder(attachment){
    let directory = this.dirName;
    this.checkAuditingAppDownloadsFolder().then((res)=>{
      console.log(res);
      this.checkAuditingAppDownloadsFolderNewFindings()
      .then((res)=>{
        console.log(res);
        
        this.saveattachmentFolder(directory,attachment);
     })
     .catch((err)=>{
        this.createAuditingAppDownloadsFolderNewFindings().then((res)=>{
          this.saveattachmentFolder(directory,attachment);
        })
      })
      
    }).catch((err)=>{
      if(!this.isIOS){
      this.createAuditingAppDownloadsFolder().then((res)=>{
        console.log(res);
        this.checkAuditingAppDownloadsFolderNewFindings()
      .then((res)=>{
        console.log(res);
        
        this.saveattachmentFolder(directory,attachment);
      }) .catch((err)=>{
        this.createAuditingAppDownloadsFolderNewFindings().then((res)=>{
          this.saveattachmentFolder(directory,attachment);
        })
      })
    })
      /**added by archana for Jira ID-MOBILE-715 start */
    } else if(this.isIOS){
      let mime = this.getValueFromMIME(
        attachment.fileName.split('.').pop()
      );
      this.fileOpener.open(
        directory +
          'AuditDetails/' +
          this.auditTypeDesc +
          '/' +
            this.auditSeqNo +
          '/'+
          attachment.findingNo +
          '/'+
          attachment.findingSeqNo +
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
  checkAuditingAppDownloadsFolderNewFindings(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.filesys
        .checkDir(
          this.filesys.externalRootDirectory + 'Download/'+
          'AUDITING_APP_DOWNLOADS/', 'NewFindings'
        )
        .then((res) => {
          console.log('checkAuditingAppDownloadsFolderNewFindings', res);
          resolve(true);
        })
        .catch((err) => {
          console.log('checkAuditingAppDownloadsFolderNewFindings', err);
          reject(err);
        });
    });
  }
  createAuditingAppDownloadsFolderNewFindings(){
    return new Promise<boolean>((resolve, reject) => {
      this.filesys
        .createDir(
          this.filesys.externalRootDirectory + 'Download/'+ 'AUDITING_APP_DOWNLOADS/', 
          'NewFindings',
          false
        )
        .then((res) => {
          console.log('createAuditingAppDownloadsFolderNewFindings', res);
          resolve(true);
        })
        .catch((err) => {
          console.log('createAuditingAppDownloadsFolderNewFindings', err);
          reject(err);
        });
    });
  }

  saveattachmentFolder(directory,attachment){
    console.log(attachment);
    console.log(directory +
      '/AuditDetails/' +
        this.auditTypeDesc +
     '/' +
     this.auditSeqNo +
     '/'+
     attachment.findingNo +
     '/'+
     attachment.findingSeqNo +'/',
     
     attachment.fileName);
    
    this.filesys
    .copyFile(
      directory +
      '/AuditDetails/' +
        this.auditTypeDesc +
     '/' +
     this.auditSeqNo +
     '/'+
     attachment.findingNo +
     '/'+
     attachment.findingSeqNo +'/',
     
     attachment.fileName,
     this.filesys.externalRootDirectory + 'Download/AUDITING_APP_DOWNLOADS/'+'NewFindings/',
     attachment.fileName
    );
    /** added by archana for jira-id MOBILE-715 start */
    var attach=  '/AuditDetails/' + this.auditTypeDesc +'/' +this.auditSeqNo +'/'+ attachment.findingNo + '/'+attachment.findingSeqNo +'/'+attachment.fileName;
    this.toast.presentToast(
      'File Downloaded successfully in Download/AUDITING_APP_DOWNLOADS/   NewFindings/ Folder',
          'success'
    );
    // this.fileManager.openPdfFindings(directory,attach).then(() => {
    //   // resolve({ data: "Success" });
    // });
    /** added by archana for jira-id MOBILE-715 end */
  }
/**added by archana for jira-id MOBILE-600 end  */ 
}
