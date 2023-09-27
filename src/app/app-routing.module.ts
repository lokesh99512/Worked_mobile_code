import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'retrieve',
    
    loadChildren: () => import('./pages/audit/retrieve/retrieve.module').then( m => m.RetrievePageModule)
  },
  {
    path: 'perform',
    loadChildren: () => import('./pages/audit/perform/perform.module').then( m => m.PerformPageModule)
  },
  {
    path: 'synchroize',
    loadChildren: () => import('./pages/audit/synchroize/synchroize.module').then( m => m.SynchroizePageModule)
  },
  {
    path: 'refresh',
    loadChildren: () => import('./pages/audit/refresh/refresh.module').then( m => m.RefreshPageModule)
  },
  {
    path: 'create',
    loadChildren: () => import('./pages/certificate/create/create.module').then( m => m.CreatePageModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./pages/certificate/search/search.module').then( m => m.SearchPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'forget-password',
    loadChildren: () => import('./pages/auth/forget-password/forget-password.module').then( m => m.ForgetPasswordPageModule)
  },
  {
    path: 'more-info',
    loadChildren: () => import('./pages/audit/more-info/more-info.module').then( m => m.MoreInfoPageModule)
  },
  {
    path: 'certificate-details',
    loadChildren: () => import('./pages/certificate/certificate-details/certificate-details.module').then( m => m.CertificateDetailsPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./notifications/notifications.module').then( m => m.NotificationsPageModule)
  },
  {
    path: 'auditcycle',
    loadChildren: () => import('./pages/auditcycle/auditcycle.module').then( m => m.AuditcyclePageModule)
  },  {
    path: 'central-login-systems',
    loadChildren: () => import('./pages/audit/central-login-systems/central-login-systems.module').then( m => m.CentralLoginSystemsPageModule)
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
