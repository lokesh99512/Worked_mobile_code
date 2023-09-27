import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class AuditSearchService {
  searchCategory = [
    {
      'Vessel Imo No': 'vesselImoNo',
      'Vessel Name': 'vesselName',
      'Company Imo No': 'companyImoNo',
      'Issue Date': 'certIssueDate', //** Fixed MOBILE-409 by Archana */
      'Expiry Date': 'certExpireDate', //** Fixed MOBILE-409 by Archana */
      'Certificate No': 'certificateNo',
      'Audit Type Desc': 'auditTypeDesc',
    },
  ];

  constructor() {}

  searchAudits(searchText, searchArray, searchPlaceholderText) {
    console.log('searchPlaceholderText', searchPlaceholderText);
    console.log(searchText);
    
    searchArray.filter((data) => {
      console.log('certExpireDate.isBefore.searchText');
      console.log(
        moment(moment(data.certExpireDate)).isBefore(moment(searchText))
      );
      console.log('---------------------------');
    });

    return searchArray.filter((data) => {
      console.log(data.certExpireDate);
      /** Fixed MOBILE-461 MOBILE-474 code added by Archana */
      if(searchPlaceholderText === 'Search'){
      if (data.vesselName.toLowerCase().includes(searchText.toLowerCase())) {
        console.log('vesselName', searchText);
        return data;
      } else if (
        data.vesselImoNo.toString().toLowerCase().includes(searchText)
      ) {
        console.log('vesselImoNo', searchText);
        return data;
      } else if (data.companyImoNo.toLowerCase().includes(searchText)) {
        console.log('companyImoNo', searchText);
        return data;
      } else if (
        data.certificateNo
          ? data.certificateNo.toString().includes(searchText)
          : false
      ) {
        console.log('certificateNo', searchText);
        return data;
      } else if (
        data.auditTypeDesc.toLowerCase().includes(searchText.toLowerCase())
      ) {
        console.log('auditTypeDesc', searchText);
        return data;
      } else if (
        searchPlaceholderText === 'Search Issue Date' &&
        data.certIssueDate != null &&
        new Date(data.certIssueDate) >= new Date(searchText)
      ) {
        console.log('issue true');
        if (data.certIssueDate == null) {
          data.certIssueDate = '--';
        }
        console.log('certIssueDate', searchText);
        return data;
      } else if (
        searchPlaceholderText === 'Search Expiry Date' &&
        data.certExpireDate != null &&
        moment(moment(data.certExpireDate)).isSameOrBefore(moment(searchText))
      ) {
        console.log('expiry true');
        if (data.certExpireDate == null) {
          data.certExpireDate = '--';
        }
        console.log('certExpireDate', searchText);
        return data;
      }
    }
    else {
      if (data.vesselName.toLowerCase().includes(searchText.toLowerCase()) && searchPlaceholderText === 'Search Vessel Name') {
        console.log('vesselName', searchText);
        return data;
      } else if (
        data.vesselImoNo.toString().toLowerCase().includes(searchText) && searchPlaceholderText === 'Search Vessel Imo No'
      ) {
        console.log('vesselImoNo', searchText);
        return data;
      } else if (data.companyImoNo.toLowerCase().includes(searchText) && searchPlaceholderText === 'Search Company Imo No' ) {
        console.log('companyImoNo', searchText);
        return data;
      } else if (data.certificateNo.toString().includes(searchText) && searchPlaceholderText === 'Search Certificate No'
          
      ) {
        console.log('certificateNo', searchText);
        return data;
      } else if (
        data.auditTypeDesc.toLowerCase().includes(searchText.toLowerCase() && searchPlaceholderText === 'Search Audit Type Desc' )
      ) {
        console.log('auditTypeDesc', searchText);
        return data;
      } 
      
      else if (
        searchPlaceholderText === 'Search Issue Date' &&
        data.certIssueDate != null &&
        moment(moment(data.certIssueDate)).isSame(moment(searchText))
        // new Date(data.certIssueDate) >= new Date(searchText)
      ) {
        console.log('issue true');
        if (data.certIssueDate == null) {
          data.certIssueDate = '--';
        }
        console.log('certIssueDate', searchText); 
        return data;
      } 
      
      else if (
        searchPlaceholderText === 'Search Expiry Date' &&
        data.certExpireDate != null &&
        moment(moment(data.certExpireDate)).isSame(moment(searchText))
      ) {
        console.log(searchText);
        console.log(data.certExpireDate);
         console.log('expiry true');
        if (data.certExpireDate == null) {
          data.certExpireDate = '--';
        }
        console.log('certExpireDate', searchText);
        return data;
      }

    }
    });
  }
}
