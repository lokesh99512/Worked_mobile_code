import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FindingCreationModalPageRoutingModule } from './finding-creation-modal-routing.module';

import { FindingCreationModalPage } from './finding-creation-modal.page';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicSelectableModule,
    IonicModule,
    FindingCreationModalPageRoutingModule
  ],
  declarations: [FindingCreationModalPage]
})
export class FindingCreationModalPageModule {}
