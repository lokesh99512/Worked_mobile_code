import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FindingDetailsPage } from './finding-details.page';

const routes: Routes = [
  {
    path: '',
    component: FindingDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FindingDetailsPageRoutingModule {}
