import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PreviousFindingsPage } from './previous-findings.page';

const routes: Routes = [
  {
    path: '',
    component: PreviousFindingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PreviousFindingsPageRoutingModule {}
