import { ToastService } from './../../providers/toast.service';
import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/providers/database.service';
import { DetailService } from 'src/app/providers/detail.service';
import { LoadingIndicatorService } from 'src/app/providers/loading-indicator.service';
import {
  ConnectionStatus,
  NetworkService,
} from 'src/app/providers/network.service';
import { AlertController, ModalController, Platform, ToastController } from '@ionic/angular';
import { NotificationsPage } from 'src/app/notifications/notifications.page';
import { AppConstant } from 'src/app/constants/app.constants';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  date;
  userName;
  companyId;
  auditsCountToRetrieve: string = '00';
  availAuditCount: string = '00';
  availCertificateCount: string = '00';
  backButtonSubscription; //added by lokesh for jira_id(701)
  auditNotifications: any=[];
  constructor(
    private appConstant: AppConstant,
    private detailService: DetailService,
    private network: NetworkService,
    private db: DatabaseService,
    private platform:Platform,
    public loader: LoadingIndicatorService,
    public modalController: ModalController,
    public toastController: ToastController,
    public toast: ToastService,
    private alertController:AlertController
  ) {
    this.date = new Date();
    /*  if (this.network.getCurrentNetworkStatus() === ConnectionStatus.Online)
       this.checkAndUpdateMasterTables(); */
  }
  /**added by lokesh for jira_id(701) START HERE */
 ngAfterViewInit() {
    console.log('ngAfterViewInit');
  //  this.initializeApp();//added by lokesh for jira_id(858)
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10,async () => {
      const alert = this.alertController.create({
        mode: 'ios',
        header: 'Mobile Auditing Application',
        message: 'Are you sure you want to exit?',
        cssClass: 'alertCancel',  /**added by lokesh for changing text into bold jira-ID=701*/
        buttons: [
          {
            text: 'Yes',
            cssClass: 'alertButton',  /**added by lokesh for changing text into bold mobile_jira jira-ID=701*/
            handler: () => {
              console.log('Delete Confired');
              navigator['app'].exitApp();
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
    });
  }

  ngOnDestroy() {
    this.backButtonSubscription.unsubscribe();
  }

    /**added by lokesh for jira_id(701) END HERE */
  ngOnInit() {
    this.getCurrentUser();
    this.loader.hideLoader();
    //added by lokesh for jira_id(830)
    this.db.getNotificationOfCurrentUser().subscribe((notifys) => {
      let data=notifys;
      console.log(data);
      if(data)
      this.auditNotifications = notifys.length;
    });
    //added by lokesh for  jira_id(830)
    if (this.network.getCurrentNetworkStatus() === ConnectionStatus.Online) {      
      this.checkAndUpdateMasterTables();
    //   this.getAuditsToRetriveForRetriveCard();      //removed by archana for jira-ID-MOBILE-682
    }
    /**Added by sudharsan for JIRA-ID-369 */
    // else if (this.network.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
    //   this.toast.presentToast('Internet is not Connected..! Please connect Internet...!!!');
    // }
    /**End here */
    this.db.loadDashboardData(this.userName);
    this.db.loadNotificationsOfCurrentUser(this.userName);
    this.db.getDashboardData().subscribe((counts) => {
      console.log('counts', counts);
      this.availCertificateCount =
        counts.Certificate_Count <= 9
          ? '0' + counts.Certificate_Count
          : counts.Certificate_Count;
      this.availAuditCount =
        counts.Audit_Count <= 9 ? '0' + counts.Audit_Count : counts.Audit_Count;
      console.log(this.availCertificateCount, this.availAuditCount);
    });

    // this.db.getAvailableCertificatesOfCurrentUser().then(res => {
    //   console.log("res",res)
    // })
  }

  doPullRefreshForRetriveAudit(event) {
    if (this.network.getCurrentNetworkStatus() === ConnectionStatus.Online) {
      this.getAuditsToRetriveForRetriveCard().then((resolve) => {
        event.target.complete();
      }, (reject) => {
        console.log(reject);
        event.target.complete();
      });
    }
    else {
      this.toast.presentToast('No Internet Connection...!!!');
      event.target.complete();
    }
  }

  getCurrentUser() {
    this.db.getCurrentUser().subscribe((user) => {
      console.log('$$$-getCurrentUserSubscription-$$$');
      this.userName = user.userName;
      this.companyId = user.companyId;
    });
  }

  checkAndUpdateMasterTables() {
    this.db.loadMaAuditCodes().then((auditCodes) => {
      console.log(
        'loadMaAuditCodes fired and maAuditCodes value is : ',
        auditCodes
      );
      if (auditCodes.length === 0) {
        this.loader.showLoader('Config');
        if (this.userName == undefined) this.getCurrentUser();
        this.detailService
          .getUpdateLatestMasterDataTables(this.userName) //user detail
          .subscribe((response) => {
            this.db.storeAllMasterDataTables(response).then(async (res) => {
              (await res) ? this.loader.hideLoader() : '';
            });
          });
      }
    });
  }

  getAuditsToRetriveForRetriveCard() {

    return new Promise<Object>((resolve, reject) => {

      let existsAudseqno;
      this.db.checkExistsData().then((res) => {
        existsAudseqno = res['status'];
        if (navigator.onLine) {
          let adt = {
            auditSeqNo: existsAudseqno,
            auditStatusId: 1001,
            auditSubTypeId: null,
            auditTypeId: null,
            certExpireDate: null,
            certIssueDate: null,
            certificateNo: null,
            companyId: parseInt(this.companyId),
            companyImoNo: null,
            pageNo: 0,
            retrieveFlag: true,
            emailId: this.userName,
            vesselImoNo: '',
            defaultSearchCount: 200,
            planApprovalAuthorise: 0
          };
          console.log(adt);
          this.detailService.retriveAudit(adt).subscribe((audits: any) => {
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

            let tempArray = audits;

            console.log('tempArray', tempArray);

            console.log('AuditsToRetrive : ', audits);
            this.auditsCountToRetrieve =
              audits.length <= 9 ? '0' + audits.length : audits.length;

            resolve(true)
          }, err => {
            console.log(err);
            reject(false)

          });
        }
      });

    })
  }

  async notificationModal() {
    const modal = await this.modalController.create({
      component: NotificationsPage,
    });
    return await modal.present();
  }
}
