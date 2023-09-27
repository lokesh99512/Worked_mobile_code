import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PreviousFindingsListPage } from './previous-findings-list.page';

const routes: Routes = [
  {
    path: '',
    component: PreviousFindingsListPage
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PreviousFindingsListPageRoutingModule { }
