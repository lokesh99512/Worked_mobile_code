import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import * as JSZip from 'jszip';
import { AuditSearchService } from 'src/app/providers/audit-search.service';
import { DatabaseService } from 'src/app/providers/database.service';
import { DetailService } from 'src/app/providers/detail.service';
import { LoadingIndicatorService } from 'src/app/providers/loading-indicator.service';
import {
  ConnectionStatus,
  NetworkService,
} from 'src/app/providers/network.service';
import { MoreInfoPage } from '../more-info/more-info.page';
import { FileManagerService } from 'src/app/providers/file-manager.service';
import { ToastService } from 'src/app/providers/toast.service';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { AppConstant } from 'src/app/constants/app.constants';
declare function decodeURIComp(base64): any;
@Component({
  selector: 'app-synchroize',
  templateUrl: './synchroize.page.html',
  styleUrls: ['./synchroize.page.scss'],
})
export class SynchroizePage implements OnInit, OnDestroy, AfterViewInit {
  backButtonSubscription;

  @ViewChild('mySelect', { static: true }) selectRef: any;
  date = 'date';
  number = 'number';
  text = 'text';

  searchCategory = this.auditsearch.searchCategory;

  searchCategoryOptions = Object.keys(this.searchCategory[0]);

  fakeAudits: Array<any> = new Array(5);
  selectedType: any;
  searchText: any;
  searchType: any;
  searchPlaceholderText: string = 'Search';
  searchCategoryType: any;
  tempArray: any = [];
  userName: any;
  searchArray: Object;
  dirName: string;
  syncData: any;
  userDetails: any;
  mPinId: any;
  uName: { emailId: string; };
  linkedDmlc: boolean;//added by lokesh for jira_id(905)
  selectedDate: string;
  backUpData: any;
  constructor(
    public modal: ModalController,
    private auditsearch: AuditSearchService,
    private network: NetworkService,
    private db: DatabaseService,
    private fileManager: FileManagerService,
    public loader: LoadingIndicatorService,
    private router: Router,
    private platform: Platform,
    public alertController: AlertController,
    private file: File,
    public datepipe: DatePipe,
    private detailService: DetailService,
    public toast: ToastService
  ) {}
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
    });
    this.initDataItems();
  }
  ngAfterViewInit() {
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      this.router.navigateByUrl('/dashboard');
    });
  }

  ngOnDestroy() {
    this.backButtonSubscription.unsubscribe();
  }

  private initDataItems() {
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
  }

  syncronize(auditItem) {
    this.syncData = auditItem;
    console.log(auditItem);
    console.log(
      auditItem.auditSeqNo,
      auditItem.auditTypeId,
      auditItem.companyId
    );
    if (this.network.getCurrentNetworkStatus() === ConnectionStatus.Online) {
      this.db.getCurrentUser().subscribe(             // added by ramya for jira ID-Mobile-706
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

        
      this.db.loadCurrentUserLogin().then((loginData) => {
      // Added by sudharsan for JIRA-370
      this.detailService
        .checkAuditStatus(
          auditItem.auditSeqNo,
          auditItem.auditTypeId,
          auditItem.companyId
        )
        .subscribe((res) => {
          console.log('checkAuditStatus', res);
          if (res.auditStatus == 1004) {
            this.toast.presentToast('Audit has been marked as void', 'danger');
          } else {
            this.db
              .getAuditDataSeqNo(auditItem.auditSeqNo)
              .then((auditBased) => {
                console.log(auditBased);
                this.db
                  .getCertificateDataSeqNo(auditItem.auditSeqNo)
                  .then((certificateResponse) => {
                    console.log('certificateResponse ', certificateResponse);
                    console.log('auditBased ', auditBased);
                    if (certificateResponse[0]) {
                      var cnt = 0;

                      if (
                        moment(certificateResponse[0].auditDate).format(
                          'YYYY-MM-DD'
                        ) ==
                        moment(auditBased[0].auditDate).format('YYYY-MM-DD')
                      )
                        cnt++;
                      if (
                        moment(certificateResponse[0].issueDate).format(
                          'YYYY-MM-DD'
                        ) ==
                        moment(auditBased[0].certIssueDate).format('YYYY-MM-DD')
                      )
                        cnt++;
                      if (
                        moment(certificateResponse[0].expiryDate).format(
                          'YYYY-MM-DD'
                        ) ==
                        moment(auditBased[0].certExpireDate).format(
                          'YYYY-MM-DD'
                        )
                      )
                        cnt++;

                      if (cnt == 3) {
                        this.db
                          .prepareAndSaveJsonFile(auditItem.auditSeqNo)
                          .then((res: any) => {
                            console.log(res);
                            if (
                              res.AuditData.certificateDetail[0].certIssueId ==
                              1007
                            ) {
                              res.AuditData.certificateDetail[0].extendedExpireDate =
                                res.AuditData.certificateDetail[0].certExpireDate;
                            }
                            if (res.AuditData.auditTypeId == 1003) {
                              res.AuditData.certificateDetail[0].dmlcIssuePlace =
                                res.AuditData.certificateDetail[0]
                                  .dmlcIssuePlace
                                  ? decodeURIComponent(
                                      window.atob(
                                        res.AuditData.certificateDetail[0]
                                          .dmlcIssuePlace
                                      )
                                    )
                                  : 'N.A';
                            }
                            switch (res.AuditData.auditTypeId) {
                              case 1001:
                                this.saveJsonFile('ISM', res);
                                break;
                              case 1002:
                                this.saveJsonFile('ISPS', res);
                                break;
                              case 1003:
                                this.saveJsonFile('MLC', res);
                                break;
                              case 1005:
                                this.saveJsonFile('DMLC II', res); // Changed by sudharsan Jira MOBILE-457
                                break;
                              default:
                                alert('Something went wrong');
                            }
                          });
                      } else
                        this.toast.presentToast(
                          'Please generate the certificate once again because audit data mismatching',
                          'danger'
                        );
                    } else {
                      this.db
                        .prepareAndSaveJsonFile(auditItem.auditSeqNo)
                        .then((res: any) => {
                          console.log(res);
                          switch (res.AuditData.auditTypeId) {
                            case 1001:
                              this.saveJsonFile('ISM', res);
                              break;
                            case 1002:
                              this.saveJsonFile('ISPS', res);
                              break;
                            case 1003:
                              this.saveJsonFile('MLC', res);
                              break;
                            case 1005:
                              this.saveJsonFile('DMLC II', res); // Changed by sudharsan Jira MOBILE-457
                              break;
                            default:
                              alert('Something went wrong');
                          }
                        });
                    }
                  });
              });
          }
        });
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
      this.toast.presentToast('No Internet Connection...!!!', 'danger'); // Added by sudharsan for JIRA-370
    }
  }

  saveJsonFile(audType, res) {
    let auditData = res.AuditData;
    let pfind = res.prevFindingData;
    console.log('auditData', auditData);
    if (auditData.certificateDetail.length > 0) {
      auditData.certificateDetail[0].issuerSignDate = auditData
        .certificateDetail[0].issuerSignDate
        ? this.datepipe
            .transform(
              new Date(auditData.certificateDetail[0].issuerSignDate),
              'yyyy-MM-dd'
            )
            .toString()
        : '';
    }
    this.fileManager.createAuditDetailsDirectoryIfNotExist().then((_) => {
      this.fileManager.createAuditTypeDirectoryIfNotExist(audType).then((_) => {
        this.fileManager
          .createAuditDirectoryIfNotExist(audType, auditData.auditSeqNo)
          .then((_) => {
            this.fileManager
              .writeFinalAuditJSON_File(
                audType,
                auditData.auditSeqNo,
                auditData.auditSeqNo + '.json',
                auditData
              )
              .then((_) => {
                //this.fileManager.deleteInvalidAttachmentFiles('AuditDetails/' + audType, auditData.auditSeqNo, auditData.auditRptAttach).then(_ => {
                if (res.prevFindingData.length > 0) {
                  this.fileManager
                    .createPF_DirectoryIfNotExist(audType, auditData.auditSeqNo)
                    .then((_) => {
                      let countPrev = 0;
                      console.log(res.prevFindingData);
                      res.prevFindingData.forEach((element) => {
                        console.log(element);
                        element.findingDetail.forEach((element1) => {
                          if (element1.nextActionId == 1010) countPrev++;
                        });
                      });
                      console.log(countPrev);
                      // if (countPrev != res.prevFindingData.length) {                 //removed by archana for jira ID-MOBILE-871
                        this.fileManager
                          .writeFinalPFJSON_File(
                            audType,
                            auditData.auditSeqNo,
                            'pf.json',
                            pfind
                          )
                          .then((_) => {
                            this.createZipFile(audType, res);
                          });
                      // } else {
                      //   this.createZipFile(audType, res);
                      // }
                    });
                } else {
                  this.createZipFile(audType, res);
                }
              });
            // })
          });
      });
    });
  }
  createZipFile(audType, res) {
    console.log(res.AuditData,"=-=-=-=-=-=-=-=-=-=-=-=-=-")
    if(res.AuditData.auditTypeId == 1005){
      this.loader.showLoader('Prepare2Syncreview');
    }
    /**Added by sudharsan for JIRA_ID=567 */
    else if(res.AuditData.auditTypeId == 1003){
      this.loader.showLoader('Prepare2Syncinspection');
    }
    /**End here */
    else{
      this.loader.showLoader('Prepare2Sync');
    }
    
    let auditData = res.AuditData;
    let zipDestLocation = { type: audType, seq: auditData.auditSeqNo };

    let zip = new JSZip();
    var rootFolder = zip.folder(auditData.auditSeqNo);

    this.fileManager
      .getListOfDirectory('AuditDetails/' + audType, auditData.auditSeqNo, true)
      .then(
        (dir) => {
          if (dir) {
            console.log('dirs', dir);
            dir.forEach((element) => {
              if (element.isFile) {
                rootFolder.file(
                  element.name,
                  this.fileManager.getFileOfDirectory(
                    element.nativeURL,
                    element.name
                  )
                );
              } else if (element.isDirectory) {
                this.fileManager.createDirectory(rootFolder, element);
              }
            });
            setTimeout(() => {
              let toastMsg = '';

              if (auditData.auditTypeId == 1001 || 1002) {
                toastMsg = 'Audit';
              } else if (auditData.auditTypeId == 1003) {
                toastMsg = 'Inspection';
              } else if (auditData.auditTypeId == 1005) {
                toastMsg = 'DMLC II';
              }

              this.fileManager
                .generateAndSaveZipFile(
                  zipDestLocation.type,
                  zipDestLocation.seq,
                  zip
                )
                .then((zipSaved) => {
                  if (zipSaved) {
                    this.fileManager
                      .getZipDataToSync(zipDestLocation)
                      .then((fileData) => {
                        console.log('fileData', fileData);
                        var data = {
                          auditSeqNo: parseInt(auditData.auditSeqNo),
                          companyId: auditData.companyId,
                          auditTypeId: auditData.auditTypeId,
                          fileByte: fileData,
                        };
                        console.log('param', JSON.stringify(data));
                        this.loader.hideLoader();
                        if (
                          this.network.getCurrentNetworkStatus() ===
                          ConnectionStatus.Online
                        ) {
                          this.loader.showLoader('AuditSync');

                          this.detailService
                            .syncCentral(
                              auditData.auditTypeId,
                              auditData.companyId,
                              JSON.stringify(data)
                            )
                            .subscribe((syncRes) => {
                              console.log(syncRes);
                              if (syncRes == 'OK') {
                                /**added by archana for jira ID-MOBILE-766 start */
                                syncRes = data;
                                if (syncRes.auditSeqNo) {
                                  this.detailService.createOrgBlob(data.auditSeqNo, data.auditTypeId, data.companyId)
                                    .subscribe((screenData) => {
                                      console.log(screenData);
                                     this.detailService.createBlob(data.auditSeqNo, data.companyId)
                                        .subscribe((res) => {
                                          console.log(res);
                                   });
                                  /**added by archana for jira ID-MOBILE-766 end */
                                this.loader.hideLoader();
                                this.db
                                  .deleteSelectedAudit(auditData)
                                  .then((res: any) => {
                                    if (res.status === 'ok') {
                                      this.fileManager
                                        .removeAuditDirectory(
                                          audType,
                                          auditData.auditSeqNo
                                        )
                                        .then((isAuditDeleted) => {
                                          if (isAuditDeleted) {

                                            // this.detailService                    // removed by archana for jira-ID-MOBILE-513
                                            //   .updateLockStatusCentral(
                                            //     auditData.auditTypeId,
                                            //     auditData.auditSeqNo,
                                            //     auditData.companyId,
                                            //     0,
                                            //     this.userName
                                            //   )
                                            //   .subscribe(
                                            //     (res) => {
                                            //       console.log(
                                            //         'updateLockStatusCentral status',
                                            //         res
                                            //       );

                                                  console.log(
                                                    'notifications..',
                                                    auditData
                                                  );
                                                  console.log(
                                                    'toastMsg..',
                                                    toastMsg
                                                  );

                                                  if (
                                                    auditData.auditTypeId ==
                                                    1005
                                                  ) {
                                                    this.db.addNotificationMsg(
                                                      'Review has been synchronized successfully for the vessel ' +
                                                        auditData.vesselNameAud +
                                                        ' with the IMO No ' +
                                                        auditData.vesselImoNo,
                                                      new Date(),
                                                      auditData.userIns,
                                                      'S'
                                                    );
                                                    this.toast.presentToast(
                                                      (this.linkedDmlc==true?'The linked DMLC II ':'')+`Review has been synchronized successfully for the vessel ${auditData.vesselNameAud} with the IMO No: ${auditData.vesselImoNo}`, // Changed by sudharsan Jira MOBILE-457, //toster modified by lokesh for jira_id(730,731)
                                                      'success'
                                                    );//toster modified by lokesh for jira_id(905)
                                                  }
                                                  /**Added by sudharsan for JIRA_ID=567 */
                                                  else if (
                                                    auditData.auditTypeId ==
                                                    1003
                                                  ) {
                                                    this.db.addNotificationMsg(
                                                      'Inspection has been synchronized successfully for the vessel ' +
                                                        auditData.vesselNameAud +
                                                        ' with the IMO No ' +
                                                        auditData.vesselImoNo,
                                                      new Date(),
                                                      auditData.userIns,
                                                      'S'
                                                    );
                                                    this.linkedDmlc=true;
                                                    this.toast.presentToast(
                                                      `Inspection has been synchronized successfully for the vessel ${auditData.vesselNameAud} with the IMO No: ${auditData.vesselImoNo}`, // Changed by sudharsan Jira MOBILE-457, //toster modified by lokesh for jira_id(730,731)
                                                      'success'
                                                    );//toster modified by lokesh for jira_id(906)
                                                  } 
                                                  /**End here */
                                                  else {
                                                    this.db.addNotificationMsg(
                                                      'Audit has been synchronized successfully for the Vessel ' +
                                                        auditData.vesselNameAud +
                                                        ' with the IMO No ' +
                                                        auditData.vesselImoNo,
                                                      new Date(),
                                                      auditData.userIns,
                                                      'S'
                                                    );

                                                    // Notification Code Sync

                                                    this.toast.presentToast(
                                                      `${toastMsg} has been synchronized successfully for the vessel ${auditData.vesselNameAud} with the IMO No: ${auditData.vesselImoNo}`,//toster modified by lokesh for jira_id(730,731)
                                                      'success'
                                                    );
                                                  }
                                                  // Notification Code Sync

                                                  //sync linked dmlc review
                                                  if (
                                                    auditData.auditTypeId ==
                                                      1003 &&
                                                    auditData.sspReviewDetail[0]
                                                      .sspDmlcAuditSeqNo
                                                  ) {
                                                    this.db
                                                      .getAuditdata(
                                                        auditData
                                                          .sspReviewDetail[0]
                                                          .sspDmlcAuditSeqNo
                                                      )
                                                      .then((dmlcAuditData) => {
                                                        this.syncronize(
                                                          dmlcAuditData[0]
                                                        );
                                                      });
                                                  }
                                                  this.initDataItems();
                                              //   },                           // removed by archana for jira-ID-MOBILE-513
                                              //   (err) => {
                                              //     console.log(
                                              //       'Error updateLockStatusCentral',
                                              //       JSON.stringify(err)
                                              //     );
                                              //   }
                                              // );
                                          }
                                        });
                                    }
                                  });
                                 });
                                }
                              } else {
                                this.loader.hideLoader();
                                this.toast.presentToast(
                                  'Something went wrong, Please try again',
                                  'danger'
                                );
                              }
                            });
                        } else {
                          console.log('why no internet showing');
                          this.loader.hideLoader();
                          this.toast.presentToast(
                            'No Internet Connection...!!!',
                            'danger'
                          );
                        }
                      });
                  }
                });
            }, 2000);
          }
        },
        (err) => {
          this.loader.hideLoader();
          this.toast.presentToast(
            'Something went wrong, Please try again',
            'danger'
          );
        }
      );
  }
}
