import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SynchroizePage } from './synchroize.page';

const routes: Routes = [
  {
    path: '',
    component: SynchroizePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SynchroizePageRoutingModule {}
