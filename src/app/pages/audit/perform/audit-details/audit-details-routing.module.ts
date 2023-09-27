import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuditDetailsPage } from './audit-details.page';

const routes: Routes = [
  {
    path: '',
    component: AuditDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuditDetailsPageRoutingModule {}
