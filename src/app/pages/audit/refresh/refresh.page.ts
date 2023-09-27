import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, Platform } from '@ionic/angular';
import { DatabaseService } from 'src/app/providers/database.service';
import { DetailService } from 'src/app/providers/detail.service';
import { LoadingIndicatorService } from 'src/app/providers/loading-indicator.service';
import { ConnectionStatus, NetworkService } from 'src/app/providers/network.service';
import { ToastService } from 'src/app/providers/toast.service';

@Component({
  selector: 'app-refresh',
  templateUrl: './refresh.page.html',
  styleUrls: ['./refresh.page.scss'],
})
export class RefreshPage implements OnInit {
  backButtonSubscription; 
  isIndeterminate: boolean;
  masterCheck: boolean;
  checkBoxList: any;
  userName;
  selectedItemArraySample: any = [];
  user: any;
  userDetails: any;
  uName: { emailId: string; };
  mPinId: any;

  constructor(private router: Router,
    private detailService: DetailService,
    private db: DatabaseService,
    public loader: LoadingIndicatorService,
    private platform: Platform,
    private network: NetworkService,
    public alertController: AlertController,
    public toast: ToastService,) {

    this.checkBoxList = [
      {
        "value": "auditCodes",
        "isChecked": false,
        "name": "Audit Codes",
      }, {
        "value": "vessel",
        "isChecked": false,
        "name": "Vessel",
      }, {
        "value": "vesselcompany",
        "isChecked": false,
        "name": "Vessel Company",
      }, {
        "value": "attachmentTypes",
        "isChecked": false,
        "name": "Attachment Types",
      }, {
        "value": "auditSearchSource",
        "isChecked": false,
        "name": "Audit Search Source",
      }, {
        "value": "auditStatus",
        "isChecked": false,
        "name": "Audit Status",
      }, {
        "value": "auditSubtype",
        "isChecked": false,
        "name": "Audit Subtype",
      }, {
        "value": "auditSummary",
        "isChecked": false,
        "name": "Audit Summary",
      }, {
        "value": "auditType",
        "isChecked": false,
        "name": "Audit Type",
      }, {
        "value": "certificateIssued",
        "isChecked": false,
        "name": "Certificate Issued",
      }, {
        "value": "company",
        "isChecked": false,
        "name": "Company",
      },
      {
        "value": "findingsCategory",
        "isChecked": false,
        "name": "Findings Category",
      }, {
        "value": "findingsStatus",
        "isChecked": false,
        "name": "Findings Status",
      }, {
        "value": "roles",
        "isChecked": false,
        "name": "Roles",
      }, {
        "value": "users",
        "isChecked": false,
        "name": "Users",
      }, {
        "value": "vesselType",
        "isChecked": false,
        "name": "Vessel Type",
      }, {
        "value": "auditRoles",
        "isChecked": false,
        "name": "Audit Roles",
      }, {
        "value": "configDetails",
        "isChecked": false,
        "name": "User Configuration",
      }, {
        "value": "port",
        "isChecked": false,
        "name": "Port",
      }
    ];
  }
  refreshForm = new FormGroup({
    selectall: new FormControl(''),
    values: new FormControl('')
  });
  checkMaster(e) {
    console.log("checkMaster....",e.target.value)
    setTimeout(() => {
      this.checkBoxList.forEach(obj => {
        obj.isChecked = this.masterCheck;
      });
    });
  }
  checkEvent() {
    const totalItems = this.checkBoxList.length;
    let checked = 0;
    this.checkBoxList.map(obj => {
      if (obj.isChecked) checked++;
      // console.log(this.checkBoxList);
      this.selectedItemArraySample = this.checkBoxList;
    });
    if (checked > 0 && checked < totalItems) {
      //If even one item is checked but not all
      this.isIndeterminate = true;
      this.masterCheck = false;
    } else if (checked == totalItems) {
      //If all are checked
      this.masterCheck = true;
      this.isIndeterminate = false;
    } else {
      //If none is checked
      this.isIndeterminate = false;
      this.masterCheck = false;
    }
    // console.log(obj.isChecked);
  }

  refreshData() {
    
   this.selectedItemArraySample = this.checkBoxList;
    
    if (this.network.getCurrentNetworkStatus() === ConnectionStatus.Online) {
      this.db.getCurrentUser().subscribe(    // added by ramya for jira ID-Mobile-706
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

      console.log("this.selectedItemArraySample",this.selectedItemArraySample);
      
      if(this.selectedItemArraySample.length != 0){
        this.loader.showLoader('Refreshing Master Data, Please Wait..');//loader starts
        console.log(this.selectedItemArraySample);
        var selectedItemArray = {};
        for (let i = 0; i < this.selectedItemArraySample.length; i++) {
          if (this.selectedItemArraySample[i].isChecked == true) {
            selectedItemArray[this.selectedItemArraySample[i].value] = 1;
          }
          else if (this.selectedItemArraySample[i].isChecked == false) {
            selectedItemArray[this.selectedItemArraySample[i].value] = 0;
          }
          else (
            selectedItemArray[this.selectedItemArraySample[i].value] = '0'
          )
        }

        console.log(selectedItemArray);

        let selectedArrayValues = Object.values(selectedItemArray);

        console.log("selectedArrayValues",selectedArrayValues);

        if(selectedArrayValues.includes(1)){
            //call api with selectedItemArray/bean
            this.detailService.getRefreshMasterDataTables(this.userName, selectedItemArray)//user detail
            .subscribe(response => {
              console.log('master data response (refreshScreen)', response);
              //update local masterdata
              this.db.storeAllMasterDataTables(response).then((res) => {
                console.log("storeMasterdetails res ::", res);
                this.loader.hideLoader();
                this.toast.presentToast('The Master Data has been refreshed successfully!!!', 'success');
              });
              //print final result in the screen(long_toaster)  
              selectedItemArray = [];
            });

            console.log(selectedItemArray);

            // this.loading.dismiss();//loader stop
            // this.refreshForm.reset();
        }
        else{
          this.toast.presentToast('Please select atleast one master data to refresh', 'danger');
          this.loader.hideLoader();
        }
        
        
      }
      else{
        this.toast.presentToast('Please select atleast one master data to refresh', 'danger');
      }
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
      this.toast.presentToast('No Internet Connection...!!!', 'danger');
      console.log('No internet connection to Refresh!!!')
    }
  }
  ngOnInit() {
    this.db.getCurrentUser().subscribe(user => {
      this.userName = user.userName;
      this.masterCheck = true;
      this.checkBoxList.forEach((res)=>{
         res.isChecked = true;
      })
    });
    
  }
 //backbutton
 ngAfterViewInit() {
  this.backButtonSubscription = this.platform.backButton.subscribe(() => {
    this.router.navigateByUrl("/dashboard");
  });
}

ngOnDestroy() {
  this.backButtonSubscription.unsubscribe();
}


}
