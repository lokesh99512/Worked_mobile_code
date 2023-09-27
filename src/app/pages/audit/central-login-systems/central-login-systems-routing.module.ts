import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CentralLoginSystemsPage } from './central-login-systems.page';

const routes: Routes = [
  {
    path: '',
    component: CentralLoginSystemsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CentralLoginSystemsPageRoutingModule {}
