import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FindingsPage } from './findings.page';

const routes: Routes = [
  {
    path: '',
    component: FindingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FindingsPageRoutingModule {}
