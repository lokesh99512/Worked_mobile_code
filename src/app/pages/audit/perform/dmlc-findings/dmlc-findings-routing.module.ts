import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DmlcFindingsPage } from './dmlc-findings.page';

const routes: Routes = [
  {
    path: '',
    component: DmlcFindingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DmlcFindingsPageRoutingModule {}
