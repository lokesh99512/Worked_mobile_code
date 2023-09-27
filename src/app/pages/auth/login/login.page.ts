import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonRouterOutlet, MenuController, Platform } from '@ionic/angular';
import { AuthService } from 'src/app/providers/auth/auth.service';
import { DatabaseService } from 'src/app/providers/database.service';
import { DetailService } from 'src/app/providers/detail.service';
import { LoadingIndicatorService } from 'src/app/providers/loading-indicator.service';
import {
  ConnectionStatus,
  NetworkService,
} from 'src/app/providers/network.service';
import { ToastService } from 'src/app/providers/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy, AfterViewInit {
  backButtonSubscription;

  loginForm: FormGroup;
  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';
  isIpadAndTablet: boolean;
  makeUserNameReadOnly: boolean;
  online = false;
  password: any;
  formData: {};
  userName: any;
  formDetails: any;
  result: any;
  lpinStatus: any;

  constructor(
    private formBuilder: FormBuilder,
    public alertController: AlertController,
    private db: DatabaseService,
    public loader: LoadingIndicatorService,
    private router: Router,
    private network: NetworkService,
    public toast: ToastService,
    private authService: AuthService,
    public detailService: DetailService,
    private platform: Platform,
    route: ActivatedRoute,
    private routerOutlet: IonRouterOutlet,
    public menuCtrl: MenuController
  ) {
    if (this.platform.is('ipad') || this.platform.is('tablet')) {   //changed by Ramya on 18-10-2022 for jira id - Mobile-714
      console.log(this.platform.is('tablet'));
      console.log(this.platform.is('ipad'));

      this.isIpadAndTablet = true;
    } else {
      this.isIpadAndTablet = false;
    }
  }

  ngOnInit() {
    console.log('ngOnInit');
    this.routerOutlet.swipeGesture = false;
    if (this.network.getCurrentNetworkStatus() === ConnectionStatus.Online) {
      this.online = true;
    }
    else {
      this.online = false;
    }
    this.loginForm = this.formBuilder.group({
      username: [
        /* 'yuvaraj.d@bsolsystems.com', */ /* 'zhe@register-iri.com', */ '',
        [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]
      ] /* 'zhe@register-iri.com' */,
      password: ['', Validators.required],
    });
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter');
    this.menuCtrl.enable(false);
    this.loginForm.reset();
  }

  ionViewDidLeave() {
    this.menuCtrl.enable(true);
  }

  async ionViewDidEnter() {
    console.log('ionViewDidEnter');
    await this.db.getCurrentUser().subscribe(async (user) => {
      console.log('USER ::', user);

      await this.loginForm.patchValue({ username: user.userName });

      this.makeUserNameReadOnly = true;
    });
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit');

    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      navigator['app'].exitApp();
    });
  }

  ngOnDestroy() {
    this.backButtonSubscription.unsubscribe();
  }

  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }
  onFormSubmit(form: NgForm) {
    this.formDetails = form;
    console.log(this.makeUserNameReadOnly);
    console.log('form', form);
    if (this.validateUser(form)) {
      this.db.getMaUser(form).then((user) => {
        console.log(user, this.network.getCurrentNetworkStatus() === ConnectionStatus.Online);

        if (!user && !(this.network.getCurrentNetworkStatus() === ConnectionStatus.Online)) {
          console.error("offline/invalid pwsd");

          if (this.makeUserNameReadOnly == true) {
            this.toast.presentToast('Incorrect Password!!!');
          } else {                                                  ////added for jira id - Mobile-680
            this.toast.presentToast('No Internet Connection...!!!');
          }
        }
        else {
          if (
            user != null &&
            user.userId === this.loginForm.get('username').value
          ) {
            this.db.getLpinActiveStatus(user.userId, user.companyId).then((res) => {
              this.lpinStatus = res;
              if (this.lpinStatus && this.lpinStatus.userApproval == 0) {
                this.toast.presentToast('Same User Already Installed in different machine. Please try to be there!');
                this.loader.hideLoader();

              }
              else {
                console.log('offline login', user);
                this.loader.showLoader('Login');
                user.emailId = user.userId;
                this.db.addCurrentUser(user).then((_) => {
                  console.log('addCurrentUser has done through maUsers', user);
                  this.loader.hideLoader();
                  this.router.navigateByUrl('/dashboard');
                });
              }
            });


          } else {
            console.log('online Login');
            if (
              this.network.getCurrentNetworkStatus() === ConnectionStatus.Online
            ) {
              this.loader.showLoader('Login');
              this.authService.login(form).subscribe(
                (res) => {
                  console.log(res);
                  if (!res.error) {
                    if (this.makeUserNameReadOnly == undefined) {
                      //added for jira id - Mobile-695
                      this.authService.loginCredentials(form).subscribe(
                        (res) => {
                          console.log(res);

                          if (res.val == false || (res.val == true && res.device == 'Mobile')) {
                            let emailId = this.loginForm.get('username').value;
                            let data = {
                              emailId: emailId,
                            };
                            this.detailService
                              .getCompanydetails(data) //user detail
                              .subscribe((response) => {
                                console.log(response);
                                this.detailService
                                  .checkrolesPresent(emailId, response[0].managerOfficialId, response[0].companyId, 'Mobile')
                                  .subscribe((res) => {
                                    console.log(res);
                                    if (res.result == 'present') {
                                      if (
                                        response[0].activeStatus == 1 &&
                                        response[0].roles[0].roleId !== 1002 &&
                                        response[0].roles[0].roleId !== 1003
                                      ) {
                                        console.log(response);
                                        response[0].password =
                                          this.loginForm.get('password').value;
                                        this.db.addCurrentUser(response[0]).then((_) => {
                                          console.log('addCurrentUser has done through api', res);
                                          this.detailService.mobilePinCentralData(data).subscribe((res: any) => {
                                            console.log(res)
                                            if (res.length == 0) {
                                              this.toast.presentToast('No such User Present');
                                              this.loader.hideLoader();
                                            } else {

                                              this.db.saveMpin(res).then((res) => {
                                                console.log("saveMpin")
                                                console.log(res);
                                                this.router.navigateByUrl('/dashboard');

                                                this.makeUserNameReadOnly = true;
                                              });
                                            }
                                          });


                                        });
                                      } else if (response[0].activeStatus == 0) {
                                        this.toast.presentToast('Current user is InActive');
                                        this.loader.hideLoader();
                                      } else if (
                                        response[0].roles[0].roleId === 1002 ||
                                        response[0].roles[0].roleId === 1003
                                      ) {
                                        this.loader.hideLoader();
                                        this.toast.presentToast(
                                          'Only Auditors can login through Mobile Application'
                                        );
                                      }
                                    }
                                    else if (res.result == "notpresent") {

                                      this.loader.hideLoader();
                                      this.toast.presentToast('Login User is not an RMI User');
                                    }

                                    else {
                                      this.loader.hideLoader();
                                      this.toast.presentToast('RMI Server Is Down...!');
                                    }
                                  });
                              });
                          }
                          else if (res.val == true) {
                            this.loader.hideLoader();

                            this.alreadyLoggedIn(this.loginForm, res);
                          }
                          else if (res.val == 'invalied') {
                            this.loader.hideLoader();
                            if (this.makeUserNameReadOnly == true)
                              this.toast.presentToast('Incorrect Password!!!');
                            else
                              this.toast.presentToast('Incorrect Username / Password!!!');
                          }
                        });
                    }
                    else {
                      let emailId = this.loginForm.get('username').value;
                      let data = {
                        emailId: emailId,
                      };
                      this.detailService
                        .getCompanydetails(data) //user detail
                        .subscribe((response) => {
                          this.detailService
                            .checkrolesPresent(emailId, response[0].managerOfficialId, response[0].companyId, 'Mobile')
                            .subscribe((res) => {
                              console.log(res);
                            });
                          if (
                            response[0].activeStatus == 1 &&
                            response[0].roles[0].roleId !== 1002 &&
                            response[0].roles[0].roleId !== 1003
                          ) {
                            console.log(response);
                            response[0].password =
                              this.loginForm.get('password').value;
                            this.db.addCurrentUser(response[0]).then((_) => {
                              console.log('addCurrentUser has done through api', res);
                              // this.loader.hideLoader();
                              this.router.navigateByUrl('/dashboard');
                              // this.loader.hideLoader();
                            });
                          } else if (response[0].activeStatus == 0) {
                            this.toast.presentToast('Current user is InActive');
                            this.loader.hideLoader();
                          } else if (
                            response[0].roles[0].roleId === 1002 ||
                            response[0].roles[0].roleId === 1003
                          ) {
                            this.loader.hideLoader();
                            this.toast.presentToast(
                              'Only Auditors can login through Mobile Application'
                            );
                          }
                        });
                    }
                  } else {
                    this.loader.hideLoader();
                    if (res.status == 400 && !this.makeUserNameReadOnly) {
                      this.toast.presentToast('Incorrect Username / Password!!!');
                    }
                    else if (this.makeUserNameReadOnly == true) {
                      this.toast.presentToast('Incorrect Password!!!');
                    }
                  }
                },
                (err) => {
                  console.log(err);
                  this.loader.hideLoader();
                }
              );
            } else {
              this.toast.presentToast('No Internet Connection...!!!');
            }
          }

        }
      });
    }
  }

  //added for jira id - Mobile-695 START
  async alreadyLoggedIn(data, res) {
    console.log(res);

    console.log(data);
    this.userName = data.value.username;
    this.password = data.value.password;
    this.userName = this.userName.substring(0, this.userName.indexOf("@"));
    this.formData = {
      emailId: data.value.username
    }
    const alert = this.alertController.create({
      mode: 'ios',
      header: this.userName + ' ' + 'is already logged in ' + res.device + ' Application',
      message: 'Do you want to logout from  ' + res.device + ' Application and continue here?',
      cssClass: 'alertCancel',
      buttons: [
        {
          text: 'Yes',
          cssClass: 'alertButton',
          handler: () => {
            this.authService.logOutAllDeviceOnFirstLogin(data.value.username).subscribe((res) => {    //added for jira id - Mobile-690
              this.detailService.mobilePinCentralData(this.formData).subscribe((res: any) => {
                console.log(res)
                if (res.length == 0) {
                  this.toast.presentToast('No such User Present');
                  this.loader.hideLoader();
                } else {
                  this.db.saveMpin(res).then((res) => {
                    console.log(res);

                  });
                  this.makeUserNameReadOnly = undefined;
                }
              });
              this.onFormSubmit(this.formDetails);
            });
          },
        },
        {
          text: 'No',
          handler: () => {
            
          },
        },
      ],
      backdropDismiss: false,   //added for jira id - Mobile-692
    });
    (await alert).present();
  }
  //added for jira id - Mobile-695 END
  
  validateUser(form) {

    console.log("validateUser...")

    if (!form.password && !form.username) {
      if (this.network.getCurrentNetworkStatus() === ConnectionStatus.Online) {
        this.toast.presentToast('Please enter username and password to login');
        return false;
      }
      else {
        this.toast.presentToast('No Internet Connection...!!!');
      }

    }
    else if (!form.username) {
      this.toast.presentToast('Please enter username');
      return false;
    }
    else if (!form.password) {
      this.toast.presentToast('Please enter password');
      return false;
    }

    else if (form.password && form.username) {
      return true;
    }
  }

  forgetPassword() {
    if (!this.loginForm.get('username').value) {
      this.toast.presentToast('Please enter valid EmailId');
    }
    else if (this.loginForm.get('username').value) {
      var emailId = this.loginForm.get('username').value;

      this.db.checkUserId(emailId).then((res: any) => {
        console.log(res);
        if (res.COUNT == 1 && res.ACTIVE_STATUS == 1) {
          this.router.navigateByUrl('/forget-password', {
            state: this.loginForm.get('username').value
          });
        }
        else if (res.ACTIVE_STATUS == 0) {
          this.toast.presentToast("Current User is InActive");
        }
        else {
          this.toast.presentToast("Check EmailId");
        }
      });
    }
  }
}
