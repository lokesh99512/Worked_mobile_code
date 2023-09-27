import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})

export class CertificateSearchService {
  searchVesselCategory = [{
    "Vessel Imo No": "vesselImoNo",
    "Vessel Name": "vesselName",
    "Vessel Type Name": "vesselTypeName",
    "Company Name": "companyName",
    "Company Imo No": "companyImoNo",
    "Official No": "officialNo",
  }
  ];

  searchCertificateCategory = [{
    "Vessel Imo No": "vesselImoNo",
    "Vessel Name": "vesselName",
    "Company IMO No":"companyImoNo",
    "Certificate No": "certificateNo",
    "Certificate Issue Date": "certificateIssueDate",
    "Certificate Expiry Date": "certificateExpiryDate",
    "Official No":"officialNo",
    "Certificate Type":"certificateType",
    "Certificate Sub Type":"certificateSubType",
    "Certificate Status":"certificateStatus"
    //  "Certificate With Audit":"certificateWithAudit",  
  }
  ];
    
  searchCertificates(searchText, searchArray,searchPlaceholderText) {
    return searchArray.filter((data) => {
      console.log(data);
      for (let i = 0; i < data.auditTypeArray.length; i++) {
        if(data.auditTypeArray[i].auditTypeId==data.auditTypeId){
          data.certificateType=data.auditTypeArray[i].auditTypeDesc;
        }
      }
      for(let i=0;i< data.masterObjectArray.auditType.length;i++) {
        if(data.masterObjectArray.auditType[i].auditSubtypeId==data.auditSubTypeId){
          data.certificateSubType=data.masterObjectArray.auditType[i].auditSubtypeDesc;
        }
      }
      data.activeStatus==1? data.certificateStatus="Active":data.certificateStatus="Inactive";
      console.log(data);
      console.log(data.vesselName.toLowerCase(), searchText.toLowerCase());
      if(searchPlaceholderText === 'Search'){                                     //added by archana for jira ID-MOBILE-401
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
          data.certificateType.toLowerCase().includes(searchText.toLowerCase())
        ) {
          console.log('certificateType', searchText);
          return data;
        } else if (
          searchPlaceholderText === 'IssueDate' &&
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
          searchPlaceholderText === 'ExpiryDate' &&
          data.certExpireDate != null &&
          moment(moment(data.certExpireDate)).isSameOrBefore(moment(searchText))
        ) {
          console.log('expiry true');
          if (data.certExpireDate == null) {
            data.certExpireDate = '--';
          }
          console.log('certExpireDate', searchText);
          return data;
        } else if(data.officialNo.toString().toLowerCase().includes(searchText)){                         //added by archana for jira ID-MOBILE-382
          return data;
        } else if (data.certificateSubType.toString().toLowerCase().includes(searchText)
        ) {
          return data;
        } else if (data.certificateStatus.toString().toLowerCase().includes(searchText) ) {
          return data;
        }
      } else {
      if (data.vesselName.toLowerCase().includes(searchText.toLowerCase())  && searchPlaceholderText === 'Search Vessel Name') {
        console.log('vesselName', searchText);
        return data;
      } else if (
        data.vesselImoNo.toString().toLowerCase().includes(searchText)  && searchPlaceholderText === 'Search Vessel Imo No'
      ) {
        console.log('vesselImoNo', searchText);
        return data;
      } else if (data.companyImoNo.toLowerCase().includes(searchText)  && searchPlaceholderText === 'Search Company IMO No') {
        console.log('companyImoNo', searchText);
        return data;
      } else if (
        (data.certificateNo
          ? data.certificateNo.toString().includes(searchText)
          : false) && searchPlaceholderText === 'Search Certificate No'
      ) {
        console.log('certificateNo', searchText);
        return data;
      } 
      // else if (data.certificateWithAudit.toLowerCase().includes(searchText.toLowerCase())) {
      //   console.log("certificateWithAudit", searchText);
      //   return data;
      // }
      else if (
        searchPlaceholderText === 'Search Certificate Issue Date' &&
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
      } else if (
        searchPlaceholderText === 'Search Certificate Expiry Date' &&
        data.certExpireDate != null &&
        moment(moment(data.certExpireDate)).isSame(moment(searchText))
      ) {
        console.log('expiry true');
        if (data.certExpireDate == null) {
          data.certExpireDate = '--';
        }
        console.log('certificateExpiryDate', searchText);
        return data;
      }
      else if (data.officialNo && data.officialNo.toString().toLowerCase().includes(searchText.toLowerCase()) && searchPlaceholderText === "Search Official No"          //added by archana for jira ID-MOBILE-401
      ) {
        console.log('Official No', searchText);
        return data;
      }
      else if (data.certificateType && data.certificateType.toLowerCase().includes(searchText.toLowerCase()) && searchPlaceholderText === "Search Certificate Type"
      ) {
        console.log('Certificate Type', searchText);
        return data;
      }
      else if (data.certificateSubType && data.certificateSubType.toLowerCase().includes(searchText.toLowerCase()) && searchPlaceholderText === "Search Certificate Sub Type"
      ) {
        console.log('certificate Sub Type', searchText);
        return data;
      }
      else if (data.certificateStatus && data.certificateStatus.toLowerCase().includes(searchText.toLowerCase()) && searchPlaceholderText === "Search Certificate Status") {
        console.log("certificateStatus", searchText);
        return data;
      }
    }
    });

  }


  constructor() {

  }



}
