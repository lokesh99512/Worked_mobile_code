import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CertificateDetailsPageRoutingModule } from './certificate-details-routing.module';

import { CertificateDetailsPage } from './certificate-details.page';
import { IonicSelectableModule } from 'ionic-selectable';
import { DatePipe } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    IonicSelectableModule,
    CertificateDetailsPageRoutingModule,
    MaterialModule
  ],
  providers: [DatePipe],
  declarations: [CertificateDetailsPage]
})
export class CertificateDetailsPageModule {}
