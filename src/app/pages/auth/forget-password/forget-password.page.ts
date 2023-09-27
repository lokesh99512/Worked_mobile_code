import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { ToastService } from 'src/app/providers/toast.service';
import { DetailService } from 'src/app/providers/detail.service';
import { AuthService } from 'src/app/providers/auth/auth.service';
import { LoadingIndicatorService } from 'src/app/providers/loading-indicator.service';
import {
  ConnectionStatus,
  NetworkService,
} from 'src/app/providers/network.service';
import { DatabaseService } from '../../../providers/database.service';
@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.page.html',
  styleUrls: ['./forget-password.page.scss'],
})
export class ForgetPasswordPage implements OnInit {
  verNum: ''
  flag=false;
  data: any = {};
  errorMsg=null;
  newPas=null;
  confNewPas=null;
  routeState: any;
  uname:any
  online=false;
  checkEqual: boolean;
  constructor(
    public toast: ToastService,
    private detailService: DetailService,
    private authService: AuthService,
    public loader: LoadingIndicatorService,
    private router: Router,
    private network: NetworkService,private db: DatabaseService,) {
    this.uname=this.router.getCurrentNavigation().extras.state;
   }

  ngOnInit() {
    if(this.network.getCurrentNetworkStatus() === ConnectionStatus.Online){
        this.online=true;
        console.log(this.online);
        this.resend();
     }
  }

  closeModal() {
    this.router.navigateByUrl("/login");
  }

  valPass(value){
    var pass = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;
     if (value != null) {
        if (!pass.test(value)) {
          this.errorMsg="Password should be atleast 8 characters long and should contain one number,one character and one special character";
          this.newPas=null;
          this.confNewPas=null;
        }
        else{
          this.errorMsg=null;
        }
     }
     else{
      this.errorMsg=null;
    }
  }

  verify(){
    if (!this.verNum) {
        this.toast.presentToast("Please Enter Verification Code sent to your registered mail id");
    }
    else {
        this.detailService.validateRandomNumber(this.uname,this.verNum).subscribe((res:any) => {
          console.log(res);
            if (res == true) {
                this.toast.presentToast("Code verified Successfully");
                this.flag=true;
            }
            else{
                this.toast.presentToast("Invalid Verification Code");
            }
        });
    }
  }

  resend(){
    var emailJson={
      emailId:this.uname
    };
    this.detailService.VerificationCodeNotification(emailJson).subscribe((res:any) => {
      console.log(res);
      });
  }

  reset(){
    if(this.newPas!==this.confNewPas || this.newPas==null || this.confNewPas==null)
    {
      if(this.newPas!==this.confNewPas){
          this.toast.presentToast("Confirm New Password should be same as New Password");
          this.newPas==null;
          this.confNewPas==null;
      }
      else if (this.newPas == null) {
          this.toast.presentToast("Password Should not be empty");
      }
    }
    if (this.newPas == this.confNewPas && this.confNewPas !== null && this.newPas!==null) {
      if (this.network.getCurrentNetworkStatus() ===ConnectionStatus.Online) {
          this.updateCentralPwd();
      }
      this.db.updatePassword(this.uname,this.newPas,0).then((res:any) => {
          this.loader.hideLoader();
          this.router.navigateByUrl('/login');
     });
    }
  }

  updateCentralPwd(){
    this.checkEqual = this.detailService.checkPin();
     this.detailService.changeCentralPassword(this.uname,this.newPas).subscribe((res:any) => {
        console.log(res);
        if(res==true){
            this.toast.presentToast('Password Updated Successfully');
        }
      });
  }
}
