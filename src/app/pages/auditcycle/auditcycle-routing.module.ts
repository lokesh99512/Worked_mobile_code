import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuditcyclePage } from './auditcycle.page';

const routes: Routes = [
  {
    path: '',
    component: AuditcyclePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuditcyclePageRoutingModule {}
