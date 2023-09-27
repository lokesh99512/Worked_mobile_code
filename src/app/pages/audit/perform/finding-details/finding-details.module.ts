import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FindingDetailsPageRoutingModule } from './finding-details-routing.module';

import { FindingDetailsPage } from './finding-details.page';
import { IonicSelectableModule } from 'ionic-selectable';
import { MaterialModule } from 'src/app/material.module';
import { CustomMaxlengthModule } from 'custom-maxlength';



@NgModule({
  imports: [
    CommonModule,
    IonicSelectableModule,
    FormsModule,
    IonicModule,
    FindingDetailsPageRoutingModule,
    MaterialModule,
    CustomMaxlengthModule,          //added by ramya on 02-08-2022 for jira id - MOBILE-571
  ],
  declarations: [FindingDetailsPage]
})
export class FindingDetailsPageModule { }
