import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PreviousFindingsPageRoutingModule } from './previous-findings-routing.module';

import { PreviousFindingsPage } from './previous-findings.page';
import { IonicSelectableModule } from 'ionic-selectable';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { CustomMaxlengthModule } from 'custom-maxlength';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    IonicSelectableModule,
    MatAutocompleteModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    CustomMaxlengthModule,          //added by ramya on 02-08-2022 for jira id - MOBILE-571
    PreviousFindingsPageRoutingModule
  ],
  declarations: [PreviousFindingsPage]
})
export class PreviousFindingsPageModule {}
