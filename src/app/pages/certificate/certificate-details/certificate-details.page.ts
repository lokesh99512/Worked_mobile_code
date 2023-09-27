import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { NavParams, ModalController, ToastController } from '@ionic/angular';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  NgForm,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AppConstant } from '../../../constants/app.constants';
import * as _ from 'lodash';
import * as moment from 'moment';
import { PdfService } from 'src/app/providers/pdf.service';
import { DatabaseService } from 'src/app/providers/database.service';
import { ToastService } from 'src/app/providers/toast.service';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-certificate-details',
  templateUrl: './certificate-details.page.html',
  styleUrls: ['./certificate-details.page.scss'],
})
export class CertificateDetailsPage
  implements OnInit, OnDestroy, AfterViewInit {
  private dataUrl: string = '../../../../assets/json/base64data.json';
  //images: any = (urlDatas as any).default.images; */
  images: any;
  certiUtnSignDetails: any;
  backButtonSubscription;
  certificateGenerateForm: FormGroup;
  vesselForm: FormGroup;
  auditForm: FormGroup;
  certificateForm: FormGroup;
  certificateDetailArray;
  pageTitle;

  auditSectionLable: string;

  certificateexperirydate: string;
  certificatebasedPlaceholder: string;

  userTypeName: string;
  typeName: string;
  reviewTypeName: string;
  summaryHead: string;
  reportLabel: string;

  withOutAudit = false;
  withAudit = false;
  isCertificateSearch = false;

  certificateDtl = {};
  readonlyFormFields: boolean;
  EnableDMLCFields: boolean;
  auditTypeArr: any[] = [];
  auditSubTypeArr: string[];
  auditSubTypeDisabledArr: string[];
  minDate: any;
  maxIssueDate: any;
  maxExpiryDate: any;
  masterObj: any;
  dbserviceObj: any = {};
  issuePlaceArr: any;
  subTypeFlag: boolean;
  issueExpiryDateFlag: boolean;
  email: string;
  userName: string;
  isAuditTypeSelected: boolean;
  checkCertificateBlock: boolean;
  checkAuditBlock: boolean;
  issueSignature: any;
  issuerSignFlag: boolean;
  attachsignature: boolean;
  enableDownload: boolean = false;
  auditTypeMaObj: any;
  auditStatusMaObj: any;
  certIssuedMaObj: any;
  withoutAuditDisabled: boolean;
  tempAuditTypeDesc: any;
  searchCertSignatureObj: Object;
  issueSignatureSearch: string;
  filteredOptions: Observable<string[]>;
  portArray: any;
  modalCertificateDetails: any;
  directInterAddFlag: boolean;
  disableExpiryDate: boolean = false;
  tempArray: any = [];//added by lokesh for jira_id(718)
  certDataFilter:any;//added by lokesh for jira_id(793)
  DMLCIIssueDate:any;//added by lokesh for jira_id(770)
  constructor(
    private breakpointObserver: BreakpointObserver,
    public modal: ModalController,
    private http: HttpClient,
    public appConstant: AppConstant,
    private db: DatabaseService,
    public toastController: ToastController,
    private formBuilder: FormBuilder,
    private platform: Platform,
    public pdfService: PdfService,
    private router: Router,
    public toast: ToastService,
    public datepipe: DatePipe,
    private route: ActivatedRoute
  ) {
    this.http.get(this.dataUrl).subscribe((data: any) => {
      this.images = data.images;
    });
    console.log(this.route.snapshot);
    console.log(this.route.snapshot.paramMap.get('routeUrl'));
    this.setEnableDisableFlags();

    /* this.dataservice.userName$.subscribe(data => {
      this.email = data.valueOf();
    }); */
    this.db.getCurrentUser().subscribe((user) => {
      this.email = user.userName;
      this.userName = user.displayName;
    });

    this.getMasterData(
      JSON.parse(this.route.snapshot.paramMap.get('modalDetails')).auditTypeId
    );

    this.modalCertificateDetails = JSON.parse(
      this.route.snapshot.paramMap.get('modalDetails')
    );

    if (
      this.route.snapshot.paramMap.get('routeUrl') === '/perform/audit-details'
    ) {
      this.withAudit = true;
      this.checkCertificateBlock = true;
      console.log('withAudit :: ', this.withAudit);
      this.readonlyFormFields = true;
      /*  this.dbService.getMaAuditTypeForCertficateDtlDropdown().then((auditTypeRes: any) => {
         auditTypeRes.forEach(element => {
           console.log('element :: ', element)
           this.auditTypeArr.push(element)
         });
       })
       this.dbService.getMasterData(navParams.data.modalDetails.auditTypeId).then((res) => {
         this.masterObj = res;
         console.log('masterObj :: ', this.masterObj);
 
         console.log('auditType :: ', this.masterObj.auditType);
         console.log('auditStatus :: ', this.masterObj.auditStatus);
         console.log('certIssued :: ', this.masterObj.certIssued);
         console.log("this.auditTypeArr ::", this.auditTypeArr)
 
         this.auditTypeMaObj = this.masterObj.auditType;
         this.auditStatusMaObj = this.masterObj.auditStatus;
         this.certIssuedMaObj = this.masterObj.certIssued;
 
 
       }); */
    } else if (
      this.route.snapshot.paramMap.get('routeUrl') === '/certificate/create'
    ) {
      this.withOutAudit = true;
      this.checkAuditBlock = true;
      console.log('withOutAudit :: ', this.withOutAudit);
      this.readonlyFormFields = false;

      /* this.dbService.getMaAuditTypeForCertficateDtlDropdown().then((auditTypeRes: any) => {
        auditTypeRes.forEach(element => {
          console.log('element :: ', element)
          this.auditTypeArr.push(element)
        });
      })
      this.dbService.getMasterData(navParams.data.modalDetails.auditTypeId).then((res) => {
        this.masterObj = res;
        console.log('masterObj :: ', this.masterObj);

        console.log('auditType :: ', this.masterObj.auditType);
        console.log('auditStatus :: ', this.masterObj.auditStatus);
        console.log('certIssued :: ', this.masterObj.certIssued);
        console.log("this.auditTypeArr ::", this.auditTypeArr)

        this.auditTypeMaObj = this.masterObj.auditType;
        this.auditStatusMaObj = this.masterObj.auditStatus;
        this.certIssuedMaObj = this.masterObj.certIssued;


      }); */
    } else {
      this.isCertificateSearch = true;
      console.log('isCertificateSearch :: ', this.isCertificateSearch);
      this.checkCertificateBlock = true;
      console.log('withAudit :: ', this.withAudit);
      this.readonlyFormFields = true;
      this.generateIssuerSignForSearchCertificate();

      /* this.dbService.getMaAuditTypeForCertficateDtlDropdown().then((auditTypeRes: any) => {
        auditTypeRes.forEach(element => {
          console.log('element :: ', element)
          this.auditTypeArr.push(element)
        });
      })
      this.dbService.getMasterData(navParams.data.modalDetails.auditTypeId).then((res) => {
        this.masterObj = res;
        console.log('masterObj :: ', this.masterObj);

        console.log('auditType :: ', this.masterObj.auditType);
        console.log('auditStatus :: ', this.masterObj.auditStatus);
        console.log('certIssued :: ', this.masterObj.certIssued);
        console.log("this.auditTypeArr ::", this.auditTypeArr)

        this.auditTypeMaObj = this.masterObj.auditType;
        this.auditStatusMaObj = this.masterObj.auditStatus;
        this.certIssuedMaObj = this.masterObj.certIssued;


      }); */
    }

    console.log(this.route.snapshot);
    this.certificateDetailArray = this.modalCertificateDetails;
    this.pageTitle = this.route.snapshot.paramMap.get('modalTitle');
  }

  ionViewDidLoad() {
    console.log('ionViewWillEnter');
    this.EnableDMLCFields =
      this.appConstant.MLC_TYPE_ID ==
        this.certificateGenerateForm.value.auditForm.auditType.auditTypeId
        ? true
        : false;
  }
  getMasterData(typeID) {
    console.log('getMasterData..');
    this.db
      .getMaAuditTypeForCertficateDtlDropdown()
      .then((auditTypeRes: any) => {
        auditTypeRes.forEach((element) => {
          console.log('element :: ', element);
          this.auditTypeArr.push(element);
        });
      });
    this.db.getMasterData(typeID).then((res) => {
      this.masterObj = res;

      if (this.masterObj.auditType[0].auditTypeId === 1001) {
        this.userTypeName = 'Auditor';
        this.typeName = 'Audit';
        this.summaryHead =
          'The undersigned has carried out the above audit according to the ISM Code and found the vessel';
        this.reportLabel = 'Audit';
      } else if (this.masterObj.auditType[0].auditTypeId === 1002) {
        this.userTypeName = 'Auditor';
        this.typeName = 'Audit';
        this.reviewTypeName = 'SSP';
        this.summaryHead =
          'The undersigned has carried out the above audit according to the ISPS Code and found the vessel';
        this.reportLabel = 'Audit';
      } else if (this.masterObj.auditType[0].auditTypeId === 1003) {
        this.userTypeName = 'Inspector';
        this.typeName = 'Inspection';
        this.reviewTypeName = 'DMLC II Review';
        this.summaryHead =
          'The undersigned has carried out the above inspection according to the MLC Code and found the vessel';
        this.reportLabel = 'Inspection';
      } else if (
        this.masterObj.auditType[0].auditTypeId === 1004 ||
        this.masterObj.auditType[0].auditTypeId === 1005
      ) {
        this.userTypeName = 'Inspector';
        this.typeName = 'Review';
        this.summaryHead =
          'The undersigned has carried out the DMLC Part II review pursuant to Standard A5.1.3 paragraph 10(b) of the MLC 2006 and RMI requirements for implementing MLC 2006 and found the DMLC Part II;';
      }

      console.log(
        'masterObj=====>:: ',
        this.masterObj.auditStatus[0].auditTypeId
      );
      console.log('masterObj :: ', this.masterObj);

      console.log('auditType :: ', this.masterObj.auditType);
      console.log('auditStatus :: ', this.masterObj.auditStatus);
      console.log('certIssued :: ', this.masterObj.certIssued);
      console.log('this.auditTypeArr ::', this.auditTypeArr);

      this.auditTypeMaObj = this.masterObj.auditType;
      this.auditStatusMaObj = this.masterObj.auditStatus;
      this.certIssuedMaObj = this.masterObj.certIssued;
    });
  }

  setEnableDisableFlags() {
    this.subTypeFlag = true;
    this.issueExpiryDateFlag = true;
  }

  closeModal() {
    // await this.modal.dismiss();
    this.router.navigate([this.route.snapshot.paramMap.get('routeUrl')]);
  }

  typeChange(event) {
    console.log('typechange....');
    console.log(event.value.auditTypeId);
    console.log(this.isAuditTypeSelected);
    this.isAuditTypeSelected = true;
    this.subTypeFlag = false;
    console.log(this.isAuditTypeSelected);
    this.db
      .getMaDetailsForCertficateDtlDropdowns(event.value.auditTypeId)
      .then((res) => {
        console.log(res);
        this.dbserviceObj = res;

        console.log('this.dbserviceObj :: ', this.dbserviceObj);
        console.log(
          this.dbserviceObj.auditSubType.map((res) => res.auditSubtypeDesc)
        );
        this.auditSubTypeArr = this.dbserviceObj.auditSubType.map(
          (res) => res.auditSubtypeDesc
        );
        this.issuePlaceArr = this.dbserviceObj.port;
      });
    this.auditSubTypeDisabledArr = ['INTERMEDIATE', 'ADDITIONAL'];
  }

  generateIssuerSignForSearchCertificate() {
    this.db
      .getUTNSignatureForCertificate(
        this.modalCertificateDetails.vesselImoNo,
        this.modalCertificateDetails.auditTypeId
      )
      .then((res) => {
        this.certiUtnSignDetails = Object.assign({}, res);
      });
  }

  getutn() {
    return new Promise<Object>((resolve, reject) => {
      console.log(this.route.snapshot);
      this.db
        .getUTNSignatureForCertificate(
          this.modalCertificateDetails.vesselData.vesselImoNo,
          this.modalCertificateDetails.auditTypeId
        )
        .then((res) => {
          this.certiUtnSignDetails = [res];
          resolve({});
        });
    });
  }

  getCertificateNoWithOutAudit() {
    console.log('getCertificateNoWithOutAudit......');
    let auditTypeId =
      this.certificateGenerateForm.value.auditForm.auditType.auditTypeId,
      vesselImoNo = this.certificateDetailArray.vesselImoNo,
      auditSubTypeId = this.dbserviceObj.auditSubType.filter(
        (res) =>
          res.auditSubtypeDesc ===
          this.certificateGenerateForm.value.auditForm.auditSubType
      )[0].auditSubtypeId,
      newcertificateNoPart,
      certificate_Pattern;
    console.log(this.certificateGenerateForm.value.auditForm);
    this.db
      .getUTNSignatureForCertificate(vesselImoNo, auditTypeId)
      .then((res) => {
        this.certiUtnSignDetails = Object.assign({}, res);

        if (auditTypeId == 1002 && auditSubTypeId == 1001) {
          newcertificateNoPart = 'SS';

          certificate_Pattern = '296G';
        } else if (auditTypeId == 1002 && auditSubTypeId != 1001) {
          newcertificateNoPart = 'SS';

          certificate_Pattern = '296H';
        } else if (auditTypeId == 1001 && auditSubTypeId == 1001) {
          newcertificateNoPart = 'SM';

          certificate_Pattern = '297E';
        } else if (auditTypeId == 1001 && auditSubTypeId != 1001) {
          newcertificateNoPart = 'SM';

          certificate_Pattern = '297F';
        } else if (auditTypeId == 1003 && auditSubTypeId == 1001) {
          newcertificateNoPart = 'ML';

          certificate_Pattern = '400I';
        } else if (auditTypeId == 1003 && auditSubTypeId != 1001) {
          newcertificateNoPart = 'ML';

          certificate_Pattern = '400J';
        }
        this.certificateGenerateForm
          .get(['vesselForm', 'certificateNo'])
          .setValue(
            this.certiUtnSignDetails.CERTIFICATE_NO +
            '-' +
            newcertificateNoPart +
            '-' +
            certificate_Pattern +
            '-' +
            new Date().getFullYear().toString().substr(-2)
          );
      });
  }

  subTypeChange(event) {
    console.log('typechange....');
    console.log();
    console.log(event.value);
    this.issueExpiryDateFlag = false;
    if (this.withOutAudit) {
      this.checkCertificateBlock = true;
      this.certificateGenerateForm.get('certificateForm').enable();
      this.withoutAuditDisabled = false;
    }
    if (event.value != 'INTERIM') {
      let certificateGenerateFormTemp = this.certificateGenerateForm.get(
        'certificateForm'
      ) as FormGroup;
      this.certificateGenerateForm
        .get(['certificateForm', 'certificateIssued'])
        .setValue('FULL TERM');
      if (
        this.certificateGenerateForm.get(['certificateForm', 'issueDate'])
          .value != ''
      ) {
        console.log(
          this.certificateGenerateForm.get(['certificateForm', 'issueDate'])
            .value
        );
        console.log(
          '6 Months :: ',
          this.addMonth(
            new Date(
              this.certificateGenerateForm.get([
                'certificateForm',
                'issueDate',
              ]).value
            ),
            6
          )
        );
        console.log(
          typeof this.certificateGenerateForm.get([
            'certificateForm',
            'issueDate',
          ]).value
        );
        this.certificateGenerateForm
          .get(['certificateForm', 'expiryDate'])
          .setValue(
            this.addYear(
              new Date(
                this.certificateGenerateForm.get([
                  'certificateForm',
                  'issueDate',
                ]).value
              ),
              5
            )
          );
      }
    } else {
      let certificateGenerateFormTemp = this.certificateGenerateForm.get(
        'certificateForm'
      ) as FormGroup;
      this.certificateGenerateForm
        .get(['certificateForm', 'certificateIssued'])
        .setValue('INTERIM');
      if (
        this.certificateGenerateForm.get(['certificateForm', 'issueDate'])
          .value != ''
      ) {
        console.log(
          this.certificateGenerateForm.get(['certificateForm', 'issueDate'])
            .value
        );
        console.log(
          '6 Months :: ',
          this.addMonth(
            new Date(
              this.certificateGenerateForm.get([
                'certificateForm',
                'issueDate',
              ]).value
            ),
            6
          )
        );
        console.log(
          typeof this.certificateGenerateForm.get([
            'certificateForm',
            'issueDate',
          ]).value
        );
        this.certificateGenerateForm
          .get(['certificateForm', 'expiryDate'])
          .setValue(
            this.addMonth(
              new Date(
                this.certificateGenerateForm.get([
                  'certificateForm',
                  'issueDate',
                ]).value
              ),
              6
            )
          );
      }
    }
    // this.certificateGenerateForm.get(['vesselForm', 'certificateNo']).setValue(this.certiUtnSignDetails.certificateNo);
    //this.certificateGenerateForm.vesselForm.setValue('certificateNo' : this.certiUtnSignDetails.certificateNo

    this.getCertificateNoWithOutAudit();
  }

  addDays(date, daysNumber) {
    return new Date(moment(date).add(daysNumber, 'days').toString());
  }

  subtractDays(date, daysNumber) {
    return new Date(moment(date).subtract(daysNumber, 'days').toString());
  }

  addMonth(date, monthsNumber) {
    console.log('date ::' + date, 'monthsNumber ::' + monthsNumber);
    return new Date(moment(date).add(monthsNumber, 'months').toString());
  }

  addYear(date, yearsNumber) {
    console.log('date ::' + date, 'yearsNumber ::' + yearsNumber);
    return new Date(moment(date).add(yearsNumber, 'years').toString());
  }

  issueDateChange(event) {
    console.log('issueDateChange....', event);
    let certificateGenerateFormTemp = this.certificateGenerateForm.get(
      'certificateForm'
    ) as FormGroup;
    console.log(certificateGenerateFormTemp);
    console.log(event);
    console.log(
      this.certificateGenerateForm.get(['auditForm', 'auditSubType']).value
    );
    let auditSubtype = this.certificateGenerateForm.get([
      'auditForm',
      'auditSubType',
    ]).value;
    let issueDate = event.targetElement.value;

    this.certificateGenerateForm
      .get(['certificateForm', 'issueDate'])
      .setValue(this.datepipe.transform(new Date(issueDate), 'yyyy-MM-dd'));

    if (this.certificateDetailArray.auditSubTypeId === this.appConstant.INTERIM_SUB_TYPE_ID) {
      // this.maxIssueDate = new Date(this.certificateDetailArray.certExpiredDate);
      this.maxExpiryDate = this.subtractDays(new Date(this.addMonth(new Date(issueDate), 6)), 1);
    }
    if (this.certificateDetailArray.auditSubTypeId !== this.appConstant.INTERIM_SUB_TYPE_ID && this.certificateDetailArray.auditSubTypeId !== this.appConstant.INTERMEDIATE_SUB_TYPE_ID) {
      // this.maxIssueDate = new Date(this.certificateDetailArray.certExpiredDate);
      this.maxExpiryDate = this.subtractDays(new Date(this.addYear(new Date(issueDate), 5)), 1);
    }

    // commented for => MOBILE - 193
    /*if (auditSubtype === 'INTERIM') {
      console.log('6 Months :: ', this.addMonth(new Date(issueDate), 6));
      this.certificateGenerateForm
        .get(['certificateForm', 'expiryDate'])
        .setValue(
          this.datepipe.transform(
            this.addMonth(new Date(issueDate), 6),
            'yyyy-MM-dd'
          )
        );
    } else {
      this.certificateGenerateForm
        .get(['certificateForm', 'expiryDate'])
        .setValue(
          this.datepipe.transform(
            this.addYear(new Date(issueDate), 5),
            'yyyy-MM-dd'
          )
        );
    }*/
  }

  expiryDateChange(event) {

    let expiryDate = event.targetElement.value;

    // MOBILE-71 => expiry date should be able to extend the expiry date up to 5 months
    if (this.certificateDetailArray.auditSubTypeId === this.appConstant.RENEWAL_SUB_TYPE_ID && this.certificateDetailArray.certIssueId === this.appConstant.RENEWAL_ENDORSED2) {

      // let expiryDate = moment(event.targetElement.value).subtract(1, 'day').format('DD-MMM-YYYY');
      this.maxIssueDate = moment(new Date(event.targetElement.value), 'YYYY-MM-DD').format('YYYY-MM-DD');;
      this.maxExpiryDate = moment(this.addMonth(new Date(expiryDate), 5), 'YYYY-MM-DD').format('YYYY-MM-DD');
    }

    if (this.certificateDetailArray.auditSubTypeId === this.appConstant.INTERIM_SUB_TYPE_ID) {
      this.maxIssueDate = moment(this.addMonth(new Date(expiryDate), 6), 'YYYY-MM-DD').format('YYYY-MM-DD');
    }
    if (this.certificateDetailArray.auditSubTypeId !== this.appConstant.INTERIM_SUB_TYPE_ID && this.certificateDetailArray.auditSubTypeId !== this.appConstant.INTERMEDIATE_SUB_TYPE_ID && this.certificateDetailArray.certIssueId !== this.appConstant.RENEWAL_ENDORSED2) {
      this.maxIssueDate = moment(this.addYear(new Date(expiryDate), 5), 'YYYY-MM-DD').format('YYYY-MM-DD');
    }
  }

  auditDateChange(event) {
    this.minDate = event.targetElement.value;
  }

  /* setAuditTypeDesc(auditTypeArr,certDtlArr){
   console.log(auditTypeArr);
   console.log(certDtlArr);
   console.log(certDtlArr.auditTypeId);


   this.tempAuditTypeDesc=(auditTypeArr.filter(res=>res.auditTypeId===certDtlArr.auditTypeId));
   console.log(this.tempAuditTypeDesc);
   return this.tempAuditTypeDesc;
 } */


  // to get Previous Initial or Renewal AuditData
  getPreviousInitialRenewalData() {

    return new Promise<Object>((resolve, reject) => {
      this.db
        .getPreviousInitialRenewalData(
          this.certificateDetailArray.auditTypeId,
          this.certificateDetailArray.vesselData.vesselImoNo,
          this.certificateDetailArray.auditSeqNo
        )
        .then((initialRenewalData: any) => {
          resolve(initialRenewalData);
        });
    });
  }

  // to check direct/followup intermediate/additional audit detail
  checkDirInterOrAddtnl() {
    return new Promise<Boolean>((resolve, reject) => {
      this.getPreviousInitialRenewalData().then((initialRenewalData: any) => {

        let countIni = 0;
        if (initialRenewalData != undefined && initialRenewalData.length > 0) {
          initialRenewalData.forEach(function (a: { auditSubTypeId: number; certIssueId: number; }) {
            if (
              a.auditSubTypeId == 1002 ||
              (a.auditSubTypeId == 1004 && a.certIssueId == 1002) ||
              a.auditSubTypeId == 1001
            )
              countIni++;
          });
        }

        if (
          (countIni == 0) && (this.certificateDetailArray.auditSubTypeId == this.appConstant.INTERMEDIATE_SUB_TYPE_ID ||
            this.certificateDetailArray.auditSubTypeId == this.appConstant.ADDITIONAL_SUB_TYPE_ID)
        ) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  ngOnInit() {
    console.log('ngOnInit');
    // Temporary Arrays
    console.log(this.auditTypeArr);
    console.log('tempAuditTypeDesc', this.tempAuditTypeDesc);

    if (
      this.certificateDetailArray.auditSubTypeId === 1003 ||
      this.certificateDetailArray.auditSubTypeId === 1005
    ) {
      this.certificatebasedPlaceholder = 'N.A';
    }
    // MOBILE-71 => expiry date should be able to extend the expiry date up to 5 months
    if (this.certificateDetailArray.certIssueId === this.appConstant.RENEWAL_ENDORSED2) {
      this.maxIssueDate = this.certificateDetailArray.certExpiredDate;
      this.maxExpiryDate = moment(this.addMonth(new Date(this.certificateDetailArray.certExpiredDate), 5), 'YYYY-MM-DD').format('YYYY-MM-DD');
    }

    // MOBILE-205 => expiry date -> 6 months from the issue date date should be enabled for interim and for the full-term audits all the dates within 5 years
    if (this.certificateDetailArray.auditSubTypeId === this.appConstant.INTERIM_SUB_TYPE_ID) {

      this.maxIssueDate = new Date(this.certificateDetailArray.certExpiredDate);
      this.maxExpiryDate = this.subtractDays(new Date(this.addMonth(new Date(this.certificateDetailArray.certIssuedDate), 6)), 1);
    }
    if (this.certificateDetailArray.auditSubTypeId !== this.appConstant.INTERIM_SUB_TYPE_ID && this.certificateDetailArray.auditSubTypeId !== this.appConstant.INTERMEDIATE_SUB_TYPE_ID && this.certificateDetailArray.certIssueId !== this.appConstant.RENEWAL_ENDORSED2) {

      this.maxIssueDate = new Date(this.certificateDetailArray.certExpiredDate);
      this.maxExpiryDate = this.subtractDays(new Date(this.addYear(new Date(this.certificateDetailArray.certIssuedDate), 5)), 1);

    }

    console.log(this.pageTitle);
    console.log(this.certificateDetailArray);
    console.log(this.certificateDetailArray.auditTypeId);
    console.log(JSON.parse(this.route.snapshot.paramMap.get('modalDetails')));
    console.log(this.route.snapshot.paramMap.get('routeUrl'));
    console.log(this.route.snapshot.paramMap.get('modalTitle'));

    this.portArray = this.modalCertificateDetails.MaPort;
    if (
      this.certificateDetailArray.auditTypeId == this.appConstant.MLC_TYPE_ID
    ) {
      this.auditSectionLable = 'INSPECTION';
    } else {
      this.auditSectionLable = 'AUDIT';
    }
    if (this.pageTitle == 'search') {
      console.log(this.searchCertSignatureObj);

      console.log(
        this.modalCertificateDetails.auditTypeArray.filter(
          (res) => res.auditTypeId === this.certificateDetailArray.auditTypeId
        )[0].auditTypeDesc
      );
      console.log(
        this.modalCertificateDetails.masterObjectArray.auditType.filter(
          (res) =>
            res.auditSubtypeId === this.certificateDetailArray.auditSubTypeId
        )[0].auditSubtypeDesc
      );
      console.log(
        this.modalCertificateDetails.masterObjectArray.certIssued.filter(
          (res) =>
            res.certificateIssueId === this.certificateDetailArray.certIssueId
        )[0].certificateIssueDesc
      );
      if (this.certificateDetailArray.issuerSign != '') {
        console.log(
          'this.certificateDetailArray.issuerSign',
          this.certificateDetailArray.issuerSign
        );
        this.issueSignatureSearch =
          'data:image/png;base64,' +
          decodeURIComponent(
            window.atob(this.certificateDetailArray.issuerSign)
          );
        this.issueSignature =
          'data:image/png;base64,' +
          decodeURIComponent(
            window.atob(this.certificateDetailArray.issuerSign)
          );
        console.log(this.issueSignatureSearch);
      } else {
        this.issueSignatureSearch = '';
      }

      console.log(this.issueSignatureSearch);
      this.certificateGenerateForm = this.formBuilder.group({
        vesselForm: this.formBuilder.group({
          vesselName: this.certificateDetailArray.vesselName,
          vesselIMO: this.certificateDetailArray.vesselImoNo,
          vesselType: this.certificateDetailArray.vesselType,
          certificateNo: this.certificateDetailArray.certificateNo,
          GRT: this.certificateDetailArray.grt,
          companyIMONo: this.certificateDetailArray.companyImoNo,
          officialNo: this.certificateDetailArray.officialNo,
          companyName: this.certificateDetailArray.vesselCompanyName,
          registeryPort: this.certificateDetailArray.portOfRegistry,
          registeryDate: this.certificateDetailArray.dateOfRegistry,
          companyAddress: this.certificateDetailArray.vesselCompanyAddress,
        }),
        auditForm: this.formBuilder.group({
          auditType: this.modalCertificateDetails.auditTypeArray.filter(
            (res) => res.auditTypeId === this.certificateDetailArray.auditTypeId
          )[0].auditTypeDesc,
          auditSubType:
            this.modalCertificateDetails.masterObjectArray.auditType.filter(
              (res) =>
                res.auditSubtypeId ===
                this.certificateDetailArray.auditSubTypeId
            )[0].auditSubtypeDesc,
          auditDate: this.certificateDetailArray.auditDate,
          dmlcIssueDate: moment(new Date(), 'YYYY-MM-DD').format(
            'DD MMMM YYYY'
          ),
          dmlcIssuePlace:
            this.certificateDetailArray.dmlcIssuePlace != ''
              ? decodeURIComponent(
                window.atob(this.certificateDetailArray.dmlcIssuePlace)
              )
              : '',
        }),
        certificateForm: this.formBuilder.group({
          certificateIssued:
            this.modalCertificateDetails.masterObjectArray.certIssued.filter(
              (res) =>
                res.certificateIssueId ===
                this.certificateDetailArray.certIssueId
            )[0].certificateIssueDesc,
          // issuePlace: this.certificateDetailArray.auditPlace,
          issuePlace: this.certificateDetailArray.auditPlace
            ? decodeURIComponent(
              window.atob(this.certificateDetailArray.auditPlace)
            )
            : '',
          issueDate: this.certificateDetailArray.certIssueDate,
          endorsedDate: this.certificateDetailArray.endorsedDate,
          expiryDate: this.certificateDetailArray.certExpireDate,
          auditorName: this.certificateDetailArray.auditorName,
          printName:
            this.certificateDetailArray.nameToPrint === 1 ? 'Yes' : 'No',
          printSign:
            this.certificateDetailArray.signToPrint === 1 ? 'Yes' : 'No',
          issueSign:
            this.certificateDetailArray.issuerSign != ''
              ? this.certificateDetailArray.issuerSign
              : '',
          // issueSign : this.certificateDetailArray.issuerSign!=""?  decodeURIComponent(window.atob(this.certificateDetailArray.issuerSign)) : "",
          // issueSign : this.certificateDetailArray.issuerSign!=""? decodeURIComp(this.certificateDetailArray.issuerSign) : "",
          signDate: this.certificateDetailArray.issuerSignDate,
          completionDate:this.modalCertificateDetails.completionDate,//added by lokesh for jira_id(918)
          dmlcIssueDate: moment(new Date(), 'YYYY-MM-DD').format(
            'DD MMMM YYYY'
          ),

          dmlcIssuePlace:
            this.certificateDetailArray.dmlcIssuePlace != ''
              ? decodeURIComponent(
                window.atob(this.certificateDetailArray.dmlcIssuePlace)
              )
              : '',
        }),
      });

      if (this.certificateDetailArray.issuerSign != '') {
        this.issuerSignFlag = true;
      }

      if (
        this.route.snapshot.paramMap.get('routeUrl') !=
        '/audit/perform/audit-details'
      ) {
        console.log('setting auditor name...');
        this.issuerSignFlag = true;
        this.certificateGenerateForm
          .get(['certificateForm', 'auditorName'])
          .setValue(this.email);
        this.certificateGenerateForm
          .get(['certificateForm', 'auditorName'])
          .setValue(this.userName);
        this.certificateGenerateForm
          .get(['certificateForm', 'signDate'])
          .setValue(this.certificateDetailArray.issuerSignDate);
        this.certificateGenerateForm
          .get(['certificateForm', 'issueSign'])
          .setValue(this.issueSignatureSearch);
      }
    } else if (this.pageTitle == 'audit') {
      console.log(this.certificateDetailArray.dmlcIssueDate);

      console.log('certifcificate Dtl : ', this.certificateDetailArray);
      this.issueSignature =
        'data:image/png;base64,' + this.certificateDetailArray.issuerSign;
      console.log(this.issueSignature);
      this.minDate = this.certificateDetailArray.auditDate;

      this.certificateGenerateForm = this.formBuilder.group({
        vesselForm: this.formBuilder.group({
          vesselName: this.certificateDetailArray.vesselData.vesselName,
          vesselIMO: this.certificateDetailArray.vesselData.vesselImoNo,
          vesselType: this.certificateDetailArray.vesselData.vesselType,
          GRT: this.certificateDetailArray.vesselData.grt,
          companyIMONo: this.certificateDetailArray.vesselData.companyImoNo,
          officialNo: this.certificateDetailArray.vesselData.officialNo,
          companyName: this.certificateDetailArray.vesselData.companyName,
          registeryPort: this.certificateDetailArray.vesselData.portOfReg,
          registeryDate: this.certificateDetailArray.vesselData.dateOfReg,
          companyAddress: this.certificateDetailArray.vesselData.companyAddress,
          certificateNo: this.certificateDetailArray.certificateNo,
        }),
        auditForm: this.formBuilder.group({
          auditType: this.certificateDetailArray.auditTypeDesc,
          auditSubType: this.certificateDetailArray.auditSubTypeDesc,
          auditDate: this.certificateDetailArray.auditDate,
          dmlcIssueDate: this.certificateDetailArray.dmlcIssueDate==''||this.certificateDetailArray.dmlcIssueDate=='N.A.'?'N.A':this.certificateDetailArray.dmlcIssueDate,//added by lokesh for jira_id(770)
          dmlcIssuePlace: this.certificateDetailArray.dmlcIssuePlace==''||this.certificateDetailArray.dmlcIssuePlace=='N.A.'?'N.A':this.certificateDetailArray.dmlcIssuePlace,//added by lokesh for jira_id(770)
        }),
        certificateForm: this.formBuilder.group({
          certificateIssued: this.certificateDetailArray.certIssued,

          issuePlace: this.certificateDetailArray.auditPlace,
          issueDate: this.certificateDetailArray.certIssuedDate,
          endorsedDate: this.certificateDetailArray.endorsedDate
            ? this.certificateDetailArray.endorsedDate
            : this.certificateDetailArray.auditDate,
          expiryDate: this.certificateDetailArray.certExpiredDate,
          auditorName: this.certificateDetailArray.auditorName,
          printName: this.certificateDetailArray.nameToBePrinted,
          printSign: this.certificateDetailArray.signToBePrinted,
          issueSign:
            this.certificateDetailArray.issuerSign != ''
              ? this.certificateDetailArray.issuerSign
              : '',
          signDate: this.certificateDetailArray.signDate,
          completionDate:this.modalCertificateDetails.completiondate//moidified by lokesh for jira_id(900)
          // completionDate: this.certificateDetailArray.completionDate ?
          // this.certificateDetailArray.completionDate : 'NA',
        }),
      });
    } else {
      this.certificateGenerateForm = this.formBuilder.group({
        vesselForm: this.formBuilder.group({
          vesselName: this.certificateDetailArray.vesselName,
          vesselIMO: this.certificateDetailArray.vesselImoNo,
          vesselType: this.certificateDetailArray.vesselType,
          certificateNo: this.certificateDetailArray.certificateNo,
          GRT: this.certificateDetailArray.grt,
          companyIMONo: this.certificateDetailArray.companyImoNo,
          officialNo: this.certificateDetailArray.officialNo,
          companyName: this.certificateDetailArray.companyName,
          registeryPort: this.certificateDetailArray.portOfReg,
          registeryDate: this.certificateDetailArray.dateOfReg,
          companyAddress: this.certificateDetailArray.companyAddress,
        }),
        auditForm: this.formBuilder.group({
          auditType: '',
          auditSubType: '',
          auditDate: '',
          dmlcIssueDate: '',
          dmlcIssuePlace: '',
        }),
        certificateForm: this.formBuilder.group({
          certificateIssued: '',
          issuePlace: '',
          issueDate: '',
          endorsedDate: '',
          expiryDate: '',
          auditorName: '',
          printName: '',
          printSign: '',
          issueSign: '',
          signDate: '',
          completionDate: '',
          dmlcIssueDate: '',
          dmlcIssuePlace: '',
        }),
      });
    }

    if (
      this.route.snapshot.paramMap.get('routeUrl') !=
      '/audit/perform/audit-details'
    ) {
      console.log('setting auditor name...');
      this.certificateGenerateForm
        .get(['certificateForm', 'auditorName'])
        .setValue(this.userName);
    }

    console.log(
      this.certificateGenerateForm.get(['auditForm', 'auditType']).value
    );
    if (
      this.certificateGenerateForm.get(['auditForm', 'auditType']).value === ''
    ) {
      this.isAuditTypeSelected = false;
    }
    console.log(this.withOutAudit);

    console.log(this.certificateGenerateForm.get('certificateForm'));
    console.log(this.tempAuditTypeDesc);

    if (this.withOutAudit) {
      this.certificateGenerateForm
        .get(['certificateForm', 'printSign'])
        .setValue('No');
      this.certificateGenerateForm
        .get(['certificateForm', 'printName'])
        .setValue('No');
      this.certificateGenerateForm.get('certificateForm').disable();
      this.withoutAuditDisabled = true;
    }

    // to check direct/followup Intermediate or Additional audit
    this.checkDirInterOrAddtnl().then((directInterAdd: any) => {
      this.directInterAddFlag = directInterAdd;

      // followup additional/intermediate - to disable the expiry date(locked)
      if (this.certificateDetailArray.auditSubTypeId == this.appConstant.INTERMEDIATE_SUB_TYPE_ID || this.certificateDetailArray.auditSubTypeId == this.appConstant.ADDITIONAL_SUB_TYPE_ID) {
        this.disableExpiryDate = this.directInterAddFlag === false ? true : false;
      }
    });
      //added by lokesh for jira_id(793) START HERE
      this.db.getAvailableCertificatesOfCurrentUser().then((res) => {
      this.tempArray = res;
      this.tempArray.forEach((res)=>{
          if(res.auditSeqNo == this.certificateDetailArray.auditSeqNo && res.vesselImoNo == this.certificateDetailArray.vesselData.vesselImoNo ) {
            this.certDataFilter = res;     
          }
          }); 
          if(this.certDataFilter){
            this.enableDownload=true;
            this.issuerSignFlag=true;
            this.attachsignature = true;//added by lokesh for jira_id(MOBILE-797)
        }
        });
  }//added by lokesh for jira_id(793) END HERE

  private _filter(value: string): string[] {
    const filterValue = value.toString().toLowerCase();
     //added by lokesh for jira_id(759) START HERE
     let portArray:any=[];
     portArray=  this.portArray.filter((item,
       index) => this.portArray.indexOf(item) === index);
     return portArray.filter((option) =>
       option.toLowerCase().includes(filterValue)
     );
      //added by lokesh for jira_id(759) END HERE
  }

  filterAuditPort(event) {
    // this.auditFormValueChangesFlag = true;
    let trim=event.trim();//added by lokeshh for jira_id(791)
    this.filteredOptions = this.certificateGenerateForm
      .get(['auditForm', 'dmlcIssuePlace'])
      .valueChanges.pipe(
        startWith(trim),//added by lokeshh for jira_id(791)
        map((value) => this._filter(value))
      );
  }

  addIssuerSign() {
    this.attachsignature = true;
    if (this.withAudit) {
      this.issuerSignFlag = true;
      //this.certificateGenerateForm.get(['certificateForm', 'signDate']).setValue(this.certificateDetailArray.auditDate);
      console.log(this.certificateDetailArray.auditDate);
      this.certificateGenerateForm
        .get(['certificateForm', 'signDate'])
        .setValue(this.datepipe.transform(new Date(), 'yyyy-MM-dd'));

      this.certificateGenerateForm
        .get(['certificateForm', 'issueSign'])
        .setValue(this.certificateDetailArray.issuerSign);
    } else if (this.isCertificateSearch) {
      console.log(this.certiUtnSignDetails);
      this.issueSignature =
        'data:image/png;base64,' + this.certiUtnSignDetails.SIGNATURE;
      this.issuerSignFlag = true;
      this.certificateGenerateForm
        .get(['certificateForm', 'signDate'])
        .setValue(this.certificateDetailArray.auditDate);
      this.certificateGenerateForm
        .get(['certificateForm', 'issueSign'])
        .setValue(this.issueSignature);
    } else {
      console.log(this.certiUtnSignDetails);
      if (this.certiUtnSignDetails.SIGNATURE) {
        this.issueSignature =
          'data:image/png;base64,' + this.certiUtnSignDetails.SIGNATURE;
        this.issuerSignFlag = true;
        this.certificateGenerateForm
          .get(['certificateForm', 'signDate'])
          .setValue(new Date());
        this.certificateGenerateForm
          .get(['certificateForm', 'issueSign'])
          .setValue(this.issueSignature);
      } else alert('please select audit sub-type');
    }
  }

  validateAndGenerateCert() {
    if (this.validateCertificate() && this.validationcertificateisbased()) {
      if (this.withAudit) {
        console.log(this.certificateGenerateForm.value.certificateForm);
        console.log(this.certificateGenerateForm.value.auditForm);
        this.certificateGenerateForm.value.certificateForm.dmlcIssueDate = this.certificateGenerateForm.value.auditForm.dmlcIssueDate
        this.certificateGenerateForm.value.certificateForm.dmlcIssuePlace = this.certificateGenerateForm.value.auditForm.dmlcIssuePlace

        var certData = _.merge(
          this.certificateDetailArray.vesselData,
          this.certificateGenerateForm.value.auditForm,
          this.certificateGenerateForm.value.certificateForm
        );
        console.log(
          this.auditTypeArr.filter(
            (res) => res.auditTypeDesc === certData.auditType
          )
        );
        console.log('withAudit', certData);

        certData.completionDate =
          isNaN(new Date(certData.completionDate).getDate()) ? certData.completionDate :
            moment(new Date(certData.completionDate)).format("YYYY-MM-DD");

        certData.dmlcIssueDate = (this.certificateGenerateForm.value.auditForm.dmlcIssueDate != "N.A") ? moment(this.certificateGenerateForm.value.auditForm.dmlcIssueDate, 'YYYY-MM-DD').format('DD-MM-YYYY') : 'N.A';

        certData.endorsedDate = certData.endorsedDate
          ? this.datepipe
            .transform(new Date(certData.endorsedDate), 'yyyy-MM-dd')
            .toString()
          : '';
        certData.auditTypeId = this.auditTypeArr.filter(
          (res) => res.auditTypeDesc === certData.auditType
        )[0].auditTypeId;
        certData.auditSubTypeId = this.auditTypeMaObj.filter(
          (res) => res.auditSubtypeDesc === certData.auditSubType
        )[0].auditSubtypeId;
        certData.certIssueId = this.certIssuedMaObj.filter(
          (res) => res.certificateIssueDesc === certData.certificateIssued
        )[0].certificateIssueId;
        certData.nameToBePrinted = certData.printName === 'Yes' ? 1 : 0;
        certData.signToBePrinted = certData.printSign === 'Yes' ? 1 : 0;
        certData.certificateNo = this.certificateDetailArray.certificateNo;
      } else if (this.withOutAudit) {
        var certData = _.merge(
          this.certificateDetailArray,
          this.certificateGenerateForm.value.vesselForm,
          this.certificateGenerateForm.value.auditForm,
          this.certificateGenerateForm.value.certificateForm
        );
        console.log('withOutAudit', certData);
        certData.auditTypeId = certData.auditType.auditTypeId;
        certData.nameToBePrinted = certData.printName === 'Yes' ? 1 : 0;
        certData.signToBePrinted = certData.printSign === 'Yes' ? 1 : 0;
        certData.auditSeqNo = 600000;
        certData.companyId = 2;
        certData.certIssueId =
          certData.certificateIssued != ''
            ? this.dbserviceObj.certIssued.filter(
              (res) => res.certificateIssueDesc === certData.certificateIssued
            )[0].certificateIssueId
            : '';
        certData.auditSubTypeId =
          certData.auditSubType != ''
            ? this.dbserviceObj.auditSubType.filter(
              (res) => res.auditSubtypeDesc === certData.auditSubType
            )[0].auditSubtypeId
            : '';
        console.log('asdfghjkl', this.certiUtnSignDetails);
        certData.title = this.certiUtnSignDetails.TITLE;

        console.log('CERTIFICATE DATA, Without Audit : ', certData);
      } else if (this.isCertificateSearch) {
        var certData = _.merge(
          this.certificateDetailArray,
          this.certificateGenerateForm.value.vesselForm,
          this.certificateGenerateForm.value.auditForm,
          this.certificateGenerateForm.value.certificateForm
        );
        console.log('search', certData);
        certData.nameToBePrinted = certData.printName === 'Yes' ? 1 : 0;
        certData.signToBePrinted = certData.printSign === 'Yes' ? 1 : 0;
      }
      console.log(decodeURIComponent(certData.issuePlace));
      certData.issuePlace = decodeURIComponent(
        window.btoa(certData.issuePlace)
      );
      certData.dmlcIssuePlace = certData.dmlcIssuePlace
        ? decodeURIComponent(window.btoa(certData.dmlcIssuePlace))
        : '';
      certData.LeadAuditorSign = decodeURIComponent(
        window.btoa(certData.LeadAuditorSign)
      );
      //certData.issuerSignDate = moment(new Date(), 'YYYY-MM-DD').format('DD MMMM YYYY');
      console.log(moment(certData.issueDate, 'YYYY-MM-DD').format('YYYY-MM-DD'))

      certData.issueDate = moment(certData.issueDate, 'YYYY-MM-DD').format('YYYY-MM-DD');

      this.generateCertifiacte(certData);
    }
  }

  validateAndDownloadCert() {
    if (this.validateCertificate() && this.validationcertificateisbased()) {
      console.log(this.certificateDetailArray);

      let auditTypeId = this.certificateDetailArray.auditTypeId,
        companyId = 2,
        certificateNo = this.certificateDetailArray.certificateNo;
      console.log(this.certificateDetailArray);
      let vesselImoNo = this.withOutAudit
        ? this.certificateDetailArray.vesselImoNo.vesselImoNo
        : this.certificateDetailArray.vesselData
          ? this.certificateDetailArray.vesselData.vesselImoNo
          : this.certificateDetailArray.vesselImoNo;

      console.log(
        'download parameters : ',
        auditTypeId,
        ' ',
        companyId,
        ' ',
        certificateNo,
        ' ',
        vesselImoNo
      );
      this.db
        .getCertificateData(auditTypeId, companyId, certificateNo, vesselImoNo)
        .then((certificateResponse) => {
          console.log('certificateResponse ', certificateResponse);
          this.downloadCertificate(certificateResponse);
        });
    }
  }

  validateCertificate() {
    if (this.certificateGenerateForm.value.certificateForm.issueSign == '') {
      this.toast.presentToast(
        'Attach Signature to generate the Certificate..!!',
        'danger'
      );
      return false;
    } else return true;
  }

  validationcertificateisbased() {
    if (
      (this.certificateGenerateForm.value.certificateForm.completionDate == 'NA'
        || this.certificateGenerateForm.value.certificateForm.completionDate == null
        || this.certificateGenerateForm.value.certificateForm.completionDate == ""
        || this.certificateGenerateForm.value.certificateForm.completionDate == "Invalid date"
        ||this.certificateGenerateForm.value.certificateForm.completionDate == "N.A")&&(this.certificateDetailArray.certIssueId == this.appConstant.FULL_TERM_CERT || this.certificateDetailArray.certIssueId == this.appConstant.RE_ISSUE || this.directInterAddFlag ) 
        && this.certificateDetailArray.auditSubTypeId != this.appConstant.INTERIM_SUB_TYPE_ID //condision changed by lokesh for jira_id(831)
    ) {
      this.toast.presentToast(
        'Please add date on which certificate is based',
        'danger'
      );

    } else if ((this.certificateGenerateForm.value.certificateForm.expiryDate ==
      '' || this.certificateGenerateForm.value.certificateForm.expiryDate ==
      'Invalid Date') && (this.modalCertificateDetails.auditSubTypeId == 1003 || this.modalCertificateDetails.auditSubTypeId == 1005)) {
      this.toast.presentToast(
        'Please add expiry date',
        'danger'
      );
      return false;
    } else return true;
  }
  generateCertifiacte(certificateData) {
    console.log('certificateData ::', certificateData);
    if (this.withOutAudit||this.isCertificateSearch) {//added by lokesh for jira_id(918)
      this.db.generateCertificate(certificateData).then(
        (res) => {
          this.toast.presentToast(
            'Certificate has been generated successfully',
            'success'
          );      
          this.enableDownload = true;
        },
        (err) => {
          this.toast.presentToast('Certificate generation faild', 'danger');
        }
      );
    } else {
      this.getutn().then(() => {
        console.log(this.modalCertificateDetails);
        certificateData.auditReportNo =
          this.modalCertificateDetails.auditReportNo;
        certificateData.userIns = this.modalCertificateDetails.userIns;
        certificateData.issuerId = this.modalCertificateDetails.userIns;
        certificateData.certificateId =
          this.certiUtnSignDetails[0].CERTIFICATE_ID;
        certificateData.utn = this.certiUtnSignDetails[0].UTN;
        certificateData.auditSeqNo = parseInt(
          this.certificateDetailArray.auditSeqNo
        );
        certificateData.companyId = this.certificateDetailArray.companyId;
        certificateData.consecutiveId = 1000;
        certificateData.docTypeNumber =
          this.modalCertificateDetails.docTypeNumber;
        certificateData.activeStatus = 1;
        certificateData.seqNo = 1;
        certificateData.certificateVer = 'IRI-01';
        certificateData.publishStatus = 1;

        certificateData.qrCodeUrl =
          this.appConstant.CERTI_URL +
          this.certificateDetailArray.companyId +
          '/' +
          this.certificateDetailArray.qid;

        certificateData.expiryDate = certificateData.expiryDate
          ? this.datepipe
            .transform(new Date(certificateData.expiryDate), 'yyyy-MM-dd')
            .toString()
          : '';
        this.certificateexperirydate = certificateData.expiryDate;
        certificateData.title = this.certificateDetailArray.title;
        certificateData.auditorName = this.certificateDetailArray.auditorName;
        certificateData.issuerName = this.certificateDetailArray.auditorName;
        certificateData.issuerSign = decodeURIComponent(
          window.btoa(this.certificateDetailArray.issuerSign)
        );
        certificateData.LeadAuditorSign = decodeURIComponent(
          window.btoa(this.certificateDetailArray.issuerSign)
        );
        console.log('certificateData', certificateData);
        this.db.generateCertificate(certificateData).then(
          (res) => {
            this.toast.presentToast(
              'Certificate has been generated successfully',
              'success'
            );
            this.enableDownload = true;          
          },
          (err) => {
            this.toast.presentToast('Certificate generation faild', 'danger');
          }
        );
      });
    }
  }
  downloadCertificate(result) {

    if (result) {
      this.db
        .getPreviousInitialRenewalData2(
          this.certificateDetailArray.auditTypeId,
          this.certificateDetailArray.vesselData.vesselImoNo + ''
        )
        .then((initialRenewalData) => {
          console.log('initialRenewalData', initialRenewalData);
          result = [];
          result = initialRenewalData;
          console.log(result);
          let _that = this;
          var newCertificate = [],
            renewalEndorse2 = [],
            extension = [],
            additionalReissue1 = [],
            additionalReissue2 = [];
          var currInitialPage = [],
            additionalReissue3 = [],
            intermediateReissue1 = [],
            additional1 = [],
            additional2 = [],
            additional3 = [],
            intermediate1 = [];
          var overallAddCnt = 0,
            overallInterCnt = 0;

          var certificaIssueId = result.certIssueId,
            tempAuditSeqNo = result.auditSeqNo;
          var latestNumber = [];

          result[0].signDate = result[0].signDate
            ? this.datepipe
              .transform(new Date(result[0].signDate), 'yyyy-MM-dd')
              .toString()
            : '';
          result[0].issuerSignDate = result[0].signDate;
          var auditSubTypeId = this.certificateDetailArray.auditSubTypeId,
            expiryDate = this.certificateDetailArray.certExpiredDate,
            getcertificateNo = this.certificateDetailArray.certificateNo;

          result.sort(function (c, d) {
            return c.auditSeqNo - d.auditSeqNo || c.seqNo - d.seqNo;
          });

          var result = result.filter(function (res) {
            return res.certificateNo == getcertificateNo;
          });

          console.log(result);
          var countIni = 0;
          result.forEach(function (a) {
            if (
              a.auditSubTypeId == 1002 ||
              (a.auditSubTypeId == 1004 && a.certIssueId == 1002) ||
              a.auditSubTypeId == 1001
            )
              countIni++;
            if (
              a.certIssueId == 1001 ||
              a.certIssueId == 1002 ||
              a.certIssueId == 1008
            ) {
              if (a.certIssueId == 1008 && a.seqNo == 1) a.getEndrosedCount = 0;
              currInitialPage[0] = a;
            }
          });
          console.log(countIni);
          var directInterAdd = '';
          if (
            (countIni == 0 && result[0].auditSubTypeId == 1003) ||
            result[0].auditSubTypeId == 1005
          )
            var directInterAdd = 'directInterAdd';
          //console.log(certDetails.directInterAdd)
          result.forEach(function (a) {
            a.nameItalics = false;
            a.nameFull = '';
            a.sealImage = '';
            if (a.title.indexOf('Special') >= 0) {
              a.sealImage = _that.images['sa'];
            } else if (a.title.indexOf('Deputy') >= 0) {
              a.sealImage = _that.images['dc'];
            }
            if (a.nameToPrint == 1) {
              a.nameFull = a.issuerName + '\n';
              a.nameItalics = false;
            } else if (a.nameToPrint == 0) {
              a.nameFull = '(Name) \n';
              a.nameItalics = true;
            }

            console.log(this);
            if (a.auditSubTypeId === 1005 && a.certIssueId == 1005) {
              if (a.auditSubTypeId === 1005) latestNumber.push(a.auditSeqNo);
              overallAddCnt++;
              a.overallAddCnt = overallAddCnt;
            }
            console.log(a);

            if (a.auditSubTypeId == 1002) a.initialAvail = true;
            else a.initialAvail = false;

            if (a.auditSubTypeId == 1003 && a.certIssueId == 1004) {
              overallInterCnt++;
              a.overallAddCnt = overallAddCnt;
              a.overallInterCnt = overallInterCnt;
            }

            if (a.auditSubTypeId == 1005 && a.certIssueId == 1008) {
              overallAddCnt++;
              a.overallAddCnt = overallAddCnt;
              a.addReissue = true;
            } else a.addReissue = false;

            if (a.auditSubTypeId == 1003 && a.certIssueId == 1008) {
              overallInterCnt++;
              a.overallInterCnt = overallInterCnt;
              a.overallAddCnt = overallAddCnt;
              a.interReissue = true;
              a.addReissue = true;
            } else a.interReissue = false;

            if (a.auditSubTypeId == 1004 && a.auditStatusId != 1004) {
              a.renewalEndorsedAvail = true;
            } else a.renewalEndorsedAvail = false;
          });

          console.log(result);

          var maximum = Math.max.apply(null, latestNumber); // get the max of the array
          latestNumber.splice(latestNumber.indexOf(maximum), 1); // remove max from the array
          var maximum2 = Math.max.apply(null, latestNumber); // get the 2nd max
          var latestSeqNumber = '';
          var getEndrosedCountLatest = '';
          result.forEach(function (a) {
            if (a.auditSeqNo === maximum2) {
              latestSeqNumber = a.seqNo;
              getEndrosedCountLatest = a.getEndrosedCount;
              a.latestSeqNumber = latestSeqNumber;
            }
          });
          console.log(result);
          var certorderInter = 0;
          console.log(certorderInter);
          result.forEach(function (a, index) {


            a.withoutIntermediate = false;

            a.auditPlace = a.auditPlace
              ? decodeURIComponent(atob(a.auditPlace))
              : '';

            a.certExpireDate = a.certExpireDate
              ? moment(a.certExpireDate, 'YYYY-MM-DD').format('DD MMMM YYYY')
              : '';

            a.certIssueDate = a.certIssueDate
              ? moment(a.certIssueDate, 'YYYY-MM-DD').format('DD MMMM YYYY')
              : '';

            a.auditDate = a.auditDate
              ? moment(a.auditDate, 'YYYY-MM-DD').format('DD MMMM YYYY')
              : '';

            a.dateOfRegistry = a.dateOfRegistry
              ? moment(a.dateOfRegistry, 'YYYY-MM-DD').format('DD MMMM YYYY')
              : '';

            a.issuerSignDate = a.issuerSignDate
              ? moment(a.issuerSignDate, 'YYYY-MM-DD').format('DD MMMM YYYY')
              : '';

            a.extendedIssueDate = a.extendedIssueDate
              ? moment(a.extendedIssueDate, 'YYYY-MM-DD').format('DD MMMM YYYY')
              : '';

            a.extendedExpireDate = a.extendedExpireDate
              ? moment(a.extendedExpireDate, 'YYYY-MM-DD').format(
                'DD MMMM YYYY'
              )
              : '';

            a.prevAuditIssueData = a.prevAuditIssueData
              ? moment(a.prevAuditIssueData, 'YYYY-MM-DD').format(
                'DD MMMM YYYY'
              )
              : '';

            a.issuerSign = atob(a.issuerSign);

            a.auditStatusId = a.auditStatusId;

            if (a.certIssueId == 1003 || a.certIssueId == 1006) {
              if (
                a.auditSubTypeId == 1001 ||
                a.auditSubTypeId == 1002 ||
                a.auditSubTypeId == 1003 ||
                a.auditSubTypeId == 1004
              ) {
                console.log(a);
                if (a.certIssueId == certificaIssueId) {
                  a.withoutCross = true;
                } else {
                  a.withoutCross = false;
                }
                if (extension.length == 0)
                  extension[0] = a;
                else if (extension.length > 0 && a.auditSeqNo < extension[0].auditSeqNo)
                  extension[0] = a;
              }
            } else if (a.certIssueId == 1007) {
              if (a.certIssueId == certificaIssueId) {
                a.withoutCross = true;
              } else {
                a.withoutCross = false;
              }

              renewalEndorse2[0] = a;
            }

            if (
              a.auditSubTypeId == 1002 ||
              a.auditSubTypeId == 1004 ||
              a.auditSubTypeId == 1001
            ) {
              //	det.newCertificateSign = "data:image/png;base64,"+a.issuerSign;

              console.log('Initial');

              if (a.auditSubTypeId == auditSubTypeId) {
                a.expiryDate = expiryDate;
                a.withoutCross = true;
              } else {
                a.withoutCross = false;
              }
              //console.log("FULLTERM..!!");

              newCertificate[0] = a;
            } else if (a.auditSubTypeId == 1005) {
              console.log(additional1);
              /*
            if(a.overallAddCnt==1){
              (a.certIssueId  == 1005)?additional1={0:a}:'';
              (a.certIssueId  == 1008)?additionalReissue1={0:a}:'';
            }else if(a.overallAddCnt==2){
              (a.certIssueId  == 1005)?additional2={0:a}:'';
              (a.certIssueId  == 1008)?additionalReissue2={0:a}:'';
            }else if(a.overallAddCnt==3){
              (a.certIssueId  == 1005)?additional3={0:a}:'';
              (a.certIssueId  == 1008)?additionalReissue3={0:a}:'';
            }
            */
              if (a.overallAddCnt == 1 && overallInterCnt <= 1) {
                a.certIssueId == 1005 ? (additional1[0] = a) : '';
                a.certIssueId == 1008 ? (additionalReissue1[0] = a) : '';
              } else if (a.overallAddCnt == 1 && overallInterCnt == 2) {
                a.certIssueId == 1005 ? (additional2[0] = a) : '';
                a.certIssueId == 1008 ? (additionalReissue2[0] = a) : '';
              } else if (a.overallAddCnt == 2 && overallInterCnt <= 1) {
                a.certIssueId == 1005 ? (additional2[0] = a) : '';
                a.certIssueId == 1008 ? (additionalReissue2[0] = a) : '';
              } else if (a.overallAddCnt == 2 && overallInterCnt == 2) {
                a.certIssueId == 1005 ? (additional3[0] = a) : '';
                a.certIssueId == 1008 ? (additionalReissue3[0] = a) : '';
              } else if (a.overallAddCnt == 3 && overallInterCnt <= 1) {
                a.certIssueId == 1005 ? (additional3[0] = a) : '';
                a.certIssueId == 1008 ? (additionalReissue3[0] = a) : '';
              }

              console.log(additional1);

              if (newCertificate.length == 0) {
                if (a.certIssueId == certificaIssueId) {
                  a.withoutCross = true;
                } else {
                  a.withoutCross = false;
                }

                var copyData = a;
                copyData.withoutIntermediate = true;
                newCertificate.push(copyData);
              }
            } else if (a.auditSubTypeId == 1003) {
              console.log('Intermediate');
              console.log(a);
              /*if(a.certIssueId  == 1004)
            {
            if(a.auditSubTypeId == auditSubTypeId){
  	
              a.withoutCross = true;
              }else{
              a.withoutCross = false;
              }
            	
              if(a.overallInterCnt==1)
                intermediate={0:a};
              else if(a.overallInterCnt>=2){
                (additional1.length==0) ? additional1={0:a}:'';
              }else if(a.overallInterCnt>=3){
                (additional2.length==0) ? additional2={0:a}:'';
              }else if(a.overallInterCnt>=4){
                (additional3.length==0) ? additional3={0:a}:'';
              }
            	
            }
          	
            if(a.certIssueId  == 1008){
              if(a.overallInterCnt==1){
                intermediateReissue1={0:a};
              }
              else if(a.overallInterCnt==2){	
                (additionalReissue1.length==0) ? additionalReissue1={0:a}:'';
              }
              else if(a.overallInterCnt==3){
                (additionalReissue2.length==0) ? additionalReissue2={0:a}:'';
              }
              else if(a.overallInterCnt==4){
                (additionalReissue3.length==0) ? additionalReissue3={0:a}:'';
              }
            }*/
              /*if (a.auditSubTypeId == 1003)
              intermediate1[0] = a;*/
              if (a.overallInterCnt == 1) {
                a.certIssueId == 1004 ? (intermediate1[0] = a) : '';
                a.certIssueId == 1008 ? (intermediateReissue1[0] = a) : '';
              } else if (a.overallInterCnt == 2 && a.overallAddCnt == 0) {
                a.certIssueId == 1004 ? (additional1[0] = a) : '';
                a.certIssueId == 1008 ? (additionalReissue1[0] = a) : '';
              } else if (a.overallInterCnt == 2 && a.overallAddCnt == 1) {
                a.certIssueId == 1004 ? (additional2[0] = a) : '';
                a.certIssueId == 1008 ? (additionalReissue2[0] = a) : '';
              } else if (a.overallInterCnt == 2 && a.overallAddCnt == 2) {
                a.certIssueId == 1004 ? (additional3[0] = a) : '';
                a.certIssueId == 1008 ? (additionalReissue3[0] = a) : '';
              }

              if (newCertificate.length == 0) {
                if (a.certIssueId == certificaIssueId) {
                  a.withoutCross = true;
                } else {
                  a.withoutCross = false;
                }

                var copyData = a;
                copyData.withoutIntermediate = true;
                newCertificate.push(copyData);
              }
            }

            if (
              a.certIssueDesc == 'FULL TERM' ||
              a.certIssueDesc == 'RE-ISSUE/ADMINISTRATIVE' ||
              a.certIssueDesc == 'INTERIM'
            ) {
              currInitialPage[0] = a;
            }
            console.log(a.certIssueId);
            if (
              directInterAdd == 'directInterAdd' &&
              (a.auditSubTypeId == 1005 ||
                1003 ||
                a.certIssueId == 1007 ||
                a.certIssueId == 1006)
            ) {
              if (certorderInter < a.auditSeqNo) {
                certorderInter = a.auditSeqNo;
              }
              console.log('DetailscertDetails', certorderInter);
              console.log('newCertificate', a.auditSeqNo);
              a.auditSeqNo == certorderInter ? (currInitialPage[0] = a) : ' ';
            }
          });
          console.log('DetailscertDetails', result);
          console.log('newCertificate', newCertificate);

          //certDetails.signature = result;

          var certificateDatas = {
            certificateNo: newCertificate[0].certificateNo,
            AuditTypeId: newCertificate[0].auditTypeId,
            vesselName: newCertificate[0].vesselName,
            officialNo: newCertificate[0].officialNo,
            distinletter: newCertificate[0].officialNo,
            vesselImoNo: newCertificate[0].vesselImoNo,
            CompanyId: newCertificate[0].companyId,
            AuditSeqNo: newCertificate[0].auditSeqNo,
            UserIns: 'BSOL',
            DateIns: moment(new Date()).format('MMMDDYYYY'),
            portofreg: newCertificate[0].portOfRegistry,
            shiptype: newCertificate[0].vesselType,
            grt: newCertificate[0].grt,
            companyaddress: newCertificate[0].vesselCompanyAddress,
            companyname: newCertificate[0].vesselCompanyName,
            companyimono: newCertificate[0].companyImoNo,
            expirydate:
              newCertificate[0].certIssueId == 1007
                ? moment(new Date(result[1].extendedExpireDate)).format('YYYY-MM-DD')
                : this.disableExpiryDate == true ? newCertificate[0].expiryDate :
                  this.certificateexperirydate? this.certificateexperirydate:this.modalCertificateDetails.certExpiredDate,
            completionDate:this.modalCertificateDetails.completiondate,

            auditplace: result[0].auditPlace,
            certissuedate:
              newCertificate[0].certIssueId == 1008
                ? newCertificate[0].extendedIssueDate
                : newCertificate[0].issueDate,
            auditSubTypeId:
              newCertificate[0].withoutIntermediate == true
                ? 1002
                : newCertificate[0].auditSubTypeId,
            AuditDate: newCertificate[0].auditDate,
            auditDate: newCertificate[0].auditDate,
            LeadAuditorSign: newCertificate[0].issuerSign,
            headSubTitleism:
              'Issued under the provisions of the International Convention for the Safety',
            headSubTitleism1: 'of Life at Sea, 1974(SOLAS), as amended',
            certify: 'THIS IS TO CERTIFY THAT',
            res: newCertificate[0],
            intermediate: intermediate1,
            additional1: additional1,
            additional2: additional2,
            additional3: additional3,
            LeadAuditorName: newCertificate[0].issuerName,
            headSubTitleisps:
              'Issued under the provisions of the International Code for the Security',
            headSubTitleisps1: 'of Ships and of Port Facilities (ISPS Code)',
            //    		'previousexpirydate':moment(certDetails.previousAudit.certExpireDate,'YYYY-MM-DD').format('DD-MMM-YYYY'),
            headSubTitlemlc:
              'Issued under the provisions of Article V and Title 5 of the Maritime Labour Convention, 2006',
            HeadSubTitle:
              '(Note: This Certificate shall have a Declaration of Maritime Labour Compliance attached.)',
            headSubTitle2: '(referred to below as the “Convention�?)',
            signaturetext:
              'Signature of the Duly Authorized Official Issuing the Certificate.',
            sealcontent: '(Seal or stamp of issuing authority, as appropriate)',
            certificateVer: newCertificate[0].certificateVer,
            utn: newCertificate[0].utn,
            qid: newCertificate[0].qid ? newCertificate[0].qid : '',
            consecutiveId: newCertificate[0].consecutiveId,
            certIssueDate:
              newCertificate[0].certIssueId == 1008
                ? moment(new Date(newCertificate[0].extendedIssueDate)).format('YYYY-MM-DD')
                : newCertificate[0].issueDate,
            intermediateIssue:
              intermediate1.length > 0 ? intermediate1[0].certIssueDate : '',
            intermediateExpiry:
              intermediate1.length > 0 ? intermediate1[0].certExpireDate : '',
            intermediatePlace:
              intermediate1.length > 0 ? intermediate1[0].auditPlace : '',
            intermediateLeadSign:
              intermediate1.length > 0 ? intermediate1[0].issuerSign : '',
            interSignDate:
              intermediate1.length > 0 ? intermediate1[0].issuerSignDate : '',
            //'qrCodeData': certDetails.qrCodeData,
            qrCodeUrl:
              this.appConstant.CERTI_URL +
              this.certificateDetailArray.companyId +
              '/' +
              this.certificateDetailArray.qid,
            dateOfReg: newCertificate[0].dateOfRegistry,
            renewalEndorse2: renewalEndorse2,
            extension: extension,
            seal: newCertificate[0].seal,
            title: newCertificate[0].title,
            certificateDetails: result,
            latestSeqNumber: latestSeqNumber,
            getEndrosedCountLatest: getEndrosedCountLatest,
            additionalReissue1: additionalReissue1,
            additionalReissue2: additionalReissue2,
            additionalReissue3: additionalReissue3,
            currInitialPage: currInitialPage,
            intermediateReissue: intermediateReissue1,
            voluntaryCert: false,
          };
          /** start 13.13 expirydate  */
          if (certificateDatas.renewalEndorse2[0]) {
            certificateDatas.renewalEndorse2[0].extendedExpireDate = this.certificateexperirydate
          }
          /** end 13.13 expirydate  */
          console.log(certificateDatas);
          console.log(newCertificate);
          if (certificateDatas.AuditTypeId == this.appConstant.ISM_TYPE_ID) {
            this.pdfService.ismPdfService(certificateDatas).then((res) => {
              console.log(res);
              if (res['data'] != '') {
                console.log('PDF Status : ', res['data']);
                this.toast.presentToast(
                  'Certificate saved Successfully.',
                  'success'
                );
              }
            });
          } else if (
            certificateDatas.AuditTypeId == this.appConstant.ISPS_TYPE_ID
          ) {
            this.pdfService.ispsPdfService(certificateDatas).then((res) => {
              console.log(res);
              if (res['data'] != '') {
                console.log('PDF Status : ', res['data']);
                this.toast.presentToast(
                  'Certificate saved Successfully.',
                  'success'
                );
              }
            });
          } else if (
            certificateDatas.AuditTypeId == this.appConstant.MLC_TYPE_ID
          ) {
            this.pdfService.mlcPdfService(certificateDatas).then((res) => {
              console.log(res);
              if (res['data'] != '') {
                console.log('PDF Status : ', res['data']);
                this.toast.presentToast(
                  'Certificate saved Successfully.',
                  'success'
                );
              }
            });
          }
        });
    } else {
      console.log('Please generate certificate to download..!!');
      this.toast.presentToast(
        'Please generate the Certificate to download..!!',
        'danger'
      );
    }
  }
  ngAfterViewInit() {
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      if (
        this.route.snapshot.paramMap.get('routeUrl') ===
        '/perform/audit-details')//modified by lokesh for jira_id(724)
         {
        console.log('ngAfterViewInit');
        this.router.navigateByUrl('/perform/audit-details');//modified by lokesh for jira_id(724)
      } else {
        this.router.navigateByUrl('/certificate/create');
      }
    });
  }

  ngOnDestroy() {
    this.backButtonSubscription.unsubscribe();
  }

  clearDate(date: HTMLInputElement) {
    date.value = '';
  }
  CertificateclearDate() {
    this.certificateGenerateForm
      .get(['certificateForm', 'completionDate'])
      .setValue(null);
  }

  clearDateCertificate(ptr) {
    console.log(ptr);
    this.certificateGenerateForm
      .get(['certificateForm', ptr])
      .setValue("");
    console.log(this.certificateGenerateForm
      .get(['certificateForm', ptr])
      .setValue(""));
  }
  // Check if device is phone or tablet
  get isMobile() {
    return this.breakpointObserver.isMatched('(max-width: 767px)');
  }
}
