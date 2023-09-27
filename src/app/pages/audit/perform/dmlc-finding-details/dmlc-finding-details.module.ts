import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DmlcFindingDetailsPageRoutingModule } from './dmlc-finding-details-routing.module';

import { DmlcFindingDetailsPage } from './dmlc-finding-details.page';
import { MaterialModule } from 'src/app/material.module';
import { IonicSelectableModule } from 'ionic-selectable';
import { CustomMaxlengthModule } from 'custom-maxlength';


@NgModule({
  imports: [
    CommonModule,
    IonicSelectableModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MaterialModule,
    CustomMaxlengthModule,          //added by ramya on 02-08-2022 for jira id - MOBILE-571
    DmlcFindingDetailsPageRoutingModule
  ],
  declarations: [DmlcFindingDetailsPage]
})
export class DmlcFindingDetailsPageModule { }
