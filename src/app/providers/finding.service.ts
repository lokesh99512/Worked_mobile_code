import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { AppConstant } from '../constants/app.constants';
import { FindingDataDescriptions } from '../interfaces/finding';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class FindingService {
  auditTypeId: number;
  maAuditCodes = [];
  maFindingStatus = [];
  maFindingCategory = [];

  constructor(private db: DatabaseService, public appconstants: AppConstant) {}

  init = (auditTypeId) => {
    console.log(auditTypeId);

    this.auditTypeId = auditTypeId;
    this.prepareMaFindingData();
  };

  prepareMaFindingData() {
    return new Promise<Boolean>((resolve, reject) => {
      this.db.getMaDatasForFindings(this.auditTypeId).then(
        (maFindingData) => {
          console.log('maFindingData', maFindingData);
          this.maAuditCodes = maFindingData[0];
          this.maFindingStatus = maFindingData[1];
          this.maFindingCategory = maFindingData[2];
          resolve(true);
        },
        (err) => {
          resolve(false);
        }
      );
    });
  }

  addDays(fromDate, numberOfDays) {
    return new Date(moment(fromDate).add(numberOfDays, 'days').toString());
  }

  getFindingCategoryDesc(): string {
    return '';
  }

  getFindingStatusDesc(findingStatusId): string {
    this.maFindingStatus.find;
    const findingStatus = this.maFindingStatus.find(
      (e) =>
        e.AUDIT_TYPE_ID == this.auditTypeId &&
        e.FINDINGS_STATUS_ID == findingStatusId
    );
    console.log('getFindingStatusDesc', findingStatus);

    return findingStatus.FINDINGS_STATUS_DESC;
  }

  findingDataDescriptions = (auditTypeId): FindingDataDescriptions => {
    let descObj: any = {};

    switch (auditTypeId) {
      case this.appconstants.ISM_TYPE_ID: {
        descObj.pageTitle = 'ism audit';
        descObj.auditType = 'Audit';
        descObj.majorCountDesc = 'MNC';
        descObj.minorCountDesc = 'NC';
        descObj.obsCountDesc = 'OBS';
        descObj.auditauditType = 'ISM';
        descObj.auditTypeDesc = 'ISM';
        return descObj;
      }
      case this.appconstants.ISPS_TYPE_ID: {
        descObj.pageTitle = 'isps audit';
        descObj.auditType = 'Audit';
        descObj.majorCountDesc = 'MF';
        descObj.minorCountDesc = 'FAILURE';
        descObj.obsCountDesc = 'OBS';
        descObj.auditauditType = 'ISPS';
        descObj.auditTypeDesc = 'ISPS';
        return descObj;
      }
      case this.appconstants.MLC_TYPE_ID: {
        descObj.pageTitle = 'mlc inspection';
        descObj.auditType = 'Inspection';
        descObj.majorCountDesc = 'SD';
        descObj.minorCountDesc = 'DEFICIENCY';
        descObj.obsCountDesc = 'OBS';
        descObj.auditauditType = 'MLC';
        descObj.auditTypeDesc = 'MLC';
        return descObj;
      }
      case this.appconstants.DMLC_TYPE_ID: {
        descObj.pageTitle = 'dmlc ii review';
        descObj.auditType = 'Review';
        descObj.majorCountDesc = 'REVIEW NOTES';
        descObj.minorCountDesc = '';
        descObj.obsCountDesc = '';
        descObj.auditauditType = 'DMLC II';
        descObj.auditTypeDesc = 'DMLC';
        return descObj;
      }
    }
  };
  getFindingCount = (findingList: any) => {
    let total: number = 0;
    let maj: number = 0;
    let min: number = 0;
    let obs: number = 0;

    findingList.forEach((finding) => {
      total++;
      if (
        finding.serialNo.includes('MNC') ||
        finding.serialNo.includes('MF') ||
        finding.serialNo.includes('SD')
      ) {
        maj++;
      } else if (
        finding.serialNo.includes('NC') ||
        finding.serialNo.includes('FAILURE') ||
        finding.serialNo.includes('DEFICIENCY')
      ) {
        min++;
      } else if (finding.serialNo.includes('OBS')) {
        obs++;
      }
    });
    return { total, maj, min, obs };
  };
}
