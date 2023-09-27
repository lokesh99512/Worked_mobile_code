import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { type } from 'os';
import { AuthService } from 'src/app/providers/auth/auth.service';
import { DatabaseService } from 'src/app/providers/database.service';
import { ConnectionStatus, NetworkService } from 'src/app/providers/network.service';
import { ToastService } from 'src/app/providers/toast.service';

@Component({
  selector: 'app-central-login-systems',
  templateUrl: './central-login-systems.page.html',
  styleUrls: ['./central-login-systems.page.scss'],
})
export class CentralLoginSystemsPage implements OnInit {
  emailId: string;
  isPassword: any;
  loginDetails: { username: any; password: any; };
  password: any; //added by lokesh for jira_id(693)


  constructor(private db: DatabaseService,
    public modal: ModalController,
    public toast: ToastService,
    private network: NetworkService,
    private authService: AuthService,
    private alertCtrl:AlertController) { }

  ngOnInit() {
    this.db.getCurrentUser().subscribe((user) => {
      console.log(user);
      this.password=user.password; //added by lokesh for jira_id(693)
      this.emailId = user.userName;
    });
    this.presentPrompt(); //added by lokesh for jira_id(745)
  }

  async closeModal() {
    await this.modal.dismiss();
  }
  LoginDetails(email, password) {   //added by lokesh for jira_id(745)
    if(password!=""&&email!=""){
    if (this.network.getCurrentNetworkStatus() === ConnectionStatus.Online) { // added by archana for jira ID-MOBILE-681
    if (this.validate(password)) {
      this.loginDetails = {
        username: email,
        password: password
      }
      this.db.getMaUser(this.loginDetails).then((user) => {
        console.log(user);
      });
      this.authService.checkUserLogin(this.loginDetails);
       //added by lokesh for jira_id(693)
       if(this.isPassword==this.password){
        this.closeModal();
      }
    }} else {
      this.toast.presentToast('No Internet Connection...!!!');
    }
  }else{ //added by lokesh for jira_id(745)
    this.toast.presentToast("Please Enter Password")
    this.presentPrompt();
  }
  }
  validate(data) {
    console.log(data);

    if (data == undefined) {
      this.toast.presentToast('Please enter password');
      return false;
    } else if (data) {
      return true;
    }
  }
  //added by lokesh for jira_id(745) start here
  async presentPrompt() {
    let alert = this.alertCtrl.create({
      mode: 'ios',
      header: 'Central System Login',
      cssClass: 'my-custom-alert',//modified by lokesh for jira_id(745)
      inputs: [
        {
          name: 'username',
          value:this.emailId,
          placeholder:"UserName",
          type:"email",
          disabled:true
        },
        {
          name: 'password',
          placeholder: 'Password',
          type: 'password'
        }
      ],
      buttons: [
        {
          cssClass: 'alertButton', 
          text: 'Cancel',
          role: 'cancel',
          handler: (data) => {
            console.log('Cancel clicked');
            this.closeModal();
          }
        },
        {
          cssClass: 'alertButton', 
          text: 'Login',
          handler: (data) => {
            console.log(data.username, data.password);
            this.LoginDetails(data.username, data.password);
            this.closeModal();
          }
        }
      ]
    });
    (await alert).present();
  } //added by lokesh for jira_id(745) end here
}
