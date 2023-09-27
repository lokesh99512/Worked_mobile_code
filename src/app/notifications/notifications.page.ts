import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { DatabaseService } from 'src/app/providers/database.service';
import { AlertController } from '@ionic/angular';

//import {Notification } from '../../interfaces/user';
import { waitForAsync } from '@angular/core/testing';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  presentDate: any[];
  emptyNotification;
  auditNotifications: any[];
  constructor(
    public modalController: ModalController,
    private db: DatabaseService,
    public alertController: AlertController
  ) {}
  //auditNotifications: Notification[] =  [];
  // auditNotifications =
  //      [
  //        {
  //        "dateTime": "Wed Nov 27 2020 13:02:08 GMT+0530 (India Standard Time)",
  //        "msg": "Audit has been retrieved successfully for the Vessel AL KHATTIYAwith the IMO No 9431111",
  //        "userName": "karthik.pandiyan@bsolsystems.com"
  //       }
  //    ];
  ngOnInit() {
    this.db.getNotificationOfCurrentUser().subscribe((notifys) => {
      console.log(notifys);
      this.auditNotifications = notifys;
    });
    this.presentDate = JSON.parse(JSON.stringify(this.auditNotifications));
    console.log(this.presentDate);
    let currentDate = Date.now();
    let today = moment(currentDate).format('D/M/Y');
    let yesterday = moment(currentDate).subtract(1, 'days').format('D/M/Y');
    if (this.presentDate) {
      for (let dates of this.presentDate) {
        let date = moment(dates.dateTime).format('D/M/Y');
        if (date === today) {
          dates.dateTime = 'Today';
          console.log(date);
        } else if (date === yesterday) {
          dates.dateTime = 'Yesterday';
        } else {
          dates.dateTime = date;
        }
      }
      console.log(this.presentDate);
      this.presentDate.reverse();
    } else {
      this.emptyNotification = 'No Notification Found';
    }
  }
  dismissModal() {
    this.modalController.dismiss({
      dismissed: true,
    });
  }

  async deleteNotificationAlert(userName, msg) {
    const clearNotificationAlert = await this.alertController.create({
      mode: 'ios',
      cssClass: 'my-custom-class',
      header: 'Delete Notification?',
      message: 'Are you sure you want delete notification?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          },
        },
        {
          text: 'Okay',
          handler: () => {
            for (let data in this.presentDate) {
              console.log(this.presentDate[data].userName);
              if (
                this.presentDate[data].userName === userName &&
                this.presentDate[data].msg === msg
              ) {
                const index: number = this.presentDate.indexOf(
                  this.presentDate[data]
                );
                this.presentDate.splice(index, 1);
              }
            }
            console.log(this.presentDate);
          },
        },
      ],
      backdropDismiss: false,
    });
    await clearNotificationAlert.present();
  }
  async deleteAllNotificationAlert() {
    if (this.presentDate.length > 0) {
      const clearAllNotificationAlert = await this.alertController.create({
        mode: 'ios',
        cssClass: 'my-custom-class',
        header: 'Clear Notification?',
        message: 'Are you sure you want Clear all notification?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
            },
          },
          {
            text: 'Okay',
            handler: () => {
              this.db.getCurrentUser().subscribe((res) => {
                console.log('res', res);
                this.db.clearNotificationsOfCurrentUser(res.userName);
                this.presentDate = [];
              });
              //this.db.clearNotificationsOfCurrentUser
            },
          },
        ],
        backdropDismiss: false,
      });
      await clearAllNotificationAlert.present();
    }
  }
  async showMessageDescription(msg) {
    const showNotiicationMesage = await this.alertController.create({
      mode: 'ios',
      header: 'Message',
      message: msg,
      buttons: [
        {
          text: 'Okay',
          handler: () => {},
        },
      ],
    });
    await showNotiicationMesage.present();
  }
}
