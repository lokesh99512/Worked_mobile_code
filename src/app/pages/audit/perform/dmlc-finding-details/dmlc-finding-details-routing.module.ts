import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DmlcFindingDetailsPage } from './dmlc-finding-details.page';

const routes: Routes = [
  {
    path: '',
    component: DmlcFindingDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DmlcFindingDetailsPageRoutingModule {}
