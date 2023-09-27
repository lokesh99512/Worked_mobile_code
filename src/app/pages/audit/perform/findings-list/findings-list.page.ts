import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  ModalController,
  Platform,
} from '@ionic/angular';
import { AppConstant } from 'src/app/constants/app.constants';
import { DatabaseService } from 'src/app/providers/database.service';
import { FindingService } from 'src/app/providers/finding.service';
import { LoadingIndicatorService } from 'src/app/providers/loading-indicator.service';
import { ToastService } from 'src/app/providers/toast.service';
import { FindingCreationModalPage } from '../finding-creation-modal/finding-creation-modal.page';

@Component({
  selector: 'app-findings-list',
  templateUrl: './findings-list.page.html',
  styleUrls: ['./findings-list.page.scss'],
})
export class FindingsListPage implements OnInit {
  dataFromAuditDetailPage: any;
  auditReportNo: any;
  auditSeqNo: any;
  findingList: any;
  auditTypeId: any;
  auditDate: any;
  auditStatusId: any;

  pageTitle: string;
  auditType: string;
  auditauditType: string;
  auditTypeDesc: string;
  majorCountDesc: string;
  minorCountDesc: string;
  obsCountDesc: string;

  //reviewCountDesc: any;
  masterData: any;
  auditCategoryList: any;
  findingCategoryOptionsList: any;
  selectedCategoryOptionToAddNewFinding: any;

  majorCount: number = 0;
  minorCount: number = 0;
  obsCount: number = 0;
  totalCount: number = 0;

  backButtonSubscription: any;
  findingCategoryId: number;
  findingCatDesc = '';
  isFindingExist = true;
  auditSubTypeId: any;

  constructor(
    private appConstant: AppConstant,
    private db: DatabaseService,
    private router: Router,
    public alertController: AlertController,
    private modalCtrl: ModalController,
    public loader: LoadingIndicatorService,
    private breakpointObserver: BreakpointObserver, // added by lokesh for jira-id(617,557)
    public toast: ToastService,
    private platform: Platform,
    private route:ActivatedRoute,
    private findingService: FindingService
  ) {
    let dataFromAuditDetail =   JSON.parse(
      this.route.snapshot.paramMap.get('findingDetails'));//added by lokesh for jira_id(858)
    console.log(dataFromAuditDetail);
    
    this.dataFromAuditDetailPage = dataFromAuditDetail;
    console.log(this.dataFromAuditDetailPage);
    this.auditTypeId = this.dataFromAuditDetailPage.auditTypeId;
    this.auditReportNo = this.dataFromAuditDetailPage.auditReportNo;
    this.auditSeqNo = this.dataFromAuditDetailPage.auditSeqNo;
    this.auditDate = this.dataFromAuditDetailPage.auditDate;
    this.auditSubTypeId = this.dataFromAuditDetailPage.auditSubTypeId;
    this.auditStatusId = this.dataFromAuditDetailPage.auditStatusId;       //added by @Ramya on 14-6-2022 for jira id - MOBILE-553
  }

  ionViewWillEnter() {
    this.db
      .getCurrentFindingDataList(this.auditSeqNo)
      .then((findingListArray: any) => {
        console.log('FindingListArray', findingListArray);
        console.log(findingListArray);
        this.findingList = findingListArray;
        findingListArray.length > 0
          ? (this.isFindingExist = true)
          : (this.isFindingExist = false);
        // this.setFindingCount();
        let count = this.findingService.getFindingCount(this.findingList);
        this.totalCount = count.total;
        this.majorCount = count.maj;
        this.minorCount = count.min;
        this.obsCount = count.obs;
      });
    // this.setCurrentFinding();
    let findingDataDescriptions = this.findingService.findingDataDescriptions(
      this.auditTypeId
    );

    this.pageTitle = findingDataDescriptions.pageTitle;

    this.auditType = findingDataDescriptions.auditType;

    this.majorCountDesc = findingDataDescriptions.majorCountDesc;

    this.minorCountDesc = findingDataDescriptions.minorCountDesc;

    this.obsCountDesc = findingDataDescriptions.obsCountDesc;

    this.auditauditType = findingDataDescriptions.auditauditType;

    this.auditTypeDesc = findingDataDescriptions.auditTypeDesc=="DMLC"?"DMLC II":findingDataDescriptions.auditTypeDesc;//modified by lokesh for jira_id(817)    
  }

  /*  setFindingCount() {
    this.findingList.forEach((finding) => {
      this.totalCount++;
      if (
        finding.serialNo.includes('MNC') ||
        finding.serialNo.includes('MF') ||
        finding.serialNo.includes('SD')
      ) {
        this.majorCount++;
      } else if (
        finding.serialNo.includes('NC') ||
        finding.serialNo.includes('FAILURE') ||
        finding.serialNo.includes('DEFICIENCY')
      ) {
        this.minorCount++;
      } else if (finding.serialNo.includes('OBS')) {
        this.obsCount++;
      }
    });
  } */

  /*  setCurrentFinding() {
    if (this.auditTypeId == this.appConstant.ISM_TYPE_ID) {
      this.pageTitle = 'ism audit';

      this.auditType = 'Audit';

      this.majorCountDesc = 'MNC';

      this.minorCountDesc = 'NC';

      this.obsCountDesc = 'OBS';

      this.auditauditType = 'ISM';

      this.auditTypeDesc = 'ISM';
    } else if (this.auditTypeId == this.appConstant.ISPS_TYPE_ID) {
      this.pageTitle = 'isps audit';

      this.auditType = 'Audit';

      this.majorCountDesc = 'MF';

      this.minorCountDesc = 'FAILURE';

      this.obsCountDesc = 'OBS';

      this.auditauditType = 'ISPS';

      this.auditTypeDesc = 'ISPS';
    } else if (this.auditTypeId == this.appConstant.MLC_TYPE_ID) {
      this.pageTitle = 'mlc inspection';

      this.auditType = 'Inspection';

      this.majorCountDesc = 'SD';

      this.minorCountDesc = 'DEFICIENCY';

      this.obsCountDesc = 'OBS';

      this.auditauditType = 'MLC';

      this.auditTypeDesc = 'MLC';
    } else if (this.auditTypeId == this.appConstant.SSP_TYPE_ID) {
      this.pageTitle = 'ssp review';

      this.auditType = 'Review';

      this.auditauditType = 'SSP';

      this.auditTypeDesc = 'SSP';
    } else if (this.auditTypeId == this.appConstant.DMLC_TYPE_ID) {
      this.reviewCountDesc = 'REVIEW NOTES';

      this.pageTitle = 'dmlc ii review';

      this.auditType = 'Review';

      this.auditauditType = 'DMLC II';

      this.auditTypeDesc = 'DMLC';
    }
  } */
  ngOnInit() {
    this.loader.showLoader('Fetching Findings....');
    this.db.getMaDatasForFindings(this.auditTypeId).then((auditCodes) => {
      console.log('auditCodes', auditCodes);
      this.masterData = auditCodes;
      //this.auditCategoryList = auditCodes[2];
      // this.findingCategoryOptionsList = this.auditCategoryList.map(res => res.FINDINGS_CATEGORY_DESC);
    });
    this.loader.hideLoader();
  }

  async deleteOptions(findingItem) {
    const alert = this.alertController.create({
      mode: 'ios',
      header: this.auditType =='Review' ? 'Review Note' : 'Delete Finding', // modified by lokesh for jira_id(662,717)
      message:
        this.auditTypeId == this.appConstant.DMLC_TYPE_ID
          ? 'Do you want to delete the Review Note'
          : 'Do you want to delete the Finding',
          cssClass: 'alertCancel', //added by archana for jira id-MOBILE-649
      buttons: [
        {
          text: 'Yes',
          cssClass: 'alertButton', //added by archana for jira id-MOBILE-649
          handler: () => {
            console.log('Delete Confired');
            this.deleteFinding(findingItem);
          },
        },
        {
          text: 'No',
          cssClass: 'alertButton', //added by archana for jira id-MOBILE-649
          handler: () => {
            console.log('Delete Rejected');
          },
        },
      ],
    });
    (await alert).present();
  }

  async OpenAddNewModel() {
    if (this.dataFromAuditDetailPage.status != 1002) {
  /** changed by lokesh for jira_id(617,557) START HERE*/
  if(this.breakpointObserver.isMatched('(max-width: 767px)')==false){
    const presentModel = await this.modalCtrl.create({
      component: FindingCreationModalPage,
      componentProps: {
        auditTypeDesc: this.auditauditType,
        title:
          this.auditTypeId == this.appConstant.DMLC_TYPE_ID
            ? 'Add Review Note'
            : 'Add New Finding',
        auditCodeAndElements: this.masterData[0],
        categoryOptions: this.masterData[2],
        type: 'finding',
      },
      showBackdrop: true,
      mode: 'ios',
      animated: true,
    });
  
    presentModel.onDidDismiss().then((findingItemFromModal: any) => {
      findingItemFromModal = findingItemFromModal.data;
      console.log('New Finding Obj from the modal : ', findingItemFromModal);
      findingItemFromModal.serialNo = this.getNewFindingSerialNo(
        findingItemFromModal.serialNo
      );
      this.createFinding(findingItemFromModal);
    });
  
    return await presentModel.present();
  }else if(this.breakpointObserver.isMatched('(max-width: 767px)')==true){
    const presentModel = await this.modalCtrl.create({
      component: FindingCreationModalPage,
      componentProps: {
        auditTypeDesc: this.auditauditType,
        title:
          this.auditTypeId == this.appConstant.DMLC_TYPE_ID
            ? 'Add Review Note'
            : 'Add New Finding',
        auditCodeAndElements: this.masterData[0],
        categoryOptions: this.masterData[2],
        type: 'finding',
      },
      showBackdrop: true,
      mode: 'ios',
      cssClass: 'add-new-finding-modal',
      animated: true,
    });
  
    presentModel.onDidDismiss().then((findingItemFromModal: any) => {
      findingItemFromModal = findingItemFromModal.data;
      console.log('New Finding Obj from the modal : ', findingItemFromModal);
      findingItemFromModal.serialNo = this.getNewFindingSerialNo(
        findingItemFromModal.serialNo
      );
      this.createFinding(findingItemFromModal);
    });
  
    return await presentModel.present();
  }
  /** changed by lokesh for jira_id(617,557) END HERE*/
    } else {
      if (this.dataFromAuditDetailPage.status == 1002) {
        //toster modifid by lokesh for jira_id(674)
        this.toast.presentToast((this.auditType =='Review' ? 'REVIEW' : 'AUDIT') +' status is completed', 'danger');
      }
    }
  }

  getNewFindingSerialNo(serialNo): String {
    console.log(serialNo); //mnc
    console.log('this.findingList', this.findingList);

    var a = this.findingList.filter((finding) =>
      finding.serialNo.includes('-' + serialNo)
    );
    var maxSameCat = 0;
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', a);
    if (a.length > 0)
      maxSameCat = Number(
        a[a.length - 1].serialNo.substring(
          a[a.length - 1].serialNo.lastIndexOf('-') + 1
        )
      );

    this.findingCatDesc = serialNo;
    let sn: string = '';
    console.log('serial Number before concatinate : ', serialNo);
    if (serialNo == 'MNC' || serialNo == 'MF' || serialNo == 'SD') {
      this.findingCategoryId = this.appConstant.MAJOR_FINDING_CATEGORY;
      sn = this.auditReportNo + '-' + serialNo + '-' + (maxSameCat + 1);
    } else if (
      serialNo == 'NC' ||
      serialNo == 'FAILURE' ||
      serialNo == 'DEFICIENCY'
    ) {
      this.findingCategoryId = this.appConstant.MINOR_FINDING_CATEGORY;
      sn = this.auditReportNo + '-' + serialNo + '-' + (maxSameCat + 1);
    } else if (serialNo == 'OBS') {
      this.findingCategoryId = this.appConstant.OBS_FINDING_CATEGORY;
      sn = this.auditReportNo + '-' + serialNo + '-' + (maxSameCat + 1);
    } else if (serialNo == 'REVIEW NOTE') {
      this.findingCategoryId = this.appConstant.REVIEW_NOTE;
      sn = this.auditReportNo + '-' + serialNo + '-' + (maxSameCat + 1);
    }
    console.log('serial Number before concatinate : ', sn);

    return sn;
  }

  createFinding(findingItemFromModal) {
    findingItemFromModal.auditDate = this.auditDate;
    findingItemFromModal.currSeqNo = Number(this.auditSeqNo);
    findingItemFromModal.origSeqNo = Number(this.auditSeqNo);
    (findingItemFromModal.findingsNo = (this.totalCount + 1).toString()),
      this.router.navigateByUrl('/perform/finding-details', {
        state: {
          auditInfo: {
            auditSubType:this.dataFromAuditDetailPage.auditSubType, /**added changed by lokesh for jira_id(728,727) */
            auditSeqNo: Number(this.auditSeqNo),
            auditTypeId: this.auditTypeId,
            auditType: this.auditType,
            auditSubTypeId: this.auditSubTypeId,
            auditDate: this.auditDate,
            auditTypeDesc: this.auditauditType,
            openMeetingDate:this.auditTypeId == this.appConstant.DMLC_TYPE_ID?this.auditDate: this.dataFromAuditDetailPage.openMeetingDate,//condision modified by lokesh for jira_id(837,805)
            closeMeetingDate: this.auditTypeId == this.appConstant.DMLC_TYPE_ID?this.auditDate:this.dataFromAuditDetailPage.closeMeetingDate,//condision modified by lokesh for jira_id(837,805)
            companyId: this.dataFromAuditDetailPage.companyId,
            userIns: this.dataFromAuditDetailPage.userIns,
            dateIns: this.dataFromAuditDetailPage.dateOfIns,
            auditReportNo: this.auditReportNo,
          },
          findingInfo: findingItemFromModal,
          findingNo: this.totalCount + 1,
          findingStatusList: this.masterData[1],
          findingCategoryId: this.findingCategoryId,
          findingCatDesc: this.findingCatDesc,
          isNewFinding: true,
        },
      });
  }

  updateFinding(findingItem) {
    console.log('findingItem', findingItem);
    this.router.navigateByUrl('/perform/finding-details', {
      state: {
        auditInfo: {
          auditSeqNo: this.auditSeqNo,
          auditTypeId: this.auditTypeId,
          auditType: this.auditType,
          auditSubTypeId: this.auditSubTypeId,
          auditDate: this.auditDate,
          auditTypeDesc: this.auditauditType,
          openMeetingDate:this.auditTypeId == this.appConstant.DMLC_TYPE_ID?this.auditDate: this.dataFromAuditDetailPage.openMeetingDate,//condision modified by lokesh for jira_id(837)
          closeMeetingDate: this.auditTypeId == this.appConstant.DMLC_TYPE_ID?this.auditDate:this.dataFromAuditDetailPage.closeMeetingDate,//condision modified by lokesh for jira_id(837)
          companyId: this.dataFromAuditDetailPage.companyId,
          userIns: this.dataFromAuditDetailPage.userIns,
          dateIns: this.dataFromAuditDetailPage.dateOfIns,
          auditReportNo: this.auditReportNo,
          status: this.dataFromAuditDetailPage.status,
        },
        findingInfo: findingItem,
        findingNo: findingItem.findingsNo,
        findingStatusList: this.masterData[1],
        findingCategoryId: findingItem.findingDtl[0].categoryId,
        findingCatDesc: this.findingCatDesc,
        isNewFinding: false,
      },
    });
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit');
    this.findingList == undefined || this.findingList.length == 0
      ? (this.isFindingExist = false)
      : (this.isFindingExist = true);
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      this.router.navigateByUrl('/perform/audit-details');
    });
  }

  async goBack() {
    this.router.navigateByUrl('/perform/audit-details');
  }

  ngOnDestroy() {
    console.log('ngOnDestroy');
    //this.setFindingToCurrentFindingsObj();
    this.backButtonSubscription.unsubscribe();//added by lokesh for jira_id(858)
  }

  deleteFinding(findingItem) {
    this.db.deleteFindingReviewNote(findingItem).then((res) => {
      if (res) {
        if (this.auditTypeId == this.appConstant.DMLC_TYPE_ID) {
          this.toast.presentToast(
            'Review Note(s) deleted successfully',
            'success'
          );
          //toaster.success('Review Note(s) deleted successfully');
        } else {
          this.toast.presentToast('Finding(s) deleted successfully', 'success');
          // toaster.success('Finding(s) deleted successfully');
        }

        this.db
          .getCurrentFindingDataList(this.auditSeqNo)
          .then((findingListArray: any) => {
            console.log('FindingListArray', findingListArray);
            console.log(findingListArray);
            this.findingList = findingListArray;
            findingListArray.length > 0
              ? (this.isFindingExist = true)
              : (this.isFindingExist = false);

            //this.setFindingCount();
            let count = this.findingService.getFindingCount(this.findingList);
            this.totalCount = count.total;
            this.majorCount = count.maj;
            this.minorCount = count.min;
            this.obsCount = count.obs;
          });

        console.log('this.findingList', this.findingList);
        console.log('this.findingList', this.findingList);
      } else {
        this.toast.presentToast('Something went wrong', 'danger');
      }
    });
  }
}
