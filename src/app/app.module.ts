import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Zip } from '@ionic-native/zip/ngx';
import { File } from '@ionic-native/file/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { Network } from '@ionic-native/network/ngx';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { InterceptorService } from './providers/interceptors/token.interceptor.service';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AppConstant } from './constants/app.constants';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AuthService } from './providers/auth/auth.service';
import { Base64 } from '@ionic-native/base64/ngx';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { DatePipe } from '@angular/common'
import { Ionic4DatepickerModule } from '@logisticinfotech/ionic4-datepicker';


@NgModule({
  declarations: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  entryComponents: [],
  imports: [
    HttpClientModule,
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    Ionic4DatepickerModule,
    SuperTabsModule.forRoot(),
  ],
  providers: [
   AuthService,
    SQLite,
    SQLitePorter,
    StatusBar,
    SplashScreen,
    Network,
    Zip,
    File,
    FileOpener,
    AppConstant,
    NativeStorage,
    DatePipe,
    Base64,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
   
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
