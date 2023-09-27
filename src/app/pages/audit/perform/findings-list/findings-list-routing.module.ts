import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FindingsListPage } from './findings-list.page';

const routes: Routes = [
  {
    path: '',
    component: FindingsListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FindingsListPageRoutingModule {}
