import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonSlides, ModalController, Platform } from '@ionic/angular';
import * as moment from 'moment';
import { CertificateSearchService } from 'src/app/providers/certificate-search.service';
import { DatabaseService } from 'src/app/providers/database.service';
import { MoreInfoPage } from '../../audit/more-info/more-info.page';
import { CertificateDetailsPage } from '../certificate-details/certificate-details.page';
declare function decodeURIComp(base64): any;
@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit, OnDestroy, AfterViewInit {
  backButtonSubscription;
  @ViewChild('mySelect', { static: true }) selectRef: any;
  number = "number";
  text = "text";
  date = "date";
  customPopoverOptions: any;
  @ViewChild('slide') slide: IonSlides;
  public segmentList: Array<string> = ["all", 'with','without']//added by lokesh for jira_id(459)
  public selectedSegment: string;
  public slideList: Array<string> = ["all", 'with audit','without audit']//added by lokesh for jira_id(459)
  searchCertificateCategory = this.certificateSearch.searchCertificateCategory;

  searchCertificateCategoryOptions = Object.keys(this.searchCertificateCategory[0]);
  searchType: string;
  searchPlaceholderText: string = "Search";
  searchText: any;
  checkCertificateWithAudit: any;
  flag: boolean = true;
  userName;
  tempArray: any = [];
  searchArray: any = [];
  tempArrayNew: any = [];
  user: any;
  auditTypeArr: any = [];
   certData:any=[];
  certFilterData:any=[];
  selectedDate: string;
  backUpData: any;
  constructor(public modal: ModalController,
    public db: DatabaseService,
    private certificateSearch: CertificateSearchService,
    private router: Router,
    private platform: Platform,
    private breakpointObserver:BreakpointObserver) {
      this.selectedSegment = this.segmentList[0];//added by lokesh for jira_id(459)
    this.db.getCurrentUser().subscribe(user => {
      this.userName = user.userName;
    });
    /*  this.user=this.dataservice.userName$.subscribe(data => {
       this.userName = data.valueOf();
     }); */
     //added by lokesh for jira_id(917)
    this.db.getAvailableCertificatesOfCurrentUser().then(async (res) => {
      console.log("getAvailableCertificatesOfCurrentUser", res);
      this.certData=res;
     await this.db.getAvailAuditRecordsOfCurrentUserName(this.userName).then((data:any)=>{
          this.certData.forEach(certData => {
            data.forEach(currentData => {  
             if(certData.auditSeqNo==currentData.AUDIT_SEQ_NO &&certData.vesselImoNo==currentData.VESSEL_IMO_NO){
                console.log(certData);
               this.certFilterData.push(certData) 
             }
          });  
        })
       
      })
      this.tempArray = this.certFilterData;
      this.backUpData = this.certFilterData;                   //added by archana for jira ID-MOBILE-382
      this.searchArray = this.certFilterData;
      this.tempArrayNew = JSON.parse(JSON.stringify(this.certFilterData));
      this.db.getMaAuditTypeForCertficateDtlDropdown().then((auditTypeRes: any) => {
        auditTypeRes.forEach(element => {
          console.log('element :: ', element)
          this.auditTypeArr.push(element)
        });
      }).then(() => {
        for (let i = 0; i < this.tempArray.length; i++) {
          console.log(this.tempArray[i]);

          this.db.getMasterData(this.tempArray[i].auditTypeId).then((res) => {
            console.log('masterObj :: ', res);
            this.tempArray[i].masterObjectArray = res;
          });

          this.tempArray[i].auditTypeArray = this.auditTypeArr;

          console.log(this.tempArray[i]);

        }
      })

    });
    if(this.breakpointObserver.isMatched('(max-width: 767px)')==true){
    this.checkCertificateWithAudit = true;
    }
    else{
      this.checkCertificateWithAudit = false;
    }
  }

  DateClear(event){                                    //added by archana for jira ID-MOBILE-382
   this.selectedDate = null;
   this.tempArray = this.backUpData;
  }

  segmentChanged(event) {
    console.log("bb" + event.detail.value + "aa");
    console.log(event)
    if (event.detail.value.trim() == 'all') {
      console.log(this.tempArray)
      this.tempArray = this.tempArrayNew;
      console.log("ALL", this.tempArrayNew);
    }
    else if (event.detail.value.trim() == 'with') {
      this.tempArray = this.searchArray.filter(data => {
        console.log(this.tempArray);
        if (data.auditSeqNo != 600000) {
          return data;
        }
      });

      console.log("WITH AUDIT", this.tempArray);
    }
    else if (event.detail.value.trim() == 'without') {
      this.tempArray = this.searchArray.filter(data => {
        console.log(this.tempArray);
        if (data.auditSeqNo === 600000) {
          return data;
        }
      });
      this.tempArray.length==0?this.tempArray.push('without'):this.tempArray  //added by lokesh for jira_id(459)
    }

  }
  //added by lokesh for jira_id(459) Start here
  segmentSelected(item: string, index: number) {
     console.log(item, index);
    this.slide.slideTo(index)
  }
  ionSlideDidChange(event: any) {
    console.log(event);
    this.slide.getActiveIndex().then(index => {
      console.log(index);   
      this.selectedSegment = this.segmentList[index];
    })
  }
  //added by lokehs for jira_id(459) end here

  searchFilter(event) {
    this.selectRef.interface = 'popover';
    this.selectRef.open(event);
  }

  selectedCategoryType(event) {

    this.db.getAvailableCertificatesOfCurrentUser().then((res) => {
      console.log("getAvailableCertificatesOfCurrentUser", res);
      console.log(this.certFilterData);
      this.tempArray = this.certFilterData;
      this.searchArray = this.certFilterData;
      this.tempArrayNew = JSON.parse(JSON.stringify(this.certFilterData));
      this.db.getMaAuditTypeForCertficateDtlDropdown().then((auditTypeRes: any) => {
        auditTypeRes.forEach(element => {
          console.log('element :: ', element)
          this.auditTypeArr.push(element)
        });
      }).then(() => {
        for (let i = 0; i < this.tempArray.length; i++) {
          console.log(this.tempArray[i]);

          this.db.getMasterData(this.tempArray[i].auditTypeId).then((res) => {
            console.log('masterObj :: ', res);
            this.tempArray[i].masterObjectArray = res;
          });

          this.tempArray[i].auditTypeArray = this.auditTypeArr;

          console.log(this.tempArray[i]);

        }
      })

    });
    let searchCatType = event.target.value.trim();

    if (event.target.value.trim() === "Vessel Imo No") {
      this.searchType = this.number;
      console.log(this.searchCertificateCategory[0]);
      this.searchPlaceholderText = "Search Vessel Imo No"
      this.searchText = '';
      this.tempArray = this.backUpData;
    }
    else if (event.target.value.trim() === "Vessel Name") {
      this.searchType = this.text;
      this.searchPlaceholderText = "Search Vessel Name"
      this.searchText = '';
      this.tempArray = this.backUpData;
    }
    else if (event.target.value.trim() === "Certificate Issue Date") {
      this.searchType = this.date;
      this.searchPlaceholderText = "Search Certificate Issue Date"
      this.searchText = ''; 
      this.tempArray = this.backUpData;                               //added by archana for jira ID-MOBILE-382
      this.selectedDate = null;
    }

    else if (event.target.value.trim() === "Certificate Expiry Date") {
      this.searchType = this.date;
      this.searchPlaceholderText = "Search Certificate Expiry Date"
      this.searchText = ''; 
      this.tempArray = this.backUpData;
      this.selectedDate = null;
    }
    else if (event.target.value.trim() === "Certificate No") {
      this.searchType = this.text;
      this.searchPlaceholderText = "Search Certificate No"
      this.searchText = '';
      this.tempArray = this.backUpData;
    }
    else if (event.target.value.trim() === "Company IMO No") {
      this.searchType = this.number;
      this.searchPlaceholderText = "Search Company IMO No"
      this.searchText = '';
      this.tempArray = this.backUpData;
    }
    else if (event.target.value.trim() === "Certificate Type") {
      this.searchType = this.text;
      this.searchPlaceholderText = "Search Certificate Type"
      this.searchText = '';
      this.tempArray = this.backUpData;
    }
    else if (event.target.value.trim() === "Certificate Sub Type") {
      this.searchType = this.text;
      this.searchPlaceholderText = "Search Certificate Sub Type"
      this.searchText = '';
      this.tempArray = this.backUpData;
    }
    else if (event.target.value.trim() === "Certificate Status") {
      this.searchType = this.text;
      this.searchPlaceholderText = "Search Certificate Status"
      this.searchText = '';
      this.tempArray = this.backUpData;
    }
    else if (event.target.value.trim() === "Official No") {
      this.searchType = this.text;
      this.searchPlaceholderText = "Search Official No"
      this.searchText = '';
      this.tempArray = this.backUpData;
    }
    // else if (event.target.value.trim() === "Certificate With Audit") {
    //   this.searchType = this.text;
    //   this.searchPlaceholderText = "Search Certificate With Audit"
    // }


  }

  getSearchedText(event) {
    this.searchText = (this.searchPlaceholderText == "Search Certificate Issue Date" || this.searchPlaceholderText == "Search Certificate Expiry Date") ? moment(event.value).format('DD-MMM-YYYY') : this.searchText;        //added by archana for jira ID-MOBILE-382
    if (this.searchText != '') {
      this.flag = false;
    }
    else {
      this.flag = true;
    }

    console.log(typeof this.searchText);
    console.log("Searched Text=" + this.searchText + ";");

    //let sr = this.certificateSearch.searchCertificates(this.searchText, this.searchArray,this.searchPlaceholderText);
    let sr = this.certificateSearch.searchCertificates(this.searchText, this.searchArray,this.searchPlaceholderText);  //added by sudharsan for MOBILE 412 on 4-4-2022

    console.log(sr);
    this.tempArray = sr;

  }

  async presentModal(certificateDetails) {
    // const modal = await this.modal.create({
    //   component: MoreInfoPage,
    //   componentProps: {
    //     "modalDetails": certificateDetails,
    //     "routeUrl": this.router.url,
    //     "modalTitle": certificateDetails.certificateNo
    //   }
    // });
    //return await modal.present();
    for (let i = 0; i < certificateDetails.auditTypeArray.length; i++) {
      if(certificateDetails.auditTypeArray[i].auditTypeId==certificateDetails.auditTypeId){
        certificateDetails.auditTypeDesc=certificateDetails.auditTypeArray[i].auditTypeDesc;
      }
    }
    for(let i=0;i< certificateDetails.masterObjectArray.auditType.length;i++) {
      if(certificateDetails.masterObjectArray.auditType[i].auditSubtypeId==certificateDetails.auditSubTypeId){
        certificateDetails.auditSubTypeDesc=certificateDetails.masterObjectArray.auditType[i].auditSubtypeDesc;
      }
    }
    this.router.navigate([
      '/more-info',
      {
        "modalDetails":JSON.stringify(certificateDetails),
        "routeUrl": this.router.url,
        "modalTitle": certificateDetails.certificateNo
      },
    ]);
    
  }

  async certificateModal(certItem) {
    //added by lokesh for jira_id(918)
    let auditSubTypeDesc;
    for(let i=0;i< certItem.masterObjectArray.auditType.length;i++) {
      if(certItem.masterObjectArray.auditType[i].auditSubtypeId==certItem.auditSubTypeId){
        certItem.auditSubTypeDesc=certItem.masterObjectArray.auditType[i].auditSubtypeDesc;
      }
    }
    this.db
      .getVesselCompanyData(certItem.vesselImoNo)
      .then((vesselData) => {
      console.log(vesselData);
      certItem.vesselData=vesselData[0];
      certItem.completionDate=certItem&&certItem.completionDate?moment(certItem.completionDate).format('YYYY-MM-DD'):
      auditSubTypeDesc!='INTERMEDIATE'&&auditSubTypeDesc!='ADDITIONAL'?moment(certItem.auditDate).format('YYYY-MM-DD'):'',//added by lokesh for jira_id(900)
      this.gotoCertificatepage(certItem);
      })
    
  }
     gotoCertificatepage(certItem){
      this.router.navigate(['certificate-details',          
      {
       "modalDetails": JSON.stringify(certItem),
       "routeUrl": this.router.url,
       "modalTitle": 'search'
     }
   ]); //added by lokesh for jira_id(918)
     }
  ngOnInit() {

  }

  ngAfterViewInit() {
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      this.router.navigateByUrl("/dashboard");
    });
  }

  ngOnDestroy() {
    this.backButtonSubscription.unsubscribe();
    //this.user.unsubscribe();
  }

}
