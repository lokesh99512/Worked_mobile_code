import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, Platform } from '@ionic/angular';
import { DatabaseService } from 'src/app/providers/database.service';
import { LoadingIndicatorService } from 'src/app/providers/loading-indicator.service';
import { ToastService } from 'src/app/providers/toast.service';
import { File } from '@ionic-native/file/ngx';
import { AppConstant } from 'src/app/constants/app.constants';


/* Screen Details :
    step1: Formgroup(findingsForm) instance creation
    step2: FormBuilder(fb) instance creation
    step3: Form Intialization(findingsForm =>[])
    step4: get existing previous finding datas
    step5: save existing previous finding datas into the global variable(dataFromAuditDetailPage)
    step6: save existing previous finding category counts into the global variables(auditCat1,auditCat2,auditCat3)
    step7: get master datas(auditElements,auditStatus,auditCategory) & store into the global variables of the same
    step8: adding/filling existing previous finding values in the findingsForm. 
*/

/*
Knowing Issues :
  1. if 0 finding exist, should now show new form to fill(no finding exist msg should display).
 */
@Component({
  selector: 'app-previous-findings',
  templateUrl: './previous-findings.page.html',
  styleUrls: ['./previous-findings.page.scss'],
})
export class PreviousFindingsPage implements OnInit {

  cardDetailsFlag: boolean = true;
  users;

  //step1:formgroup instance creation
  findingsForm: FormGroup;

  @ViewChild('findingsDataForm', { static: false }) findingsDataForm: FormGroupDirective;
  auditType;

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
  latestAuditSeqNo: number;
  auditDate: any;
  portArr: any;
  dataFromAuditDetailPage;

  //step2: FormBuilder(fb) instance creation
  constructor(public fb: FormBuilder, private db: DatabaseService, private router: Router, private platform: Platform, public alertController: AlertController, public loader: LoadingIndicatorService, public filesys: File, public toast: ToastService, public appConst: AppConstant) {

    this.dataFromAuditDetailPage = this.router.getCurrentNavigation().extras.state;;

    console.log("router::", this.dataFromAuditDetailPage);
    this.auditType = this.dataFromAuditDetailPage.auditTypeId;
    this.auditSeqNumber = this.dataFromAuditDetailPage.auditSeqNo;
    this.compId = this.dataFromAuditDetailPage.companyId;
    this.auditDate = this.dataFromAuditDetailPage.auditDate;
    this.portArr = this.dataFromAuditDetailPage.port;
    this.auditReportNo = this.dataFromAuditDetailPage.auditReportNo;
    this.closeMeetingDate = new Date(this.dataFromAuditDetailPage.closeMeetingDate);
    this.openMeetingDate = new Date(this.dataFromAuditDetailPage.openMeetingDate);

    //step3: Form Intialization(findingsForm =>[])
    this.findingsForm = this.fb.group({
      findings: this.fb.array([])
    })
  }

  ngOnInit() {
    this.loader.showLoader('Fetching Findings....');//loader starts here

    //step4: get existing previous finding datas
    let req = {
      vesselImoNo: this.dataFromAuditDetailPage.vesselImoNo,
      companyImoNo: this.dataFromAuditDetailPage.companyImoNo,
      docTypeNo: this.dataFromAuditDetailPage.docTypeNo,
      auditDate: this.dataFromAuditDetailPage.auditDate,
      auditTypeId: this.dataFromAuditDetailPage.auditTypeId
    }

    this.db.getPrevFindingDetails(req).then(((pfData: any) => {
      console.log("getPrevFindingDetails RES : ", pfData);
      if (pfData && pfData != null) {
        //step5: save existing previous finding datas into the global variable(dataFromAuditDetailPage)
        this.dataFromAuditDetailPage.finding = pfData.finding;/* 
        this.dataFromAuditDetailPage.findingDetails = pfData.findingDetails;
        this.dataFromAuditDetailPage.findingAttachments = pfData.findingAttachments; */
        console.log('dataFromAuditDetail final', this.dataFromAuditDetailPage)

        /*  //step6: save existing previous finding category counts into the global variables(auditCat1,auditCat2,auditCat3)
         this.setExistingAuditCatCount(this.dataFromAuditDetailPage.finding)
         let findingLength = this.dataFromAuditDetailPage.finding.length;
         console.log('findingLength :: ', findingLength);
    */
        //step7: get master datas(auditElements,auditStatus,auditCategory) & store into the global variables of the same
        this.db.getMaDatasForFindings(this.auditType).then((auditCodes) => {
          console.log("auditCodes", auditCodes);
          this.auditElements = auditCodes[0];
          this.auditStatus = auditCodes[1];
          this.auditCategory = auditCodes[2];

          this.findingStatusOpt = auditCodes[1].map(res => res.FINDINGS_STATUS_DESC);
          console.log("auditCodes[1]", auditCodes[1]);
          console.log((this.auditStatus.filter(res => res.FINDINGS_STATUS_ID === 1001))[0].FINDINGS_STATUS_DESC)
          console.log("this.findingStatusOpt::", this.findingStatusOpt);

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
          //step8: adding exist previous finding values in the auditfinding form 

          this.initiallizeFindings(this.dataFromAuditDetailPage);
          this.loader.hideLoader();
        });
      } else {
        this.loader.hideLoader();
        alert("0 found")
      }
    }))
  }

  setFindings() {
    console.log('SET NEW FINDINGS...');
    console.log('disabled ::', this.disabled);
    console.log('isEnabled::', this.auditCatEnable);
    console.log("auditCatEnable", this.auditCatEnable);
    console.log('catSeqNo::', this.catSeqNo);

    if (this.auditCatEnable) {
      this.auditCatEnable = false;
    }


    let control = <FormArray>this.findingsForm.controls.findings;
    console.log(this.dataFromAuditDetailPage)
    this.dataFromAuditDetailPage.finding.forEach(x => {
      console.log('xxxxxxx', x)
      control.push(this.fb.group({
        displayFinging: x.displayFinging,
        auditSeqNo: x.orgSeqNo,
        findingSeqNo: x.findingsNo,
        companyId: 2,
        auditTypeId: this.dataFromAuditDetailPage.auditTypeId,
        auditDate: x.auditDate,
        auditCode: x.auditCode,
        selection: x.selection ? x.selection : '',
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

    x.findingDetail.forEach(y => {
      arr.push(this.fb.group({
        statusSeqNo: y.statusSeqNo,
        findingSeqNo: y.findingSeqNo,
        origAuditSeqNo: y.orgSeqNo,
        currentAuditSeq: y.curSeqNo,
        companyId: y.companyId,
        auditTypeId: y.auditTypeId,
        categoryId: y.categoryId,
        statusId: y.statusId,
        statusDate: y.statusDate,
        nextActionId: y.nextActionId,
        dueDate: y.dueDate,
        descriptions: y.description,
        userIns: y.userIns,
        dateIns: y.dateIns,
        findingRptAttachs: this.setFindingReport(y),
        newCreate: y.newCreate,
        serialNo: y.serialNo,
        auditPlace: y.auditPlace,
        completePrevAudit: y.completePrevAudit
      }))
    })
    return arr;
  }
  setFindingReport(y) {
    let arr = new FormArray([])

    y.findingRptAttachs.forEach(z => {
      arr.push(this.fb.group({
        fileName: z.fileName,
        findingFileByte: z.findingFileByte,
        fileSeqNo: z.fileSeqNo,
        ownerFlag: z.flag,
        userIns: z.userIns,
        dateIns: z.dateIns,
        findingSeqNo: z.findingSeqNo,
        origAuditSeqNo: z.orgSeqNo,
        currentAuditSeq: z.curSeqNo,
        companyId: z.companyId,
        statusSeqNo: z.statusSeqNo,
        auditTypeId: z.auditTypeId,
      }))
    })
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
        auditPlace: [''],
        completePrevAudit: [''],
      }))
  }

  /*  addNewFindings() {
 
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
   } */

  /* addFindingsFromUI() {
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
  } */

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


    if (this.auditType === 1001) {
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
    else if (this.auditType === 1002) {
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
    else if (this.auditType === 1003) {
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



    if (this.auditType === 1001) {
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
    else if (this.auditType === 1002) {

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
    else if (this.auditType === 1003) {

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

      if (j > this.maxFindDtlLength) {
        console.log("event.value === 'PREVIOUS STATUS'")
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

  /* async deleteOptions(index) {
    console.log('indezxx', index)
    console.log('CurrentFinding.finding', CurrentFinding.finding)

    const alert = this.alertController.create({
      mode: 'ios',
      header: 'Delete Findings',
      message: 'Are you sure you want to delete this findings?',
      buttons: [
        {
          text: 'Yes',
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
  } */

  /* getNxtActionCode() {

  } */



  /* Finding Attachments Functionality starts */

  fileChanged(event, control, finding, findingDtl, index) {
    this.filenameDisplayFlag = false
    this.currentlyChoosenFile = event.target.files[0];
    console.log("event :: ", event.target.files[0].name);
    console.log(finding)
    control.at(index).get('fileSeqNo').patchValue(index + 1);
    control.at(index).get('statusSeqNo').patchValue(findingDtl + 1);
    control.at(index).get('findingSeqNo').patchValue(finding + 1);
    control.at(index).get('auditTypeId').patchValue(this.auditType);
    control.at(index).get('origAuditSeqNo').patchValue(this.auditSeqNumber);
    control.at(index).get('currentAuditSeq').patchValue(this.auditSeqNumber);
    control.at(index).get('companyId').patchValue(this.compId);

    let fileReader = new FileReader();
    let fs = this.filesys;
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
    /* console.log(this.filesys.externalRootDirectory);
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
    }) */

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

    if (this.auditType === 1001) {
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
    else if (this.auditType === 1002) {
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
    else if (this.auditType === 1003) {
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
      console.log('disable', findingDetails.at(j))
      console.log('disable', j)
      findingDetails.at(j).disable();
      findingDetails.at(0).disable();
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

    if (j <= this.maxFindDtlLength && nextActionDesc != 'PREVIOUS STATUS') {

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
    console.log(dataFromAuditDetails)

    this.latestAuditSeqNo = parseInt(dataFromAuditDetails.auditSeqNo);

    let ar = dataFromAuditDetails.finding.map(res => res.findingsNo);
    console.log('ar', ar);
    console.log("MAX", Math.max(...ar))
    let findingLength = dataFromAuditDetails.finding.length;
    console.log(findingLength)
    //previous findings which already exist
    if (findingLength > 0) {
      this.setNewFinding = false;
      let findingsFormTemp = this.findingsForm.get('findings') as FormArray;
      this.setFindings();

      for (let i = 0; i < findingLength; i++) {


        findingsFormTemp.at(i).patchValue({
          /*  'auditCode': CurrentFinding.finding[i].auditCode,
           'displayFinging': CurrentFinding.finding[i].serialNo,
           'elements': this.getAuditElement(CurrentFinding.finding[i].auditCode)[0].AUDIT_ELEMENTS,
           'origSeqNo': CurrentFinding.finding[i].origSeqNo,
           'auditDate': CurrentFinding.finding[i].auditDate */
          'auditSeqNo': dataFromAuditDetails.finding[i].orgSeqNo,
          'auditCode': dataFromAuditDetails.finding[i].auditCode,
          'displayFinging': dataFromAuditDetails.finding[i].serialNo,
          'elements': this.getAuditElement(dataFromAuditDetails.finding[i].auditCode)[0].AUDIT_ELEMENTS
        });

        findingsFormTemp.at(i).get('auditCode').markAsDirty();
        findingsFormTemp.at(i).get('auditCode').markAsTouched();

        console.log(findingsFormTemp.at(i).get('auditSeqNo').value < this.latestAuditSeqNo);

        if (findingsFormTemp.at(i).get('auditSeqNo').value < this.latestAuditSeqNo) {
          findingsFormTemp.at(i).disable();
        }
        let findingDtl = dataFromAuditDetails.finding[i].findingDetail.filter(res => res.findingsNo == (ar[i]).toString());
        // let findingRpts = dataFromAuditDetails.finding[i].findingRptAttachs.filter(res => res.findingsNo == (ar[i]).toString());

        let findingsDtlFormTemp = findingsFormTemp.at(i).get('findingDetail') as FormArray;

        const controlDetail = findingsFormTemp.at(i).get('findingDetail')

        for (let i = 0; i < findingDtl.length - 1; i++) {
          // this.addFindingDetail(controlDetail);
        }

        let j = i;
        for (let i = 0; i < findingDtl.length; i++) {
          let findingRpts = findingDtl[i].findingRptAttachs.filter(res => res.findingsNo == (ar[i]).toString());
          let findRptsAttBasedOnFindDtl = findingRpts.filter(res => res.findingSeqNo === (i + 1) + "");

          console.log("findRptsAttBasedOnFindDtl", findRptsAttBasedOnFindDtl)

          let findingRptAttachsTemp = findingsDtlFormTemp.at(i).get('findingRptAttachs') as FormArray;

          const controlReport = findingsDtlFormTemp.at(i).get('findingRptAttachs')

          for (let i = 0; i < findRptsAttBasedOnFindDtl.length; i++) {
            // this.addFindingReports(controlReport);
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
            descriptions: findingDtl[i].description,
            origAuditSeqNo: findingDtl[i].orgSeqNo,
          })

          console.log('Before calling auditCategoryChangeInit ...');
          let findCatDesc = this.findingCategoryOpt.filter(res => res.FINDINGS_CATEGORY_ID === findingDtl[i].categoryId)[0].FINDINGS_CATEGORY_DESC;
          this.auditCategoryChangeInit(findCatDesc, j, i);
          console.log('Before calling setDisableNxtActionArr ...');
          this.setDisableNxtActionArr(j, i);
          let nxtActDesc = (findingDtl[i].nextActionId != '') ? (this.auditStatus.filter(res => res.FINDINGS_STATUS_ID === findingDtl[i].nextActionId))[0].FINDINGS_STATUS_DESC : '';
          console.log('Before calling auditNxtActionChangeInit ...')
          this.auditNxtActionChangeInit(nxtActDesc, j, i, controlDetail, findingDtl.length);
        }
      }
      console.log('findingsFormTemp :: ', findingsFormTemp);
    }
    //no previous findings exist
    /* else {
    } */
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
      cssClass: 'alertCancel',/**added by lokesh for changing text into bold mobile_jira(648)*/
      buttons: [
        {
          text: 'Yes',
          cssClass: 'alertButton',/**added by lokesh for changing text into bold mobile_jira(648)*/
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
          currSeqNo: finding.currSeqNo ? finding.currSeqNo : 0,
          origSeqNo: finding.origSeqNo ? finding.origSeqNo : finding.auditSeqNo,
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
              currSeqNo: findingDtl.currentAuditSeq ? findingDtl.currentAuditSeq : this.dataFromAuditDetailPage.auditSeqNo,
              origSeqNo: findingDtl.origAuditSeqNo ? findingDtl.origAuditSeqNo : '',
              findingsNo: findings[findIndex].findingsNo,
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
              auditTypeId: this.auditType ? this.auditType : '',
              updateDescription: findingDtl.updateDescriptions ? findingDtl.updateDescriptions : '',
              auditPlace: findingDtl.auditPlace ? findingDtl.auditPlace : ''
            })

            if (findingDtl.findingRptAttachs.length > 0) {
              findingDtl.findingRptAttachs.forEach((findingAttachment, findAttachIndex) => {
                console.log('findingAttachment(' + (findIndex + 1) + ')(' + (findDtlIndex + 1) + ')(' + (findAttachIndex + 1) + ')', findingDtl);

                findingAttachments.push({
                  seqNo: findAttachIndex + 1,
                  currSeqNo: findingAttachment.currentAuditSeq ? findingAttachment.currentAuditSeq : this.dataFromAuditDetailPage.auditSeqNo,
                  origSeqNo: findingAttachment.origAuditSeqNo ? findingAttachment.origAuditSeqNo : '',
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
    this.db.savePrevFindingData({ findings, findingDetails, findingAttachments },this.auditSeqNumber,this.auditSeqNumber).then(() => { // changed by archana for previous findings implementation
      console.log("Previous Findings has been updated in sqlite db")
      this.toast.presentToast('Finding(s) Updated successfully', 'success');
      isBackButtonPressed ? this.router.navigateByUrl("/audit/perform/audit-details") : ''
    })
  }

  ngOnDestroy() {
    console.log('ngOnDestroy');
    //this.setFindingToCurrentFindingsObj();
    this.backButtonSubscription.unsubscribe();
  }
  
  backButton(){
    this.router.navigateByUrl('/perform/audit-details'); 
  }
  

}
