import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RetrievePageRoutingModule } from './retrieve-routing.module';

import { RetrievePage } from './retrieve.page';
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
    RetrievePageRoutingModule
  ],
  declarations: [RetrievePage]
})
export class RetrievePageModule {}
