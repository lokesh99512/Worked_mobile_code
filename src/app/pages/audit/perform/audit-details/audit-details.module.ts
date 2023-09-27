import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { IonicModule } from '@ionic/angular';
import { AuditDetailsPageRoutingModule } from './audit-details-routing.module';
import { AuditDetailsPage } from './audit-details.page';
import { IonicSelectableModule } from 'ionic-selectable';
import { QuillModule } from 'ngx-quill'
import { MaterialModule } from 'src/app/material.module';
import {CustomMaxlengthModule} from 'custom-maxlength';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AuditDetailsPageRoutingModule,
     IonicSelectableModule,
     QuillModule.forRoot(),
    SuperTabsModule.forRoot(),
    MaterialModule,
    CustomMaxlengthModule,          //added by ramya on 13-06-2022 for jira id - MOBILE-571

  ],
  declarations: [AuditDetailsPage]
})
export class AuditDetailsPageModule { }
