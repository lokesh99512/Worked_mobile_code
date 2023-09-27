import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PreviousFindingDetailsPage } from './previous-finding-details.page';

const routes: Routes = [
  {
    path: '',
    component: PreviousFindingDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PreviousFindingDetailsPageRoutingModule {}
