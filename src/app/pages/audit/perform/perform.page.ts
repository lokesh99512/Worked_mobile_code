import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  ModalController,
  Platform,
  ToastController,
} from '@ionic/angular';
import { DatabaseService } from 'src/app/providers/database.service';
import { DetailService } from 'src/app/providers/detail.service';
import {
  ConnectionStatus,
  NetworkService,
} from 'src/app/providers/network.service';
import { AuditSearchService } from 'src/app/providers/audit-search.service';
import { MoreInfoPage } from '../more-info/more-info.page';
import { LoadingIndicatorService } from 'src/app/providers/loading-indicator.service';
import { ToastService } from 'src/app/providers/toast.service';
import { FileManagerService } from 'src/app/providers/file-manager.service';
import * as moment from 'moment';

@Component({
  selector: 'app-perform',
  templateUrl: './perform.page.html',
  styleUrls: ['./perform.page.scss'],
})
export class PerformPage implements OnInit {
  @ViewChild('mySelect', { static: true }) selectRef: any;
  date = 'date';
  number = 'number';
  text = 'text';
  userName;
  companyId;
  backButtonSubscription;
  searchCategory = this.auditsearch.searchCategory;

  searchCategoryOptions = Object.keys(this.searchCategory[0]);

  fakeAudits: Array<any> = new Array(5);
  selectedType: any;
  searchText: any;
  searchType: any;
  searchPlaceholderText: string = 'Search';
  searchCategoryType: any;
  tempArray: any = [];
  searchArray: Object;
  userDetails: any;
  uName: { emailId: string; };
  mPinId: any;
  selectedDate: string;
  backUpData: any;

  constructor(
    public loader: LoadingIndicatorService,
    public toast: ToastService,
    public alertController: AlertController,
    private platform: Platform,
    public toastController: ToastController,
    private db: DatabaseService,
    private detailService: DetailService,
    public load: LoadingIndicatorService,
    public modal: ModalController,
    private auditsearch: AuditSearchService,
    private router: Router,
    private network: NetworkService,
    private fileManager: FileManagerService,
  ) { }
 //added by lokesh for  jira_id(669) STATE HERE
 ionViewWillEnter() {
  this.initDataItems();
 }
 //added by lokesh for  jira_id(669) END HERE
  //backbutton
  ngAfterViewInit() {
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      this.router.navigateByUrl('/dashboard'); 
    });
  }
  ngOnDestroy() {
    this.backButtonSubscription.unsubscribe();
  }

  async presentModal(audit) {
    /* const modal = await this.modal.create({
      component: MoreInfoPage,
      componentProps: {
        modalDetails: audit,
        routeUrl: this.router.url,
        modalTitle: audit.vesselName,
      },
    });
    return await modal.present(); */

    this.router.navigate([
      '/more-info',
      {
        modalDetails: JSON.stringify(audit),
        routeUrl: this.router.url,
        modalTitle: audit.vesselName,
      },
    ]);
  }
  customPopoverOptions: any = {
    header: 'Choose Search Category',
  };
  searchFilter(event) {
    this.selectRef.interface = 'popover';
    this.selectRef.open(event);
  }

  selectedCategoryType(event) {
    console.log(event.target.value);
    let searchCatType = event.target.value.trim();
    this.initDataItems();

    if (event.target.value.trim() === 'Vessel Imo No') {
      this.searchType = this.number;
      this.searchText = '';
      this.tempArray = this.backUpData;
      console.log(this.searchCategory[0]);
      this.searchPlaceholderText = 'Search Vessel Imo No';
    } else if (event.target.value.trim() === 'Company Imo No') {
      this.searchType = this.number;
      this.searchText = '';
      this.tempArray = this.backUpData;
      this.searchPlaceholderText = 'Search Company Imo No';
    } else if (event.target.value.trim() === 'Certificate No') {
      this.searchType = this.text;
      this.searchText = '';
      this.tempArray = this.backUpData;
      this.searchPlaceholderText = 'Search Certificate No';
    } else if (event.target.value.trim() === 'Vessel Name') {
      this.searchType = this.text;
      this.searchText = '';
      this.tempArray = this.backUpData;
      this.searchPlaceholderText = 'Search Vessel Name';
    } else if (event.target.value.trim() === 'Audit Type Desc') {
      this.searchType = this.text;
      this.searchText = '';
      this.tempArray = this.backUpData;
      this.searchPlaceholderText = 'Search Audit Type Desc';
    } else if (event.target.value.trim() === 'Issue Date') {
      this.searchType = this.date;
      this.searchPlaceholderText = 'Search Issue Date';
      this.searchText = '';                         //added by archana for jira ID-MOBILE-475
      this.tempArray = this.backUpData;
      this.selectedDate = null;
    } else if (event.target.value.trim() === 'Expiry Date') {
      this.searchType = this.date;
      this.searchPlaceholderText = 'Search Expiry Date';
      this.searchText = '';                         //added by archana for jira ID-MOBILE-475
      this.tempArray = this.backUpData;
      this.selectedDate = null;
    }
  }

  DateClear(event) {                                             //added by archana for jira ID-MOBILE-475
    event.stopPropagation();
    this.selectedDate = null;
    this.tempArray = this.backUpData;
  }

  getSearchedText(event) {
    this.searchText = (this.searchPlaceholderText == 'Search Issue Date' || this.searchPlaceholderText == 'Search Expiry Date') ? moment(event.value).format('DD-MMM-YYYY') : this.searchText;            //added by archana for jira ID-MOBILE-475
    console.log(typeof this.searchText);
    console.log('Searched Text=' + this.searchText + ';');

    let sr = this.auditsearch.searchAudits(
      this.searchText,
      this.searchArray,
      this.searchPlaceholderText
    );

    console.log(sr);

    this.tempArray = sr;
  }

  ngOnInit() {
    this.db.getCurrentUser().subscribe((user) => {
      this.userName = user.userName;
      this.companyId = user.companyId;
    });

    this.initDataItems();
  }

  private initDataItems() {
    this.getAudits();
  }

  async deleteOptions(audit) {
    if (                                  // added by ramya for jira ID-Mobile-706
      this.network.getCurrentNetworkStatus() === ConnectionStatus.Online
    ){
      this.db.getCurrentUser().subscribe(
      (user) => {
        this.userDetails=user;
        console.log(user);
        this.uName={
          emailId: user.userName}
        this.db.getlaptopId(user.userName).then((result)=>{
          this.mPinId=result;
        });

      });
      this.detailService.getMobilepinCentralData(this.uName)
      .subscribe(async (res:any) => {
       if(res && this.mPinId){
        if(res[0].mobUniqId==this.mPinId.mob_unique_id){
    if(audit.auditTypeDesc=="DMLC II"){
      const alert = this.alertController.create({
        mode: 'ios',
        header: 'Delete Review',
        message: 'Are you sure you want to delete this Review?',
        cssClass: 'alertCancel',/**added by lokesh for changing text into bold mobile_jira(650)*/
        buttons: [
          {
            cssClass: 'alertButton',/**added by lokesh for changing text into bold mobile_jira(650)*/
            text: 'Yes',
            handler: () => {
              console.log('Delete Confired');
              if (
                this.network.getCurrentNetworkStatus() === ConnectionStatus.Online
              )
                this.deleteCurAudit(audit);
              else this.toast.presentToast('No Internet Connection...!!!');
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
    /**Added by sudharsan for JIRA-ID= 567 */
    else if(audit.auditTypeDesc=="MLC"){
      const alert = this.alertController.create({
        mode: 'ios',
        header: 'Delete Inspection',
        message: 'Are you sure you want to delete this Inspection?',
        cssClass: 'alertCancel',/**added by lokesh for changing text into bold mobile_jira(650)*/
        buttons: [
          {
            cssClass: 'alertButton',/**added by lokesh for changing text into bold mobile_jira(650)*/
            text: 'Yes',
            handler: () => {
              console.log('Delete Confirmed');
              if (
                this.network.getCurrentNetworkStatus() === ConnectionStatus.Online
              )
                this.deleteCurAudit(audit);
              else this.toast.presentToast('No Internet Connection...!!!');
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
    /**End here */
    else{
      const alert = this.alertController.create({
        mode: 'ios',
        header: 'Delete Audit',
        message: 'Are you sure you want to delete this audit?',
        cssClass: 'alertCancel',/**added by lokesh for changing text into bold mobile_jira(650)*/
        buttons: [
          {
            cssClass: 'alertButton',/**added by lokesh for changing text into bold mobile_jira(650)*/
            text: 'Yes',
            handler: () => {
              console.log('Delete Confired');
              if (
                this.network.getCurrentNetworkStatus() === ConnectionStatus.Online
              )
                this.deleteCurAudit(audit);
              else this.toast.presentToast('No Internet Connection...!!!');
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
  }
  else{
    this.db.updateLpinActiveStatus(this.userDetails.userName,this.userDetails.companyId);
    this.loader.hideLoader();
    this.toast.presentToast('Same User Already Installed in different machine. Please try to be there!');
    this.router.navigateByUrl('/login');
  }
}
});
  }
  else this.toast.presentToast('No Internet Connection...!!!');
    
  }
  deleteCurAudit(audit) {
    /* console.log(audit)
    if (audit.auditTypeID == 1003) {
      this.db.getAuditdata(audit.auditSeqNo).then(
        (auditData) => {
          console.log(auditData)
          //delete MLC Inspection
          this.deleteAudit(audit);
          //delete DMLC Review Note
          if (auditData[0].sspDetailsData.sspDmlcAuditSeqNo) {
            console.log('DMLC LINKED')
            audit.auditSeqNo = auditData[0].sspDetailsData.sspDmlcAuditSeqNo;
            audit.auditTypeId = 1005;
            audit.auditTypeDesc = 'DMLC'
            this.deleteAudit(audit);
          }
        });
    }
    else */ this.deleteAudit(audit);
    /* this.db.isMlcDmlcLinked(audit).then(res => {
      res == true ? {

      } : this.deleteCurAudit1(audit);
    }) */
  }
  deleteAudit(audit) {
    let isDmlcLinked: boolean = false;
    this.db.getAuditdata(audit.auditSeqNo).then((auditData) => {
      console.log(auditData);
      if (audit.auditTypeId == 1003 && auditData[0].sspDetailsData.sspDmlcAuditSeqNo) {
        console.log('DMLC Linked')
        isDmlcLinked = true;
      }
      this.detailService            //changed for jira id - Mobile-694
      .checkAuditStatus(
        audit.auditSeqNo,
        audit.auditTypeId,
        audit.companyId
      )
      .subscribe((res) => {
      this.db.deleteSelectedAudit(audit).then((res: any) => {
        console.log('deleteSelectedAudit Res : ', res);
        if (res.status === 'ok') {
          console.log('deleteCurAudit called', audit);
          this.fileManager
            .removeAuditDirectory(audit.auditTypeDesc==="DMLC II"?"DMLC_II":audit.auditTypeDesc, audit.auditSeqNo)
            .then(
              (isAuditDeleted) => {
                if (isAuditDeleted) {
                  // this.detailService
                  //   .checkAuditStatus(
                  //     audit.auditSeqNo,
                  //     audit.auditTypeId,
                  //     audit.companyId
                  //   )
                  //   .subscribe((res) => {
                      console.log('checkAuditStatus', res);
                      if (res.auditStatus != 1004) {
                        // this.detailService                    //removed by archana for jira Id-MOBILE-512
                        //   .updateLockStatusCentral(
                        //     audit.auditTypeId,
                        //     audit.auditSeqNo,
                        //     this.companyId,
                        //     0,
                        //     this.userName
                        //   )
                        //   .subscribe(
                        //     (res) => {
                           this.detailService
                          .updateLockStatusDelMobAdt(           //added by archana for jira Id-MOBILE-512 
                            audit.auditTypeId,
                            audit.auditSeqNo,
                            audit.companyId,
                            0,
                            this.userName,
                            this.mPinId.mob_unique_id
                          ).subscribe(
                            (res) => {
                              if (isDmlcLinked) {
                                audit.auditSeqNo = auditData[0].sspDetailsData.sspDmlcAuditSeqNo.toString();
                                audit.auditTypeId = 1005;
                                this.db.deleteSelectedAudit(audit).then((res: any) => {
                                  if (res.status === 'ok') {
                                    this.fileManager
                                      .removeAuditDirectory('DMLC_II', audit.auditSeqNo)
                                      .then(
                                        (isDMLCAuditDeleted) => {
                                          if (isDMLCAuditDeleted) {
                                            this.detailService.checkAuditStatus(
                                              audit.auditSeqNo,
                                              audit.auditTypeId,
                                              audit.companyId
                                            ).subscribe((res) => {
                                              console.log('checkAuditStatus', res);
                                              //removed by archana for jira-ID-MOBILE-861
                                              // if (res.auditStatus != 1004) {
                                              //   this.detailService
                                              //     .updateLockStatusCentral(
                                              //       audit.auditTypeId,
                                              //       audit.auditSeqNo,
                                              //       this.companyId,
                                              //       0,
                                              //       this.userName
                                              //     ).subscribe((res) => {
                                              //       console.log('Linked DMLC Review note Deleted')
                                              //     })
                                              // }
                                            })
                                          }
                                        })
                                  }
                                });
                              }
                              if(audit.auditTypeDesc=="DMLC II"){
                                this.toast.presentToast(
                                  'Review Deleted Successfully',
                                  'success'
                                );
  
                                /* Notification Code  Perform - starts*/
                                this.db.addNotificationMsg(
                                  'Review has been deleted successfully for the Vessel ' +
                                  audit.vesselName +
                                  ' with the IMO No ' +
                                  audit.vesselImoNo,
                                  new Date(),
                                  this.userName,
                                  "D"
                                );
                              }
                              else{
                                this.toast.presentToast(
                                  (audit.auditTypeDesc=='MLC'?'Inspection':'Audit')+' Deleted Successfully', //modified by lokesh for jira_id(883)
                                  'success'
                                );
  
                                /* Notification Code  Perform - starts*/
                                this.db.addNotificationMsg(
                                  'Audit has been deleted successfully for the Vessel ' +
                                  audit.vesselName +
                                  ' with the IMO No ' +
                                  audit.vesselImoNo,
                                  new Date(),
                                  this.userName,
                                  "D"
                                );
                              }
                              

                              /* Notification Code Perform - ends*/


                              this.getAudits();
                              console.log('updateLockStatusCentral status', res);
                            },
                            (err) => {
                              this.toast.presentToast(
                                'Audit Deletion Failed',
                                'danger'
                              );
                              console.log(
                                'Error updateLockStatusCentral',
                                JSON.stringify(err)
                              );
                            }
                          );
                      } else {
                        this.toast.presentToast(
                          (audit.auditTypeDesc=='MLC'?'Inspection':'Audit')+' Deleted Successfully',//modified by lokesh for jira_id(883)
                          'success'
                        );
                        this.getAudits();
                      }
                    // });
                }
              },
              (err) => {
                this.toast.presentToast('Audit Deletion Failed', 'danger');
              }
            );
        }
      }).then(() => {

      });
    });
    })
  }

  getAudits() {
    console.log('this.userId', this.userName);
    this.db.getAvailAuditRecordsOfCurrentUser(this.userName).then((audits) => {
      console.log('AUDITS : ', audits);
      this.tempArray = audits;
      this.backUpData = this.tempArray;
      this.searchArray = audits;
      this.tempArray.forEach((data) => {
        data.certIssueDate = data.certIssueDate
          ? moment(data.certIssueDate, 'YYYY-MM-DD').format('DD-MMM-YYYY')
          : null;
        data.certExpireDate = data.certExpireDate
          ? moment(data.certExpireDate, 'YYYY-MM-DD').format('DD-MMM-YYYY')
          : null;
        if (data.certIssueDate == null) {
          data.certIssueDate = '--';
        }
        if (data.certExpireDate == null) {
          data.certExpireDate = '--';
        }
      });
    });
    this.db.getCurrentDbRecords();
  }

  auditDetails(audit) {
    console.log(audit);
    this.loader.showLoader('Please Wait...');
    this.db.getVesselCompanyData(audit.vesselImoNo).then(
      (vesselData) => {
        this.db.getAuditdata(audit.auditSeqNo).then(
          (auditData) => {
            console.log(vesselData);
            console.log(auditData);
            if (auditData[0].vesselNameAud != '') {
              vesselData[0].vesselName = auditData[0].vesselNameAud;
              vesselData[0].vesselType = auditData[0].vesselTypeAud;
              vesselData[0].docExpiry = auditData[0].docExpiryAud;
              vesselData[0].docIssuer = auditData[0].docIssuerAud;
              vesselData[0].docTypeNo = auditData[0].docTypeNoAud;
              vesselData[0].officialNo = auditData[0].officialNoAud;
              vesselData[0].companyAddress = auditData[0].companyAddressAud;
            }
            if (auditData[0].vesselNameAud == '') {
              auditData[0].vesselNameAud = vesselData[0].vesselName;
              auditData[0].vesselTypeAud = vesselData[0].vesselType;
              auditData[0].docExpiryAud = vesselData[0].docExpiry;
              auditData[0].docIssuerAud = vesselData[0].docIssuer;
              auditData[0].docTypeNoAud = vesselData[0].docTypeNo;
              auditData[0].officialNoAud = vesselData[0].officialNo;
              auditData[0].companyAddressAud = vesselData[0].companyAddress;
            }
            this.db.getAuditAuditorData(audit.auditSeqNo).then(
              (auditAuditorData) => {
                this.db
                  .getAuditReportAttachmentData(
                    audit.auditTypeId,
                    audit.auditSubTypeId,
                    audit.auditSeqNo
                  )
                  .then(
                    (auditReportData) => {
                      this.db.getMasterData(audit.auditTypeId).then(
                        (masterData) => {
                          console.log(
                            'dfghj',
                            vesselData[0],
                            auditAuditorData,
                            auditData,
                            masterData
                          );
                          this.router.navigateByUrl('/perform/audit-details', {
                            state: {
                              vesselData: vesselData[0],
                              auditAuditorData: auditAuditorData,
                              auditData: auditData,
                              auditReportData: auditReportData,
                              masterData: masterData,
                            },
                          });
                        },
                        (err) => {
                          this.loader.hideLoader();
                        }
                      );
                    },
                    (err) => {
                      this.loader.hideLoader();
                    }
                  );
              },
              (err) => {
                this.loader.hideLoader();
              }
            );
          },
          (err) => {
            this.loader.hideLoader();
          }
        );
      },
      (err) => {
        this.loader.hideLoader();
      }
    );
  }
}
