import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CentralLoginSystemsPageRoutingModule } from './central-login-systems-routing.module';

import { CentralLoginSystemsPage } from './central-login-systems.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CentralLoginSystemsPageRoutingModule
  ],
  declarations: [CentralLoginSystemsPage]
})
export class CentralLoginSystemsPageModule {}
