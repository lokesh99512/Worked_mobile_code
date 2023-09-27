import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertController,
  ModalController,
  NavController,
  Platform,
} from '@ionic/angular';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AppConstant } from 'src/app/constants/app.constants';
import { FindingDetail, findingDetails } from 'src/app/interfaces/finding';
import { DatabaseService } from 'src/app/providers/database.service';
import { ToastService } from 'src/app/providers/toast.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { FileManagerService } from 'src/app/providers/file-manager.service';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
@Component({
  selector: 'app-dmlc-finding-details',
  templateUrl: './dmlc-finding-details.page.html',
  styleUrls: ['./dmlc-finding-details.page.scss'],
})
export class DmlcFindingDetailsPage implements OnInit {
   /**added by archana for Jira ID-MOBILE-715 start */
   mimeType: { type: string; value: string }[] = [
    { type: 'pdf', value: 'application/pdf' },
    { type: 'jpeg', value: 'image/jpeg' },
    { type: 'txt', value: 'text/plain' },
    { type: 'png', value: 'image/png' },
  ];
   /**added by archana for Jira ID-MOBILE-715 end */
  dataFromFindingListScreen: any;
  findingInfo: any;
  findingDetails: any;
  categoryId: any;

  isStatusOpened: boolean = false;
  openStatusBlock: FindingDetail;
  nxtActionDisableArrayOfOpenStatus: any;
  disableWholeOpenStatusBlock: boolean = false;

  isStatusVerifiedAndClosed: boolean = false;
  verifiedAndClosedStausBlock: FindingDetail;
  nxtActionDisableArrayOfVerifyCloseStatus: any;
  disableWholeVerifyCloseStatusBlock: boolean = false;
  verifyCloseStatusMaxDueDate: any;
  backButtonSubscription: any;//added by lokesh for jira_id(800)
  minStatusDate: Date;
  maxStatusDate: Date;
  minDueDate;

  openStatusMaxDueDate;
  saveInFileSystemFiles = [];
  deleteInFileSystemFiles = [];
  dirName: any;
  isIOS: boolean;

  openStatusPlaceHolder: string = '';
  verifiedClosedStatusPlaceHolder: string = '';
  findingStatusList: any;
  portList: any = [];
  portsStringArray: any = [];
  dmlcFindingList: any;
  presentSeq: any;
  auditTypeDesc: any;
  auditSeqNo: any;
  nextActionsplace: any='    ';
  enableCheck: boolean;
  pfList: any;
  checkBoxChecked: any;
  previousdata: any;
  auditSubtype: any;

  constructor(
    private breakpointObserver: BreakpointObserver,
    public appConstant: AppConstant,
    private db: DatabaseService,
    private router: Router,
    public alertController: AlertController,
    private modalCtrl: ModalController,
    public toast: ToastService,
    private platform: Platform,
    private navController: NavController,
    public fileManager: FileManagerService,
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
    this.dataFromFindingListScreen =
      this.router.getCurrentNavigation().extras.state;
    console.log(
      'constructor ->this.dataFromFindingListScreen :',
      this.dataFromFindingListScreen
    );
    this.findingInfo = this.dataFromFindingListScreen.selectedFindingItem;
    this.dmlcFindingList = this.dataFromFindingListScreen.data.dmlcFindingData;
    this.presentSeq = this.dataFromFindingListScreen.data.mlcAuditData.auditData[0].auditSeqNo;       //added by archana for jira-Id-765
    this.minStatusDate = this.dataFromFindingListScreen.data.mlcAuditData.auditData[0].openMeetingDate;   //added by archana for jira ID-MOBILE-872
    this.maxStatusDate = this.dataFromFindingListScreen.data.mlcAuditData.auditData[0].closeMeetingDate;  //added by archana for jira ID-MOBILE-872
    this.auditTypeDesc = this.dataFromFindingListScreen.data.mlcAuditData.auditData[0].auditTypeId == 1003 ? this.appConstant.MLC_SRC : '';
    this.findingDetails = this.findingInfo.findingDtl;
    this.categoryId = this.findingDetails[0].categoryId;
    this.auditSeqNo = this.dataFromFindingListScreen.selectedFindingItem.origSeqNo;
    console.log('findingDetails', this.findingDetails);
    console.log('this.categoryId', this.categoryId);
    this.findingStatusList =
      this.dataFromFindingListScreen.findingStatusList.map(
        (res) => res.FINDINGS_STATUS_DESC
      );

    this.portList =
      this.dataFromFindingListScreen.data.mlcAuditData.masterData.port;
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
    console.log('portList', this.portList);
    /**added by archana for Jira-ID-MOBILE-891 start*/
    this.db.getPreviousAuditdatails(this.dataFromFindingListScreen.data.mlcAuditData.auditData[0].vesselImoNo)
      .then(data => {
        this.previousdata = data;
        this.previousdata.forEach((res) => {
          if (res.auditSeqNo == this.auditSeqNo) {
            this.previousdata = res;
          }
        });
        if (this.previousdata.auditSubTypeID == 1001) {
          this.auditSubtype = "INITIAL"
        } else if (this.previousdata.auditSubTypeID == 1002) {
          this.auditSubtype = "AMENDMENT"
        }
      });
      /**added by archana for Jira-ID-MOBILE-891 end*/

    if (this.findingDetails[0] && this.findingDetails[0].statusId == 1001) {
      //open_status
      this.isStatusOpened = true;
      this.openStatusBlock = this.findingDetails[0];
      if (this.openStatusBlock.nextActionId) {
        this.isStatusVerifiedAndClosed = true;
        //set due date
        if (
          this.openStatusBlock.dueDate == 'DURING NEXT SCHEDULED INSPECTION.'
        ) {
          this.openStatusPlaceHolder = this.openStatusBlock.dueDate;
        }
        // this.openStatusBlock.dueDate == 'CURRENT AUDIT' ? this.openStatusPlaceHolder = this.openStatusBlock.dueDate : '';
        this.verifiedAndClosedStausBlock = {
          ORIG_SEQ_NO: this.findingInfo.origSeqNo,
          currSeqNo:
            this.findingDetails.length <= 1
              ? Number(
                  this.dataFromFindingListScreen.data.mlcAuditData.auditData[0]
                    .auditSeqNo
                )
              : this.findingInfo.currSeqNo,
          categoryId: this.categoryId,
          statusDate: '',
          dueDate: '',
          description: '',
          findingSeqNo: '2',
          findingsNo: this.findingInfo.findingsNo,
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
        console.log('this.openStatusBlock =>', this.openStatusBlock);
       
      }
      /* 
            if (this.verifiedAndClosedStausBlock.nextActionId) {
              // this.disableWholeVerifyCloseStatusBlock = true;
              if (this.verifiedAndClosedStausBlock.dueDate == 'N.A.') {
                this.verifiedClosedStatusPlaceHolder = this.verifiedAndClosedStausBlock.dueDate
              }
            } */
    }

    if (
      this.findingDetails[1] &&
      this.findingDetails[1].statusId ==
        Number(this.appConstant.VERIFIED_CLOSED)
    ) {
      if (this.verifiedAndClosedStausBlock.statusDate) {
        this.disableWholeOpenStatusBlock = true;
      }
      //verify_close_status
      this.isStatusVerifiedAndClosed = true;
      this.verifiedAndClosedStausBlock = this.findingDetails[1];
      this.verifiedAndClosedStausBlock.auditPlace
        ? this.reviewPlace.setValue(this.verifiedAndClosedStausBlock.auditPlace)
        : '';
      if (this.verifiedAndClosedStausBlock.nextActionId) {
        if (this.verifiedAndClosedStausBlock.dueDate == 'N.A.') {
          this.verifiedClosedStatusPlaceHolder =
            this.verifiedAndClosedStausBlock.dueDate;
        }
        // this.disableWholeVerifyCloseStatusBlock = true;
      }
    }
    this.setDisableNxtActionArrays();
    this.initializeFindingDetailBlocks();
  }

  setDisableNxtActionArrays() {
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
  NxtActionChange(event, currentBlock) {
    /**added by archana for Jira-ID-MOBILE-891 start*/
    let findingsCount = 0;
    this.db
      .getLinkedDMLReviewList(this.auditSeqNo)
      .then((dmlcfindingsList: any) => {
        dmlcfindingsList = dmlcfindingsList.filter((res) => {
          return res.origSeqNo == this.auditSeqNo;
        });
        this.pfList = dmlcfindingsList;
        if (this.pfList.length > 0) {
          let len = this.pfList.length - 1;
          this.pfList = this.pfList.forEach((element) => {
            findingsCount = element.findingDtl[element.findingDtl.length - 1].nextActionId == 1010 ? findingsCount + 1 : findingsCount;
          });
          if (len == findingsCount || findingsCount > len) {
            this.enableCheck = true;
          }
        }
      })
    /**added by archana for Jira-ID-MOBILE-891 end*/
    this.nextActionChangeDMLCCategory(event, currentBlock);
  }

  initializeFindingDetailBlocks() {
    this.findingDetails.forEach((findingDetail, i) => {
      this.findingDetails[i].nextActionDesc =
        findingDetail.nextActionId != ''
          ? this.dataFromFindingListScreen.findingStatusList.filter(
              (res) => res.FINDINGS_STATUS_ID === findingDetail.nextActionId
            )[0].FINDINGS_STATUS_DESC
          : '';
    });
    //this.setDisableNxtActionArrays();
  }
  /**added by archana for jira ID-MOBILE-884 start */
  nextActionEmpty(status){
    if(status=='verifyClose'){
      this.verifiedAndClosedStausBlock.nextActionDesc='';
    }
  }
  /**added by archana for jira ID-MOBILE-884 end */

  //DMLc type next Action on change
  nextActionChangeDMLCCategory(event, currentBlock) {
    switch (currentBlock) {
      case 'open':
        console.log(event.value);

        if (event.value == 'VERIFY / CLOSE') {
          this.openStatusBlock.nextActionId = this.appConstant.VERIFY_CLOSE;         //changed by archana for jira ID-MOBILE-916
          this.isStatusVerifiedAndClosed = true;
          if (this.openStatusBlock.dueDate === '')
            this.openStatusPlaceHolder = 'DURING NEXT SCHEDULED INSPECTION.';

          this.verifiedAndClosedStausBlock = {
            ORIG_SEQ_NO: this.findingInfo.origSeqNo,
            currSeqNo:
              this.dataFromFindingListScreen.data.auditData[0].auditSeqNo,
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
        }
        break;

      case 'verifyClose':
        console.log(event.value);
        if (event.value == 'NIL') {
          console.log('verified and closed value is nil');
          /**added by archana for jira ID-MOBILE-884 start */
          if (this.verifiedAndClosedStausBlock.updateFlag == 1 && (this.reviewPlace.value == null || this.reviewPlace.value == '')) {
            this.toast.presentToast('Please enter Review place', 'danger');   //changed by archana for jira ID-MOBILE-894
            let nextActionsplace = ' ';
            this.nextActionsplace = this.nextActionsplace + nextActionsplace;
            this.verifiedAndClosedStausBlock.dueDate = '';
            this.verifiedAndClosedStausBlock.nextActionId = '';
            this.verifiedAndClosedStausBlock.nextActionDesc = this.nextActionsplace;
            this.verifiedClosedStatusPlaceHolder = '';
          } else {
            /**added by archana for jira ID-MOBILE-884 end */
            this.verifiedAndClosedStausBlock.nextActionId = this.appConstant.NIL;
            this.disableWholeOpenStatusBlock = true;
            this.verifiedAndClosedStausBlock.dueDate == ''
              ? (this.verifiedClosedStatusPlaceHolder = 'N.A.')
              : '';
            /** added by archana for JIra -ID -MOBILE-874 start */
             if(this.dataFromFindingListScreen.data.mlcAuditData.auditData[0].auditSubTypeID == 1001){
                var auditSubTypeDesc = this.appConstant.AUDIT_SUB_TYPE[1001].SUB_TYPE_DESC;
              } else if(this.dataFromFindingListScreen.data.mlcAuditData.auditData[0].auditSubTypeID == 1002){
                var auditSubTypeDesc = this.appConstant.AUDIT_SUB_TYPE[1002].SUB_TYPE_DESC;
              } else if(this.dataFromFindingListScreen.data.mlcAuditData.auditData[0].auditSubTypeID == 1003){
                var auditSubTypeDesc = this.appConstant.AUDIT_SUB_TYPE[1003].SUB_TYPE_DESC;
              } else if(this.dataFromFindingListScreen.data.mlcAuditData.auditData[0].auditSubTypeID == 1004){
                var auditSubTypeDesc = this.appConstant.AUDIT_SUB_TYPE[1004].SUB_TYPE_DESC;
              } else if(this.dataFromFindingListScreen.data.mlcAuditData.auditData[0].auditSubTypeID == 1005){
                var auditSubTypeDesc = this.appConstant.AUDIT_SUB_TYPE[1005].SUB_TYPE_DESC;
              }
            this.verifiedAndClosedStausBlock.updateDescription =
              'Verify/Close status has been updated as part of MLC'+' '+ auditSubTypeDesc+' '+'INSPECTION at '+ this.reviewPlace.value + ' by ' + this.dataFromFindingListScreen.data.mlcAuditData.auditAuditorData[0].auditorName.toUpperCase()+ ' on ' + moment(this.verifiedAndClosedStausBlock.statusDate).format('DD-MMM-YYYY');
            
         /** added by archana for JIra -ID -MOBILE-874 end */
            }
          } else if ('PREVIOUS STATUS') {
          console.log('Previous status of verify closed');
          // this.disableWholeOpenStatusBlock = false;
          this.verifiedAndClosedStausBlock.statusDate = '';
          this.verifiedAndClosedStausBlock.dueDate = '';
          this.verifiedAndClosedStausBlock.nextActionId = '';
          this.verifiedAndClosedStausBlock.nextActionDesc = ' ';
          this.verifiedAndClosedStausBlock.updateDescription = '';
          this.verifiedAndClosedStausBlock.description = '';      //added by archana for Jira-ID-MOBILE-882
          this.reviewPlace.setValue('');
          this.verifiedClosedStatusPlaceHolder='';
          this.verifiedAndClosedStausBlock.findingRptAttachs= [];
        }
        9;
        break;
      default:
        break;
    }
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
    console.log(
      'onInit ->this.dataFromFindingListScreen :',
      this.dataFromFindingListScreen
    );
    this.filteredOptions = this.reviewPlace.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  findingValidation(): Boolean {
    let saveFlag = true;
    let currentFindingDetails = [];
    if (this.openStatusBlock && this.openStatusBlock.nextActionId != '') {
      this.openStatusBlock.dueDate == ''
        ? (this.openStatusBlock.dueDate = this.openStatusPlaceHolder)
        : '';
      currentFindingDetails.push(this.openStatusBlock);

      if (this.verifiedAndClosedStausBlock && this.verifiedAndClosedStausBlock.statusDate) {
        this.verifiedAndClosedStausBlock.dueDate == ''
          ? (this.verifiedAndClosedStausBlock.dueDate =
              this.verifiedClosedStatusPlaceHolder)
          : '';
        currentFindingDetails.push(this.verifiedAndClosedStausBlock);
        if (this.reviewPlace.value) {
          this.verifiedAndClosedStausBlock.auditPlace = this.reviewPlace.value;
        } else {
          saveFlag = false;
          this.toast.presentToast('Please enter Review Place', 'danger');
        }
        if(this.enableCheck == true && this.verifiedAndClosedStausBlock.checkboxUpdate == 0){
          this.toast.presentToast(
            "please mark to complete previous Review",
            'danger'
          );
          saveFlag = false;
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

    //validation
    currentFindingDetails.forEach((findingDetail, index) => {
      if (this.dataFromFindingListScreen.data.DmlcAuditData && !this.dataFromFindingListScreen.data.DmlcAuditData[0].auditSeqNo) {   //changed by archana for Jira ID-MOBILE-873
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

  /**added by archana for Jira-ID-MOBILE-891 start*/
  textBoxRequir(e){
     if(e.currentTarget.checked == true){
      this.checkBoxChecked = 1;
      this.verifiedAndClosedStausBlock.checkboxUpdate = 1;
    } else {
      this.enableCheck = true;     
      this.checkBoxChecked = 0;
      this.verifiedAndClosedStausBlock.checkboxUpdate = 0;
    }
 }
/**added by archana for Jira-ID-MOBILE-891 end*/
  /**added by archana for jira-Id-MOBILE-876 start */
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
    if (isNotTheExistingFile) {
      block.findingRptAttachs.push({
        companyId: 2,
        currentAuditSeq: block.updateFlag == 0 ? this.findingInfo.origSeqNo : Number(this.presentSeq),       
        dateIns: moment(new Date()).format('YYYY-MM-DD'),
        fileName: file.name,
        fileSeqNo: newFileSeqNo.toString(),
        findingNo: this.findingInfo.findingsNo,
        findingSeqNo: block.findingsSeqNo ? block.findingsSeqNo : block.findingSeqNo,
        origAuditSeqNo: this.findingInfo.origSeqNo,
        ownerFlag: 0,
        statusSeqNo: block.findingsSeqNo ? block.findingsSeqNo : block.findingSeqNo,
        userIns: this.findingInfo.userIns,
      });

      console.log(block);

      this.saveInFileSystemFiles.push({
        file: file,
        fileName: file.name,
        findingNo: this.findingInfo.findingsNo,
        findingSeqNo: block.findingsSeqNo ? block.findingsSeqNo : block.findingSeqNo,
        fileSeqNo: newFileSeqNo.toString(),
      });

      // console.log(this.saveInFileSystemFiles);
    }
    console.log(block.findingRptAttachs);
  }


  async deleteOptions(attachment, block) {
    const alert = this.alertController.create({
      mode: 'ios',
      header: 'Delete Attachment',
      message: 'Are you sure you want to delete this attachment?',
      cssClass: 'alertCancel',  
      buttons: [
        {
          text: 'Yes',
          cssClass: 'alertButton',  
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
   }

   /**added by archana for jira-Id-MOBILE-876 end*/

  save() {
    this.findingValidation() ? this.saveOptions() : '';
  }

  async saveOptions(isBackButtonPressed?: boolean) {
    const alert = this.alertController.create({
      mode: 'ios',
      header: 'Save Review Note',
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

  saveConfirmed(isBackButtonPressed?: boolean) {
    let findings = [];
    let findingDetails = [];
    let findingAttachments = [];
    console.log('Finding Information', this.findingInfo);
    console.log('UFinding Information', this.findingInfo);

    const updateIndex = this.dmlcFindingList.findIndex(
      (finding) => finding.findingsNo === this.findingInfo.findingsNo
    );
    console.log('updated index : ', updateIndex);
    if (updateIndex >= 0) this.dmlcFindingList[updateIndex] = this.findingInfo;

    const finalFindigData = this.dmlcFindingList;

    finalFindigData.forEach((finding, findIndex) => {
      findings.push({
        seqNo: findIndex + 1,
        currSeqNo: finding.currSeqNo ? finding.currSeqNo : '',
        origSeqNo: finding.origSeqNo ? finding.origSeqNo : '',
        findingsNo: finding.findingsNo,
        auditDate: finding.auditDate ? finding.auditDate : '',
        auditCode: finding.auditCode,
        companyId: finding.companyId ? finding.companyId : 2,       //changed by archana for Jira ID-MOBILE-873
        userIns: finding.userIns
          ? finding.userIns
          : this.dataFromFindingListScreen.data.DmlcAuditData[0].userIns,
        findingStatus: 0,
        dateIns: finding.dateIns
          ? finding.dateIns
          : moment(new Date()).format(this.appConstant.YYYYMMDD),
        serialNo: finding.serialNo,
      });

      //moment(new Date()).format(YYYYMMDD)
      if (finding.findingDtl.length > 0) {
        finding.findingDtl.forEach((findingDetail, findDtlIndex) => {
          if (findingDetail.nextActionId && findingDetail.nextActionId != '') {
            console.log(
              'findingDetail(' +
                (findIndex + 1) +
                ')(' +
                (findDtlIndex + 1) +
                ')',
              findingDetail
            );
            findingDetails.push({
              seqNo: findDtlIndex + 1,
              currSeqNo: findingDetail.updateFlag == 0 ? findingDetail.currSeqNo : this.presentSeq,
              origSeqNo: findingDetail.ORIG_SEQ_NO
                ? findingDetail.ORIG_SEQ_NO
                : '',
              findingsNo: finding.findingsNo,
              findingSeqNo: findDtlIndex + 1 + '',
              categoryId: findingDetail.categoryId,
              statusId: findingDetail.statusId,
              statusDate: findingDetail.statusDate,
              companyId: findingDetail.companyId ? findingDetail.companyId : 2,    //changed by archana for Jira ID-MOBILE-873
              nextActionId: Number(findingDetail.nextActionId),
              dueDate: findingDetail.dueDate,
              description: findingDetail.description
                ? findingDetail.description
                : '',
              userIns: findingDetail.userIns
                ? findingDetail.userIns
                : this.dataFromFindingListScreen.data.mlcAuditData.auditData[0]
                    .userIns,
              dateIns: findingDetail.dateIns
                ? findingDetail.dateIns
                : moment(new Date()).format(this.appConstant.YYYYMMDD),
              auditTypeId: findingDetail.auditTypeId ? findingDetail.auditTypeId : '',     //changed by archana for Jira ID-MOBILE-873
              updateDescription: findingDetail.updateDescription
                ? findingDetail.updateDescription
                : '',
              updateFlag: findingDetail.updateFlag ? findingDetail.updateFlag : 0,       //added by archana for jira ID-MOBILE-877
              enableCheck:this.enableCheck,                                            //added by archana for Jira-ID-MOBILE-891
              checkboxUpdate: findingDetail.checkboxUpdate? findingDetail.checkboxUpdate : 0,
              auditPlace: findingDetail.auditPlace
                ? findingDetail.auditPlace
                : '',
            });

            /*  if (findingDetail.findingRptAttachs.length > 0) {
              findingDetail.findingRptAttachs.forEach((findingAttachment, findAttachIndex) => {
                console.log('findingAttachment(' + (findIndex + 1) + ')(' + (findDtlIndex + 1) + ')(' + (findAttachIndex + 1) + ')', findingDetail);
 
                findingAttachments.push({
                  seqNo: findAttachIndex + 1,
                  currSeqNo: this.dataFromAuditDetailPage.auditSeqNo ? this.dataFromAuditDetailPage.auditSeqNo : '',
                  origSeqNo: this.dataFromAuditDetailPage.auditSeqNo ? this.dataFromAuditDetailPage.auditSeqNo : '',
                  findingsNo: findIndex + 1 + '',
                  findingSeqNo: findDtlIndex + 1 + '',
                  fileSeqNo: findAttachIndex + 1 + '',
                  fileName: findingAttachment.fileName,
                  flag: findingAttachment.ownerFlag,
                  companyId: finding.companyId,
                  userIns: this.dataFromAuditDetailPage.userIns ? this.dataFromAuditDetailPage.userIns : '',
                  dateIns: this.dataFromAuditDetailPage.dateIns ? this.dataFromAuditDetailPage.dateIns : ''
                })
              });
            }  */
             console.log(findingDetail);
             /**added by archana for jira-Id-MOBILE-876 start*/ 
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
             /**added by archana for jira-Id-MOBILE-876 end*/


          }
        });
      }
    });
    console.log('Findings : ', findings);
    console.log('findingDetails : ', findingDetails);
    /**added by archana for jira-ID-MOBILE-876 start */
    this.db
      .savePrevFindingData({ findings, findingDetails, findingAttachments },this.auditSeqNo,this.presentSeq)      // changed by archana for jira-id-765
      .then(() => {
        this.deleteInFileSystemFiles.forEach((attachmentObj) => {
            this.db
          .deleteFindingAttach(attachmentObj, this.auditSeqNo)
          .then((res) => {
           this.db.getCurrentDbRecords();
          })

          this.fileManager.deletePrevFindingAttachment(this.auditTypeDesc, this.auditSeqNo, attachmentObj, this.presentSeq);
         });
        })
        .then(() => {
          this.saveInFileSystemFiles.forEach((attachmentObj) => {
            console.log(attachmentObj);

            this.fileManager.savePrevFindingAttachmentFile(
              this.auditTypeDesc,
              this.auditSeqNo,
              attachmentObj,
              this.presentSeq
            );
          });
        })
        /**added by archana for jira-ID-MOBILE-876 end */
        .then(() => {
          
          this.db.getCurrentDbRecords();
        console.log('Review note of linked dmlc has been updated in sqlite db');
        this.toast.presentToast('Review Note Updated successfully', 'success');
       // this.goBack(); commented by lokesh for jira_id(670)
      });
  }

  goBack() {
    this.router.navigateByUrl("/perform/dmlc-findings")//added by lokesh for jira_id(800)
  }
  //added by lokesh for jira_id(800) Start here
  ngAfterViewInit() {
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      this.router.navigateByUrl("/perform/dmlc-findings")
    }); 
  }
   ngOnDestroy() {
    console.log('ngOnDestroy');
    //this.setFindingToCurrentFindingsObj();
    this.backButtonSubscription.unsubscribe();//added by lokesh for jira_id(858)
  }
  //added by lokesh for jira_id(800) End here
  //verifyCloseStatus
  verifiedAndClosedStausBlockStatusDateOnChange(event) {
    if (event.value != '') {
      this.verifiedAndClosedStausBlock.statusDate = moment(event.value).format(
        'YYYY-MM-DD'
      );
      this.verifiedAndClosedStausBlock.dueDate == ''
        ? (this.verifiedClosedStatusPlaceHolder = 'N.A.')
        : '';
      /*  this.isPlanAcceptedStatusStatusDateDisabled = true;
       this.isPlanAcceptedStatusDueDateDisabled = true;
       this.isPlanAcceptedStatusDescriptionDisabled = true; */
    }
  }
  verifiedAndClosedStausBlockStatusDateClear(event) {
    event.stopPropagation();
    this.verifiedAndClosedStausBlock.statusDate = '';
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
  }

  reviewPlace = new FormControl();
  filteredOptions: Observable<string[]>;

  private _filter(value: string): string[] {
    const filterValue = value.toString().toLowerCase();

    return this.portsStringArray.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }
  // Check if device is phone or tablet
  get isMobile() {
    return this.breakpointObserver.isMatched('(max-width: 767px)');
  }
//added by ramya on 13-06-2022 for jira id - MOBILE-571
  descriptionMaxLengthValidation(desc){
    if (desc.length > 2500) {
      desc= desc.slice(0, 2500);
      this.toast.presentToast('Description should be less than 2500 characters', 'danger');
    }
  }

  /**added by archana for jira-ID-MOBILE-876 start */
  downloadAttachment(attachment, block) {

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
    return new Promise<boolean>((resolve, reject) => {
      this.filesys.checkFile
        (directory +
          '/AuditDetails/' +
          this.auditTypeDesc +
          '/' +
          this.presentSeq +
          '/' +
          'pf/' +
          this.auditSeqNo +
          '/' +
          attachment.findingNo +
          '/' +
          attachment.findingSeqNo + '/',

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
  copyFileToDownloadsFolder(attachment) {
    let directory = this.dirName;
    this.checkAuditingAppDownloadsFolder().then((res) => {
      console.log(res);

      this.checkAuditingAppDownloadsFolderPrevFindings()
        .then((res) => {
          this.saveattachmentFolder(directory, attachment);
        })
        .catch((err) => {
          this.createAuditingAppDownloadsFolderPrevFindings().then((res) => {
            this.saveattachmentFolder(directory, attachment);
          })
        })
     }).catch((err) => {
      if(!this.isIOS){
      this.createAuditingAppDownloadsFolder().then((res) => {
        console.log(res);
        this.checkAuditingAppDownloadsFolderPrevFindings()
          .then((res) => {
            this.saveattachmentFolder(directory, attachment);
          })
          .catch((err) => {
            this.createAuditingAppDownloadsFolderPrevFindings().then((res) => {
              this.saveattachmentFolder(directory, attachment);
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
            this.presentSeq +
            '/' +
            'pf/'+
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
      /**added by archana for Jira ID-MOBILE-715 end*/
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
  checkAuditingAppDownloadsFolderPrevFindings(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.filesys
        .checkDir(
          this.filesys.externalRootDirectory + 'Download/' +
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
  createAuditingAppDownloadsFolderPrevFindings() {
    return new Promise<boolean>((resolve, reject) => {
      this.filesys
        .createDir(
          this.filesys.externalRootDirectory + 'Download/' + 'AUDITING_APP_DOWNLOADS/',
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

  saveattachmentFolder(directory, attachment) {
    this.filesys
      .copyFile(
        directory +
        '/AuditDetails/' +
        this.auditTypeDesc +
        '/' +
        this.presentSeq +
        '/' +
        'pf/' +
        this.auditSeqNo +
        '/' +
        attachment.findingNo +
        '/' +
        attachment.findingSeqNo + '/',

        attachment.fileName,
        this.filesys.externalRootDirectory + 'Download/AUDITING_APP_DOWNLOADS/' + 'PreviousFindings/',
        attachment.fileName
      );
    var attach = '/AuditDetails/' + this.auditTypeDesc + '/' + this.presentSeq + '/' + 'pf/' + this.auditSeqNo + '/' + attachment.findingNo + '/' + attachment.findingSeqNo + '/' + attachment.fileName;
    this.toast.presentToast(
      'File Downloaded successfully in Download/AUDITING_APP_DOWNLOADS/  PreviousFindings Folder',
          'success'
    );
    // this.fileManager.openPdfFindings(directory, attach).then(() => {
    // });
  }
  /**added by archana for jira-ID-MOBILE-876 start */
}
