import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavParams, Platform } from '@ionic/angular';

@Component({
  selector: 'app-more-info',
  templateUrl: './more-info.page.html',
  styleUrls: ['./more-info.page.scss'],
})
export class MoreInfoPage implements OnInit {
  backButtonSubscription;
  modalTitle: any;
  modalDetail: any;
  modalHeaderTitle: any;
  modalFlag: any;
  TYPEDESC:string;
  routerName;

  constructor(
    // navParams: NavParams,
    public modalController: ModalController,
    private platform: Platform,
    private router: Router,
    private route: ActivatedRoute
  ) {
    console.log('router', router);
    console.log('route', route);

    console.log(JSON.parse(this.route.snapshot.paramMap.get('modalDetails')));
    console.log(this.route.snapshot.paramMap.get('routeUrl'));
    console.log(this.route.snapshot.paramMap.get('modalTitle'));
    console.log('___________________________');

    /*  console.log(navParams.data.modalDetails);
    console.log(navParams.data.routeUrl);
    console.log(navParams); */

    this.modalTitle = this.route.snapshot.paramMap.get('modalTitle');
    this.modalDetail = JSON.parse(
      this.route.snapshot.paramMap.get('modalDetails')
    );

    if (this.route.snapshot.paramMap.get('routeUrl') == '/perform') {
      this.modalFlag = 'performAudit';
      /**Added by sudharsan for JIRA-ID =565*/
      if(JSON.parse(this.route.snapshot.paramMap.get('modalDetails')).auditTypeId==1005){
        this.modalHeaderTitle = 'Vessel Review'; // added by archana 29-06-2022 for jira id-MOBILE-502
        this.TYPEDESC='Review';
        }
        else if(JSON.parse(this.route.snapshot.paramMap.get('modalDetails')).auditTypeId==1003){
          this.modalHeaderTitle = 'Vessel Inspection'; // added by archana 29-06-2022 for jira id-MOBILE-502
          this.TYPEDESC='Inspection';
        }
        else{
          this.modalHeaderTitle = 'Vessel Audit'; // added by archana 29-06-2022 for jira id-MOBILE-502
          this.TYPEDESC='Audit';
        }
        /**End here */
      
      this.routerName = '/perform';
    } else if (this.route.snapshot.paramMap.get('routeUrl') == '/retrieve') {
      /**Added by sudharsan for JIRA-ID =565*/
      this.modalFlag = 'retrieveAudit';
      if(JSON.parse(this.route.snapshot.paramMap.get('modalDetails')).auditTypeId==1005){
      this.modalHeaderTitle = 'Retrieve Review';
      this.TYPEDESC='Review';
      }
      else if(JSON.parse(this.route.snapshot.paramMap.get('modalDetails')).auditTypeId==1003){
        this.modalHeaderTitle = 'Retrieve Inspection';
        this.TYPEDESC='Inspection';
      }
      else{
        this.modalHeaderTitle = 'Retrieve Audit';
        this.TYPEDESC='Audit';
      }
      /**End here */
      this.routerName = '/retrieve';
    } else if (this.route.snapshot.paramMap.get('routeUrl') == '/create') {
      this.modalFlag = 'certCreate';
      this.modalHeaderTitle = 'Certificate Create';
      this.routerName = '/create';
    } else if (this.route.snapshot.paramMap.get('routeUrl') == '/search') {
      this.modalFlag = 'certSearch';
      this.modalHeaderTitle = 'Certificate Search';
      this.routerName = '/search';
    } else if (this.route.snapshot.paramMap.get('routeUrl') == '/synchroize') {
      this.modalFlag = 'syncAudit';
      /**Added by sudharsan for JIRA-ID =565*/
      if(JSON.parse(this.route.snapshot.paramMap.get('modalDetails')).auditTypeId==1005){
        this.modalHeaderTitle = 'Synchronize Review';
        this.TYPEDESC='Review';
        }
        else if(JSON.parse(this.route.snapshot.paramMap.get('modalDetails')).auditTypeId==1003){
          this.modalHeaderTitle = 'Synchronize Inspection';
          this.TYPEDESC='Inspection';
        }
        else{
          this.modalHeaderTitle = 'Synchronize Audit';
          this.TYPEDESC='Audit';
        }
        /**End here */
      this.routerName = '/synchroize';
    }
  }

  closeModal() {
    this.router.navigateByUrl(this.routerName);
  }

  ngOnInit() {}
  ngAfterViewInit() {
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      this.router.navigateByUrl(this.routerName);
    });
  }

  ngOnDestroy() {
    this.backButtonSubscription.unsubscribe();
  }
}
