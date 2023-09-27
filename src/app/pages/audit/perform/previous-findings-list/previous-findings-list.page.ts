import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform, AlertController } from '@ionic/angular';
import { AppConstant } from 'src/app/constants/app.constants';
import { DatabaseService } from 'src/app/providers/database.service';
import { FindingService } from 'src/app/providers/finding.service';
import { LoadingIndicatorService } from 'src/app/providers/loading-indicator.service';
import { ToastService } from 'src/app/providers/toast.service';

@Component({
  selector: 'app-previous-findings-list',
  templateUrl: './previous-findings-list.page.html',
  styleUrls: ['./previous-findings-list.page.scss'],
})
export class PreviousFindingsListPage implements OnInit {
  dataFromAuditDetailPage: any;
  auditTypeId: any;
  auditSeqNo: any;
  compId: any;
  auditDate: any;
  portArr: any;
  auditReportNo: any;
  closeMeetingDate: Date;
  openMeetingDate: Date;
  pfList: any;
  auditStatusId: any;

  pageTitle: string;
  auditType: string;
  auditauditType: string;
  auditTypeDesc: string;
  majorCountDesc: string;
  minorCountDesc: string;
  obsCountDesc: string;

  majorCount: number = 0;
  minorCount: number = 0;
  obsCount: number = 0;
  totalCount: number = 0;
  auditData: Object;
  final: any;
  pfList1: any;
  backButtonSubscription: any;/**added by lokesh for jira_id(788)*/
  finalAuditStatus: any;
  constructor(
    public fb: FormBuilder,
    private db: DatabaseService,
    private router: Router,
    private platform: Platform,
    public alertController: AlertController,
    public loader: LoadingIndicatorService,
    public toast: ToastService,
    public appConst: AppConstant,
    private findingService: FindingService,
    private route:ActivatedRoute
  ) {
    this.dataFromAuditDetailPage =
    JSON.parse(this.route.snapshot.paramMap.get('findingDetails'));//added by lokesh for jira_id(858)

    console.log('router::', this.dataFromAuditDetailPage);
    this.auditTypeId = this.dataFromAuditDetailPage.auditTypeId;
    this.auditSeqNo = this.dataFromAuditDetailPage.auditSeqNo;
    this.compId = this.dataFromAuditDetailPage.companyId;
    this.auditDate = this.dataFromAuditDetailPage.auditDate;
    this.portArr = this.dataFromAuditDetailPage.port;
    this.auditReportNo = this.dataFromAuditDetailPage.auditReportNo;
    this.closeMeetingDate = new Date(
      this.dataFromAuditDetailPage.closeMeetingDate
    );
    this.openMeetingDate = new Date(
      this.dataFromAuditDetailPage.openMeetingDate
    );
    this.auditStatusId = this.dataFromAuditDetailPage.auditStatusId;    //added by @Ramya on 14-09-2022 for jira id - Mobile-553
  }

  async ionViewWillEnter() {
    this.loader.showLoader('Fetching Findings....'); //loader starts here

    let req = {
      vesselImoNo: this.dataFromAuditDetailPage.vesselImoNo,
      companyImoNo: this.dataFromAuditDetailPage.companyImoNo,
      docTypeNo: this.dataFromAuditDetailPage.docTypeNo,
      auditDate: this.dataFromAuditDetailPage.auditDate,
      auditTypeId: this.dataFromAuditDetailPage.auditTypeId,
    };
     /**  added by archana for jira Id-Mobile-794,Mobile-810 start*/
   await this.db.getPrevFindingDetails(req).then((pfData: any) => {
     pfData.finding.sort(function (c, d) {                                             //added by archana for jira ID-MOBILE-923
       return c.orgSeqNo - d.orgSeqNo || c.findingsNo - d.findingsNo;
     });
      this.pfList1 = pfData.finding;
      if (this.pfList1.length > 0) {
        // changed by archana for jira Id-Mobile-765
        this.pfList1 = this.pfList1.filter((element) => {
            return element.findingDetail[element.findingDetail.length -1].statusId != this.appConst.VERIFIED_CLOSED ||
          element.findingDetail[element.findingDetail.length -1].curSeqNo >= this.auditSeqNo
        });
      }
      console.log(this.pfList1);
      
      this.checkList();
    })
     /**  added by archana for jira Id-Mobile-794,Mobile-810 end*/

     this.db.getPrevFindingDetails(req).then((pfData: any) => {
      console.log('getPrevFindingDetails RES : ', pfData);

       pfData.finding.sort(function (c, d) {                                              //added by archana for jira ID-MOBILE-923
         return c.orgSeqNo - d.orgSeqNo || c.findingsNo - d.findingsNo;
       });

      this.pfList = pfData.finding;
      if (this.pfList.length > 0) {
        /**changed by archana for jira Id-Mobile-765 start*/
        this.pfList = this.pfList.filter((element) => {
          return (element.findingDetail[element.findingDetail.length -1].statusId != this.appConst.VERIFIED_CLOSED ||
          element.findingDetail[element.findingDetail.length -1].curSeqNo >= this.auditSeqNo) && element.serialNo.includes('OBS') == false  //changed by archana for jira ID-MOBILE-881
        });
        /**changed by archana for jira Id-Mobile-765 end*/
      }
      console.log('pfList', this.pfList);
      let count = this.findingService.getFindingCount(this.pfList);
      this.totalCount = count.total;
      this.majorCount = count.maj;
      this.minorCount = count.min;
      this.obsCount = count.obs;
      this.loader.hideLoader();
    });
    let findingDataDescriptions = this.findingService.findingDataDescriptions(
      this.auditTypeId
    );

    this.pageTitle = findingDataDescriptions.pageTitle;

    this.auditType = findingDataDescriptions.auditType;

    this.majorCountDesc = findingDataDescriptions.majorCountDesc;

    this.minorCountDesc = findingDataDescriptions.minorCountDesc;

    this.obsCountDesc = findingDataDescriptions.obsCountDesc;

    this.auditauditType = findingDataDescriptions.auditauditType;

    this.auditTypeDesc = findingDataDescriptions.auditTypeDesc;
  }

  /**  added by archana for jira Id-Mobile-794,Mobile-810 start*/
checkList(){
  this.pfList1.forEach((data)=>{
    data.findingDetail.forEach((dat)=>{
      if(dat.checkboxUpdate == 1){
        let findingsCount = 0;
        this.final = this.pfList1.filter((res)=>{
          return res.orgSeqNo == dat.orgSeqNo;
        })
        console.log(this.final);
        this.final.forEach((res)=>{
          findingsCount = res.findingDetail[res.findingDetail.length-1].nextActionId == 1010 ? findingsCount+1 : findingsCount;   //changed by archana for jira-ID-MOBILE-859
        })
         console.log(this.final.length);
         console.log(findingsCount);
         if(this.final.length == findingsCount){
          this.db.changeCheckboxData(dat.orgSeqNo,dat);
          this.db.changeStatusToComplete(dat.orgSeqNo);
           console.log("working");
         }
         else if(findingsCount < this.final.length){
          this.db.changeCheckboxDataRemove(dat.orgSeqNo,dat);
          this.db.changeStatusToCommenced(dat.orgSeqNo);
         }
       
      } else {
        this.finalAuditStatus = this.pfList1.filter((res)=>{            //added by archana related to audit_status update
          return res.orgSeqNo == dat.orgSeqNo;
        });
        if(this.finalAuditStatus.length == 1){
          this.db.changeStatusToCommenced(dat.orgSeqNo);
        }
      }
    })
    /**added by archana for jira Id-Mobile-765 start*/
    if(data.findingDetail[data.findingDetail.length-1].statusId == 1008){
      this.db.updateFindingStatus(data.orgSeqNo,data.findingsNo);
    } else {
      this.db.updateFindingStatusRemove(data.orgSeqNo,data.findingsNo);
    }
    /**added by archana for jira Id-Mobile-765 end*/
  });
  
}
 /**  added by archana for jira Id-Mobile-794,Mobile-810 end*/

  ngOnInit() {
    console.log("work");
    
  }

  updateFinding(findingItem) {
    console.log('findingItem', findingItem);
    this.db.getAuditdata(this.auditSeqNo).then((auditData) => {     //added for jira id - MOBILE-658
        console.log('auditData', auditData);
        this.auditData = auditData[0];
    this.router.navigateByUrl('/perform/previous-finding-details', {
      state: {
        //Added by lokesh jiraId- 635
        auditType:this.dataFromAuditDetailPage.auditType,
        auditTypeTitle:this.dataFromAuditDetailPage.auditTypeTitle,
        auditorName:this.dataFromAuditDetailPage.auditorName,
        findingInfo: findingItem,
        // findilist:this.pfList[0].findingDetail[1].dueDate,      //added by lokesh for jira_id(676,632)
        auditSeqNo: this.auditSeqNo,
        openMeetingDate : this.dataFromAuditDetailPage.openMeetingDate ? this.dataFromAuditDetailPage.openMeetingDate : '',
        closeMeetingDate : this.dataFromAuditDetailPage.closeMeetingDate ? this.dataFromAuditDetailPage.closeMeetingDate : '',
        findingCategoryId: findingItem.findingDetail[0].categoryId ? findingItem.findingDetail[0].categoryId : '',
        port: this.portArr,
        auditTypeDesc: this.auditTypeDesc, // added by archana for previous finding attach implementation
        auditData: this.auditData, 
        vesselImoNo: this.dataFromAuditDetailPage.vesselImoNo,
        companyImoNo: this.dataFromAuditDetailPage.companyImoNo,  
        docTypeNo: this.dataFromAuditDetailPage.docTypeNo,
        auditDate: this.dataFromAuditDetailPage.auditDate,
        auditTypeId: this.dataFromAuditDetailPage.auditTypeId,
      },
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
    this.backButtonSubscription.unsubscribe();//added by lokesh for jira_id(858)
  }
  async goBack() {
    this.router.navigateByUrl('/perform/audit-details');
  }
}
