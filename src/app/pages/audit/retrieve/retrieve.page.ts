import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { AuditSearchService } from 'src/app/providers/audit-search.service';
import { MoreInfoPage } from '../more-info/more-info.page';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/providers/database.service';
import { LoadingIndicatorService } from 'src/app/providers/loading-indicator.service';
import { ToastService } from 'src/app/providers/toast.service';
import {
  ConnectionStatus,
  NetworkService,
} from 'src/app/providers/network.service';
import { DetailService } from 'src/app/providers/detail.service';
import * as _ from 'lodash';
import { FileManagerService } from 'src/app/providers/file-manager.service';
import { audit } from 'rxjs/operators';
import { AppConstant } from 'src/app/constants/app.constants';
import * as moment from 'moment';
import { rejects } from 'assert';
import { format } from 'path';
import { CentralLoginSystemsPage } from '../central-login-systems/central-login-systems.page';

declare function base64ToArrayBuffer(base64): any;
declare function byteToUint8Array(byte): any;

@Component({
  selector: 'app-retrieve',
  templateUrl: './retrieve.page.html',
  styleUrls: ['./retrieve.page.scss'],
})
export class RetrievePage implements OnInit {
  @ViewChild('mySelect', { static: true }) selectRef: any;
  date = 'date';
  number = 'number';
  text = 'text';
  companyId;
  emailId;
  searchCategory = this.auditsearch.searchCategory;

  searchCategoryOptions = Object.keys(this.searchCategory[0]);

  fakeAudits: Array<any> = new Array(5);
  selectedType: any;
  searchText: any;
  searchType: any;
  searchPlaceholderText: string = 'Search';
  searchCategoryType: any;
  tempArray: any = [];
  existsAudseqno;
  searchArray: Object;
  backButtonSubscription;
  dirName: any;
  mycolor = 'brown';
  usname: any;
  password: any;
  retreiveData: any;
  checkBoxList: { value: string; name: string; }[];
  userDetails: any;
  userName: { emailId: string; };
  mPinId: any;
  uName: { emailId: string; };
  selectedDate: string;
  backUpData: any;

  constructor(
    private appConstant: AppConstant,
    private platform: Platform,
    private fileManager: FileManagerService,
    private detailService: DetailService,
    private network: NetworkService,
    public toast: ToastService,
    public loader: LoadingIndicatorService,
    private db: DatabaseService,
    public modal: ModalController,
    private auditsearch: AuditSearchService,
    public alertController: AlertController,
    private router: Router
  ) {
    this.checkBoxList = [
      {
        "value": "auditCodes",
        
        "name": "Audit Codes",
      }, {
        "value": "vessel",
        
        "name": "Vessel",
      }, {
        "value": "vesselcompany",
        
        "name": "Vessel Company",
      }, {
        "value": "attachmentTypes",
        
        "name": "Attachment Types",
      }, {
        "value": "auditSearchSource",
        
        "name": "Audit Search Source",
      }, {
        "value": "auditStatus",
        
        "name": "Audit Status",
      }, {
        "value": "auditSubtype",
        
        "name": "Audit Subtype",
      }, {
        "value": "auditSummary",
        
        "name": "Audit Summary",
      }, {
        "value": "auditType",
        
        "name": "Audit Type",
      }, {
        "value": "certificateIssued",
        
        "name": "Certificate Issued",
      }, {
        "value": "company",
        
        "name": "Company",
      },
      {
        "value": "findingsCategory",
        
        "name": "Findings Category",
      }, {
        "value": "findingsStatus",
        
        "name": "Findings Status",
      }, {
        "value": "roles",
        
        "name": "Roles",
      }, {
        "value": "users",
        
        "name": "Users",
      }, {
        "value": "vesselType",
        
        "name": "Vessel Type",
      }, {
        "value": "auditRoles",
        
        "name": "Audit Roles",
      }, {
        "value": "configDetails",
        
        "name": "User Configuration",
      }, {
        "value": "port",
        
        "name": "Port",
      }
    ];
  }

  /*  doRefresh(event) {
     console.log('Begin async operation');
 
     setTimeout(() => {
       console.log('Async operation has ended');
       event.target.complete();
     }, 2000);
   } */

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
    // this.loadListOfAuditItems(); /** Fixed MOBILE-477 commented code by Archana */

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
      this.searchText = '';
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
      /** Fixed MOBILE-474 by Archana */
      this.searchText,
      this.searchArray,
      this.searchPlaceholderText
    );

    console.log(sr);

    this.tempArray = sr;
  }

  private initDataItems(emailId, companyId) {
    let adt = {
      auditSeqNo: this.existsAudseqno,
      auditStatusId: 1001,
      auditSubTypeId: null,
      auditTypeId: null,
      certExpireDate: null,
      certIssueDate: null,
      certificateNo: null,
      companyId: parseInt(companyId),
      companyImoNo: null,
      pageNo: 0,
      retrieveFlag: true,
      emailId: emailId,
      vesselImoNo: '',
      defaultSearchCount: 200,
      planApprovalAuthorise: 0,
    };
    console.log(adt);
    this.detailService.retriveAudit(adt).subscribe((audits) => {
      console.log('retrivedAudits', audits);

      audits = audits.filter(
        (audit) =>
          audit.auditTypeId != 1006 &&
          audit.lockStatus != 1 &&
          !(
            audit.auditTypeId == this.appConstant.DMLC_TYPE_ID &&
            audit.auditSummaryId == 1005
          ) &&
          !(
            audit.auditTypeId == this.appConstant.DMLC_TYPE_ID &&
            audit.sspLtrStatus == 1
          )
      );

      this.loader.hideLoader();
      this.tempArray = audits;
      this.backUpData = this.tempArray;
      console.log('this.tempArray', this.tempArray);
      this.searchArray = audits;
      this.tempArray.forEach((data) => {
        if (data.auditTypeId == this.appConstant.DMLC_TYPE_ID) {
          data.closeMeetingDate=data.closeMeetingDate.slice(0,10); // Added by sudharsan for Jira id Mobile-458,499,503
          data.certIssueDate = data.closeMeetingDate
            ? moment(data.closeMeetingDate, 'YYYY-MM-DD').format('DD-MMM-YYYY')
            : null;
        } else {
          data.certIssueDate = data.certIssueDate
            ? moment(data.certIssueDate, 'YYYY-MM-DD').format('DD-MMM-YYYY')
            : null;
        }
        data.certExpireDate = data.certExpireDate
          ? moment(data.certExpireDate, 'YYYY-MM-DD').format('DD-MMM-YYYY')
          : null;

        if (data.certIssueDate == null) {
          data.certIssueDate = '';            //changed by @Ramya for jira id - Mobile-596
        }
        if (data.certExpireDate == null) {
          data.certExpireDate = '';
        }
        if (data.scope == 1001) {
          data.certificateNo = '';
          data.certIssueId = '';
        }
        if(data.interalAuditDate)            //added by ramya for jira id-->mobile-539
        {
          if(data.interalAuditDate=="N.A.")
          {
          data.interalAuditDate='';
          }
        }
      });
    });
  }

  loadListOfAuditItems() {
    //to get existsaudseqnos
    this.tempArray = [];             // added by archana for jira Id-MOBILE-789
    return new Promise<Object>((resolve, reject) => {
      this.loader.showLoader('AuditFetch');
      this.db.checkExistsData().then(
        (res) => {
          console.log('checkExists audseqnos ', JSON.stringify(res['status']));
          this.existsAudseqno = res['status'];

          console.log(
            'this.companyId,this.emailId=>login',
            this.companyId,
            this.emailId
          );
          //check internet connectivity
          if (
            this.network.getCurrentNetworkStatus() === ConnectionStatus.Online
          ) {
            this.db.getCurrentUser().subscribe(   // added by ramya for jira ID-Mobile-706
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
              .subscribe((res:any) => {
               if(res && this.mPinId){
                if(res[0].mobUniqId==this.mPinId.mob_unique_id){
            this.initDataItems(this.emailId, this.companyId);
            resolve('done');
          }
          else{
            this.db.updateLpinActiveStatus(this.userDetails.userName,this.userDetails.companyId);
            this.loader.hideLoader();
            this.toast.presentToast('Same User Already Installed in different machine. Please try to be there!');
            this.router.navigateByUrl('/login');
          }
        }
        });
          } else {
            this.loader.hideLoader();
            this.toast.presentToast('No Internet Connection...!!!', 'danger');
            reject(true);
          }
        },
        (err) => {
          this.loader.hideLoader();
          console.log('err', err);
          reject(new Error('failed'));
        }
      );
    });
  }

  onRetreive(data): void {
    this.retreiveData = data;
    console.log('=====>', data);
    console.log('=====>', data.auditTypeDesc);
    //var someNamw = data.auditTypeDesc.split(" ");
    //var np="";
    this.searchText = ''; //** Fixed MOBILE-460 by Archana */

    // if(someNamw.length>0)
    //   np=someNamw[0];
    //   data.auditTypeDesc=np

    console.log('=====>', data.auditTypeDesc);

    if (this.network.getCurrentNetworkStatus() === ConnectionStatus.Online) {
      this.db.getCurrentUser().subscribe(   // added by ramya for jira ID-Mobile-706
        (user) => {
          this.userDetails=user;
          console.log(user);
          this.userName={
            emailId: user.userName}
          this.db.getlaptopId(user.userName).then((result)=>{
            this.mPinId=result;
          });

        });
        this.detailService.getMobilepinCentralData(this.userName)
        .subscribe((res:any) => {
         if(res && this.mPinId){
          if(res[0].mobUniqId==this.mPinId.mob_unique_id){
      this.db.loadCurrentUserLogin().then((loginData) => {
     
      
      this.detailService.getUpdatedDbdata(this.companyId).subscribe(
        (response: any) => {
          response = _.orderBy(response, 'tableName');
          response = response.sort((a, b) =>
          a.tableName.localeCompare(b.tableName)
        );

        this.checkBoxList = this.checkBoxList.sort((a, b) =>
        a.value.localeCompare(b.value)   // added by archana for jira ID-Mobile-699
      );
          console.log('getUpdatedDbdataOrderByTableName', response);
          this.db.getLocalDbMasterTableUpdateData(this.companyId).then(
            (responses: any) => {
              responses = responses.sort((a, b) =>
                a.tableName.localeCompare(b.tableName)
              );
              console.log('getLocalDbMasterTableUpdateData2', responses);
              let bean: any = {};
              let falseCount = 0;
              let updatedtableName='<ion-list>';
              for (var key in response) {
                if (
                  response[key].tableUpdation !==
                    responses[key].tableUpdation
                ) {
                  bean[response[key].tableName] = 1;
                   updatedtableName += '<ion-item lines="inset"> <ion-checkbox slot="start" checked style="pointer-events: none;opacity: 0.4;padding: 0px"></ion-checkbox><ion-label style="font-size:14px">'+this.checkBoxList[key].name+' </ion-label></ion-item>';

                } else {
                  bean[response[key].tableName] = 0;
                  falseCount++;
                  console.log(falseCount);
                }
              }
              console.log('bean', bean);
              bean.vessel = 1;
              bean.vesselcompany = 1;
              console.log(falseCount);
              console.log(bean);
              
               if (falseCount != response.length) {
                // updatedtableName = updatedtableName.substring(0, updatedtableName.length - 1);
                updatedtableName += '</ion-list>';
                console.log(updatedtableName);
                var array = updatedtableName.split(",").map(String);
                console.log(array);
                
                this.loader.hideLoader();
                this.refreshPopup(array,bean);
                // this.toast.presentToast(updatedtableName);
                
            // this.retrieveAuditBlock(data)
          } 
          else {
            /**replaced by archana for jira id-MOBILE-774 start */
            if(data.auditTypeDesc=='DMLC II'){
              this.loader.showLoader('RetrieveDMLCII');
            }
            /**Added by sudharsan for JIRA_ID=567 */
            else if(data.auditTypeDesc=='MLC'){
              this.loader.showLoader('RetrieveMLC');
            }
            /**End here */
            else{
              this.loader.showLoader('Retrieve');
            }
             /**replaced by archana for jira id-MOBILE-774 end */
            this.retrieveAuditBlock(data);
          }
            },
            (err) => {
              this.loader.hideLoader();
              this.toast.presentToast('Something went wrong.!');
            }
          );
        },
        (err) => {
          this.tempArray = [];           // added by archana for jira Id-MOBILE-789
          this.loader.hideLoader();
        }
      );
      });
    }
    else{
      this.db.updateLpinActiveStatus(this.userDetails.userName,this.userDetails.companyId);
      this.loader.hideLoader();
      this.toast.presentToast('Same User Already Installed in different machine. Please try to be there!');
      this.router.navigateByUrl('/login');
    }
  }
  });


    } else {
      this.loader.hideLoader();
      this.toast.presentToast('No Internet Connection...!!!');
    }
  }

  async refreshPopup(data,bean) {
   const alert = this.alertController.create({
      mode: 'ios',
      header: 'Master Data Update',
      message:data,
      cssClass: 'alertCancel1', 
      buttons: [
        {
          text: 'Refresh',
          cssClass: 'alertButtonRefresh',  
          handler: () => {
            this.loader.showLoader('Refreshing Master Data, Please Wait..'); 
            console.log('Delete Confired');
                       this.detailService
                .getRefreshMasterDataTables(this.emailId, bean) //user detail
                .subscribe(
                  (response) => {
                    console.log(
                      'master data response (refreshScreen)',
                      response
                    );
                    //update local masterdata
                    this.db.storeAllMasterDataTables(response).then((res) => {
                      console.log('storeMasterdetails res ::', res);
                      console.log('RefreshMasterData Done');
                     
                      this.toast.presentToast('The Master Data has been refreshed successfully!!!','success');
                      this.loader.hideLoader();
                    });
                  },
                  (error) => {
                    this.loader.hideLoader();
                    this.toast.presentToast('Something went wrong.!');
                  }
                );
          },
        },
      ],
    });
    (await alert).present();
  }

  retrieveAuditBlock(data) {
    let beans = {
      auditTypeId: data.auditTypeId,
      auditSeqNo: data.auditSeqNo,
      companyId: data.companyId,
      auditTypeDesc: data.auditTypeDesc,
      audLeadStatus: data.audLeadStatus,
      timeStamp: new Date().getTime(),
    };
    let auditSeqNo = beans.auditSeqNo.toString();
    let toastMsg = '';

    if (data.auditTypeId == 1001) {
      toastMsg = 'Audit';
    } else if (data.auditTypeId == 1002) {
      toastMsg = 'Audit';
    } else if (data.auditTypeId == 1003) {
      toastMsg = 'Inspection';
    } else if (data.auditTypeId == 1005) {
      toastMsg = 'DMLC II Review'; // Changed by sudharsan Jira MOBILE-443
    }
    console.log('toastMsg ', toastMsg);

    this.detailService.saveAudit(beans).subscribe((auditRes) => {
      console.log('auditRes', auditRes);
      this.loader.hideLoader();
      this.loader.showLoader('AuditSave');
      var file = base64ToArrayBuffer(auditRes['zipFile']);
      console.log(file);
      if (auditRes && auditRes['fileName']) {
        let auditTypeFolder = beans.auditTypeDesc;
        if(auditTypeFolder=="DMLC II"){  //Added by sudharsan for JIRA id MOBILE-508
          auditTypeFolder="DMLC_II";
        }
        let auditFileName = auditRes['fileName'];
        this.fileManager.createAuditDetailsDirectoryIfNotExist().then((_) => {
          this.fileManager
            .createAuditTypeDirectoryIfNotExist(auditTypeFolder)
            .then((_) => {
              this.fileManager
                .createAuditDirectoryIfNotExist(auditTypeFolder, auditSeqNo)
                .then((_) => {
                  this.fileManager
                    .writeZipFile(
                      auditTypeFolder,
                      auditSeqNo,
                      auditFileName,
                      file
                    )
                    .then((_) => {
                      this.fileManager
                        .extractAndRemoveZipFile(
                          auditTypeFolder,
                          auditSeqNo,
                          auditFileName
                        )
                        .then((_) => {
                          this.fileManager
                            .getAuditDataFromJsonFile(
                              auditTypeFolder,
                              auditSeqNo
                            )
                            .then((auditData) => {
                              console.log(auditData);
                              this.db.saveRetrivedAuditData(auditData);
                              this.db.getCurrentDbRecords();
                              this.db.getCurrentDbTables();
                              this.fileManager
                                .check_PF_Existance(auditTypeFolder, auditSeqNo)
                                .then((res) => {
                                  if (res === true) {
                                    this.fileManager
                                      .getPreviousFindingsDataFromJsonFile(
                                        auditTypeFolder,
                                        auditSeqNo
                                      )
                                      .then((pfData) => {
                                        console.log(pfData);
                                        this.db.savePreviousFindingData(pfData,auditData.auditSeqNo);     //changed by archana for Jira ID-MOBILE-923
                                      });
                                  }
                                });
                              this.fileManager
                                .check_PAD_Existance(
                                  auditTypeFolder,
                                  auditSeqNo
                                )
                                .then((res) => {
                                  if (res === true) {
                                    this.fileManager
                                      .getPreviousAuditDataFromJsonFile(
                                        auditTypeFolder,
                                        auditSeqNo
                                      )
                                      .then((pad) => {
                                        console.log(pad);
                                        this.db.savePreviousAuditData(pad);
                                        this.db.getCurrentDbRecords();
                                        this.db.getCurrentDbTables();
                                      });
                                  }
                                });

                              //Audit Cycle
                              if (
                                this.network.getCurrentNetworkStatus() ===
                                ConnectionStatus.Online
                              ) {
                                this.detailService
                                  .getAllCycleDate(
                                    auditData.auditTypeId,
                                    auditData.vesselImoNo,
                                    auditData.companyId
                                  )
                                  .subscribe((auditCycleDates) => {
                                    if (auditCycleDates) {
                                      console.log(auditCycleDates);
                                      this.db.saveAuditCycleDates(
                                        auditCycleDates
                                      );
                                    }
                                  });
                              } else {
                                this.loader.hideLoader();
                                this.toast.presentToast(
                                  'No Internet Connection...!!!',
                                  'danger'
                                );
                              }

                              if (auditData) {
                                console.log(auditData)
                                /**Added by sudharsan for JIRA-id=567 */
                                if(auditData.auditTypeId==1005){
                                  this.toast.presentToast(
                                    'Review has been retrieved successfully for the Vessel ' +
                                      auditData.vesselName +
                                      ' with the IMO No ' +
                                      auditData.vesselImoNo,
                                    'success'
                                  );
                                  this.db.addNotificationMsg(
                                    'Review has been retrieved successfully for the Vessel ' +
                                      auditData.vesselName +
                                      ' with the IMO No ' +
                                      auditData.vesselImoNo,
                                    new Date(),
                                    this.emailId,
                                    'R'
                                  );
                                }
                                  else if(auditData.auditTypeId==1003){
                                    console.log(auditData)
                                    this.toast.presentToast(
                                      'Inspection has been retrieved successfully for the Vessel ' +
                                        auditData.vesselName +
                                        ' with the IMO No ' +
                                        auditData.vesselImoNo,
                                      'success'
                                    );
                                    this.db.addNotificationMsg(
                                      'Inspection has been retrieved successfully for the Vessel ' +
                                        auditData.vesselName +
                                        ' with the IMO No ' +
                                        auditData.vesselImoNo,
                                      new Date(),
                                      this.emailId,
                                      'R'
                                    );
                                  }
                                  /**Added by sudharsan for JIRA-id-583 */
                                  else{
                                    this.toast.presentToast(
                                      'Audit has been retrieved successfully for the Vessel ' +
                                        auditData.vesselName +
                                        ' with the IMO No ' +
                                        auditData.vesselImoNo,
                                      'success'
                                    );
                                    this.db.addNotificationMsg(
                                      'Audit has been retrieved successfully for the Vessel ' +
                                        auditData.vesselName +
                                        ' with the IMO No ' +
                                        auditData.vesselImoNo,
                                      new Date(),
                                      this.emailId,
                                      'R'
                                    );
                                  }
                                
                                /**End here */
                                
                                if (
                                  auditData.sspReviewDetail.length > 0 &&
                                  auditData.sspReviewDetail[0].sspDmlcAuditSeqNo
                                ) {
                                  this.retrieveLinkedDmlc(
                                    auditData.sspReviewDetail[0]
                                      .sspDmlcAuditSeqNo,
                                    data.companyId
                                  );
                                }
                                this.lockUpdate(data);
                                this.loadListOfAuditItems();
                                this.loader.hideLoader();
                              }
                            });
                        });
                    });
                });
            });
        });
      }
    });
  }

  retrieveLinkedDmlc(sspDmlcAuditSeqNo, companyId) {
    let beans = {
      auditTypeId: 1005,
      auditSeqNo: sspDmlcAuditSeqNo,
      companyId: companyId,
      auditTypeDesc: 'DMLC',
      audLeadStatus: 1,
      timeStamp: new Date().getTime(),
    };
    this.detailService.saveAudit(beans).subscribe((auditRes) => {
      console.log('auditRes', auditRes);
      this.loader.hideLoader();
      this.loader.showLoader('AuditSave');
      var file = base64ToArrayBuffer(auditRes['zipFile']);
      console.log(file);
      if (auditRes && auditRes['fileName']) {
        let auditTypeFolder = beans.auditTypeDesc;
        let auditFileName = auditRes['fileName'];
        this.fileManager.createAuditDetailsDirectoryIfNotExist().then((_) => {
          this.fileManager
            .createAuditTypeDirectoryIfNotExist(auditTypeFolder)
            .then((_) => {
              this.fileManager
                .createAuditDirectoryIfNotExist(
                  auditTypeFolder,
                  sspDmlcAuditSeqNo.toString()
                )
                .then((_) => {
                  this.fileManager
                    .writeZipFile(
                      auditTypeFolder,
                      sspDmlcAuditSeqNo,
                      auditFileName,
                      file
                    )
                    .then((_) => {
                      this.fileManager
                        .extractAndRemoveZipFile(
                          auditTypeFolder,
                          sspDmlcAuditSeqNo,
                          auditFileName
                        )
                        .then((_) => {
                          this.fileManager
                            .getAuditDataFromJsonFile(
                              auditTypeFolder,
                              sspDmlcAuditSeqNo
                            )
                            .then((auditData) => {
                              console.log(auditData);
                              this.db.saveRetrivedAuditData(auditData);
                              this.db.getCurrentDbRecords();
                              this.db.getCurrentDbTables();

                              if (auditData) {
                                this.toast.presentToast(
                                  'The linked DMLC II Review has been retrieved as part of MLC Onboard Inspection for the vessel ' +
                                    auditData.vesselName +
                                    ' with the IMO No ' +
                                    auditData.vesselImoNo,
                                  'success'
                                );
                                this.db.addNotificationMsg(
                                  'The linked DMLC II Review has been retrieved as part of MLC Onboard Inspection for the vessel ' +
                                    auditData.vesselName +
                                    ' with the IMO No ' +
                                    auditData.vesselImoNo,
                                  new Date(),
                                  this.emailId,
                                  'R'
                                );
                                this.loader.hideLoader();
                              }
                            });
                        });
                    });
                });
            });
        });
      }
    });
  }

  lockUpdate(data) {
    let lockStatus = data.audLeadStatus == 0 ? 0 : 7;
    console.log(' lockStatus :', lockStatus);
    this.detailService
      .updateLockStatusCentral(
        data.auditTypeId,
        data.auditSeqNo,
        this.companyId,
        lockStatus,
        this.emailId
      )
      .subscribe(
        (res) => {
          console.log('updateLockStatusCentral status', res);
        },
        (err) => {
          console.log('Error updateLockStatusCentral', JSON.stringify(err));
        }
      );
  }
  ngOnInit() {
    console.log("aa");
    
    this.loadListOfAuditItems();

    this.db.getCurrentUser().subscribe((user) => {
      this.emailId = user.userName;
      this.companyId = user.companyId;
    });
  }
  //backbutton functionality
  ngAfterViewInit() {
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      this.router.navigateByUrl('/dashboard');
    });
  }
  ngOnDestroy() {
    this.backButtonSubscription.unsubscribe();
  }

  doRefresh(event) {
    console.log('Begin refresh operation');
    /**added by archana for jira ID-MOBILE-896 start */
    this.searchText = '';
    this.searchPlaceholderText = 'Search';
    this.searchType = null;
    this.selectedType = null;
     /**added by archana for jira ID-MOBILE-896 end */
    this.loadListOfAuditItems().then(
      (resolve) => {
        event.target.complete();
      },
      (reject) => {
        event.target.complete();
      }
    );
  }
}
