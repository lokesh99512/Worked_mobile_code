import { Injectable } from '@angular/core';
import { ApiConfig } from '../../app/config/api';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, retry, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoadingIndicatorService } from './loading-indicator.service';
import { ToastService } from './toast.service';
import { isArray } from 'util';
import { AuthService } from './auth/auth.service';
import { DatabaseService } from './database.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DetailService {
  apiUrl = ApiConfig.API;
  oauthApi = ApiConfig.oauthAPI;
  isEqual: boolean;
  checkEqual: boolean;
  mPinId: any;
  userName: { emailId: any; };
  userDetails: any;
  constructor(
    private http: HttpClient,
    public loader: LoadingIndicatorService,
    public toast: ToastService,
    private db: DatabaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  /* Login screen API calls */
  getCompanydetails(data) {
    return this.http.post(this.apiUrl + 'master/getCompanydetails', data).pipe(
      retry(5),
      map((res) => res),
      catchError(this.handleErrors.bind(this))
    );
  }

  getDomainNameCentral(companyId) {
    return this.http
      .get(this.apiUrl + 'typeAhead/getDomainNameCentral/' + companyId)
      .pipe(
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }

  //get master_table_update central
  getUpdatedDbdata(companyId) {
    return this.http
      .post(this.apiUrl + 'typeAhead/getUpdatedDbdata/' + companyId, '')
      .pipe(
        retry(3),
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }

  // refresh all masterdata
  public getUpdateLatestMasterDataTables(username) {
    let bean = {
      configDetails: 0,
      attachmentTypes: 1,
      auditCodes: 1,
      auditRoles: 1,
      auditSearchSource: 1,
      auditStatus: 1,
      auditSubtype: 1,
      auditSummary: 1,
      auditType: 1,
      certificateIssued: 1,
      company: 1,
      findingsCategory: 1,
      findingsStatus: 1,
      roles: 1,
      users: 1,
      vesselType: 1,
      vessel: 1,
      vesselcompany: 1,
      port: 1,
    };
    return this.http
      .post(
        this.apiUrl +
          'typeAhead/refreshMasterData/' +
          username /* "demo@register-iri.com" */ +
          '/' +
          2,
        bean
      )
      .pipe(
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }

  retriveAudit(adt) {
    return this.http
      .post(this.apiUrl + 'audit/search/getSearchResult', adt)
      .pipe(
        retry(3),
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }

  saveAudit(reqestedBean) {
    //mobileRetrieveAudit
    return this.http
      .post(
        this.apiUrl +
          'audit/ism/mobileRetrieveAudit/' +
          reqestedBean.auditTypeId +
          '/' +
          reqestedBean.auditSeqNo +
          '/' +
          reqestedBean.companyId +
          '/' +
          reqestedBean.audLeadStatus +
          '/' +
          reqestedBean.timeStamp,
        ''
      )
      .pipe(
        retry(3),
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }

  handleErrors(error: Response) {
    console.log(error);
    if (error.status === 0) {
      //added for jira id - Mobile-696  START
      this.db.getCurrentUser().subscribe(
        (user) => {
          this.userDetails=user;
          console.log(user);
          this.userName={
            emailId: user.userName}
          this.db.getlaptopId(user.userName).then((result)=>{
            this.mPinId=result;
          });

        });
        this.getMobilepinCentralData(this.userName)
        .subscribe((res:any) => {
         if(res && this.mPinId){
          if(res[0].mobUniqId==this.mPinId.mob_unique_id){
            this.authService.centralSynLogin();
            this.loader.hideLoader();
          }    else{
            this.db.updateLpinActiveStatus(this.userDetails.userName,this.userDetails.companyId);
            this.loader.hideLoader();
            this.toast.presentToast('Same User Already Installed in different machine. Please try to be there!');
         

          this.router.navigateByUrl('/login');
        }
         }
         else{
          this.loader.hideLoader();
          this.toast.presentToast('Server under Maintenance, Please try after sometime');
         }
//added for jira id - Mobile-696 END
      })
    } else {
      // this.toast.presentToast('Something went wrong..!');
      this.loader.hideLoader();
    }
    return Observable.throw(error);
  }

  // refresh masterdata <<-Refresh MasterData Screen->>
  public getRefreshMasterDataTables(username, bean) {
    console.log('bean', bean);
    return this.http
      .post(
        this.apiUrl + 'typeAhead/refreshMasterData/' + username + '/' + 2,
        bean
      )
      .pipe(
        retry(3),
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }
  checkAuditStatus(auditSeqNo, auditTypeId, companyId) {
    return this.http
      .get(
        this.apiUrl +
          'audit/ism/checkAuditStatus/' +
          auditSeqNo +
          '/' +
          auditTypeId +
          '/' +
          companyId
      )
      .pipe(
        retry(3),
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }

  syncCentral(auditTypeId, companyId, adt) {
    return this.http
      .post(
        //mobileSynchronize
        this.apiUrl +
          'audit/ism/mobileSynchronize/' +
          auditTypeId +
          '/' +
          companyId,
        adt,
        { responseType: 'text' }
      )
      .pipe(
        retry(3),
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }
  /**added by archana for jira ID-MOBILE-766 start */
  createOrgBlob(auditSeqNo,auditTypeId,companyId){
    return this.http
    .post(this.apiUrl +
        'audit/ism/createOrgBlob/' +
        auditSeqNo +
        '/' +
        auditTypeId +
        '/' +
        companyId,
        { responseType: 'text' }
      )
    .pipe(
      retry(3),
      map((res) => res),
      catchError(this.handleErrors.bind(this))
    );
 }

  createBlob(auditSeqNo,companyId){
    return this.http
    .post(this.apiUrl +
        'audit/ism/createBlob/' +
        auditSeqNo +
        '/' +
         companyId,
        { responseType: 'text' }
      )
    .pipe(
      retry(3),
      map((res) => res),
      catchError(this.handleErrors.bind(this))
    );
 }
 /**added by archana for jira ID-MOBILE-766 end */
  getAllCycleDate(auditTypeId, vesselImoNo, companyId) {
    return this.http
      .get(
        this.apiUrl +
          'auditCycle/getAllCycleDate/' +
          auditTypeId +
          '/' +
          vesselImoNo +
          '/' +
          companyId
      )
      .pipe(
        retry(3),
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }

  public updateLockStatusCentral(
    auditTypeId,
    auditSeqNo,
    companyId,
    lockStatus,
    emailId
  ) {
    console.log(
      'updateLockStatusCentral args ',
      auditTypeId +
        '-' +
        auditSeqNo +
        '-' +
        companyId +
        '-' +
        lockStatus +
        '-' +
        emailId
    );

    return this.http
      .get(
        this.apiUrl +
          'audit/ism/updateLockStatus/' +
          auditTypeId +
          '/' +
          auditSeqNo +
          '/' +
          companyId +
          '/' +
          emailId +
          '/' +
          lockStatus
      )
      .pipe(
        retry(3),
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }

  /**added by archana for jira Id-MOBILE-512 start*/
  public updateLockStatusDelMobAdt(
    auditTypeId,
    auditSeqNo,
    companyId,
    leadStatus,
    emailId,
    mPinId
  ) {
      return this.http
      .get(
         this.oauthApi + 'redis/updateLockStatusDelMobAdt/' +
          auditTypeId +
          '/' +
          auditSeqNo +
          '/' +
          companyId +
          '/' +
          emailId +
          '/' +
          leadStatus +
          '/'+
          mPinId
      )
      .pipe(
        retry(3),
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }
  /**added by archana for jira Id-MOBILE-512 end*/

  validateRandomNumber(emailId, verNum) {
    return this.http
      .get(
        this.oauthApi + 'redis/checkVerificationCode/' + emailId + '/' + verNum
      )
      .pipe(
        retry(3),
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }

  VerificationCodeNotification(emailJson) {
    return this.http
      .post(this.oauthApi + 'redis/verificationCodeNotification', emailJson)
      .pipe(
        retry(3),
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }

  changeCentralPassword(emailId, newPas) {
    return this.http
      .post(
        this.oauthApi + 'redis/updateLoginPassword/' + emailId + '/' + newPas,
        {
          emailId: emailId,
          pass: newPas,
        }
      )
      .pipe(
        retry(3),
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }

  updateCentralPassword(emailId, newPas) {
    return this.http
      .post(this.apiUrl + 'master/updatePassword/' + emailId + '/' + newPas, {
        emailId: emailId,
        newPas: newPas,
      })
      .pipe(
        retry(3),
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }

  checkrolesPresent(emailId,officialId,companyId,device){
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
    return this.http
      .get<any>(
        this.apiUrl + 'rmiService/checkrolesPresent/' + emailId + '/' + officialId+ '/' +companyId+ '/' +device ,{headers:headers}
      )
      .pipe(
        retry(5),
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }

  mobilePinCentralData(mailId){
    return this.http
                                  
      .post(this.oauthApi + 'redis/mobilepinCentralData', mailId)
      .pipe(
        retry(3),
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }

  getMobilepinCentralData(mailId){
    return this.http
                                  
      .post(this.oauthApi + 'redis/getMobilepinCentralData', mailId)
      .pipe(
        retry(3),
        map((res) => res),
        catchError(this.handleErrors.bind(this))
      );
  }

  getMobilePin(mailId){
    console.log(mailId);
    
    return this.http
     
      .post(this.oauthApi + 'redis/getMobilePin', mailId)
      .pipe(
        // map((res) => res),
        // catchError(this.handleErrors.bind(this))
      );
  }

  checkPin(){
    this.isEqual=false;
    this.db.getCurrentUser().subscribe(
      (user) => {
        console.log(user);
        this.userName={
          emailId: user.userName}
        this.db.getlaptopId(user.userName).then((result)=>{
          console.log(result);
          this.mPinId=result;
        });
      });
      this.getMobilepinCentralData(this.userName)
      .subscribe((res:any) => {
        console.log(res)
       if(res){
        if(res[0].mobUniqId==this.mPinId.mob_unique_id)
        this.isEqual=true;
       
       } 
    });
    return this.isEqual;
  }

}
