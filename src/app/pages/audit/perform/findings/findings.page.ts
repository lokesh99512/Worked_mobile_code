import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormGroupDirective } from '@angular/forms';
import { Router } from '@angular/router';
import { Platform, ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { CurrentFinding } from 'src/app/interfaces/finding';
import { File } from '@ionic-native/file/ngx';
import { DatabaseService } from 'src/app/providers/database.service';
import { LoadingIndicatorService } from 'src/app/providers/loading-indicator.service';
import { ToastService } from 'src/app/providers/toast.service';
import { AppConstant } from 'src/app/constants/app.constants';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import * as moment from 'moment';


/*
1. created in central - display,update,delete
2. create new in local - create,display,update,delete
3. central+local findings -  ,,
 */
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD-MMM-YYYY',
  },
  display: {
    dateInput: 'DD-MMM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-findings',
  templateUrl: './findings.page.html',
  styleUrls: ['./findings.page.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class FindingsPage implements OnInit, OnDestroy, AfterViewInit {
  cardDetailsFlag: boolean = true;
  // backButtonSubscription;
  users;
  datePickerObjPtBr: any = {};
  datePickerObj: any = {};
  selectedDate;
  mydate = "";
  findingsForm: FormGroup;
  @ViewChild('findingsDataForm', { static: false }) findingsDataForm: FormGroupDirective;
  //auditType;
  //auditTypeDesc;
  data = {
    findings: [
      {
        "displayFinging": '',
        "auditSeqNo": '',
        "findingSeqNo": '',
        "companyId": '',
        "auditTypeId": '',
        "auditDate": '',
        "auditCode": '',
        "selection": '',
        "elements": '',
        "findingStatus": '',
        "userIns": "",
        "dateIns": "",
        findingDetail: [
          {
            "statusSeqNo": '',
            "findingSeqNo": '',
            "origAuditSeqNo": '',
            "currentAuditSeq": '',
            "companyId": '',
            "auditTypeId": '',
            "categoryId": '',
            "statusId": '',
            "statusDate": "",
            "nextActionId": '',
            "dueDate": "",
            "descriptions": "",
            "userIns": "",
            "dateIns": "",
            findingRptAttachs: [
              {
                "fileName": "",
                "findingFileByte": "",
                "fileSeqNo": '',
                "ownerFlag": '',
                "userIns": "",
                "dateIns": "",
                "findingSeqNo": '',
                "origAuditSeqNo": '',
                "currentAuditSeq": '',
                "companyId": '',
                "statusSeqNo": '',
                "auditTypeId": ''
              }
            ]
          }
        ],
        // "newCreate": '',
        "serialNo": ""
      }
    ]
  }
  auditCodeArr: any;
  users1: (arg0: string, auditElementsArr: any) => void;
  auditElementsArr: (arg0: string, auditElementsArr: any) => void;
  auditElements: any;
  findingStatusOpt: any;
  findingCategoryOpt: any;
  findingId: any = 1;
  categoryEnabled: boolean;
  disabled: boolean = true;
  auditStatus: any;
  auditCategory: any;
  auditCatEnable: boolean = false;
  tempCatgValue: any;
  isStatusEnabled: boolean;
  maxFindDtlLength: any;
  disabledNxtActionArr0: any[];
  disabledNxtActionArr1: any[];
  disabledNxtActionArr2: any[];
  disabledNxtActionArr3: any[];
  minStatusDate: any;
  minDueDate: any;
  maxDueDate: any;
  maxStatusDate: any;
  backButtonSubscription: any;
  auditReportNo: any;
  closeMeetingDate: any;
  catSeqNo: number;
  openMeetingDate: any;
  setNewFinding: boolean;
  isNewFindingsAddedFromUI: boolean;
  findingCategoryOpt1: any;
  auditCat1: any = 0;
  auditCat2: any = 0;
  auditCat3: any = 0;
  auditCatNo: any;
  auditSeqNumber: any;
  compId: any;
  currentlyChoosenFile: File;
  filenameDisplayFlag: boolean;


  //new variables
  auditTypeId: any;
  pageTitle: any;
  auditType;
  majorCountDesc;
  minorCountDesc;
  obsCountDesc;
  auditauditType;
  reviewCountDesc
  auditType1
  auditTypeDesc;

  setFindings() {
    console.log('SET NEW FINDINGS...');
    console.log('disabled ::', this.disabled);
    console.log('isEnabled::', this.auditCatEnable);
    console.log("auditCatEnable", this.auditCatEnable);

    console.log('catSeqNo::', this.catSeqNo);


    // if(!this.disabled){
    //   this.disabled=true;
    //   this.categoryEnabled=false;      
    // }

    if (this.auditCatEnable) {
      this.auditCatEnable = false;
    }


    let control = <FormArray>this.findingsForm.controls.findings;
    this.data.findings.forEach(x => {
      console.log('xxxxxxx', x)
      control.push(this.fb.group({
        displayFinging: x.displayFinging,
        auditSeqNo: x.auditSeqNo,
        findingSeqNo: x.findingSeqNo,
        companyId: 2,
        auditTypeId: x.auditTypeId,
        auditDate: x.auditDate,
        auditCode: x.auditCode,
        selection: x.selection,
        elements: x.elements,
        findingStatus: x.findingStatus,
        userIns: x.userIns,
        dateIns: x.dateIns,
        serialNo: x.serialNo,
        findingDetail: this.setFindingDetail(x)
      }))
    })
  }

  setFindingDetail(x) {
    let arr = new FormArray([])
    console.log(x.findingDetail);
    x.findingDetail.forEach(y => {
      arr.push(this.fb.group({
        statusSeqNo: y.statusSeqNo,
        findingSeqNo: y.findingSeqNo,
        origAuditSeqNo: y.origAuditSeqNo,
        currentAuditSeq: y.currentAuditSeq,
        companyId: y.companyId,
        auditTypeId: y.auditTypeId,
        categoryId: y.categoryId,
        statusId: y.statusId,
        statusDate: moment(y.statusDate, "DD-MMM-YYYY"),
        nextActionId: y.nextActionId,
        dueDate: y.dueDate,
        descriptions: y.descriptions,
        userIns: y.userIns,
        dateIns: y.dateIns,
        findingRptAttachs: this.setFindingReport(),
        newCreate: y.newCreate,
        serialNo: y.serialNo
      }))
    })
    return arr;
  }
  setFindingReport() {
    let arr = new FormArray([])

    /* y.findingRptAttachs.forEach(z => {
      arr.push(this.fb.group({ 
        fileName: z.fileName,
        findingFileByte:z.findingFileByte,
        fileSeqNo: z.fileSeqNo,
        ownerFlag: z.ownerFlag,
        userIns: z.userIns,
        dateIns: z.dateIns,
        findingSeqNo: z.findingSeqNo,
        origAuditSeqNo: z.origAuditSeqNo,
        currentAuditSeq: z.currentAuditSeq,
        companyId: z.companyId,
        statusSeqNo: z.statusSeqNo,
        auditTypeId: z.auditTypeId,
      }))
  })
*/
    return arr;
  }

  addFindingReports(control) {
    control.push(
      this.fb.group({
        fileName: [''],
        findingFileByte: [''],
        fileSeqNo: [''],
        ownerFlag: [''],
        userIns: [''],
        dateIns: [''],
        findingSeqNo: [''],
        origAuditSeqNo: [''],
        currentAuditSeq: [''],
        companyId: [''],
        statusSeqNo: [''],
        auditTypeId: [''],
      }))
  }

  addFindingDetail(control) {
    console.log('addFindingDetail,,,,,,,,,,,,,')
    control.push(
      this.fb.group({
        statusSeqNo: [''],
        findingSeqNo: [''],
        origAuditSeqNo: [''],
        currentAuditSeq: [''],
        companyId: [''],
        auditTypeId: [''],
        categoryId: [''],
        statusId: [''],
        statusDate: [''],
        nextActionId: [''],
        dueDate: [''],
        descriptions: [''],
        userIns: [''],
        dateIns: [''],
        findingRptAttachs: this.fb.array([]),
        newCreate: [''],
        serialNo: [''],
      }))
  }

  addNewFindings() {

    if (this.findingId != 1) {
      this.findingId++
    }

    console.log('ADD NEW FINDINGS...');
    console.log('disabled ::', this.disabled);
    console.log('isEnabled::', this.categoryEnabled);


    let control = <FormArray>this.findingsForm.controls.findings;
    control.push(
      this.fb.group({
        displayFinging: [''],
        auditSeqNo: [''],
        findingSeqNo: [''],
        companyId: [''],
        auditTypeId: [''],
        auditDate: [''],
        auditCode: [''],
        selection: [''],
        elements: [''],
        findingStatus: [''],
        userIns: [''],
        dateIns: [''],
        serialNo: [''],
        findingDetail: this.fb.array([])
      })
    )
  }

  addFindingsFromUI() {
    console.log("addFindingsFromUI");
    console.log((CurrentFinding.findingDetails).length);
    console.log((CurrentFinding.findingDetails));

    this.isNewFindingsAddedFromUI = true;
    this.setFindings();
  }

  deleteFindings(index) {
    console.log('index', index)
    let control = <FormArray>this.findingsForm.controls.findings;
    control.removeAt(index);
  }

  deleteFindingDetail(control, index) {
    console.log(index, 'Index')
    control.removeAt(index)
  }

  deleteFindingAttachments(control, index) {
    control.removeAt(index)
  }



  viewDetailsToggle(index) {
    if (this.cardDetailsFlag == index) {
      this.cardDetailsFlag = null;
    } else {
      this.cardDetailsFlag = index;
    }
  }

  //  OnChange Functions ............

  auditCodeChange(event, index) {

    if (this.cardDetailsFlag != index) {
      this.viewDetailsToggle(index);
    }

    this.auditCatEnable = true;
    console.log(event.value.split(',')[0]);

    let findings = this.findingsForm.get('findings') as FormArray;
    console.log(findings);
    console.log("Display Finging " + index + " :", findings.at(index).get('displayFinging'));

    let element = this.getAuditElement(event.value.split(',')[0]);

    console.log('element', element[0].AUDIT_ELEMENTS)

    findings.at(index).get('elements').setValue(element[0].AUDIT_ELEMENTS)

    findings.at(index).get('auditCode').setValue(event.value.split(',')[0])

  }

  auditCategoryChange(event, index, j) {
    console.log('catSeqNo::', event);


    if (this.auditTypeId === 1001) {
      console.log("Inside IF")

      if (event.value === 'MNC') {
        console.log("Inside MNC")
        this.maxFindDtlLength = 3;
        this.auditCat1++;
        this.auditCatNo = this.auditCat1;

      }
      else if (event.value === 'NC') {
        console.log("Inside NC")
        this.maxFindDtlLength = 2;
        this.auditCat2++;
        this.auditCatNo = this.auditCat2;

      }
      else if (event.value === 'OBS') {
        console.log("Inside OBS")
        this.maxFindDtlLength = 0;
        this.auditCat3++;
        this.auditCatNo = this.auditCat3;

      }
    }
    else if (this.auditTypeId === 1002) {
      console.log("Inside IF")

      if (event.value === 'MF') {
        console.log("Inside MF")
        this.maxFindDtlLength = 3;
        this.auditCat1++;
        this.auditCatNo = this.auditCat1;

      }
      else if (event.value === 'FAILURE') {
        console.log("Inside FAILURE")
        this.maxFindDtlLength = 3;
        this.auditCat2++;
        this.auditCatNo = this.auditCat2;

      }
      else if (event.value === 'OBS') {
        console.log("Inside OBS")
        this.maxFindDtlLength = 0;
        this.auditCat3++;
        this.auditCatNo = this.auditCat3;

      }
    }
    else if (this.auditTypeId === 1003) {
      console.log("Inside IF")

      if (event.value === 'SD') {
        console.log("Inside SD")
        this.maxFindDtlLength = 3;
        this.auditCat1++;
        this.auditCatNo = this.auditCat1;
      }
      else if (event.value === 'DEFICIENCY') {
        console.log("Inside DEFICIENCY")
        this.maxFindDtlLength = 2;
        this.auditCat2++;
        this.auditCatNo = this.auditCat2;
      }
      else if (event.value === 'OBS') {
        console.log("Inside OBS")
        this.maxFindDtlLength = 0;
        this.auditCat3++;
        this.auditCatNo = this.auditCat3;
      }
    }


    console.log('I::' + index, 'J::' + j);
    console.log(event.value, index);
    console.log("this.closeMeetingDate", this.closeMeetingDate)
    this.categoryEnabled = true;
    this.disabled = false;

    this.tempCatgValue = event.value;

    let findings = this.findingsForm.get('findings') as FormArray;

    findings.at(index).get('displayFinging').setValue(this.auditReportNo + "-" + event.value + "-" + this.auditCatNo)

    let findingDetails = findings.at(index).get('findingDetail') as FormArray;

    findingDetails.at(j).get('statusId').setValue('OPEN');

    if (this.closeMeetingDate != "Invalid Date") {
      findingDetails.at(j).get('statusDate').setValue(this.closeMeetingDate.toISOString());
    }

    findingDetails.at(j).get('statusDate').enable();



  }

  auditStatusChange(event, index, j) {

    console.log(event.value, index, j)

    let findings = this.findingsForm.get('findings') as FormArray;
    // findingDetails.at(j).get('categoryId').setValue('MNC');

  }

  statusDateChange(event, index, j) {
    console.log(event, index, j);
    this.isStatusEnabled = true;
    this.setDisableNxtActionArr(index, j);

  }

  setDisableNxtActionArr(index, j) {
    console.log("#######################################################");
    console.log('setDisableNxtActionArr');
    console.log('J::', j)
    let findings = this.findingsForm.get('findings') as FormArray;
    let findingDetails = findings.at(index).get('findingDetail') as FormArray;
    console.log('Status ID ::', findingDetails.at(j).get('statusId').value);

    console.log(this.findingStatusOpt);

    let tempFindStatusOpt = JSON.parse(JSON.stringify(this.findingStatusOpt));

    console.log(tempFindStatusOpt)



    if (this.auditTypeId === 1001) {
      console.log('AUDIT TYPE 1001', this.tempCatgValue)
      switch (this.tempCatgValue) {
        case 'MNC':
          console.log('MNC')
          if (findingDetails.at(j).get('statusId').value === 'OPEN') {
            console.log("OPEN...")
            this.disabledNxtActionArr0 = tempFindStatusOpt.filter(res => {
              return res != 'DOWNGRADE' && res != 'PREVIOUS STATUS'
            })
            if (this.openMeetingDate != "Invalid Date") {
              this.minStatusDate = this.openMeetingDate.toISOString();
            }
            if (this.closeMeetingDate != "Invalid Date") {
              this.maxStatusDate = this.closeMeetingDate.toISOString();
              this.minDueDate = this.closeMeetingDate.toISOString();
            }
            console.log(this.disabledNxtActionArr0);
          }
          else if (findingDetails.at(j).get('statusId').value === 'DOWNGRADED') {
            this.disabledNxtActionArr1 = tempFindStatusOpt.filter(res => {
              return res != 'PLAN ACCEPTED' && res != 'PREVIOUS STATUS'
            });
            console.log('this.minStatusDate::', this.minStatusDate);
            console.log(findingDetails.at(j).get('statusDate').value);
            this.minStatusDate = findingDetails.at(j).get('statusDate').value;
            if (this.closeMeetingDate != "Invalid Date") {
              this.maxStatusDate = this.closeMeetingDate.toISOString();
            }
            let date = new Date(new Date(this.closeMeetingDate).getTime() + (29 * 24 * 60 * 60 * 1000));
            if (this.closeMeetingDate != "Invalid Date") {
              findingDetails.at(j).get('dueDate').setValue(date.toISOString());
            }
          }
          else if (findingDetails.at(j).get('statusId').value === 'PLAN ACCEPTED') {
            this.disabledNxtActionArr2 = tempFindStatusOpt.filter(res => {
              return res != 'VERIFY / CLOSE' && res != 'PREVIOUS STATUS'
            });
            this.minStatusDate = findingDetails.at(j).get('statusDate').value;
            if (this.closeMeetingDate != "Invalid Date") {
              this.maxStatusDate = this.closeMeetingDate.toISOString();
            }
            let date = new Date(new Date(this.closeMeetingDate).getTime() + (89 * 24 * 60 * 60 * 1000));
            if (this.closeMeetingDate != "Invalid Date") {
              findingDetails.at(j).get('dueDate').setValue(date.toISOString());
            }
          }
          else if (findingDetails.at(j).get('statusId').value === 'VERIFIED /CLOSED') {
            this.disabledNxtActionArr3 = tempFindStatusOpt.filter(res => {
              return res != 'NIL' && res != 'PREVIOUS STATUS'
            });
            this.minStatusDate = findingDetails.at(j).get('statusDate').value;
            if (this.closeMeetingDate != "Invalid Date") {
              this.maxStatusDate = this.closeMeetingDate.toISOString();
            }
          }
          console.log('this.disabledNxtActionArr' + j)
          break;
        case 'NC':
          console.log('NC')
          if (findingDetails.at(j).get('statusId').value === 'OPEN') {
            this.disabledNxtActionArr0 = tempFindStatusOpt.filter(res => {
              return res != 'PLAN ACCEPTED' && res != 'PREVIOUS STATUS'
            });
            let date = new Date(new Date(this.closeMeetingDate).getTime() + (29 * 24 * 60 * 60 * 1000));
            console.log("this.closeMeetingDate", this.closeMeetingDate);
            console.log(date);
            if (this.closeMeetingDate != "Invalid Date") {
              findingDetails.at(j).get('dueDate').setValue(date.toISOString());
            }

          }
          else if (findingDetails.at(j).get('statusId').value === 'PLAN ACCEPTED') {
            this.disabledNxtActionArr1 = tempFindStatusOpt.filter(res => {
              return res != 'VERIFY / CLOSE' && res != 'PREVIOUS STATUS'
            })
          }
          else if (findingDetails.at(j).get('statusId').value === 'VERIFIED /CLOSED') {
            this.disabledNxtActionArr2 = tempFindStatusOpt.filter(res => {
              return res != 'NIL' && res != 'PREVIOUS STATUS'
            })
          }
          console.log('this.disabledNxtActionArr' + j)
          break;
        case 'OBS':
          if (findingDetails.at(j).get('statusId').value === 'OPEN') {
            console.log("OPEN...")
            this.disabledNxtActionArr0 = tempFindStatusOpt.filter(res => {
              return res != 'NIL'
            })
            console.log(this.disabledNxtActionArr0);
          }
          console.log('this.disabledNxtActionArr' + j)
          break;


      }
    }
    else if (this.auditTypeId === 1002) {

      console.log('AUDIT TYPE 1002', this.tempCatgValue)
      switch (this.tempCatgValue) {
        case 'MF':
          console.log('MF')
          if (findingDetails.at(j).get('statusId').value === 'OPEN') {
            console.log("OPEN...")
            this.disabledNxtActionArr0 = tempFindStatusOpt.filter(res => {
              return res != 'DOWNGRADE (RESTORE COMPLIANCE)' && res != 'PREVIOUS STATUS'
            })
            console.log(this.disabledNxtActionArr0);
          }
          else if (findingDetails.at(j).get('statusId').value === 'DOWNGRADED (COMPLIANCE RESTORED)') {
            this.disabledNxtActionArr1 = tempFindStatusOpt.filter(res => {
              return res != 'PLAN ACCEPTED' && res != 'PREVIOUS STATUS'
            })
          }
          else if (findingDetails.at(j).get('statusId').value === 'PLAN ACCEPTED') {
            this.disabledNxtActionArr2 = tempFindStatusOpt.filter(res => {
              return res != 'VERIFY / CLOSE' && res != 'PREVIOUS STATUS'
            })
          }
          else if (findingDetails.at(j).get('statusId').value === 'VERIFIED /CLOSED') {
            this.disabledNxtActionArr3 = tempFindStatusOpt.filter(res => {
              return res != 'NIL' && res != 'PREVIOUS STATUS'
            })
          }
          console.log('this.disabledNxtActionArr' + j)
          break;
        case 'FAILURE':
          console.log('FAILURE')
          if (findingDetails.at(j).get('statusId').value === 'OPEN') {
            this.disabledNxtActionArr0 = tempFindStatusOpt.filter(res => {
              return res != 'RESTORE COMPLIANCE' && res != 'PREVIOUS STATUS'
            })
          }
          else if (findingDetails.at(j).get('statusId').value === 'COMPLIANCE RESTORED') {
            this.disabledNxtActionArr1 = tempFindStatusOpt.filter(res => {
              return res != 'PLAN ACCEPTED' && res != 'PREVIOUS STATUS'
            })
          }
          else if (findingDetails.at(j).get('statusId').value === 'PLAN ACCEPTED') {
            this.disabledNxtActionArr2 = tempFindStatusOpt.filter(res => {
              return res != 'VERIFY / CLOSE' && res != 'PREVIOUS STATUS'
            })
          }
          else if (findingDetails.at(j).get('statusId').value === 'VERIFIED /CLOSED') {
            this.disabledNxtActionArr3 = tempFindStatusOpt.filter(res => {
              return res != 'NIL' && res != 'PREVIOUS STATUS'
            })
          }
          console.log('this.disabledNxtActionArr' + j)
          break;
        case 'OBS':
          if (findingDetails.at(j).get('statusId').value === 'OPEN') {
            console.log("OPEN...")
            this.disabledNxtActionArr0 = tempFindStatusOpt.filter(res => {
              return res != 'NIL'
            })
            console.log(this.disabledNxtActionArr0);
          }
          console.log('this.disabledNxtActionArr' + j)
          break;


      }
    }
    else if (this.auditTypeId === 1003) {

      console.log('AUDIT TYPE 1003', this.tempCatgValue)
      switch (this.tempCatgValue) {
        case 'SD':
          console.log('SD')
          if (findingDetails.at(j).get('statusId').value === 'OPEN') {
            console.log("OPEN...")
            this.disabledNxtActionArr0 = tempFindStatusOpt.filter(res => {
              return res != 'DOWNGRADE (RECTIFY)' && res != 'PREVIOUS STATUS'
            })
            console.log(this.disabledNxtActionArr0);
          }
          else if (findingDetails.at(j).get('statusId').value === 'DOWNGRADED (RECTIFIED)') {
            this.disabledNxtActionArr1 = tempFindStatusOpt.filter(res => {
              return res != 'PLAN ACCEPTED' && res != 'PREVIOUS STATUS'
            })
          }
          else if (findingDetails.at(j).get('statusId').value === 'PLAN ACCEPTED') {
            this.disabledNxtActionArr2 = tempFindStatusOpt.filter(res => {
              return res != 'VERIFY / CLOSE' && res != 'PREVIOUS STATUS'
            })
          }
          else if (findingDetails.at(j).get('statusId').value === 'VERIFIED /CLOSED') {
            this.disabledNxtActionArr3 = tempFindStatusOpt.filter(res => {
              return res != 'NIL' && res != 'PREVIOUS STATUS'
            })
          }
          console.log('this.disabledNxtActionArr' + j)
          break;
        case 'DEFICIENCY':
          console.log('DEFICIENCY')
          if (findingDetails.at(j).get('statusId').value === 'OPEN') {
            this.disabledNxtActionArr0 = tempFindStatusOpt.filter(res => {
              return res != 'PLAN ACCEPTED' && res != 'PREVIOUS STATUS'
            })
          }
          else if (findingDetails.at(j).get('statusId').value === 'PLAN ACCEPTED') {
            this.disabledNxtActionArr1 = tempFindStatusOpt.filter(res => {
              return res != 'VERIFY / CLOSE' && res != 'PREVIOUS STATUS'
            })
          }
          else if (findingDetails.at(j).get('statusId').value === 'VERIFIED /CLOSED') {
            this.disabledNxtActionArr2 = tempFindStatusOpt.filter(res => {
              return res != 'NIL' && res != 'PREVIOUS STATUS'
            })
          }
          console.log('this.disabledNxtActionArr' + j)
          break;
        case 'OBS':
          if (findingDetails.at(j).get('statusId').value === 'OPEN') {
            console.log("OPEN...")
            this.disabledNxtActionArr0 = tempFindStatusOpt.filter(res => {
              return res != 'NIL'
            })
            console.log(this.disabledNxtActionArr0);
          }
          console.log('this.disabledNxtActionArr' + j)
          break;


      }
    }
    console.log("#######################################################");
  }

  isStatusDateEnable(i, j) {
    let findings = this.findingsForm.get('findings') as FormArray;
    let findingDetails = findings.at(i).get('findingDetail') as FormArray;
    //console.log('Status Date ::',findingDetails.at(j).get('statusDate'))
    if (findingDetails.at(j).get('statusDate').value != "") {
      return true
    }
    else {
      return false
    }

  }


  auditNxtActionChange(event, index, j, find) {


    console.log("auditNxtActionChange...........");


    this.isStatusEnabled = false;
    console.log('find', find)
    console.log(event.value, index, j);
    console.log('this.maxFindDtlLength', this.maxFindDtlLength);
    console.log('this.tempCatgValue', this.tempCatgValue);

    let findings = this.findingsForm.get('findings') as FormArray;
    let findingDetails = findings.at(index).get('findingDetail') as FormArray;
    let findingReport = findingDetails.at(j).get('findingRptAttachs') as FormArray;

    console.log("findingReport", findingReport.value)

    if (j > 0 && event.value != 'PREVIOUS STATUS') {
      console.log('disable')
      // findingDetails.at(j - 1).disable();
      findingDetails.at(j - 1).disable();
      for (let i = 0; i < findingReport.value.length; i++) {
        console.log(findingReport.at(i).get('fileName').value);
        findingReport.at(i).get('fileName').disable();
      }

    }


    if (event.value === 'PREVIOUS STATUS') {

      if (j > 0) {
        findingDetails.at(j - 1).get('statusDate').enable();
        findingDetails.at(j - 1).get('dueDate').enable();
        findingDetails.at(j - 1).get('nextActionId').enable();
        findingDetails.at(j - 1).get('descriptions').enable();

      }

      findingDetails.at(j).get('statusDate').setValue("");
      findingDetails.at(j).get('dueDate').reset();
      findingDetails.at(j).get('nextActionId').reset();

      console.log(findingDetails.at(j + 1))

      if (findingDetails.at(j + 1) != undefined) {
        console.log('delete finding dtl...')
        this.deleteFindingDetail(find.controls.findingDetail, j + 1);
      }
      if (j != 0) {
        this.setDisableNxtActionArr(index, j - 1);
      }

    }

    if (j < this.maxFindDtlLength && event.value != 'PREVIOUS STATUS') {

      console.log('j+1')
      this.addFindingDetail(find.controls.findingDetail);

      findingDetails.at(j + 1).get('categoryId').setValue(this.tempCatgValue);



      switch (event.value) {
        case "DOWNGRADE":
          //console.log('DOWNGRADED')
          findingDetails.at(j + 1).get('statusId').setValue('DOWNGRADED')
          break;

        case "DOWNGRADE (RESTORE COMPLIANCE)":
          //console.log('DOWNGRADED')
          findingDetails.at(j + 1).get('statusId').setValue('DOWNGRADED (COMPLIANCE RESTORED)')
          break;

        case "DOWNGRADE (RECTIFY)":
          //console.log('DOWNGRADED')
          findingDetails.at(j + 1).get('statusId').setValue('DOWNGRADED (RECTIFIED)')
          break;

        case "RESTORE COMPLIANCE":
          //console.log('DOWNGRADED')
          findingDetails.at(j + 1).get('statusId').setValue('COMPLIANCE RESTORED')
          break;

        case "PLAN ACCEPTED":
          //console.log('PLAN ACCEPTED')
          findingDetails.at(j + 1).get('statusId').setValue('PLAN ACCEPTED')
          break;
        case "VERIFY / CLOSE":
          //console.log('VERIFY/CLOSE')
          findingDetails.at(j + 1).get('statusId').setValue('VERIFIED /CLOSED')
          break;
      }
      // findingDetails.at(j+1).get('statusDate').enable();
      // findingDetails.at(j+1).get('dueDate').enable();
      // console.log(findingDetails.at(j+1).get('statusDate').disabled)
    }

    console.log("this.findingsForm", this.findingsForm.value)

    // findingDetails.at(j+1).get('categoryId').setValue(this.tempCatgValue);

  }

  //  OnChange Functions Ends ............

  // Getting ID and Description Functions ......

  getAuditElement(auditCode) {

    //  return this.auditElements.filter(res => {

    //     if(res.AUDIT_CODE===auditCode){
    //       console.log(res.AUDIT_ELEMENTS)
    //       return res.AUDIT_ELEMENTS        
    //     }      
    //   })
    return this.auditElements.filter(res => res.AUDIT_CODE === auditCode)

  }

  getStatusCode() {

  }

  getCategoryCode(codeDesc) {

    return this.auditCategory.filter(res => {
      if (res.FINDINGS_CATEGORY_DESC === codeDesc) {
        return res.FINDINGS_CATEGORY_ID
      }
    })

  }

  async deleteOptions(index) {
    console.log('indezxx', index)
    console.log('CurrentFinding.finding', CurrentFinding.finding)

    const alert = this.alertController.create({
      mode: 'ios',
      header: 'Delete Findings',
      message: 'Are you sure you want to delete this findings?',
      cssClass: 'alertCancel',/**added by lokesh for changing text into bold mobile_jira(648)*/
      buttons: [
        {
          text: 'Yes',
          cssClass: 'alertButton',/**added by lokesh for changing text into bold mobile_jira(648)*/
          handler: () => {
            console.log('Delete Confired');
            this.deleteFindings(index);
          }
        },
        {
          text: 'No',
          handler: () => {
            console.log('Delete Rejected');
          }
        }
      ]



    });
    (await alert).present();
  }

  getNxtActionCode() {

  }

  // Getting ID and Description Functions Ends...... 





  /* Finding Attachments Functionality starts */

  fileChanged(event, control, finding, findingDtl, index) {
    this.filenameDisplayFlag = false
    this.currentlyChoosenFile = event.target.files[0];
    console.log("event :: ", event.target.files[0].name);
    console.log(finding)
    control.at(index).get('fileSeqNo').patchValue(index + 1);
    control.at(index).get('statusSeqNo').patchValue(findingDtl + 1);
    control.at(index).get('findingSeqNo').patchValue(finding + 1);
    control.at(index).get('auditTypeId').patchValue(this.auditTypeId);
    control.at(index).get('origAuditSeqNo').patchValue(this.auditSeqNumber);
    control.at(index).get('currentAuditSeq').patchValue(this.auditSeqNumber);
    control.at(index).get('companyId').patchValue(this.compId);

    let fileReader = new FileReader();
    fileReader = new FileReader();
    let indexValue = index;
    let controlValue = control;

    fileReader.onload = (function () {
      return function (e) {
        console.log(e.target.result);
        let base64url = e.target.result;
        //  fs.writeFile(fs.externalRootDirectory+'AuditingAppDownloads/',control.at(index).get('fileName').value,base64url).then(res => {
        //   console.log(res)
        // }) 


        console.log(control)
        console.log("indexValue", indexValue)
        console.log("controlValue", controlValue)


        console.log(base64url);
        console.log(controlValue.at(indexValue).get('companyId').value)
        // console.log(base64url.split(',')[1]);
        controlValue.at(indexValue).get('companyId').patchValue(2);
        controlValue.at(indexValue).get('findingFileByte').patchValue(base64url);
      };
    })(/* event.target.files[0] */);
    //fileReader.readAsDataURL(event.target.files[0]);
    //fileReader.readAsBinaryString(event.target.files[0]);
    fileReader.readAsArrayBuffer(event.target.files[0]);

  }


  downloadAttachment(control, index) {
    console.log('Download Attachment');
    console.log(this.filesys.externalRootDirectory);
    console.log("control.at(index).get('fileName').value", control.at(index).get('fileName').value)
    console.log("control.at(index).get('findingFileByte').value", control.at(index).get('findingFileByte').value)

    this.filesys.checkDir(this.filesys.externalRootDirectory, "AuditingAppDownloads").then(() => {
      console.log("DOWNLOAD FOLDER ALREADY CREATED");
      this.filesys.writeFile(this.filesys.externalRootDirectory + 'AuditingAppDownloads/', control.at(index).get('fileName').value, control.at(index).get('findingFileByte').value).then(res => {
        console.log(res);
        this.toast.presentToast("File Successfully Downloaded in" + res.nativeURL, "success");

      }, () => {
        this.toast.presentToast("File Already Downloaded", "danger");
      })
    }, () => {
      console.log("DOWNLOAD FOLDER NOT YET CREATED");
      this.filesys.createDir(this.filesys.externalRootDirectory, "AuditingAppDownloads", false).then(res => {
        console.log(res)
      })
    })

    /*   this.filesys.createDir(this.filesys.externalRootDirectory,"AuditingAppDownloads",false).then(res => {
        console.log(res)
      }) */

    // this.filesys.writeFile(this.filesys.externalRootDirectory + '/AuditDetails/' + type + '/' + seqno, f.name, e.target.result).then(res => {
    //   console.log(res)
    // })

  }

  /* Finding Attachments Functionality Ends */


  /* Setting Existing Findings Data starts */

  auditCategoryChangeInit(findCatDesc, index, j) {
    console.log("****************************************************************")
    console.log("auditCategoryChangeInit .......")
    console.log('catSeqNo::', this.catSeqNo);
    console.log(findCatDesc, index, j)

    if (this.auditTypeId === 1001) {
      console.log("Inside IF")

      if (findCatDesc === 'MNC') {
        console.log("Inside MNC")
        this.maxFindDtlLength = 3;

      }
      else if (findCatDesc === 'NC') {
        console.log("Inside NC")
        this.maxFindDtlLength = 2;

      }
      else if (findCatDesc === 'OBS') {
        console.log("Inside OBS")
        this.maxFindDtlLength = 0;

      }
    }
    else if (this.auditTypeId === 1002) {
      console.log("Inside IF")

      if (findCatDesc === 'MF') {
        console.log("Inside MF")
        this.maxFindDtlLength = 3;

      }
      else if (findCatDesc === 'FAILURE') {
        console.log("Inside FAILURE")
        this.maxFindDtlLength = 3;

      }
      else if (findCatDesc === 'OBS') {
        console.log("Inside OBS")
        this.maxFindDtlLength = 0;

      }
    }
    else if (this.auditTypeId === 1003) {
      console.log("Inside IF")

      if (findCatDesc === 'SD') {
        console.log("Inside MNC")
        this.maxFindDtlLength = 3;

      }
      else if (findCatDesc === 'DEFICIENCY') {
        console.log("Inside NC")
        this.maxFindDtlLength = 2;

      }
      else if (findCatDesc === 'OBS') {
        console.log("Inside OBS")
        this.maxFindDtlLength = 0;

      }
    }


    console.log('I::' + index, 'J::' + j);
    console.log(findCatDesc, index)
    this.categoryEnabled = true;
    this.disabled = false;

    this.tempCatgValue = findCatDesc;

    let findings = this.findingsForm.get('findings') as FormArray;

    // findings.at(index).get('displayFinging').setValue(this.auditReportNo+"-"+findCatDesc)

    let findingDetails = findings.at(index).get('findingDetail') as FormArray;

    /* findingDetails.at(j).get('statusId').setValue('OPEN');
  
    findingDetails.at(j).get('statusDate').setValue(this.closeMeetingDate.toISOString()); */

    findingDetails.at(j).get('statusDate').enable();

    console.log("****************************************************************")
  }


  auditNxtActionChangeInit(nextActionDesc, i, j, control, findingDetailLength) {

    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
    console.log("auditNxtActionChangeInit")
    console.log('control', control)
    console.log(nextActionDesc, i, j);
    console.log('this.maxFindDtlLength', this.maxFindDtlLength);
    console.log('this.tempCatgValue', this.tempCatgValue);


    this.isStatusEnabled = false;

    let findings = this.findingsForm.get('findings') as FormArray;
    let findingDetails = findings.at(i).get('findingDetail') as FormArray;

    console.log("Findingdetail", findingDetails);

    if (j > 0 && nextActionDesc != 'PREVIOUS STATUS') {
      console.log('disable')
      findingDetails.at(j - 1).disable();
    }


    if (nextActionDesc === 'PREVIOUS STATUS') {

      if (j > 0) {
        findingDetails.at(j - 1).get('statusDate').enable();
        findingDetails.at(j - 1).get('dueDate').enable();
        findingDetails.at(j - 1).get('nextActionId').enable();
        findingDetails.at(j - 1).get('descriptions').enable();

      }

      findingDetails.at(j).get('statusDate').setValue("");
      findingDetails.at(j).get('dueDate').reset();
      findingDetails.at(j).get('nextActionId').reset();

      console.log(findingDetails.at(j + 1))

      if (findingDetails.at(j + 1) != undefined) {
        console.log('delete finding dtl...')
        this.deleteFindingDetail(control.controls.findingDetail, j + 1);
      }

      if (j != 0) {
        console.log("setDisableNxtActionArr calling")
        this.setDisableNxtActionArr(i, j - 1);
      }

    }

    if (j < this.maxFindDtlLength && nextActionDesc != 'PREVIOUS STATUS') {

      console.log('j+1', j + 1)
      console.log('findingDetailLength', findingDetailLength)
      console.log('findingDetailLength<=j+1', findingDetailLength <= j + 1)



      if (findingDetailLength <= j + 1) {
        console.log("before adding addFindingdetail");
        this.addFindingDetail(control);
        console.log("Findingdetail", findingDetails);
        findingDetails.at(j + 1).get('categoryId').setValue(this.tempCatgValue);

        switch (nextActionDesc) {
          case "DOWNGRADE":
            //console.log('DOWNGRADED')
            findingDetails.at(j + 1).get('statusId').setValue('DOWNGRADED')
            break;

          case "DOWNGRADE (RESTORE COMPLIANCE)":
            //console.log('DOWNGRADED')
            findingDetails.at(j + 1).get('statusId').setValue('DOWNGRADED (COMPLIANCE RESTORED)')
            break;

          case "DOWNGRADE (RECTIFY)":
            //console.log('DOWNGRADED')
            findingDetails.at(j + 1).get('statusId').setValue('DOWNGRADED (RECTIFIED)')
            break;

          case "RESTORE COMPLIANCE":
            //console.log('DOWNGRADED')
            findingDetails.at(j + 1).get('statusId').setValue('COMPLIANCE RESTORED')
            break;

          case "PLAN ACCEPTED":
            //console.log('PLAN ACCEPTED')
            findingDetails.at(j + 1).get('statusId').setValue('PLAN ACCEPTED')
            break;
          case "VERIFY / CLOSE":
            //console.log('VERIFY/CLOSE')
            findingDetails.at(j + 1).get('statusId').setValue('VERIFIED /CLOSED')
            break;
        }
      }

      // findingDetails.at(j+1).get('statusDate').enable();
      // findingDetails.at(j+1).get('dueDate').enable();
      // console.log(findingDetails.at(j+1).get('statusDate').disabled)
    }



    // findingDetails.at(j+1).get('categoryId').setValue(this.tempCatgValue);
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  }

  initiallizeFindings(dataFromAuditDetails) {
    let dataFromAuditDetail = dataFromAuditDetails;
    console.log("dataFromAuditDetail", dataFromAuditDetail);
    // console.log("dataFromAuditDetail.finding", dataFromAuditDetail.finding);

    //let ar = dataFromAuditDetail.finding.map(res => res.findingsNo);
    let ar = CurrentFinding.finding.map(res => res.findingsNo);
    console.log('ar', ar);
    console.log("MAX", Math.max(...ar))
    //let findingLength = dataFromAuditDetail.finding.length;
    let findingLength = CurrentFinding.finding.length;

    /* console.log('1.findingDetail ::', dataFromAuditDetail.findingDetails);
    console.log('2.findingDetailLength ::', dataFromAuditDetail.findingDetails.length); */

    if (findingLength > 0) {
      this.setNewFinding = false;
      let findingsFormTemp = this.findingsForm.get('findings') as FormArray;

      //console.log(findingsFormTemp);

      for (let i = 0; i < findingLength; i++) {

        //console.log(dataFromAuditDetail.finding[i].findingsNo)
        this.setFindings();
        //console.log(dataFromAuditDetail.finding[i].auditCode,dataFromAuditDetail.finding[i].serialNo)
        //console.log(findingsFormTemp.at(i));
        //console.log(this.auditElementsArr)
        //console.log(this.getAuditElement(dataFromAuditDetail.finding[i].auditCode)[0].AUDIT_ELEMENTS)

        findingsFormTemp.at(i).patchValue({
          'auditCode': CurrentFinding.finding[i].auditCode,
          'displayFinging': CurrentFinding.finding[i].serialNo,
          'elements': this.getAuditElement(CurrentFinding.finding[i].auditCode)[0].AUDIT_ELEMENTS,
          'origSeqNo': CurrentFinding.finding[i].origSeqNo,
          'auditDate': CurrentFinding.finding[i].auditDate
        });

        findingsFormTemp.at(i).get('auditCode').markAsDirty();
        findingsFormTemp.at(i).get('auditCode').markAsTouched();

        CurrentFinding.findingDetails.filter(res => {
          console.log(res);
          console.log(res.findingsNo);
          console.log((i + 1));

        });

        let findingDtl = CurrentFinding.findingDetails.filter(res => res.findingsNo === (ar[i]).toString());
        let findingRpts = CurrentFinding.findingAttachments.filter(res => res.findingsNo === (ar[i]).toString());


        console.log("3.i" + ":" + i);
        console.log("4.findingDtl", findingDtl);
        console.log("4.1.findingRpts", findingRpts)

        let findingsDtlFormTemp = findingsFormTemp.at(i).get('findingDetail') as FormArray;

        const controlDetail = findingsFormTemp.at(i).get('findingDetail')

        console.log("this.maxFindDtlLength", this.maxFindDtlLength);
        console.log("this.findingDtl.length", findingDtl.length);


        for (let i = 0; i < findingDtl.length - 1; i++) {
          this.addFindingDetail(controlDetail);
        }
        console.log("5.", findingDtl.length);
        console.log('6.', findingsFormTemp.at(i));
        let j = i;
        for (let i = 0; i < findingDtl.length; i++) {
          // console.log(dataFromAuditDetail.findingDetails[i].nextActionId)
          // console.log(dataFromAuditDetail.findingDetails[i].categoryId)
          // console.log((this.findingCategoryOpt.filter(res => res.FINDINGS_CATEGORY_ID===dataFromAuditDetail.findingDetails[i].categoryId))[0].FINDINGS_CATEGORY_DESC)
          // console.log(this.findingCategoryOpt.filter(res => res.FINDINGS_CATEGORY_ID===dataFromAuditDetail.findingDetails[i].categoryId)[0].FINDINGS_CATEGORY_DESC)
          console.log("7.", findingsDtlFormTemp)
          console.log("7.", (i))
          console.log("7.", findingsDtlFormTemp.at(i));


          let findRptsAttBasedOnFindDtl = findingRpts.filter(res => res.findingSeqNo === (i + 1) + "");

          console.log("findRptsAttBasedOnFindDtl", findRptsAttBasedOnFindDtl)

          let findingRptAttachsTemp = findingsDtlFormTemp.at(i).get('findingRptAttachs') as FormArray;

          const controlReport = findingsDtlFormTemp.at(i).get('findingRptAttachs')

          for (let i = 0; i < findRptsAttBasedOnFindDtl.length; i++) {
            this.addFindingReports(controlReport);
          }

          for (let i = 0; i < findRptsAttBasedOnFindDtl.length; i++) {
            this.filenameDisplayFlag = true;
            findingRptAttachsTemp.at(i).patchValue({
              fileName: findRptsAttBasedOnFindDtl[i].fileName,
              findingFileByte: '',
              fileSeqNo: findRptsAttBasedOnFindDtl[i].fileSeqNo,
              ownerFlag: '',
              userIns: '',
              dateIns: '',
              findingSeqNo: findRptsAttBasedOnFindDtl[i].findingSeqNo,
              origAuditSeqNo: findRptsAttBasedOnFindDtl[i].origSeqNo,
              currentAuditSeq: findRptsAttBasedOnFindDtl[i].currSeqNo,
              companyId: '',
              statusSeqNo: '',
              auditTypeId: '',
            })
          }

          findingsDtlFormTemp.at(i).patchValue({

            categoryId: (this.findingCategoryOpt.filter(res => res.FINDINGS_CATEGORY_ID === findingDtl[i].categoryId))[0].FINDINGS_CATEGORY_DESC,
            statusId: (this.auditStatus.filter(res => res.FINDINGS_STATUS_ID === findingDtl[i].statusId))[0].FINDINGS_STATUS_DESC,
            statusDate: findingDtl[i].statusDate,
            nextActionId: (findingDtl[i].nextActionId != '') ? (this.auditStatus.filter(res => res.FINDINGS_STATUS_ID === findingDtl[i].nextActionId))[0].FINDINGS_STATUS_DESC : '',
            dueDate: findingDtl[i].dueDate,
            descriptions: findingDtl[i].descriptions,
          })
          console.log('I::', i)
          console.log('J::', j)

          console.log('Before calling auditCategoryChangeInit ...');
          let findCatDesc = this.findingCategoryOpt.filter(res => res.FINDINGS_CATEGORY_ID === findingDtl[i].categoryId)[0].FINDINGS_CATEGORY_DESC;
          this.auditCategoryChangeInit(findCatDesc, j, i);
          console.log('Before calling setDisableNxtActionArr ...');
          this.setDisableNxtActionArr(j, i);
          let nxtActDesc = (findingDtl[i].nextActionId != '') ? (this.auditStatus.filter(res => res.FINDINGS_STATUS_ID === findingDtl[i].nextActionId))[0].FINDINGS_STATUS_DESC : '';
          console.log('Before calling auditNxtActionChangeInit ...')
          this.auditNxtActionChangeInit(nxtActDesc, j, i, controlDetail, findingDtl.length);
        }
        //  console.log((dataFromAuditDetail.findingDetails)[i])
      }


      console.log('findingsFormTemp :: ', findingsFormTemp);
      // console.log(dataFromAuditDetail.finding[0].serialNo)
    }
    else {
      this.setNewFinding = true;
      this.setFindings();
    }
  }


  /* Setting Existing Findings Data Ends */


  setExistingAuditCatCount(findingArr) {

    console.log("findingArr :: ", findingArr);
    for (let i = 0; i < findingArr.length; i++) {

      console.log(findingArr[i].serialNo);

      if (findingArr[i].serialNo.includes("MNC") || findingArr[i].serialNo.includes("MF") || findingArr[i].serialNo.includes("SD")) {
        console.log("First Cat ")
        this.auditCat1++;
      }
      else if (findingArr[i].serialNo.includes("NC") || findingArr[i].serialNo.includes("FAILURE") || findingArr[i].serialNo.includes("DEFICIENCY")) {
        console.log("Second Cat ")
        this.auditCat2++;
      }
      else if (findingArr[i].serialNo.includes("OBS")) {
        console.log("Third Cat ")
        this.auditCat3++;
      }
    }

  }

  dataFromAuditDetailPage;
  constructor(private appConstant: AppConstant, public fb: FormBuilder, private db: DatabaseService, private router: Router, private platform: Platform, public alertController: AlertController, public loader: LoadingIndicatorService, public filesys: File, public toast: ToastService,) {
    const currentYear = new Date().getFullYear();
    /* this.minStatusDate = new Date(currentYear - 1, 0, 1);
    this.maxStatusDate = new Date(currentYear + 1, 11, 31); */

    let dataFromAuditDetail = this.router.getCurrentNavigation().extras.state;

    this.dataFromAuditDetailPage = dataFromAuditDetail;

    this.auditTypeId = dataFromAuditDetail.auditTypeId

    /********** setting dynamic data to screen **********/
    this.setCurrentFinding();

    //this.getAuditDataForDateValidations();
    this.db.getCurrentFindingData(this.dataFromAuditDetailPage.auditSeqNo);

    console.log("router::", dataFromAuditDetail);

    this.setExistingAuditCatCount(CurrentFinding.finding)

    this.auditSeqNumber = dataFromAuditDetail.auditSeqNo;
    this.compId = dataFromAuditDetail.companyId;
    this.auditReportNo = dataFromAuditDetail.auditReportNo;
    this.closeMeetingDate = new Date(dataFromAuditDetail.closeMeetingDate);
    this.openMeetingDate = new Date(dataFromAuditDetail.openMeetingDate);

    console.log("auditType::", this.auditTypeId);

    this.findingsForm = this.fb.group({

      findings: this.fb.array([])
    })

    console.log('before calling set finding method ...')

    let findingLength = CurrentFinding.finding.length;



    console.log('findingLength :: ', findingLength);
    //console.log(dataFromAuditDetail.finding[0].serialNo)

    /*   if(findingLength>0){

        let findingsFormTemp=this.findingsForm.get('findings') as FormArray;
          for(let i=0;i<findingLength;i++){
            this.setFindings();

            console.log(dataFromAuditDetail.finding[i].auditCode,dataFromAuditDetail.finding[i].serialNo)
            console.log(findingsFormTemp.at(i).value)

            findingsFormTemp.at(i).patchValue({                           
              'auditCode':dataFromAuditDetail.finding[i].auditCode,
              'displayFinging':dataFromAuditDetail.finding[i].serialNo,
              'element':this.getAuditElement(dataFromAuditDetail.finding[i].auditCode)
            });

          }
          console.log('findingsFormTemp :: ',findingsFormTemp);             
          console.log(dataFromAuditDetail.finding[0].serialNo)                        
      }
      else {
        this.setFindings();
      } */

  }

  /********** setting dynamic data to screen **********/
  setCurrentFinding() {

    if (this.auditTypeId == this.appConstant.ISM_TYPE_ID) {

      this.pageTitle = "ism audit";

      this.auditType = "Audit";

      this.majorCountDesc = "MNC";

      this.minorCountDesc = "NC";

      this.obsCountDesc = "OBS";

      this.auditauditType = "ISM";

      this.auditTypeDesc = "ISM";

    } else if (this.auditTypeId == this.appConstant.ISPS_TYPE_ID) {

      this.pageTitle = "isps audit";

      this.auditType = "Audit";

      this.majorCountDesc = "MF";

      this.minorCountDesc = "FAILURE";

      this.obsCountDesc = "OBS";

      this.auditauditType = "ISPS";

      this.auditTypeDesc = "ISPS";

    } else if (this.auditTypeId == this.appConstant.MLC_TYPE_ID) {

      this.pageTitle = "mlc inspection";

      this.auditType = "Inspection";

      this.majorCountDesc = "SD";

      this.minorCountDesc = "DEFICIENCY";

      this.obsCountDesc = "OBS";

      this.auditauditType = "MLC";

      this.auditTypeDesc = "MLC";

    } else if (this.auditTypeId == this.appConstant.SSP_TYPE_ID) {

      this.pageTitle = "ssp review";

      this.auditType = "Review";

      this.auditauditType = "SSP";

      this.auditTypeDesc = "SSP";

    } else if (this.auditTypeId == this.appConstant.DMLC_TYPE_ID) {

      this.reviewCountDesc = "REVIEW NOTES";

      this.pageTitle = "dmlc ii review";

      this.auditType = "Review";

      this.auditauditType = "DMLC II";

      this.auditTypeDesc = "DMLC";
    }

    if (this.auditTypeId == this.appConstant.ISM_TYPE_ID || this.auditTypeId == this.appConstant.ISPS_TYPE_ID || this.auditTypeId == this.appConstant.MLC_TYPE_ID) {
      this.auditType1 = 'NEW AUDIT FINDINGS';
    }
    else if (this.auditTypeId == this.appConstant.DMLC_TYPE_ID) {

      this.auditType1 = 'REVIEW NOTES';
    }
    else if (this.auditTypeId == this.appConstant.SSP_TYPE_ID) {

      this.auditType1 = 'NEW REVIEW FINDINGS';
    }

    if (this.auditTypeId == this.appConstant.ISM_TYPE_ID || this.auditTypeId == this.appConstant.ISPS_TYPE_ID || this.auditTypeId == this.appConstant.MLC_TYPE_ID) {
      this.auditType1 = 'NEW AUDIT FINDINGS';
    }
    else if (this.auditTypeId == this.appConstant.DMLC_TYPE_ID) {

      this.auditType1 = 'REVIEW NOTES';
    }
    else if (this.auditTypeId == this.appConstant.SSP_TYPE_ID) {

      this.auditType1 = 'NEW REVIEW FINDINGS';
    }
  }

  getAuditDataForDateValidations() {
    this.db.getAuditdata('audit.auditSeqNo').then((auditData) => {

    })
  }

  ngOnInit() {
    this.loader.showLoader('Fetching Findings....');//loader starts
    console.log(this.router.getCurrentNavigation().extras.state)
    let dataFromAuditDetail = this.router.getCurrentNavigation().extras.state;
    //1.MaFindingsStatus 2.MaAuditCodes 3.MaFindingsCategory
    this.db.getMaDatasForFindings(this.auditTypeId).then((auditCodes) => {

      console.log("auditCodes", auditCodes);

      console.log(auditCodes[0]);

      this.auditElements = auditCodes[0];
      this.auditStatus = auditCodes[1];
      this.auditCategory = auditCodes[2];

      this.findingStatusOpt = auditCodes[1].map(res => res.FINDINGS_STATUS_DESC);
      console.log("auditCodes[1]", auditCodes[1]);
      console.log((this.auditStatus.filter(res => res.FINDINGS_STATUS_ID === 1001))[0].FINDINGS_STATUS_DESC)
      console.log("this.findingStatusOpt::", this.findingStatusOpt);

      //this.findingCategoryOpt=auditCodes[2].map(res => res.FINDINGS_CATEGORY_DESC);
      this.findingCategoryOpt = auditCodes[2];
      console.log("this.findingCategoryOpt::", this.findingCategoryOpt);
      this.findingCategoryOpt1 = this.findingCategoryOpt.map(res => res.FINDINGS_CATEGORY_DESC);
      console.log("this.findingCategoryOpt1", this.findingCategoryOpt1)

      this.auditCodeArr = auditCodes[0].map(res => res.AUDIT_CODE + ',' + res.AUDIT_ELEMENTS);
      console.log('auditCodeArr', this.auditCodeArr);

      this.auditElementsArr = auditCodes[0].map(res => res.AUDIT_ELEMENTS);
      console.log('auditElementsArr', this.auditElementsArr);

    }).then(res => {
      console.log(res);
      console.log(dataFromAuditDetail);

      this.initiallizeFindings(dataFromAuditDetail);
      this.loader.hideLoader();
    });



    /* let dataFromAuditDetail = this.router.getCurrentNavigation().extras.state;

    let findingLength=dataFromAuditDetail.finding.length;

    if(findingLength>0){

      let findingsFormTemp=this.findingsForm.get('findings') as FormArray;
        for(let i=0;i<findingLength;i++){
          this.setFindings();

          console.log(dataFromAuditDetail.finding[i].auditCode,dataFromAuditDetail.finding[i].serialNo)
          console.log(findingsFormTemp.at(i).value)

          findingsFormTemp.at(i).patchValue({                           
            'auditCode':dataFromAuditDetail.finding[i].auditCode,
            'displayFinging':dataFromAuditDetail.finding[i].serialNo,
            'element':this.getAuditElement(dataFromAuditDetail.finding[i].auditCode)
          });

        }
        console.log('findingsFormTemp :: ',findingsFormTemp);             
        console.log(dataFromAuditDetail.finding[0].serialNo)                        
    }
    else {
      this.setFindings();
    }
*/


  }


  setFindingsToCurrentFindings(existFindArr) {


    console.log(existFindArr)
    console.log(this.findingsForm.value);
    console.log(CurrentFinding.finding);
    let findingsFormTemp = JSON.parse(JSON.stringify(this.findingsForm.value));
    let currentFindingsTemp = CurrentFinding.finding;


    console.log("findingsFormTemp :: ", findingsFormTemp);
    console.log("currentFindingsTemp :: ", currentFindingsTemp);
    console.log("existFindArr", existFindArr);

    /* FOR FINDING DETAILS BLOCK */
    let findFormValue = this.findingsForm.getRawValue();
    CurrentFinding.findingDetails = [];
    /* FOR FINDING DETAILS BLOCK */

    for (let i = 0; i < findingsFormTemp.findings.length; i++) {

      console.log(existFindArr.includes(i.toString()));
      console.log((findingsFormTemp.findings)[i].displayFinging)

      if (this.isNewFindingsAddedFromUI) {
        if (existFindArr.includes(i.toString())) {
          console.log(CurrentFinding.finding[i]);
          CurrentFinding.finding[i].auditCode = (findingsFormTemp.findings)[i].auditCode;
          CurrentFinding.finding[i].serialNo = (findingsFormTemp.findings)[i].displayFinging;

        }
        else {
          if ((findingsFormTemp.findings)[i].displayFinging) {
            CurrentFinding.finding.push({
              currSeqNo: findingsFormTemp.findings[i].origSeqNo,
              origSeqNo: '',
              findingsNo: i + 1 + "",
              auditDate: "",
              auditCode: (findingsFormTemp.findings)[i].auditCode,
              serialNo: (findingsFormTemp.findings)[i].displayFinging
            })
          }
        }

        console.log((findingsFormTemp.findings)[i].findingDetail);



      }
      else {
        console.log((findingsFormTemp.findings)[i].displayFinging);

        console.log('CurrentFinding.finding', CurrentFinding.finding, typeof (CurrentFinding.finding))
        if (CurrentFinding.finding.length == 0 && findingsFormTemp.findings[i].displayFinging) {
          console.log('findingsFormTemp', findingsFormTemp);
          CurrentFinding.finding.push({
            currSeqNo: i,
            origSeqNo: '',
            findingsNo: i + 1 + "",
            auditDate: "",
            auditCode: (findingsFormTemp.findings)[i].auditCode,
            serialNo: (findingsFormTemp.findings)[i].displayFinging
          })
        } else if (CurrentFinding.finding.length > 0 && findingsFormTemp.findings[i].displayFinging) {
          CurrentFinding.finding.forEach((ele, ind) => {
            console.log(ele);
            console.log('2nd off', (ele.findingsNo == findingsFormTemp.findings[i].findingsNo))
            console.log('findingsFormTemp', findingsFormTemp);

            if ((ele.findingsNo === findingsFormTemp.findings[i].findingsNo)) {
              console.log('findingsFormTemp', findingsFormTemp);

              CurrentFinding.finding.push({
                currSeqNo: i,
                origSeqNo: '',
                findingsNo: i + 1 + "",
                auditDate: "",
                auditCode: (findingsFormTemp.findings)[i].auditCode,
                serialNo: (findingsFormTemp.findings)[i].displayFinging
              })
            }
            if (!(ele.findingsNo === findingsFormTemp.findings[i].findingsNo)) {
              CurrentFinding.finding[ind] = findingsFormTemp.findings[i]
            }
          })
        }

      }

      console.log('***************************************************')
      console.log((findFormValue.findings)[i].findingDetail);


      console.log((findingsFormTemp.findings)[i].auditCode)
      console.log(CurrentFinding.finding);

      let findDtl = (findFormValue.findings)[i].findingDetail;
      for (let j = 0; j < findDtl.length; j++) {

        console.log('findDtl', findDtl);

        /* console.log(findDtl[j].categoryId,findDtl[j].statusId,findDtl[j].nextActionId);
        console.log((this.auditCategory.filter(res => res.FINDINGS_CATEGORY_DESC === findDtl[j].categoryId)[0].FINDINGS_CATEGORY_ID));
        console.log((this.auditStatus.filter(res => res.FINDINGS_STATUS_DESC === findDtl[j].statusId))[0]);
        console.log((this.auditStatus.filter(res => res.FINDINGS_STATUS_DESC === findDtl[j].statusId))[0].FINDINGS_STATUS_ID);

        console.log("findDtl[j].statusId",findDtl[j].statusId) */

        findDtl[j].categoryId = findDtl[j].categoryId ? (this.auditCategory.filter(res => res.FINDINGS_CATEGORY_DESC === findDtl[j].categoryId)[0].FINDINGS_CATEGORY_ID) : '';
        findDtl[j].statusId = findDtl[j].statusId ? (this.auditStatus.filter(res => res.FINDINGS_STATUS_DESC === findDtl[j].statusId)[0].FINDINGS_STATUS_ID) : '';
        console.log("findDtl[j].nextActionId ", findDtl[j].nextActionId)
        findDtl[j].nextActionId = findDtl[j].nextActionId != '' ? (this.auditStatus.filter(res => res.FINDINGS_STATUS_DESC === findDtl[j].nextActionId)[0].FINDINGS_STATUS_ID) : '';

        if (findDtl[j].nextActionId != '') {
          CurrentFinding.findingDetails.push({
            currSeqNo: '',
            ORIG_SEQ_NO: '',
            findingsNo: i + 1 + '',
            findingSeqNo: j + 1 + '',
            categoryId: findDtl[j].categoryId,
            statusId: findDtl[j].statusId,
            statusDate: findDtl[j].statusDate,
            nextActionId: findDtl[j].nextActionId,
            dueDate: findDtl[j].dueDate,
            description: findDtl[j].descriptions
          })
        }


      }



      //for (let j = 0; j < findDtl.length; j++) {

      /*  console.log("findDtl Legth  ::",findDtl.length);
       console.log("findDtl ::",findDtl)
       console.log(j>=(CurrentFinding.findingDetails).length,(CurrentFinding.findingDetails).length);
       console.log("findDtl[j].nextActionId!='' ",findDtl[j].nextActionId!='') */


      /*         if(j<(CurrentFinding.findingDetails).length){
                console.log("Yes");
                (CurrentFinding.findingDetails)[j].statusDate=findDtl[j].statusDate;
                (CurrentFinding.findingDetails)[j].dueDate=findDtl[j].dueDate;
                (CurrentFinding.findingDetails)[j].description=findDtl[j].descriptions;
      
              }
              else{
      
                if(findDtl[j].nextActionId!=''){
                  CurrentFinding.findingDetails.push({
                    currSeqNo:'',
                    ORIG_SEQ_NO:'',
                    findingsNo:i+1+'',
                    findingSeqNo:j+1+'',
                    categoryId:findDtl[j].categoryId,
                    statusId:findDtl[j].statusId,
                    statusDate:findDtl[j].statusDate,
                    nextActionId:findDtl[j].nextActionId,
                    dueDate:findDtl[j].dueDate,
                    description:findDtl[j].descriptions
                  })
                }
                
              } */
      /* 
              if(j>=(CurrentFinding.findingDetails).length && findDtl[j].nextActionId!=''){
                CurrentFinding.findingDetails.push({
                  currSeqNo:'',
                  ORIG_SEQ_NO:'',
                  findingsNo:i+1+'',
                  findingSeqNo:j+1+'',
                  categoryId:findDtl[j].categoryId,
                  statusId:findDtl[j].statusId,
                  statusDate:findDtl[j].statusDate,
                  nextActionId:findDtl[j].nextActionId,
                  dueDate:findDtl[j].dueDate,
                  description:findDtl[j].descriptions
                })
              }
              else if(this.isNewFindingsAddedFromUI){
                CurrentFinding.findingDetails.push({
                  currSeqNo:'',
                  ORIG_SEQ_NO:'',
                  findingsNo:i+1+'',
                  findingSeqNo:j+1+'',
                  categoryId:findDtl[j].categoryId,
                  statusId:findDtl[j].statusId,
                  statusDate:findDtl[j].statusDate,
                  nextActionId:findDtl[j].nextActionId,
                  dueDate:findDtl[j].dueDate,
                  description:findDtl[j].descriptions
                })
              } */



      //}

      console.log("findDtl ::", findDtl)
      console.log(CurrentFinding.findingDetails);
      console.log('---------------------------------------------------------------')

    }
  }

  ngAfterViewInit() {
    console.log("ngAfterViewInit")
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      console.log(this.findingsDataForm.value);
      // this.saveOptions(this.findingsDataForm.value, true);
      this.router.navigateByUrl("/audit/perform/audit-details")
    });
  }

  async saveOptions(formData, isBackButtonPressed?: boolean) {

    const alert = this.alertController.create({
      mode: 'ios',
      header: 'Save Findings',
      message: 'Do you want to save the changes?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            console.log('Save Confired');
            this.saveConfirmed(formData, isBackButtonPressed);
          }
        },
        {
          text: 'No',
          handler: () => {
            console.log('Save Rejected');
          }
        }
      ]
    });
    (await alert).present();
  }
  save(formData) {
    this.saveOptions(formData);
  }

  saveConfirmed(formData, isBackButtonPressed?: boolean) {
    console.log('formData', formData);
    console.log('formData.findings', formData.findings);
    let findings = [];
    let findingDetails = [];
    let findingAttachments = [];

    formData.findings.forEach((finding, findIndex) => {
      if (finding.displayFinging) {
        console.log('finding(' + (findIndex + 1) + ')', finding);

        findings.push({
          seqNo: findIndex + 1,
          currSeqNo: this.dataFromAuditDetailPage.auditSeqNo ? this.dataFromAuditDetailPage.auditSeqNo : '',
          origSeqNo: this.dataFromAuditDetailPage.auditSeqNo ? this.dataFromAuditDetailPage.auditSeqNo : '',
          findingsNo: findIndex + 1 + '',
          auditDate: this.dataFromAuditDetailPage.auditDate ? this.dataFromAuditDetailPage.auditDate : '',
          auditCode: finding.auditCode,
          companyId: finding.companyId,
          userIns: this.dataFromAuditDetailPage.userIns ? this.dataFromAuditDetailPage.userIns : '',
          findingStatus: 0,
          dateIns: this.dataFromAuditDetailPage.dateIns ? this.dataFromAuditDetailPage.dateIns : '',
          serialNo: finding.displayFinging
        })
      }

      if (finding.findingDetail.length > 0) {
        finding.findingDetail.forEach((findingDtl, findDtlIndex) => {
          if (findingDtl.nextActionId && findingDtl.nextActionId != "") {
            console.log('findingDtl(' + (findIndex + 1) + ')(' + (findDtlIndex + 1) + ')', findingDtl);
            findingDetails.push({
              seqNo: findDtlIndex + 1,
              currSeqNo: this.dataFromAuditDetailPage.auditSeqNo ? this.dataFromAuditDetailPage.auditSeqNo : '',
              origSeqNo: this.dataFromAuditDetailPage.auditSeqNo ? this.dataFromAuditDetailPage.auditSeqNo : '',
              findingsNo: findIndex + 1 + '',
              findingSeqNo: findDtlIndex + 1 + '',
              categoryId: (this.findingCategoryOpt.filter(res => res.FINDINGS_CATEGORY_DESC === findingDtl.categoryId))[0].FINDINGS_CATEGORY_ID,
              statusId: (this.auditStatus.filter(res => res.FINDINGS_STATUS_DESC === findingDtl.statusId))[0].FINDINGS_STATUS_ID,
              statusDate: findingDtl.statusDate,
              companyId: finding.companyId,
              nextActionId: (this.auditStatus.filter(res => res.FINDINGS_STATUS_DESC === findingDtl.nextActionId))[0].FINDINGS_STATUS_ID,
              dueDate: findingDtl.dueDate,
              description: findingDtl.descriptions ? findingDtl.descriptions : '',
              userIns: this.dataFromAuditDetailPage.userIns ? this.dataFromAuditDetailPage.userIns : '',
              dateIns: this.dataFromAuditDetailPage.dateIns ? this.dataFromAuditDetailPage.dateIns : '',
              auditTypeId: this.auditTypeId ? this.auditTypeId : '',
              updateDescription: findingDtl.updateDescription ? findingDtl.updateDescription : '',
              auditPlace: ''
            })

            if (findingDtl.findingRptAttachs.length > 0) {
              findingDtl.findingRptAttachs.forEach((findingAttachment, findAttachIndex) => {
                console.log('findingAttachment(' + (findIndex + 1) + ')(' + (findDtlIndex + 1) + ')(' + (findAttachIndex + 1) + ')', findingDtl);

                findingAttachments.push({
                  seqNo: findAttachIndex + 1,
                  currSeqNo: this.dataFromAuditDetailPage.auditSeqNo ? this.dataFromAuditDetailPage.auditSeqNo : '',
                  origSeqNo: this.dataFromAuditDetailPage.auditSeqNo ? this.dataFromAuditDetailPage.auditSeqNo : '',
                  findingsNo: findIndex + 1 + '',
                  findingSeqNo: findDtlIndex + 1 + '',
                  fileSeqNo: findAttachIndex + 1 + '',
                  fileName: findingAttachment.fileName,
                  flag: findingAttachment.ownerFlag,
                  companyId: finding.companyId,
                  userIns: this.dataFromAuditDetailPage.userIns ? this.dataFromAuditDetailPage.userIns : '',
                  dateIns: this.dataFromAuditDetailPage.dateIns ? this.dataFromAuditDetailPage.dateIns : ''
                })
              });
            }
          }

        });
      }
    });
    console.log('final', { findings, findingDetails, findingAttachments });
    this.db.saveFindingData({ findings, findingDetails, findingAttachments }, this.dataFromAuditDetailPage.auditSeqNo).then(() => {
      console.log("Findings has been saved in sqlite db")
      this.toast.presentToast('Finding(s) added successfully', 'success');
      isBackButtonPressed ? this.router.navigateByUrl("/audit/perform/audit-details") : ''
    })
  }



  save1(formData) {
    /*  console.log('formData ::', formData.findings);
 
     //Deep Copy Starts
 
     let saveObjDeep = JSON.parse(JSON.stringify(formData.findings));
 
     saveObjDeep.forEach(elements => {
       console.log('elements', elements);
 
       console.log(elements.findingDetail[0].categoryId);
 
       elements.findingDetail[0].categoryId = elements.findingDetail[0].categoryId.FINDINGS_CATEGORY_ID;
 
 
 
     }); */

    // console.log('saveObjDeep', saveObjDeep)

    //Deep Copy Ends
    console.log(this.dataFromAuditDetailPage);
    this.setFindingToCurrentFindingsObj();
    console.log('formData ::', formData.findings);
    /*  console.log('CurrentFinding.finding', CurrentFinding.finding);
     console.log('CurrentFinding.findingDetails', CurrentFinding.findingDetails); */
    /* CurrentFinding.finding.forEach((a) => {
      a.origSeqNo = a.origSeqNo ? a.origSeqNo : this.dataFromAuditDetailPage.auditSeqNo;
      a.currSeqNo = 0;
      a.auditDate = a.auditDate ? a.auditDate : this.dataFromAuditDetailPage.auditDate;
      a.userIns = a.userIns ? a.userIns : this.dataFromAuditDetailPage.userIns;
      a.dateIns = a.dateIns ? a.dateIns : this.dataFromAuditDetailPage.dateIns;
    })
    CurrentFinding.findingDetails.forEach((a) => {
      a.origSeqNo = a.origSeqNo ? a.origSeqNo : this.dataFromAuditDetailPage.auditSeqNo;
      a.currSeqNo = 0;
      a.userIns = a.userIns ? a.userIns : this.dataFromAuditDetailPage.userIns;
      a.dateIns = a.dateIns ? a.dateIns : this.dataFromAuditDetailPage.dateIns;
      a.auditDate = a.auditDate ? a.auditDate : this.dataFromAuditDetailPage.auditDate;
      a.auditTypeId = this.auditTypeId;
    }) */


    /*  this.db.saveFindingData(this.dataFromAuditDetailPage.auditSeqNo).then(() => {
       console.log("Findings has been saved in sqlite db")
       this.toast.presentToast('Finding(s) added successfully', 'success');
     }) */
  }

  ngOnDestroy() {
    console.log('ngOnDestroy');
    //this.setFindingToCurrentFindingsObj();
    this.backButtonSubscription.unsubscribe();
  }



  setFindingToCurrentFindingsObj() {
    console.log(this.findingsForm.getRawValue())
    console.log(Object.keys(CurrentFinding.finding));
    let existingCurrentFindings = [];

    existingCurrentFindings = Object.keys(CurrentFinding.finding);
    console.log()
    console.log(existingCurrentFindings)
    this.setFindingsToCurrentFindings(existingCurrentFindings);
  }


}
