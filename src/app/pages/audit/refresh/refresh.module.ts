import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RefreshPageRoutingModule } from './refresh-routing.module';

import { RefreshPage } from './refresh.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RefreshPageRoutingModule
  ],
  declarations: [RefreshPage]
})
export class RefreshPageModule {}
