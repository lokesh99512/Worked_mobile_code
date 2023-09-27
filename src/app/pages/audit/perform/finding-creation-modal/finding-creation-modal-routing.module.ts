import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FindingCreationModalPage } from './finding-creation-modal.page';

const routes: Routes = [
  {
    path: '',
    component: FindingCreationModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FindingCreationModalPageRoutingModule {}
