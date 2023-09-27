import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FindingsListPageRoutingModule } from './findings-list-routing.module';

import { FindingsListPage } from './findings-list.page';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FindingsListPageRoutingModule,
    MatExpansionModule
  ],
  declarations: [FindingsListPage]
})
export class FindingsListPageModule {}
