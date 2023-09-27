import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PreviousFindingsListPageRoutingModule } from './previous-findings-list-routing.module';

import { PreviousFindingsListPage } from './previous-findings-list.page';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatExpansionModule,
    PreviousFindingsListPageRoutingModule
  ],
  declarations: [PreviousFindingsListPage]
})
export class PreviousFindingsListPageModule {}
