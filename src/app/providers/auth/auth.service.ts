import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { ApiConfig } from '../../config/api';
import { ToastService } from '../toast.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DatabaseService } from '../database.service';
import { AlertController, ModalController } from '@ionic/angular';
import { CentralLoginSystemsPage } from 'src/app/pages/audit/central-login-systems/central-login-systems.page';
@Injectable()
export class AuthService {
  apiUrl = ApiConfig.oauthAPI;
  uname: any;
  password: any;
  formData: any;
  loginDetails: any;
  usname: any;
  data: any;

  constructor(
    private db: DatabaseService,
    public alertController: AlertController,
    private storage: NativeStorage,
    private http: HttpClient,
    public toast: ToastService,
    public modal: ModalController,
  ) { }

  /*   getAccessToken() {
    this.st
    return this.storage.getItem('token').then((val) => {
   }, error => console.error(error));
  } */

  storeAccessToken(token: string) {
    this.storage.setItem('token', token).then(
      () => console.log('Tokens Stored !'),
      (error) => console.error('Error storing Token', error)
    );
  }

  private removeToken() {
    this.storage.clear()
      .then(res => {
        console.log('Clearing database', res);
      })
      .catch(error => {
        console.log('Database clearing error: ', error);
      });
    //this.storage.remove('token');
  }

  doLogoutUser() {
    this.db.getCurrentUser().subscribe(
      (user) => {
        this.loginDetails = user;
        console.log(user);
        this.http
          .get(this.apiUrl + 'oauth/revoke?username=' + this.loginDetails.userName + "&companyId=" + this.loginDetails.companyId)
          .subscribe(res => {
            console.log('Clearing database', res);

            this.removeToken();
            this.db.isLoggedOut()
          })
      });
    this.removeToken();
  }

  refreshToken(data?) {
    let form: any = {};
    this.db.getCurrentUser().subscribe((user) => {
      form.username = user.userName ? user.userName : data.username;
      form.password = user.password ? user.password : data.password;
    });
    let params = new HttpParams();
    params = params.append('grant_type', 'password');
    params = params.append('username', form.username);
    params = params.append('password', form.password);
    params = params.append('client_id', 'auditapp');

    let headers = new HttpHeaders()
      .set('Authorization', 'Basic ' + 'YXVkaXRhcHA6c2VjcmV0')
      .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
    return this.http
      .post<any>(this.apiUrl + 'oauth/token', params, { headers: headers })
      .pipe(
        tap((tokens) => {
          this.storeAccessToken(tokens.access_token);
        }),
        retry(5),
        catchError(this.handleError('login', []))
      );
  }
  checkUserLogin(data) {
    console.log(data);
    this.login(data).subscribe(
      (res) => {
        console.log(res);
      });
    this.http
      .get<any>(this.apiUrl + 'oauth/login?un=' + data.username + "&pd=" + data.password,

        {
          headers: {

            "Content-type": "application/x-www-form-urlencoded; charset=utf-8"

          }
        }).subscribe(res => {
          console.log(res);
          this.data = res;
          this.logincheck(data, res);
        })
    return this.data;
  }
  login(data): Observable<any> {
    console.log('form Data from login screen', data);

    let params = new HttpParams();
    params = params.append('grant_type', 'password');
    params = params.append('username', data.username);
    params = params.append('password', data.password);
    params = params.append('client_id', 'auditapp');

    let headers = new HttpHeaders()
      .set('Authorization', 'Basic ' + 'YXVkaXRhcHA6c2VjcmV0')
      .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');

    return this.http
      .post<any>(this.apiUrl + 'oauth/token', params, { headers: headers })
      .pipe(
        tap((tokens) => {
          this.storeAccessToken(tokens.access_token);
        }),
        retry(2),
        catchError(this.handleError('login', []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);
      if (error.status === 404 || error.statusText === 'Unknown Error') {
        this.toast.presentToast('Server under Maintenance, Please try after sometime');
        if (error.error.success === false) {
          console.log('Login failed');
        } else {
          console.log('Something went wrong');
        }
      }
      // Let the app keep running by returning an empty result.
      return of(error);
    };
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    console.log(message);
  }

  serialize(obj): URLSearchParams {
    let params: URLSearchParams = new URLSearchParams();

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var element = obj[key];

        params.set(key, element);
      }
    }
    return params;
  }


  logOutAllDevice() {
    this.db.getCurrentUser().subscribe(
      (user) => {
        this.loginDetails = {
          username: user.userName,
          password: user.password
        };
        this.http
          .get<any>(this.apiUrl + 'oauth/revoke/login?username=' + user.userName + "&device=Mobile", {
            headers: {

              "Content-type": "application/x-www-form-urlencoded; charset=utf-8"

            }
          })
          .subscribe(res => {
            this.login(this.loginDetails).subscribe(
              (res) => {
                console.log(res);
              });
          })
      });
  }


  async logincheck(data, uidResult) {
    console.log(uidResult);

    console.log(data);
    this.usname = data.username;
    this.password = data.password;
    this.usname = this.usname.substring(0, this.usname.indexOf("@"));
    console.log(this.usname);
    if (uidResult && uidResult.val == 'invalied') {
      this.toast.presentToast('Invalid Password');
       this.centralSynLogin();//added by lokesh for jira_id(745)
    } else if (uidResult && uidResult.val == 'Inactive') {
      this.toast.presentToast('Login user is Inactive');
    } else if (uidResult.val == true && uidResult.device != "Mobile") {
      // this.centralSystem.closeModal();
      const alert = this.alertController.create({
        mode: 'ios',
        header: this.usname + ' ' + 'is already logged in ' + uidResult.device + ' Application',
        message: 'Do you want to logout from  ' + uidResult.device + ' Application and continue here?',

        cssClass: 'alertCancel',
        buttons: [
          {
            text: 'Yes',
            cssClass: 'alertButton',
            handler: () => {
              this.logOutAllDevice();
            },
          },
          {
            text: 'No',
            handler: () => {
              this.removeToken(); //added for jira id - Mobile-683
            },
          },
        ],
        backdropDismiss: false,   //added for jira id - Mobile-692
      });
      (await alert).present();
    }
  }

  async centralSynLogin() {
    const presentModel = await this.modal.create({
      component: CentralLoginSystemsPage,
      showBackdrop: true,
      backdropDismiss: false,   //added for jira id - Mobile-692
      mode: 'ios',
      cssClass: 'add-new-login-modal',
      animated: true,
    });

    presentModel.onDidDismiss().then((findingItemFromModal: any) => {
    });

    return await presentModel.present();
  }

  loginCredentials(data) {
    return this.http
      .get<any>(this.apiUrl + 'oauth/login?un=' + data.username + "&pd=" + data.password, {
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=utf-8"

        }
      })


  }

  logOutAllDeviceOnFirstLogin(emailId) {
    return this.http
      .get<any>(this.apiUrl + 'oauth/revoke/login?username=' + emailId + "&device=Mobile", {
        headers: {

          "Content-type": "application/x-www-form-urlencoded; charset=utf-8"

        }
      })
  }

}
