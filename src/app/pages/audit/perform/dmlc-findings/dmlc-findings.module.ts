import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DmlcFindingsPageRoutingModule } from './dmlc-findings-routing.module';

import { DmlcFindingsPage } from './dmlc-findings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DmlcFindingsPageRoutingModule
  ],
  declarations: [DmlcFindingsPage]
})
export class DmlcFindingsPageModule {}
