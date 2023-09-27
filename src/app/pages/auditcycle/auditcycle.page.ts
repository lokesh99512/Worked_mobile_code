import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import * as moment from 'moment';

import { DatabaseService } from 'src/app/providers/database.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-auditcycle',
  templateUrl: './auditcycle.page.html',
  styleUrls: ['./auditcycle.page.scss'],
})
export class AuditcyclePage implements OnInit {
  moment = moment;

  nextIntermediateStart;
  nextIntermediateEnd;
  nextRenewal;
  initialStartDate;
  nextRenewalStart;
  initilOrRenewal;
  renewalTemp;
  cycleGenNo;
  cycleGenNo1;
  intermediateDueDate;
  nextRenewalDueDate;
  initialOrRenwal;
  renewalTemp1;
  initialSkip;
  interSkip;
  renewalSkip;
  dirInterOrAdd;

  currentAuditSeqNo: any;
  currentCycleData: any[];
  allCycleData;
  prevRouteUrl: any;
  constructor(
    public modalController: ModalController,
    private db: DatabaseService,
    public alertController: AlertController,
    private router: Router
  ) {}
  //auditNotifications:Notification[] =  [];
  auditNotifications = [
    {
      dateTime: 'Wed Nov 27 2020 13:02:08 GMT+0530 (India Standard Time)',
      msg: 'Audit has been retrieved successfully for the Vessel AL KHATTIYAwith the IMO No 9431111',
      userName: 'karthik.pandiyan@bsolsystems.com',
    },
  ];
  ngOnInit() {
    /* console.log(this.navParams.data.CycleData);
    console.log(this.navParams.data.CurrentAuditSeqNo);

    this.allCycleData = this.navParams.data.CycleData;
    this.currentAuditSeqNo = this.navParams.data.CurrentAuditSeqNo; */

    this.allCycleData =
      this.router.getCurrentNavigation().extras.state.CycleData;
    this.currentAuditSeqNo =
      this.router.getCurrentNavigation().extras.state.CurrentAuditSeqNo;
    this.prevRouteUrl =
      this.router.getCurrentNavigation().extras.state.routeUrl;

    console.log('this.allCycleData', this.allCycleData);
    console.log('this.currentAuditSeqNo', this.currentAuditSeqNo);
    console.log(
      'routeUrl',
      this.router.getCurrentNavigation().extras.state.routeUrl
    );

    this.currentCycleData = this.allCycleData.filter((res) => {
      console.log(res);
      return res.auditSeqNo == this.currentAuditSeqNo;
    });

    this.allCycleData.forEach((element) => {
      console.log(element.auditSeqNo);
      console.log(!element.auditSeqNo);
      element.isChecked =
        element.auditSeqNo == this.currentAuditSeqNo || element.auditSeqNo == ''
          ? true
          : false;
    });

    const uniqueData = [...this.allCycleData.reduce((map,obj) => map.set(obj.cycleGenNo,obj) , new Map()).values()];

    console.log("uniqueData",uniqueData)

    this.allCycleData = uniqueData;

    this.allCycleData.sort(function (res1, res2) {
      return res1.cycleGenNo - res2.cycleGenNo;
    });
    if(this.allCycleData[0].auditSubTypeId==1004){
      this.dirInterOrAdd = true;
    }

    console.log("AUDIT CYCLE DATA",(this.allCycleData))
  }
  /**changes made my archana for jira-ID-MOBILE-466 start */
  checkEvent(cycleDataToShow) {
   if(this.allCycleData.length > 0){
    this.allCycleData.forEach((element) => {
      if (element.cycleGenNo == cycleDataToShow.cycleGenNo) {
        if (element.cycleGenNo == cycleDataToShow.cycleGenNo && element.isChecked == false) {
          element.isChecked = true;
        } else if (element.cycleGenNo == cycleDataToShow.cycleGenNo && element.isChecked == true) {
          element.isChecked = false;
        }
      }
    });
  }
  }
   /**changes made my archana for jira-ID-MOBILE-466 end */
  closeModal() {
    console.log('closeModal', this.prevRouteUrl);
    this.router.navigate([this.prevRouteUrl]);
  }
}
