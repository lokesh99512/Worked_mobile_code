import { Component, NgZone, OnInit } from '@angular/core';

import { MenuController, Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DatabaseService } from './providers/database.service';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { AuthService } from './providers/auth/auth.service';
import { File } from '@ionic-native/file/ngx';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public selectedIndex = 0;
  public displayName;
  public userName;

  public appPages = [
    { title: 'Dashboard', url: '/dashboard', icon: 'home', id: 0 },
    { title: 'Refresh Master Data', url: '/refresh', icon: 'refresh', id: 1 },
  ];

  public auditPages = [
    { title: 'Retrieve ', url: '/retrieve', icon: 'download', id: 2 },  // 'Audit' removed by archana for jira Id-MOBILE-773
    { title: 'Perform ', url: '/perform', icon: 'document', id: 3 },
    { title: 'Synchronize ', url: '/synchroize', icon: 'sync', id: 4 },
  ];
  public certifictePages = [
    // { title: 'Create Certificate', url: '/create', icon: 'create', id: 5 }, //removed by archana for jira Id-MOBILE-773
    { title: 'Search', url: '/search', icon: 'search', id: 6 },
  ];

  constructor(
    public file: File,
    private auth: AuthService,
    private db: DatabaseService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    public menuCtrl: MenuController) {
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        this.appPages.map((p) => {
          return (p['active'] = event.url === p.url);
        });
      }
    });
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (this.platform.is('ipad') || this.platform.is('iphone')) {
        this.statusBar.hide();
      } else {
        this.statusBar.styleDefault();

        console.log('path:1 => applicationStorageDirectory path', this.file.applicationStorageDirectory);
        console.log('path:2 => dataDirectory path', this.file.dataDirectory);
        console.log('path:3 => cacheDirectory path', this.file.cacheDirectory);
        console.log('path:4 => externalApplicationStorageDirectory path', this.file.externalApplicationStorageDirectory);
        console.log('path:5 => externalDataDirectory path', this.file.externalDataDirectory);
        console.log('path:6 => externalCacheDirectory path', this.file.externalCacheDirectory);
      }

      this.db.getDatabaseState().subscribe((ready) => {
        let c = 0;
        if (ready) {
          this.db.getCurrentUser().subscribe(
            (user) => {
              c++;
              console.log('user,c :', user, c);
              if (user != null) {
                this.displayName = user.displayName;
                this.userName = user.userName;
              }

              if (user != null && user.isLogout) {
                this.router.navigate(['login']);
                this.splashScreen.hide();
              }
              else if (user != null && !(user.isLogout)) {
                this.router.navigateByUrl('/dashboard');
                this.splashScreen.hide();
              }
              else if (user == null) {
                console.log('navigating to login');
                this.router.navigateByUrl('/login');
                this.splashScreen.hide();
              }
            },
          );
        }
      });
    });
  }

  ngOnInit() { }
  logout() {
    console.log('logout...');
    this.auth.doLogoutUser();
    this.router.navigate(['/login']);
    this.menuCtrl.close();
  }
}
