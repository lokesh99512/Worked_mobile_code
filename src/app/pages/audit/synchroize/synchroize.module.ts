import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SynchroizePageRoutingModule } from './synchroize-routing.module';

import { SynchroizePage } from './synchroize.page';
import { MaterialModule } from 'src/app/material.module';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MaterialModule,
    IonicSelectableModule,
    ReactiveFormsModule,
    SynchroizePageRoutingModule
  ],
  declarations: [SynchroizePage]
})
export class SynchroizePageModule {}
