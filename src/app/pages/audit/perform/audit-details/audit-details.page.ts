import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
  ViewEncapsulation,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
  FormGroupDirective,
  Form,
} from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  Platform,
  ModalController,
  AlertController,
  iosTransitionAnimation,
} from '@ionic/angular';
import { Observable } from 'rxjs';
import { startWith, map, filter } from 'rxjs/operators';
import { ActionSheetController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { BreakpointObserver } from '@angular/cdk/layout';
import * as moment from 'moment';
import { DatabaseService } from 'src/app/providers/database.service';
import { ToastService } from 'src/app/providers/toast.service';
import { PdfService } from 'src/app/providers/pdf.service';
import { CertificateDetailsPage } from 'src/app/pages/certificate/certificate-details/certificate-details.page';
import { CurrentFinding, PrevAuditDetail } from 'src/app/interfaces/finding';
import { AppConstant } from 'src/app/constants/app.constants';
import { LoadingIndicatorService } from 'src/app/providers/loading-indicator.service';
import { AuditcyclePage } from 'src/app/pages/auditcycle/auditcycle.page';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileManagerService } from 'src/app/providers/file-manager.service';
import { FindingService } from 'src/app/providers/finding.service';
import { Console } from 'console';

declare function decodeURIComp(base64): any;
declare function encodeURIComp(data): any;

@Component({
  selector: 'app-audit-details',
  templateUrl: './audit-details.page.html',
  styleUrls: ['./audit-details.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AuditDetailsPage implements OnInit, OnDestroy, AfterViewInit {
  moment = moment;
  mimeType: { type: string; value: string }[] = [
    { type: 'pdf', value: 'application/pdf' },
    { type: 'jpeg', value: 'image/jpeg' },
    { type: 'txt', value: 'text/plain' },
    { type: 'png', value: 'image/png' },
  ];

  backButtonSubscription;
  @ViewChild('auditDataForm', { static: false })
  auditDataForm: FormGroupDirective;

  displayedColumns: string[] = [
    'SL No.',
    'name',
    'weight',
    'symbol',
    'review',
    'dmlc ii',
    'inspector',
  ];
  sspDataSource = [];
  userName;//added by lokesh for jira_id(850)
  signature;
  vesselDetails: boolean = false;
  letterHistoryview: boolean = false;
  statusComplete: any;
  public columns: any;
  public rows: any;
  sspDetailsFormEnable: boolean = false;
  userTypeName: string;
  typeName: string;
  reviewTypeName: string;
  auditTypeArray: any;
  auditorFullname: any;
  auditStatusArray: any;
  certIssuedArray: any;
  summaryHead: string;
  sspAuditornameChange: any;
  auditSummaryArray: any = [];
  //certDtlInputData:any;
  auditData: FormGroup;
  data;
  scopeArray: { scopeId: number; scopeDesc: string }[];
  subTypeValue: any;
  auditTypeValue: any;
  scopeValue: string;
  statusValue: any;
  halfScope: any;
  auditStatusValue: any;
  certIssuedValue: any;
  summaryValue: any;
  reportObj; //this is the refrence variable for auditReport

  currentAuditSeqNo: any; // this is used for current auditsequence for Audit Cycle Data

  sspRevisionNo: any;
  sspReportNo: any;
  sspLeadName: any;

  portArray: any = [];
  filteredOptions: Observable<string[]>;
  fileValid: boolean;
  fileContent: string = '';
  reportLabel: string;

  //-------------Temp-------------

  reportPlan: any;
  reportAttendence: any;
  reportCertificate: any;
  reportCrew: any;
  reportData: any;
  reportFileArray: any = [];
  auditArrayType: { auditTypeId: number; auditTypeDesc: string }[];
  a: any = [];
  attFlag: boolean;
  isDMLC: boolean;

  momentjs: any = moment;
  dirName: any;
  omdFlag: boolean;
  maxIAD: any;

  maxInternalAuditDate: any;
  minInternalAuditDate: any;
  minReviewDate: any;
  minAuditDate: any;
  minReceiptDate: any;
  minOpenMeetingDate: any;
  maxOpenMeetingDate: any;
  minCloseMeetingDate: any;
  maxCloseMeetingDate: any;

  //info
  prevMNC: number = 0;
  prevNC: number = 0;
  prevOBS: number = 0;
  newMNC: number = 0;
  newNC: number = 0;
  newOBS: number = 0;
  findingList: any;
  isFindingExist = true;

  openMeetingDateError: any;
  sspReviewDataIsPresent: boolean = false;
  previousFindingButton: boolean = true;

  isReadonly: boolean = true;
  auditDtlPlaceholder: string;
  isInterim: boolean;
  auditSubTypeId: any;
  notApprovedFlag: any;
  auditFormValueChangesFlag: boolean = false;
  attachmentFileNamesToDeleteFromFS: string[] = [];
  auditTypeTitle: string;
  auditType_Title:string
  newFindingsList: any = [];
  previousFindingsData: any;
  readonlyFormFields: boolean = true;
  isIOS: boolean;

  majorFindingDesc: string;
  obsFindingDesc: string;
  mainorFindingDesc: string;
  dirInterOrAdd: boolean = false;
  addingAttach: boolean=false;
  letter: boolean;
  narrativeSummaryDesc:any;//added by  lokesh for  jira_id(678)
  isReportValid:boolean; //added by lokesh for jira_id(654)
  auditorName: string; //added by lokesh for check box and binding data jira_id(635)
  summarydesc: any = [];// added by lokesh for jira_id(467)
  flag:any; //added by lokesh for jira_id(824)
  /**added by archana for jira ID-756,763,747 start */
  formValueChangeForStatus: boolean = false;  
  isDmlcLinked: boolean = false;
  dmlcAutitDataVar: any;
  dmlcfindingsListVar: any;
  certData: any;
  certDataFilter: any;
  radioSet: boolean;
  sspDataToShow: any=[];                //added by archana for jira ID-MOBILE-852
  presentSeqNo: any;
  auditTypeData: string;
  previousUrl: string;
  auditsubtype: boolean;
  /**added by archana for jira ID-756,763,747 end */
  //------------------------------

  //Init Form Array

  initVesselDataForm(): FormGroup {
    return this.formBuilder.group({
      vesselImoNo: ['', Validators.required],
      vesselName: ['', Validators.required],
      vesselType: ['', Validators.required],
      officialNo: ['', Validators.required],
      grt: ['', Validators.required],
      companyImoNo: ['', Validators.required],
      docTypeNo: ['', Validators.required],
      docIssuer: ['', Validators.required],
      docExpiry: ['', Validators.required],
      companyName: ['', Validators.required],
      dateOfRegistry: ['', Validators.required],
      companyNameOri: ['', Validators.nullValidator],
      companyAddOri: ['', Validators.nullValidator],
    });
  }

  initAuditDataForm(): FormGroup {
    return this.formBuilder.group({
      auditSeqNo: [''],
      companyId: [''],
      lockHolder: [''],
      lockStatus: [''],
      auditTypeId: [''],
      dateOfIns: [''],
      maxStatusDateCar: [''],
      seal: [''],
      title: [''],
      signature: [''],
      qid: [''],
      userName: [''],
      auditorName: ['', Validators.required],
      auditorId: ['', Validators.required],
      auditReportNo: ['', Validators.required],
      auditSubType: ['', Validators.required],
      scope: ['', Validators.required],
      auditDate: ['', Validators.required],
      auditPlace: ['', Validators.required],
      auditStatus: ['', Validators.required],
      certificateNo: ['', Validators.required],
      certificateIssued: ['', Validators.required],
      issueDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      interalAuditDate: [''],
      openMeetingDate: ['', Validators.required],
      closeMeetingDate: [''],
      sspRevisionNo: [''],
      sspDetails: this.formBuilder.array([
        this.sspDetailsFormEnable ? this.initSSP() : [{}],
      ]),
    });
  }

  initReportDetailsForm(): FormGroup {
    return this.formBuilder.group({
      auditPlan: [''],
      attendenceList: [''],
      certificate: [''],
      crewList: [''],
      others: [''],
    });
  }

  initSummaryDetailsForm(): FormGroup {
    return this.formBuilder.group({
      auditSummary: [''],
    });
  }

  initNarativeDetailsForm(): FormGroup {
    return this.formBuilder.group({
      narativeSummary: [''],
    });
  }
  //expiryDate: ['', Validators.required],
  initSSP(): FormGroup {
    return this.formBuilder.group({
      sspReportNo: [''],
      sspAuditorName: [''],
      sspRevisionNo: [''],
    });
  }

  // MOBILE-193 => to refresh updated issueDate from certScreen into perform screen
 async ionViewWillEnter() {
      this.loader.showLoader("Please Wait..")//added by lokesh for jira_id(787)
      await  this.setDropdowns();    //added by archana for jira ID-MOBILE-820
      this.db.getAuditdata(this.data.auditData[0].auditSeqNo).then((res) => {
      this.radioButtonset(); //added by archana for jira id-MOBILE-786
      this.prevandcurzero();//changed by lokesh for jira_id(787)
      this.getfindingInfodata();//changed by lokesh for jira_id(787)
      console.log(res);
      this.halfScope = res[0].scopeId;
      let auditDataForm = this.auditData.get('auditDetails') as FormArray;
      auditDataForm.patchValue([
        {
          issueDate: res[0].certIssuedDate
            ? new Date(res[0].certIssuedDate)
            : '',

          expiryDate: res[0].certExpiryDate
            ? new Date(res[0].certExpiryDate)
            : '',
        },
      ]);
    });
    this.loader.hideLoader();//added by lokesh for jira_id(787)
  }

  getValueFromMIME(key: string): string {
    console.log(key);
    for (let index = 0; index < this.mimeType.length; index++) {
      if (key == this.mimeType[index].type) {
        return this.mimeType[index].value;
      }
    }
    return 'unsupported';
  }

  test(e) {
    console.log(e.target.value);
    if (!/^[a-zA-Z]*$/g.test(e.target.value)) {
      // alert("Invalid characters");
      return false;
    } else {
      console.log('else');
      return true;
    }
    // console.log(e.data)
    // console.log(e.data.charCode)
    // console.log(e.target.value)
    // const pattern = /[0-9.,]/;
    // let inputChar = String.fromCharCode(e.charCode);
    // console.log(inputChar)
    // if (!pattern.test(inputChar)) {
    //   // invalid character, prevent input
    //   event.preventDefault();
    // }
    //   var k;
    //   console.log(e.keyCode)
    //    k = e.charCode;  //         k = event.keyCode;  (Both can be used)
    //    console.log(k)
    //  return((k > 64 && k < 91) || (k > 96 && k < 123));
  }

  //Dynamic Labels set Functionality

  setLabels() {
    console.log('Inside Set Labels ....');
    console.log(this.data.auditData[0].auditTypeId);

    if (this.data.auditData[0].auditTypeId === 1001) {
      this.userTypeName = 'Auditor';
      this.typeName = 'Audit';
      this.summaryHead =
        'The undersigned has carried out the above audit according to the ISM Code and found the vessel';
      this.reportLabel = 'Audit';
    } else if (this.data.auditData[0].auditTypeId === 1002) {
      this.userTypeName = 'Auditor';
      this.typeName = 'Audit';
      this.reviewTypeName = 'SSP';
      this.summaryHead =
        'The undersigned has carried out the above audit according to the ISPS Code and found the vessel';
      this.reportLabel = 'Audit';
    } else if (this.data.auditData[0].auditTypeId === 1003) {
      this.userTypeName = 'Inspector';
      this.typeName = 'Inspection';
      this.reviewTypeName = 'DMLC II Review';
      this.summaryHead =
        'The undersigned has carried out the above inspection according to the MLC Code and found the vessel';
      this.reportLabel = 'Inspection';
    } else if (
      this.data.auditData[0].auditTypeId === 1004 ||
      this.data.auditData[0].auditTypeId === 1005
    ) {
      this.userTypeName = 'Inspector';
      this.typeName = 'Review';
      this.summaryHead =
        'The undersigned has carried out the DMLC Part II review pursuant to Standard A5.1.3 paragraph 10(b) of the MLC 2006 and RMI requirements for implementing MLC 2006 and found the DMLC Part II;';
    }
    this.init_reviewletter(); /**Added By sudharsan for JIRA-ID -- 446,447,448,449 */
  }
  completeStatusCheck(event) {
    console.log(event);
    /**Added By archana for jira-Id=>MOBILE-594,MOBILE-569 start */
    if(this.data.auditData[0].auditTypeId == 1002){
      this.sspDataSource.length>0?this.data.auditData[0].sspDetailsData.ltrStatus = 1:this.data.auditData[0].sspDetailsData.ltrStatus = 0;
   };
   /**Added By archana for jira-Id=>MOBILE-594,MOBILE-569 end */
    this.statusComplete = event;
    if (event == 1002) {
      let auditDataForm = this.auditData.get('auditDetails') as FormArray;
      let summaryForm = this.auditData.get('summaryDetails') as FormArray;
      let auditData = this.data.auditData[0];
      console.log(this.reportData);
      console.log(this.data.auditData[0].narrativeSummary);
      console.log(this.auditData.value.auditDetails[0].interalAuditDate);
      var cntMandatoryReport = false;
      this.reportData.forEach((attachFileName) => {
        if (attachFileName.mandatory === 1 && attachFileName.fileName == '')
          cntMandatoryReport = true;
      });

      console.log(this.auditFormValueChangesFlag);
      if (this.halfScope != 1001) {
        if (this.data.auditData[0].auditTypeId != 1005) {
          let flag = true;
          var summary = summaryForm.value[0].auditSummary;
          
          /**Added by archana for jira-Id=>MOBILE-566 start */
          this.db
            .getCertificateDataSeqNo(auditDataForm.value[0].auditSeqNo)
            .then((certificateResponse) => {
              console.log('certificateResponse ', certificateResponse);
              if (!certificateResponse[0]) {
                this.toast.presentToast(
                  'Please Generate Certificate!',
                  'danger'
                );
                auditDataForm.patchValue([
                  {
                    auditStatus: 1001,
                  },
                ]);
                auditDataForm.value[0].auditStatus = 1001;
                console.log(auditDataForm.value[0].auditStatus);
              } else {
                if (summary == '') {
                  flag = false;
                  this.toast.presentToast('Please Select '+ this.auditType_Title +' Summary', 'danger');//added by lokesh for jira id-MOBILE-606
                  } else
                if (this.auditData.value.auditDetails[0].openMeetingDate == ''||this.auditData.value.auditDetails[0].openMeetingDate==null) {
                  this.toast.presentToast('Please select OpenMeeting Date', 'danger');
                  flag = false;
                } else if (
                  this.auditData.value.auditDetails[0].closeMeetingDate == ''||this.auditData.value.auditDetails[0].closeMeetingDate==null
                ) {
                  this.toast.presentToast(
                    'Please select CloseMeeting Date',
                    'danger'
                  );
                  flag = false;
                } else if (this.auditData.value.auditDetails[0].auditPlace == '') {
                  this.toast.presentToast('Please select '+ this.auditType_Title +' Place', 'danger');
                  flag = false;
                } else if (this.auditData.value.auditDetails[0].issueDate == '') {
                  this.toast.presentToast('Please select Issue Date', 'danger');
                  flag = false;
                } else if (this.auditData.value.auditDetails[0].auditDate == ''||this.auditData.value.auditDetails[0].auditDate==null) {
                  this.toast.presentToast('Please select '+ this.auditType_Title +' Date', 'danger');
                  flag = false;
                } else if (this.auditData.value.auditDetails[0].expiryDate == '') {
                  this.toast.presentToast('Please select Expiry Date', 'danger');
                  flag = false;
                } else if (
                  this.auditData.value.auditDetails[0].interalAuditDate == ''
                ) {
                  this.toast.presentToast(
                    'Please select Internal '+ this.auditType_Title +' Date',
                    'danger'
                  );
                  flag = false;
                } else if(this.auditData.value.narativeDetails[0].narativeSummary=='' || this.auditData.value.narativeDetails[0].narativeSummary=='null' || !this.auditData.value.narativeDetails[0].narativeSummary){    //added by @Ramya on 12-08-2022 for jira id - Mobile- 611
                  this.toast.presentToast('Please Enter Narrative Summary', 'danger');
      
                  flag = false;
                } else if (cntMandatoryReport) {
                  this.toast.presentToast(
                    'Please Attach Mandatory Reports',
                    'danger'
                  );
      
                  flag = false;
                } else if (this.auditFormValueChangesFlag) {
                  this.toast.presentToast(
                    'Please Save and Proceed for '+this.auditType_Title+' Status Change!',//modified by lokesh for jira_id(825)
                    'danger'
                  );
                  flag = false;
                } else if (
                  this.data.auditData[0].auditSubTypeID != 1001 &&
                  this.data.auditData[0].auditSubTypeID != 1003 &&
                  this.data.auditData[0].auditSubTypeID != 1005
                ) {
                  if (
                    !this.sspReviewDataIsPresent &&
                    (auditDataForm.value[0].auditTypeId == 1002 ||
                      auditDataForm.value[0].auditTypeId == 1003)
                  ) {
                    let msg =
                      auditDataForm.value[0].auditTypeId == 1002 ? 'SSP' : 'DMLC II';
                    this.toast.presentToast(
                      'Please Enter ' + msg + ' Details!',
                      'danger'
                    );
                    flag = false;
                  }
                }
                if (flag == false) {
                  auditDataForm.patchValue([
                    {
                      auditStatus: 1001,
                    },
                  ]);
                  auditDataForm.value[0].auditStatus = 1001;
                  console.log(auditDataForm.value[0].auditStatus);
                }
                this.db
                .getCurrentFindingDataList(this.data.auditData[0].auditSeqNo)
                .then((findingsList: any) => {
                  if (findingsList[0])
                    for (var i = 0; i < findingsList.length; i++) {
                      let FindingsBoo = false;
                      let findArray = findingsList[i].findingDtl;
                      console.log(findArray);
                      Object.keys(findArray).forEach(function (key) {
                        console.log(findArray[key]);
                        if (findArray[key].nextActionId == 1010)
                          FindingsBoo = true;
                      });
                       //condision changed by lokesh  for jira_id(633,668)
                       if (!FindingsBoo && flag == true) {
                        this.toast.presentToast(
                          'Please Close All Findings!',
                          'danger'
                        );
                        auditDataForm.patchValue([
                          {
                            auditStatus: 1001,
                          },
                        ]);
                        auditDataForm.value[0].auditStatus = 1001;
                        i = findingsList.length;
                      }
                    }
                });
      
              }
               /**Added by archana for jira-Id=>MOBILE-566 end*/
            });
          console.log(this.sspReviewDataIsPresent);
          console.log(auditDataForm.value[0].auditTypeId);
        } else {
          if (this.data.auditData[0].auditTypeId == 1005) {
            let flag = true;
            var summary = summaryForm.value[0].auditSummary;

            if (this.auditData.value.auditDetails[0].openMeetingDate == '') {
              this.toast.presentToast('Please select Receipt Date', 'danger');
              flag = false;
            } else if (this.auditData.value.auditDetails[0].auditPlace == '') {
              this.toast.presentToast('Please select Review Place', 'danger');
              flag = false;
            } else if (this.auditData.value.auditDetails[0].auditDate == ''||this.auditData.value.auditDetails[0].auditDate==null) {
              this.toast.presentToast('Please select Review Date', 'danger');
              flag = false;
            } else if (cntMandatoryReport) {
              this.toast.presentToast(
                'Please Attach Mandatory Reports',
                'danger'
              );

              flag = false;
            } else if (this.data.auditData[0].sspDetailsData.ltrStatus == 0) {
              if(this.data.auditData[0].auditSubTypeID==1001){
              this.toast.presentToast(
                'Please generate Review letter',
                'danger'
              );
              flag = false;
              }
              else{                                               //added by ramya for jira id-->mobile-536
                this.toast.presentToast(
                  'Please generate Amendement Review letter',
                  'danger'
                );
                flag = false;
              }
            } else if (summary == '') {        //added by  lokesh for jira_id(607,611,610)
              flag = false;
              this.toast.presentToast(
                'Please Select Review  Summary',
                'danger'
              );
            }
            else if (this.auditData.value.narativeDetails[0].narativeSummary=='' || this.auditData.value.narativeDetails[0].narativeSummary=='null' || !this.auditData.value.narativeDetails[0].narativeSummary) {//added by  lokesh for jira_id(607,611,610)
              this.toast.presentToast(
                'Please Enter Narrative Summary',
                'danger'
              );

              flag = false;
            } else if (this.auditFormValueChangesFlag) {
              this.toast.presentToast(
                'Please Save and Proceed for '+this.auditType_Title+' Status Change!',//modified by lokesh for jira_id(825)
                'danger'
              );
              flag = false;
            }else if(moment(auditDataForm.value[0].openMeetingDate).format('YYYY-MM-DD') != moment(this.data.auditData[0].openMeetingDate).format('YYYY-MM-DD'))    //added by @Ramya on 26-07-2022 for jira id - Mobile-585
            { console.log(moment(auditDataForm.value[0].openMeetingDate).format('YYYY-MM-DD'));
            console.log(moment(this.data.auditData[0].openMeetingDate).format('YYYY-MM-DD'));
            this.data.auditData[0].auditSubTypeID == 1001? this.toast.presentToast('Please Generate Receipt Letter','danger'): this.toast.presentToast('Please Generate Amendement Receipt Letter','danger')
              flag = false;
            }
            else if(moment(auditDataForm.value[0].auditDate).format('YYYY-MM-DD') !== this.data.auditData[0].auditDate || this.flag)           //modified by lokesh for jira_id(824)  //added by @Ramya on 26-07-2022 for jira id - Mobile-585
            {
              console.log(moment(auditDataForm.value[0].auditDate).format('YYYY-MM-DD'));
              console.log(this.data.auditData[0].auditDate);
              this.data.auditData[0].auditSubTypeID == 1001? this.toast.presentToast('Please Generate Review Letter','danger'):this.toast.presentToast('Please Generate Amendement Review Letter','danger')
              flag = false;
            }


            if (flag == false) {
              auditDataForm.patchValue([
                {
                  auditStatus: 1001,
                },
              ]);
              auditDataForm.value[0].auditStatus = 1001;
              console.log(auditDataForm.value[0].auditStatus);
            }
          }
        }
      } else {
        if (this.halfScope == 1001) {
          let flag = true;
          var summary = summaryForm.value[0].auditSummary;
          if (this.auditData.value.auditDetails[0].auditPlace == '') {
            this.toast.presentToast('Please select Review Place', 'danger');
            flag = false;
          } else if (
            this.auditData.value.auditDetails[0].openMeetingDate == ''||this.auditData.value.auditDetails[0].openMeetingDate==null
          ) {
            this.toast.presentToast('Please select OpenMeeting Date', 'danger');
            flag = false;
          } else if (
            this.auditData.value.auditDetails[0].closeMeetingDate == ''||this.auditData.value.auditDetails[0].closeMeetingDate==null
          ) {
            this.toast.presentToast(
              'Please select CloseMeeting Date',
              'danger'
            );
            flag = false;
          } else if (cntMandatoryReport) {
            this.toast.presentToast(
              'Please Attach Mandatory Reports',
              'danger'
            );

            flag = false;
          } else if (summary == '') {    //added by  lokesh for jira_id(607,611,610)
            flag = false;
            this.toast.presentToast('Please Select Review  Summary', 'danger');
          } else if (this.auditData.value.narativeDetails[0].narativeSummary=='' || this.auditData.value.narativeDetails[0].narativeSummary=='null' || !this.auditData.value.narativeDetails[0].narativeSummary) {//added by  lokesh for jira_id(607,611,610)
            this.toast.presentToast('Please Enter Narrative Summary', 'danger');

            flag = false;
          } else if (this.auditFormValueChangesFlag) {
            this.toast.presentToast(
              'Please Save and Proceed for '+this.auditType_Title+' Status Change!',//added by lokesh for jira_id(825)
              'danger'
            );
            flag = false;
          }

          if (flag == false) {
            auditDataForm.patchValue([
              {
                auditStatus: 1001,
              },
            ]);
            auditDataForm.value[0].auditStatus = 1001;
            console.log(auditDataForm.value[0].auditStatus);
          }
        }
      }
    }
    this.formValueChangeForStatus = true; // added by archana for jira id-Mobile-756,763
  }

  async setDropdowns() {
    this.auditSummaryArray = [];       // added by archana for jira ID-MOBILE-820
   await this.setDropdownsWithFindings();  // added by archana for jira ID-MOBILE-820
    //added by lokesh for jira_id(790) Start here
if (this.data.auditData[0].auditTypeId == 1001) {
  this.auditTypeTitle = 'ISM';
  this.auditType_Title='Audit';  
} else if (this.data.auditData[0].auditTypeId== 1002) {
  this.auditTypeTitle = 'ISPS';
  this.auditType_Title='Audit';  
} else if (this.data.auditData[0].auditTypeId== 1003) {
  this.auditTypeTitle = 'MLC';
  this.auditType_Title='Inspection';  
} else if (this.data.auditData[0].auditTypeId == 1004) {
  this.auditTypeTitle = 'SSP';
  this.auditType_Title='Review';  
} else if (this.data.auditData[0].auditTypeId== 1005) {
  this.auditTypeTitle = 'DMLC II';
  this.auditType_Title='Review';  
}//added by lokesh for jira_id(790) End here
    let auditTypeArrayTemp = this.data.masterData.auditType;
    let auditStatusArrayTemp = this.data.masterData.auditStatus;
    let certIssuedArrayTemp = this.data.masterData.certIssued;
    let auditSummaryArrayTemp = this.data.masterData.auditSummary;
    let ports = this.data.masterData.port;

    this.auditTypeArray = auditTypeArrayTemp.map((data) => {
      return data.auditSubtypeDesc;
    });
    this.auditStatusArray = auditStatusArrayTemp.map((data) => {
      return data.auditStatusId == 1001 || data.auditStatusId == 1002
        ? data
        : '';
    });
    console.log(this.auditStatusArray);
    this.certIssuedArray = certIssuedArrayTemp.map((data) => {
      return data.certificateIssueDesc;
    });

    auditSummaryArrayTemp.forEach((data) => {
      // console.log(this.auditSummaryArray);

      console.log(
        'data.audSummaryDesc :: ',
        data.audSummaryDesc.includes('auditSubType')
      );//modified by lokesh for jira_id(790)
      if (data.audSummaryDesc.includes('auditSubType')||data.audSummaryDesc.includes('Interim')) {
        let desc =this.auditData.get('auditDetails').value[0].auditSubType!='INTERIM'? data.audSummaryDesc.replace(/auditSubType/g, 'for ' + this.getAuditSubtype(this.auditSubTypeId)[0].auditSubtypeDesc +' '+ this.auditType_Title):data.audSummaryDesc.replace('(auditSubType)','');
        //audit_title added by lokesh for jira_id(790)
        let auditdesc=desc.replace(
          /Interim/g,
         'INTERIM'
        );
        this.auditSummaryArray.push({
          sumId: data.audSummaryId,
          sumDesc: auditdesc,
        });
      } else {
        this.auditSummaryArray.push({
          sumId: data.audSummaryId,
          sumDesc: data.audSummaryDesc,
        });
      }

      // this.auditSummaryArray.push({ 'sumId': data.audSummaryId, 'sumDesc': data.audSummaryDesc })
    });
    /**added by archana for jira ID-Mobile-833,834 start */
    let summaryForm = this.auditData.get('summaryDetails') as FormArray;
    if (
      this.data.auditData[0].auditSummaryId != '' &&
      this.data.auditData[0].auditSummaryId &&
      this.data.auditData[0].auditSummaryId != null
    ) {
      console.log('summaryForm.setValue...', this.data.auditData[0].auditSummaryId);
      console.log(this.getSummary(this.data.auditData[0].auditSummaryId));
      summaryForm.setValue([
        {
          auditSummary: this.getSummary(this.data.auditData[0].auditSummaryId)[0].sumDesc,
        },
      ]);
    }
   /**added by archana for jira ID-Mobile-833,834 end */
    ports.forEach((data) => {
      let portPlace = data.portName ? data.portName : '';
      portPlace = portPlace
        ? data.countryName
          ? portPlace + ', ' + data.countryName
          : portPlace
        : data.countryName
        ? data.countryName
        : '';
      this.portArray.push(portPlace);
    });

    // console.log(this.auditTypeArray);
    // console.log(this.auditStatusArray);
    // console.log(this.certIssuedArray);
    console.log(this.auditSummaryArray);
   
  }
/**added by archana for jira ID-MOBILE-820 start  */
  async setDropdownsWithFindings() {

    await this.db.getCurrentFindingDataList(this.data.auditData[0].auditSeqNo)
      .then((findingsList: any) => {
        console.log(findingsList);
        this.newFindingsList = findingsList;
      });

    var tempObsArray = this.newFindingsList ? this.newFindingsList : [];
    var tempObsArray1 = this.newFindingsList ? this.newFindingsList : [];

    tempObsArray = tempObsArray.filter(function (obj) {
      return obj.findingDtl.length > 0 && obj.findingDtl[0].categoryId == 1002 && obj.findingDtl[0].nextActionId;
    });

    tempObsArray1 = tempObsArray1.filter(function (obj) {
      return obj.findingDtl.length > 0 && (obj.findingDtl[0].categoryId == 1001 || obj.findingDtl[0].categoryId == 1003) && obj.findingDtl[0].nextActionId;
    });

    var summaryDateChangeNc = this.data.auditData[0].closeMeetingDate ? moment(this.data.auditData[0].closeMeetingDate).add(30, 'days').format('DD-MMM-YYYY') : 'DD/MMM/YYYY';
    var summaryDateChangeMNC = this.data.auditData[0].closeMeetingDate ? moment(this.data.auditData[0].closeMeetingDate).add(30, 'days').format('DD-MMM-YYYY') : 'DD/MMM/YYYY';
    var summaryDateChangeMNC2 = this.data.auditData[0].closeMeetingDate ? moment(this.data.auditData[0].closeMeetingDate).add(90, 'days').format('DD-MMM-YYYY') : 'DD/MMM/YYYY';

    let auditSummaryArray = this.data.masterData.auditSummary;

    var newVal1 = 'DD/MMM/YYYY';
    var newVal2 = 'DD/MMM/YYYY'
    if (tempObsArray.length > 0 && this.data.auditData[0].closeMeetingDate) {

      auditSummaryArray[1].audSummaryDesc = auditSummaryArray[1].audSummaryDesc.replace(newVal1, summaryDateChangeNc);

    } else {
      auditSummaryArray[1].audSummaryDesc = auditSummaryArray[1].audSummaryDesc.replace(summaryDateChangeNc, newVal1);
    }
    if (tempObsArray1.length > 0 && this.data.auditData[0].closeMeetingDate) {
      if (auditSummaryArray.length > 2) {
        auditSummaryArray[2].audSummaryDesc = auditSummaryArray[2].audSummaryDesc.replace(newVal1, summaryDateChangeMNC);
        var lastIndex = auditSummaryArray[2].audSummaryDesc.lastIndexOf(" ");
        auditSummaryArray[2].audSummaryDesc = auditSummaryArray[2].audSummaryDesc.substring(0, lastIndex);
        auditSummaryArray[2].audSummaryDesc = auditSummaryArray[2].audSummaryDesc.concat(' ', summaryDateChangeMNC2);
      }
    } else {
      if (auditSummaryArray[2]) {
        auditSummaryArray[2].audSummaryDesc = auditSummaryArray[2].audSummaryDesc.replace(summaryDateChangeMNC, newVal1);
        auditSummaryArray[2].audSummaryDesc = auditSummaryArray[2].audSummaryDesc.replace(summaryDateChangeMNC2, newVal1);
      }
    }

  }
 /**added by archana for jira ID-MOBILE-820 start  */
 getCurrentFindings() {
    this.db
      .getCurrentFindingDataList(this.data.auditData[0].auditSeqNo)
      .then((findingsList: any) => {
        this.newFindingsList = findingsList;
        this.newFindingsList.forEach((element) => {
          console.log(element);
        });
      });
  }

  getDMLCReviewNoteInMlc(dmlcSeqNo) {
    this.db.getCurrentFindingDataList(dmlcSeqNo).then((findingsList: any) => {
      console.log(findingsList);
    });
  }

  setAuditSummary(sumId) {
    if (this.newFindingsList.length == 0) {
      if (sumId == 1002) {
        this.toast.presentToast(
          this.auditType_Title +' summary is not matching with the '+ this.auditType_Title +' result',
          'danger'
        );
      } else if (sumId == 1003) {
        this.toast.presentToast(
          this.auditType_Title +' summary is not matching with the '+ this.auditType_Title +' result',
          'danger'
        );
      }
    }
  }

  get auditDetailss(): FormArray {
    return this.auditData.get('auditDetails') as FormArray;
  }

  // Date Utility Functions Starts ..................

  subtractDays(date, daysNumber) {
    // return (new Date(date.getFullYear(), date.getMonth(), date.getDate() + daysNumber).toISOString());
    return new Date(moment(date).subtract(daysNumber, 'days').toString());
  }

  addDays(date, daysNumber) {
    // return (new Date(date.getFullYear(), date.getMonth(), date.getDate() + daysNumber).toISOString());
    return new Date(moment(date).add(daysNumber, 'days').toString());
  }

  addMonth(date, monthsNumber) {
    console.log('date ::' + date, 'monthsNumber ::' + monthsNumber);
    console.log(
      new Date(
        date.getFullYear(),
        date.getMonth() + monthsNumber,
        date.getDate() - 1
      )
    );

    // return (new Date(date.getFullYear(), date.getMonth() + monthsNumber, date.getDate() - 1).toISOString());
    return new Date(moment(date).add(monthsNumber, 'months').toString());
  }

  addYear(date, yearsNumber) {
    console.log('date ::' + date, 'yearsNumber ::' + yearsNumber);
    // console.log('Method 1 :');
    console.log(
      new Date(
        date.getFullYear() + yearsNumber,
        date.getMonth(),
        date.getDate() - 1
      )
    );
    /* console.log('Method 2 :');
    console.log(new Date(date.setFullYear(date.getFullYear() + yearsNumber)));
    let newdate=new Date(date.setFullYear(date.getFullYear() + yearsNumber));
    console.log(new Date(newdate.getTime()+(-1*24*60*60*1000))) */

    // return (new Date(date.getFullYear() + yearsNumber, date.getMonth(), date.getDate()).toISOString());
    return new Date(moment(date).add(yearsNumber, 'years').toString());
  }

  subtractYear(date, yearsNumber) {
    console.log('date ::' + date, 'yearsNumber ::' + yearsNumber);
    return new Date(moment(date).subtract(yearsNumber, 'years').toString());
  }

  auditDateChange(event, index, audit) {
    console.log('audit date change', event, index);
    console.log(this.auditData.get('auditDetails').value);

    let auditDataForm;

    if (this.auditData.get('auditDetails').value[0].auditDate != '') {
      auditDataForm = this.auditData.get('auditDetails') as FormArray;
      this.auditFormValueChangesFlag = true;
    }

    //auditDataForm.at(index).get('')

    let auditData = this.auditData.get('auditDetails').value[0];
    let auditSubType = this.auditData.get('auditDetails').value[0].auditSubType;
    let auditDate = event.targetElement.value;
    let da = auditDate.toDateString;
    console.log('demo===> ::', audit.value.certificateIssued);
    console.log('demo2===>', this.appConstant.RENEWAL_ENDORSED2);
    console.log('auditDate ::', auditDate);
    console.log('auditDate ::', new Date(auditDate));
    console.log('auditSubType ::', auditSubType);

    this.maxIAD = new Date(auditDate);
    this.maxCloseMeetingDate = this.addDays(new Date(auditDate), 1);
    this.maxOpenMeetingDate = this.addDays(new Date(auditDate), 1);

    this.minInternalAuditDate = moment(this.maxIAD)
      .subtract(2, 'years')
      .format('YYYY-MM-DD');
    this.maxInternalAuditDate = moment(this.maxIAD).format('YYYY-MM-DD');

    console.log(
      this.data.auditData[0].auditDate +
        ', ' +
        this.maxOpenMeetingDate +
        ', ' +
        this.maxCloseMeetingDate
    );

    this.getPreviousAuditData().then((prevAuditData: any) => {
      if (
        prevAuditData &&
        prevAuditData.auditDate &&
        new Date(auditDate) < new Date(prevAuditData.auditDate)
      ) {
        this.toast.presentToast(
          ''+ this.auditType_Title +' Date Should be greater than Previous '+ this.auditType_Title +' Date ',
          'danger'
        );
        let auditDataForm = this.auditData.get('auditDetails') as FormArray;
        auditDataForm.at(index).get('auditDate').reset();
      }
    });

    switch (auditSubType) {
      case 'INTERIM':
        console.log('Inside 1001');
        auditDataForm.patchValue([
          {
            issueDate: this.addDays(new Date(auditDate), 0),
            expiryDate: this.subtractDays(
              new Date(this.addMonth(new Date(auditDate), 6)),
              1
            ),
          },
        ]);
        console.log(this.addMonth(new Date(auditDate), 6));

        break;

      case 'INITIAL':
        console.log('Inside 1002');
        auditDataForm.patchValue([
          {
            issueDate: this.addDays(new Date(auditDate), 0),
            expiryDate: this.subtractDays(
              new Date(this.addYear(new Date(auditDate), 5)),
              1
            ),
          },
        ]);
        console.log(this.addYear(new Date(auditDate), 5));

        break;

      case 'INTERMEDIATE':
        console.log('Inside 1003');

        this.getPreviousInitialRenewalData().then((initialRenewalData: any) => {
          if (
            initialRenewalData != undefined &&
            initialRenewalData.length > 0
          ) {
            this.checkDirInterOrAddtnl().then((directInterAdd: any) => {
              if (!directInterAdd) {
                if (
                  initialRenewalData[0].auditDate &&
                  new Date(auditDate) <
                    this.addYear(new Date(initialRenewalData[0].auditDate), 1)
                ) {
                  this.toast.presentToast(
                    this.auditType_Title+' Date Should be greater than 1st Anniversary of Previous '+this.auditType_Title+' Date',
                    'danger'
                  );
                  let auditDataForm = this.auditData.get(
                    'auditDetails'
                  ) as FormArray;
                  auditDataForm.at(index).get('auditDate').reset();
                }
              }
            });
          }
        });

        break;

      case 'RENEWAL':
        console.log('Inside 1005');
        auditDataForm.patchValue([
          {
            issueDate: this.addDays(new Date(auditDate), 0),
            expiryDate: this.subtractDays(
              new Date(this.addYear(new Date(auditDate), 5)),
              1
            ),
          },
        ]);
        console.log(this.addYear(new Date(auditDate), 5));
        break;
    }

    console.log(this.auditData.get('auditDetails').value[0].issueDate);
    console.log(this.auditData.get('auditDetails').value[0].auditSubType);

    if (
      new Date(audit.value.auditDate) < new Date(audit.value.openMeetingDate) ||
      new Date(audit.value.auditDate) < new Date(audit.value.closeMeetingDate)
    ) {
      console.log('true');

      this.toast.presentToast(
        this.auditType_Title +' Date Should be greater than OpenMeeting Date and CloseMeeting Date ',
        'danger'
      );
      let auditDataForm = this.auditData.get('auditDetails') as FormArray;
      auditDataForm.at(index).get('auditDate').reset();
    }
  }

  internalAuditDateChange(event, index, audit) {
    if (this.auditData.get('auditDetails').value[0].interalAuditDate != '') {
      this.auditFormValueChangesFlag = true;
    }
  }

  // to get previous Audit Data
  getPreviousAuditData() {
    console.log(
      this.data.vesselData.vesselImoNo,
      ', ',
      this.data.auditData[0].auditStatusId,
      ', ',
      this.data.auditData[0].auditTypeId
    );

    return new Promise<Object>((resolve, reject) => {
      this.db
        .getPreviousAuditdata(
          this.data.vesselData.vesselImoNo,
          this.data.auditData[0].auditStatusId,
          this.data.auditData[0].auditTypeId
        )
        .then((prevAuditData) => {
          console.log(prevAuditData);
          resolve(prevAuditData[0]);
        });
    });
  }

  // to get Previous Initial or Renewal AuditData
  getPreviousInitialRenewalData() {
    return new Promise<Object>((resolve, reject) => {
      this.db
        .getPreviousInitialRenewalData(
          this.data.auditData[0].auditTypeId,
          this.data.vesselData.vesselImoNo,
          this.data.auditData[0].auditSeqNo
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
        if (initialRenewalData != undefined && initialRenewalData.length > 0) {
          let countIni = 0;
          let auditData = this.auditData.get('auditDetails').value[0];

          initialRenewalData.forEach(function (a) {
            if (
              a.auditSubTypeId == 1002 ||
              (a.auditSubTypeId == 1004 && a.certIssueId == 1002) ||
              a.auditSubTypeId == 1001
            )
              countIni++;
          });

          if (
            (countIni == 0 && auditData.auditSubTypeId == 1003) ||
            auditData.auditSubTypeId == 1005
          ) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
        else if(initialRenewalData.length==0){                                      //added by @ramya on 14-06-22 for jira id - mobile-560 
          let auditData = this.auditData.get('auditDetails').value[0];
          if(auditData.auditSubType == 'INTERMEDIATE' || auditData.auditSubType == 'ADDITIONAL')
            this.dirInterOrAdd=true;
        }
      });
    });
  }

  omdChange(event, index, audit) {
    console.log(event.targetElement.value, index);
    // console.log(moment(new Date(audit.value.auditDate)).diff(new Date(audit.value.openMeetingDate), 'hours') > 1)
    /**added by archana for jira ID-MOBILE-820  start*/
   var eventDate = moment(event.targetElement.value).format('DD-MMM-YYYY');               //added by archana for jira ID-MOBILE-838
    if(this.newFindingsList[0] && this.newFindingsList[0].findingDtl[0].statusDate){      //added by archana for jira ID-MOBILE-838
    var FindstatusDate = moment(this.newFindingsList[0].findingDtl[0].statusDate).format('DD-MMM-YYYY');
    }
    if (this.newFindingsList.length > 0) {
      if (eventDate > FindstatusDate) {               //added by archana for jira ID-MOBILE-838
        this.toast.presentToast(
          'Finding status Date should be between the opening meeting and closing meeting date',
          'danger'
        );
        let auditDataForm = this.auditData.get('auditDetails') as FormArray;
        auditDataForm.patchValue([
          {
            openMeetingDate: this.data.auditData[0].openMeetingDate,
          },
        ]);
        auditDataForm.value[0].openMeetingDate = this.data.auditData[0].openMeetingDate;
      }
    }
        /**added by archana for jira ID-MOBILE-820 end*/

    if (this.auditData.get('auditDetails').value[0].closeMeetingDate) {
      this.auditFormValueChangesFlag = true;

      if (
        moment(new Date(audit.value.closeMeetingDate)).diff(
          new Date(audit.value.openMeetingDate),
          'minutes'
        ) < 1
      ) {
        this.toast.presentToast(
          'Open Meeting Date Should Less than or equal to Close Meeting Date ',
          'danger'
        );
        let auditDataForm = this.auditData.get('auditDetails') as FormArray;
        auditDataForm.at(index).get('openMeetingDate').reset();
        auditDataForm.at(index).get('closeMeetingDate').reset();
        this.omdFlag = true;
      }
    }
    this.omdFlag = false;
    // console.log(moment(new Date(audit.value.closeMeetingDate)).diff(new Date(audit.value.openMeetingDate), 'hours') < 1)

    // MOBILE-6 - OpenMeetingDate_Validation_with_auditDate
    if (
      audit.value.auditDate &&
      moment(audit.value.openMeetingDate).format('YYYY-MM-DD') >
        moment(audit.value.auditDate).format('YYYY-MM-DD')
    ) {
      this.toast.presentToast(
        'Open Meeting Date Should Less than or equal to '+ this.auditType_Title +' Date ',
        'danger'
      );
      let auditDataForm = this.auditData.get('auditDetails') as FormArray;
      auditDataForm.at(index).get('openMeetingDate').reset();
      this.omdFlag = true;
    }

    /* if (
      audit.value.auditDate &&
      moment(new Date(audit.value.auditDate)).diff(
        new Date(audit.value.openMeetingDate),
        'hours'
      ) < 1
    ) {
      this.toast.presentToast(
        'Open Meeting Date Should Less than or equal to Audit Date ',
        'danger'
      );
      let auditDataForm = this.auditData.get('auditDetails') as FormArray;
      auditDataForm.at(index).get('openMeetingDate').reset();
      // auditDataForm.at(index).get('closeMeetingDate').reset();
    } */

    // compaing openMeetingDate with previous auditDate
    this.getPreviousAuditData().then((prevAuditData: any) => {
      if (
        prevAuditData &&
        prevAuditData.auditDate &&
        moment(this.addDays(new Date(prevAuditData.auditDate), 1)).diff(
          new Date(audit.value.openMeetingDate),
          'hours'
        ) > 1
      ) {
        this.toast.presentToast(
          'Open Meeting Date Should Greater than Previous '+ this.auditType_Title +' Date ',
          'danger'
        );
        let auditDataForm = this.auditData.get('auditDetails') as FormArray;
        auditDataForm.at(index).get('openMeetingDate').reset();
      }

      // followup intermediate - validate with 1st anniversary date of previous audit date
      this.checkDirInterOrAddtnl().then((directInterAdd: any) => {
        if (
          this.auditData.get('auditDetails').value[0].auditSubType ===
            'INTERMEDIATE' &&
          !directInterAdd
        ) {
          if (
            prevAuditData &&
            prevAuditData.auditDate &&
            moment(this.addYear(new Date(prevAuditData.auditDate), 1)).diff(
              new Date(audit.value.openMeetingDate),
              'hours'
            ) > 1
          ) {
            this.toast.presentToast(
              'Open Meeting Date Should be Greater than 1st Anniversary of Previous '+this.auditType_Title+' Date',
              'danger'
            );
            let auditDataForm = this.auditData.get('auditDetails') as FormArray;
            auditDataForm.at(index).get('openMeetingDate').reset();
          }
        }
      });
    });
  }

  cmdChange(event, index, audit) {
    console.log('CMD :: ', event.targetElement.value);
    // console.log(audit.value);
    /**added by archana for jira ID-MOBILE-820  start*/
    var eventDate = moment(event.targetElement.value).format('DD-MMM-YYYY');               //added by archana for jira ID-MOBILE-838
    if (this.newFindingsList[0] && this.newFindingsList[0].findingDtl[0].statusDate) {      //added by archana for jira ID-MOBILE-838
      var FindstatusDate = moment(this.newFindingsList[0].findingDtl[0].statusDate).format('DD-MMM-YYYY');
    }
    if (this.newFindingsList.length > 0) {
      if (eventDate < FindstatusDate) {                                   //added by archana for jira ID-MOBILE-838
        this.toast.presentToast(
          'Finding status Date should be between the opening meeting and closing meeting date ',
          'danger'
        );
        let auditDataForm = this.auditData.get('auditDetails') as FormArray;
        auditDataForm.patchValue([
          {
            closeMeetingDate: this.data.auditData[0].closeMeetingDate,
          },
        ]);
        auditDataForm.value[0].closeMeetingDate = this.data.auditData[0].closeMeetingDate;
      }
    }
        /**added by archana for jira ID-MOBILE-820 end*/

    if (this.auditData.get('auditDetails').value[0].closeMeetingDate != '') {
      this.auditFormValueChangesFlag = true;
      this.maxOpenMeetingDate = audit.value.closeMeetingDate;
    }
    // console.log(this.data.auditData[0].auditDate + ', ' + this.maxOpenMeetingDate + ', ' + this.maxCloseMeetingDate);
    // console.log(moment(new Date(audit.value.closeMeetingDate)).diff(new Date(audit.value.openMeetingDate), 'hours'));

    // MOBILE-6 - CloseMeetingDate_Validation_with_auditDate
    if (
      audit.value.auditDate &&
      moment(audit.value.closeMeetingDate).format('YYYY-MM-DD') >
        moment(audit.value.auditDate).format('YYYY-MM-DD')
    ) {
      this.toast.presentToast(
        'Closing Meeting Date Should Less than or equal to '+ this.auditType_Title +' Date ',
        'danger'
      );
      let auditDataForm = this.auditData.get('auditDetails') as FormArray;
      auditDataForm.at(index).get('closeMeetingDate').reset();
    }/**added by lokesh for jira_id(743) START HERE */ 
    else if(this.findingList.length > 0){
          if( moment(audit.value.closeMeetingDate).format('YYYY-MM-DD') <  moment(this.findingList[0].findingDtl[0].statusDate).format('YYYY-MM-DD')){
            this.toast.presentToast(
              'Finding status Date should be between the opening Meeting and Closing Meeting Date',
              'danger'
            );
            let auditDataForm = this.auditData.get('auditDetails') as FormArray;
      auditDataForm.at(index).get('closeMeetingDate').reset();
          }/**added by lokesh for jira_id(743) end here */ 
    }

    /* if (
      moment(new Date(audit.value.auditDate)).diff(
        new Date(audit.value.closeMeetingDate),
        'hours'
      ) < 1
    ) {
      this.toast.presentToast(
        'Closing Meeting Date Should Less than or equal to Audit Date ',
        'danger'
      );
      let auditDataForm = this.auditData.get('auditDetails') as FormArray;
      // auditDataForm.at(index).get('openMeetingDate').reset();
      auditDataForm.at(index).get('closeMeetingDate').reset();
    } */
/**added by lokesh for jira_id(743)*/ 
    else if (
      moment(new Date(audit.value.closeMeetingDate)).diff(
        new Date(audit.value.openMeetingDate),
        'hours'
      ) < 1
    ) {
      // console.log(moment(new Date(audit.value.closeMeetingDate)).diff(new Date(audit.value.openMeetingDate), 'hours'))
      this.toast.presentToast(
        'Closing meeting date has to be atleast an hour greater than opening meeting date, please select accordingly', //Added by sudharsan for JIRA ID-= 559
        'danger'
      );
      let auditDataForm = this.auditData.get('auditDetails') as FormArray;
      auditDataForm.at(index).get('closeMeetingDate').reset();
    }

    // comparing closeMeetingDate with previous auditDate
    this.getPreviousAuditData().then((prevAuditData: any) => {
      if (
        prevAuditData &&
        moment(this.addDays(new Date(prevAuditData.auditDate), 1)).diff(
          new Date(audit.value.closeMeetingDate),
          'hours'
        ) > 1
      ) {
        this.toast.presentToast(
          'Closing Meeting Date Should Greater than Previous '+ this.auditType_Title +' Date ',
          'danger'
        );
        let auditDataForm = this.auditData.get('auditDetails') as FormArray;
        auditDataForm.at(index).get('closeMeetingDate').reset();
      }

      // followup intermediate - validate with 1st anniversary date of previous audit date
      this.checkDirInterOrAddtnl().then((directInterAdd: any) => {
        if (
          this.auditData.get('auditDetails').value[0].auditSubType ===
            'INTERMEDIATE' &&
          !directInterAdd
        ) {
          if (
            prevAuditData &&
            prevAuditData.auditDate &&
            moment(this.addYear(new Date(prevAuditData.auditDate), 1)).diff(
              new Date(audit.value.openMeetingDate),
              'hours'
            ) > 1
          ) {
            this.toast.presentToast(
              'Closing Meeting Date Should be Greater than 1st Anniversary of Previous '+this.auditType_Title+' Date',
              'danger'
            );
            let auditDataForm = this.auditData.get('auditDetails') as FormArray;
            auditDataForm.at(index).get('closeMeetingDate').reset();
          }
        }
      });
    });
  }

  dmlcIssueDateChange(event, index, audit) {
    console.log('DMLC II RD :: ', event.targetElement.value);
    console.log(moment(audit.value.interalAuditDate).format('DD-MMM-YYYY'));

    console.log(audit.value.auditDate);
    console.log(audit.value.openMeetingDate);

    /*if (audit.value.interalAuditDate >= audit.value.openMeetingDate) {
      this.toast.presentToast("Issue Date Should Less than or equal to Reciept Date ", "danger");
      let auditDataForm = this.auditData.get('auditDetails') as FormArray;
      auditDataForm.at(index).get('interalAuditDate').reset();

    }*/

    // Issue date <= Receipt date <= Review date
  }

  dmlc2IssueDateChange(event, index, audit) {
    console.log('DMLC II RD :: ', event.targetElement.value);
    console.log(moment(audit.value.closeMeetingDate).format('DD-MMM-YYYY'));
    console.log(moment(audit.value.openMeetingDate).format('DD-MMM-YYYY'));
    if (audit.value.openMeetingDate) {
      if (
        moment(audit.value.closeMeetingDate).format('YYYY-MM-DD') >
        moment(audit.value.openMeetingDate).format('YYYY-MM-DD')
      ) {
        this.toast.presentToast(
          'DMLC II Issue Date Should Less than or equal to Reciept Date ',
          'danger'
        );
        let auditDataForm = this.auditData.get('auditDetails') as FormArray;
        auditDataForm.at(index).get('closeMeetingDate').reset();
      }
    }
  }
  dmlcReviewDateChange(event, index, audit) {
    console.log('DMLC II RD :: ', event.targetElement.value);
    console.log(moment(audit.value.auditDate).format('DD-MMM-YYYY'));
   //added by lokesh for jira_id(824) 
     if(moment(audit.value.auditDate).format('DD-MMM-YYYY') !== moment(this.data.auditData[0].auditDate).format('DD-MMM-YYYY'))  {
       this.flag=true;
       this.auditFormValueChangesFlag=true//added by lokesh for jira_id(854)
     }     
    if (audit.value.closeMeetingDate) {
      if (
        moment(audit.value.auditDate).format('YYYY-MM-DD') <
        moment(audit.value.closeMeetingDate).format('YYYY-MM-DD')
      ) {
        console.log('true');
        this.toast.presentToast(
          'Review Date Should be greater than DMLC II Issue Date and Reciept Date ',
          'danger'
        );
        let auditDataForm = this.auditData.get('auditDetails') as FormArray;
        auditDataForm.at(index).get('auditDate').reset();
      }
    }
    if (audit.value.openMeetingDate) {
      if (
        moment(audit.value.auditDate).format('YYYY-MM-DD') <
        moment(audit.value.openMeetingDate).format('YYYY-MM-DD')
      ) {
        console.log('true');
        this.toast.presentToast(
          'Review Date Should be greater than DMLC II Issue Date and Reciept Date ',
          'danger'
        );
        let auditDataForm = this.auditData.get('auditDetails') as FormArray;
        auditDataForm.at(index).get('auditDate').reset();
      }
    }
  } // Issue date <= Receipt date <= Review date
  dmlcReceiptDateChange(event, index, audit) {
    console.log('DMLC II RD :: ', event.targetElement.value);
    console.log(moment(audit.value.openMeetingDate).format('DD-MMM-YYYY'));
    this.auditFormValueChangesFlag=true//added by lokesh for jira_id(906)
    console.log(audit.value.interalAuditDate);
    console.log(audit.value.auditDate);
    console.log(moment(audit.value.openMeetingDate).format('DD-MMM-YYYY'));
    console.log(moment(audit.value.closeMeetingDate).format('DD-MMM-YYYY'));
    if (audit.value.auditDate) {
      if (
        moment(audit.value.openMeetingDate).format('YYYY-MM-DD') >
        moment(audit.value.auditDate).format('YYYY-MM-DD')
      ) {
        console.log('true');

        this.toast.presentToast(
          'Reciept Date Should be greater than or equal to DMLC II Issue Date and Less than or equal to Review Date',
          'danger'
        );
        let auditDataForm = this.auditData.get('auditDetails') as FormArray;
        auditDataForm.at(index).get('openMeetingDate').reset();
      }
    }

    if (audit.value.closeMeetingDate) {
      if (
        moment(audit.value.openMeetingDate).format('YYYY-MM-DD') <
        moment(audit.value.closeMeetingDate).format('YYYY-MM-DD')
      ) {
        console.log('true');

        this.toast.presentToast(
          'Reciept Date Should be greater than or equal to DMLC II Issue Date and Less than or equal to Review Date',
          'danger'
        );
        let auditDataForm = this.auditData.get('auditDetails') as FormArray;
        auditDataForm.at(index).get('openMeetingDate').reset();
      }
    }
  }

  issueDateChange(event, index, audit) {
    console.log('issueDateChange...');
    this.auditFormValueChangesFlag = true;   // added by archana for jira Id-MOBILE-712
    let auditDataForm = this.auditData.get('auditDetails') as FormArray;
    let issueDate = this.subtractDays(new Date(event.targetElement.value), 1);

    auditDataForm.patchValue([
      {
        expiryDate: this.addYear(new Date(issueDate), 5),
      },
    ]);
  }

  // Date Utility Functions Ends ..................

  auditSummaryChange(event, index, changeValue) {
    if (changeValue == 'direct') {
      console.log('auditSummaryChange');
      console.log(event);
      this.auditFormValueChangesFlag = true;
    }
  }

  getValidity(i) {
    return (<FormArray>this.auditData.get('auditDetails')).controls[i].invalid;
  }

  deleteUnusedAttachments(auditSeqNumber, auditType) {
    this.attachmentFileNamesToDeleteFromFS.forEach((delArrayFileName, z) => {
      //ignore if same filename present in final reportData
      this.reportData.forEach((attachFileName) => {
        delArrayFileName === attachFileName
          ? this.attachmentFileNamesToDeleteFromFS.splice(z, 1)
          : '';
      });
    });
    //remove duplicates and empty strings
    this.attachmentFileNamesToDeleteFromFS =
      this.attachmentFileNamesToDeleteFromFS.filter(
        (item, index, inputArray) => {
          return inputArray.indexOf(item) == index && item != '';
        }
      );
    console.log(
      'final attachmentFileNamesToDeleteFromFS',
      this.attachmentFileNamesToDeleteFromFS
    );

    this.attachmentFileNamesToDeleteFromFS.forEach((a) => {
      this.fileManager
        .deleteInvalidAttachmentFiles(auditType, auditSeqNumber, a)
        .then(() => {
          console.log('file ' + a + ' deleted');
        });
    });
  }
  async cancelClick() {
   //added by lokesh for jira_id(802,804) START HERE
    if(!this.auditFormValueChangesFlag){
      this.router.navigateByUrl('/perform')
      }
      else{
       const alert = this.alertController.create({
         mode: 'ios',
         header:'Mobile Application',
         message: 'Do you want to save changes before proceeding',
         cssClass: 'alertCancel',
         buttons: [
           {
             text: 'Yes',
             cssClass: 'alertButton', 
             handler: () => {
               this.router.navigateByUrl('/perform')
               var toastermsg =  'Data Saved Successfully...';//modified by lokesh for jira_id(822)
                     this.save(this.auditData.value, 1, toastermsg);
             },
           },
           {
             text: 'No',
             cssClass: 'alertButton', 
             handler: () => {
              this.router.navigateByUrl('/perform')
               console.log('Delete Rejected');
             },
           },
         ],
       });
       (await alert).present();
      }
      //added by lokesh for jira_id(802) end HERE
  }
  // Save Functionality

  saveDataToDB(auditObj, auditSeqNumber, toastermsg) {
    this.db.saveAuditDetailsData(auditObj).then((res) => {
      // this.certDtlInputData = auditObj;
      this.db.getAuditdata(auditSeqNumber).then((auditData) => {
        this.data.auditData = auditData;
        console.log(auditData);
        console.log('Saved Successfully....', res);
        this.summaryLetterHistory();    //added by archana for jira ID-MOBILE-852

        // MOBILE-193 => changed issueDate comparison format to (YYYY-MM-DD)
        this.db
          .getCertificateDataSeqNo(auditSeqNumber)
          .then((certificateResponse) => {
            console.log('certificateResponse ', certificateResponse);
            if (certificateResponse[0]) {
              if (
                decodeURIComponent(
                  window.atob(certificateResponse[0].issuePlace)
                ) ==
                  decodeURIComponent(
                    window.atob(auditObj.auditDetails[0].auditPlace)
                  ) &&
                certificateResponse[0].auditDate ==
                  auditObj.auditDetails[0].auditDate &&
                moment(certificateResponse[0].issueDate).format('YYYY-MM-DD') ==
                  moment(auditObj.auditDetails[0].issueDate).format(
                    'YYYY-MM-DD'
                  ) &&
                moment(certificateResponse[0].expiryDate).format(
                  'YYYY-MM-DD'
                ) ==
                  moment(auditObj.auditDetails[0].expiryDate).format(
                    'YYYY-MM-DD'
                  )
              ) {
                this.toast.presentToast(
                  'Data Saved Successfully...',
                  'success'
                );
              } else {
                this.toast.presentToast(
                  'Please generate the certificate once again because '+ this.auditType_Title +' data mismatching',
                  'danger'
                );
              }
            } else if (toastermsg == undefined) {
              this.toast.presentToast('Data Saved Successfully...', 'success');
            } else {
              /** added by archana for jira-Id,MOBILE-438 start */
              if(toastermsg == 'Attachment Removed succesfully' || toastermsg == 'Removed Other Attachment succesfully'){
                this.toast.presentToast(toastermsg, 'success');//modified by lokesh mobile jira_id(625)
             }else{
              this.toast.presentToast(toastermsg, 'success');
             }
             /** added by archana for jira-Id,MOBILE-438 start */
            }
          });
      });
    });
  }

  save(data, dmlc, toastermsg) {
    console.log(this.auditData);
    if(data.auditDetails[0].interalAuditDate)               //added by ramya for jira id-->mobile-539
    {
      if(data.auditDetails[0].interalAuditDate=="N.A" || data.auditDetails[0].interalAuditDate=="Invalid date" )
      {
        data.auditDetails[0].interalAuditDate='';
      }
    }

    if (this.auditData.value.auditDetails[0].auditTypeId == 1002) {
      this.sspAuditornameChange =
        this.auditData.value.auditDetails[0].sspDetails[0].sspAuditorName;
      var matches = this.sspAuditornameChange.match(/[^A-Za-z\s]/g);
    }
    if (matches == null) {
      console.log('savessss', data);
      this.auditFormValueChangesFlag = false;
      this.formValueChangeForStatus = false;   // added by archana for jira id-Mobile-756,763
      console.log('this.auditData.valid', this.auditData.valid);

      let auditType = this.getAuditType(data.auditDetails[0].auditTypeId)[0]
        .auditTypeDesc;
      let auditSeqNumber = data.auditDetails[0].auditSeqNo;
      this.deleteUnusedAttachments(auditSeqNumber, auditType);
      //Deep Copy of Form submitted data .

      // MOBILE-236 => on change of audit date issue and expiry date reducing one day (added date format using moment), were the same is updating to central
      data.auditDetails[0].issueDate =
        data && data.auditDetails[0] && data.auditDetails[0].issueDate
          ? moment(data.auditDetails[0].issueDate).format('YYYY-MM-DD')
          : '';
      data.auditDetails[0].expiryDate =
        data && data.auditDetails[0] && data.auditDetails[0].expiryDate
          ? moment(data.auditDetails[0].expiryDate).format('YYYY-MM-DD')
          : '';

      console.log('savessss', data);
      let auditDataForm = this.auditData.get('auditDetails') as FormArray;
      let auditObj = JSON.parse(JSON.stringify(data));
      auditObj.auditDetails[0].auditStatus = auditDataForm.value[0].auditStatus;
      auditObj.auditDetails[0].auditSubType =
        this.data.auditData[0].auditSubTypeID;

      auditObj.auditDetails[0].sspDetails[0].officialNo =
        this.data.auditData[0].sspDetailsData.officialNo;
      auditObj.auditDetails[0].sspDetails[0].vesselCompanyAddress =
        this.data.auditData[0].sspDetailsData.vesselCompanyAddress;
      auditObj.auditDetails[0].sspDetails[0].vesselCompanyName =
        this.data.auditData[0].sspDetailsData.vesselCompanyName;
      if (this.data.auditData[0].auditTypeId == 1005) {
        auditObj.auditDetails[0].sspDetails[0].ltrStatus = this.data.auditData[0].sspDetailsData.ltrStatus;
        auditObj.auditDetails[0].sspDetails[0].sspRevisionNo =
          auditObj.auditDetails[0].sspRevisionNo;
      }
      console.log(auditObj.auditDetails[0]);
      console.log(this.data.auditData[0]);

      if (
        auditObj.auditDetails[0].certificateIssued
          ? isNaN(Number(auditObj.auditDetails[0].certificateIssued.toString()))
          : ''
      )
        auditObj.auditDetails[0].certificateIssued =
          this.getCertificateIssuedesc(
            auditObj.auditDetails[0].certificateIssued
          )[0].certificateIssueId;

      //auditObj.auditDetails[0].certificateIssueId = this.getCertificateIssuedesc(auditObj.auditDetails[0].certificateIssueId)[0].certificateIssueId;
      this.uploadDocument(
        this.reportFileArray,
        auditObj,
        auditType,
        auditSeqNumber,
        this.filesys
      );
      console.log(auditObj.auditDetails[0]);
      console.log(this.reportData);
      console.log(this.attachmentFileNamesToDeleteFromFS);

      let sumId = this.auditSummaryArray.filter(
        (data) => data.sumDesc === auditObj.summaryDetails[0].auditSummary
      );
      // console.log(sumId[0].sumId)
      // let sumId = auditObj.summaryDetails[0].auditSummary != 'undefined' ? this.auditSummaryArray.filter(data => data.sumDesc === auditObj.summaryDetails[0].auditSummary) : '';
      if (typeof auditObj.summaryDetails[0].auditSummary === 'string') {
        console.log(sumId);
        auditObj.summaryDetails[0].auditSummary =
          sumId && sumId.length != 0
            ? sumId[0].sumId
              ? sumId[0].sumId
              : ''
            : '';
      }
      auditObj.reportData = this.reportData;
      this.data.auditReportData = this.reportData;

      auditObj.auditDetails[0].auditPlace =
        auditObj.auditDetails[0].auditPlace != ''
          ? encodeURIComp(auditObj.auditDetails[0].auditPlace)
          : '';
      auditObj.narativeDetails[0].narativeSummary =
        auditObj.narativeDetails[0].narativeSummary != ''
          ? encodeURIComp(auditObj.narativeDetails[0].narativeSummary)
          : '';
      //auditObj.auditDetails[0].interalAuditDate = auditObj.auditDetails[0].interalAuditDate ? moment(auditObj.auditDetails[0].interalAuditDate).format('DD-MMM-YYYY') : '';

      auditObj.auditDetails[0].closeMeetingDate = auditObj.auditDetails[0]
        .closeMeetingDate
        ? moment(auditObj.auditDetails[0].closeMeetingDate).format(
            'YYYY-MM-DD HH:mm'
          )
        : '';
      auditObj.auditDetails[0].interalAuditDate = auditObj.auditDetails[0]
        .interalAuditDate
        ? moment(auditObj.auditDetails[0].interalAuditDate).format(
            'DD-MMM-YYYY'
          )
        : '';

      if (auditObj.auditDetails[0].auditTypeId == 1005) {
        // MOBILE-287 => DMLC II issue date and the receipt date is displaying one date lesser than the date we entered
        auditObj.auditDetails[0].openMeetingDate = data.auditDetails[0]
          .openMeetingDate
          ? moment(data.auditDetails[0].openMeetingDate).format(
              'YYYY-MM-DD HH:mm'
            )
          : '';

        auditObj.auditDetails[0].auditDate = data.auditDetails[0].auditDate
          ? moment(data.auditDetails[0].auditDate).format('YYYY-MM-DD')
          : '';
      } else {
        auditObj.auditDetails[0].openMeetingDate = auditObj.auditDetails[0]
          .openMeetingDate
          ? moment(auditObj.auditDetails[0].openMeetingDate).format(
              'YYYY-MM-DD HH:mm'
            )
          : '';
        auditObj.auditDetails[0].auditDate = auditObj.auditDetails[0].auditDate
          ? moment(auditObj.auditDetails[0].auditDate).format('YYYY-MM-DD')
          : '';
      }

      // MOBILE-267 => for direct inter/additional on save -> The issue and the expiry date in displaying and 01-jan-1970
      if (
        auditObj.auditDetails[0].auditSubType ==
          this.appConstant.INTERMEDIATE_SUB_TYPE_ID ||
        auditObj.auditDetails[0].auditSubType ==
          this.appConstant.ADDITIONAL_SUB_TYPE_ID
      ) {
        console.log(auditObj.auditDetails[0].issueDate);
        console.log(auditObj.auditDetails[0].issueDate === null);
        console.log(auditObj.auditDetails[0].issueDate === '');

        auditObj.auditDetails[0].issueDate =
          auditObj.auditDetails[0].issueDate === null ||
          auditObj.auditDetails[0].issueDate === ''
            ? ''
            : moment(auditObj.auditDetails[0].issueDate).format('YYYY-MM-DD');
        auditObj.auditDetails[0].expiryDate =
          auditObj.auditDetails[0].expiryDate === null ||
          auditObj.auditDetails[0].expiryDate === ''
            ? ''
            : moment(auditObj.auditDetails[0].expiryDate).format('YYYY-MM-DD');
      }

      console.log(auditObj);
      this.sspDataSource=this.sspDataToShow
      /**Added By sudharsan for JIRA-ID -- 446,447,448,449 */
      this.db.checkExistsData().then((auditsequence_list) => {
          console.log('auditsequence_list', auditsequence_list);
          let auditsequence_list_json = JSON.parse(JSON.stringify(auditsequence_list));
          console.log('auditsequence_list_json', auditsequence_list_json.status);
          auditsequence_list_json.status.forEach((sequence_No)=>{
              this.db.getAuditauditorDetails(sequence_No).then((auditors_dtl)=>{
                let auditors = JSON.parse(JSON.stringify(auditors_dtl));
                /**Started here   Added by sudharsan on 7-4-2022 for Jira ID MOBILE-391 & Mobile-392*/
                this.sspDataSource.forEach(function(dynamic_update){
                  if(dynamic_update.reviewtype=="INITIAL" && auditObj.auditDetails[0].auditSubType == 1001){
                    console.log("inside initial");
                    dynamic_update.location= decodeURIComponent(window.atob(auditObj.auditDetails[0].auditPlace));
                    dynamic_update.reviewdate= auditObj.auditDetails[0].auditDate ? moment(auditObj.auditDetails[0].auditDate).format('DD-MMM-YYYY') : "";
                    dynamic_update.dmlcissuedate= auditObj.auditDetails[0].closeMeetingDate ? moment(auditObj.auditDetails[0].closeMeetingDate).format('DD-MMM-YYYY') : "";   
                    dynamic_update.inspector=auditors[0].AUDITOR_NAME;
                  }
                  if(dynamic_update.reviewtype=="AMENDMENT" && auditObj.auditDetails[0].auditSubType == 1002 && auditObj.summaryDetails[0].auditSummary!=1002){
                    console.log("inside amendment");
                    dynamic_update.location= decodeURIComponent(window.atob(auditObj.auditDetails[0].auditPlace));
                    dynamic_update.reviewdate= auditObj.auditDetails[0].auditDate ? moment(auditObj.auditDetails[0].auditDate).format('DD-MMM-YYYY') : "";
                    dynamic_update.dmlcissuedate= auditObj.auditDetails[0].closeMeetingDate ? moment(auditObj.auditDetails[0].closeMeetingDate).format('DD-MMM-YYYY') : "";   
                    dynamic_update.inspector=auditObj.auditDetails[0].auditorName;
                  }
                  //dynamic_update
                });
              });
              this.alignDmlcReviewLetter();// Added by sudharsan for Jira id Mobile-499
          });
          /**End Here */
      });
      /**End here */
      /* Report Data Validations */
      console.log(
        auditObj.reportData
          .filter((res) => res.attachmentTypeDesc === 'OTHER')
          .map((res) => res.otherType === '')
      );
      /* modified by  lokesh for jira_id(687) START HERE*/
      let file= !auditObj.reportData
      .filter((res) => res.attachmentTypeDesc === 'OTHER')
      .map((res) => res.fileName ==='').includes(true);

      let isReportValid = !auditObj.reportData
        .filter((res) => res.attachmentTypeDesc === 'OTHER')
        .map((res) => res.otherType === '')
        .includes(true);
      console.log('isReportValid', isReportValid);
      if (isReportValid &&file) {
        this.isReportValid=true;//added by lokesh for jira_id(654)
        this.saveDataToDB(auditObj, auditSeqNumber, toastermsg);
      } else {
        this.isReportValid=false;//added by lokesh for jira_id(654)
        if(!file){
          this.auditFormValueChangesFlag=true;
          this.toast.presentToast(
            'Please Select File for Other Type',
            'danger'
          );
        }else{
          this.auditFormValueChangesFlag=true;
        this.toast.presentToast(
          'Please add OTHER Attachmnet Type Name',
          'danger'
        );
        }
      }
      /* modified by  lokesh for jira_id(687) END HERE*/
      /* Report Data Validations End */

      this.getCurrentFindings();

      //console.log(this.auditDataForm.value);
    } else if (matches != null) {
      this.toast.presentToast('Enter valid SSP Auditor Name', 'danger');
    }
  }
   /**added by archana for jira ID-MOBILE-852 start */
  summaryLetterHistory() {
    this.sspDataToShow = this.sspDataSource;
    if (this.data.auditData && this.data.auditData[0].auditTypeId == 1005) {
      if ((this.auditData.value.summaryDetails[0].auditSummary == 'Not Reviewed' || this.data.auditData[0].auditSummaryId == 1005) && this.data.auditData[0].auditSubTypeID == 1001) {
        this.letter = true;
      } else if ((this.auditData.value.summaryDetails[0].auditSummary == 'Not Reviewed' || this.data.auditData[0].auditSummaryId == 1005) && this.data.auditData[0].auditSubTypeID == 1002) {
        this.sspDataToShow = this.sspDataToShow.filter((res) => res.reviewtype == "INITIAL");
        this.letter = false;
      } else {
        this.letter = false;
      }
    }
  }
  /**added by archana for jira ID-MOBILE-852 end */

  constructor(
    private breakpointObserver: BreakpointObserver,
    private fileManager: FileManagerService,
    public alertController: AlertController,
    public loader: LoadingIndicatorService,
    private appConstant: AppConstant,
    public modal: ModalController,
    public toast: ToastService,
    public pdfService: PdfService,
    private db: DatabaseService,
    private platform: Platform,
    private formBuilder: FormBuilder,
    private router: Router,
    private filesys: File,
    public actionSheetController: ActionSheetController,
    private fileOpener: FileOpener,
    public findingService: FindingService
  ) {
    this.loader.hideLoader();
    this.data = this.router.getCurrentNavigation().extras.state;
    console.log('CHECK_NOW Data : ', this.data);
    this.auditSubTypeId = this.data.auditData[0].auditSubTypeID;
    this.presentSeqNo = this.data.auditData[0].auditSeqNo;
    //this.certDtlInputData = this.data;
    this.setLabels();
    // this.setDropdowns();
  // this.getfindingInfodata();//changed by lokesh for jira_id(787)

    if (
      this.platform.is('ipad') ||
      this.platform.is('ios') ||
      this.platform.is('iphone')
    ) {
      this.dirName = this.filesys.documentsDirectory;
      this.isIOS = true;
    } else {
      this.dirName = this.filesys.externalDataDirectory;
      this.isIOS = false;
    }

    this.scopeArray = [
      {
        scopeId: 1000,
        scopeDesc: 'Full Scope',
      },
      {
        scopeId: 1001,
        scopeDesc: 'Half Scope',
      },
    ];

    // console.log(this.filesys.externalDataDirectory)

    this.auditArrayType = [
      {
        auditTypeId: 1001,
        auditTypeDesc: 'ISM',
      },
      {
        auditTypeId: 1002,
        auditTypeDesc: 'ISPS',
      },
      {
        auditTypeId: 1003,
        auditTypeDesc: 'MLC',
      },
      {
        auditTypeId: 1004,
        auditTypeDesc: 'SSP',
      },
      {
        auditTypeId: 1005,
        auditTypeDesc: 'DMLC II',
      },
    ];
    console.log(this.data);

    switch (this.data.auditData[0].auditSubTypeID) {
      case 1001:
        console.log('1001 :: INTERIM');
        this.isInterim = true;
        break;

      case 1002:
        console.log('1002 :: INITIAL');
        break;

      case 1003:
        console.log('1003 :: INTERMEDIATE');
        this.isReadonly = false;
      //  this.auditDtlPlaceholder = 'N.A'; //commented by lokesh as informed by basan
        break;

      case 1004:
        console.log('1004 :: ADDITIONAL');
        this.isReadonly = false;
        break;

      case 1005:
        console.log('1001 :: RENEWAL');
        break;
    }

    if (
      this.data.auditData[0].openMeetingDate === '' ||
      this.data.auditData[0].openMeetingDate === null ||
      this.data.auditData[0].openMeetingDate === undefined
    ) {
      this.omdFlag = true;
    }

    if (this.data.auditData[0].auditDate != '') {
      console.log(this.data.auditData[0].auditDate);
      console.log(this.addDays(new Date(this.data.auditData[0].auditDate), 0));
      this.maxIAD = this.data.auditData[0].auditDate;

      this.maxCloseMeetingDate = this.addDays(
        new Date(this.data.auditData[0].auditDate),
        0
      );
      this.maxOpenMeetingDate = this.addDays(
        new Date(this.data.auditData[0].auditDate),
        0
      );

      console.log(
        this.data.auditData[0].auditDate +
          ', ' +
          this.maxOpenMeetingDate +
          ', ' +
          this.maxCloseMeetingDate
      );
    }

    // console.log(this.data.auditData[0]);
    /*   console.log(decodeURIComp(this.data.auditData[0].auditPlace));
      console.log(decodeURIComp(this.data.auditData[0].narrativeSummary));
      console.log(this.data.auditData[0].auditPlace);
      console.log(encodeURIComp(this.data.auditData[0].auditPlace)); */

    if (
      this.data.auditData[0].auditTypeId === 1002 ||
      this.data.auditData[0].auditTypeId === 1003 ||
      this.data.auditData[0].auditTypeId === 1004
    ) {
      this.sspDetailsFormEnable = true;
    }

    if (
      this.data.auditData[0].auditTypeId === 1004 ||
      this.data.auditData[0].auditTypeId === 1005
    ) {
      this.isDMLC = true;
    }
    //console.log(this.sspDetailsFormEnable);

    // Audit Data Form Creation

    this.auditData = this.formBuilder.group({
      vesselData: this.formBuilder.array([this.initVesselDataForm()]),
      reportData: this.formBuilder.array([this.initReportDetailsForm()]),
      auditDetails: this.formBuilder.array([this.initAuditDataForm()]),
      summaryDetails: this.formBuilder.array([this.initSummaryDetailsForm()]),
      narativeDetails: this.formBuilder.array([this.initNarativeDetailsForm()]),
    });

    this.getPreviousAuditData().then((prevAuditData: any) => {
      console.log(prevAuditData);
      if (prevAuditData) {
        this.minAuditDate = moment(prevAuditData.auditDate)
          .add(1, 'days')
          .format('YYYY-MM-DD');
        console.log(this.minAuditDate);
        if (this.isDMLC && this.data.auditData[0].auditSubTypeID == 1002) {
          this.minReceiptDate = moment(prevAuditData.auditDate)
            .add(1, 'days')
            .format('YYYY-MM-DD');
          console.log(this.minReceiptDate);
        } else {
          this.minReceiptDate = '';
        }
      }
    });

    console.log(this.auditData.controls.narativeDetails.hasError('required'));

    console.log('Findings Data :: ', CurrentFinding.finding);

    let tempFindArr = CurrentFinding.finding;
    console.log('tempFindArr::', tempFindArr);
    tempFindArr.filter((res) => {
      console.log(res.finding);
    });
    //this.db.getCurrentFindingData(this.data.auditData[0].auditSeqNo);
    //this.setPreviousFindingRecords();
    // this.dbService.setPreviousFindingData()
    //this.dbService.getPrevAuditDetail(this.data.auditData[0].auditSeqNo);
  }
  // Check if device is phone or tablet
  get isMobile() {
    return this.breakpointObserver.isMatched('(max-width: 767px)');
  }
  //Getting AuditSubtype,AuditStatus,Cert Issued,Scope,Summary Description
  getAuditType(auditTypeId) {
    return this.auditArrayType.filter(
      (data) => data.auditTypeId === auditTypeId
    );
  }

  getAuditSubtype(auditSubTypeID) {
    return this.data.masterData.auditType.filter(
      (data) => data.auditSubtypeId === auditSubTypeID
    );
  }

  getAuditStatus(auditStatusId) {
    return this.data.masterData.auditStatus.filter(
      (data) => data.auditStatusId === auditStatusId
    );
  }

  getCertificateIssued(certificateIssueId) {
    return this.data.masterData.certIssued.filter(
      (data) => data.certificateIssueId === certificateIssueId
    );
  }

  getCertificateIssuedesc(certificateIssuedesc) {
    console.log(certificateIssuedesc);
    console.log(
      this.data.masterData.certIssued.filter(
        (data) => data.certificateIssueDesc === certificateIssuedesc
      )
    );
    return this.data.masterData.certIssued.filter(
      (data) => data.certificateIssueDesc === certificateIssuedesc
    );
  }

  getScope(scopeId) {
    return this.scopeArray.filter((data) => data.scopeId === scopeId);
  }

  getSummary(summaryId) {
    console.log(summaryId);

    console.log(this.auditSummaryArray);
    return this.auditSummaryArray.filter((data) => data.sumId === summaryId);
  }

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
    this.auditFormValueChangesFlag = true;
    let trim=event.trim();   //added by lokeshh for jira_id(791)
    this.filteredOptions = this.auditData.controls[
      'auditDetails'
    ].valueChanges.pipe(
      startWith(trim),
      map((value) => this._filter(value))
    );
  }

  onInputClick(seqno, index) {
    this.auditFormValueChangesFlag = true;

    console.log('onInputClick', index, seqno);
    console.log('this.reportFileArray =>', this.reportFileArray);

    if (this.reportFileArray.length != 0) {
      console.log('inside block....', this.reportFileArray);
      //this.reportFileArray[0][seqno] = '';
      this.attFlag = true;
    }
  }

  fileChanged(event, seqno, type) {
    console.log(type);
    console.log(event);
    console.log(seqno);
    console.log(event.type);
    //added by @Ramya on 30-08-2022 for jira id - Mobile- 623
   if(event.target.files[0].name.length>70)      //added by @Ramya on 13-06-2022 for jira Id - MOBILE-592
    {
      this.toast.presentToast(
        'File Name should be less than 70 characters'
      );
    }  else {                                  // replaced by archana for Jira Id-MOBILE-903
    if(event.target.files[0].size>10526720){
      this.toast.presentToast(
        "Uploaded File size(" + Math.round((event.target.files[0].size / 1048576) * 100) / 100 + "MB) should be less than 10MB");
        event.target.files[0].name='';
      } 
    let attDuplicateFiles = this.reportData.map((res) => res.fileName);
    console.log(attDuplicateFiles);
    console.log(attDuplicateFiles.includes(event.target.files[0].name));
    this.auditFormValueChangesFlag = true;
    if (!this.attFlag) {
      console.log('inside if attach');
    
      this.reportFileArray.push({ [seqno]: event.target.files[0] });
      this.reportData[seqno - 1].fileName = event.target.files[0].name;
    } else {
      console.log('inside else attach');
      if (attDuplicateFiles.includes(event.target.files[0].name)) {
        this.toast.presentToast(event.target.files[0].name+' file name already exists');// modified by lokesh jira_id(622)
      } else {
        this.reportFileArray.splice(seqno - 1, 1, {
          [seqno]: event.target.files[0],
        });
        this.attachmentFileNamesToDeleteFromFS.push(
          this.reportData[seqno - 1].fileName
        );
        this.reportData[seqno - 1].fileName = event.target.files[0].name;
      }
    }

    // this.reportData.forEach(attachName => {
    //   if (event.target.files[0].name === attachName) {
    //     this.toast.presentToast('Same File / File Name Found please delete and save before attach')
    //   }
    // });
    // console.log(event.target.files[0].name);
    // console.log(this.reportData);
    // console.log("this.reportFileArray >>", this.reportFileArray);
    // console.log('seqno', seqno)

    // this.auditFormValueChangesFlag = true;

    // if (this.attFlag) {
    //   // this.reportFileArray.splice(seqno-1,1,{[seqno]:event.target.files[0]});
    //   this.reportFileArray.splice(seqno - 1, 1, { [seqno]: event.target.files[0] });
    //   this.attachmentFileNamesToDeleteFromFS.push(this.reportData[seqno - 1].fileName);
    //   this.reportData[seqno - 1].fileName = event.target.files[0].name;
    //   /*   this.reportData[seqno - 1].dataOfIns = new Date();
    //     console.log(this.reportFileArray); */
    // }
    // else {
    //   this.reportFileArray.push({ [seqno]: event.target.files[0] });
    //   this.reportData[seqno - 1].fileName = event.target.files[0].name;
    //   /*   let date = new Date();
    //     let currDate = date.getFullYear() + '-' + (date.getMonth() + 1 <= 9 ? '0' + (date.getMonth() + 1) : date.getMonth()) + '-' + (date.getDate() + 1 <= 9 ? '0' + date.getDate() : date.getDate()) + " " + (date.getHours() + 1 <= 9 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() + 1 <= 9 ? '0' + date.getMinutes() : date.getMinutes())
    //     this.reportData[seqno - 1].dataOfIns = currDate; */
    // }
    let date = new Date();
    let currDate =
      date.getFullYear() +
      '-' +
      (date.getMonth() + 1 <= 9
        ? '0' + (date.getMonth() + 1)
        : date.getMonth()) +
      '-' +
      (date.getDate() + 1 <= 9 ? '0' + date.getDate() : date.getDate()) +
      ' ' +
      (date.getHours() + 1 <= 9 ? '0' + date.getHours() : date.getHours()) +
      ':' +
      (date.getMinutes() + 1 <= 9
        ? '0' + date.getMinutes()
        : date.getMinutes());
    this.reportData[seqno - 1].dataOfIns = currDate;
    this.reportData[seqno - 1].userIns === ''
      ? (this.reportData[seqno - 1].userIns = this.data.auditData[0].userIns)
      : '';

    console.log('this.reportFileArray >>>', this.reportFileArray);
    console.log('-------------------------------------------------------');
  }
}
  attachmentsComments(event, index, desc, id, userIns) {
    console.log('attachmentsComments', event);

    if (event.detail.value.length > 2000) {
    event.detail.value = event.detail.value.slice(0, 2000);
      this.toast.presentToast('Description should be less than 2000 characters', 'danger',20000);//modified by lokesh for jira_id(726)
    } // added by archana for jira-id=>MOBILE-615,616
    this.auditFormValueChangesFlag = true;

    console.log(desc, id, userIns);

    this.reportData[index].commants = event.detail.value; //added by ramya for jira id-->mobile-464
    
  }

  uploadDocument(fileArray, obj, type, seqno, fileSys) {
    let directory;

    if (
      this.platform.is('ipad') ||
      this.platform.is('ios') ||
      this.platform.is('iphone')
    ) {
      directory = fileSys.documentsDirectory;
    } else {
      directory = fileSys.externalDataDirectory;
    }

    console.log(fileSys);
    console.log(this.reportData);

    let fileReader = new FileReader();
    console.log(fileArray);
    let fileArr = [];
    for (var i = 0; i < fileArray.length; i++) {
      fileArr.push(Object.values(fileArray[i])[0]);
    }

    console.log(fileArr);
    for (var i = 0; i < fileArr.length; i++) {
      var file = fileArr[i];
      fileReader = new FileReader();
      fileReader.onload = (function (f) {
        return function (e) {
          console.log(e.target.result);

          console.log(
            directory + '/AuditDetails/' + type + '/' + seqno + '/' + f.name
          );

          // console.log(this.filesys.externalDataDirectory)
          fileSys
            .writeFile(
              directory + '/AuditDetails/' + type + '/' + seqno,
              f.name,
              e.target.result
            )
            .then((res) => {
              console.log(res);
            });
        };
      })(file);
      fileReader.readAsArrayBuffer(file);
    }
  }

  downloadAttachment(attachments, index) {
    console.log('downloadAttachment...');
    console.log('attachnments...', attachments);
    console.log('seqno...', this.data.auditData[0].auditSeqNo);
    console.log('audit__type...', this.data.auditData[0].auditTypeId);
    console.log('index', index);
    console.log('fileSys...', this.filesys);
    console.log('this.dirName', this.dirName);

    let audit__type = this.getAuditType(this.data.auditData[0].auditTypeId)[0];

    console.log('******************');

    this.checkFileExistToDownload(audit__type, attachments).then((res) => {
      console.log(res);
      if (res) {
        console.log('FILE EXISTS ');
        this.copyFileToDownloadsFolder(audit__type, attachments);
      } else {
        console.log('FILE NOT EXISTS ');

        this.toast.presentToast('File not found to download ', 'danger');
      }
    });
  }

  checkFileExistToDownload(audit__type, attachments): Promise<boolean> {
    console.log('attachments.fileName', attachments.fileName);
    let directory = this.dirName;
    if(audit__type.auditTypeId==this.appConstant.DMLC_TYPE_ID){          //added by ramya on 15-06-2022 for jira id - mobile-540 
      audit__type.auditTypeDesc='DMLC_II';
    }
    return new Promise<boolean>((resolve, reject) => {
      this.filesys
        .checkFile(
          directory +
            'AuditDetails/' +
            audit__type.auditTypeDesc +
            '/' +
            this.data.auditData[0].auditSeqNo +
            '/',
          attachments.fileName
        )
        .then((res) => {
          console.log('checkFileExistToDownload', res);
          resolve(res);
        })
        .catch((err) => {
          console.log('checkFileExistToDownload', err);
          reject(err);
          if(this.data.auditData[0]){
           if((this.data.auditData[0].auditTypeId == 1001) ||(this.data.auditData[0].auditTypeId ==1002)){
            this.auditTypeData = 'Audit...!!!';
          } else if(this.data.auditData[0].auditTypeId == 1003){
            this.auditTypeData = 'Inspection...!!!';
          } else if(this.data.auditData[0].auditTypeId == 1005){
            this.auditTypeData = 'Review...!!!';
          }
         this.toast.presentToast('Please save the ' +this.auditTypeData, 'danger');            //added by archana for jira-ID-MOBILE-867
        }
        });
    });
  }

  checkFileAlreadyExistsInAuditingAppDownloadsFolder(
    attachments
  ): Promise<boolean> {
    let directory = this.dirName;
    return new Promise<boolean>((resolve, reject) => {
      this.filesys
        .checkFile(
          this.filesys.externalRootDirectory +
            'Download/AUDITING_APP_DOWNLOADS/',
          attachments.fileName
        )
        .then((res) => {
          console.log('checkFileExistToDownload', res);
          //alert('FileAlreadyExistsInAuditingAppDownloadsFolder');

          resolve(res);
        })
        .catch((err) => {
          console.log('checkFileExistToDownload', err);
          reject(err);
        });
    });
  }

  createAuditingAppDownloadsFolder(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.filesys
        .createDir(
          this.filesys.externalRootDirectory + 'Download/',
          'AUDITING_APP_DOWNLOADS',
          false
        )
        .then((res) => {
          console.log('createAuditingAppDownloadsFolder', res);
          resolve(true);
        })
        .catch((err) => {
          console.log('createAuditingAppDownloadsFolder', err);
          resolve(false);
        });
    });
  }

  checkAuditingAppDownloadsFolder(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.filesys
        .checkDir(
          this.filesys.externalRootDirectory + 'Download/',
          'AUDITING_APP_DOWNLOADS'
        )
        .then((res) => {
          console.log('checkAuditingAppDownloadsFolder', res);
          resolve(true);
        })
        .catch((err) => {
          console.log('checkAuditingAppDownloadsFolder', err);
          reject(err);
        });
    });
  }

  removeFileAttachmentFromAudit(audit__type, attachments): Promise<boolean> {
    let directory = this.dirName;
    return new Promise<boolean>((resolve, reject) => {
      this.filesys
        .removeFile(
          directory +
            'AuditDetails/' +
            audit__type.auditTypeDesc +
            '/' +
            this.data.auditData[0].auditSeqNo +
            '/',
          attachments.fileName
        )
        .then((res: any) => resolve(true))
        .catch((err) => console.log(err));
    });
  }

  copyFileToDownloadsFolder(audit__type, attachments) {
    let directory = this.dirName;
    console.log(this.filesys.externalRootDirectory + 'Download/');

    this.checkAuditingAppDownloadsFolder()
      .then((res) => {
        console.log('checkAuditingAppDownloadsFolder response', res);
        this.checkFileExistToDownload(audit__type, attachments)
          .then((res) => {
            console.log('checkFileExistToDownload response', res);
            this.checkFileAlreadyExistsInAuditingAppDownloadsFolder(attachments)
              .then((res) => {
                /** added by archana 28-06-2022 for jira id-MOBILE-514 start */
              this.filesys
                .copyFile(
                  directory +
                    'AuditDetails/' +
                    audit__type.auditTypeDesc +
                    '/' +
                    this.data.auditData[0].auditSeqNo +
                    '/',
                  attachments.fileName,
                  this.filesys.externalRootDirectory +
                    'Download/AUDITING_APP_DOWNLOADS/',
                  this.data.vesselData.vesselImoNo+' '+audit__type.auditTypeDesc+' '+attachments.fileName
                )
                console.log(res);
                this.toast.presentToast(
                  'File Downloaded successfully in Download/AUDITING_APP_DOWNLOADS/ Folder',
                      'success'
                );
                 /** added by archana 28-06-2022 for jira id-MOBILE-514 end */

              })
              .catch((err) => {
                this.filesys
                  .copyFile(
                    directory +
                      'AuditDetails/' +
                      audit__type.auditTypeDesc +
                      '/' +
                      this.data.auditData[0].auditSeqNo +
                      '/',
                    attachments.fileName,
                    this.filesys.externalRootDirectory +
                      'Download/AUDITING_APP_DOWNLOADS/',
                      this.data.vesselData.vesselImoNo+' '+audit__type.auditTypeDesc+' '+attachments.fileName // added by archana 28-06-2022 for jira id-MOBILE-514
                  )
                  .then((res) => {
                    console.log(res);
                    this.toast.presentToast(
                      'File Downloaded successfully in Download/AUDITING_APP_DOWNLOADS/ Folder',
                      'success'
                    );
                  })
                  .catch((err) => {
                    console.log(err);
                    this.toast.presentToast(
                      'File Failed to Download',
                      'success'
                    );
                  });
               });
          })
          .catch((err) => {
            console.log('checkFileExistToDownload error', err);
          });
      })
      .catch((err) => {
        console.log('AuditingAppDownloadsFolder not there', err);
        if (!this.isIOS) {
          this.createAuditingAppDownloadsFolder().then((res) => {
            console.log('createAuditingAppDownloadsFolder created newly', res);
            this.filesys
              .copyFile(
                directory +
                  'AuditDetails/' +
                  audit__type.auditTypeDesc +
                  '/' +
                  this.data.auditData[0].auditSeqNo +
                  '/',
                attachments.fileName,
                this.filesys.externalRootDirectory +
                  'Download/AUDITING_APP_DOWNLOADS/',
                attachments.fileName
              )
              .then((res) => {
                console.log(res);
                this.toast.presentToast(
                  'File Downloaded successfully in Download/AUDITING_APP_DOWNLOADS/ Folder',
                  'success'
                );
              })
              .catch((err) => {
                console.log(err);
              });
          });
        } else if (this.isIOS) {
          this.checkFileExistToDownload(audit__type, attachments)
            .then((res) => {
              console.log('File Found in IOS App Data', res);

              console.log(attachments.fileName.split('.').pop());

              console.log(
                this.getValueFromMIME(attachments.fileName.split('.').pop())
              );

              console.log(
                directory +
                  'AuditDetails/' +
                  audit__type.auditTypeDesc +
                  '/' +
                  this.data.auditData[0].auditSeqNo +
                  '/' +
                  attachments.fileName
              );

              let mime = this.getValueFromMIME(
                attachments.fileName.split('.').pop()
              );
              this.fileOpener.open(
                directory +
                  'AuditDetails/' +
                  audit__type.auditTypeDesc +
                  '/' +
                  this.data.auditData[0].auditSeqNo +
                  '/' +
                  attachments.fileName,
                mime
              );
            })
            .catch((err) => {
              this.toast.presentToast('File Failed to Download ..', 'danger');
            });
        }
      });
  }

  numberOnlyValidation(evt: any) {
    console.log('numberOnlyValidation...', evt.target.value);
    evt = evt ? evt : window.event;
    var charCode = evt.which ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      console.log(evt, charCode);
      return false;
    }
    return true;
  }
 

  async presentActionSheet() {
    /** added by archana for jira-ID-MOBILE-747 start*/
    let sspDmlcAuditSeqNo =
      this.data.auditData[0].sspDetailsData.sspDmlcAuditSeqNo;
    if (sspDmlcAuditSeqNo) {
      console.log('sspDmlcAuditSeqNo', sspDmlcAuditSeqNo);
       await this.db
        .getLinkedDMLReviewList(sspDmlcAuditSeqNo)
        .then((dmlcfindingsList: any) => {
            if (dmlcfindingsList.length > 0) {
            this.isDmlcLinked = true;
          } else {
            this.isDmlcLinked = false;
          }
           this.dmlcfindingsListVar = dmlcfindingsList;
           if (this.dmlcfindingsListVar != null && dmlcfindingsList.length > 0) {       //added by archana for jira ID-MOBILE-913
            console.log(dmlcfindingsList);
             dmlcfindingsList = dmlcfindingsList.filter((element) => {
             return  (element.findingDtl[element.findingDtl.length -1].statusId != this.appConstant.VERIFIED_CLOSED ||
              element.findingDtl[element.findingDtl.length -1].currSeqNo >= this.presentSeqNo)   
            });
          }
          this.dmlcfindingsListVar != null && dmlcfindingsList.length == 0
        ? (this.dmlcfindingsListVar = null)
        : '';
       });
      }
      /** added by archana for jira-ID-MOBILE-747 end*/
    let req = {
      vesselImoNo: this.data.vesselData.vesselImoNo,
      companyImoNo: this.data.vesselData.companyImoNo,
      docTypeNo: this.data.vesselData.docTypeNo,
      auditDate: this.data.auditData[0].auditDate,
      auditTypeId: this.data.auditData[0].auditTypeId,
    };
    await this.db.getPrevFindingDetails(req).then((pfData: any) => {
      this.previousFindingsData = pfData;
      console.log(this.previousFindingsData);
      /**changed by archana for jira Id-Mobile-765 start*/
      if (this.previousFindingsData != null && pfData.finding.length > 0) {
        pfData.finding = pfData.finding.filter((element) => {
          // return element.findingStatus == 0;
          return  (element.findingDetail[element.findingDetail.length -1].statusId != this.appConstant.VERIFIED_CLOSED ||
          element.findingDetail[element.findingDetail.length -1].curSeqNo >= this.presentSeqNo) && element.serialNo.includes('OBS') == false  //added by archana for jira ID-MOBILE-897
        });
      }
      /**changed by archana for jira Id-Mobile-765 end*/
      this.previousFindingsData != null && pfData.finding.length == 0
        ? (this.previousFindingsData = null)
        : '';
      console.log(this.previousFindingsData);
      /*  if (pfData != null) {
         this.previousFindingButton = false;
         console.log('getPrevFindingDetails RES : ', pfData);
       } */
    });

    const actionSheet = await this.actionSheetController.create({
      header: 'More Options',
      buttons: [],
    });
    if (this.auditData.value.auditDetails[0].auditTypeId == 1005) {
      actionSheet.buttons = [];
      actionSheet.buttons.push(
        {
          text:
            this.data.auditData[0].auditSubTypeID == 1001
              ? 'Receipt Letter'
              : 'Amendment Receipt Letter',
          icon: 'document',
          handler: () => {
            console.log('Receipt Letter');
            if (this.data.auditData[0].auditSubTypeID == 1001)
              this.receiptLetter();
            else this.amendmentReceiptLetter();
          },
        },
        {
          text:
            this.data.auditData[0].auditSubTypeID == 1001
              ? 'Review Letter'
              : 'Amendment Review Letter',
          icon: 'document',
          handler: () => {
            console.log('Review Letter');
            if (this.data.auditData[0].auditSubTypeID == 1001)
              this.reviewLetter('save');
            else this.amendmentReviewLetter('save');
          },
        },
        {
          text: 'Review Notes',
          icon: 'add-circle-outline',
          handler: () => {
            console.log('Review Notes');
          //added by lokesh for jira_id(804)
             if (
              this.auditData.value.auditDetails[0].auditDate == '' ||
              this.auditData.value.auditDetails[0].auditDate == 'Invalid date'||this.auditData.value.auditDetails[0].auditDate==null
            ){
              this.auditFormValueChangesFlag=true;
              this.toast.presentToast('Please Select Review Date', 'danger');
            }
              else{
                if(!this.auditFormValueChangesFlag && !this.formValueChangeForStatus){
                this.currentFinding();
                }else{
                  this.toast.presentToast(
                    this.auditType_Title+' has been updated , Please save the '+this.auditType_Title +' to go Review Notes Screen ','danger'//modified by lokesh for jira_id(813)
                  );
                }
              }
            
          },
        },
        {
          text: 'Print Report',
          icon: 'print',
          handler: () => {
            console.log('Print Report');
            this.printReport();
          },
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        }
      );
    } else {
      actionSheet.buttons = [];
      if (
        this.auditData.value.auditDetails[0].auditTypeId ==
        this.appConstant.MLC_TYPE_ID
      ) {
        actionSheet.buttons.push({
          text: 'DMLC II Notes',
          icon: 'add-circle-outline',
          cssClass: this.cssClassForActionSheetButtonDisable(
            this.isDmlcLinked && (this.dmlcfindingsListVar != null && this.dmlcfindingsListVar.length) > 0 ? false : true // added by archana for jira id-Mobile-747
          ),
          handler: () => {
            console.log('dmlc ll notes');
            if(this.isDmlcLinked && (this.dmlcfindingsListVar != null && this.dmlcfindingsListVar.length > 0)){               //added by archana for Jira-ID-MOBILE-908
            /**added by archana for jira ID-MOBILE-841 start */
            if ( this.auditData.value.auditDetails[0].openMeetingDate == ''||this.auditData.value.auditDetails[0].openMeetingDate==null){
              this.toast.presentToast('Please select OpenMeeting Date', 'danger');
             }else if( this.auditData.value.auditDetails[0].closeMeetingDate == ''||this.auditData.value.auditDetails[0].closeMeetingDate==null ){
               this.toast.presentToast(
                'Please select CloseMeeting Date','danger');
             }else
             /**added by archana for jira ID-MOBILE-841 end */
            if(!this.auditFormValueChangesFlag && !this.formValueChangeForStatus){
            if (this.isDmlcLinked && this.dmlcfindingsListVar.length > 0)     // added by archana for jira id-Mobile-756,763
              this.dmlcFindings(
                this.data,
                this.dmlcAutitDataVar,
                this.dmlcfindingsListVar
              );
            else return false;
              } else{
                this.toast.presentToast(
                  this.auditType_Title+' has been updated , Please save the '+this.auditType_Title +' to go Dmlc ll notes Screen ','danger'//modified by lokesh for jira_id(813)
                );
              } 
            }            
          },
        });
      }
      console.log(this.previousFindingsData);

      actionSheet.buttons.push(
        {
          text: 'Previous Finding',
          icon: 'create',
          cssClass: this.cssClassForActionSheetButtonDisable(
            this.previousFindingsData === null ? true : false
          ),
          handler: () => {
            if(this.previousFindingsData != null ){                       //added by archana for Jira-ID-MOBILE-908
            if ( this.auditData.value.auditDetails[0].openMeetingDate == ''||this.auditData.value.auditDetails[0].openMeetingDate==null){
              this.toast.presentToast('Please select OpenMeeting Date', 'danger');
             }else if( this.auditData.value.auditDetails[0].closeMeetingDate == ''||this.auditData.value.auditDetails[0].closeMeetingDate==null ){
              this.toast.presentToast(
                'Please select CloseMeeting Date','danger');
             }else if(!this.auditFormValueChangesFlag && !this.formValueChangeForStatus){ // added by archana for jira id-Mobile-756,763
            if (this.previousFindingsData != null) {
              this.previousFinding();
            } else return false;
          }else{//added by lokesh for jira_id(776) START HERE
              this.toast.presentToast(
                this.auditType_Title+' has been updated , Please save the '+this.auditType_Title +' to go Finding Screen ',//modified by lokesh for jira_id(814)
                'danger'
              );
             //added by lokesh for jira_id(776) END HERE
          }
        }
          },
        },
        {
          text: 'New Finding',
          icon: 'add-circle-outline',
          handler: () => {
            console.log('Current Findings');
            if ( this.auditData.value.auditDetails[0].openMeetingDate == ''||this.auditData.value.auditDetails[0].openMeetingDate==null){
              this.toast.presentToast('Please select OpenMeeting Date', 'danger');
             }else if( this.auditData.value.auditDetails[0].closeMeetingDate == ''||this.auditData.value.auditDetails[0].closeMeetingDate==null ){
               this.toast.presentToast(
                'Please select CloseMeeting Date','danger');
             }else if(!this.auditFormValueChangesFlag && !this.formValueChangeForStatus)   // added by archana for jira id-Mobile-756,763
               this.currentFinding()
              else{//added by lokesh for jira_id(776) START HERE
                this.toast.presentToast(
                  this.auditType_Title+' has been updated , Please save the '+this.auditType_Title +' to go Finding Screen ',//modified by lokesh for jira_id(814)
                  'danger'
                );
              }//added by lokesh for jira_id(776) END HERE
              
          },
        },
        {
          text: 'Print Report',
          icon: 'print',
          handler: () => {
            console.log('Print Report');
            this.printReport();
          },
        },
        {
          text: 'Certificate',
          icon: 'document',
          cssClass: this.cssClassForActionSheetButtonDisable(
            this.data.auditData[0].scopeId == 1001 ? true : false            //added by archana for jira-id=>MOBILE-593
          ),
          handler: () => {
            console.log('Certificate');
            console.log(this.auditData.value.auditDetails[0]);
            console.log(this.auditData.value.auditDetails[0].openMeetingDate);
            console.log(this.auditData.value.auditDetails[0].closeMeetingDate);
            console.log(this.auditData.value.auditDetails[0].auditPlace);
            if (this.data.auditData[0].scopeId != 1001) {      // added by archana for jira-id=>MOBILE-612
              
            if (this.auditData.value.auditDetails[0].openMeetingDate == null) {
              this.auditData.value.auditDetails[0].openMeetingDate = '';
            } else if (
              this.auditData.value.auditDetails[0].openMeetingDate == '' &&
              this.auditData.value.auditDetails[0].auditPlace == ''
            ) {
              if (this.auditData.value.auditDetails[0].auditTypeId == 1003) {
                /**Fixed MOBILE-481 by Archana */
                this.toast.presentToast(
                  'Please select Inspection Place, OpenMeeting Date, CloseMeeting Date and then go to Certificate ',
                  'danger'
                );
              } else {
                this.toast.presentToast(
                  'Please select '+ this.auditType_Title +' Place, OpenMeeting Date, CloseMeeting Date and then go to Certificate ',
                  'danger'
                );
              }
            } else if (
              this.auditData.value.auditDetails[0].openMeetingDate == ''||this.auditData.value.auditDetails[0].openMeetingDate==null
            ) {
              this.toast.presentToast(
                'Please select OpenMeeting Date and then go to Certificate ',
                'danger'
              );
            } else if (
              this.auditData.value.auditDetails[0].closeMeetingDate == ''||this.auditData.value.auditDetails[0].closeMeetingDate==null
            ) {
              this.toast.presentToast(
                'Please select CloseMeeting Date and then go to Certificate ',
                'danger'
              );
            } else if (this.auditData.value.auditDetails[0].auditPlace == '' ||(this.auditData.value.auditDetails[0].auditPlace).trim().length < 1) {//condisition changed by lokesh for jira_id(768)
              if (this.auditData.value.auditDetails[0].auditTypeId == 1003) {
                /**Fixed MOBILE-481 by Archana */
                this.toast.presentToast(
                  'Please select Inspection Place and then go to Certificate ',
                  'danger'
                );
              } else {
                this.toast.presentToast(
                  'Please select '+ this.auditType_Title +' Place and then go to Certificate ',
                  'danger'
                );
              }
            } else if (this.auditData.value.auditDetails[0].issueDate == '') {
              this.toast.presentToast(
                'Please select Issue Date and then go to Certificate ',
                'danger'
              );
            } else {
              console.log(
                'this.auditFormValueChangesFlag ::: >>>',
                this.auditFormValueChangesFlag
              );
              let auditDataForm = this.auditData.get(
                'auditDetails'
              ) as FormArray;
              console.log(this.auditData.value);
              console.log(auditDataForm);

              let summaryForm = this.auditData.get(
                'summaryDetails'
              ) as FormArray;
              console.log(summaryForm.value[0].auditSummary);
              if (summaryForm.value[0].auditSummary != undefined) {
                this.notApprovedFlag = summaryForm.value[0].auditSummary
                  .toLowerCase()
                  .includes('not approved');
              }

              console.log(
                auditDataForm.value[0].auditPlace != '',
                auditDataForm.value[0].auditPlace != null,
                auditDataForm.value[0].auditPlace != undefined
              );
              // console.log(this.auditData.get(['auditDetails','auditPlace']).value);
              if (!this.auditFormValueChangesFlag) {
                if (
                  auditDataForm.value[0].auditPlace != '' &&
                  auditDataForm.value[0].auditPlace != null &&
                  auditDataForm.value[0].auditPlace != undefined
                ) {
                  console.log(
                    auditDataForm.value[0].auditPlace != '',
                    auditDataForm.value[0].auditPlace != null,
                    auditDataForm.value[0].auditPlace != undefined
                  );
                  if (!this.notApprovedFlag) {
                    this.goToCertDtls();
                  } else {
                    this.toast.presentToast(
                      "Sorry, certificate can't be generated, since the "+ this.auditType_Title +" Summary is marked as Not Approved",
                      'danger'
                    );
                  }
                } else {
                  this.toast.presentToast(
                    'Please select '+ this.auditType_Title +' Place and then go to Certificate ',
                    'danger'
                  );
                }
              } else {
               
                this.toast.presentToast(
                  this.auditType_Title +' has been updated , Please save the '+ this.auditType_Title +' to go Certificate Screen ',
                  'danger'
                );
              }
            }
          } else return false;              // added by archana for jira-id=>MOBILE-612
          },
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        }
      );
    }
    await actionSheet.present();
  }
  cssClassForActionSheetButtonDisable(shouldDisable): string {
    console.log(shouldDisable);
    return shouldDisable ? 'disable-action-sheet-btns' : '';
  }
/**changed by archana 13-06-2022 ID = MOBILE-544 START */
  addOthersAttachment() {
        console.log(this.reportData);
        this.addingAttach = false;
        this.auditFormValueChangesFlag = true;
        this.reportData.forEach((otherAttach)=>{
          if(otherAttach.attachmentTypeDesc == "OTHER" && otherAttach.fileName == "" ){
            this.addingAttach = true;
          }
        });
      if(this.addingAttach == false){
          Object.assign(
            this.reportData,
            this.reportData.push({
            seqNo: this.reportData.length + 1,
            fileName: '',
            attachmentTypeId: 1005,
            attachmentTypeDesc: 'OTHER',
            companyId: '',
            userIns: this.auditData.get('auditDetails').value[0].lockHolder,
            dataOfIns: '',
            commants: '',
            otherType: '',
            })
          );
          this.toast.presentToast(
          'Other Type Attachment added successfully',
          'success'
        );
      } else {
        this.toast.presentToast('Please fill Other Attachment details','danger');  // modifid by lokesh mobile jira_id(628)
      }
    
    }
/**changed by archana 13-06-2022 ID = MOBILE-544 END */

/**added by archana 24-06-2022 for jira-id=MOBILE-522 start*/
async removeOtherAttachments(index) {
    
    const alert = this.alertController.create({
      mode: 'ios',
      header: 'Delete Attachment',
      message: 'Do You want to delete the Attachment?',
      cssClass: 'alertCancel', //added by archana for jira id-MOBILE-518
      buttons: [
        {
          text: 'Yes',
          cssClass: 'alertButton', //added by archana for jira id-MOBILE-518
          handler: () => {
            console.log('Delete attachment Confirmed');
            this.auditFormValueChangesFlag = true;
            var toastermsg = 'Removed Other Attachment succesfully';// added by archana for jira-Id,MOBILE-438
            this.reportData.splice(index, 1);
            for (let i = index; i < this.reportData.length; i++) {
            this.reportData[i].seqNo = this.reportData[i].seqNo - 1;
            }
            console.log(this.reportData);
            this.save(this.auditData.value, 1, toastermsg);// added by archana for jira-Id,MOBILE-438
            }
        },
        {
          text: 'No',
          cssClass: 'alertButton', //added by archana for jira id-MOBILE-518
          handler: () => {
            console.log('Delete Rejected');
          },
        },
      ],
    });
    (await alert).present();
  }
  /**added by archana 24-06-2022 for jira-id=MOBILE-522 end*/

  removeAttachmentYesHandler(attachments) {
    this.checkFileAlreadyExistsInAuditingAppDownloadsFolder(attachments)
      .then((res) => {
        console.log(res);
        alert('File present to delete');
        console.log(attachments);
        this.filesys
          .removeFile(
            this.filesys.externalRootDirectory +
              'Download/AUDITING_APP_DOWNLOADS/',
            attachments.fileName
          )
          .then((res) => {
            console.log(res);
            alert('file deleted successfully');
          })
          .catch((err) => {
            console.log(err);
            alert('file failed to delete ');
          });
      })
      .catch((err) => {
        console.log(err);
        alert('File not present to delete');
      });
  }

  async removeAttachedFile(index, attachments) {
    console.log('attach', attachments);

    const alert = this.alertController.create({
      mode: 'ios',
      header: 'Delete Attachment',
      message: 'Do You want to delete the Attachment?',
      cssClass: 'alertCancel', //added by archana for jira id-MOBILE-518
      buttons: [
        {
          text: 'Yes',
          cssClass: 'alertButton', //added by archana for jira id-MOBILE-518
          handler: () => {
            console.log('Delete attachment Confired');
            this.auditFormValueChangesFlag = true;
            console.log(
              'this.reportData[index].fileName',
              this.reportData[index].fileName
            );

            //this.removeAttachmentYesHandler(attachments);

            let audit__type = this.getAuditType(
              this.data.auditData[0].auditTypeId
            )[0];

            this.checkFileExistToDownload(audit__type, attachments)
              .then((res) => {
                console.log(res);

                this.removeFileAttachmentFromAudit(audit__type, attachments)
                  .then((res) => {
                    console.log(res);
                    this.attachmentFileNamesToDeleteFromFS.push(
                      this.reportData[index].fileName
                    );
                    console.log(
                      'this.attachmentFileNamesToDeleteFromFS',
                      this.attachmentFileNamesToDeleteFromFS
                    );
                    this.reportData[index].fileName = '';
                    this.reportData[index].commants = '';
                    this.reportData[index].otherType = '';
                    var toastermsg = 'Attachment Removed succesfully';
                   
                    this.save(this.auditData.value, 1, toastermsg);// added by archana for jira-Id,MOBILE-438
                  })
                  .catch((err) => {
                    console.log(err);
                    this.toast.presentToast(
                      'Attachment Failed to Delete',
                      'danger'
                    );
                  });
              })
              .catch((err) => {
                /**  added by archana for jira-Id,MOBILE-438 start*/
                console.log(err);
                var toastermsg = 'Attachment Removed succesfully';
                if(attachments.fileName != null){
                  console.log(this.reportData[index].fileName );
                  this.reportData[index].fileName = '';
                  this.reportData[index].commants = '';
                  this.reportData[index].otherType = '';
                  this.save(this.auditData.value, 1, toastermsg);
                 }
                 else{
                this.toast.presentToast(
                  'Attachment Not Found , Failed to Delete',
                  'danger'
                );
                 }
                 /**  added by archana for jira-Id,MOBILE-438 end*/
              });

            console.log(
              this.attachmentFileNamesToDeleteFromFS.includes(
                this.reportData[index].fileName
              )
            );
          },
        },
        {
          text: 'No',
          cssClass: 'alertButton', //added by archana for jira id-MOBILE-518
          handler: () => {
            console.log('Delete Rejected');
          },
        },
      ],
    });
    (await alert).present();
  }

  getOtherTypeAttachName(event, index) {
    console.log('getOtherTypeAttachName', event.target.value);
     /**added by archana for jira id-MOBILE-642 start */
    if (event.target.value.length > 30) {
      event.target.value = event.target.value.slice(0, 30);
        this.toast.presentToast('Only 30 characters allowed', 'danger');
        }
    /**added by archana for jira id-MOBILE-642 end*/
    console.log(this.reportData[index]);

    this.auditFormValueChangesFlag = true;

    this.reportData[index].otherType = event.target.value;

    console.log(this.reportData, this.reportData.push());
  }

  narativeSummaryChange(event, changeValue) {
    if (changeValue == 'direct') {
      console.log('narativeSummaryChange', event);
      this.auditFormValueChangesFlag = true;
    }
  }

  async ngOnInit() {
    this.radioButtonset();  //added by archana for jira id-MOBILE-786
    console.log('NgOnInit ::: ');
    console.log(
      'this.auditFormValueChangesFlag >>>',
      this.auditFormValueChangesFlag
    );
    //console.log('CurrentFinding.finding', CurrentFinding.finding);
    // setting vessel data auditTypeId
    console.log(this.data.vesselData);
    console.log(this.data.auditData[0].sspDetailsData);
    console.log(this.data.auditData[0].sspDetailsData.sspLeadName);
    this.findingService.init(this.data.auditData[0].auditTypeId);
    // if(this.data.auditData[0].auditTypeId == 1001){
    //   this.isReadonly =true
    // }
    // this.sspReviewDataIsPresent  sspLeadName sspReportNo sspRevisionNo

    console.log(this.sspReviewDataIsPresent);
    if (
      this.data.auditData[0].sspDetailsData.sspLeadName &&
      this.data.auditData[0].sspDetailsData.sspReportNo &&
      this.data.auditData[0].sspDetailsData.sspRevisionNo != ''
    ) {
      this.sspReviewDataIsPresent = true;
    }
    console.log(this.sspReviewDataIsPresent);
    let vesselDataForm = this.auditData.get('vesselData') as FormArray;
    let vslData = this.data.vesselData;
    console.log(vslData);
    this.reportObj = this.data; //assining data value for report
    vesselDataForm.setValue([
      {
        vesselImoNo: vslData.vesselImoNo,
        vesselName: vslData.vesselName,
        vesselType: vslData.vesselType,
        officialNo: vslData.officialNo,
        grt: vslData.grt,
        companyImoNo: vslData.companyImoNo,
        docTypeNo:
          vslData.docTypeNo,                  //added by ramya for jira id-->mobile-521
        docIssuer: vslData.docIssuer,
        docExpiry: vslData.docExpiry,
        companyName: vslData.companyAddress,
        dateOfRegistry: vslData.dateOfReg,
        companyNameOri: vslData.companyName,
        companyAddOri: vslData.companyAddress,
      },
    ]);

    // setting auditor & audit data & audit port

    this.filteredOptions = this.auditData.controls[
      'auditDetails'
    ].valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
    /** code added for to display lead auditor name in perform audit screen */
    console.log(this.data);
    var auditonamearr = this.data.auditAuditorData;
    var auditornamefilter = auditonamearr.filter(function (otheratt) {
      return otheratt.audObsLead == 1;
    });
    this.auditorName=auditornamefilter[0].auditorName;  //added by lokesh for check box and binding data jira_id(635)
    console.log(auditornamefilter[0]);
    /**  end  */
    let auditDataForm = this.auditData.get('auditDetails') as FormArray;
    let auditorData = auditornamefilter[0];
    console.log(auditorData);
    let auditData = this.data.auditData[0];
    console.log(auditData);
    console.log(this.data.vesselData);
    // removed by archana for jira ID-MOBILE-852
     /**added by archana for jira id-MOBILE-816 start */
    //  console.log(this.data.auditData[0].auditSummaryId);
    //  if(this.data.auditData[0].auditSummaryId == 1005 && this.data.auditData[0].auditTypeId == 1005){
    //    this.letter = true;
    //   } else {
    //    this.letter = false;
    //   }
     /**added by archana for jira id-MOBILE-816 end */
    let prevAuditDataLoad: any = [];
    if (this.data.auditData[0].auditTypeId == 1005) {
      this.db
        .getPreviousAuditdata(this.data.vesselData.vesselImoNo, 1004, 1005)
        .then((prevAuditData) => {
          console.log('prevAuditData :', prevAuditData);
          prevAuditDataLoad = prevAuditData;
          this.minReviewDate = null;
          if (prevAuditDataLoad.length >= 1) {
            prevAuditDataLoad.forEach((arr, arrIndex) => {
              if (arr.auditSubTypeID == 1001)
                this.minReviewDate = moment(arr.auditDate)
                  .add(1, 'days')
                  .format('YYYY-MM-DD');
            });
            if (
              this.data.auditData[0].auditTypeId == 1005 &&
              this.data.auditData[0].sspDetailsData.ltrStatus == 1
            ) {
              /**Added By sudharsan for JIRA-ID -- 446,447,448,449 */
              this.db.checkExistsData().then((auditsequence_list) => {
                console.log('auditsequence_list', auditsequence_list);
                let auditsequence_list_json = JSON.parse(JSON.stringify(auditsequence_list));
                console.log('auditsequence_list_json', auditsequence_list_json.status);
                auditsequence_list_json.status.forEach((sequence_No)=>{
                  //Number(sequence_No)
                    this.db.getAuditauditorDetails(sequence_No).then((auditors_dtl)=>{
                      let auditors = JSON.parse(JSON.stringify(auditors_dtl));
                      this.sspDataSource = [];
                      prevAuditDataLoad.forEach((arr, arrIndex) => {
                      console.log(arr);
                      for(let i=0;i<auditors.length;i++){
                        //added by lokesh for jira_id(842)
                        if((auditors[i].AUDIT_SEQ_NO==arr.auditSeqNo )&& arr.auditSubTypeID==1001){
                            this.userName=auditors[i].AUDITOR_NAME
                             this.signature=auditors[i].AUD_SIGNATURE
                        }
                      }
                      this.sspDataSource.push({
                        slno: arrIndex + 1,
                        reviewtype:arr.auditSubTypeID == 1001 ? 'INITIAL' : 'AMENDMENT',
                        reviewdate: arr.auditDate? moment(arr.auditDate).format('DD-MMM-YYYY'): '',
                        location: decodeURIComponent(window.atob(arr.auditPlace)),
                        reviewletter: arr.certificateNo,
                        dmlcissuedate: arr.closeMeetingDate? moment(arr.closeMeetingDate).format('DD-MMM-YYYY'): '',
                        inspector: arr.userName?auditors[0].AUDITOR_NAME:this.userName,
                        signature:this.signature?this.signature:arr.signature
                      });
                    });
                    this.alignDmlcReviewLetter();// Added by sudharsan for Jira id Mobile-499
                    console.log(this.sspDataSource);
      
                  });
                });
              });
              /**End Here */
            }
          }
        });
    }

    this.auditTypeValue = await this.getAuditType(auditData.auditTypeId)[0]
      .auditTypeDesc;

    this.subTypeValue = await this.getAuditSubtype(auditData.auditSubTypeID)[0]
      .auditSubtypeDesc;
    this.auditStatusValue = await this.getAuditStatus(
      auditData.auditStatusId
    )[0].auditStatusId;
    this.scopeValue = await this.getScope(auditData.scopeId)[0].scopeDesc;

    if (
      auditData.certIssuedId
        ? isNaN(Number(auditData.certIssuedId.toString()))
        : ''
    )
      this.certIssuedValue = await this.getCertificateIssuedesc(
        auditData.certIssuedId
      )[0].certificateIssueDesc;
    else if (auditData.certIssuedId)
      this.certIssuedValue = await this.getCertificateIssued(
        auditData.certIssuedId
      )[0].certificateIssueDesc;
    this.summaryValue = auditData.auditSummaryId;

    console.log(
      typeof this.momentjs(auditData.auditDate).format('DD-MMM-YYYY')
    );

    this.openMeetingDateError = auditData.auditSubTypeID;
    console.log(this.openMeetingDateError);

    this.minInternalAuditDate = moment(auditData.auditDate)
      .subtract(2, 'years')
      .format('YYYY-MM-DD');
    this.maxInternalAuditDate = moment(auditData.auditDate).format(
      'YYYY-MM-DD'
    );
    console.log(auditData, auditorData);
    auditDataForm.patchValue([
      {
        auditSeqNo: auditData.auditSeqNo,
        companyId: auditData.companyId,
        lockHolder: auditData.lockHolder,
        lockStatus: auditData.lockStatus,
        auditTypeId: auditData.auditTypeId,
        dateOfIns: auditData.dateOfIns,
        maxStatusDateCar: auditData.maxStatusDateCar,
        seal: auditData.seal,
        title: auditData.title,
        signature: auditData.signature,
        qid: auditData.qid,
        userName: auditorData.userName,
        auditorName: auditorData.auditorName,
        auditorId: auditorData.userId,
        auditReportNo: auditData.auditReportNo,
        auditSubType: this.subTypeValue,
        scope: auditData.scopeId,
        auditDate: auditData.auditDate,
        auditPlace: decodeURIComp(auditData.auditPlace),
        auditStatus: this.auditStatusValue,

        certificateNo: auditData.certificateNo,
        certificateIssued: auditData.certIssuedId,
        issueDate: auditData.certIssuedDate,
        expiryDate: auditData.certExpiryDate,
        interalAuditDate: auditData.interalAuditDate
          ? moment(auditData.interalAuditDate).format('YYYY-MM-DD')
          : '',
        openMeetingDate: auditData.openMeetingDate,
        closeMeetingDate: auditData.closeMeetingDate,
        sspRevisionNo: auditData.sspDetailsData.sspRevisionNo,
      },
    ]);

    console.log(this.data.auditData[0].sspDetailsData);
    console.log(auditDataForm.value);
    //setting ssp details data if type==isps,mlc,dmlc

    this.sspRevisionNo = auditData.sspDetailsData.sspRevisionNo;
    this.sspReportNo = auditData.sspDetailsData.sspReportNo;
    this.sspLeadName = auditData.sspDetailsData.sspLeadName;

    console.log(
      auditData.sspDetailsData.sspReportNo,
      auditData.sspDetailsData.sspLeadName,
      auditData.sspDetailsData.sspRevisionNo
    );

    //setting reportForm data
 /**Fixed MOBILE-492 and MOBILE-524 code added by kiran   start*/
    var arrayotherfilter = this.data.auditReportData;
    var arrayotherfilter1 = arrayotherfilter.filter(function (otheratt) {
      return otheratt.attachmentTypeId != 1005;
    });
    var arrayotherfilter2 = arrayotherfilter.filter(function (otheratt) {
      return otheratt.attachmentTypeId == 1005;
    });
    const arrayotherfilter3 = arrayotherfilter1.concat(arrayotherfilter2);
    console.log(arrayotherfilter1);
    console.log(arrayotherfilter2);
    console.log(arrayotherfilter3);
    this.reportData = arrayotherfilter3
    /*place changed by lokesh //jira id=467  START*/
    // audit details Title
    if (auditData.auditTypeId == 1001) {
      this.auditTypeTitle = 'ISM';
      this.auditType_Title='Audit';  //Added by sudharsan for JIRA-ID =565
    } else if (auditData.auditTypeId == 1002) {
      this.auditTypeTitle = 'ISPS';
      this.auditType_Title='Audit';  //Added by sudharsan for JIRA-ID =565
    } else if (auditData.auditTypeId == 1003) {
      this.auditTypeTitle = 'MLC';
      this.auditType_Title='Inspection';  //Added by sudharsan for JIRA-ID =565
    } else if (auditData.auditTypeId == 1004) {
      this.auditTypeTitle = 'SSP';
      this.auditType_Title='Review';  //Added by sudharsan for JIRA-ID =565
    } else if (auditData.auditTypeId == 1005) {
      this.auditTypeTitle = 'DMLC II';
      this.auditType_Title='Review';  //Added by sudharsan for JIRA-ID =565
    }
    /*place changed by lokesh //jira id=467  END*/
 /**Fixed MOBILE-528 code added by kiran   end*/

    let reportForm = this.auditData.get('reportData') as FormArray;
    console.log(this.isDMLC);
    if (!this.isDMLC) {
      reportForm.patchValue([
        {
          /*   'auditPlan': this.data.auditReportData[0].fileName,
          'attendenceList': this.data.auditReportData[1].fileName,
          'certificate': this.data.auditReportData[2].fileName,
          'crewList': this.data.auditReportData[3].fileName, */
        },
      ]);
    } else {
      reportForm.patchValue([
        {
          /*   'auditPlan': this.data.auditReportData[0].fileName,
          'attendenceList': this.data.auditReportData[1].fileName */
          // 'certificate':this.data.auditReportData[2].fileName,
          // 'crewList':this.data.auditReportData[3].fileName,
        },
      ]);
    }

    //setting summary data

    console.log(auditData.auditSummaryId);
   
    //setting narative summary data

    let narativeSummaryForm = this.auditData.get(
      'narativeDetails'
    ) as FormArray;
    narativeSummaryForm.setValue([
      {
        narativeSummary: decodeURIComp(this.data.auditData[0].narrativeSummary),
      },
    ]);

    console.log('end of ng on init ', this.auditFormValueChangesFlag);



    // get current findings list
    this.getCurrentFindings();

    console.log(auditData);

    // to enable/disable cert issue & expiry date fields based on Audit types - MOBILE-129
    if (
      auditData.certIssuedId == this.appConstant.INTERMEDAITE_ENDORSED ||
      auditData.certIssuedId == this.appConstant.ADDITIONAL_ENDORSED
    ) {
      console.log(auditData.auditTypeId);
      this.readonlyFormFields = false;
      this.checkDirInterOrAddtnl().then((directInterAdd: any) => {
        if (!directInterAdd) this.readonlyFormFields = true;
      });
    }

    // MOBILE-6 => open/close meeting date validation with previous audit date, followup intermediate, additional
    if (auditData.auditSubTypeID == 1003) {
      this.getPreviousInitialRenewalData().then((initialRenewalData: any) => {
        console.log(initialRenewalData);

        if (initialRenewalData != undefined && initialRenewalData.length > 0) {
          this.minOpenMeetingDate = this.addYear(
            new Date(initialRenewalData[0].issueDate),
            1
          );
          this.minCloseMeetingDate = this.addYear(
            new Date(initialRenewalData[0].issueDate),
            1
          );

          this.maxOpenMeetingDate = this.addDays(
            new Date(auditData.auditDate),
            1
          );
          this.maxCloseMeetingDate = this.addDays(
            new Date(auditData.auditDate),
            1
          );
        }
      });
    }

    // open/close meeting date validation with previous audit date
    if (auditData.auditSubTypeID != 1003) {
      this.getPreviousInitialRenewalData().then((initialRenewalData: any) => {
        if (initialRenewalData != undefined && initialRenewalData.length > 0) {
          this.minOpenMeetingDate = this.addDays(
            new Date(initialRenewalData[0].auditDate),
            1
          );
          this.minCloseMeetingDate = this.addDays(
            new Date(initialRenewalData[0].auditDate),
            1
          );

          this.maxCloseMeetingDate = this.addDays(
            new Date(auditData.auditDate),
            0                                         //changed by @Archana jira id - Mobile-454
          );
          this.maxOpenMeetingDate = this.addDays(
            new Date(auditData.auditDate),
            0                                         //changed by @Archana jira id - Mobile-454
          );
        }
      });
    }
    this.auditFormValueChangesFlag=false; // added by lokesh for jira_id(655)
    /** added by lokesh for jira_id(678,844) END HERE*/
    if (this.auditData.value.narativeDetails[0].narativeSummary==''
     || this.auditData.value.narativeDetails[0].narativeSummary=='null' ||
      !this.auditData.value.narativeDetails[0].narativeSummary||
      this.auditData.value.narativeDetails[0].narativeSummary==null||
      this.auditData.value.narativeDetails[0].narativeSummary==undefined||
      this.auditData.value.narativeDetails[0].narativeSummary=="undefined"){
     this.narrativeSummaryDesc=''
    }
 /** added by lokesh for jira_id(678,844) END HERE*/
/**replaced by archana for jira id-Mobile-747 start */
 let sspDmlcAuditSeqNo =
          this.data.auditData[0].sspDetailsData.sspDmlcAuditSeqNo;
        let dmlcAutitDataVar: {};
        let dmlcfindingsListVar = [];
        if (sspDmlcAuditSeqNo) {
          console.log('sspDmlcAuditSeqNo', sspDmlcAuditSeqNo);
          this.db.getAuditdata(sspDmlcAuditSeqNo).then((dmlcAuditData) => {
            dmlcAuditData ? (this.isDmlcLinked = true) : (this.isDmlcLinked = false);

            this.db
              .getLinkedDMLReviewList(sspDmlcAuditSeqNo)
              .then((dmlcfindingsList: any) => {
                console.log('mlcAuditData', this.data);
                console.log('dmlcAuditData', dmlcAuditData);
                this.dmlcAutitDataVar = dmlcAuditData;
                console.log('DmlcfindingsList', dmlcfindingsList);
                this.dmlcfindingsListVar = dmlcfindingsList;
              });
            console.log('mlcAuditData', this.data);
            console.log('dmlcAuditData', dmlcAuditData);
          });
        } 
        /**replaced by archana for jira id-Mobile-747 end */
        this.formValueChangeForStatus = false;                       //added by archana for jira ID-MOBILE-868
        this.getPreviousAuditData().then((prevAuditData: any) => { 
          if(this.data.auditData[0]&&this.data.auditData[0].maxStatusDateCar&&prevAuditData&&(this.data.auditData[0].maxStatusDateCar>prevAuditData.auditDate)){
            let carFindingDate=moment(this.data.auditData[0].maxStatusDateCar).format('DD-MMM-YYYY')
            this.toast.presentToast('Please note recent updated CAR Findings Status date was '+carFindingDate,'warning')
          }
        })
      }
       //function added by archana for jira id-MOBILE-786
  radioButtonset(){
    this.db.getAvailableCertificatesOfCurrentUser().then((res) => {
      console.log(res);
    this.certData = res;
    this.certData.forEach((res)=>{
        if(res.auditSeqNo == this.data.auditData[0].auditSeqNo && res.vesselImoNo == this.data.auditData[0].vesselImoNo) {
          this.certDataFilter = res;
          console.log(this.certDataFilter);
          
        }
        });
        if(this.certDataFilter){
          this.radioSet = true;
        } 
      });
     
  }

  /*  setPreviousFindingRecords() {
     let req = {
       vesselImoNo: this.data.vesselData.vesselImoNo,
       companyImoNo: this.data.vesselData.companyImoNo,
       docTypeNo: this.data.vesselData.docTypeNo,
       auditDate: this.data.auditData[0].auditDate,
       auditTypeId: this.data.auditData[0].auditTypeId
     }
     this.db.getPrevFindingDetails(req).then(((pfData: any) => {
       if (pfData) {
         console.log("getPrevFindingDetails RES : ", pfData);
       }
     }))
   } */
  /*   setPreviousFindingRecords1() {
    this.db
      .getMaDatasForFindings(this.data.auditData[0].auditTypeId)
      .then((maFindingDatas) => {
        console.log('maFindingDatas', maFindingDatas);
        console.log('setPreviousFindingRecords (this.data) : ', this.data);
        let req = {
          vesselImoNo: this.data.vesselData.vesselImoNo,
          companyImoNo: this.data.vesselData.companyImoNo,
          docTypeNo: this.data.vesselData.docTypeNo,
          auditDate: this.data.auditData[0].auditDate,
          auditTypeId: this.data.auditData[0].auditTypeId,
        };
        console.log('Req params to get the previous finding data :', req);
        this.db.getPrevFindingDetails(req).then((pfData: any) => {
          console.log('getPrevFindingDetails RES : ', pfData);
          if (pfData) {
            if (pfData.finding.length > 0 || pfData.finding) {
              let findingData = [];
              //findings
              pfData.finding.forEach((findingElement) => {
                let findingDetail = [];
                findingElement.auditFlag = true;
                //details
                pfData.findingDetails.forEach((b, bIndex) => {
                  let orgSeq = b.orgSeqNo || b.curSeqNo;
                  if (
                    (b.statusId == this.appConstant.VERIFY_CLOSE ||
                      b.categoryId == this.appConstant.OBS_FINDING_CATEGORY) &&
                    findingElement.orgSeqNo == orgSeq &&
                    findingElement.findingsNo == b.findingsNo
                  ) {
                    findingElement.auditFlag = false;
                  }
                  if (
                    pfData.orgSeqNo == orgSeq &&
                    pfData.findingsNo == pfData.findingsNo &&
                    pfData.categoryId != this.appConstant.OBS_FINDING_CATEGORY
                  ) {
                    let findingAttachment = [];

                    //Attachments
                    pfData.findingAttachments.forEach((c) => {
                      let cSeqNo = c.orgSeqNo || c.curSeqNo;
                      if (
                        b.findingsSeqNo == c.findingsSeqNo &&
                        findingElement.orgSeqNo == orgSeq &&
                        findingElement.findingsNo == b.findingsNo &&
                        orgSeq == cSeqNo &&
                        findingElement.findingsNo == c.findingsNo
                      ) {
                        console.log('hitted findingAttachments 2nd ');

                        findingAttachment.push({
                          fileName: c.fileName,

                          fileSeqNo: c.fileSeqNo,

                          flag: c.flag,
                        });

                        console.log(
                          'findingAttachment data',
                          JSON.stringify(findingAttachment)
                        );
                      }
                    });

                    if (this.data.auditData[0].auditSeqNo == b.curSeqNo) {
                      // console.log("_that.auditSeqNo hitted")
                      b.updateFlag = false;
                    }
                    if (b.updateFlag == false) {
                      if (
                        pfData.findingDetails[bIndex - 1].updateFlag == true
                      ) {
                        b.minPrevDate =
                          this.data.auditAuditorData[0].openMeetingDate;
                        console.log('b.minPrevDate', b.minPrevDate);
                      }
                    }
                    findingDetail.push({
                      findingSeqNo: b.findingsSeqNo,

                      categoryId: b.categoryId,

                      //"category": catdesc,

                      description: b.description,

                      statusId: b.statusId,

                      //"status": statusdesc,

                      dueDate: b.dueDate,

                      statusDate: b.statusDate
                        ? moment(b.statusDate, 'YYYY-MM-DD').format(
                          'MMM-DD-YYYY'
                        )
                        : '',

                      nextActionId: b.nextActionId,

                      //"nextAction": nextactiondesc,

                      updateFlag: b.updateFlag,

                      minPrevDate: b.minPrevDate ? b.minPrevDate : '',

                      //"selectedImage": findingAttachment
                    });
                  }
                });
                //details ends
                findingDetail.forEach((stat) => {
                  if (
                    stat.statusId != this.appConstant.VERIFY_CLOSE ||
                    stat.categoryId != this.appConstant.OBS_FINDING_CATEGORY
                  ) {
                    if (stat.updateFlag == false) {
                      findingElement.auditFlag = true;
                    }
                  }
                });
                if (findingElement.auditFlag) {
                  let auditorNamePrev, audSubTypePrev;

                  let aauditDatePrev,
                    aaudSubTypeIdPrev,
                    aauditorIdPrev,
                    aaudSubTypePrev;

                  let adisplayFinging, aauditElements;

                  pfData.audit.forEach((item) => {
                    if (item.auditSeqNo == findingElement.orgSeqNo.toString()) {
                      aauditDatePrev = item.auditDate;
                    }
                  });
                  pfData.auditTransc.forEach((item) => {
                    if (item.auditSeqNo == findingElement.orgSeqNo.toString()) {
                      aaudSubTypeIdPrev = item.auditSubTypeId;
                      console.log(
                        'aaudSubTypeIdPrev inside loop',
                        aaudSubTypeIdPrev
                      );
                    }
                  });
                  console.log('aaudSubTypeIdPrev', aaudSubTypeIdPrev);
                  pfData.auditor.forEach((item) => {
                    if (item.auditSeqNo == findingElement.orgSeqNo.toString()) {
                      aauditorIdPrev = item.audObsId;
                    }
                  });

                  /* this.auditTypeOptions.forEach(item => {
                    if (item.auditSubtypeId == Number(aaudSubTypeIdPrev)) {
                        aaudSubTypePrev = item.auditSubtypeDesc;
                        console.log("aaudSubTypePrev inside ", aaudSubTypePrev)
  
                    }
                }); */
  /*    console.log('aaudSubTypePrev', aaudSubTypePrev);

                  let auditDatePrev = aauditDatePrev;

                  let audSubTypeIdPrev = aaudSubTypeIdPrev;

                  let auditorIdPrev = aauditorIdPrev;

                  auditorNamePrev = auditorIdPrev;

                  audSubTypePrev = aaudSubTypePrev;
                  console.log('final audSubTypePrev', audSubTypePrev);
 */
  /*  this.obsCategoryOptions.forEach(item => {
                     if (item.findingsCategoryId == findingDetail[findingDetail.length - 1].categoryId) {
                         adisplayFinging = item.findingsCategoryDesc;
                     }
                 });
   
                 this.auditCodeArray.forEach(item => {
                     if (item.auditCode == a.auditCode) {
                         aauditElements = item.auditElements;
                     }
                 });
    */
  /*    findingData.push({
                    displayFinging: adisplayFinging,

                    findingsNo: findingElement.findingsNo,

                    auditCode: findingElement.auditCode,

                    auditElements: aauditElements,
                    // "auditElements": _that.auditCodeArray.filter(item => { if (item.auditCode == a.auditCode) return item}).map(obj => obj.auditElements),

                    auditsubtype: audSubTypePrev,

                    auditor: auditorNamePrev,

                    auditdate: auditDatePrev
                      ? moment(auditDatePrev, 'YYYY-MM-DD').format(
                        'MMM-DD-YYYY'
                      )
                      : '',

                    audSeqNo:
                      findingElement.orgSeqNo || findingElement.curSeqNo,

                    // "categorySection": findingDetail
                  });
                }
              }); */
  /* console.log('Previous Findings : ', findingData);
            }
          }
        });
      });
  } */
  async certificateModal(dtl) {
    console.log(dtl);
    /* const modal = await this.modal.create({
      component: CertificateDetailsPage,
      componentProps: {
        modalDetails: dtl,
        routeUrl: this.router.url,
        modalTitle: 'audit',
      },
    });
    return await modal.present(); */

    this.router.navigate([
      '/certificate-details',
      {
        modalDetails: JSON.stringify(dtl),
        routeUrl: this.router.url,
        modalTitle: 'audit',
      },
    ]);
  }

  async goToCertDtls() {
    //console.log("certDtlInputData : ",this.certDtlInputData);
    this.db
      .getVesselCompanyData(this.data.auditData[0].vesselImoNo)
      .then((vesselData) => {
        console.log('VesselData : ', vesselData);
        this.db
          .getAuditdata(this.data.auditData[0].auditSeqNo)
          .then((auditData) => {
            console.log('AuditData : ', auditData);

            var certDtlRequiredData = {
              vesselData: vesselData[0],
              certificateNo: auditData[0].certificateNo,
              docTypeNumber: auditData[0].docTypeNumber,
              auditSeqNo: auditData[0].auditSeqNo,
              auditReportNo: auditData[0].auditReportNo,
              auditTypeId: auditData[0].auditTypeId,
              auditSubTypeId: auditData[0].auditSubTypeID,
              lockHolder: auditData[0].userIns,
              userIns: auditData[0].userIns,
              auditTypeDesc: this.auditTypeValue,
              auditSubTypeDesc: this.subTypeValue,
              auditDate: auditData[0].auditDate,
              certIssued: this.certIssuedValue,
              certIssueId: auditData[0].certIssuedId,
              auditPlace: decodeURIComp(auditData[0].auditPlace),
              certIssuedDate: auditData[0].certIssuedDate,
              certExpiredDate: auditData[0].certExpiryDate,
              auditorName: this.data.auditAuditorData[0].auditorName,
              nameToBePrinted: 'Yes',
              signToBePrinted: 'Yes',
              issuerSign: auditData[0].signature,
              signDate: new Date(),
              title: auditData[0].title,
              companyId: auditData[0].companyId,
              qid: auditData[0].qid,
              dmlcIssuePlace:
                auditData[0].sspDetailsData &&
                auditData[0].sspDetailsData.dmlcIssuePlace
                  ? decodeURIComponent(
                      window.atob(auditData[0].sspDetailsData.dmlcIssuePlace)
                    )
                  : '',
              dmlcIssueDate:
                auditData[0].sspDetailsData &&
                auditData[0].sspDetailsData.dmlcIssueDate
                  ? moment(
                      new Date(
                        parseInt(auditData[0].sspDetailsData.dmlcIssueDate)
                      )
                    ).format('YYYY-MM-DD')
                  : 'N.A',
              MaPort: this.portArray,
              status: this.statusComplete,
              completiondate:this.certDataFilter&&this.certDataFilter.completionDate?moment(this.certDataFilter.completionDate).format('YYYY-MM-DD'):
              this.subTypeValue!='INTERMEDIATE'&&this.subTypeValue!='ADDITIONAL'?moment(this.data.auditData[0].auditDate).format('YYYY-MM-DD'):'',//added by lokesh for jira_id(900)
              /* certDetails.certificateDtl.certIssueId = certDetails.certificateDtl.certificateIssuedId;
            certDetails.certificateDtl.portOfRegistry = auditAndCertData.vesselCompanyDtl.portOfRegistry;
            certDetails.certificateDtl.vesselName       = auditAndCertData.vesselCompanyDtl.vesselName;
            certDetails.certificateDtl.vesselCompanyAddress  = auditAndCertData.vesselCompanyDtl.cmpnyAdrs;
            certDetails.certificateDtl.vesselCompanyName = auditAndCertData.vesselCompanyDtl.companyName;
            certDetails.certificateDtl.companyImoNo  = auditAndCertData.vesselCompanyDtl.companyImoNo;
            certDetails.certificateDtl.vesselType = auditAndCertData.vesselCompanyDtl.vesselTypeId;
            certDetails.certificateDtl.officialNo = auditAndCertData.vesselCompanyDtl.officialNo;
            certDetails.certificateDtl.issuerName = $cookies.get('laptopUsrName');
            certDetails.certificateDtl.vesselUk = auditAndCertData.vesselCompanyDtl.vesselUk; 
            certDetails.certificateDtl.vesselPk = auditAndCertData.vesselCompanyDtl.vesselPk;
            certDetails.certificateDtl.vesselId = auditAndCertData.vesselCompanyDtl.vesselId;
            certDetails.certificateDtl.classSociety = auditAndCertData.vesselCompanyDtl.classSociety;
            certDetails.certificateDtl.callSign = auditAndCertData.vesselCompanyDtl.callSign;
            certDetails.certificateDtl.docExpiry = auditAndCertData.vesselCompanyDtl.docExpiry;
            certDetails.certificateDtl.docIssuer  = auditAndCertData.vesselCompanyDtl.docIssuer;
            certDetails.certificateDtl.docTypeNo  = auditAndCertData.vesselCompanyDtl.docTypeNo; */
            };

            console.log(
              'certificateDtlRequiredData(from audit dtl screen) : ',
              certDtlRequiredData
            );
            this.certificateModal(certDtlRequiredData);
          });
      });
    /*   if (!this.auditorData.openMeetingDate) {
  
        this.presentToast('Please Enter the ' + this.openMettingDate, "short").show();
  
    } else if (!this.auditorData.closeMeetingDate) {
  
      this.presentToast('Please Enter the ' + this.clseMetingdate, "short").show();
  
    } else if (!this.auditorData.auditPlace) {
  
      this.presentToast('Please Enter the ' + this.auditType + ' Place', "short").show();
  
    } else if (this.auditorData.auditSummaryId == this.appConstant.NOT_APPROVED_SUMMARY) {
  
      this.presentToast("Sorry, certificate cant't be generated, since the Audit Summary is marked as Not Approved", "short").show();
  
    } else if (!this.auditorData.certIssuedDate) {
  
      this.presentToast('Please Enter Certificate Issue Date', "short").show();
  
    } else if (!this.auditorData.certExpiryDate) {
  
      this.presentToast('Please Enter Certificate Expiry Date', "short").show();
  
    } else {} */
    /* const modal = await this.modal.create({
      component: CertificateModalPage,
      componentProps: {
        "modalDetails": this.data,
        "routeUrl": this.router.url,
        "modalTitle": 'asdfsdf'
      }
    })
    return await modal.present(); */
  }
  //backbutton

    ngAfterViewInit() {
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
     //added by lokesh for jira_id(802,804) START HERE
     //added by lokesh for jira_id(858)
     this.router.events
     .pipe(filter(event => event instanceof NavigationEnd))
     .subscribe((event: NavigationEnd) => {
       console.log('prev:', event.url);
       this.previousUrl = event.url;
     });
      this.router.navigateByUrl(this.router.url);
      this.alertController.getTop().then(status=>{
        this.actionSheetController.getTop().then(async actionStatus=>{
        if(status==undefined&& actionStatus==undefined){
          if(!this.auditFormValueChangesFlag){
            this.router.navigateByUrl(this.previousUrl)
            }
            else{
             const alert = this.alertController.create({
               mode: 'ios',
               header:'Mobile Application',
               message: 'Do you want to save changes before proceeding',
               cssClass: 'alertCancel',
               buttons: [
                 {
                   text: 'Yes',
                   cssClass: 'alertButton', 
                   handler: () => {
                     this.router.navigateByUrl('/perform')
                     var toastermsg = 'Data Saved Successfully...';//modified by lokesh for jira_id(822)
                           this.save(this.auditData.value, 1, toastermsg);
                   },
                 },
                 {
                   text: 'No',
                   cssClass: 'alertButton', 
                   handler: () => {
                    this.router.navigateByUrl('/perform')
                     console.log('Delete Rejected');
                   },
                 },
               ],
             });
             (await alert).present();
            }
        }
      })
      })
      this.alertController.dismiss();     
      this.actionSheetController.dismiss();  
      //added by lokesh for jira_id(802) END HERE
    });
  }
  ngOnDestroy() {
    this.backButtonSubscription.unsubscribe();
  }

  dmlcFindings(mlcAuditData, DmlcAuditData, dmlcFindingData) {
    console.log('this.data', this.data);
    this.router.navigateByUrl('/perform/dmlc-findings', {
      state: {
        mlcAuditData: mlcAuditData,
        DmlcAuditData: DmlcAuditData,
        dmlcFindingData: dmlcFindingData,
      },
    });
  }

  currentFinding() {
    console.log('this.data', this.data);
    var findingdata={
        auditSubType:this.subTypeValue,   /**added changed by lokesh for jira_id(728,727) */
        auditTypeId: this.data.auditData[0].auditTypeId,
        auditSubTypeId: this.data.auditData[0].auditSubTypeID,
        openMeetingDate: this.data.auditData[0].openMeetingDate,
        closeMeetingDate: this.data.auditData[0].closeMeetingDate,
        auditDate: this.data.auditData[0].auditDate,
        userIns: this.data.auditData[0].userIns,
        dateIns: this.data.auditData[0].dateOfIns,
        auditReportNo: this.data.auditData[0].auditReportNo,
        auditSeqNo: this.data.auditData[0].auditSeqNo,
        companyId: this.data.auditData[0].companyId,
        status: this.statusComplete,
        auditStatusId:this.data.auditData[0].auditStatusId      //added by @Ramya on 14-6-2022 for jira id - MOBILE-553
      }
    this.router.navigate(['/perform/findings-list', {
      findingDetails: JSON.stringify(findingdata),//added by lokesh for jira_id(858)
    }]);
  }

  /*  currentFinding() {
     console.log('this.data', this.data);
     /*     console.log('CurrentFinding.finding', CurrentFinding.finding);
         console.log('CurrentFinding.findingDetails', CurrentFinding.findingDetails);
         console.log('CurrentFinding.findingAttachments', CurrentFinding.findingAttachments); */

  /*   this.router.navigateByUrl('/perform/findings', {
      state: {
        auditTypeId: this.data.auditData[0].auditTypeId,
        openMeetingDate: this.data.auditData[0].openMeetingDate,
        closeMeetingDate: this.data.auditData[0].closeMeetingDate,
        userIns: this.data.auditData[0].userIns,
        dateIns: this.data.auditData[0].dateOfIns,
        auditReportNo: this.data.auditData[0].auditReportNo,
        auditSeqNo: this.data.auditData[0].auditSeqNo,
        companyId: this.data.auditData[0].companyId,
        auditDate: this.data.auditData[0].auditDate,
      },
    }); 
  }*/
  //alert(CurrentFinding.finding.length + ' ' + 'findings found');

  previousFinding() {
   var findingsdata= {
      /**added by lokesh for check box and binding data jira_id(635) START HERE */
      auditTypeTitle:this.auditType_Title,
      auditType: this.getAuditSubtype(this.auditSubTypeId)[0].auditSubtypeDesc,
      auditorName:this.auditorName,
      /** jira_id(635) END HERE*/
      auditTypeId: this.data.auditData[0].auditTypeId,
      openMeetingDate: this.data.auditData[0].openMeetingDate,
      closeMeetingDate: this.data.auditData[0].closeMeetingDate,
      userIns: this.data.auditData[0].userIns,
      dateIns: this.data.auditData[0].dateOfIns,
      auditReportNo: this.data.auditData[0].auditReportNo,
      auditSeqNo: this.data.auditData[0].auditSeqNo,
      companyId: this.data.auditData[0].companyId,
      auditDate: this.data.auditData[0].auditDate,
      auditStatusId:this.data.auditData[0].auditStatusId,   //added by @Ramya on 14-09-2022 for jira id - Mobile-553
      vesselImoNo: this.data.vesselData.vesselImoNo,
      companyImoNo: this.data.vesselData.companyImoNo,
      docTypeNo: this.data.vesselData.docTypeNo,
      port: this.data.masterData.port,
    }//added by lokesh for jira_id(858)
    this.router.navigate(['/perform/previous-findings-list', {
      findingDetails: JSON.stringify(findingsdata),
    }]);
  }

  getfindingInfodata() {
    let req = {
      vesselImoNo: this.data.vesselData.vesselImoNo,
      companyImoNo: this.data.vesselData.companyImoNo,
      docTypeNo: this.data.vesselData.docTypeNo,
      auditDate: this.data.auditData[0].auditDate,
      auditTypeId: this.data.auditData[0].auditTypeId,
    };
    this.db.getPrevFindingDetails(req).then((pfData: any) => { 
      if(pfData){
      this.previousFindingsData = pfData.finding;//modified by lokesh for jira_id(787)
      }
      /**added by archana for jira ID-MOBILE-812 start */
      if (this.previousFindingsData && this.previousFindingsData.length > 0) {
        this.previousFindingsData = this.previousFindingsData.filter((element) => {
          // return element.findingStatus == 0;
          //changed by archana for jira ID-MOBILE-881
          return (element.findingDetail[element.findingDetail.length -1].statusId != this.appConstant.VERIFIED_CLOSED ||
            element.findingDetail[element.findingDetail.length -1].curSeqNo >= this.data.auditData[0].auditSeqNo) && element.serialNo.includes('OBS') == false
        });
      }
      /**added by archana for jira ID-MOBILE-812 end */
      console.log(this.previousFindingsData);
      if (this.previousFindingsData != null && this.previousFindingsData.length>0) {
        // this.previousFindingsData.forEach((findingCategory) => {
        //   if(findingCategory.categoryId==this.appConstant.MAJOR_FINDING_CATEGORY){
        //     this.prevMNC+=1;
        //   }
        //   else if(findingCategory.categoryId==this.appConstant.MINOR_FINDING_CATEGORY){
        //     this.prevNC+=1;
        //   }
        //   else if(findingCategory.categoryId==this.appConstant.OBS_FINDING_CATEGORY){
        //     this.prevOBS+=1;
        //   }
        // });
        this.previousFindingsData.forEach((finding: any) => {
          if (
            finding.serialNo.includes('MNC') ||
            finding.serialNo.includes('MF') ||
            finding.serialNo.includes('SD')
          ) {
            this.prevMNC++;
          } else if (
            finding.serialNo.includes('NC') ||
            finding.serialNo.includes('FAILURE') ||
            finding.serialNo.includes('DEFICIENCY')
          ) {
            this.prevNC++;
          } else if (finding.serialNo.includes('OBS')) {
            this.prevOBS++;
          }
        });
      }
    });

    this.db
      .getCurrentFindingDataList(this.data.auditData[0].auditSeqNo)
      .then((findingListArray: any) => {
        console.log('FindingListArray', findingListArray);
        console.log(findingListArray);
        this.findingList = findingListArray;
        findingListArray.length > 0
          ? (this.isFindingExist = true)
          : (this.isFindingExist = false);
      });
    if(this.findingList && this.findingList.length > 0){
    this.findingList.forEach((finding) => {
      if (
        finding.serialNo.includes('MNC') ||
        finding.serialNo.includes('MF') ||
        finding.serialNo.includes('SD') ||
        finding.serialNo.includes('REVIEW NOTE') //added by archana 29-06-2022 for jira id-MOBILE-456
      ) {
        this.newMNC++;
      } else if (
        finding.serialNo.includes('NC') ||
        finding.serialNo.includes('FAILURE') ||
        finding.serialNo.includes('DEFICIENCY')
      ) {
        this.newNC++;
      } else if (finding.serialNo.includes('OBS')) {
        this.newOBS++;
      }
    });
  }
    console.log('end of get finding info');
  }
  prevandcurzero() {
    this.prevMNC = 0;
    this.prevNC = 0;
    this.prevOBS = 0;
  }
  newandcurzero() {//changed by lokesh for jira_id(787)
    this.newMNC = 0;
    this.newNC = 0;
    this.newOBS = 0;
    console.log('zero zero');
  }

  async findinginfo() {
    this.newandcurzero(); //added by lokesh for jira_id(787)
    this.getfindingInfodata();
    var msg = '';
    if (this.data.auditData[0].auditTypeId == this.appConstant.ISM_TYPE_ID) {
      this.majorFindingDesc = 'MNC';
      this.mainorFindingDesc = 'NC';
      this.obsFindingDesc = 'OBS';
    } else if (
      this.data.auditData[0].auditTypeId == this.appConstant.ISPS_TYPE_ID
    ) {
      this.majorFindingDesc = 'MF';
      this.mainorFindingDesc = 'FAILURE';
      this.obsFindingDesc = 'OBS';
    } else if (
      this.data.auditData[0].auditTypeId == this.appConstant.MLC_TYPE_ID
    ) {
      this.majorFindingDesc = 'SD';
      this.mainorFindingDesc = 'DEFICIENCY';
      this.obsFindingDesc = 'OBS';
    } else if (
      this.data.auditData[0].auditTypeId == this.appConstant.DMLC_TYPE_ID
    ) {
      this.majorFindingDesc = 'REVIEW NOTES';
    }
    if (this.data.auditData[0].auditTypeId != this.appConstant.DMLC_TYPE_ID) {
      msg = ` <table class="center"> 
      <thead><th>CATEGORY</th><th> </th><th>PF</th><th> </th><th>NF</th></thead>
      <hr>
      <tr><td>${this.majorFindingDesc}</td><td class="vino">as </td><td> ${this.prevMNC}</td><td class="vino">as </td><td>${this.newMNC}</td></tr>
      <tr><td>${this.mainorFindingDesc}</td><td class="vino">as </td><td>${this.prevNC}</td><td class="vino">as </td><td>${this.newNC}</td></tr>
      <tr><td>${this.obsFindingDesc}</td><td class="vino">as </td><td>${this.prevOBS}</td><td class="vino">as </td><td> ${this.newOBS}</td></tr>
      </table>`;
    } else {
      msg = ` <table class="center"> 
      <thead><th>CATEGORY</th><th> </th><th>RN</th></thead>
      <hr>
      <tr><td>${this.majorFindingDesc}</td><td class="vino">as </td> <td>${this.newMNC}</td></tr>
      </table>`;
    }

    

    console.log('inside findinginfo');
    console.log('CurrentFinding.finding', CurrentFinding.finding);
    const alert = this.alertController.create({
      mode: 'ios',
      header:
        this.data.auditData[0].auditTypeId != this.appConstant.DMLC_TYPE_ID
          ? 'Findings'
          : 'Review Notes',
      message: msg,
      buttons: [
        {
          text: 'Close',
          handler: () => {
            console.log('Close');
          },
        },
      ],
    });
    (await alert).present();
    this.prevandcurzero();

    console.log('end of finding info');
  }

  printReport() {
    //this.reportObj
   // this.loader.showLoader('Preparing Report');// commented by  lokesh  for  jira_id(654)
    var toastermsg = 'Report generate successfully.';
    this.save(this.auditData.value, 1, toastermsg);
     //if condision added by lokesh for jira_id(654)
     if(this.isReportValid){
      this.loader.showLoader('Preparing Report');
    this.db
      .getAuditDetailsReport(
        this.data.auditData[0].companyId,
        this.data.auditData[0].auditSeqNo
      )
      .then((res: any) => {
        console.log('audit-report-res : ', res);
        this.db
          .getVesselCompanyData(this.reportObj.vesselData.vesselImoNo)
          .then((vesselData) => {
            res.vesselName = vesselData[0].vesselName;
            this.db
              .getAuditdata(this.reportObj.auditData[0].auditSeqNo)
              .then((auditData) => {
                console.log(auditData);
                this.db
                  .getAuditAuditorData(this.reportObj.auditData[0].auditSeqNo)
                  .then((auditAuditorData) => {
                    res.auditAuditorDetail = auditAuditorData;
                    console.log('auditAuditorData', auditAuditorData);
                    res.auditRptAttach = this.data.auditReportData;
                    if (this.previousFindingsData.finding != null) {
                      this.previousFindingsData.finding.sort(function (c, d) {                                             //added by archana for jira ID-MOBILE-923
                        return c.orgSeqNo - d.orgSeqNo || c.findingsNo - d.findingsNo;
                      });
                    }
                   res.auditFinding = this.previousFindingsData != null?this.previousFindingsData.finding : []; // changed by archana for jira ID MOBILE-703
                    var newFindings = this.newFindingsList
                      ? this.newFindingsList
                      : [];

                    let ReportData = {
                      reportNo: auditData[0].auditReportNo
                        ? auditData[0].auditReportNo
                        : '',
                      VesselType: vesselData[0].vesselType
                        ? vesselData[0].vesselType
                        : '',
                      OfficialNo: vesselData[0].officialNo
                        ? vesselData[0].officialNo
                        : '',
                      dateOfReg: vesselData[0].dateOfReg
                        ? vesselData[0].dateOfReg
                        : '',
                      Grt: vesselData[0].grt ? vesselData[0].grt : '',
                      CompanyImoNo: vesselData[0].companyImoNo
                        ? vesselData[0].companyImoNo
                        : '',
                      DocTypeNo: vesselData[0].docTypeNo
                        ? vesselData[0].docTypeNo
                        : '',
                      DocIssuer: vesselData[0].docIssuer
                        ? vesselData[0].docIssuer
                        : '',
                      DocExpiry: vesselData[0].docExpiry
                        ? vesselData[0].docExpiry
                        : '',
                      CompanyAddress: vesselData[0].companyAddress
                        ? vesselData[0].companyName +
                          ',' +
                          vesselData[0].companyAddress
                        : '',
                      AuditSubTypeId: this.getAuditSubtype(
                        auditData[0].auditSubTypeID
                      )[0].auditSubtypeDesc,
                      AuditStatus: auditData[0].auditStatusId
                        ? this.getAuditStatus(auditData[0].auditStatusId)[0]
                            .auditStatusDesc
                        : '',
                      CertificateIssued:
                        this.data.auditData[0].scopeId == 1000            //changed by @Archana jira Id - Mobile-455
                          ? this.getCertificateIssued(
                              auditData[0].certIssuedId
                            )[0].certificateIssueDesc
                          : '',
                      AuditSummary:
                        auditData[0].auditSummaryId != ''
                          ? this.getSummary(auditData[0].auditSummaryId)[0]
                              .sumDesc
                          : '',
                      CurVesData: res,
                      StatusOptions: '',
                      CategoryOptions: '',
                      AuditCode: '',
                      prelimAudit: 'Yes',
                      dmlcFinding: this.dmlcfindingsListVar? this.dmlcfindingsListVar :'', //changed by archana for jira Id-MOBILE-746 
                      narrativeSummary: auditData[0].narrativeSummary
                        ? decodeURIComp(auditData[0].narrativeSummary)
                        : '',
                      PreviousDetails: res.auditFinding, // changed by archana for jira ID MOBILE-703
                      DocTypeNumber: auditData[0].docTypeNumber
                        ? auditData[0].docTypeNumber
                        : '',
                      auditFinding: newFindings,
                    };

                    console.log('ReportData', ReportData);
                    this.pdfService
                      .reportAuditGenerate(ReportData)
                      .then((res) => {
                        console.log(res);
                        if (res['data'] != '') {
                          console.log('PDF Status : ', res['data']);
                          this.toast.presentToast(
                            'Report saved Successfully.',
                            'success'
                          );
                        }
                      });
                  });
              });
          });
      });
    this.loader.hideLoader();
     }
  }

  receiptLetter() {
    console.log(this.auditData.value.auditDetails[0].openMeetingDate);
    if (this.auditData.value.auditDetails[0].openMeetingDate != ''&&this.auditData.value.auditDetails[0].openMeetingDate!=null&&!this.auditFormValueChangesFlag) {//modified by lokesh for jira_id(846,854)
      this.loader.showLoader('Preparing Letter');
      this.save(this.auditData.value,this.auditData.value.auditDetails[0].sspDetails[0].ltrStatus,'Data Saved Successfully');
      this.db
        .getVesselCompanyData(this.reportObj.vesselData.vesselImoNo)
        .then((vesselData) => {
          this.db
            .getAuditdata(this.reportObj.auditData[0].auditSeqNo)
            .then((auditData) => {
              console.log(auditData);
              this.db
                .getAuditAuditorData(this.reportObj.auditData[0].auditSeqNo)
                .then((auditAuditorData) => {
                  console.log(auditAuditorData);

                  this.auditorFullname = auditAuditorData;
                  var auditornamefilter = this.auditorFullname.filter(function (
                    otheratt
                  ) {
                    return otheratt.audObsLead == 1;
                  });
                  auditAuditorData = auditornamefilter;
                  console.log(auditornamefilter[0]);

                  let ReceiptData = {
                    certificateNo: auditData[0].auditReportNo
                      ? auditData[0].certificateNo
                      : '',
                    vesselNameAud: auditData[0].vesselNameAud
                      ? auditData[0].vesselNameAud
                      : '',
                    companyName: vesselData[0].companyName
                      ? vesselData[0].companyName
                      : '',
                    companyaddress: vesselData[0].companyAddress
                      ? vesselData[0].companyAddress
                      : '',
                    officialNoAud: auditData[0].officialNoAud
                      ? auditData[0].officialNoAud
                      : '',
                    vesselImoNo: auditData[0].vesselImoNo
                      ? auditData[0].vesselImoNo
                      : '',
                    receiptdate: auditData[0].openMeetingDate
                      ? moment(auditData[0].openMeetingDate, 'YYYYMMDD').format(
                          'DD-MMM-YYYY'
                        )
                      : '',

                    sealImage: auditData[0].seal ? auditData[0].seal : '',
                    title: auditData[0].title ? auditData[0].title : '',
                    signature: auditData[0].signature
                      ? auditData[0].signature
                      : '',
                    nameFull: auditAuditorData[0].auditorName
                      ? auditAuditorData[0].auditorName
                      : '',
                  };

                  console.log('ReceiptData', ReceiptData);
                  this.pdfService.dmlcReceiptletter(ReceiptData).then((res) => {
                    console.log(res);
                    if (res['data'] != '') {
                      console.log('PDF Status : ', res['data']);
                      this.toast.presentToast(
                        'Receipt Letter saved Successfully.',
                        'success'
                      );
                    }
                  });
                });
            });
        });
    } else {
      if (this.auditData.value.auditDetails[0].openMeetingDate == ''||this.auditData.value.auditDetails[0].openMeetingDate==null)
        this.toast.presentToast('Please Enter Receipt Date', 'danger');
        else if(this.auditFormValueChangesFlag)//added by lokesh for jira_id(854)
        this.toast.presentToast(this.auditType_Title+' has been updated , Please save the '+this.auditType_Title +' to generate Receipt Letter ','danger');
    }
  }

  amendmentReceiptLetter() {
    if (this.auditData.value.auditDetails[0].openMeetingDate != '' && this.auditData.value.auditDetails[0].openMeetingDate!=null&&!this.auditFormValueChangesFlag) {//modified by lokesh for jira_id(846,854)
      this.loader.showLoader('Preparing Letter');
      this.save(this.auditData.value,this.auditData.value.auditDetails[0].sspDetails[0].ltrStatus,'Data Saved Successfully');//added by lokesh for jira_id(845)
      this.db
        .getVesselCompanyData(this.reportObj.vesselData.vesselImoNo)
        .then((vesselData) => {
          this.db
            .getAuditdata(this.reportObj.auditData[0].auditSeqNo)
            .then((auditData) => {
              console.log(auditData);
              this.db
                .getAuditAuditorData(this.reportObj.auditData[0].auditSeqNo)
                .then((auditAuditorData) => {
                  console.log(auditAuditorData);
                  
                  this.auditorFullname = auditAuditorData;
                  let ReceiptData = {
                    certificateNo: auditData[0].auditReportNo
                      ? auditData[0].certificateNo
                      : '',
                    vesselNameAud: auditData[0].vesselNameAud
                      ? auditData[0].vesselNameAud
                      : '',
                    companyName: vesselData[0].companyName
                      ? vesselData[0].companyName
                      : '',
                    companyaddress: vesselData[0].companyAddress
                      ? vesselData[0].companyAddress
                      : '',
                    officialNoAud: auditData[0].officialNoAud
                      ? auditData[0].officialNoAud
                      : '',
                    vesselImoNo: auditData[0].vesselImoNo
                      ? auditData[0].vesselImoNo
                      : '',
                    receiptdate: auditData[0].openMeetingDate
                      ? auditData[0].openMeetingDate
                      : '',
                    sealImage: auditData[0].seal ? auditData[0].seal : '',
                    title: auditData[0].title ? auditData[0].title : '',
                    signature: auditData[0].signature
                      ? auditData[0].signature
                      : '',
                    nameFull: auditAuditorData[0].auditorName
                      ? auditAuditorData[0].auditorName
                      : '',
                    auditSubTypeID: auditData[0].auditSubTypeID
                      ? auditData[0].auditSubTypeID
                      : '',
                  };

                  console.log('ReceiptData', ReceiptData);
                  this.pdfService.dmlcReceiptletter(ReceiptData).then((res) => {
                    console.log(res);
                    if (res['data'] != '') {
                      console.log('PDF Status : ', res['data']);
                      this.toast.presentToast(
                        'Receipt Letter saved Successfully.',
                        'success'
                      );
                    }
                  });
                });
            });
        });
    } else {
      if (this.auditData.value.auditDetails[0].openMeetingDate == '')
        this.toast.presentToast('Please Enter Receipt Date', 'danger');
        else if(this.auditFormValueChangesFlag)//added by lokesh for jira_id(854)
        this.toast.presentToast(this.auditType_Title+' has been updated , Please save the '+this.auditType_Title +' to generate Amendment Receipt Letter ','danger');
    }
  }

  reviewLetter(status) {
    console.log(status);
    console.log(this.auditData);
    this.flag=false;//modified by lokesh for jira_id(824)
    console.log(this.auditData.value.auditDetails[0].auditDate);
    if (
      (this.auditData.value.auditDetails[0].auditDate != '' &&!this.auditFormValueChangesFlag&&(this.auditData.value.auditDetails[0].openMeetingDate != ''&&this.auditData.value.auditDetails[0].openMeetingDate != null)&&
      (this.auditData.value.summaryDetails[0].auditSummary == '' ||
        this.auditData.value.summaryDetails[0].auditSummary != 'Not Reviewed'))||status=="notSave"
    ) {//Condision changed by lokesh for  jira_id(840,857)
      this.data.auditData[0].sspDetailsData.ltrStatus=1;
      this.loader.showLoader('Preparing Letter');
      if(status!="notSave"){
      this.db
        .getPreviousAuditdata(this.data.vesselData.vesselImoNo, 1004, 1005)
        .then((prevAuditData) => {
          console.log('prevAuditData :', prevAuditData);

          let prevAuditDataLoad: any = [];
          prevAuditDataLoad = prevAuditData;
          this.sspDataSource = [];
          prevAuditDataLoad.forEach((arr, arrIndex) => {
            console.log(arr.certificateNo);
            console.log(prevAuditData[0].userName);
            this.sspDataSource.push({
              slno: arrIndex + 1,
              reviewtype: arr.auditSubTypeID == 1001 ? 'INITIAL' : 'AMENDMENT',
              reviewdate: arr.auditDate
                ? moment(arr.auditDate).format('DD-MMM-YYYY')
                : '',
              location: decodeURIComponent(window.atob(arr.auditPlace)),
              reviewletter: arr.certificateNo,
              dmlcissuedate: arr.closeMeetingDate
                ? moment(arr.closeMeetingDate).format('DD-MMM-YYYY')
                : '',
              inspector: arr.userName,
            });
          });
          console.log(this.sspDataSource);
          this.alignDmlcReviewLetter();
        });

      var toastermsg = 'Review letter generate successfully.';
      if (status == 'save') this.save(this.auditData.value, 1, toastermsg);
      this.db
        .getVesselCompanyData(this.reportObj.vesselData.vesselImoNo)
        .then((vesselData) => {
          this.db
            .getAuditdata(this.reportObj.auditData[0].auditSeqNo)
            .then((auditData) => {
              console.log(auditData);
              this.db
                .getAuditAuditorData(this.reportObj.auditData[0].auditSeqNo)
                .then((auditAuditorData) => {
                  console.log('auditAuditorData', auditAuditorData);

                  this.auditorFullname = auditAuditorData;
                  var auditornamefilter = this.auditorFullname.filter(function (
                    otheratt
                  ) {
                    return otheratt.audObsLead == 1;
                  });
                  auditAuditorData = auditornamefilter;
                  console.log(auditornamefilter[0]);

                  let ReviewData = {
                    certificateNo: auditData[0].auditReportNo
                      ? auditData[0].certificateNo
                      : '',
                    vesselNameAud: auditData[0].vesselNameAud
                      ? auditData[0].vesselNameAud
                      : '',
                    companyName: vesselData[0].companyName
                      ? vesselData[0].companyName
                      : '',
                    companyaddress: vesselData[0].companyAddress
                      ? vesselData[0].companyAddress
                      : '',
                    officialNoAud: auditData[0].officialNoAud
                      ? auditData[0].officialNoAud
                      : '',
                    vesselImoNo: auditData[0].vesselImoNo
                      ? auditData[0].vesselImoNo
                      : '',
                    receiptdate: auditData[0].closeMeetingDate
                      ? moment(
                          auditData[0].closeMeetingDate,
                          'YYYYMMDD'
                        ).format('DD-MMM-YYYY')
                      : '',
                    auditDate: auditData[0].auditDate
                      ? moment(auditData[0].auditDate, 'YYYYMMDD').format(
                          'DD-MMM-YYYY'
                        )
                      : '',
                    sealImage: auditData[0].seal ? auditData[0].seal : '',
                    title: auditData[0].title ? auditData[0].title : '',
                    signature: auditData[0].signature
                      ? auditData[0].signature
                      : '',
                    nameFull: auditAuditorData[0].auditorName
                      ? auditAuditorData[0].auditorName
                      : '',
                    revisionNo: auditData[0].sspDetailsData.sspRevisionNo
                      ? auditData[0].sspDetailsData.sspRevisionNo
                      : '',
                  };

                  console.log('ReviewData', ReviewData);
                  this.pdfService.dmlcReviewletter(ReviewData).then((res) => {
                    console.log(res);
                    if (res['data'] != '') {
                      console.log('PDF Status : ', res['data']);
                      this.toast.presentToast(
                        'Review letter saved Successfully.',
                        'success'
                      );
                    }
                  });
                });
            });
        });
      }//else block added by lokesh for jira_id(851)
      else{ 
        this.db
        .getVesselCompanyData(this.reportObj.vesselData.vesselImoNo)
        .then((vesselData) => {
          this.db
            .getAuditdata(this.reportObj.auditData[0].auditSeqNo)
            .then((auditData) => {
              console.log(auditData);
              this.db
                .getAuditAuditorData(this.reportObj.auditData[0].auditSeqNo)
                .then((auditAuditorData) => {
                  console.log('auditAuditorData', auditAuditorData);

                  this.auditorFullname = auditAuditorData;
                  var auditornamefilter = this.auditorFullname.filter(function (
                    otheratt
                  ) {
                    return otheratt.audObsLead == 1;
                  });
                  auditAuditorData = auditornamefilter;
                  console.log(auditornamefilter[0]);

                  let ReviewData = {
                    certificateNo: auditData[0].auditReportNo
                      ? auditData[0].certificateNo
                      : '',
                    vesselNameAud: auditData[0].vesselNameAud
                      ? auditData[0].vesselNameAud
                      : '',
                    companyName: vesselData[0].companyName
                      ? vesselData[0].companyName
                      : '',
                    companyaddress: vesselData[0].companyAddress
                      ? vesselData[0].companyAddress
                      : '',
                    officialNoAud: auditData[0].officialNoAud
                      ? auditData[0].officialNoAud
                      : '',
                    vesselImoNo: auditData[0].vesselImoNo
                      ? auditData[0].vesselImoNo
                      : '',
                    receiptdate: auditData[0].closeMeetingDate
                      ? moment(
                          auditData[0].closeMeetingDate,
                          'YYYYMMDD'
                        ).format('DD-MMM-YYYY')
                      : '',
                    auditDate: this.sspDataToShow[0].reviewdate
                      ? moment(this.sspDataToShow[0].reviewdate).format(
                          'DD-MMM-YYYY'
                        )
                      : '',
                    sealImage: auditData[0].seal ? auditData[0].seal : '',
                    title: auditData[0].title ? auditData[0].title : '',
                    signature:this.sspDataToShow[0].signature
                      ?  decodeURIComponent(
                        window.atob(this.sspDataToShow[0].signature))//moidified by lokesh for jira_id(865)
                      : '',
                    nameFull:this.sspDataToShow[0].inspector
                    ?   this.sspDataToShow[0].inspector
                      : '',
                    revisionNo: auditData[0].sspDetailsData.sspRevisionNo
                      ? auditData[0].sspDetailsData.sspRevisionNo
                      : '',
                  };

                  console.log('ReviewData', ReviewData);
                  this.pdfService.dmlcReviewletter(ReviewData).then((res) => {
                    console.log(res);
                    if (res['data'] != '') {
                      console.log('PDF Status : ', res['data']);
                      this.toast.presentToast(
                        'Review letter saved Successfully.',
                        'success'
                      );
                    }
                  });
                });
            });
        });
      }
    } else {
      if (this.auditData.value.summaryDetails[0].auditSummary == 'Not Reviewed')
        this.toast.presentToast('Review is not approved', 'danger');
      else if (
        this.auditData.value.auditDetails[0].auditDate == '' ||
        this.auditData.value.auditDetails[0].auditDate == 'Invalid date'||this.auditData.value.auditDetails[0].auditDate==null
      )
        this.toast.presentToast('Please Enter Review Date', 'danger');
        else if((this.auditData.value.auditDetails[0].openMeetingDate == ''||this.auditData.value.auditDetails[0].openMeetingDate == null))
        this.toast.presentToast('Please Enter Receipt Date', 'danger');
      else if(this.auditFormValueChangesFlag)//added by lokesh for jira_id(854)
        this.toast.presentToast(this.auditType_Title+' has been updated , Please save the '+this.auditType_Title +' to genarate Review Letter ','danger');
    }
  }

  amendmentReviewLetter(status) {
    console.log(this.data.auditData[0]);
    if (
      this.auditData.value.auditDetails[0].auditDate != '' &&(this.auditData.value.auditDetails[0].openMeetingDate != ''&&this.auditData.value.auditDetails[0].openMeetingDate != null)&&
      (this.auditData.value.summaryDetails[0].auditSummary == '' ||
        this.auditData.value.summaryDetails[0].auditSummary != 'Not Reviewed')&&(!this.auditFormValueChangesFlag)
    ) {
      this.loader.showLoader('Preparing Letter');
      this.flag=false;//modified by lokesh for jira_id(835)
      this.db.getPreviousAuditdata(this.data.vesselData.vesselImoNo, 1004, 1005).then((prevAuditData) => {
          console.log('prevAuditData :', prevAuditData);
          /**Added   By sudharsan for JIRA-ID -- 446,447,448,449 */
          this.db.checkExistsData().then((auditsequence_list) => {
            console.log('auditsequence_list: ', auditsequence_list);
            let auditsequence_list_json = JSON.parse(JSON.stringify(auditsequence_list));
            console.log('auditsequence_list_json: ', auditsequence_list_json.status);
            auditsequence_list_json.status.forEach((sequence_No)=>{
              //Number(sequence_No)
                this.db.getAuditauditorDetails(sequence_No).then((auditors_dtl)=>{
                  let auditors = JSON.parse(JSON.stringify(auditors_dtl));
                  let prevAuditDataLoad: any = [];
                  prevAuditDataLoad = prevAuditData;
                  this.sspDataSource = [];
                  prevAuditDataLoad.forEach((arr, arrIndex) => {
                    for(let i=0;i<auditors.length;i++){//added by lokesh for jira_id(842)
                      if((auditors[i].AUDIT_SEQ_NO==arr.auditSeqNo )&& arr.auditSubTypeID==1001){
                          this.userName=auditors[i].AUDITOR_NAME
                          this.signature=auditors[i].AUD_SIGNATURE
                      }
                    }
                    console.log(arr);
                    this.sspDataSource.push({
                    slno: arrIndex + 1,
                    reviewtype: arr.auditSubTypeID == 1001 ? 'INITIAL' : 'AMENDMENT',
                    reviewdate: arr.auditDate? moment(arr.auditDate).format('DD-MMM-YYYY'): '',
                    location: decodeURIComponent(window.atob(arr.auditPlace)),
                    reviewletter: arr.certificateNo,
                    dmlcissuedate: arr.closeMeetingDate? moment(arr.closeMeetingDate).format('DD-MMM-YYYY'): '',
                    inspector: arr.userName?auditors[0].AUDITOR_NAME:this.userName,
                    signature: this.signature?this.signature:arr.signature
                  });
                });
                this.alignDmlcReviewLetter();// Added by sudharsan for Jira id Mobile-499
                this.sspDataSource.forEach(function(dynamic_update){
                  if(dynamic_update.reviewtype=="INITIAL"){
                    console.log("inside initial");
                    dynamic_update.location= decodeURIComponent(window.atob(this.auditData.value.auditDetails[0].auditPlace));
                    dynamic_update.reviewdate= this.auditData.value.auditDetails[0].auditDate ? moment(this.auditData.value.auditDetails[0].auditDate).format('DD-MMM-YYYY') : "";
                    dynamic_update.dmlcissuedate= this.auditData.value.auditDetails[0].closeMeetingDate ? moment(this.auditData.value.auditDetails[0].closeMeetingDate).format('DD-MMM-YYYY') : "";   
                    dynamic_update.inspector=auditors[0].AUDITOR_NAME;
                  }
                  if(dynamic_update.reviewtype=="AMENDMENT" ){
                    console.log("inside amendment");
                    dynamic_update.location= decodeURIComponent(window.atob(this.auditData.value.auditDetails[0].auditPlace));
                    dynamic_update.reviewdate= this.auditData.value.auditDetails[0].auditDate ? moment(this.auditData.value.auditDetails[0].auditDate).format('DD-MMM-YYYY') : "";
                    dynamic_update.dmlcissuedate= this.auditData.value.auditDetails[0].closeMeetingDate ? moment(this.auditData.value.auditDetails[0].closeMeetingDate).format('DD-MMM-YYYY') : "";   
                    dynamic_update.inspector=this.auditData.value.auditDetails[0].auditorName;
                  }
                  //dynamic_update
                });
              console.log(this.sspDataSource);
            });
          });
        });
      });
      /**End here */
      var toastermsg = 'Amendment Review Letter generate successfully';
      this.data.auditData[0].sspDetailsData.ltrStatus=1; //added by lokesh for jira_id(609)
      if (status == 'save') this.save(this.auditData.value, 1, toastermsg);
      this.db
        .getVesselCompanyData(this.reportObj.vesselData.vesselImoNo)
        .then((vesselData) => {
          this.db
            .getAuditdata(this.reportObj.auditData[0].auditSeqNo)
            .then((auditData) => {
              console.log(auditData);
              this.db
                .getAuditAuditorData(this.reportObj.auditData[0].auditSeqNo)
                .then((auditAuditorData) => {
                  console.log('auditAuditorData', auditAuditorData);

                  this.auditorFullname = auditAuditorData;
                  var auditornamefilter = this.auditorFullname.filter(function (
                    otheratt
                  ) {
                    return otheratt.audObsLead == 1;
                  });
                  auditAuditorData = auditornamefilter;
                  console.log(auditornamefilter[0]);

                  let ReviewData = {
                    certificateNo: auditData[0].auditReportNo
                      ? auditData[0].certificateNo
                      : '',
                    vesselNameAud: auditData[0].vesselNameAud
                      ? auditData[0].vesselNameAud
                      : '',
                    companyName: vesselData[0].companyName
                      ? vesselData[0].companyName
                      : '',
                    companyaddress: vesselData[0].companyAddress
                      ? vesselData[0].companyAddress
                      : '',
                    officialNoAud: auditData[0].officialNoAud
                      ? auditData[0].officialNoAud
                      : '',
                    vesselImoNo: auditData[0].vesselImoNo
                      ? auditData[0].vesselImoNo
                      : '',
                    receiptdate: auditData[0].openMeetingDate
                      ? auditData[0].openMeetingDate
                      : '',
                    auditDate: auditData[0].auditDate
                      ? auditData[0].auditDate
                      : '',
                    sealImage: auditData[0].seal ? auditData[0].seal : '',
                    title: auditData[0].title ? auditData[0].title : '',
                    signature: auditData[0].signature
                      ? auditData[0].signature
                      : '',
                    nameFull: auditAuditorData[0].auditorName
                      ? auditAuditorData[0].auditorName
                      : '',
                    revisionNo: auditData[0].sspDetailsData.sspRevisionNo
                      ? auditData[0].sspDetailsData.sspRevisionNo
                      : '',
                  };

                  console.log('ReviewData', ReviewData);
                  this.pdfService
                    .dmlcAmendmentReviewLetter(ReviewData)
                    .then((res) => {
                      console.log(res);
                      if (res['data'] != '') {
                        console.log('PDF Status : ', res['data']);
                        this.toast.presentToast(
                          'Review letter saved Successfully.',
                          'success'
                        );
                      }
                    });
                });
            });
        });
    } else {
      if (this.auditData.value.summaryDetails[0].auditSummary == 'Not Reviewed')
        this.toast.presentToast('Review is not approved', 'danger');
      else if (this.auditData.value.auditDetails[0].auditDate == ''||this.auditData.value.auditDetails[0].auditDate==null)
        this.toast.presentToast('Please Enter Review Date', 'danger');
      else if((this.auditData.value.auditDetails[0].openMeetingDate == ''||this.auditData.value.auditDetails[0].openMeetingDate == null))
        this.toast.presentToast('Please Enter Receipt Date', 'danger');
      else if(this.auditFormValueChangesFlag)//added by lokesh for jira_id(854)
        this.toast.presentToast(this.auditType_Title+' has been updated , Please save the '+this.auditType_Title +' to generate Amendment Review Letter ','danger');
    }
  }

  auditCycleBtn() {
    this.currentAuditSeqNo = this.data.auditData[0].auditSeqNo;
    this.db
      .getAuditCycleDates(
        this.data.vesselData.vesselImoNo,
        this.data.auditData[0].auditTypeId
      )
      .then((auditCyleDatas: any) => {
        if (auditCyleDatas.length > 0) {
          console.log('auditCyleDates', auditCyleDatas);
          this.auditCycleEntry(auditCyleDatas);
        } else {
          this.toast.presentToast('No '+ this.auditType_Title +' Cycle found');
        }
      });
  }

  async auditCycleEntry(auditCyleDatas) {
    /* const modal = await this.modal.create({
      component: AuditcyclePage,
      componentProps: {
        CycleData: auditCyleDates,
        CurrentAuditSeqNo: this.currentAuditSeqNo,
      },
    });
    return await modal.present(); */

    this.router.navigateByUrl('/auditcycle', {
      state: {
        CycleData: auditCyleDatas,
        CurrentAuditSeqNo: this.currentAuditSeqNo,
        routeUrl: this.router.url,
      },
    });
  }
  auditDateclear(event, index) {
    event.stopPropagation();
    let auditDataForm = this.auditData.get('auditDetails') as FormArray;
    auditDataForm.at(index).get('auditDate').reset();
  }

  /** all audit-dates clear button fuction */
  clearAuditdate(ptr, index) {
    let auditDataForm = this.auditData.get('auditDetails') as FormArray;
    auditDataForm.at(index).get(ptr).reset('');
    console.log(ptr);
  }
  /** all audit-dates clear button fuction */

  clearDate(date: HTMLInputElement) {
    date.value = '';
  }
  letterHistory() {
    this.vesselDetails = true;
    this.letterHistoryview = true;
  }
  vesseldisplays() {
    this.vesselDetails = false;
    this.letterHistoryview = false;
  }
  /**Added By sudharsan for JIRA-ID -- 446,447,448,449 */
  init_reviewletter(){
    console.log("inside intialize reviewletter",this.data.auditData[0]);
    if(this.data.auditData[0].auditSubtypeId=='AMENDMENT' || this.data.auditData[0].auditSubTypeID==1002){
      this.db.getPreviousAuditdata(this.data.vesselData.vesselImoNo, 1004, 1005).then((prevAuditData) => {
        this.db.checkExistsData().then((auditsequence_list) => {
          let auditsequence_list_json = JSON.parse(JSON.stringify(auditsequence_list));
          auditsequence_list_json.status.forEach((sequence_No)=>{
              this.db.getAuditauditorDetails(sequence_No).then((auditors_dtl)=>{
                let auditors = JSON.parse(JSON.stringify(auditors_dtl));
                let prevAuditDataLoad: any = [];
                prevAuditDataLoad = prevAuditData;
                this.sspDataSource = [];
                prevAuditDataLoad.forEach((arr, arrIndex) => {
                  console.log(arr);
                    for(let i=0;i<auditors.length;i++){//added by lokesh for jira_id(842)
                  if((auditors[i].AUDIT_SEQ_NO==arr.auditSeqNo )&& arr.auditSubTypeID==1001){
                    console.log(arr);
                    console.log(auditors);
                    this.sspDataSource.push({
                      slno: arrIndex,
                      reviewtype: arr.auditSubTypeID == 1001 ? 'INITIAL' : 'AMENDMENT',
                      reviewdate: arr.auditDate? moment(arr.auditDate).format('DD-MMM-YYYY'): '',
                      location: decodeURIComponent(window.atob(arr.auditPlace)),
                      reviewletter: arr.certificateNo,
                      dmlcissuedate: arr.closeMeetingDate? moment(arr.closeMeetingDate).format('DD-MMM-YYYY'): '',
                      inspector: auditors[0].AUDITOR_NAME,
                      signature:auditors[0].AUD_SIGNATURE?auditors[0].AUD_SIGNATURE:arr.signature
                    });
                    this.alignDmlcReviewLetter();//added by lokesh for jira_id(842)
                  }
                }
              });
              this.sspDataSource.forEach(function(dynamic_update){
                if(dynamic_update.reviewtype=="INITIAL"){
                  console.log("inside initial");
                  dynamic_update.location= decodeURIComponent(window.atob(this.auditData.value.auditDetails[0].auditPlace));
                  dynamic_update.reviewdate= this.auditData.value.auditDetails[0].auditDate ? moment(this.auditData.value.auditDetails[0].auditDate).format('DD-MMM-YYYY') : "";
                  dynamic_update.dmlcissuedate= this.auditData.value.auditDetails[0].closeMeetingDate ? moment(this.auditData.value.auditDetails[0].closeMeetingDate).format('DD-MMM-YYYY') : "";   
                  dynamic_update.inspector=auditors[0].AUDITOR_NAME;
                }
                if(dynamic_update.reviewtype=="AMENDMENT" ){
                  console.log("inside amendment");
                  dynamic_update.location= decodeURIComponent(window.atob(this.auditData.value.auditDetails[0].auditPlace));
                  dynamic_update.reviewdate= this.auditData.value.auditDetails[0].auditDate ? moment(this.auditData.value.auditDetails[0].auditDate).format('DD-MMM-YYYY') : "";
                  dynamic_update.dmlcissuedate= this.auditData.value.auditDetails[0].closeMeetingDate ? moment(this.auditData.value.auditDetails[0].closeMeetingDate).format('DD-MMM-YYYY') : "";   
                  dynamic_update.inspector=this.auditData.value.auditDetails[0].auditorName;
                }
                //dynamic_update
              });
            console.log(this.sspDataSource);
          });
        });
      });
    });
    }




    if (this.data.auditData[0].auditTypeId == 1005) {
      
      this.db.checkExistsData().then((auditsequence_list) => {
        let auditsequence_list_json = JSON.parse(JSON.stringify(auditsequence_list));
        auditsequence_list_json.status.forEach((sequence_No)=>{
            this.db.getAuditauditorDetails(sequence_No).then((auditors_dtl)=>{
              let auditors = JSON.parse(JSON.stringify(auditors_dtl));
              this.sspDataSource.forEach(function(dynamic_update){
              console.log( this.auditData.value.auditDetails[0].auditSubType,"++++++++++++++++=");
              if(dynamic_update.reviewtype=="INITIAL" && this.auditData.value.auditDetails[0].auditSubType=="INITIAL"){
                console.log("inside initial");
                dynamic_update.location= decodeURIComponent(window.atob(this.auditData.value.auditDetails[0].auditPlace));
                dynamic_update.reviewdate= this.auditData.value.auditDetails[0].auditDate ? moment(this.auditData.value.auditDetails[0].auditDate).format('DD-MMM-YYYY') : "";
                dynamic_update.dmlcissuedate= this.auditData.value.auditDetails[0].closeMeetingDate ? moment(this.auditData.value.auditDetails[0].closeMeetingDate).format('DD-MMM-YYYY') : "";   
                dynamic_update.inspector=auditors[0].AUDITOR_NAME;
              }
              else if(dynamic_update.reviewtype=="AMENDMENT" && this.auditData.value.auditDetails[0].auditSubType == "AMENDMENT"){
                console.log("inside amendment");
                dynamic_update.location= decodeURIComponent(window.atob(this.auditData.value.auditDetails[0].auditPlace));
                dynamic_update.reviewdate= this.auditData.value.auditDetails[0].auditDate ? moment(this.auditData.value.auditDetails[0].auditDate).format('DD-MMM-YYYY') : "";
                dynamic_update.dmlcissuedate= this.auditData.value.auditDetails[0].closeMeetingDate ? moment(this.auditData.value.auditDetails[0].closeMeetingDate).format('DD-MMM-YYYY') : "";   
                dynamic_update.inspector=this.auditData.value.auditDetails[0].auditorName;
              }
              //dynamic_update
              });
            });
            console.log(this.sspDataSource);
          });
        });
    }
  }
  /**End here */
// Added by sudharsan for Jira id Mobile-499
  alignDmlcReviewLetter(){
    let newsspDS=[];
    console.log("=======================================",this.data.auditData[0]);
   
    for(let index=this.sspDataSource.length-1; index>=0;index--){
        console.log(this.sspDataSource);
        console.log(this.sspDataSource.length);
        console.log(this.sspDataSource[index]);
        newsspDS.push({
          slno: this.sspDataSource[index].reviewtype == 'INITIAL'? 1 : 2,
          reviewtype: this.sspDataSource[index].reviewtype,
          reviewdate: this.sspDataSource[index].reviewdate? moment(this.sspDataSource[index].reviewdate).format('DD-MMM-YYYY'): '',
          location: this.sspDataSource[index].location,
          reviewletter: this.sspDataSource[index].reviewletter,
          dmlcissuedate: this.sspDataSource[index].dmlcissuedate? moment(this.sspDataSource[index].dmlcissuedate).format('DD-MMM-YYYY'): '',
          inspector: this.sspDataSource[index].inspector,
          signature:this.sspDataSource[index].signature,
        });
    }
    this.db.getAuditdata(this.data.auditData[0].auditSeqNo).then((auditData) => {
      console.log(auditData);
      if(auditData[0].auditSummaryId==1005 && auditData[0].auditSubTypeID==1002 && this.sspDataSource.length>1){
          console.log("not reviewed",this.sspDataSource);
          // this.sspDataSource.pop();              // removed by archana for jira ID-MOBILE-852
      }
  });
    this.sspDataSource=newsspDS;
    this.sspDataToShow=newsspDS;   //added by lokesh for jira_id()
    this.summaryLetterHistory();  //added by archana for jira ID-MOBILE-852 
  }
   /**added by archana for back button implementation start */
   async goBack() {
    //added by lokesh for jira_id(802,804) START HERE
    if(!this.auditFormValueChangesFlag){
     this.router.navigateByUrl('/perform')
     }
     else{
      const alert = this.alertController.create({
        mode: 'ios',
        header:'Mobile Application',
        message: 'Do you want to save changes before proceeding',
        cssClass: 'alertCancel',
        buttons: [
          {
            text: 'Yes',
            cssClass: 'alertButton', 
            handler: () => {
              this.router.navigateByUrl('/perform')
              var toastermsg =  'Data Saved Successfully...';//modified by lokesh for jira_id(822)
                    this.save(this.auditData.value, 1, toastermsg);
            },
          },
          {
            text: 'No',
            cssClass: 'alertButton', 
            handler: () => {
              this.router.navigateByUrl('/perform')
              console.log('Delete Rejected');
            },
          },
        ],
      });
      (await alert).present();
     }
     //added by lokesh for jira_id(802) End HERE
  } 
   /**added by archana for back button implementation end */
  //end here
  //added by lokesh for jira_id(828)
  onTabChange(tabs){
  console.log('tabs are changing');
  if(this.isIOS){
  window.getSelection().removeAllRanges();
  }
  }
}
