import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerformPage } from './perform.page';

const routes: Routes = [
  {
    path: '',
    component: PerformPage
  },
  {
    path: 'audit-details',
    loadChildren: () => import('./audit-details/audit-details.module').then( m => m.AuditDetailsPageModule)
  },
  {
    path: 'findings',
    loadChildren: () => import('./findings/findings.module').then( m => m.FindingsPageModule)
  },
  {
    path: 'previous-findings',
    loadChildren: () => import('./previous-findings/previous-findings.module').then( m => m.PreviousFindingsPageModule)
  },
  {
    path: 'findings-list',
    loadChildren: () => import('./findings-list/findings-list.module').then( m => m.FindingsListPageModule)
  },
  {
    path: 'finding-creation-modal',
    loadChildren: () => import('./finding-creation-modal/finding-creation-modal.module').then( m => m.FindingCreationModalPageModule)
  },
  {
    path: 'finding-details',
    loadChildren: () => import('./finding-details/finding-details.module').then( m => m.FindingDetailsPageModule)
  },
  {
    path: 'dmlc-findings',
    loadChildren: () => import('./dmlc-findings/dmlc-findings.module').then( m => m.DmlcFindingsPageModule)
  },
  {
    path: 'dmlc-finding-details',
    loadChildren: () => import('./dmlc-finding-details/dmlc-finding-details.module').then( m => m.DmlcFindingDetailsPageModule)
  },
  {
    path: 'previous-findings-list',
    loadChildren: () => import('./previous-findings-list/previous-findings-list.module').then( m => m.PreviousFindingsListPageModule)
  },
  {
    path: 'previous-finding-details',
    loadChildren: () => import('./previous-finding-details/previous-finding-details.module').then( m => m.PreviousFindingDetailsPageModule)
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerformPageRoutingModule {}
