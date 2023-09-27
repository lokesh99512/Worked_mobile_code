import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerformPageRoutingModule } from './perform-routing.module';

import { PerformPage } from './perform.page';
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
    PerformPageRoutingModule
  ],
  declarations: [PerformPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PerformPageModule {}
