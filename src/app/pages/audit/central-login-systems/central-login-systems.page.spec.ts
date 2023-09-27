import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ConditionalExpr } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ToastService } from 'src/app/providers/toast.service';

@Component({
  selector: 'app-central-login-systems',
  templateUrl: './central-login-systems.page.html',
  styleUrls: ['./central-login-systems.page.scss'],
})
export class CentralLoginSystemsPage implements OnInit {
  auditTypeDesc: any;
  title: any;
  finding: any;

  /* Master Data's */
  MaAuditCodeAndElements: any
  MaCategoryOptions: any;

  /* Filterd Array Items to select*/
  categoryArrayListItems: any;
  auditCodeArrayListItems: any;


  selectedAuditCategoryItem: any;
  selectedAuditCodeItem: any;

  /* Selected Options for UI-Bindings */
  selectedAuditCode: any;
  selectedAuditElement: any;

  selectedAuditCategory: any;
  isAuditCategoryEnabled: boolean = false;

  constructor(public modal: ModalController, navParams: NavParams, public toast: ToastService) {
    console.log(navParams);
    this.auditTypeDesc = navParams.data.auditTypeDesc;
    this.title = navParams.data.title;

    this.MaAuditCodeAndElements = navParams.data.auditCodeAndElements;
    this.MaCategoryOptions = navParams.data.categoryOptions;

    this.auditCodeArrayListItems = this.MaAuditCodeAndElements.map(res => res.AUDIT_CODE + ',' + res.AUDIT_ELEMENTS);
    this.categoryArrayListItems = this.MaCategoryOptions.map(res => res.FINDINGS_CATEGORY_DESC);

  }

  ngOnInit() {
  }

  async closeModal() {
    await this.modal.dismiss();
  }

  //  OnChange Functions ............

  auditCodeOnChange(event) {
    console.log(event.value.split(',')[0]);
    let element = this.getAuditElement(event.value.split(',')[0]);
    console.log('element', element[0].AUDIT_ELEMENTS)
    this.selectedAuditCode = event.value.split(',')[0];
    this.selectedAuditElement = element[0].AUDIT_ELEMENTS;

  }
  getAuditElement(auditCode) {
    return this.MaAuditCodeAndElements.filter(res => res.AUDIT_CODE === auditCode)
  }

  async updateFinding() {
    if (!this.selectedAuditCode) {
      this.toast.presentToast('Please Select ' + this.auditTypeDesc + ' Code to Proceed', 'danger')
    } else if (!this.selectedAuditCategory) {
      this.toast.presentToast('Please Select Category to Proceed', 'danger')
    }
    else {
      let finding = {
        'auditCode': this.selectedAuditCode,
        'auditDate': '',
        'currSeqNo': '',
        'findingsNo': '',
        'origSeqNo': '',
        'findingDtl': [],
        'serialNo': this.selectedAuditCategory,
        'statusDesc': 'NotYetCreated'
      }
      this.modal.dismiss(finding);
    }

  }




}
