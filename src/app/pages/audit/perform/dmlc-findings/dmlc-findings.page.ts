import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { AppConstant } from 'src/app/constants/app.constants';
import { DatabaseService } from 'src/app/providers/database.service';
import { LoadingIndicatorService } from 'src/app/providers/loading-indicator.service';
import { ToastService } from 'src/app/providers/toast.service';

@Component({
  selector: 'app-dmlc-findings',
  templateUrl: './dmlc-findings.page.html',
  styleUrls: ['./dmlc-findings.page.scss'],
})
export class DmlcFindingsPage implements OnInit {
  data
  auditStatusId: any;
  final: any;
  backButtonSubscription:any;/**added by lokesh for jira_id(788)*/
  pfList: any;
  finalAuditStatus: any;
  constructor(public appConstant: AppConstant, private db: DatabaseService, private router: Router, public alertController: AlertController, private modalCtrl: ModalController, public loader: LoadingIndicatorService, public toast: ToastService,
    private platform:Platform) {
    this.data = this.router.getCurrentNavigation().extras.state;
  }

  ngOnInit() {
    console.log('Vooooou wooveee', this.data)
    this.auditStatusId = this.data.mlcAuditData.auditData[0].auditStatusId; // added by archana for jira id-Mobile-763
  }
  
  /**added by archana for jira-Id-MOBILE-873 start*/
  async ionViewWillEnter() { 
    this.loader.showLoader('Fetching Review notes....');
    let sspDmlcAuditSeqNo =
    this.data.mlcAuditData.auditData[0].sspDetailsData.sspDmlcAuditSeqNo;
  if (sspDmlcAuditSeqNo) {
    console.log('sspDmlcAuditSeqNo', sspDmlcAuditSeqNo);
    /** added by archana for jira-id-MOBILE-891 start */
    await this.db
      .getLinkedDMLReviewList(sspDmlcAuditSeqNo)
      .then((dmlcfindingsList: any) => {
          if (dmlcfindingsList.length > 0) {
            this.pfList = dmlcfindingsList;
        }
       this.checkList();
      });
      /** added by archana for jira-id-MOBILE-891 end */
     await this.db
      .getLinkedDMLReviewList(sspDmlcAuditSeqNo)
      .then((dmlcfindingsList: any) => {
          if (dmlcfindingsList.length > 0) {
            this.data.dmlcFindingData = dmlcfindingsList;
        }
        this.loader.hideLoader();
      });
    }
  }
  /**added by archana for jira-Id-MOBILE-873 end*/
  /** added by archana for jira-id-MOBILE-891 start */
  checkList(){
    this.pfList.forEach((data)=>{
      data.findingDtl.forEach((dat)=>{
        if(dat.checkboxUpdate == 1){
          let findingsCount = 0;
          this.final = this.pfList.filter((res)=>{
            return res.origSeqNo == dat.ORIG_SEQ_NO;
          })
          this.final.forEach((res)=>{
            findingsCount = res.findingDtl[res.findingDtl.length-1].nextActionId == 1010 ? findingsCount+1 : findingsCount;   //changed by archana for jira-ID-MOBILE-859
          })
            if(this.final.length == findingsCount){
            this.db.changeCheckboxData(dat.ORIG_SEQ_NO,dat);
            this.db.changeStatusToComplete(dat.ORIG_SEQ_NO);
           }
           else if(findingsCount < this.final.length){
            this.db.changeCheckboxDataRemove(dat.ORIG_SEQ_NO,dat);
            this.db.changeStatusToCommenced(dat.ORIG_SEQ_NO);
           }
         } else {
          this.finalAuditStatus = this.pfList.filter((res)=>{                 //added by archana related to audit_status update
            return res.origSeqNo == dat.ORIG_SEQ_NO;
          });
          if(this.finalAuditStatus.length == 1){
            this.db.changeStatusToCommenced(dat.ORIG_SEQ_NO);
          }
         }
      })
      if(data.findingDtl[data.findingDtl.length-1].statusId == 1008){
        this.db.updateFindingStatus(data.origSeqNo,data.findingsNo);
      } else {
        this.db.updateFindingStatusRemove(data.origSeqNo,data.findingsNo);
      }
    });
    
  }
  /** added by archana for jira-id-MOBILE-891 end */

  async deleteOptions(findingItem) {
    const alert = this.alertController.create({
      mode: 'ios',
      header: 'Delete Finding',
      message: 'Do you want to delete the Review Note',
      cssClass: 'alertCancel',/**added by lokesh for changing text into bold mobile_jira(648)*/
      buttons: [
        {
          text: 'Yes',
          cssClass: 'alertButton',/**added by lokesh for changing text into bold mobile_jira(648)*/
          handler: () => {
            console.log('Delete Confired');
            this.deleteFinding(findingItem);
          }
        },
        {
          text: 'No',
          handler: () => {
            console.log('Delete Rejected');
          }
        }
      ]

    });
    (await alert).present();
  }
  deleteFinding(findingItem) {
    this.db.deleteFindingReviewNote(findingItem).then((res) => {
      if (res) {

        this.toast.presentToast('Review Note(s) deleted successfully', 'success');
        /*   
           this.db.getCurrentFindingDataList(this.auditSeqNo).then((findingListArray: any) => {
             console.log('FindingListArray', findingListArray)
             console.log(findingListArray)
             this.findingList = findingListArray;
             findingListArray.length > 0 ? this.isFindingExist = true : this.isFindingExist = false;
             this.totalCount = 0;
             this.majorCount = 0;
             this.minorCount = 0;
             this.setFindingCount();
   
           });
   
           console.log('this.findingList', this.findingList);
           console.log('this.findingList', this.findingList); */

      } else {
        this.toast.presentToast('Something went wrong', 'danger');
      }

    })
  }

  updateFinding(findingItem) {
    this.db.getMaDatasForFindings(this.appConstant.DMLC_TYPE_ID).then((auditCodes) => {
      console.log('findingItem', findingItem)
      this.router.navigateByUrl('/perform/dmlc-finding-details', {
        state: {
          data: this.data,
          selectedFindingItem: findingItem,
          findingStatusList: auditCodes[1]
        }
      });

    });
  }
  /**added by lokesh for jira_id(788)*/
  ngAfterViewInit(){
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      this.router.navigateByUrl('/perform/audit-details');
    });
    }
     ngOnDestroy() {
    console.log('ngOnDestroy');
    //this.setFindingToCurrentFindingsObj();
    this.backButtonSubscription.unsubscribe();//added by lokesh for jira_id(858)
  }
  async goBack() {
    this.router.navigateByUrl("/perform/audit-details")
  }
}
