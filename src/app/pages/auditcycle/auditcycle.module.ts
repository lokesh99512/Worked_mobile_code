import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuditcyclePageRoutingModule } from './auditcycle-routing.module';

import { AuditcyclePage } from './auditcycle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuditcyclePageRoutingModule
  ],
  declarations: [AuditcyclePage]
})
export class AuditcyclePageModule {}
