import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingIndicatorService {

  isLoading = false;

  constructor(public loadingController: LoadingController) { }

  async showLoader(i: string) {
    this.isLoading = true;
    let loadingOptions;
    switch (i) {
      case 'Login': loadingOptions = {
        spinner: 'lines',
        message: 'Logging in...',
        translucent: true
      }
        break;

      case 'Config': loadingOptions = {
        spinner: 'bubbles',
        message: 'We are configuring for you Please wait a moment...',
        translucent: true
      }
        break;

      case 'Retrieve': loadingOptions = {
        spinner: 'bubbles',
        message: 'Retrieving Audit',
        translucent: true
      }
        break;
        /**Added by sudharsan for JIRA_ID=567 */
      case 'RetrieveMLC': loadingOptions = {
          spinner: 'bubbles',
          message: 'Retrieving Inspection',
          translucent: true
      }
        break;
      /**End here */
      case 'RetrieveDMLCII': loadingOptions = {
          spinner: 'bubbles',
          message: 'Retrieving Review',
          translucent: true
      }
        break;

      case 'PreparingCertificate': loadingOptions = {
        spinner: 'bubbles',
        message: 'Preparing Certificate',
        translucent: true
      }
        break;

      case 'PreparingReport': loadingOptions = {
        spinner: 'bubbles',
        message: 'Preparing Report',
        translucent: true
      }
        break;
      case 'AuditFetch': loadingOptions = {
        spinner: 'dots',
        message: 'Fetching Data....',
        translucent: true
      }
        break;
      case 'AuditSave': loadingOptions = {
        spinner: 'circles',
        message: 'Saving Data',
        translucent: true
      }
        break;
      case 'AuditSync': loadingOptions = {
        spinner: 'circles',
        message: 'Sync in Progress',
        translucent: true
      }
        break;
      case 'Prepare2Sync': loadingOptions = {
        spinner: 'dots',
        message: 'Preparing Audit data to Sync..',
        translucent: true
      }
        break;
      case 'Prepare2Syncreview': loadingOptions = {
        spinner: 'dots',
        message: 'Preparing Review data to Sync..',
        translucent: true
      }
        break;
        /**Added by sudharsan for JIRA_ID=567 */
      case 'Prepare2Syncinspection': loadingOptions = {
        spinner: 'dots',
        message: 'Preparing Inspection data to Sync..',
        translucent: true
      }
        break;
      /**End here */
  

      default: loadingOptions = {
        spinner: 'lines',
        message: i,
        translucent: true
      }
        break;
    }
    return await this.loadingController.create(
      loadingOptions
    ).then((res) => {
      res.present().then(() => {
        console.log('presented');
        if (!this.isLoading) {
          res.dismiss().then(() => console.log('abort presenting'));
        }
      })
    });

  }

  async hideLoader() {
    this.isLoading = false;
    await this.loadingController.dismiss().catch((error) => {
      console.log('error', error);
    });

  }
}
