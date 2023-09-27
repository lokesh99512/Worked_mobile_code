import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(public toastController: ToastController) { }
  toast:HTMLIonToastElement;  // added by archana for jira Id-MOBILE-624
  async presentToast(msg: string, color?: string,duration?:number) {
    /**added by archana for jira Id-MOBILE-624 start */
    try{
      this.toast.dismiss();
     }catch(e){}
     /**added by archana for jira Id-MOBILE-624 end */
    (color === undefined) ? color = 'danger' : color = color;
    this.toast = await this.toastController.create({  // changed by archana for jira Id-MOBILE-624
      message: msg,
      buttons: [
        {
          icon: 'close-circle-outline',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ],
      duration: duration?duration:5000,//modified by lokesh for jira_id(726)
      position: 'top',
      color: color,
    },);
    this.toast.present();   // changed by archana for jira Id-MOBILE-624
  }
}
