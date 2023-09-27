import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PreviousFindingDetailsPageRoutingModule } from './previous-finding-details-routing.module';

import { PreviousFindingDetailsPage } from './previous-finding-details.page';
import { IonicSelectableModule } from 'ionic-selectable';
import { MaterialModule } from 'src/app/material.module';
import { CustomMaxlengthModule } from 'custom-maxlength';

@NgModule({
  imports: [
    CommonModule,
    IonicSelectableModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    CustomMaxlengthModule,                    //added by archana for jira ID-MOBILE-921
    PreviousFindingDetailsPageRoutingModule
  ],
  declarations: [PreviousFindingDetailsPage]
})
export class PreviousFindingDetailsPageModule { }
