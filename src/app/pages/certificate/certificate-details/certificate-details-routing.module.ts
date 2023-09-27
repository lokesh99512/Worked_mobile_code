import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CertificateDetailsPage } from './certificate-details.page';

const routes: Routes = [
  {
    path: '',
    component: CertificateDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CertificateDetailsPageRoutingModule {}
