import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { AuditSearchService } from 'src/app/providers/audit-search.service';
import { CertificateSearchService } from 'src/app/providers/certificate-search.service';
import { DatabaseService } from 'src/app/providers/database.service';
import { MoreInfoPage } from '../../audit/more-info/more-info.page';
import { CertificateDetailsPage } from '../certificate-details/certificate-details.page';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit, OnDestroy, AfterViewInit {
  backButtonSubscription;
  @ViewChild('mySelect', { static: true }) selectRef: any;
  number = 'number';
  text = 'text';
  customPopoverOptions: any;

  searchVesselCategory = this.certificateSearch.searchVesselCategory;

  searchVesselCategoryOptions = Object.keys(this.searchVesselCategory[0]);

  fakeAudits: Array<any> = new Array(5);
  selectedType: any;
  searchText: any;
  searchType: any;
  userName;
  searchPlaceholderText: string = 'Search';
  searchVesselCategoryType: any;
  tempArray: any = [];
  searchArray: Object;

  constructor(
    public modal: ModalController,
    private certificateSearch: CertificateSearchService,
    private router: Router,
    private auditsearch: AuditSearchService,
    private db: DatabaseService,
    private platform: Platform
  ) {
    //this.tempArray = this.certificateSearch.mockVesselItems;
    console.log(this.router);
  }

  searchFilter(event) {
    this.selectRef.interface = 'popover';
    this.selectRef.open(event);
  }

  selectedCategoryType(event) {
    let searchCatType = event.target.value.trim();

    if (event.target.value.trim() === 'Vessel Imo No') {
      this.searchType = this.number;
      console.log(this.searchVesselCategory[0]);
      this.searchPlaceholderText = 'Search Vessel Imo No';
    } else if (event.target.value.trim() === 'Vessel Name') {
      this.searchType = this.text;
      this.searchPlaceholderText = 'Search Vessel Name';
    } else if (event.target.value.trim() === 'Vessel Type Name') {
      this.searchType = this.text;
      this.searchPlaceholderText = 'Search Vessel Type Name';
    } else if (event.target.value.trim() === 'Company Imo No') {
      this.searchType = this.number;
      this.searchPlaceholderText = 'Search Company Imo No';
    } else if (event.target.value.trim() === 'Company Name') {
      this.searchType = this.text;
      this.searchPlaceholderText = 'Search Company Name';
    } else if (event.target.value.trim() === 'Official No') {
      this.searchType = this.number;
      this.searchPlaceholderText = 'Search Official No';
    }
  }

  getSearchedText(event) {
    console.log(typeof this.searchText);
    console.log('Searched Text=' + this.searchText + ';');

    let sr = this.auditsearch.searchAudits(
      this.searchText,
      this.searchArray,
      'CertificateCreate'
    );

    console.log(sr);

    this.tempArray = sr;
  }
/** MOBILE-378 code modified by Kiran    start */
  async presentModal(vessel) {
    this.router.navigate([
      '/more-info',
      {
        "modalDetails":JSON.stringify(vessel),
        "routeUrl": this.router.url,
        "modalTitle": vessel.vesselName
      },
    ]);
    // const modal = await this.modal.create({
    //   component: MoreInfoPage,
    //   componentProps: {
    //     modalDetails: vessel,
    //     routeUrl: this.router.url,
    //     modalTitle: vessel.vesselName,
    //   },
    // });
    // return await modal.present();
  }
/** code modified by Kiran    end */

  async certificateModal(vessel) {
    console.log(vessel);
    const modal = await this.modal.create({
      component: CertificateDetailsPage,
      componentProps: {
        modalDetails: vessel,
        routeUrl: this.router.url,
        modalTitle: vessel.vesselName,
      },
    });
    return await modal.present();
  }

  ngOnInit() {
    this.db.getCurrentUser().subscribe((user) => {
      this.userName = user.userName;
    });
    /* this.dataservice.userName$.subscribe(data => {
      this.userName = data.valueOf();
    }); */

    this.initDataItems();
  }

  private initDataItems() {
    this.getAudits();
  }

  getAudits() {
    this.db
      .getVesselDtlForCertificateCreation(this.userName)
      .then((resp: any) => {
        console.log("Vessel Dtl's of retrived audits by current user : ", resp);

        let vesselDtlArray: any;
        vesselDtlArray = resp;
        console.log('vesselDtlArray', vesselDtlArray);
        this.tempArray = vesselDtlArray;
        this.searchArray = vesselDtlArray;
      });
    /* console.log('this.userId', this.userId);
    this.dbService.getAvailAuditRecordsOfCurrentUser(this.userId).then((audits) => {
      console.log('AUDITS : ', audits);
      this.tempArray = audits;
      this.searchArray = audits;
      this.tempArray.forEach(data => {
        if (data.certIssueDate == null) {
          data.certIssueDate = "--";
        }
        if (data.certExpireDate == null) {
          data.certExpireDate = "--";
        }
      });
    }); */
  }

  ngAfterViewInit() {
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      this.router.navigateByUrl('/dashboard');
    });
  }

  ngOnDestroy() {
    this.backButtonSubscription.unsubscribe();
  }
}
