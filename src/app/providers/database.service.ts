/* Auther: D.yuvaraj created on:06-08-2020 */
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { MaAuditCode } from '../interfaces/audit';
import { CurrentUser, MaUser, Notification } from '../interfaces/user';
import * as moment from 'moment';
import {
  CurrentFinding,
  finding,
  findingao,
  findingAttachments,
  findingAttachmentsao,
  findingDetails,
  findingDetailsao,
} from '../interfaces/finding';
import { AppConstant } from '../constants/app.constants';
import { shareReplay } from 'rxjs/operators';
import { File } from '@ionic-native/file/ngx';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private database: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  currentUser = new BehaviorSubject(null);
  notifications = new BehaviorSubject(null);
  dashboardCounts = new BehaviorSubject({});
  mailId: string;
  mailId2: void;
 
  constructor(
    public file: File,
    private platform: Platform,
    private appConstant: AppConstant,
    private sqlitePorter: SQLitePorter,
    private sqlite: SQLite,
    private http: HttpClient
  ) {
    console.log('constructor of database.service');
    console.log(this.file);

    console.log(this.file.externalRootDirectory);
    console.log(this.platform.is('ios'));
    console.log(this.platform.is('iphone'));

    console.log(
      this.platform.is('ipad') ||
        this.platform.is('ios') ||
        this.platform.is('iphone')
        ? this.file.documentsDirectory
        : this.file.externalDataDirectory
    );

    this.platform.ready().then(() => {
      this.sqlite
        .create({
          name: 'audits.db',
          iosDatabaseLocation: 'Documents',
          androidDatabaseLocation: this.file.applicationStorageDirectory, //"file:///storage/emulated/0/Android/data/com.bsol.systems/files/"
        })
        .then((db: SQLiteObject) => {
          this.database = db;
          this.seedDatabase();
          console.log(
            'path:1 => applicationStorageDirectory path',
            this.file.applicationStorageDirectory
          );
          console.log('path:2 => dataDirectory path', this.file.dataDirectory);
          console.log(
            'path:3 => cacheDirectory path',
            this.file.cacheDirectory
          );
          console.log(
            'path:4 => externalApplicationStorageDirectory path',
            this.file.externalApplicationStorageDirectory
          );
          console.log(
            'path:5 => externalDataDirectory path',
            this.file.externalDataDirectory
          );
          console.log(
            'path:6 => externalCacheDirectory path',
            this.file.externalCacheDirectory
          );
        });
    });
  }

  getDatabaseState() {
    return this.dbReady.asObservable();
  }
  seedDatabase() {
    console.log('seedDatabase fired(database.service)');
    this.http
      .get('assets/sql/seed.sql', { responseType: 'text' })
      .subscribe((sql) => {
        console.log('sql.... ', sql);
        this.sqlitePorter
          .importSqlToDb(this.database, sql)
          .then((_) => {
            this.loadCurrentUser();
            this.dbReady.next(true);
          })
          .catch((e) => console.error(e));
      });
  }

  getCurrentDbRecords() {
    this.sqlitePorter
      .exportDbToJson(this.database)
      .then((dbAsJson) =>
        console.log(
          'Current Values Present In Local DB : ',
          dbAsJson.data.inserts
        )
      )
      .catch((e) => console.error(e));
  }

  getCurrentDbTables() {
    this.sqlitePorter
      .exportDbToJson(this.database)
      .then((dbAsJson) =>
        console.log('Tables Present In Local DB : ', dbAsJson.structure.tables)
      )
      .catch((e) => console.error(e));
  }

  /* CURRRENT_USER_DETAILS */

  loadCurrentUserLogin() {
    console.log('loadCurrentUser is fired (database.service)');
    return new Promise<Object>((resolve) => {
      this.database
        .executeSql('SELECT * FROM CURRENT_USER_DETAILS', [])
        .then((data) => {
          let currentUser = null;

          if (data.rows.length > 0) {
            currentUser = {
              username: data.rows.item(0).USER_NAME,
              password: data.rows.item(0).PASSWORD
            };
          }
          console.log('current user', currentUser);
          resolve(currentUser);
        })
    })
  }

  loadCurrentUserRevoke() {
    console.log('loadCurrentUser is fired (database.service)');
    return new Promise<Object>((resolve) => {
      this.database
        .executeSql('SELECT * FROM CURRENT_USER_DETAILS', [])
        .then((data) => {
          let currentUser = null;

          if (data.rows.length > 0) {
            currentUser = {
              username: data.rows.item(0).USER_NAME,
              companyId: data.rows.item(0).COMPANY_ID
            };
          }
          console.log('current user', currentUser);
          resolve(currentUser);
        })
    })
  }

  loadCurrentUser() {
    console.log('loadCurrentUser is fired (database.service)');
    return this.database
      .executeSql('SELECT * FROM CURRENT_USER_DETAILS', [])
      .then((data) => {
        let currentUser: CurrentUser = null;

        if (data.rows.length > 0) {
          currentUser = {
            masterDataRefresh: data.rows.item(0).LAST_MASTER_REFRESH,
            companyId: data.rows.item(0).COMPANY_ID,
            userName: data.rows.item(0).USER_NAME,
            password: data.rows.item(0).PASSWORD,
            displayName: data.rows.item(0).DISPLAY_NAME,
            userId: data.rows.item(0).USER_ID,
            imageUrl: data.rows.item(0).IMAGE_URL,
            isLogout: data.rows.item(0).ISLOGOUT,
          };
        }
        console.log('current user', currentUser);

        this.currentUser.next(currentUser);
      });
  }

  loadDashboardData(userName) {
    console.log('loadDashboardData is fired (database.service)');
    return this.database
      .executeSql(
        'SELECT  ( SELECT COUNT(*) FROM     AUDIT_DETAILS AD where AD.ALLOW_NEXT == 0 AND AD.REVIEW_STATUS==0 AND AD.LOCK_STATUS <> 3 AND USER_INS=? ) AS Audit_Count,(SELECT COUNT(*) FROM   CERTIFICATE_DETAIL where  USER_INS=?) AS Certificate_Count',   //changed by archana for jira ID-MOBILE-425,MOBILE-911
        [userName, userName]
      )
      .then((data) => {
        if (data.rows.length > 0) {
          console.log(data.rows.item(0));
          this.dashboardCounts.next(
            data.rows.item(0) ? data.rows.item(0) : null
          );
          this.getDashboardData();
        }
      });
  }
  getDashboardData(): Observable<any> {
    return this.dashboardCounts.asObservable();
  }

  loadNotificationsOfCurrentUser(userId) {
    console.log(
      'loadNotificationsOfCurrentUser is fired (database.service)',
      userId
    );
    return this.database
      .executeSql('SELECT * FROM LOCAL_NOTIFICATIONS WHERE USER_NAME=?', [
        userId,
      ])
      .then((notifs) => {
        let notifications: Notification[] = [];

        if (notifs.rows.length > 0) {
          for (var i = 0; i < notifs.rows.length; i++) {
            notifications.push({
              dateTime: notifs.rows.item(i).DATE_TIME,
              msg: notifs.rows.item(i).MSG,
              userName: notifs.rows.item(i).USER_NAME,
              type: notifs.rows.item(i).TYPE,
            });
          }
        }
        this.notifications.next(notifications);
      });
  }
  addNotificationMsg(msg, dateTime, userId, type) {
    console.log('addNotificationMsg triggerd', msg, dateTime, userId);
    this.database
      .executeSql(
        'INSERT INTO LOCAL_NOTIFICATIONS (USER_NAME,MSG,DATE_TIME,TYPE) VALUES (?,?,?,?)',
        [userId, msg, dateTime, type]
      )
      .then((data) => {
        console.log('addNotificationMsg data ', data);
        this.loadNotificationsOfCurrentUser(userId);
      });
  }

  deleteNotificationMsg(msg, userId) {
    this.database.executeSql(
      'DELETE FROM LOCAL_NOTIFICATIONS WHERE USER_NAME=? AND MSG=?',
      [userId, msg]
    );
    console.log('deleteNotificationMsg executed');
    this.loadNotificationsOfCurrentUser(userId);
  }

  clearNotificationsOfCurrentUser(userId) {
    this.database.executeSql(
      'DELETE FROM LOCAL_NOTIFICATIONS WHERE USER_NAME=?',
      [userId]
    );
    console.log('deleteNotificationMsg executed');
    this.loadNotificationsOfCurrentUser(userId);
  }

  getNotificationOfCurrentUser(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  getCurrentUser(): Observable<CurrentUser> {
    return this.currentUser.asObservable().pipe(shareReplay());
  }

  addCurrentUser(user) {
    return new Promise<Object>((resolve) => {
      let data = [
        new Date().toString(),
        user.companyId,
        user.emailId,
        user.password,
        user.firstName + ' ' + user.lastName,
        user.sequenceNo.toString(),
      ];
      console.log('addCurrentUser_data : ', data);

      this.database
        .executeSql('DELETE FROM CURRENT_USER_DETAILS', [])
        .then((_) => {
          this.database
            .executeSql(
              'INSERT INTO CURRENT_USER_DETAILS (LAST_MASTER_REFRESH, COMPANY_ID, USER_NAME, PASSWORD, DISPLAY_NAME, USER_ID) VALUES (?,?,?,?,?, ?)',
              data
            )
            .then((data) => {
              console.log('addCurrentUser data ', data);
              this.loadCurrentUser();
              resolve(null);
            });
        });
    });
  }

  deleteCurrentUser() {
    return this.database.executeSql('DELETE FROM CURRENT_USER_DETAILS', []);
  }
  //"UPDATE AUDIT_FINDINGS SET AUDIT_STATUS = ? WHERE ORIG_SEQ_NO=?", [a.auditStatus, a.auditSeqNo]

  isLoggedOut() {
    return this.database
      .executeSql('UPDATE CURRENT_USER_DETAILS SET ISLOGOUT=?', [true])
      .then((result) => {
        console.log('result', result);
      })
      .catch((err) => console.error(err));
  }

  /*END CURRRENT_USER_DETAILS */

  /* RECENT_ACTIVITY */

  /* loadRecentActivity(userID) {
    console.log("loadRecentActivity is fired (database.service)")
    return this.database.executeSql("SELECT * FROM RESENT_ACTIVITY WHERE USER_ID =?", [userID]).then(activity => {
      let recentActivity: Activity[] = null;

      if (activity.rows.length > 0) {
        for (var i = 0; i < activity.rows.length; i++) {
          recentActivity.push({
            userId: activity.rows.item(0).USER_ID,
            activityId: activity.rows.item(0).ACTIVITY_ID,
            dateTime: activity.rows.item(0).DATE_TIME,
            vesselName: activity.rows.item(0).VESSEL_NAME,
            vesselIMO: activity.rows.item(0).VESSEL_IMO,
          });
        }
      }
      this.recentActivity.next(recentActivity);
    });
  }

  getRecentActivity(): Observable<Activity[]> {
    return this.recentActivity.asObservable();
  } */

  /* addActivity(activityId, vesselName, vesselIMO) {
    return this.database.executeSql('INSERT INTO RESENT_ACTIVITY (ACTIVITY_ID, DATE_TIME, USER_NAME, PASSWORD, DISPLAY_NAME, USER_ID) VALUES (?,?,?,?,?, ?)', [activityId, '', vesselIMO]).then(activity => {
      console.log("loadRecentActivity data ", activity);
      this.currentUser.subscribe(user => {
        console.log('loadRecentActivity called from addActivity with user id', user.userID);
        this.loadRecentActivity(user.userID);
      })
    });
  } */

  /*END RECENT_ACTIVITY */

  getMaUser(form): Promise<MaUser> {
    return this.database
      .executeSql(
        "SELECT * FROM MA_USERS where USER_ID like'" +
        form.username +
        "' and PASSWORD like '" +
        form.password +
        "'",
        []
      )
      .then((data) => {
        console.log('SELECT * FROM MA_USERS where USER_ID', data.rows.item(0));
        if (data.rows.length > 0) {
          return {
            firstName: data.rows.item(0).FIRST_NAME,
            lastName: data.rows.item(0).LAST_NAME,
            phoneNo: data.rows.item(0).PHONE_NO,
            address: data.rows.item(0).ADDRESS,
            sequenceNo: data.rows.item(0).SEQUENCE_NUMBER,
            identification: data.rows.item(0).IDENTIFICATION,
            userId: data.rows.item(0).USER_ID,
            userName: data.rows.item(0).USER_NAME,
            password: data.rows.item(0).PASSWORD,
            companyId: data.rows.item(0).COMPANY_ID,
            activeStatus: data.rows.item(0).ACTIVE_STATUS,
            userIns: data.rows.item(0).USER_INS,
            dateIns: data.rows.item(0).DATE_INS,
            emailId: data.rows.item(0).EMAIL,
            otp: data.rows.item(0).OTP,
            signature: data.rows.item(0).SIGNATURE,
          };
        } else return null;
      });
  }

  loadMaAuditCodes(): Promise<MaAuditCode[]> {
    console.log('loadMaAuditCodes is fired (database.service)');
    return this.database
      .executeSql('SELECT * FROM MA_AUDIT_CODES', [])
      .then((data) => {
        let maAuditCodes: MaAuditCode[] = [];

        if (data.rows.length > 0) {
          for (var i = 0; i < data.rows.length; i++) {
            maAuditCodes.push({
              auditTypeId: data.rows.item(i).AUDIT_TYPE_ID,
              auditCode: data.rows.item(i).AUDIT_CODE,
              auditElements: data.rows.item(i).AUDIT_ELEMENTS,
              companyId: data.rows.item(i).COMPANY_ID,
              activeStatus: data.rows.item(i).ACTIVE_STATUS,
              userIns: data.rows.item(i).USER_INS,
              dateIns: data.rows.item(i).DATE_INS,
            });
          }
        }
        return maAuditCodes;
      });
  }

  /* ------------------------- Store Master Details Starts --------------------------- */
  /*  1.masterTableUpdate
 2.MaAuditCodes
 3.MaUsers
 4.configDetails
 5.port
 6.MaAttachmentTypes
 7.MaAuditSearchSource
 8.MaAuditStatus
 9.MaAuditSubtype
 10.MaAuditSummary
 11.MaAuditType
 12.MaCertificateIssued
 13.MaCompany
 14.MaFindingsCategory
 15.MaRoles
 16.MaFindingsStatus
 17.MaVesselType
 18.maAuditRoles
 19.MaVesselCompany
 20.MaVessel 
   */

  saveMasterTableUpdate(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MASTER_TABLE_UPDATE', []);
          console.log('DELETE FROM MASTER_TABLE_UPDATE Success');
        } catch (error) {
          console.log('DELETE FROM MASTER_TABLE_UPDATE Failed', error);
        }

        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MASTER_TABLE_UPDATE' +
              '(TABLE_NAME,' +
              'COMPANY_ID,' +
              'TABLE_UPDATION,' +
              'USER_INS,' +
              'DATE_INS)' +
              'VALUES(?,?,?,?,?)',
              [a.tableName, a.companyId, a.tableUpdation, a.userIns, a.dateIns]
            )
            .then((resp) => {
              if (resp.insertId == res.length) {
                console.log(
                  'INSERT INTO MASTER_TABLE_UPDATE:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }

  saveMaAuditCodes(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MA_AUDIT_CODES', []);
          console.log('DELETE FROM MA_AUDIT_CODES Success');
        } catch (error) {
          console.log('DELETE FROM MA_AUDIT_CODES Failed', error);
        }

        let regExp = new RegExp("'", 'g');
        res.forEach((a) => {
          a.auditElements = a.auditElements
            ? a.auditElements.replace(regExp, "''").replace(/%20/g, ' ')
            : '';
          this.database
            .executeSql(
              'INSERT INTO MA_AUDIT_CODES' +
              '(AUDIT_TYPE_ID,' +
              'AUDIT_CODE,' +
              'AUDIT_ELEMENTS,' +
              'ACTIVE_STATUS,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS)' +
              'VALUES(?,?,?,?,?,?,?)',
              [
                a.auditTypeId,
                a.auditCode,
                a.auditElements,
                a.activeStatus,
                a.companyId,
                a.userIns,
                a.dateIns,
              ]
            )
            .then((resp) => {
              if (resp.insertId == res.length) {
                console.log(
                  'INSERT INTO MA_AUDIT_CODES:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }

  saveMaUsers(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MA_USERS', []);
          console.log('DELETE FROM MA_USERS Success');
        } catch (error) {
          console.log('DELETE FROM MA_USERS Failed', error);
        }

        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MA_USERS' +
              '(FIRST_NAME,' +
              'LAST_NAME,' +
              'PASSWORD,' +
              'USER_ID,' +
              'PHONE_NO,' +
              'ADDRESS,' +
              'SIGNATURE,' +
              'SEQUENCE_NUMBER,' +
              'ACTIVE_STATUS,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'IDENTIFICATION,' +
              'DATE_INS)' +
              'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
              [
                a.firstName,
                a.lastName,
                //CryptoJS.SHA256(a.password),
                a.password,
                a.emailId,
                a.phoneNo,
                a.address,
                a.signature,
                a.sequenceNo,
                a.activeStatus,
                a.companyId,
                a.userIns,
                a.userIdentification,
                a.dateIns,
              ]
            )
            .then((resp) => {
              if (resp.insertId == res.length) {
                console.log(
                  'INSERT INTO MA_USERS:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }
  saveConfigDetails(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM USER_DETAILS_CONFIG', []);
          console.log('DELETE FROM USER_DETAILS_CONFIG Success');
        } catch (error) {
          console.log('DELETE FROM USER_DETAILS_CONFIG Failed', error);
        }

        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO USER_DETAILS_CONFIG' +
              '(OLD_PASSWORD,' +
              'NEW_PASSWORD,' +
              'CONFIRM_NEW_PASSWORD,' +
              'DISPLAY_NAME,' +
              'SEARCH_RESULT,' +
              'USER_ID,' +
              'DEFAULT_HOME_SCREEN,' +
              'MANAGER_NAME,' +
              'ROLE,' +
              'HEADER_COLOUR,' +
              'BACKGROUND_COLOUR,' +
              'FONT_COLOUR,' +
              'BUTTON_COLOUR,' +
              'HEADER_FONT_COLOUR,' +
              'COMPANY_ID	,' +
              'IDENTITY ,' +
              'EMAIL_ID)' +
              'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
              [
                a.oldPassword,
                a.newPassword,
                a.confirmNewPassword,
                a.displayName,
                a.searchResult,
                a.userId,
                a.defaultHomeScreen,
                a.managerName,
                a.role,
                a.headerColor,
                a.backgroundColor,
                a.fontColor,
                a.buttonColor,
                a.headerFontColor,
                a.companyId,
                a.userIdentification,
                a.emailId,
              ]
            )
            .then((resp) => {
              if (resp.insertId == res.length) {
                console.log(
                  'INSERT INTO USER_DETAILS_CONFIG:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }
  savePort(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MA_PORT', []);
          console.log('DELETE FROM MA_PORT Success');
        } catch (error) {
          console.log('DELETE FROM MA_PORT Failed', error);
        }

        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MA_PORT' +
              '(PORT_ID ,' +
              'COMPANY_ID	,' +
              'PORT_NAME,' +
              'COUNTRY_NAME,' +
              'USER_INS,' +
              'DATE_INS,' +
              'ACTIVE_FLAG)' +
              'VALUES(?,?,?,?,?,?,?)',
              [
                a.portId,
                a.companyId,
                a.portName,
                a.countryName,
                a.userIns,
                a.dateIns,
                a.activeFlag,
              ]
            )
            .then((resp) => {
              if (resp.insertId == res.length) {
                console.log(
                  'INSERT INTO MA_PORT:::success=>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }
  saveMaAttachmentTypes(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MA_ATTACHMENT_TYPES', []);
          console.log('DELETE FROM MA_ATTACHMENT_TYPES Success');
        } catch (error) {
          console.log('DELETE FROM MA_ATTACHMENT_TYPES Failed', error);
        }

        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MA_ATTACHMENT_TYPES' +
              '(ATTACHMENT_TYPE_ID,' +
              'AUDIT_TYPE_ID,' +
              'ATTACHMENTT_TYPE_DESC,' +
              'ACTIVE_STATUS,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS,' +
              'AUDIT_SUB_TYPE_ID,' +
              'MANDATORY,' +
              'LAST_UPDATED_DATE)' +
              'VALUES(?,?,?,?,?,?,?,?,?,?)',
              [
                a.attachmentTypeId,
                a.auditTypeId,
                a.attachmentTypeDesc,
                a.activeStatus,
                a.companyId,
                a.userIns,
                a.dateIns,
                a.auditSubTypeId,
                a.mandatory,
                a.lastUpdatedDate,
              ]
            )
            .then((resp) => {
              if (resp.insertId == res.length) {
                console.log(
                  'INSERT INTO MA_ATTACHMENT_TYPES:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }
  saveMaAuditSearchSource(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MA_AUDIT_SEARCH_SOURCE', []);
          console.log('DELETE FROM MA_AUDIT_SEARCH_SOURCE Success');
        } catch (error) {
          console.log('DELETE FROM MA_AUDIT_SEARCH_SOURCE Failed', error);
        }

        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MA_AUDIT_SEARCH_SOURCE' +
              '(AUDIT_SOURCE_ID,' +
              'AUDIT_SOURCE_DESC,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS)' +
              'VALUES(?,?,?,?,?)',
              [
                a.auditSourceId,
                a.auditSourceDesc,
                a.companyId,
                a.userIns,
                a.dateIns,
              ]
            )
            .then((resp) => {
              if (resp.insertId == res.length) {
                console.log(
                  'INSERT INTO MA_AUDIT_SEARCH_SOURCE:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }
  saveMaAuditStatus(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MA_AUDIT_STATUS', []);
          console.log('DELETE FROM MA_AUDIT_STATUS Success');
        } catch (error) {
          console.log('DELETE FROM MA_AUDIT_STATUS Failed', error);
        }

        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MA_AUDIT_STATUS' +
              '(AUDIT_STATUS_ID,' +
              'AUDIT_TYPE_ID,' +
              'AUDIT_STATUS_DESC,' +
              'ACTIVE_STATUS,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS)' +
              'VALUES(?,?,?,?,?,?,?)',
              [
                a.auditStatusId,
                a.auditTypeId,
                a.auditStatusDesc,
                a.activeStatus,
                a.companyId,
                a.userIns,
                a.dateIns,
              ]
            )
            .then((resp) => {
              if (resp.insertId == res.length) {
                console.log(
                  'INSERT INTO MA_AUDIT_STATUS:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }
  saveMaAuditSubtype(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MA_AUDIT_SUBTYPE', []);
          console.log('DELETE FROM MA_AUDIT_SUBTYPE Success');
        } catch (error) {
          console.log('DELETE FROM MA_AUDIT_SUBTYPE Failed', error);
        }

        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MA_AUDIT_SUBTYPE' +
              '(AUDIT_TYPE_ID,' +
              'AUDIT_SUBTYPE_ID,' +
              'AUDIT_SUBTYPE_DESC,' +
              'ACTIVE_STATUS,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS)' +
              'VALUES(?,?,?,?,?,?,?)',
              [
                a.auditTypeId,
                a.auditSubtypeId,
                a.auditSubtypeDesc,
                a.activeStatus,
                a.companyId,
                a.userIns,
                a.dateIns,
              ]
            )
            .then((resp) => {
              if (resp.insertId == res.length) {
                console.log(
                  'INSERT INTO MA_AUDIT_SUBTYPE:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }
  saveMaAuditSummary(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MA_AUDIT_SUMMARY', []);
          console.log('DELETE FROM MA_AUDIT_SUMMARY Success');
        } catch (error) {
          console.log('DELETE FROM MA_AUDIT_SUMMARY Failed', error);
        }

        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MA_AUDIT_SUMMARY' +
              '(AUD_SUMMARY_ID,' +
              'AUDIT_TYPE_ID,' +
              'AUD_SUMMARY_DESC,' +
              'ACTIVE_STATUS,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS)' +
              'VALUES(?,?,?,?,?,?,?)',
              [
                a.audSummaryId,
                a.auditTypeId,
                a.audSummaryDesc,
                a.activeStatus,
                a.companyId,
                a.userIns,
                a.dateIns,
              ]
            )
            .then((resp) => {
              if (resp.insertId == res.length) {
                console.log(
                  'INSERT INTO MA_AUDIT_SUMMARY:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }
  saveMaAuditType(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MA_AUDIT_TYPE', []);
          console.log('DELETE FROM MA_AUDIT_TYPE Success');
        } catch (error) {
          console.log('DELETE FROM MA_AUDIT_TYPE Failed', error);
        }

        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MA_AUDIT_TYPE' +
              '(AUDIT_TYPE_ID,' +
              'AUDIT_TYPE_DESC,' +
              'ACTIVE_STATUS,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS)' +
              'VALUES(?,?,?,?,?,?)',
              [
                a.auditTypeId,
                a.auditTypeDesc,
                a.activeStatus,
                a.companyId,
                a.userIns,
                a.dateIns,
              ]
            )
            .then((resp) => {
              if (resp.insertId == res.length) {
                console.log(
                  'INSERT INTO MA_AUDIT_TYPE:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }
  saveMaCertificateIssued(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MA_CERTIFICATE_ISSUED', []);
          console.log('DELETE FROM MA_CERTIFICATE_ISSUED Success');
        } catch (error) {
          console.log('DELETE FROM MA_CERTIFICATE_ISSUED Failed', error);
        }

        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MA_CERTIFICATE_ISSUED' +
              '(CERTIFICATE_ISSUE_ID,' +
              'AUDIT_TYPE_ID,' +
              'CERTIFICATE_ISSUE_DESC,' +
              'ACTIVE_STATUS,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS)' +
              'VALUES(?,?,?,?,?,?,?)',
              [
                a.certificateIssueId,
                a.auditTypeId,
                a.certificateIssueDesc,
                a.activeStatus,
                a.companyId,
                a.userIns,
                a.dateIns,
              ]
            )
            .then((resp) => {
              if (resp.insertId == res.length) {
                console.log(
                  'INSERT INTO MA_CERTIFICATE_ISSUED:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }
  saveMaCompany(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        console.log(res[res.length - 1].companyId);
        try {
          this.database.executeSql('DELETE FROM MA_COMPANY', []);
          console.log('DELETE FROM MA_COMPANY Success');
        } catch (error) {
          console.log('DELETE FROM MA_COMPANY Failed', error);
        }
        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MA_COMPANY' +
              '(COMPANY_NAME,' +
              'COMPANY_ADDRESS,' +
              'COMPANY_EMAIL,' +
              'COMPANY_MOBILE,' +
              'COMPANY_FAX,' +
              'ACTIVE_STATUS,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS,' +
              'COMPANY_LOGO)' +
              'VALUES(?,?,?,?,?,?,?,?,?,?)',
              [
                a.companyName,
                a.companyAddress,
                a.companyEmail,
                a.companyMobile,
                a.companyFax,
                a.activeStatus,
                a.companyId,
                a.userIns,
                a.dateIns,
                a.companyLogo,
              ]
            )
            .then(
              (resp) => {
                if (resp.insertId == res[res.length - 1].companyId) {
                  console.log(
                    'INSERT INTO MA_COMPANY:::success =>',
                    'Resolve executed with insertId ',
                    resp.insertId
                  );
                  resolve(null);
                }
              },
              (error) => {
                console.log(error);
              }
            )
            .catch((e) => console.log(e));
        });
      } else resolve(null);
    });
  }
  saveMaFindingsCategory(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MA_FINDINGS_CATEGORY', []);
          console.log('DELETE FROM MA_FINDINGS_CATEGORY Success');
        } catch (error) {
          console.log('DELETE FROM MA_FINDINGS_CATEGORY Failed', error);
        }

        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MA_FINDINGS_CATEGORY' +
              '(FINDINGS_CATEGORY_ID,' +
              'AUDIT_TYPE_ID,' +
              'FINDINGS_CATEGORY_DESC,' +
              'ACTIVE_STATUS,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS)' +
              'VALUES(?,?,?,?,?,?,?)',
              [
                a.findingsCategoryId,
                a.auditTypeId,
                a.findingsCategoryDesc,
                a.activeStatus,
                a.companyId,
                a.userIns,
                a.dateIns,
              ]
            )
            .then((resp) => {
              if (resp.insertId == res.length) {
                console.log(
                  'INSERT INTO MA_FINDINGS_CATEGORY:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }
  saveMaRoles(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MA_ROLES', []);
          console.log('DELETE FROM MA_ROLES Success');
        } catch (error) {
          console.log('DELETE FROM MA_ROLES Failed', error);
        }

        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MA_ROLES' +
              '(ROLE_DESC,' +
              'ROLE_ID,' +
              'ACTIVE_STATUS,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS)' +
              'VALUES(?,?,?,?,?,?)',
              [
                a.roleDesc,
                a.roleId,
                a.activeStatus,
                a.companyId,
                a.userIns,
                a.dateIns,
              ]
            )
            .then((resp) => {
              if (resp.insertId == res.length) {
                console.log(
                  'INSERT INTO MA_ROLES:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }
  saveMaFindingsStatus(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MA_FINDINGS_STATUS', []);
          console.log('DELETE FROM MA_FINDINGS_STATUS Success');
        } catch (error) {
          console.log('DELETE FROM MA_FINDINGS_STATUS Failed', error);
        }

        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MA_FINDINGS_STATUS' +
              '(FINDINGS_STATUS_ID,' +
              'AUDIT_TYPE_ID,' +
              'FINDINGS_STATUS_DESC,' +
              'ACTIVE_STATUS,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS)' +
              'VALUES(?,?,?,?,?,?,?)',
              [
                a.findingsStatusId,
                a.auditTypeId,
                a.findingstStatusDesc,
                a.activeStatus,
                a.companyId,
                a.userIns,
                a.dateIns,
              ]
            )
            .then((resp) => {
              if (resp.insertId == res.length) {
                console.log(
                  'INSERT INTO MA_FINDINGS_STATUS:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }
  saveMaVesselType(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MA_VESSEL_TYPE', []);
          console.log('DELETE FROM MA_VESSEL_TYPE Success');
        } catch (error) {
          console.log('DELETE FROM MA_VESSEL_TYPE Failed', error);
        }
        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MA_VESSEL_TYPE' +
              '(VESSEL_TYPE_ID,' +
              'VESSEL_TYPE_NAME,' +
              'ACTIVE_STATUS,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS)' +
              'VALUES(?,?,?,?,?,?)',
              [
                a.vesselTypeId,
                a.vesselTypeName,
                a.activeStatus,
                a.companyId,
                a.userIns,
                a.dateIns,
              ]
            )
            .then((resp) => {
              if (resp.insertId == res[res.length - 1].vesselTypeId) {
                console.log(
                  'INSERT INTO MA_VESSEL_TYPE:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }
  saveMaAuditRoles(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MA_AUDIT_ROLES', []);
          console.log('DELETE FROM MA_AUDIT_ROLES Success');
        } catch (error) {
          console.log('DELETE FROM MA_AUDIT_ROLES Failed', error);
        }

        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MA_AUDIT_ROLES' +
              '(ACTIVE_STATUS,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS,' +
              'AUDIT_ROLE_ID,' +
              'AUDIT_ROLE_DESC)' +
              'VALUES(?,?,?,?,?,?)',
              [
                a.activeStatus,
                a.companyId,
                a.userIns,
                a.dateIns,
                a.auditRoleId,
                a.auditRoleDesc,
              ]
            )
            .then((resp) => {
              if (resp.insertId == res.length) {
                console.log(
                  'INSERT INTO MA_AUDIT_ROLES:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }
  saveMaVesselCompany(res) {
    return new Promise<Object>((resolve) => {
      if (res != null && res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MA_VESSEL_COMPANY', []);
          console.log('DELETE FROM MA_VESSEL_COMPANY Success');
        } catch (error) {
          console.log('DELETE FROM MA_VESSEL_COMPANY Failed', error);
        }
        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MA_VESSEL_COMPANY' +
              '(COMPANY_IMO_NO,' +
              'DOC_TYPE_NO,' +
              'DOC_ISSUER,' +
              'DOC_EXPIRY,' +
              'COMPANY_ADDRESS,' +
              'VESSEL_COMPANY_NAME,' +
              'ACTIVE_STATUS,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS)' +
              'VALUES(?,?,?,?,?,?,?,?,?,?)',
              [
                a.companyImoNo,
                a.docTypeNo,
                a.docIssuer,
                a.docExpiry,
                a.vesselCompanyAddress,
                a.vesselCompanyName,
                a.companyStatus == 'Active' ? 1 : 0,
                a.companyId,
                a.userIns,
                a.dateIns,
              ]
            )
            .then((resp) => {
              console.log(resp, res);
              if (resp.insertId == res[res.length - 1].companyImoNo) {
                console.log(
                  'INSERT INTO MA_VESSEL_COMPANY:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }
  saveMaVessel(res) {
    return new Promise<Object>((resolve) => {
      if (res && res.length > 0) {
        try {
          this.database.executeSql('DELETE FROM MA_VESSEL', []);
          console.log('DELETE FROM MA_VESSEL Success');
        } catch (error) {
          console.log('DELETE FROM MA_VESSEL Failed', error);
        }

        res.forEach((a) => {
          this.database
            .executeSql(
              'INSERT INTO MA_VESSEL' +
              '(VESSEL_IMO_NO,' +
              'VESSEL_NAME,' +
              'OFFICIAL_NO,' +
              'GRT,' +
              'COMPANY_IMO_NO,' +
              'VESSEL_TYPE_ID,' +
              'ACTIVE_STATUS,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'PORT_OF_REGISTRY,' +
              'DATE_OF_REGISTRY,' +
              'TC_APPROVAL_STATUS,' +
              'VESSEL_PK,' +
              'VESSEL_UK,' +
              'VESSEL_ID,' +
              'CLASS_SOCIETY,' +
              'CALL_SIGN,' +
              'VESSEL_STATUS,' +
              'DATE_INS)' +
              'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
              [
                a.vesselImoNo.toString(),
                a.vesselName,
                a.officialNo,
                a.grt.toString(),
                a.companyImoNo,
                a.vesselType,
                a.activeStatus,
                a.companyId,
                a.userIns,

                a.portOfRegistry,
                a.dateOfRegistry,
                a.tcApprovalStatus,

                a.vesselPk,
                a.vesselUk,
                a.vesselId,
                a.classSociety,
                a.callSign,
                a.vesselStatus,

                a.dateIns,
              ]
            )
            .then((resp) => {
              if (resp.insertId == res.length) {
                console.log(
                  'INSERT INTO MA_VESSEL_COMPANY:::success =>',
                  'Resolve executed with insertId ',
                  resp.insertId
                );
                resolve(null);
              }
            });
        });
      } else resolve(null);
    });
  }

  storeAllMasterDataTables(res) {
    return new Promise<Object>((ParentResolve, reject) => {
      this.saveMasterTableUpdate(res.masterTableUpdate).then(() => {
        //1
        this.saveMaAuditCodes(res.MaAuditCodes).then(() => {
          //2
          this.saveMaUsers(res.MaUsers).then(() => {
            //3
            //this.saveConfigDetails(res.configDetails).then(() => {//4
            this.savePort(res.port).then(() => {
              //5
              this.saveMaAttachmentTypes(res.MaAttachmentTypes).then(() => {
                //6
                this.saveMaAuditSearchSource(res.MaAuditSearchSource).then(
                  () => {
                    //7
                    this.saveMaAuditStatus(res.MaAuditStatus).then(() => {
                      //8
                      this.saveMaAuditSubtype(res.MaAuditSubtype).then(() => {
                        //9
                        this.saveMaAuditSummary(res.MaAuditSummary).then(() => {
                          //10
                          this.saveMaAuditType(res.MaAuditType).then(() => {
                            //11
                            this.saveMaCertificateIssued(
                              res.MaCertificateIssued
                            ).then(() => {
                              //12
                              this.saveMaCompany(res.MaCompany).then(() => {
                                //13
                                this.saveMaFindingsCategory(
                                  res.MaFindingsCategory
                                ).then(() => {
                                  //14
                                  this.saveMaRoles(res.MaRoles).then(() => {
                                    //15
                                    this.saveMaFindingsStatus(
                                      res.MaFindingsStatus
                                    ).then(() => {
                                      //16
                                      this.saveMaVesselType(
                                        res.MaVesselType
                                      ).then(() => {
                                        //17
                                        this.saveMaAuditRoles(
                                          res.maAuditRoles
                                        ).then(() => {
                                          //18
                                          this.saveMaVesselCompany(
                                            res.MaVesselCompany
                                          ).then(() => {
                                            //19
                                            this.saveMaVessel(
                                              res.MaVessel
                                            ).then(() => {
                                              //20
                                              console.log(
                                                'Parent Resolve executed..'
                                              );
                                              ParentResolve({
                                                data: 'success',
                                              });
                                            });
                                          });
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  }
                );
              });
            });
          });
        });
      });
    });
    // });
  }
  /* ------------------------------------ Store Master Details ends -------------------------*/

  /* Retrive Audit Screen API'S */

  public checkExistsData() {
    //check previously retrived(existing) data's

    return new Promise<Object>((resolve, reject) => {
      let data = [];
      this.database.transaction((tx: any) => {
        tx.executeSql(
          'SELECT AUDIT_SEQ_NO FROM AUDIT_DETAILS',
          [],
          (tx: any, res: any) => {
            if (res.rows.length > 0) {
              for (var x = 0; x < res.rows.length; x++) {
                data.push(res.rows.item(x).AUDIT_SEQ_NO);
              }
            } else {
              console.log('0 row/record found in the AUDIT_DETAILS table ');
            }
            console.log('SELECT AUDIT_SEQ_NO FROM AUDIT_DETAILS', data);
            resolve({ status: data });
          },
          (tx: any, err: any) => {
            reject({ tx: tx, err: err });
          }
        );
      });
    });
  }

  getLocalDbMasterTableUpdateData(companyId) {
    //existing master table data's
    console.log(companyId);
    let masterDetails: any = [];
    return new Promise<Object>((resolve, reject) => {
      this.database.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM MASTER_TABLE_UPDATE WHERE COMPANY_ID= ?',
          [companyId],
          (tx: any, res: any) => {
            if (res.rows.length > 0) {
              for (var x = 0; x < res.rows.length; x++) {
                masterDetails.push({
                  tableName: res.rows.item(x).TABLE_NAME,
                  companyId: res.rows.item(x).COMPANY_ID,
                  tableUpdation: res.rows.item(x).TABLE_UPDATION,
                });
              }
            } else {
              console.log(
                '0 row/record found in the MASTER_TABLE_UPDATE table '
              );
            }
            resolve(masterDetails);
          },
          (tx: any, err: any) => {
            reject({ tx: tx, err: err });
          }
        );
      });
    });
  }

  saveRetrivedAuditData(obj) {
    obj.auditSeqNo = obj.auditSeqNo.toString();
    console.log('obj', obj);
    if (obj) {
      this.database.executeSql(
        'DELETE FROM AUDIT_DETAILS WHERE AUDIT_SEQ_NO=?',
        [obj.auditSeqNo]
      );
      this.database.executeSql(
        'DELETE FROM AUDIT_FINDINGS WHERE ORIG_SEQ_NO=?',
        [obj.auditSeqNo]
      );
      this.database.executeSql(
        'DELETE FROM AUDIT_FINDINGS_DETAILS WHERE ORIG_SEQ_NO=?',
        [obj.auditSeqNo]
      );
      this.database.executeSql(
        'DELETE FROM AUDIT_FINDING_ATTACHMENTS WHERE ORIG_SEQ_NO=?',
        [obj.auditSeqNo]
      );
      this.database.executeSql(
        'DELETE FROM AUDIT_AUDITOR_DETAILS WHERE AUDIT_SEQ_NO=?',
        [obj.auditSeqNo]
      );
      this.database.executeSql(
        'DELETE FROM AUDIT_REPORT_ATTACHMENTS WHERE AUDIT_SEQ_NO=?',
        [obj.auditSeqNo]
      );
      this.database.executeSql(
        'DELETE FROM SSP_REVIEW_DATA WHERE AUDIT_SEQ_NO=?',
        [obj.auditSeqNo]
      );
      // this.database.executeSql("DELETE FROM CERTIFICATE_DETAILS WHERE AUDIT_SEQ_NO=?", [obj.auditSeqNo]);
      this.database.executeSql(
        'DELETE FROM CERTIFICATE_DETAIL WHERE AUDIT_SEQ_NO=?',
        [obj.auditSeqNo]
      );
      this.database.executeSql(
        'DELETE FROM CERTIFICATE_DETAIL_WITHOUT_AUDIT WHERE VESSEL_IMO_NO=? and AUDIT_TYPE_ID=?',
        [obj.auditSeqNo]
      );
      this.database.executeSql(
        'DELETE FROM AUDIT_CYCLE WHERE VESSEL_IMO_NO=? AND AUDIT_TYPE_ID=?',
        [obj.vesselImoNo, obj.auditTypeId]
      );
      /*   this.database.executeSql("DELETE FROM PDF_DATA_64 WHERE AUDIT_SEQ_NO=?", [
          obj.auditSeqNo
        ]); */

      obj.certificateWithoutAudit.forEach((a) => {
        this.database
          .executeSql(
            'INSERT INTO CERTIFICATE_DETAIL_WITHOUT_AUDIT ' +
            '(AUDIT_SEQ_NO,' +
            'VESSEL_IMO_NO,' +
            'AUDIT_TYPE_ID,' +
            'CERTIFICATE_NO,' +
            'CERTIFICATE_ID,' +
            'UTN,' +
            'COMPANY_ID)' +
            ' VALUES (?,?,?,?,?,?,?)',
            [
              a.auditSeqNo,
              a.vesselImoNo.toString(),
              a.auditTypeId,
              a.certificateNo,
              a.certificateId,
              a.utn,
              a.companyId,
            ]
          )
          .then((res) => {
            console.log(
              '1.INSERT INTO CERTIFICATE_DETAIL_WITHOUT_AUDIT:::success'
            );
          });
      });

      obj.certificateDetail.forEach((a) => {
        this.database
          .executeSql(this.CERTIFICATE_DETAIL_INS_QRY, [
            a.auditSeqNo,
            a.companyId ? a.companyId : '',
            a.seqNo ? a.seqNo : '',
            a.certificateId ? a.certificateId : '',
            a.endorsementID ? a.endorsementID : '',
            a.auditTypeId ? a.auditTypeId : '',
            a.auditSubTypeId ? a.auditSubTypeId : '',
            a.auditDate ? a.auditDate : '',
            a.auditPlace ? a.auditPlace : '',
            a.certificateNo ? a.certificateNo : '',
            a.auditReportNo ? a.auditReportNo : '',
            a.utn ? a.utn : '',
            a.certIssueId ? a.certIssueId : '',
            a.qrCodeUrl ? a.qrCodeUrl : '',
            a.certificateVer ? a.certificateVer : '',
            a.certIssueDate ? a.certIssueDate : '',
            a.certExpireDate ? a.certExpireDate : '',
            a.extendedIssueDate ? a.extendedIssueDate : '',
            a.extendedExpireDate ? a.extendedExpireDate : '',
            a.endorsedDate ? a.endorsedDate : '',
            a.publishStatus ? a.publishStatus : 0,
            a.activeStatus ? a.activeStatus : '',
            a.notes ? a.notes : '',
            a.leadName ? a.leadName : '',
            a.issuerId ? a.issuerId : '',
            a.issuerName ? a.issuerName : '',
            a.issuerSign ? a.issuerSign : '',
            a.issuerSignDate ? a.issuerSignDate : '',
            a.nameToPrint ? a.nameToPrint : '',
            a.signToPrint ? a.signToPrint : '',
            a.verifyDone ? a.verifyDone : '',
            a.vesselId ? a.vesselId : '',
            a.vesselImoNo ? a.vesselImoNo.toString() : '',
            a.vesselName ? a.vesselName : '',
            a.grt ? a.grt.toString() : '',
            a.vesselType ? a.vesselType : '',
            a.officialNo ? a.officialNo : '',
            a.portOfRegistry ? a.portOfRegistry : '',
            a.dateOfRegistry ? a.dateOfRegistry : '',
            a.companyImoNo ? a.companyImoNo : '',
            a.vesselCompanyName ? a.vesselCompanyName : '',
            a.vesselCompanyAddress ? a.vesselCompanyAddress : '',
            a.vesselUk ? a.vesselUk : '',
            a.vesselPk ? a.vesselPk : '',
            a.classSociety ? a.classSociety : '',
            a.callSign ? a.callSign : '',
            a.docTypeNumber ? a.docTypeNumber : '',
            a.docTypeNo ? a.docTypeNo : '',
            a.docIssuer ? a.docIssuer : '',
            a.docExpiry ? a.docExpiry : '',
            a.userIns ? a.userIns : '',
            a.dateIns ? a.dateIns : '',
            a.title ? a.title : '',
            a.seal ? a.seal : '',
            a.certificateLink ? a.certificateLink : '',
            a.consecutiveId ? a.consecutiveId : '',
            a.completionDate ? a.completionDate : '',//added by lokesh for jira_id(910)
            a.dmlcIssueDate ? a.dmlcIssueDate : '',
            a.dmlcIssuePlace ? a.dmlcIssuePlace : '',
            a.certOderNo ? a.certOderNo : '',
            a.qid ? a.qid : '',
          ])
          .then((res) => {
            console.log('2.INSERT INTO CERTIFICATE_DETAIL:::success');
          });
      });

      /*   this.database
          .executeSql(
            "INSERT INTO PDF_DATA_64" +
            "(AUDIT_TYPE_ID," +
            "IMO_NUM," +
            "AUDIT_SUBTYPE_ID," +
            "COMPANY_ID," +
            "AUDIT_SEQ_NO," +
            "CERTIFICATE_NO," +
            "USER_INS," +
            "DATE_INS," +
            "AUDIT_DATE," +
            "PDF_DATA_64)" +
            "VALUES(?,?,?,?,?,?,?,?,?,?)",
            [
              obj.auditTypeId,
              obj.vesselImoNo,
              obj.auditSubTypeId,
              obj.companyId,
              obj.auditSeqNo,
              obj.certificateNo,
              obj.userIns,
              obj.dateIns,
              obj.auditDate,
              obj.certificateData ? obj.certificateData : ""
            ]
          )
          .then(res => {
            console.log("3.INSERT INTO PDF_DATA_64:::success");
          }); */

      this.database
        .executeSql(
          'INSERT INTO AUDIT_DETAILS' +
          '(AUDIT_SEQ_NO,' +
          'COMPANY_ID,' +
          'VESSEL_IMO_NO,' +
          'CERTIFICATE_NO,' +
          'AUDIT_TYPE_ID,' +
          'AUDIT_SUB_TYPE_ID,' +
          'COMPANY_IMO_NO,' +
          'COMPANY_DOC,' +
          'CERT_EXPIRY_DATE,' +
          'CERT_ISSUED_DATE,' +
          'NARRATIVE_SUMMARY,' +
          'AUDIT_REPORT_NO,' +
          'AUDIT_DATE,' +
          'AUDIT_PLACE,' +
          'AUDIT_STATUS_ID,' +
          'CERTIFICATE_ISSUED_ID,' +
          'INTERNAL_AUDIT_DATE,' +
          'OPEN_MEETING_DATE,' +
          'CLOSE_MEETING_DATE,' +
          'AUDIT_SUMMARY_ID,' +
          'LOCK_STATUS,' +
          'LOCK_HOLDER,' +
          'USER_INS,' +
          'DATE_INS,' +
          'SCOPE,' +
          'MAX_STATUS_DATE_CAR,' +
          'ALLOW_NEXT,' +
          'DOC_TYPE_NUMBER,' +
          'GRT,' +
          'SEAL,' +
          'TITLE,' +
          'SIGNATURE,' +
          'CREDIT_DATE,' +
          'QID,' +
          'DATE_OF_REGISTRY,' +
          'VESSEL_NAME,' +
          'VESSEL_TYPE,' +
          'VESSEL_ADDRESS,' +
          'DOC_EXPIRY,' +
          'DOC_ISSUER,' +
          'DOC_TYPE_NO,' +
          'OFFICIAL_NO,' +
          'CERTIFICATE_VERSION,'+
          'REVIEW_STATUS,' +
          'MAKE_FINAL)' +                                           //added by archana for jira ID-MOBILE-916
          'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ?,?,?,?, ?, ?,?,?,?,?,?,?,?,?,?,?)',
          [
            obj.auditSeqNo,
            obj.companyId,

            obj.vesselImoNo.toString(),
            obj.certificateNo,
            obj.auditTypeId,
            obj.auditSubTypeId,
            obj.companyImoNo,
            obj.companyDoc,
            obj.certExpireDate ? obj.certExpireDate : '',
            obj.certIssueDate ? obj.certIssueDate : '',
            obj.narrativeSummary ? obj.narrativeSummary : '',

            obj.auditReportNo,
            obj.auditDate
              ? moment(new Date(obj.auditDate)).format('YYYY-MM-DD')
              : '',
            obj.auditPlace ? obj.auditPlace : '',
            obj.auditStatusId,
            obj.certIssueId,
            obj.interalAuditDate ? obj.interalAuditDate : '',
            obj.openMeetingDate
              ? moment(obj.openMeetingDate).format('YYYY-MM-DD HH:mm')
              : '',
            obj.closeMeetingDate
              ? moment(obj.closeMeetingDate).format('YYYY-MM-DD HH:mm')
              : '',
            obj.auditSummaryId ? obj.auditSummaryId : '',
            obj.lockStatus ? obj.lockStatus : 0,
            obj.lockHolder ? obj.lockHolder : '',
            obj.userIns,
            obj.dateIns,
            obj.scope,
            obj.carFindMaxStatusDate ? obj.carFindMaxStatusDate : '',

            obj.allowNext,
            obj.docTypeNumber ? obj.docTypeNumber : '',
            obj.grt ? obj.grt : 0,
            obj.seal ? obj.seal : '',
            obj.title ? obj.title : '',
            obj.signature ? obj.signature : '',
            obj.creditDate ? obj.creditDate : '',
            obj.qid ? obj.qid : '',
            obj.dateOfRegistry
              ? moment(new Date(obj.dateOfRegistry)).format('YYYY-MM-DD')
              : '',
            obj.vesselNameAud ? obj.vesselNameAud : '',
            obj.vesselTypeAud ? obj.vesselTypeAud : '',
            obj.companyAddressAud ? obj.companyAddressAud : '',
            obj.docExpiryAud
              ? moment(new Date(obj.docExpiryAud)).format('YYYY-MM-DD')
              : '',
            obj.docIssuerAud ? obj.docIssuerAud : '',
            obj.docTypeNoAud ? obj.docTypeNoAud : '',
            obj.officialNoAud ? obj.officialNoAud : '',
            obj.certificateVer ? obj.certificateVer : '',
            obj.reviewStatus,
            obj.makeFinal ? obj.makeFinal : 0,                           //added by archana for jira ID-MOBILE-916
          ]
        )
        .then((res) => {
          console.log('(4/1).INSERT INTO AUDIT_DETAILS:::success');
        });

      obj.sspReviewDetail.forEach((a) => {
        this.database
          .executeSql(
            'INSERT INTO SSP_REVIEW_DATA' +
            '(AUDIT_SEQ_NO,' +
            'AUDIT_TYPE_ID,' +
            'COMPANY_ID,' +
            'SSP_REPORT_NO,' +
            'SSP_LEAD_NAME,' +
            'SSP_REVISION_NO,' +
            'SSP_DMLC_AUDIT_SEQ_NO,' +
            'DUE_DATE,' +
            'VESSEL_COMPANY_ADDRESS,' +
            'VESSEL_COMPANY_NAME,' +
            'OFFICIAL_NO,' +
            'DMLC_AUDIT_PLACE,' +
            'DMLC_ISSUED_DATE,' +
            'LTRSTATUS)' +
            'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [
              a.auditSeqNo.toString(),
              a.auditTypeId,
              a.companyId,
              a.sspReportNo ? a.sspReportNo.toString() : '',
              a.sspLeadName ? a.sspLeadName : '',
              a.sspRevisionNo ? a.sspRevisionNo : '',
              a.sspDmlcAuditSeqNo ? a.sspDmlcAuditSeqNo : '',
              a.dueDate ? moment(new Date(a.dueDate)) : '',
              a.vesselCompanyAddress,
              a.vesselCompanyName,
              a.officialNo,
              a.dmlcAuditPlace ? a.dmlcAuditPlace : '',
              a.dmlcIssuedDate ? a.dmlcIssuedDate : '',
              a.ltrStatus ? a.ltrStatus : 0,
            ]
          )
          .then((res) => {
            console.log('(4/2).INSERT INTO SSP_REVIEW_DATA:::success');
          });
      });

      obj.auditFinding.forEach((a, aIndex) => {
        this.database
          .executeSql(
            'INSERT INTO AUDIT_FINDINGS' +
            '(SEQ_NO,' +
            'CUR_AUDIT_SEQ_NO,' +
            'ORIG_SEQ_NO,' +
            'FINDING_NO,' +
            'AUDIT_DATE,' +
            'AUDIT_CODE,' +
            'COMPANY_ID,' +
            'USER_INS,' +
            'FINDING_STATUS,' +
            'DATE_INS,' +
            'SERIAL_NO,' +
            'AUDIT_STATUS)' +
            'VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
            [
              aIndex + 1,
              a.auditSeqNo,
              a.auditSeqNo,
              a.findingSeqNo.toString(),
              a.auditDate ? moment(a.auditDate).format('YYYY-MM-DD') : '',
              a.auditCode,
              a.companyId,
              a.userIns,
              a.findingStatus,
              moment(a.dateIns).format('YYYY-MM-DD'),
              a.serialNo ? a.serialNo : '',
              a.auditStatus ? a.auditStatus : 0,
            ]
          )
          .then((res) => {
            console.log('(5).INSERT INTO AUDIT_FINDINGS:::success');
          });

        a.findingDetail.forEach((b, bIndex) => {
          console.log('Testing..............', b.findingSeqNo, b.statusSeqNo);

          /* moment(b.dateIns).format("YYYY-MM-DD") ?
            b.dueDate */
          this.database
            .executeSql(
              'INSERT INTO AUDIT_FINDINGS_DETAILS' +
              '(SEQ_NO,' +
              'CUR_AUDIT_SEQ_NO,' +
              'ORIG_SEQ_NO,' +
              'FINDING_NO,' +
              'FINDING_SEQ_NO,' +
              'CATEGORY_ID,' +
              'STATUS_ID,' +
              'STATUS_DATE,' +
              'NEXT_ACTION_ID,' +
              'DUE_DATE,' +
              'DESCRIPTION,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS,' +
              'AUDIT_TYPE_ID,' +
              'UPDATE_DESCRIPTION,' +
              'AUDIT_PLACE,' +         
              'UPDATE_FLAG,' +      //added by archana for jira-id-720
              'CHECKBOX_UPDATE)' +  // added by archana for jira-id-704
              'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
              [
                bIndex + 1,
                b.currentAuditSeq,
                b.origAuditSeqNo,
                b.findingSeqNo.toString(),
                b.statusSeqNo.toString(),
                b.categoryId ? b.categoryId : '',
                b.statusId ? b.statusId : '',
                b.statusDate ? moment(b.statusDate).format('YYYY-MM-DD') : '',
                b.nextActionId ? b.nextActionId : '',
                b.dueDate
                  ? isNaN(new Date(b.dueDate).getDate())
                    ? b.dueDate
                    : moment(new Date(b.dueDate)).format('YYYY-MM-DD')
                  : '',
                b.descriptions ? b.descriptions : '',
                b.companyId,
                b.userIns,
                moment(b.dateIns).format('YYYY-MM-DD'),
                b.auditTypeId,
                b.updateDescription ? b.updateDescription : '',
                b.auditPlace ? b.auditPlace : '',
                b.updateFlag ? b.updateFlag : (b.currentAuditSeq == b.origAuditSeqNo) ? 0 : 1,      //added by archana for jira-id-720
                // b.checkboxUpdate ? b.checkboxUpdate : 0,  // added by archana for jira-id-704
                (a.auditStatus == 1 && b.nextActionId==1010) ? 1 :0,   //added by archana for jira-id-MOBILE-891
              ]
            )
            .then((res) => {
              console.log('(6).INSERT INTO AUDIT_FINDINGS_DETAILS:::success');
            });

          b.findingRptAttachs.forEach((c, cIndex) => {
            this.database
              .executeSql(
                'INSERT INTO AUDIT_FINDING_ATTACHMENTS' +
                '(SEQ_NO,' +
                'CUR_AUDIT_SEQ_NO,' +
                'ORIG_SEQ_NO,' +
                'FINDING_NO,' +
                'FINDING_SEQ_NO,' +
                'FILE_SEQ_NO,' +
                'FILE_NAME,' +
                'FLAG,' +
                'COMPANY_ID,' +
                'USER_INS,' +
                'DATE_INS)' +
                'VALUES(?,?,?,?,?,?,?,?,?,?,?)',
                [
                  cIndex + 1,
                  c.currentAuditSeq,
                  c.origAuditSeqNo,
                  c.findingSeqNo.toString(),              //changed by archana for Jira Id-MOBILE-821
                  c.statusSeqNo.toString(),
                  c.fileSeqNo.toString(),
                  c.fileName ? c.fileName : '',
                  c.ownerFlag ? c.ownerFlag : 0,
                  c.companyId,
                  c.userIns,
                  moment(c.dateIns).format('YYYY-MM-DD'),
                ]
              )
              .then((res) => {
                console.log(
                  '(7).INSERT INTO AUDIT_FINDING_ATTACHMENTS:::success'
                );
              });
          });
        });
      });

      if (obj.auditAuditorDetail.length > 0) {
        obj.auditAuditorDetail.forEach((a) => {
          /**Added by sudharsan for JIRA id MOBILE-510 */
          if (a.auditSeqNo.toString().slice(-2) == '.02') {
            a.auditSeqNo = a.auditSeqNo.toString().slice(0, -2);
          }
          /**End here */
          this.database
            .executeSql(
              'INSERT INTO AUDIT_AUDITOR_DETAILS' +
              '(AUDIT_SEQ_NO,' +
              'AUD_OBS_TYPE_ID,' +
              'AUD_OBS_ID,' +
              'AUDITOR_NAME,' +
              'AUD_SIGNATURE,' +
              'AUD_SIGNATURE_DATE,' +
              'AUD_OBS_LEAD,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS,' +
              'DELEGATE_SIGN)' +
              'VALUES(?,?,?,?,?,?,?,?,?,?,?)',
              [
                a.auditSeqNo.toString(),
                a.auditRoleID ? a.auditRoleID : '',
                a.userId,
                a.auditorName,
                a.audSignature ? a.audSignature : '',
                a.audSignatureDate ? a.audSignatureDate : '',
                a.audLeadStatus ? a.audLeadStatus : 0,
                a.companyId,
                a.userIns,
                a.dateIns,
                a.delegateSign ? a.delegateSign : 0,
              ]
            )
            .then((res) => {
              console.log('(8).INSERT INTO AUDIT_AUDITOR_DETAILS:::success');
            });
        });
      }

      if (obj.auditRptAttach.length > 0) {
        console.log('obj.auditRptAttach', obj.auditRptAttach);
        obj.auditRptAttach.forEach((a, index) => {
          this.database
            .executeSql(
              'INSERT INTO AUDIT_REPORT_ATTACHMENTS' +
              '(SEQ_NO,' +
              'AUDIT_SEQ_NO,' +
              'FILE_NAME,' +
              'ATTACHMENT_TYPE_ID,' +
              'COMMENTS,' +
              'OTHER_TYPE,' +
              'COMPANY_ID,' +
              'USER_INS,' +
              'DATE_INS,' +
              'MANDATORY,' +
              'ATTACHMENTT_TYPE_DESC)' +
              'VALUES(?,?,?,?,?, ?,?,?,?,?, ?)',
              [
                index + 1,
                a.auditSeqNo.toString(),
                a.fileName ? a.fileName : '',
                a.attachmentTypeId ? a.attachmentTypeId : '',
                a.comments ? a.comments : '',
                a.otherType ? a.otherType : '',
                a.companyId,
                a.userIns,
                a.dateIns,
                a.mandatory ? a.mandatory : '',
                a.attchTypeDescAudit ? a.attchTypeDescAudit : '',
              ]
            )
            .then((res) => {
              console.log('(9).INSERT INTO AUDIT_REPORT_ATTACHMENTS:::success');
            });
        });
      }
    }
  }

  saveAuditCycleDates(auditCycleDates) {
    if (auditCycleDates.length > 0) {
      auditCycleDates.forEach((a) => {
        this.database
          .executeSql(
            'INSERT INTO AUDIT_CYCLE' +
            '(ITERATOR,' +
            'VESSEL_IMO_NO,' +
            'VESSEL_ID,' +
            'COMPANY_IMO_NO,' +
            'COMPANY_DOC,' +
            'DOC_TYPE_NUMBER,' +
            'AUDIT_TYPE_ID,' +
            'AUDIT_SEQ_NO,' +
            'CREDIT_DATE,' +
            'NEXT_INTERMEDIATE_START,' +
            'NEXT_INTERMEDIATE_END,' +
            'NEXT_RENEWAL,' +
            'NEXT_RENEWAL_START,' +
            'ACTIVE_STATUS,' +
            'USER_INS,' +
            'DATE_INS,' +
            'AUDIT_DATE,' +
            'AUDIT_SUB_TYPE_ID,' +
            'LEAD_NAME,' +
            'ROLE_ID,' +
            'USER_ID,' +
            'SUB_ITERATOR,' +
            'CYCLE_SEQ_NO,' +
            'INTERMEDIATE_DUE_DATE,' +
            'NEXT_RENEWAL_DUE_DATE,' +
            'CYCLE_GEN_NO)' +
            'VALUES(?,?,?,?,?, ?,?,?,?,?,  ?,?,?,?,?, ?,?,?,?,?,  ?,?,?,?,?,?)',
            [
              a.iterator ? a.iterator : '',
              a.vesselImoNo.toString(),
              a.vesselId ? a.vesselId : '',
              a.companyImoNo ? a.companyImoNo : '',
              a.companyDoc ? a.companyDoc : '',
              a.docTypeNumber ? a.docTypeNumber : '',
              a.auditTypeId,
              a.auditSeqNo ? a.auditSeqNo : '',
              a.creditDate ? a.creditDate : '',
              a.nextIntermediateStart ? a.nextIntermediateStart : '',
              a.nextIntermediateEnd ? a.nextIntermediateEnd : '',
              a.nextRenewal ? a.nextRenewal : '',
              a.nextRenewalStart ? a.nextRenewalStart : '',
              a.activeStatus ? a.activeStatus : '',
              a.userIns ? a.userIns : '',
              a.dateIns ? a.dateIns : '',
              a.auditDate ? a.auditDate : '',
              a.auditSubTypeId ? a.auditSubTypeId : '',
              a.leadAuditorName ? a.leadAuditorName : '',
              a.roleId,
              a.userIns ? a.userIns : '',
              a.subIterator ? a.subIterator : '',
              a.cycleSeqNo ? a.cycleSeqNo : '',
              a.intermediateDueDate ? a.intermediateDueDate : '',
              a.nextRenewalDueDate ? a.nextRenewalDueDate : '',
              a.cycleGenNo ? a.cycleGenNo : 0,
            ]
          )
          .then((res) => {
            console.log('INSERT INTO AUDIT_CYCLE:::success');
          });
      });
    }
  }
  getAuditCycleDates(vesselImoNo, auditTypeId) {
    return new Promise<object>((resolve, reject) => {
      let auditCycleOfCurrentVessel = [];
      this.database.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM AUDIT_CYCLE WHERE AUDIT_TYPE_ID = ? AND VESSEL_IMO_NO = ? ',
          [auditTypeId, vesselImoNo],
          (tx: any, auditCycleDate: any) => {
            if (auditCycleDate.rows.length > 0) {
              for (var x = 0; x < auditCycleDate.rows.length; x++) {
                auditCycleOfCurrentVessel.push({
                  vesselImoNo: auditCycleDate.rows.item(x).VESSEL_IMO_NO,
                  auditTypeId: auditCycleDate.rows.item(x).AUDIT_TYPE_ID,
                  auditSeqNo: auditCycleDate.rows.item(x).AUDIT_SEQ_NO,
                  cycleSeqNo: auditCycleDate.rows.item(x).CYCLE_SEQ_NO,
                  cycleGenNo: auditCycleDate.rows.item(x).CYCLE_GEN_NO,
                  nextIntermediateStart:
                    auditCycleDate.rows.item(x).NEXT_INTERMEDIATE_START,
                  nextIntermediateEnd:
                    auditCycleDate.rows.item(x).NEXT_INTERMEDIATE_END,
                  nextRenewal: auditCycleDate.rows.item(x).NEXT_RENEWAL,
                  nextRenewalStart:
                    auditCycleDate.rows.item(x).NEXT_RENEWAL_START,
                  leadAuditorName: auditCycleDate.rows.item(x).LEAD_NAME,
                  creditDate: auditCycleDate.rows.item(x).CREDIT_DATE,
                  auditDate: auditCycleDate.rows.item(x).AUDIT_DATE,
                  roleId: auditCycleDate.rows.item(x).ROLE_ID,
                  auditSubTypeId: auditCycleDate.rows.item(x).AUDIT_SUB_TYPE_ID,
                  intermediateDueDate:
                    auditCycleDate.rows.item(x).INTERMEDIATE_DUE_DATE,
                  nextRenewalDueDate:
                    auditCycleDate.rows.item(x).NEXT_RENEWAL_DUE_DATE,
                });
              }
              resolve(auditCycleOfCurrentVessel);
            }
          },
          (tx: any, err: any) => {
            reject({ tx: tx, err: err });
          }
        );
      });
    });
  }
  /* ------------------------------------ save audit ends-------------------------*/

  /* ------------------------------------ save previous audit and findings -------------------------*/

  savePreviousAuditData(pad) {
    if (pad) {
      console.log('Pad.length', pad.length);
      pad.forEach((element) => {
        element.auditSeqNo = element.auditSeqNo.toString();
        this.database.executeSql(
          'DELETE FROM AUDIT_DETAILS WHERE AUDIT_SEQ_NO=?',
          [element.auditSeqNo]
        );
        this.database.executeSql(
          'DELETE FROM AUDIT_AUDITOR_DETAILS WHERE AUDIT_SEQ_NO=?',
          [element.auditSeqNo]
        );
        this.database.executeSql(
          'DELETE FROM CERTIFICATE_DETAIL WHERE AUDIT_SEQ_NO=?',
          [element.auditSeqNo]
        );
        /*  this.database.executeSql(
           "DELETE FROM PDF_DATA_64 WHERE AUDIT_SEQ_NO=?",
           [element.auditSeqNo]
         ); */
        /* this.db.execSQL("INSERT INTO PDF_DATA_64" +
        "(AUDIT_TYPE_ID," +
        "IMO_NUM," +
        "AUDIT_SUBTYPE_ID," +
        "COMPANY_ID," +
        "AUDIT_SEQ_NO," +
        "CERTIFICATE_NO," +
        "USER_INS," +
        "DATE_INS," +
        "AUDIT_DATE," +
        "PDF_DATA_64)" +
        "VALUES(?,?,?,?,?,?,?,?,?,?)",
        [e.auditTypeId, e.vesselImoNo ? e.vesselImoNo : '',
        e.auditSubTypeId ? e.auditSubTypeId : '', e.companyId,
        e.auditSeqNo, e.certificateNo ? e.certificateNo : '',
        e.userIns, e.dateIns, e.auditDate,
        e.certificateData ? e.certificateData : '']); */
        console.log(element);
        if (
          element.auditAuditorDetail &&
          element.auditAuditorDetail.length > 0
        ) {
          element.auditAuditorDetail.forEach((auditor) => {
            /**Added by sudharsan for JIRA id MOBILE-510 */
            if (auditor.auditSeqNo.toString().slice(-2) == '.0') {
              auditor.auditSeqNo = auditor.auditSeqNo.toString(0, -2);
            }
            /**End here */
            this.database
              .executeSql(
                'INSERT INTO AUDIT_AUDITOR_DETAILS' +
                '(AUDIT_SEQ_NO,' +
                'AUD_OBS_TYPE_ID,' +
                'AUD_OBS_ID,' +
                'AUDITOR_NAME,' +
                'AUD_SIGNATURE,' +
                'AUD_SIGNATURE_DATE,' +
                'AUD_OBS_LEAD,' +
                'COMPANY_ID,' +
                'USER_INS,' +
                'DATE_INS,' +
                'DELEGATE_SIGN)' +
                'VALUES(?,?,?,?,?,?,?,?,?,?,?)',
                [
                  auditor.auditSeqNo.toString(),/**Added by sudharsan for JIRA id MOBILE-510 */
                  auditor.auditRoleID ? auditor.auditRoleID : '',
                  auditor.userId,
                  auditor.auditorName,
                  auditor.audSignature ? auditor.audSignature : '',
                  auditor.audSignatureDate ? auditor.audSignatureDate : '',
                  auditor.audLeadStatus ? auditor.audLeadStatus : 0,
                  auditor.companyId,
                  auditor.userIns,
                  auditor.dateIns,
                  auditor.delegateSign ? auditor.delegateSign : 0,
                ]
              )
              .then((res) => {
                console.log(
                  'INSERT INTO AUDIT_AUDITOR_DETAILS of Previous Audit:::success'
                );
              });
          });

          if (element.certificateDetail.length > 0) {
            element.certificateDetail.forEach((a) => {
              this.database
                .executeSql(this.CERTIFICATE_DETAIL_INS_QRY, [
                  a.auditSeqNo,
                  a.companyId ? a.companyId : '',
                  a.seqNo ? a.seqNo : '',
                  a.certificateId ? a.certificateId : '',
                  a.endorsementID ? a.endorsementID : '',
                  a.auditTypeId ? a.auditTypeId : '',
                  a.auditSubTypeId ? a.auditSubTypeId : '',
                  a.auditDate ? a.auditDate : '',
                  a.auditPlace ? a.auditPlace : '',
                  a.certificateNo ? a.certificateNo : '',
                  a.auditReportNo ? a.auditReportNo : '',
                  a.utn ? a.utn : '',
                  a.certIssueId ? a.certIssueId : '',
                  a.qrCodeUrl ? a.qrCodeUrl : '',
                  a.certificateVer ? a.certificateVer : '',
                  a.certIssueDate ? a.certIssueDate : '',
                  a.certExpireDate ? a.certExpireDate : '',
                  a.extendedIssueDate ? a.extendedIssueDate : '',
                  a.extendedExpireDate ? a.extendedExpireDate : '',
                  a.endorsedDate ? a.endorsedDate : '',
                  a.publishStatus ? a.publishStatus : 0,
                  a.activeStatus ? a.activeStatus : '',
                  a.notes ? a.notes : '',
                  a.leadName ? a.leadName : '',
                  a.issuerId ? a.issuerId : '',
                  a.issuerName ? a.issuerName : '',
                  a.issuerSign ? a.issuerSign : '',
                  a.issuerSignDate ? a.issuerSignDate : '',
                  a.nameToPrint ? a.nameToPrint : '',
                  a.signToPrint ? a.signToPrint : '',
                  a.verifyDone ? a.verifyDone : '',
                  a.vesselId ? a.vesselId : '',
                  a.vesselImoNo ? a.vesselImoNo.toString() : '',
                  a.vesselName ? a.vesselName : '',
                  a.grt ? a.grt.toString() : '',
                  a.vesselType ? a.vesselType : '',
                  a.officialNo ? a.officialNo : '',
                  a.portOfRegistry ? a.portOfRegistry : '',
                  a.dateOfRegistry ? a.dateOfRegistry : '',
                  a.companyImoNo ? a.companyImoNo : '',
                  a.vesselCompanyName ? a.vesselCompanyName : '',
                  a.vesselCompanyAddress ? a.vesselCompanyAddress : '',
                  a.vesselUk ? a.vesselUk : '',
                  a.vesselPk ? a.vesselPk : '',
                  a.classSociety ? a.classSociety : '',
                  a.callSign ? a.callSign : '',
                  a.docTypeNumber ? a.docTypeNumber : '',
                  a.docTypeNo ? a.docTypeNo : '',
                  a.docIssuer ? a.docIssuer : '',
                  a.docExpiry ? a.docExpiry : '',
                  a.userIns ? a.userIns : '',
                  a.dateIns ? a.dateIns : '',
                  a.title ? a.title : '',
                  a.seal ? a.seal : '',
                  a.certificateLink ? a.certificateLink : '',
                  a.consecutiveId ? a.consecutiveId : '',
                  a.completionDate ? a.completionDate : '',
                  a.dmlcIssueDate ? a.dmlcIssueDate : '',
                  a.dmlcIssuePlace ? a.dmlcIssuePlace : '',
                  a.certOderNo ? a.certOderNo : '',
                  a.qid ? a.qid : '',
                ])
                .then((res) => {
                  console.log(
                    'INSERT INTO CERTIFICATE_DETAIL_INS_QRY of Previous Audit:::success'
                  );
                });
            });
          }
        }

        this.database
          .executeSql(
            'INSERT INTO AUDIT_DETAILS' +
            '(AUDIT_SEQ_NO,' +
            'COMPANY_ID,' +
            'VESSEL_IMO_NO,' +
            'CERTIFICATE_NO,' +
            'AUDIT_TYPE_ID,' +
            'AUDIT_SUB_TYPE_ID,' +
            'COMPANY_IMO_NO,' +
            'COMPANY_DOC,' +
            'CERT_EXPIRY_DATE,' +
            'CERT_ISSUED_DATE,' +
            'NARRATIVE_SUMMARY,' +
            'AUDIT_REPORT_NO,' +
            'AUDIT_DATE,' +
            'AUDIT_PLACE,' +
            'AUDIT_STATUS_ID,' +
            'CERTIFICATE_ISSUED_ID,' +
            'INTERNAL_AUDIT_DATE,' +
            'OPEN_MEETING_DATE,' +
            'CLOSE_MEETING_DATE,' +
            'AUDIT_SUMMARY_ID,' +
            'LOCK_STATUS,' +
            'LOCK_HOLDER,' +
            'USER_INS,' +
            'DATE_INS,' +
            'SCOPE,' +
            'MAX_STATUS_DATE_CAR,' +
            'ALLOW_NEXT,' +
            'DOC_TYPE_NUMBER,' +
            'GRT,' +
            'SEAL,' +
            'TITLE,' +
            'SIGNATURE,' +
            'CREDIT_DATE,' +
            'QID,' +
            'DATE_OF_REGISTRY,' +
            'VESSEL_NAME,' +
            'VESSEL_TYPE,' +
            'VESSEL_ADDRESS,' +
            'DOC_EXPIRY,' +
            'DOC_ISSUER,' +
            'DOC_TYPE_NO,' +
            'OFFICIAL_NO,' +
            'CERTIFICATE_VERSION,' +
            'REVIEW_STATUS)' +
            'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ?,?,?,?, ?, ?,?,?,?,?,?,?,?,?,?)',
            [
              element.auditSeqNo,
              element.companyId,

              element.vesselImoNo.toString(),
              element.certificateNo,
              element.auditTypeId,
              element.auditSubTypeId,
              element.companyImoNo,
              element.companyDoc,
              element.certExpireDate ? element.certExpireDate : '',
              element.certIssueDate ? element.certIssueDate : '',
              element.narrativeSummary ? element.narrativeSummary : '',

              element.auditReportNo,
              element.auditDate
                ? moment(new Date(element.auditDate)).format('YYYY-MM-DD')
                : '',
              element.auditPlace ? element.auditPlace : '',
              element.auditStatusId,
              element.certIssueId,
              element.interalAuditDate ? element.interalAuditDate : '',
              element.openMeetingDate
                ? moment(element.openMeetingDate).format('YYYY-MM-DD HH:mm')
                : '',
              element.closeMeetingDate
                ? moment(element.closeMeetingDate).format('YYYY-MM-DD HH:mm')
                : '',
              element.auditSummaryId ? element.auditSummaryId : '',
              element.lockStatus ? element.lockStatus : 0,
              element.lockHolder ? element.lockHolder : '',
              element.userIns,
              element.dateIns,
              element.scope,
              element.carFindMaxStatusDate ? element.carFindMaxStatusDate : '',

              element.allowNext,
              element.docTypeNumber ? element.docTypeNumber : '',
              element.grt ? element.grt : 0,
              element.seal ? element.seal : '',
              element.title ? element.title : '',
              element.signature ? element.signature : '',
              element.creditDate ? element.creditDate : '',
              element.qid ? element.qid : '',
              element.dateOfRegistry
                ? moment(new Date(element.dateOfRegistry)).format('YYYY-MM-DD')
                : '',
              element.vesselNameAud ? element.vesselNameAud : '',
              element.vesselTypeAud ? element.vesselTypeAud : '',
              element.companyAddressAud ? element.companyAddressAud : '',
              element.docExpiryAud
                ? moment(new Date(element.docExpiryAud)).format('YYYY-MM-DD')
                : '',
              element.docIssuerAud ? element.docIssuerAud : '',
              element.docTypeNoAud ? element.docTypeNoAud : '',
              element.officialNoAud ? element.officialNoAud : '',
              element.certificateVer ? element.certificateVer : '',
              element.reviewStatus,
            ]
          )
          .then((res) => {
            console.log(
              'INSERT INTO AUDIT_DETAILS of Previous Audit:::success'
            );
          });
      });
    }
  }
  savePreviousFindingData(pf,auditSeqNo) {
    if (pf && pf.length > 0) {
      pf.forEach((pfElement) => {
        this.database.executeSql(
          'DELETE FROM AUDIT_FINDINGS WHERE CUR_AUDIT_SEQ_NO=0 and ORIG_SEQ_NO=?',
          [pfElement.auditSeqNo]
        );
        this.database.executeSql(
          'DELETE FROM AUDIT_FINDINGS_DETAILS WHERE ORIG_SEQ_NO=?',
          [pfElement.auditSeqNo]
        );
        this.database.executeSql(
          'DELETE FROM AUDIT_FINDING_ATTACHMENTS WHERE ORIG_SEQ_NO=?',
          [pfElement.auditSeqNo]
        );
      });

      pf.forEach((pfElement, pfElementIndex) => {
        //console.log('pfElement '+(pfElementIndex+1), pfElement)

        this.database
          .executeSql(
            'INSERT INTO AUDIT_FINDINGS' +
            '(SEQ_NO,' +
            'CUR_AUDIT_SEQ_NO,' +
            'ORIG_SEQ_NO,' +
            'FINDING_NO,' +
            'AUDIT_DATE,' +
            'AUDIT_CODE,' +
            'COMPANY_ID,' +
            'USER_INS,' +
            'FINDING_STATUS,' +
            'DATE_INS,' +
            'SERIAL_NO,' +
            'AUDIT_STATUS)' +
            'VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
            [
              pfElementIndex + 1,
              0,
              pfElement.auditSeqNo,
              pfElement.findingSeqNo ? pfElement.findingSeqNo.toString() : '',
              pfElement.auditDate,
              pfElement.auditCode ? pfElement.auditCode : '',
              pfElement.companyId,
              pfElement.userIns,
              pfElement.findingStatus,
              pfElement.dateIns,
              pfElement.serialNo ? pfElement.serialNo : '',
              pfElement.auditStatus ? pfElement.auditStatus : 0,
            ]
          )
          .then((res) => {
            console.log(res);
          });

        pfElement.findingDetail.forEach(
          (findingDetailElement, findingDetailElementIndex) => {
            if (
              findingDetailElement.categoryId ==
              this.appConstant.OBS_FINDING_CATEGORY ||
              findingDetailElement.statusId == this.appConstant.VERIFIED_CLOSED
            ) {
              findingDetailElement.nextActionId = parseInt(
                this.appConstant.NIL
              );
            }
            // console.log('findingDetailElement '+(findingDetailElementIndex+1), findingDetailElement)
            this.database
              .executeSql(
                'INSERT INTO AUDIT_FINDINGS_DETAILS' +
                '(SEQ_NO,' +
                'CUR_AUDIT_SEQ_NO,' +
                'ORIG_SEQ_NO,' +
                'FINDING_NO,' +
                'FINDING_SEQ_NO,' +
                'CATEGORY_ID,' +
                'STATUS_ID,' +
                'STATUS_DATE,' +
                'NEXT_ACTION_ID,' +
                'DUE_DATE,' +
                'DESCRIPTION,' +
                'COMPANY_ID,' +
                'USER_INS,' +
                'DATE_INS,' +
                'AUDIT_TYPE_ID,' +
                'UPDATE_DESCRIPTION,' +
                'AUDIT_PLACE,'+
                'UPDATE_FLAG,'+         // added by archana for jira-id-720
                'CHECKBOX_UPDATE)' +     // added by archana for jira-id-704
                'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [
                  findingDetailElementIndex + 1,
                  findingDetailElement.currentAuditSeq,
                  findingDetailElement.origAuditSeqNo,
                  findingDetailElement.findingSeqNo.toString(),
                  findingDetailElement.statusSeqNo.toString(),
                  findingDetailElement.categoryId
                    ? findingDetailElement.categoryId
                    : '',
                  findingDetailElement.statusId
                    ? findingDetailElement.statusId
                    : '',
                  findingDetailElement.statusDate
                    ? moment(findingDetailElement.statusDate).format(
                      'YYYY-MM-DD'
                    )
                    : '',
                  findingDetailElement.nextActionId
                    ? findingDetailElement.nextActionId
                    : '',
                  findingDetailElement.dueDate
                    ? findingDetailElement.dueDate
                    : '',
                  findingDetailElement.descriptions
                    ? findingDetailElement.descriptions
                    : '',
                  findingDetailElement.companyId,
                  findingDetailElement.userIns,
                  findingDetailElement.dateIns,
                  findingDetailElement.auditTypeId,
                  findingDetailElement.updateDescription
                    ? findingDetailElement.updateDescription
                    : '',
                  findingDetailElement.auditPlace
                    ? findingDetailElement.auditPlace
                    : '',
                    findingDetailElement.updateFlag ? findingDetailElement.updateFlag : 
                    // ((findingDetailElement.currentAuditSeq == findingDetailElement.origAuditSeqNo)? 0 : 1),    //changed by archana for jira Id-MOBILE-864
                    // findingDetailElement.checkboxUpdate ? findingDetailElement.checkboxUpdate : 0,
                    ((findingDetailElement.currentAuditSeq == auditSeqNo)? 1 : 0),                                //added by archana for jira ID-MOBILE-923
                    (pfElement.auditStatus == 1 && findingDetailElement.nextActionId==1010) ? 1 :0,           // added by archana for jira-ID-MOBILE-886
                ]
              )
              .then((res) => {
                console.log(res);
              });

            findingDetailElement.findingRptAttachs.forEach(
              (findingAtchElement, findingAtchElementIndex) => {
                // console.log('findingAtchElement '+(findingAtchElementIndex+1), findingAtchElement)
                this.database
                  .executeSql(
                    'INSERT INTO AUDIT_FINDING_ATTACHMENTS' +
                    '(SEQ_NO,' +
                    'CUR_AUDIT_SEQ_NO,' +
                    'ORIG_SEQ_NO,' +
                    'FINDING_NO,' +
                    'FINDING_SEQ_NO,' +
                    'FILE_SEQ_NO,' +
                    'FILE_NAME,' +
                    'FLAG,' +
                    'COMPANY_ID,' +
                    'USER_INS,' +
                    'DATE_INS)' +
                    'VALUES(?,?,?,?,?,?,?,?,?,?,?)',
                    [
                      findingAtchElementIndex + 1,
                      findingAtchElement.currentAuditSeq,
                      findingAtchElement.origAuditSeqNo,
                      findingAtchElement.findingSeqNo.toString(),        //changed by archana for Jira Id-MOBILE-821
                      findingAtchElement.statusSeqNo.toString(),
                      findingAtchElement.fileSeqNo.toString(),
                      findingAtchElement.fileName
                        ? findingAtchElement.fileName
                        : '',
                      findingAtchElement.ownerFlag
                        ? findingAtchElement.ownerFlag
                        : 0,
                      findingAtchElement.companyId,
                      findingAtchElement.userIns,
                      findingAtchElement.dateIns,
                    ]
                  )
                  .then((res) => {
                    console.log(res);
                  });
                console.log(
                  'Previous Audit and findings inserted successfully'
                );
              }
            );
          }
        );
      });
    }
  }

  /* ------------------------------------ save previous audit and findings ends -------------------------*/

  //certificate Detail insert Query

  CERTIFICATE_DETAIL_INS_QRY =
    'INSERT INTO CERTIFICATE_DETAIL (' +
    'AUDIT_SEQ_NO,' +
    'COMPANY_ID,' +
    'SEQ_NO,' +
    'CERTIFICATE_ID,' +
    'ENDORSEMENT_ID,' +
    'AUDIT_TYPE_ID,' +
    'AUDIT_SUB_TYPE_ID,' +
    'AUDIT_DATE,' +
    'AUDIT_PLACE,' +
    'CERTIFICATE_NO,' +
    'AUDIT_REPORT_NO,' +
    'UTN,' +
    'CERTIFICATE_ISSUE_ID,' +
    'QRCODE_URL,' +
    'CERTIFICATE_VERSION,' +
    'CERT_ISSUED_DATE,' +
    'CERT_EXPIRY_DATE,' +
    'EXTENDED_ISSUE_DATE,' +
    'EXTENDED_EXPIRY_DATE,' +
    'ENDORSED_DATE,' +
    'PUBLISH_STATUS,' +
    'ACTIVE_STATUS,' +
    'NOTES,' +
    'LEAD_NAME,' +
    'ISSUER_ID,' +
    'ISSUER_NAME,' +
    'ISSUER_SIGN,' +
    'ISSUER_SIGN_DATE,' +
    'NAME_TO_PRINT,' +
    'SIGN_TO_PRINT,' +
    'VERIFY_DONE,' +
    'VESSEL_ID,' +
    'VESSEL_IMO_NO,' +
    'VESSEL_NAME,' +
    'GRT,' +
    'VESSEL_TYPE,' +
    'OFFICIAL_NO,' +
    'PORT_OF_REGISTRY,' +
    'DATE_OF_REGISTRY,' +
    'COMPANY_IMO_NO,' +
    'VESSEL_COMPANY_NAME,' +
    'VESSEL_COMPANY_ADDRESS,' +
    'VESSEL_UK,' +
    'VESSEL_PK,' +
    'CLASS_SOCIETY,' +
    'CALL_SIGN,' +
    'DOC_TYPE_NUMBER,' +
    'DOC_TYPE,' +
    'DOC_ISSUER,' +
    'DOC_EXPIRY,' +
    'USER_INS,' +
    'DATE_INS,' +
    'TITLE,' +
    'SEAL,' +
    'CERTIFICATE_LINK_SEQ,' +
    'CONSECTIVE_SUBSEQUENT,' +
    'COMPLETION_DATE,' +
    'DMLCII_ISSUE_DATE,' +
    'DMLCII_ISSUE_LOCATION,' +
    'CERT_ORDER_NO,' +
    'QID) VALUES(?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?,  ?,?,?,?,? ,?,?,?,?,?, ?,?,?,?,?, ?) ';

  //deleteSelectedAudit
  deleteSelectedAudit(audit) {
    let auditSeqArray = [];
    return new Promise<Object>((resolve, reject) => {
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT AUDIT_SEQ_NO FROM AUDIT_DETAILS WHERE VESSEL_IMO_NO = ? AND AUDIT_TYPE_ID = ?',
            [audit.vesselImoNo, audit.auditTypeId],
            (tx: any, auditSeqNoRes: any) => {
              if (auditSeqNoRes.rows.length > 0) {
                for (var i = 0; i < auditSeqNoRes.rows.length; i++) {
                  auditSeqArray.push({
                    auditSeqNo: auditSeqNoRes.rows.item(i).AUDIT_SEQ_NO,
                  });
                }
              }
            },
            (tx: any, err: any) => {
              console.log('Audit Delete Operation failed.');
            }
          );
        })
        .then(() => {
          auditSeqArray.forEach((element) => {
            let auditSeqNo = element.auditSeqNo;
            let vesselImoNo = element.vesselImoNo;
            let auditTypeId = element.auditTypeId;
            this.database.executeSql(
              'DELETE FROM AUDIT_AUDITOR_DETAILS WHERE AUDIT_SEQ_NO=?',
              [auditSeqNo]
            );
            this.database.executeSql(
              'DELETE FROM AUDIT_REPORT_ATTACHMENTS WHERE AUDIT_SEQ_NO=?',
              [auditSeqNo]
            );
            /* this.database.executeSql(
              "DELETE FROM PDF_DATA_64 WHERE AUDIT_SEQ_NO=?",
              [auditSeqNo]
            ); */
            this.database.executeSql(
              'DELETE FROM SSP_REVIEW_DATA WHERE AUDIT_SEQ_NO=?',
              [auditSeqNo]
            );
            this.database.executeSql(
              'DELETE FROM AUDIT_FINDING_ATTACHMENTS WHERE ORIG_SEQ_NO=?',
              [auditSeqNo]
            );
            this.database.executeSql(
              'DELETE FROM AUDIT_FINDINGS_DETAILS WHERE ORIG_SEQ_NO=?',
              [auditSeqNo]
            );
            this.database.executeSql(
              'DELETE FROM AUDIT_FINDINGS WHERE ORIG_SEQ_NO=?',
              [auditSeqNo]
            );
            this.database.executeSql(
              'DELETE FROM AUDIT_DETAILS WHERE AUDIT_SEQ_NO=?',
              [auditSeqNo]
            );
            this.database.executeSql(
              'DELETE FROM CERTIFICATE_DETAIL WHERE AUDIT_SEQ_NO=?',
              [auditSeqNo]
            );
            this.database.executeSql(
              'DELETE FROM CERTIFICATE_DETAIL_WITHOUT_AUDIT WHERE AUDIT_SEQ_NO=?', ///* VESSEL_IMO_NO=? and AUDIT_TYPE_ID=? */",
              [auditSeqNo]
            );
            this.database.executeSql(
              'DELETE FROM AUDIT_CYCLE WHERE VESSEL_IMO_NO=? AND AUDIT_TYPE_ID=?',
              [vesselImoNo, auditTypeId]
            );
            resolve({ status: 'ok' });
          });
        });
    });
  }
  getAuditSeqNosOfTheUser(userName) {
    let auditorSeqNos = '';
    return new Promise<string>((resolve, reject) => {
      this.database.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM AUDIT_AUDITOR_DETAILS WHERE USER_INS=?',
          [userName],
          (tx: any, res: any) => {
            if (res.rows.length > 0) {
              for (var x = 0; x < res.rows.length; x++) {
                /**Added by sudharsan for JIRA id MOBILE-510 */
                if (res.rows.item(x).AUDIT_SEQ_NO.slice(-2) == '0.2') {
                  auditorSeqNos += "'" + res.rows.item(x).AUDIT_SEQ_NO.slice(0, -2) + "',";
                }
                else {
                  auditorSeqNos += "'" + res.rows.item(x).AUDIT_SEQ_NO + "',";
                }
                /**End here */
              }
              console.log('auditorSeqNos', auditorSeqNos);
              auditorSeqNos = auditorSeqNos.slice(0, -1);
              resolve(auditorSeqNos);
            }
          },
          (tx: any, err: any) => {
            reject({ tx: tx, err: err });
          }
        );
      });
    });
  }
  getAuditDetailsOfTheUser(auditorSeqNos) {
    let auditDtl: any = [];
    return new Promise<Object>((resolve, reject) => {
      this.database.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM AUDIT_DETAILS AD WHERE AD.AUDIT_STATUS_ID=1001 AND AD.ALLOW_NEXT<>1 AND AD.AUDIT_SEQ_NO IN (' +
          auditorSeqNos +
          ') AND AD.COMPANY_ID = 2 ORDER BY Date(AD.AUDIT_DATE) ',
          [],
          (tx: any, auditDtlRes: any) => {
            if (auditDtlRes.rows.length > 0) {
              for (var x = 0; x < auditDtlRes.rows.length; x++) {
                auditDtl.push(auditDtlRes.rows.item(x));
                console.log('auditDtl', auditDtl);
              }
              resolve(auditDtl);
            }
          },
          (tx: any, err: any) => {
            reject({ tx: tx, err: err });
          }
        );
      });
    });
  }

  public getAvailAuditRecordsOfCurrentUser1(userName) {
    let auditItems = [];

    return new Promise<Object>((resolve, reject) => {
      this.getAuditSeqNosOfTheUser(userName).then((seq) => {
        this.getAuditDetailsOfTheUser(seq).then((auditDtl: any) => {
          console.log('audDtls : ', auditDtl);

          auditDtl.forEach((auditEle, auditDtlIndex) => {
            auditItems.push({
              auditSeqNo: auditEle.AUDIT_SEQ_NO,
              companyId: auditEle.COMPANY_ID,
              auditStatusId: auditEle.AUDIT_STATUS_ID,
              //auditStatusDesc: auditStatusDesc,
              vesselImoNo: auditEle.VESSEL_IMO_NO,
              //vesselName: vesselName,
              //officialNo: officialNo,
              //grt: grt,
              certificateNo: auditEle.CERTIFICATE_NO,
              auditTypeId: auditEle.AUDIT_TYPE_ID,
              // auditTypeDesc: auditTypeDesc,
              auditSubTypeId: auditEle.AUDIT_SUB_TYPE_ID,
              // audSubTypeDesc: auditSubTypeDesc,
              companyImoNo: auditEle.COMPANY_IMO_NO,
              certExpireDate: auditEle.CERT_EXPIRY_DATE,
              certIssueDate: auditEle.CERT_ISSUED_DATE,
            });
            let auditDetail = auditEle;
            //this.getVesselDtlOfTheVessel(auditDetail.VESSEL_IMO_NO).then(() => {
            this.database
              .transaction((tx: any) => {
                tx.executeSql(
                  'SELECT VESSEL_NAME,OFFICIAL_NO,GRT FROM MA_VESSEL WHERE VESSEL_IMO_NO=? ',
                  [auditDetail.VESSEL_IMO_NO],
                  (tx: any, vesselNameRes: any) => {
                    if (vesselNameRes.rows.length > 0) {
                      auditItems[auditDtlIndex].vesselName =
                        vesselNameRes.rows.item(0).VESSEL_NAME;
                      auditItems[auditDtlIndex].officialNo =
                        vesselNameRes.rows.item(0).OFFICIAL_NO;
                      auditItems[auditDtlIndex].grt =
                        vesselNameRes.rows.item(0).GRT;
                    }
                  },
                  (tx: any, err: any) => {
                    reject({ tx: tx, err: err });
                  }
                );
              })
              .then(() => {
                this.database
                  .transaction((tx: any) => {
                    tx.executeSql(
                      'SELECT AUDIT_TYPE_DESC FROM MA_AUDIT_TYPE WHERE AUDIT_TYPE_ID=? ',
                      [auditDetail.AUDIT_TYPE_ID],
                      (tx: any, auditTypeDescRes: any) => {
                        if (auditTypeDescRes.rows.length > 0) {
                          auditItems[auditDtlIndex].auditTypeDesc =
                            auditTypeDescRes.rows.item(0).AUDIT_TYPE_DESC;
                        }
                      },
                      (tx: any, err: any) => {
                        reject({ tx: tx, err: err });
                      }
                    );
                  })
                  .then(() => {
                    this.database
                      .transaction((tx: any) => {
                        tx.executeSql(
                          'SELECT AUDIT_SUBTYPE_DESC FROM MA_AUDIT_SUBTYPE WHERE AUDIT_TYPE_ID=? AND AUDIT_SUBTYPE_ID=?',
                          [
                            auditDetail.AUDIT_TYPE_ID,
                            auditDetail.AUDIT_SUB_TYPE_ID,
                          ],
                          (tx: any, auditSubTypeDescRes: any) => {
                            if (auditSubTypeDescRes.rows.length > 0) {
                              auditItems[auditDtlIndex].auditSubTypeDesc =
                                auditSubTypeDescRes.rows.item(
                                  0
                                ).AUDIT_SUBTYPE_DESC;
                            }
                          },
                          (tx: any, err: any) => {
                            reject({ tx: tx, err: err });
                          }
                        );
                      })
                      .then(() => {
                        this.database
                          .transaction((tx: any) => {
                            tx.executeSql(
                              'SELECT AUDIT_STATUS_DESC FROM MA_AUDIT_STATUS WHERE AUDIT_TYPE_ID=? AND AUDIT_STATUS_ID=?',
                              [
                                auditDetail.AUDIT_TYPE_ID,
                                auditDetail.AUDIT_STATUS_ID,
                              ],
                              (tx: any, auditStatusRes: any) => {
                                if (auditStatusRes.rows.length > 0) {
                                  auditItems[auditDtlIndex].auditStatusDesc =
                                    auditStatusRes.rows.item(
                                      0
                                    ).AUDIT_STATUS_DESC;
                                }
                              },
                              (tx: any, err: any) => {
                                reject({ tx: tx, err: err });
                              }
                            );
                          })
                          .then(() => {
                            console.log('final auditItems : ', auditItems);
                            resolve(auditItems);
                          });
                      });
                  });
              });
          });
        });
      });
    });
    // });
  }

  //get Auditor Sequence Numbers
  public getAvailAuditRecordsOfCurrentUser(userName) {
    return new Promise<Object>((resolve, reject) => {
      let auditDtl: any = [];
      let auditItems: Array<{}> = [],
        auditorSeqNos = '';

      //tx for seq no's
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM AUDIT_AUDITOR_DETAILS WHERE AUD_OBS_ID=?',
            [userName],
            (tx: any, res: any) => {
              if (res.rows.length > 0) {
                for (var x = 0; x < res.rows.length; x++) {
                  if (res.rows.item(x).AUDIT_SEQ_NO.slice(-2) == ".0") {  //Added by sudharsan for JIRA-ID- 509
                    auditorSeqNos += "'" + res.rows.item(x).AUDIT_SEQ_NO.slice(0, -2) + "',";
                  }
                  else {
                    auditorSeqNos += "'" + res.rows.item(x).AUDIT_SEQ_NO + "',";
                  }
                }
                console.log('auditorSeqNos', auditorSeqNos);
                auditorSeqNos = auditorSeqNos.slice(0, -1);
              }
            },
            (tx: any, err: any) => {
              reject({ tx: tx, err: err });
            }
          );
        })
        .then(() => {
          this.database
            .transaction((tx: any) => {
              tx.executeSql(
                'SELECT * FROM AUDIT_DETAILS AD WHERE AD.ALLOW_NEXT == 0 AND AD.LOCK_STATUS <> 3 AND AD.REVIEW_STATUS==0 AND AD.AUDIT_SEQ_NO IN (' +  //changed by archana for jira ID-Mobile-748,MOBILE-861
                auditorSeqNos +
                ') AND AD.COMPANY_ID = 2 ORDER BY Date(AD.AUDIT_DATE) ',
              [],
                (tx: any, auditDtlRes: any) => {
                  if (auditDtlRes.rows.length > 0) {
                    for (var x = 0; x < auditDtlRes.rows.length; x++) {
                      auditDtl.push(auditDtlRes.rows.item(x));
                      console.log('auditDtl', auditDtl);
                    }
                  }
                },
                (tx: any, err: any) => {
                  reject({ tx: tx, err: err });
                }
              );
              //resolve(auditDtl);
            })
            .then(() => {
              for (var x = 0; x < auditDtl.length; x++) {
                let vesselName = '',
                  officialNo = '',
                  grt = '',
                  auditTypeDesc = '',
                  auditSubTypeDesc = '',
                  auditStatusDesc = '';

                let auditDetail = auditDtl[x];
                //tx for vesselName
                this.database
                  .transaction((tx: any) => {
                    tx.executeSql(
                      'SELECT VESSEL_NAME,OFFICIAL_NO,GRT FROM MA_VESSEL WHERE VESSEL_IMO_NO=? ',
                      [auditDetail.VESSEL_IMO_NO],
                      // tx.executeSql("SELECT * FROM MA_AUDIT_TYPE ", [],
                      (tx: any, vesselNameRes: any) => {
                        if (vesselNameRes.rows.length > 0) {
                          vesselName = vesselNameRes.rows.item(0).VESSEL_NAME;
                          //** Jagan -  */
                          officialNo = vesselNameRes.rows.item(0).OFFICIAL_NO;
                          grt = vesselNameRes.rows.item(0).GRT;
                          //** */
                          console.log('vesselName', vesselName);
                        }
                        //vesselName = vesselNameRes.rows.item.length > 0 ? vesselNameRes.rows.item : '';
                      },
                      (tx: any, err: any) => {
                        reject({ tx: tx, err: err });
                      }
                    );
                  })
                  .then(() => {
                    //tx for auditTypeDesc
                    this.database
                      .transaction((tx: any) => {
                        tx.executeSql(
                          'SELECT AUDIT_TYPE_DESC FROM MA_AUDIT_TYPE WHERE AUDIT_TYPE_ID=? ',
                          [auditDetail.AUDIT_TYPE_ID],
                          (tx: any, auditTypeDescRes: any) => {
                            if (auditTypeDescRes.rows.length > 0) {
                              auditTypeDesc =
                                auditTypeDescRes.rows.item(0).AUDIT_TYPE_DESC;
                              console.log(auditTypeDescRes.rows.item(0));
                            }
                          },
                          (tx: any, err: any) => {
                            reject({ tx: tx, err: err });
                          }
                        );
                      })
                      .then(() => {
                        //tx for auditSubTypeDesc
                        this.database
                          .transaction((tx: any) => {
                            tx.executeSql(
                              'SELECT AUDIT_SUBTYPE_DESC FROM MA_AUDIT_SUBTYPE WHERE AUDIT_TYPE_ID=? AND AUDIT_SUBTYPE_ID=?',
                              [
                                auditDetail.AUDIT_TYPE_ID,
                                auditDetail.AUDIT_SUB_TYPE_ID,
                              ],
                              (tx: any, auditSubTypeDescRes: any) => {
                                if (auditSubTypeDescRes.rows.length > 0) {
                                  auditSubTypeDesc =
                                    auditSubTypeDescRes.rows.item(
                                      0
                                    ).AUDIT_SUBTYPE_DESC;
                                }
                              },
                              (tx: any, err: any) => {
                                reject({ tx: tx, err: err });
                              }
                            );
                          })
                          .then(() => {
                            //tx for auditStatus
                            this.database
                              .transaction((tx: any) => {
                                tx.executeSql(
                                  'SELECT AUDIT_STATUS_DESC FROM MA_AUDIT_STATUS WHERE AUDIT_TYPE_ID=? AND AUDIT_STATUS_ID=?',
                                  [
                                    auditDetail.AUDIT_TYPE_ID,
                                    auditDetail.AUDIT_STATUS_ID,
                                  ],
                                  (tx: any, auditStatusRes: any) => {
                                    if (auditStatusRes.rows.length > 0) {
                                      auditStatusDesc =
                                        auditStatusRes.rows.item(
                                          0
                                        ).AUDIT_STATUS_DESC;
                                    }
                                  },
                                  (tx: any, err: any) => {
                                    reject({ tx: tx, err: err });
                                  }
                                );
                              })
                              .then(() => {
                                auditItems.push({
                                  auditSeqNo: auditDetail.AUDIT_SEQ_NO,
                                  companyId: auditDetail.COMPANY_ID,
                                  auditStatusId: auditDetail.AUDIT_STATUS_ID,
                                  auditStatusDesc: auditStatusDesc,
                                  vesselImoNo: auditDetail.VESSEL_IMO_NO,
                                  vesselName: vesselName,
                                  officialNo: officialNo,
                                  grt: grt,
                                  certificateNo: auditDetail.CERTIFICATE_NO,
                                  auditTypeId: auditDetail.AUDIT_TYPE_ID,
                                  auditTypeDesc: auditTypeDesc,
                                  auditSubTypeId: auditDetail.AUDIT_SUB_TYPE_ID,
                                  audSubTypeDesc: auditSubTypeDesc,
                                  companyImoNo: auditDetail.COMPANY_IMO_NO,
                                  certExpireDate:
                                    auditDetail.AUDIT_TYPE_ID ==
                                      this.appConstant.DMLC_TYPE_ID ? '--' : auditDetail.CERT_EXPIRY_DATE,
                                  auditDate: auditDetail.AUDIT_DATE,
                                  certIssueDate:
                                    auditDetail.AUDIT_TYPE_ID == this.appConstant.DMLC_TYPE_ID
                                      ? auditDetail.CLOSE_MEETING_DATE.slice(0, 10) : auditDetail.CERT_ISSUED_DATE,  //Added by sudharsan for Jira ID-503
                                });
                                console.log(auditItems);
                                //resolve(auditItems);
                              });
                          });
                      });
                  });
              }
              resolve(auditItems);
            });
        });
    });
  }
  //added by lokesh for jira_id(917)
  public getAvailAuditRecordsOfCurrentUserName(userName) {
    return new Promise<Object>((resolve, reject) => {
      let auditDtl: any = [];
      let auditItems: any = [],
        auditorSeqNos = '';

      //tx for seq no's
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM AUDIT_AUDITOR_DETAILS WHERE AUD_OBS_ID=?',
            [userName],
            (tx: any, res: any) => {
              if (res.rows.length > 0) {
                for (var x = 0; x < res.rows.length; x++) {
                  if (res.rows.item(x).AUDIT_SEQ_NO.slice(-2) == ".0") {  //Added by sudharsan for JIRA-ID- 509
                    auditorSeqNos += "'" + res.rows.item(x).AUDIT_SEQ_NO.slice(0, -2) + "',";
                  }
                  else {
                    auditorSeqNos += "'" + res.rows.item(x).AUDIT_SEQ_NO + "',";
                  }
                }
                console.log('auditorSeqNos', auditorSeqNos);
                auditorSeqNos = auditorSeqNos.slice(0, -1);
              }
            },
            (tx: any, err: any) => {
              reject({ tx: tx, err: err });
            }
          );
        })
        .then(() => {
          this.database
            .transaction((tx: any) => {
              tx.executeSql(
                'SELECT * FROM AUDIT_DETAILS AD WHERE AD.ALLOW_NEXT == 0 AND AD.LOCK_STATUS <> 3 AND AD.REVIEW_STATUS==0 AND AD.AUDIT_SEQ_NO IN (' +  //changed by archana for jira ID-Mobile-748,MOBILE-861
                auditorSeqNos +
                ') AND AD.COMPANY_ID = 2 ORDER BY Date(AD.AUDIT_DATE) ',
              [],
                (tx: any, auditDtlRes: any) => {
                  if (auditDtlRes.rows.length > 0) {
                    for (var x = 0; x < auditDtlRes.rows.length; x++) {
                      auditDtl.push(auditDtlRes.rows.item(x));
                      console.log('auditDtl', auditDtl);
                    }
                  }
                },
                (tx: any, err: any) => {
                  reject({ tx: tx, err: err });
                }
              );
              //resolve(auditDtl);
            })
            .then(() => {
              for (var x = 0; x < auditDtl.length; x++) {
                let auditDetail = auditDtl[x];
                auditItems.push(auditDetail)
              }
              resolve(auditItems);
            });
        });
    });
  }

  getVesselCompanyData(vesselImoNo) {
    let vesselData: any = [];
    return new Promise<Object>((resolve, reject) => {
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM MA_VESSEL WHERE VESSEL_IMO_NO=?',
            [vesselImoNo],
            (tx: any, vesselDataRes: any) => {
              console.log(
                'vesselDataRes checking...',
                vesselDataRes.rows.item(0)
              );

              if (vesselDataRes.rows.length > 0) {
                vesselData.push({
                  vesselName: vesselDataRes.rows.item(0).VESSEL_NAME,
                  vesselType: vesselDataRes.rows.item(0).VESSEL_TYPE_ID,
                  officialNo: vesselDataRes.rows.item(0).OFFICIAL_NO,
                  vesselImoNo: vesselDataRes.rows.item(0).VESSEL_IMO_NO,
                  grt: vesselDataRes.rows.item(0).GRT,
                  companyImoNo: vesselDataRes.rows.item(0).COMPANY_IMO_NO,
                  dateOfReg: vesselDataRes.rows.item(0).DATE_OF_REGISTRY,
                  portOfReg: vesselDataRes.rows.item(0).PORT_OF_REGISTRY,

                  vesselPk: vesselDataRes.rows.item(0).VESSEL_PK,
                  vesselUk: vesselDataRes.rows.item(0).VESSEL_UK,
                  vesselId: vesselDataRes.rows.item(0).VESSEL_ID,
                  classSociety: vesselDataRes.rows.item(0).CLASS_SOCIETY,
                  callSign: vesselDataRes.rows.item(0).CALL_SIGN,
                  vesselStatus: vesselDataRes.rows.item(0).VESSEL_STATUS,
                  /*  "docTypeNo":'',
                                 "docIssuer":'',
                                 "docExpiry":'',
                                 "nameAddressOfComp":'', */
                });
                //console.log("vesselDataRes.rows.", vesselDataRes.rows.item(0));
                // resolve(vesselData);
              }
            },
            (tx: any, err: any) => {
              console.log('get vesselData, Operation failed.');
            }
          );
        })
        .then(() => {
          this.database.transaction((tx: any) => {
            console.log('vessel data, checking..', vesselData);
            let companyImo = vesselData[0].companyImoNo;
            tx.executeSql(
              'SELECT DOC_TYPE_NO,DOC_ISSUER,DOC_EXPIRY,VESSEL_COMPANY_NAME,COMPANY_ADDRESS FROM MA_VESSEL_COMPANY WHERE COMPANY_IMO_NO=?',
              [companyImo],
              (tx: any, res: any) => {
                if (res.rows.length > 0) {
                  //                                console.log('SELECT * FROM AUDIT_DETAILS', res.rows.item(0));
                  vesselData[0].docTypeNo = res.rows.item(0).DOC_TYPE_NO;
                  vesselData[0].docIssuer = res.rows.item(0).DOC_ISSUER;
                  vesselData[0].docExpiry = res.rows.item(0).DOC_EXPIRY;
                  vesselData[0].companyName =
                    res.rows.item(0).VESSEL_COMPANY_NAME;
                  vesselData[0].companyAddress =
                    res.rows.item(0).COMPANY_ADDRESS;
                } else {
                  console.log(
                    '0 row/record found in the MA_VESSEL_COMPANY table '
                  );
                }

                resolve(vesselData);
              },
              (tx: any, err: any) => {
                reject({ tx: tx, err: err });
              }
            );
          });
        });
    });
  }

  getAuditdata(seqNo) {
    let auditData: any = [];
    let sspDetailsData = [];
    return new Promise<Object>((resolve, reject) => {
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT AUDIT_SEQ_NO,COMPANY_ID,AUDIT_REPORT_NO,AUDIT_DATE,AUDIT_PLACE,AUDIT_STATUS_ID,CERTIFICATE_ISSUED_ID,INTERNAL_AUDIT_DATE,' +
            'OPEN_MEETING_DATE,CLOSE_MEETING_DATE,AUDIT_SUMMARY_ID,LOCK_HOLDER,LOCK_STATUS,VESSEL_IMO_NO,CERTIFICATE_NO,' +
            'AUDIT_TYPE_ID,AUDIT_SUB_TYPE_ID,CERT_EXPIRY_DATE,CERT_ISSUED_DATE,DATE_INS,USER_INS,SCOPE,NARRATIVE_SUMMARY,MAX_STATUS_DATE_CAR, SEAL, TITLE, SIGNATURE, CREDIT_DATE, QID, DOC_TYPE_NUMBER, VESSEL_NAME , VESSEL_TYPE , VESSEL_ADDRESS , DOC_EXPIRY , DOC_ISSUER , DOC_TYPE_NO , CERTIFICATE_VERSION , OFFICIAL_NO FROM AUDIT_DETAILS WHERE AUDIT_SEQ_NO=?',
            [seqNo.toString()],             //changed by archana for jira ID-MOBILE-899
            (tx: any, auditDataRes: any) => {
              if (auditDataRes.rows.length > 0) {
                auditData.push({
                  auditSeqNo: auditDataRes.rows.item(0).AUDIT_SEQ_NO,
                  companyId: auditDataRes.rows.item(0).COMPANY_ID,
                  auditReportNo: auditDataRes.rows.item(0).AUDIT_REPORT_NO,
                  auditDate: auditDataRes.rows.item(0).AUDIT_DATE,
                  auditPlace: auditDataRes.rows.item(0).AUDIT_PLACE,
                  auditStatusId: auditDataRes.rows.item(0).AUDIT_STATUS_ID,
                  certIssuedId: auditDataRes.rows.item(0).CERTIFICATE_ISSUED_ID,
                  interalAuditDate:
                    auditDataRes.rows.item(0).INTERNAL_AUDIT_DATE,
                  openMeetingDate: auditDataRes.rows.item(0).OPEN_MEETING_DATE,
                  closeMeetingDate:
                    auditDataRes.rows.item(0).CLOSE_MEETING_DATE,
                  auditSummaryId: auditDataRes.rows.item(0).AUDIT_SUMMARY_ID,
                  lockHolder: auditDataRes.rows.item(0).LOCK_HOLDER,
                  lockStatus: auditDataRes.rows.item(0).LOCK_STATUS,
                  vesselImoNo: auditDataRes.rows.item(0).VESSEL_IMO_NO,
                  certificateNo: auditDataRes.rows.item(0).CERTIFICATE_NO,
                  auditTypeId: auditDataRes.rows.item(0).AUDIT_TYPE_ID,
                  auditSubTypeID: auditDataRes.rows.item(0).AUDIT_SUB_TYPE_ID,
                  certExpiryDate: auditDataRes.rows.item(0).CERT_EXPIRY_DATE,
                  certIssuedDate: auditDataRes.rows.item(0).CERT_ISSUED_DATE,
                  dateOfIns: auditDataRes.rows.item(0).DATE_INS,
                  scopeId: auditDataRes.rows.item(0).SCOPE,
                  narrativeSummary: auditDataRes.rows.item(0).NARRATIVE_SUMMARY,
                  sspDetailsData: '',
                  maxStatusDateCar:
                    auditDataRes.rows.item(0).MAX_STATUS_DATE_CAR,
                  seal: auditDataRes.rows.item(0).SEAL,
                  title: auditDataRes.rows.item(0).TITLE,
                  signature: auditDataRes.rows.item(0).SIGNATURE,
                  creditDate: auditDataRes.rows.item(0).CREDIT_DATE,
                  qid: auditDataRes.rows.item(0).QID,
                  docTypeNumber: auditDataRes.rows.item(0).DOC_TYPE_NUMBER,
                  userIns: auditDataRes.rows.item(0).USER_INS,
                  vesselNameAud: auditDataRes.rows.item(0).VESSEL_NAME,
                  vesselTypeAud: auditDataRes.rows.item(0).VESSEL_TYPE,
                  docExpiryAud: auditDataRes.rows.item(0).DOC_EXPIRY,
                  docIssuerAud: auditDataRes.rows.item(0).DOC_ISSUER,
                  companyAddressAud: auditDataRes.rows.item(0).VESSEL_ADDRESS,
                  officialNoAud: auditDataRes.rows.item(0).OFFICIAL_NO,
                  docTypeNoAud: auditDataRes.rows.item(0).DOC_TYPE_NO,
                  certificateVer: auditDataRes.rows.item(0).CERTIFICATE_VERSION,
                  reviewStatus: auditDataRes.rows.item(0).REVIEW_STATUS,
                  //   'auditSeqNo': auditDataRes.rows.item(0).AUDIT_SEQ_NO,
                });
              }
            },
            (tx: any, err: any) => {
              console.log(
                "get audit data's of current audit, Operation failed."
              );
            }
          );
        })
        .then(() => {
          if (auditData[0].auditTypeId == 1001) {
            console.log('auditData', auditData);
            resolve(auditData);
          } else {
            this.database
              .transaction((tx: any) => {
                tx.executeSql(
                  'SELECT * FROM SSP_REVIEW_DATA WHERE AUDIT_SEQ_NO=?',
                  [seqNo],
                  (tx: any, sspDtl: any) => {
                    if (sspDtl.rows.length > 0) {
                      console.log('ssp Data :', sspDtl.rows.item(0));
                      auditData[0].sspDetailsData = {
                        sspReportNo: sspDtl.rows.item(0).SSP_REPORT_NO,
                        sspLeadName: sspDtl.rows.item(0).SSP_LEAD_NAME,
                        sspRevisionNo: sspDtl.rows.item(0).SSP_REVISION_NO,
                        sspDmlcAuditSeqNo:
                          sspDtl.rows.item(0).SSP_DMLC_AUDIT_SEQ_NO,
                        dueDate: sspDtl.rows.item(0).DUE_DATE,
                        vesselCompanyAddress:
                          sspDtl.rows.item(0).VESSEL_COMPANY_ADDRESS,
                        vesselCompanyName:
                          sspDtl.rows.item(0).VESSEL_COMPANY_NAME,
                        officialNo: sspDtl.rows.item(0).OFFICIAL_NO,
                        dmlcIssuePlace: sspDtl.rows.item(0).DMLC_AUDIT_PLACE,
                        dmlcIssueDate: sspDtl.rows.item(0).DMLC_ISSUED_DATE,
                        ltrStatus: sspDtl.rows.item(0).LTRSTATUS,
                      };
                    } else {
                      console.log('ssp details empty');
                    }
                  }
                );
              })
              .then(() => {
                console.log('auditData', auditData);
                resolve(auditData);
              });
          }
        });
      //last then
    });
  }

  getPreviousAuditdata(vesselImoNo, auditStatusId, auditTypeId) {
    let auditData: any = [];
    let sspDetailsData = [];
    return new Promise<Object>((resolve, reject) => {
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM AUDIT_DETAILS WHERE VESSEL_IMO_NO =? AND AUDIT_STATUS_ID != ? AND AUDIT_TYPE_ID = ? ORDER BY AUDIT_SEQ_NO DESC',
            [vesselImoNo, auditStatusId, auditTypeId],
            (tx: any, auditDataRes: any) => {
              if (auditDataRes.rows.length > 0) {
                console.log("before assigining auditdetails", auditDataRes.rows);
                for (var x = 0; x < auditDataRes.rows.length; x++) {
                  auditData.push({
                    auditSeqNo: auditDataRes.rows.item(x).AUDIT_SEQ_NO,
                    companyId: auditDataRes.rows.item(x).COMPANY_ID,
                    auditReportNo: auditDataRes.rows.item(x).AUDIT_REPORT_NO,
                    auditDate: auditDataRes.rows.item(x).AUDIT_DATE,
                    auditPlace: auditDataRes.rows.item(x).AUDIT_PLACE,
                    auditStatusId: auditDataRes.rows.item(x).AUDIT_STATUS_ID,
                    certIssuedId:
                      auditDataRes.rows.item(x).CERTIFICATE_ISSUED_ID,
                    interalAuditDate:
                      auditDataRes.rows.item(x).INTERNAL_AUDIT_DATE,
                    openMeetingDate:
                      auditDataRes.rows.item(x).OPEN_MEETING_DATE,
                    closeMeetingDate:
                      auditDataRes.rows.item(x).CLOSE_MEETING_DATE,
                    auditSummaryId: auditDataRes.rows.item(x).AUDIT_SUMMARY_ID,
                    lockHolder: auditDataRes.rows.item(x).LOCK_HOLDER,
                    lockStatus: auditDataRes.rows.item(x).LOCK_STATUS,
                    vesselImoNo: auditDataRes.rows.item(x).VESSEL_IMO_NO,
                    certificateNo: auditDataRes.rows.item(x).CERTIFICATE_NO,
                    auditTypeId: auditDataRes.rows.item(x).AUDIT_TYPE_ID,
                    auditSubTypeID: auditDataRes.rows.item(x).AUDIT_SUB_TYPE_ID,
                    certExpiryDate: auditDataRes.rows.item(x).CERT_EXPIRY_DATE,
                    certIssuedDate: auditDataRes.rows.item(x).CERT_ISSUED_DATE,
                    dateOfIns: auditDataRes.rows.item(x).DATE_INS,
                    scopeId: auditDataRes.rows.item(x).SCOPE,
                    narrativeSummary:
                      auditDataRes.rows.item(x).NARRATIVE_SUMMARY,
                    sspDetailsData: '',
                    maxStatusDateCar:
                      auditDataRes.rows.item(x).MAX_STATUS_DATE_CAR,
                    seal: auditDataRes.rows.item(x).SEAL,
                    title: auditDataRes.rows.item(x).TITLE,
                    signature: auditDataRes.rows.item(x).SIGNATURE,
                    creditDate: auditDataRes.rows.item(0).CREDIT_DATE,
                    qid: auditDataRes.rows.item(x).QID,
                    docTypeNumber: auditDataRes.rows.item(x).DOC_TYPE_NUMBER,
                    userIns: auditDataRes.rows.item(x).USER_INS,
                    vesselNameAud: auditDataRes.rows.item(x).VESSEL_NAME,
                    vesselTypeAud: auditDataRes.rows.item(x).VESSEL_TYPE,
                    docExpiryAud: auditDataRes.rows.item(x).DOC_EXPIRY,
                    docIssuerAud: auditDataRes.rows.item(x).DOC_ISSUER,
                    companyAddressAud: auditDataRes.rows.item(x).VESSEL_ADDRESS,
                    officialNoAud: auditDataRes.rows.item(x).OFFICIAL_NO,
                    docTypeNoAud: auditDataRes.rows.item(x).DOC_TYPE_NO,
                    certificateVer:
                      auditDataRes.rows.item(x).CERTIFICATE_VERSION,
                      reviewStatus: auditDataRes.rows.item(x).REVIEW_STATUS,
                  });
                  tx.executeSql(
                    'SELECT FIRST_NAME,LAST_NAME,SEQUENCE_NUMBER FROM MA_USERS WHERE USER_ID=?',
                    [auditDataRes.rows.item(x).USER_INS], //*/,FIRST_NAME,LAST_NAME,SEQUENCE_NUMBER
                    (tx: any, res: any) => {
                      if (res.rows.length > 0) {
                        auditData[0].userName =
                          res.rows.item(0).FIRST_NAME +
                          ' ' +
                          res.rows.item(0).LAST_NAME;
                        console.log("user name : ", res.rows.item(0).FIRST_NAME, res.rows.item(0).LAST_NAME)
                      }
                    },
                    (tx: any, err: any) => {
                      console.log('get vesselData, Operation failed.');
                    }
                  );
                }
                console.log('auditDetails', auditData);
              }
            },
            (tx: any, err: any) => {
              console.log(
                "get audit data's of current audit, Operation failed."
              );
            }
          );
        })
        .then(() => {
          console.log('auditData', auditData);

          resolve(auditData);
        }); //last then
    });
  }

  getAuditAuditorData(seqNo) {
    let auditorDtls: any = [];
    let auditAuditors = [];
    return new Promise<Object>((resolve, reject) => {
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM AUDIT_AUDITOR_DETAILS WHERE AUDIT_SEQ_NO=? ORDER BY AUD_OBS_LEAD DESC,AUD_OBS_TYPE_ID ASC,AUDITOR_NAME COLLATE NOCASE ASC',
            [seqNo],
            (tx: any, auditAuditorDataRes: any) => {
              if (auditAuditorDataRes.rows.length > 0) {
                for (var x = 0; x < auditAuditorDataRes.rows.length; x++) {
                  auditorDtls.push(auditAuditorDataRes.rows.item(x));
                }
                console.log('auditorDtls', auditorDtls);
              }
            },
            (tx: any, err: any) => {
              console.log("get auditor's of current audit, Operation failed.");
            }
          );
        })
        .then(() => {
          auditorDtls.forEach((a, x) => {
            this.database
              .transaction((tx: any) => {
                tx.executeSql(
                  'SELECT FIRST_NAME,LAST_NAME,SEQUENCE_NUMBER FROM MA_USERS WHERE USER_ID=?',
                  [a.AUD_OBS_ID], //*/,FIRST_NAME,LAST_NAME,SEQUENCE_NUMBER
                  (tx: any, res: any) => {
                    if (res.rows.length > 0) {
                      auditAuditors.push({
                        audObsTypeId: a.AUD_OBS_TYPE_ID,
                        //"audObsTypeDesc": audObsTypeDesc,
                        userId: res.rows.item(0).SEQUENCE_NUMBER,
                        auditorName:
                          res.rows.item(0).FIRST_NAME +
                          ' ' +
                          res.rows.item(0).LAST_NAME,
                        audSignature: a.AUD_SIGNATURE,
                        audSignatureDate: a.AUD_SIGNATURE_DATE,
                        audObsLead: a.AUD_OBS_LEAD,
                        companyId: a.COMPANY_ID,
                        check: false,
                        signerName: a.SIGNER_NAME ? a.SIGNER_NAME : '',
                      });
                    }
                  },
                  (tx: any, err: any) => {
                    console.log('get vesselData, Operation failed.');
                  }
                );
              })
              .then(() => {
                this.database.transaction((tx: any) => {
                  tx.executeSql(
                    'SELECT AUDIT_ROLE_DESC FROM MA_AUDIT_ROLES WHERE AUDIT_ROLE_ID=?',
                    [a.AUD_OBS_TYPE_ID], //
                    (tx: any, auditorRoleRes: any) => {
                      if (auditorRoleRes.rows.length > 0) {
                        auditAuditors[x].auditRoleDesc =
                          auditorRoleRes.rows.item(0).AUDIT_ROLE_DESC;
                      }
                      if (x == auditAuditors.length - 1) {
                        resolve(auditAuditors);
                      }
                    },
                    (tx: any, err: any) => {
                      console.log('get vesselData, Operation failed.');
                    }
                  );
                });
              });
          });
        });
      //last then
    });
  }

  getAuditReportAttachmentData(auditTypeId, auditSubTypeId, seqNo) {
    let maAttachmentTypes = [];
    let attachmentsOfTheCurrentAudit = [];
    let attachments = [];

    return new Promise<Object>((resolve, reject) => {
      /*  this.database.transaction((tx: any) => {
         tx.executeSql(
           "SELECT * FROM MA_ATTACHMENT_TYPES WHERE AUDIT_TYPE_ID=? AND AUDIT_SUB_TYPE_ID=? ",
           [auditTypeId, auditSubTypeId],
           (tx: any, maAttachmentResForCurAudit: any) => {
             console.log(maAttachmentResForCurAudit.rows.length);
             if (maAttachmentResForCurAudit.rows.length > 0) {
               for (var x = 0; x < maAttachmentResForCurAudit.rows.length; x++) {
                 let a = maAttachmentResForCurAudit.rows.item(x);
                 console.log('a', a);
                 maAttachmentTypes.push({
                   seqNo: 1,
                   fileName: '',
                   attachmentTypeId: a.ATTACHMENT_TYPE_ID,
                   attachmentTypeDesc: a.ATTACHMENTT_TYPE_DESC,
                   companyId: a.COMPANY_ID,
                   commants: a.COMMENTS,
                   otherType: a.OTHER_TYPE,
                   mandatory: a.MANDATORY,
                   attchTypeDescAudit: a.ATTACHMENTT_TYPE_DESC
                 });
               }
             }
           })
       }) */ //.then(() => {
      this.database.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM AUDIT_REPORT_ATTACHMENTS WHERE AUDIT_SEQ_NO=? ',
          [seqNo],
          (tx: any, attachmentsOfCurAudit: any) => {
            if (attachmentsOfCurAudit.rows.length > 0) {
              for (var x = 0; x < attachmentsOfCurAudit.rows.length; x++) {
                let b = attachmentsOfCurAudit.rows.item(x);
                console.log('b', b);
                attachmentsOfTheCurrentAudit.push({
                  seqNo: b.SEQ_NO,
                  fileName: b.FILE_NAME,
                  attachmentTypeId: b.ATTACHMENT_TYPE_ID,
                  attachmentTypeDesc: b.ATTACHMENTT_TYPE_DESC,
                  companyId: b.COMPANY_ID,
                  userIns: b.USER_INS,
                  dataOfIns: b.DATE_INS,
                  commants: b.COMMENTS,
                  otherType: b.OTHER_TYPE,
                  mandatory: b.MANDATORY,
                  attchTypeDescAudit: b.ATTACHMENTT_TYPE_DESC,
                });
              }
              resolve(attachmentsOfTheCurrentAudit);
            } else {
              resolve(attachmentsOfTheCurrentAudit);
            }
          },
          (err) => {
            console.log(
              'SELECT * FROM AUDIT_REPORT_ATTACHMENTS WHERE AUDIT_SEQ_NO, failed'
            );
          }
        );
      }); //.then(() => {
      /* if (attachmentsOfTheCurrentAudit.length > 0) {
         maAttachmentTypes.forEach((a) => {
          attachmentsOfTheCurrentAudit.forEach(b => {
            if (b.attachmentTypeId === a.attachmentTypeId) {
              a.seqNo = b.seqNo ? b.seqNo : '';
              a.fileName = b.fileName ? b.fileName : '';
              a.otherType = b.otherType ? b.otherType : '';
              a.commants = b.commants ? b.commants : '';
              a.userIns = b.userIns ? b.userIns : '';
              a.dataOfIns = b.dataOfIns ? b.dataOfIns : '';
            }
          });
        }) 
        attachmentsOfTheCurrentAudit.forEach(b => {
          maAttachmentTypes.forEach((a) => {

          })
        })
        resolve(maAttachmentTypes);
      } else {
        resolve([]);
      } */
    });
    ///*  */ })
    //})
  }

  getAuditReportData(seqNo) {
    let attachments = [];
    seqNo = seqNo + '';
    console.log('seqNo', seqNo);
    return new Promise<Object>((resolve, reject) => {
      this.database.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM AUDIT_REPORT_ATTACHMENTS WHERE AUDIT_SEQ_NO=?',
          [seqNo],
          (tx: any, auditAttachmentRes: any) => {
            console.log(
              'auditAttachmentRes.rows.length',
              auditAttachmentRes.rows.length
            );
            if (auditAttachmentRes.rows.length > 0) {
              for (var x = 0; x < auditAttachmentRes.rows.length; x++) {
                let a = auditAttachmentRes.rows.item(x);
                console.log('a', a);
                tx.executeSql(
                  'SELECT ATTACHMENTT_TYPE_DESC FROM MA_ATTACHMENT_TYPES WHERE ATTACHMENT_TYPE_ID=? AND AUDIT_TYPE_ID=(SELECT AUDIT_TYPE_ID FROM AUDIT_DETAILS WHERE AUDIT_SEQ_NO=?)',
                  [a.ATTACHMENT_TYPE_ID, seqNo],
                  (tx: any, auditAttacWithDescRes: any) => {
                    if (auditAttacWithDescRes.rows.length > 0) {
                      attachments.push({
                        seqNo: a.SEQ_NO,
                        fileName: a.FILE_NAME,
                        attachmentTypeId: a.ATTACHMENT_TYPE_ID,
                        attachmentTypeDesc:
                          auditAttacWithDescRes.rows.item(0)
                            .ATTACHMENTT_TYPE_DESC,
                        companyId: a.COMPANY_ID,
                        userIns: a.USER_INS,
                        dataOfIns: a.DATE_INS,
                        commants: a.COMMENTS,
                        otherType: a.OTHER_TYPE,
                        mandatory: a.MANDATORY,
                        attchTypeDescAudit: a.ATTACHMENTT_TYPE_DESC,
                      });
                    }
                  },
                  (tx: any, err: any) => {
                    console.log(
                      "get auditor's of current audit, Operation failed.",
                      err
                    );
                  }
                );
              }
              resolve(attachments);
              console.log('auditAttachments', attachments);
            } else {
              console.log('no auditAttachments found');
              resolve(attachments);
            }
          },
          (tx: any, err: any) => {
            console.log(
              "get audit report Attachments's of current audit, Operation failed."
            );
          }
        );
      });
    });
  }

  getMasterData(auditTypeId) {
    let auditType = [],
      auditStatus = [],
      certIssued = [],
      auditSummary = [],
      port = [];

    return new Promise<Object>((resolve, reject) => {
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM MA_AUDIT_SUBTYPE WHERE AUDIT_TYPE_ID=?',
            [auditTypeId],
            (tx: any, auditTypeRes: any) => {
              if (auditTypeRes.rows.length > 0) {
                for (var x = 0; x < auditTypeRes.rows.length; x++) {
                  auditType.push({
                    auditTypeId: auditTypeRes.rows.item(x).AUDIT_TYPE_ID,
                    auditSubtypeId: auditTypeRes.rows.item(x).AUDIT_SUBTYPE_ID,
                    auditSubtypeDesc:
                      auditTypeRes.rows.item(x).AUDIT_SUBTYPE_DESC,
                    companyId: auditTypeRes.rows.item(x).COMPANY_ID,
                  });
                }
                /* auditTypeRes.forEach(a => {
                                
                            }); */
              }
            },
            (tx: any, err: any) => {
              console.log(
                'get auditTypes for current audit, Operation failed.'
              );
            }
          );
        })
        .then(() => {
          this.database
            .transaction((tx: any) => {
              tx.executeSql(
                'SELECT * FROM MA_AUDIT_STATUS WHERE AUDIT_TYPE_ID=?',
                [auditTypeId],
                (tx: any, auditStatusRes: any) => {
                  console.log(auditStatusRes);
                  if (auditStatusRes.rows.length > 0) {
                    for (var x = 0; x < auditStatusRes.rows.length; x++) {
                      auditStatus.push({
                        auditTypeId: auditStatusRes.rows.item(x).AUDIT_TYPE_ID,
                        auditStatusId:
                          auditStatusRes.rows.item(x).AUDIT_STATUS_ID,
                        auditStatusDesc:
                          auditStatusRes.rows.item(x).AUDIT_STATUS_DESC,
                        companyId: auditStatusRes.rows.item(x).COMPANY_ID,
                      });
                    }
                  }
                },
                (tx: any, err: any) => {
                  console.log(
                    'get auditStatus for current audit, Operation failed.'
                  );
                }
              );
            })
            .then(() => {
              this.database
                .transaction((tx: any) => {
                  tx.executeSql(
                    'SELECT * FROM MA_CERTIFICATE_ISSUED WHERE AUDIT_TYPE_ID=?',
                    [auditTypeId],
                    (tx: any, certIssuedRes: any) => {
                      if (certIssuedRes.rows.length > 0) {
                        for (var x = 0; x < certIssuedRes.rows.length; x++) {
                          certIssued.push({
                            auditTypeId:
                              certIssuedRes.rows.item(x).AUDIT_TYPE_ID,
                            certificateIssueId:
                              certIssuedRes.rows.item(x).CERTIFICATE_ISSUE_ID,
                            certificateIssueDesc:
                              certIssuedRes.rows.item(x).CERTIFICATE_ISSUE_DESC,
                            companyId: certIssuedRes.rows.item(x).COMPANY_ID,
                          });
                        }
                      }
                    },
                    (tx: any, err: any) => {
                      console.log(
                        'get certificate issued data for current audit, Operation failed.'
                      );
                    }
                  );
                })
                .then(() => {
                  this.database.transaction((tx: any) => {
                    tx.executeSql(
                      'SELECT * FROM MA_AUDIT_SUMMARY WHERE AUDIT_TYPE_ID=?',
                      [auditTypeId],
                      (tx: any, auditSummaryRes: any) => {
                        if (auditSummaryRes.rows.length > 0) {
                          for (
                            var x = 0;
                            x < auditSummaryRes.rows.length;
                            x++
                          ) {
                            auditSummary.push({
                              auditTypeId:
                                auditSummaryRes.rows.item(x).AUDIT_TYPE_ID,
                              audSummaryId:
                                auditSummaryRes.rows.item(x).AUD_SUMMARY_ID,
                              audSummaryDesc:
                                auditSummaryRes.rows.item(x).AUD_SUMMARY_DESC,
                              companyId:
                                auditSummaryRes.rows.item(x).COMPANY_ID,
                            });
                          }
                        }
                      },
                      (tx: any, err: any) => {
                        console.log(
                          'get audit Summary data of current audit, Operation failed.'
                        );
                      }
                    );
                  });
                })
                .then(() => {
                  this.database
                    .transaction((tx: any) => {
                      tx.executeSql(
                        'SELECT * from MA_PORT',
                        [],
                        (tx: any, portRes: any) => {
                          if (portRes.rows.length > 0) {
                            for (var x = 0; x < portRes.rows.length; x++) {
                              port.push({
                                portName: portRes.rows.item(x).PORT_NAME,
                                countryName: portRes.rows.item(x).COUNTRY_NAME,
                              });
                            }
                          }
                        },
                        (tx: any, err: any) => {
                          console.log(
                            'get all port data for auditPlace placeholder, Operation failed.'
                          );
                        }
                      );
                    })
                    .then(() => {
                      let result = {
                        auditType: auditType,
                        auditStatus: auditStatus,
                        certIssued: certIssued,
                        auditSummary: auditSummary,
                        port: port,
                      };
                      resolve(result);
                    });
                }); //
            });
        });
    });
  }

  getFindingsCategory(auditTypeId, findingNo) {
    let findingDescofTheGivenFindingNo;
    return new Promise<Object>((resolve, reject) => {
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT FINDINGS_CATEGORY_DESC FROM MA_FINDINGS_CATEGORY WHERE AUDIT_TYPE_ID=? AND FINDINGS_CATEGORY_ID=?',
            [auditTypeId, findingNo],
            (tx: any, findCatDesc: any) => {
              if (findCatDesc.rows.length > 0) {
                findingDescofTheGivenFindingNo =
                  findCatDesc.rows.item(0).FINDINGS_CATEGORY_DESC;
              }
            },
            (tx: any, err: any) => {
              console.log('SELECT * FROM AUDIT_DETAILS , Operation failed.');
            }
          );
        })
        .then(() => {
          resolve(findingDescofTheGivenFindingNo);
        });
    });
  }

  public getAuditDetailsReport(comId, seqNo) {
    let reportdata;
    return new Promise<Object>((resolve, reject) => {
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM AUDIT_DETAILS WHERE COMPANY_ID=? AND AUDIT_SEQ_NO=?',
            [comId, seqNo],
            (tx: any, auditDtl: any) => {
              if (auditDtl.rows.length > 0) {
                reportdata = {
                  auditSeqNo: auditDtl.rows.item(0).AUDIT_SEQ_NO,
                  companyId: auditDtl.rows.item(0).COMPANY_ID,
                  auditTypeId: auditDtl.rows.item(0).AUDIT_TYPE_ID,
                  vesselImoNo: auditDtl.rows.item(0).VESSEL_IMO_NO,
                  auditSubTypeId: auditDtl.rows.item(0).AUDIT_SUB_TYPE_ID,
                  certificateNo: auditDtl.rows.item(0).CERTIFICATE_NO,
                  auditDate: auditDtl.rows.item(0).AUDIT_DATE,
                  auditPlace: auditDtl.rows.item(0).AUDIT_PLACE,
                  companyImoNo: auditDtl.rows.item(0).COMPANY_IMO_NO,
                  companyDoc: auditDtl.rows.item(0).COMPANY_DOC,
                  docTypeNumber: '',
                  auditStatusId: auditDtl.rows.item(0).AUDIT_STATUS_ID,
                  auditReportNo: auditDtl.rows.item(0).AUDIT_REPORT_NO,
                  certIssueId: auditDtl.rows.item(0).CERTIFICATE_ISSUED_ID,
                  interalAuditDate: auditDtl.rows.item(0).INTERNAL_AUDIT_DATE,
                  certExpireDate: auditDtl.rows.item(0).CERT_EXPIRY_DATE,
                  certIssueDate: auditDtl.rows.item(0).CERT_ISSUED_DATE,
                  openMeetingDate: auditDtl.rows.item(0).OPEN_MEETING_DATE,
                  closeMeetingDate: auditDtl.rows.item(0).CLOSE_MEETING_DATE,
                  auditSummaryId: auditDtl.rows.item(0).AUDIT_SUMMARY_ID,
                  lockStatus: 0,
                  narrativeSummary: auditDtl.rows.item(0).NARRATIVE_SUMMARY,
                  userIns: auditDtl.rows.item(0).USER_INS,
                  dateIns: auditDtl.rows.item(0).DATE_INS,
                  lockHolder: '',
                  reviewStatus:  auditDtl.rows.item(0).REVIEW_STATUS ,
                  docFlag: auditDtl.rows.item(0).DOC_FLAG,

                  /* certificateVer: auditDtl.rows.item(0).DOC_FLAG,
                  grt: auditDtl.rows.item(0).DOC_FLAG,
                  allowNext: auditDtl.rows.item(0).DOC_FLAG,
                  makeFinal: auditDtl.rows.item(0).DOC_FLAG,
                  scope: auditDtl.rows.item(0).DOC_FLAG,
                  dateOfRegistry: auditDtl.rows.item(0).DOC_FLAG,
                  creditDate: auditDtl.rows.item(0).DOC_FLAG,
                  companyName: auditDtl.rows.item(0).DOC_FLAG,
                  companyAddress: auditDtl.rows.item(0).DOC_FLAG,
                  officialNo: auditDtl.rows.item(0).DOC_FLAG,
                  vesselName: auditDtl.rows.item(0).DOC_FLAG,
                  docIssuer: auditDtl.rows.item(0).DOC_FLAG,
                  docExpiry: auditDtl.rows.item(0).DOC_FLAG,
                  audSubTypeDesc: auditDtl.rows.item(0).DOC_FLAG,
                  audTypeDesc: auditDtl.rows.item(0).DOC_FLAG,
                  audCertIssueDesc: auditDtl.rows.item(0).DOC_FLAG,   
                  auditStatusDesc: auditDtl.rows.item(0).DOC_FLAG,
                  leadAuditorName: auditDtl.rows.item(0).DOC_FLAG,
                  leadAuditorId: auditDtl.rows.item(0).DOC_FLAG,
                  tcApprovalStatus: auditDtl.rows.item(0).DOC_FLAG,
                  vesselTypeName: auditDtl.rows.item(0).DOC_FLAG,
                  creditDateFromCyle: auditDtl.rows.item(0).DOC_FLAG 
                  officialId: auditDtl.rows.item(0).DOC_FLAG,
                  vesselId: auditDtl.rows.item(0).DOC_FLAG
                  */

                  endorseexpirydate: auditDtl.rows.item(0).ENDORSE_EXPIRY_DATE,
                  sspReviewDetail: [],
                  vesselNameAud: auditDtl.rows.item(0).VESSEL_NAME,
                  vesselTypeAud: auditDtl.rows.item(0).VESSEL_TYPE,
                  docExpiryAud: auditDtl.rows.item(0).DOC_EXPIRY,
                  docIssuerAud: auditDtl.rows.item(0).DOC_ISSUER,
                  companyAddressAud: auditDtl.rows.item(0).VESSEL_ADDRESS,
                  officialNoAud: auditDtl.rows.item(0).OFFICIAL_NO,
                  docTypeNoAud: auditDtl.rows.item(0).DOC_TYPE_NO,
                  certificateVer: auditDtl.rows.item(0).CERTIFICATE_VERSION,
                };
              }
            },
            (tx: any, err: any) => {
              console.log('SELECT * FROM AUDIT_DETAILS , Operation failed.');
            }
          );
        })
        .then(() => {
          if (reportdata.auditTypeId != 1001) {
            this.database.transaction((tx: any) => {
              tx.executeSql(
                'SELECT * FROM SSP_REVIEW_DATA WHERE AUDIT_SEQ_NO=?',
                [seqNo],
                (tx: any, sspReview: any) => {
                  console.log(sspReview.rows.item(0));
                  if (sspReview.rows.length > 0) {
                    reportdata.sspReviewDetail = {
                      sspReportNo: sspReview.rows.item(0).SSP_REPORT_NO,
                      sspLeadName: sspReview.rows.item(0).SSP_LEAD_NAME,
                      sspRevisionNo: sspReview.rows.item(0).SSP_REVISION_NO,
                      sspDmlcAuditSeqNo: sspReview.rows.item(0).AUDIT_SEQ_NO,
                      dueDate: sspReview.rows.item(0).DUE_DATE,
                      vesselCompanyAddress:
                        sspReview.rows.item(0).VESSEL_COMPANY_ADDRESS,
                      vesselCompanyName:
                        sspReview.rows.item(0).VESSEL_COMPANY_NAME,
                      officialNo: sspReview.rows.item(0).OFFICIAL_NO,
                      dmlcAuditPlace: sspReview.rows.item(0).DMLC_AUDIT_PLACE,
                      dmlcIssuedDate: sspReview.rows.item(0).DMLC_ISSUED_DATE,
                      ltrStatus: sspReview.rows.item(0).LTRSTATUS,
                    };
                  }
                },
                (tx: any, err: any) => {
                  console.log(
                    'SELECT * FROM AUDIT_FINDING_ATTACHMENTS, Operation failed.'
                  );
                  reject({ error: 'error getting report data' });
                }
              );
            });
          }
          resolve(reportdata);
        });
    });
  }

  public saveAuditDetailsData(data) {
    return new Promise<Object>((resolve, reject) => {
      console.log('saveAuditDetailsData auditObj', data);

      let vesselData = data.vesselData[0],
        auditData = data.auditDetails[0],
        summaryDetails = data.summaryDetails[0],
        narativeDetails = data.narativeDetails[0],
        saveFlag = true,
        saveUpdate = false,
        reportData = data.reportData;
      console.log(auditData.auditSeqNo);
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT COUNT(*) as COUNT FROM AUDIT_DETAILS WHERE AUDIT_SEQ_NO=?',
            [auditData.auditSeqNo],
            (tx: any, availRes: any) => {
              console.log(availRes.rows);
              if (availRes.rows.length > 0) {
                saveUpdate = true;
                console.log('saveUpdate=true');
              }
            },
            (tx: any, err: any) => {
              console.log(', Operation failed.');
            }
          );
        })
        .then(() => {
          if (saveUpdate) {
            this.database
              .executeSql(
                'UPDATE AUDIT_DETAILS SET ' +
                'CERTIFICATE_NO=?,' +
                'VESSEL_IMO_NO=?,' +
                'AUDIT_TYPE_ID=?,' +
                'AUDIT_SUB_TYPE_ID=?,' +
                'COMPANY_IMO_NO=?,' +
                'COMPANY_DOC=?,' +
                'CERT_EXPIRY_DATE=?,' +
                'CERT_ISSUED_DATE=?,' +
                'NARRATIVE_SUMMARY=?,' +
                'AUDIT_REPORT_NO=?,' +
                'AUDIT_DATE=?,' +
                'AUDIT_PLACE=?,' +
                'AUDIT_STATUS_ID=?,' +
                'CERTIFICATE_ISSUED_ID=?,' +
                'INTERNAL_AUDIT_DATE=?,' +
                'OPEN_MEETING_DATE=?,' +
                'CLOSE_MEETING_DATE=?,' +
                'AUDIT_SUMMARY_ID=?,' +
                'LOCK_STATUS=?' +
                // 'USER_INS=? ' +
                'WHERE AUDIT_SEQ_NO=? AND COMPANY_ID=?',
                [
                  auditData.certificateNo,
                  vesselData.vesselImoNo,
                  auditData.auditTypeId,
                  auditData.auditSubType,
                  vesselData.companyImoNo,
                  vesselData.docTypeNo,
                  auditData.expiryDate,
                  auditData.issueDate,
                  narativeDetails.narativeSummary,
                  auditData.auditReportNo,
                  auditData.auditDate,
                  auditData.auditPlace,
                  auditData.auditStatus,
                  auditData.certificateIssued,
                  auditData.interalAuditDate,
                  auditData.openMeetingDate,
                  auditData.closeMeetingDate,
                  summaryDetails.auditSummary,
                  auditData.lockStatus,

                  // auditData.lockHolder,      //changed by @Ramya for jira id - Mobile-665
                  auditData.auditSeqNo,
                  auditData.companyId,
                ]
              )
              .then((res) => {
                if (res) {
                  console.log('The AUDIT_DETAILS records updated');
                } else {
                  console.log('auditDetail updation failed.');
                }
              })
              .then(() => {
                this.database.executeSql(
                  'UPDATE  SSP_REVIEW_DATA SET ' +
                  'AUDIT_TYPE_ID=?,' +
                  'SSP_REPORT_NO=?,' +
                  'SSP_REVISION_NO=?,' +
                  'SSP_LEAD_NAME=?,' +
                  'VESSEL_COMPANY_ADDRESS=?,' +
                  'VESSEL_COMPANY_NAME=?,' +
                  'OFFICIAL_NO=?,' +
                  'LTRSTATUS=? ' +
                  'WHERE AUDIT_SEQ_NO=? AND COMPANY_ID=?',
                  [
                    auditData.auditTypeId,
                    auditData.sspDetails[0].sspReportNo ? auditData.sspDetails[0].sspReportNo.toString() : auditData.sspDetails[0].sspReportNo,      //modified by ramya for jira id-->mobile-485
                    auditData.sspDetails[0].sspRevisionNo,
                    auditData.sspDetails[0].sspAuditorName,
                    vesselData.companyAddOri,
                    vesselData.companyNameOri,
                    vesselData.officialNo,
                    auditData.sspDetails[0].ltrStatus,
                    auditData.auditSeqNo,
                    auditData.companyId,
                  ]
                );
              });
          }
        })
        .then(() => {
          try {
            this.database
              .executeSql(
                'DELETE FROM AUDIT_REPORT_ATTACHMENTS WHERE AUDIT_SEQ_NO=? AND COMPANY_ID=?',
                [auditData.auditSeqNo, auditData.companyId]
              )
              .then(() => {
                console.log('DELETE FROM AUDIT_REPORT_ATTACHMENTS Success');

                reportData.forEach((a, index) => {
                  console.log(a.dataOfIns);
                  this.database
                    .executeSql(
                      'INSERT INTO AUDIT_REPORT_ATTACHMENTS' +
                      '(SEQ_NO,' +
                      'AUDIT_SEQ_NO,' +
                      'FILE_NAME,' +
                      'ATTACHMENT_TYPE_ID,' +
                      'COMMENTS,' +
                      'OTHER_TYPE,' +
                      'COMPANY_ID,' +
                      'USER_INS,' +
                      'MANDATORY,' +
                      'ATTACHMENTT_TYPE_DESC,' +
                      'DATE_INS)' +
                      'VALUES(?,?,?,?,?, ?,?,?,?,?, ?)',
                      [
                        a.seqNo,
                        auditData.auditSeqNo,
                        a.fileName,
                        a.attachmentTypeId,
                        a.commants,
                        a.otherType,
                        auditData.companyId,
                        a.userIns,
                        a.mandatory ? a.mandatory : 0,
                        a.attachmentTypeDesc ? a.attachmentTypeDesc : '',
                        a.dataOfIns,
                      ]
                    )
                    .then((res) => {
                      console.log(res);
                    });
                });
                resolve({ data: 'success' });
              });
          } catch (error) {
            console.log('INSERT INTO AUDIT_REPORT_ATTACHMENTS Failed', error);
          }
        });
    });
  }

  public getCurrentFindingData(seqNo) {
    CurrentFinding.finding.length = 0;
    CurrentFinding.findingDetails.length = 0;
    CurrentFinding.findingAttachments.length = 0;
    // let finding = [], findingDetails = [], findingAttachments = [];

    // return new Promise<Object>((resolve, reject) => {
    this.database
      .transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM AUDIT_FINDINGS WHERE ORIG_SEQ_NO=? AND CUR_AUDIT_SEQ_NO=?',
          [seqNo, seqNo],
          (tx: any, find: any) => {
            if (!find.error) {
              for (var x = 0; x < find.rows.length; x++) {
                findingao.push(
                  new finding(
                    find.rows.item(x).CUR_AUDIT_SEQ_NO,
                    find.rows.item(x).ORIG_SEQ_NO,
                    find.rows.item(x).FINDING_NO,
                    find.rows.item(x).AUDIT_DATE,
                    find.rows.item(x).AUDIT_CODE,
                    find.rows.item(x).SERIAL_NO
                  )
                );
              }
              CurrentFinding.finding = findingao;
            }
          },
          (tx: any, err: any) => {
            console.log('SELECT * FROM AUDIT_FINDINGS, Operation failed.');
          }
        );
      })
      .then(() => {
        this.database.transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM AUDIT_FINDINGS_DETAILS WHERE CUR_AUDIT_SEQ_NO=? AND ORIG_SEQ_NO=?',
            [seqNo, seqNo],
            (tx: any, findDtl: any) => {
              if (!findDtl.error) {
                for (var x = 0; x < findDtl.rows.length; x++) {
                  findingDetailsao.push(
                    new findingDetails(
                      findDtl.rows.item(x).CUR_AUDIT_SEQ_NO,
                      findDtl.rows.item(x).ORIG_SEQ_NO,
                      findDtl.rows.item(x).FINDING_NO,
                      findDtl.rows.item(x).FINDING_SEQ_NO,
                      findDtl.rows.item(x).CATEGORY_ID,
                      findDtl.rows.item(x).STATUS_ID,
                      findDtl.rows.item(x).STATUS_DATE,
                      findDtl.rows.item(x).NEXT_ACTION_ID,
                      findDtl.rows.item(x).DUE_DATE,
                      findDtl.rows.item(x).DESCRIPTION
                    )
                  );
                }
                CurrentFinding.findingDetails = findingDetailsao;
              }
            },
            (tx: any, err: any) => {
              console.log(
                'SELECT * FROM AUDIT_FINDINGS_DETAILS, Operation failed.'
              );
            }
          );
        });
      })
      .then(() => {
        this.database.transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM AUDIT_FINDING_ATTACHMENTS WHERE CUR_AUDIT_SEQ_NO=? AND ORIG_SEQ_NO=?',
            [seqNo, seqNo],
            (tx: any, findAttach: any) => {
              if (!findAttach.error) {
                for (var x = 0; x < findAttach.rows.length; x++) {
                  findingAttachmentsao.push(
                    new findingAttachments(
                      findAttach.rows.item(x).CUR_AUDIT_SEQ_NO,
                      findAttach.rows.item(x).ORIG_SEQ_NO,
                      findAttach.rows.item(x).FINDING_NO,
                      findAttach.rows.item(x).FINDING_SEQ_NO,
                      findAttach.rows.item(x).FILE_SEQ_NO,
                      findAttach.rows.item(x).FILE_NAME,
                      findAttach.rows.item(x).FLAG
                    )
                  );
                }
                CurrentFinding.findingAttachments = findingAttachmentsao;
              }
            },
            (tx: any, err: any) => {
              console.log(
                'SELECT * FROM AUDIT_FINDING_ATTACHMENTS, Operation failed.'
              );
            }
          );
        });
      })
      .then(() => {
        console.log('current findings are fetched and stored globally..');
        console.log('CurrentFinding.finding', CurrentFinding.finding);
        console.log(
          'CurrentFinding.findingDetails',
          CurrentFinding.findingDetails
        );
        console.log(
          'CurrentFinding.findingAttachments',
          CurrentFinding.findingAttachments
        );
      });
    // console
    //  resolve(finding);
    // });
  }

  /**added by archana for jira-id MOBILE-599 start  */
  public getPrevFindingDataList(seqNo) {
    return new Promise<Object>((resolve, reject) => {
      var findings = [];
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM AUDIT_FINDINGS WHERE ORIG_SEQ_NO=? AND CUR_AUDIT_SEQ_NO=?',
            [seqNo, 0],
            (tx: any, find: any) => {
              if (!find.error) {
                for (var x = 0; x < find.rows.length; x++) {
                  console.log(find.rows.item(x));
                  findings.push({
                    currSeqNo: find.rows.item(x).CUR_AUDIT_SEQ_NO,
                    origSeqNo: find.rows.item(x).ORIG_SEQ_NO,
                    findingsNo: find.rows.item(x).FINDING_NO,
                    auditDate: find.rows.item(x).AUDIT_DATE,
                    auditCode: find.rows.item(x).AUDIT_CODE,
                    serialNo: find.rows.item(x).SERIAL_NO,
                    findingDtl: [],
                  });
                }
              }
            },
            (tx: any, err: any) => {
              console.log('SELECT * FROM AUDIT_FINDINGS, Operation failed.');
            }
          );
        })
        .then(() => {
          if (findings.length > 0) {
            findings.forEach((finding, i) => {
              console.log(
                'findings[' + i + '] from finding details',
                findings[i]
              );
              let findingsNo = finding.findingsNo;
              this.database
                .transaction((tx: any) => {
                  tx.executeSql(
                    'SELECT * FROM AUDIT_FINDINGS_DETAILS WHERE ORIG_SEQ_NO=? AND FINDING_NO=?',       //changed by archana for jira Id-MOBILE-765
                    [seqNo, findingsNo],
                    (tx: any, findDtl: any) => {
                      console.log("enter");

                      if (!findDtl.error) {
                        console.log(findDtl);

                        for (var x = 0; x < findDtl.rows.length; x++) {
                          findings[i].findingDtl.push({
                            currSeqNo: findDtl.rows.item(x).CUR_AUDIT_SEQ_NO,
                            ORIG_SEQ_NO: findDtl.rows.item(x).ORIG_SEQ_NO,
                            findingsNo: findDtl.rows.item(x).FINDING_NO,
                            findingSeqNo: findDtl.rows.item(x).FINDING_SEQ_NO,
                            categoryId: findDtl.rows.item(x).CATEGORY_ID,
                            statusId: findDtl.rows.item(x).STATUS_ID,
                            statusDate: findDtl.rows.item(x).STATUS_DATE,
                            nextActionId: findDtl.rows.item(x).NEXT_ACTION_ID,
                            dueDate: findDtl.rows.item(x).DUE_DATE,
                            description: findDtl.rows.item(x).DESCRIPTION,
                            updateDescription: findDtl.rows.item(x).UPDATE_DESCRIPTION,
                            updateFlag: findDtl.rows.item(x).UPDATE_FLAG,
                            checkboxUpdate: findDtl.rows.item(x).CHECKBOX_UPDATE,
                            auditPlace: findDtl.rows.item(x).AUDIT_PLACE,
                            findingRptAttachs: [],
                          });
                          if (
                            findDtl.rows.item(x).CATEGORY_ID ==
                            this.appConstant.OBS_FINDING_CATEGORY
                          ) {
                            findings[i].findingDtl[x].nextActionId = Number(
                              this.appConstant.NIL
                            );
                          }
                          if (x == findDtl.rows.length - 1) {
                            switch (findDtl.rows.item(x).STATUS_ID) {
                              case 1001:
                                findings[i].statusDesc = 'OPENED';
                                break;
                              case 1003:
                                findings[i].statusDesc = findings[i].serialNo.includes('MNC') ? 'DOWNGRADED':
                                                         findings[i].serialNo.includes('MF') ? 'DOWNGRADED  (COMPLIANCE RESTORED)':
                                                         findings[i].serialNo.includes('SD') ? 'DOWNGRADED (RECTIFIED)': '';                // added by archana for jira ID-MOBILE-902
                                break;
                              case 1005:
                                findings[i].statusDesc = 'COMPLIANCE RESTORED';//modifed by lokesh for jira_id(771)
                                break;
                              case 1006:
                                findings[i].statusDesc = 'PLAN ACCEPTED';//modifed by lokesh for jira_id(771)
                                break;
                              case 1008:
                                findings[i].statusDesc = 'VERIFIED CLOSED';//modifed by lokesh for jira_id(771)
                                break;
                              case 1010:
                                findings[i].statusDesc = 'NIL';
                                break;
                            }
                          }
                        }
                      }
                    },
                    (tx: any, err: any) => {
                      console.log(
                        'SELECT * FROM AUDIT_FINDINGS_DETAILS, Operation failed.'
                      );
                    }
                  );
                })
                .then(() => {
                  /*   console.log('findings[' + i + '] from finding attachments', findings[i]);
                  console.log('findings[' + i + '].findingDtl from finding attachments', findings[i].findingDtl); */
                  //findings.for
                  /* findings[i].findingDtl.forEach((findingDetail,j) => {
                  
                }); */
                  console.log(findings[i]);

                  findings[i].findingDtl.forEach((findDtl, j) => {
                    console.log('findDtl', findDtl);
                    var fa = findDtl;
                    var attachment = [];
                    this.database
                      .transaction((ty: any) => {
                        ty.executeSql(
                          'SELECT * FROM AUDIT_FINDING_ATTACHMENTS WHERE ORIG_SEQ_NO=? AND FINDING_NO=? AND FINDING_SEQ_NO=?',
                          [fa.ORIG_SEQ_NO, fa.findingsNo, fa.findingSeqNo],
                          (ty: any, findAttachData: any) => {
                            if (findAttachData.rows.length > 0) {
                              for (
                                var d = 0;
                                d < findAttachData.rows.length;
                                d++
                              ) {
                                attachment.push({
                                  /* "curSeqNo": findAttachData.rows.item(d).CUR_AUDIT_SEQ_NO,
                              "orgSeqNo": findAttachData.rows.item(d).ORIG_SEQ_NO,
                              "findingsNo": findAttachData.rows.item(d).FINDING_NO,
                              "findingsSeqNo": findAttachData.rows.item(d).FINDING_SEQ_NO,
                              "fileSeqNo": findAttachData.rows.item(d).FILE_SEQ_NO,
                              "fileName": findAttachData.rows.item(d).FILE_NAME,
                              "flag": findAttachData.rows.item(d).FLAG,
                              "companyId": findAttachData.rows.item(d).COMPANY_ID, */

                                  fileSeqNo:
                                    findAttachData.rows.item(d).FILE_SEQ_NO,
                                  findingNo:
                                    findAttachData.rows.item(d).FINDING_NO,
                                  findingSeqNo:
                                    findAttachData.rows.item(d).FINDING_SEQ_NO,
                                  origAuditSeqNo:
                                    findAttachData.rows.item(d).ORIG_SEQ_NO,
                                  currentAuditSeq:
                                    findAttachData.rows.item(d)
                                      .CUR_AUDIT_SEQ_NO,
                                  companyId:
                                    findAttachData.rows.item(d).COMPANY_ID,
                                  /* auditTypeId:
                                    findAttachData.rows.item(d).AUDIT_TYPE_ID, */
                                  statusSeqNo:
                                    findAttachData.rows.item(d).FINDING_SEQ_NO,
                                  fileName:
                                    findAttachData.rows.item(d).FILE_NAME,
                                  ownerFlag: findAttachData.rows.item(d).FLAG,
                                  userIns: findAttachData.rows.item(d).USER_INS,
                                  dateIns: findAttachData.rows.item(d).DATE_INS,
                                });
                              }
                              console.log(
                                'findAttachData(' + d + ')',
                                attachment
                              );
                              findings[i].findingDtl[j].findingRptAttachs =
                                attachment;
                              attachment = [];
                            }
                          }
                        );
                      })
                      .then(() => {
                        console.log('findings from db : ', findings);
                        resolve(findings);
                      });
                  });
                });
              //  resolve(findings);
            });
          } else resolve(findings);
          // resolve(findings);
        });
    });
  }
  /**added by archana for jira-id MOBILE-599 end  */
  public getCurrentFindingDataList(seqNo) {
    return new Promise<Object>((resolve, reject) => {
      var findings = [];
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM AUDIT_FINDINGS WHERE ORIG_SEQ_NO=? AND CUR_AUDIT_SEQ_NO=?',
            [seqNo, seqNo],
            (tx: any, find: any) => {
              if (!find.error) {
                for (var x = 0; x < find.rows.length; x++) {
                  console.log(find.rows.item(x));
                  findings.push({
                    currSeqNo: find.rows.item(x).CUR_AUDIT_SEQ_NO,
                    origSeqNo: find.rows.item(x).ORIG_SEQ_NO,
                    findingsNo: find.rows.item(x).FINDING_NO,
                    auditDate: find.rows.item(x).AUDIT_DATE,
                    auditCode: find.rows.item(x).AUDIT_CODE,
                    serialNo: find.rows.item(x).SERIAL_NO,
                    findingDtl: [],
                  });
                }
              }
            },
            (tx: any, err: any) => {
              console.log('SELECT * FROM AUDIT_FINDINGS, Operation failed.');
            }
          );
        })
        .then(() => {
          if (findings.length > 0) {
            findings.forEach((finding, i) => {
              console.log(
                'findings[' + i + '] from finding details',
                findings[i]
              );
              let findingsNo = finding.findingsNo;
              this.database
                .transaction((tx: any) => {
                  tx.executeSql(
                    'SELECT * FROM AUDIT_FINDINGS_DETAILS WHERE CUR_AUDIT_SEQ_NO=? AND ORIG_SEQ_NO=? AND FINDING_NO=?',
                    [seqNo, seqNo, findingsNo],
                    (tx: any, findDtl: any) => {
                      if (!findDtl.error) {
                        for (var x = 0; x < findDtl.rows.length; x++) {
                          findings[i].findingDtl.push({
                            currSeqNo: findDtl.rows.item(x).CUR_AUDIT_SEQ_NO,
                            ORIG_SEQ_NO: findDtl.rows.item(x).ORIG_SEQ_NO,
                            findingsNo: findDtl.rows.item(x).FINDING_NO,
                            findingSeqNo: findDtl.rows.item(x).FINDING_SEQ_NO,
                            categoryId: findDtl.rows.item(x).CATEGORY_ID,
                            statusId: findDtl.rows.item(x).STATUS_ID,
                            statusDate: findDtl.rows.item(x).STATUS_DATE,
                            nextActionId: findDtl.rows.item(x).NEXT_ACTION_ID,
                            dueDate: findDtl.rows.item(x).DUE_DATE,
                            description: findDtl.rows.item(x).DESCRIPTION,
                            findingRptAttachs: [],
                          });
                          if (
                            findDtl.rows.item(x).CATEGORY_ID ==
                            this.appConstant.OBS_FINDING_CATEGORY
                          ) {
                            findings[i].findingDtl[x].nextActionId = Number(
                              this.appConstant.NIL
                            );
                          }
                          if (x == findDtl.rows.length - 1) {
                            switch (findDtl.rows.item(x).STATUS_ID) {
                              case 1001:
                                findings[i].statusDesc = 'OPENED';
                                break;
                              case 1003:
                                findings[i].statusDesc = findings[i].serialNo.includes('MNC')? 'DOWNGRADED':
                                                         findings[i].serialNo.includes('MF')? 'DOWNGRADED (COMPLIANCE RESTORED)':
                                                         findings[i].serialNo.includes('SD')? 'DOWNGRADED (RECTIFIED)' : '';                 // added by archana for jira ID-MOBILE-902
                                break;
                              case 1004:
                                findings[i].statusDesc = 'RESTORE COMPLIANCE'; //case added by lokesh for jira_id(751)
                                break;
                              case 1005:
                                findings[i].statusDesc = 'COMPLIANCE RESTORED';//modifed by lokesh for jira_id(771)
                                break;
                              case 1006:
                                findings[i].statusDesc = 'PLAN ACCEPTED';//modifed by lokesh for jira_id(771)
                                break;
                              case 1008:
                                findings[i].statusDesc = 'VERIFIED CLOSED';//modifed by lokesh for jira_id(771)
                                break;
                              case 1010:
                                findings[i].statusDesc = 'NIL';
                                break;
                            }
                          }
                        }
                      }
                    },
                    (tx: any, err: any) => {
                      console.log(
                        'SELECT * FROM AUDIT_FINDINGS_DETAILS, Operation failed.'
                      );
                    }
                  );
                })
                .then(() => {
                  /*   console.log('findings[' + i + '] from finding attachments', findings[i]);
                  console.log('findings[' + i + '].findingDtl from finding attachments', findings[i].findingDtl); */
                  //findings.for
                  /* findings[i].findingDtl.forEach((findingDetail,j) => {
                  
                }); */
                  findings[i].findingDtl.forEach((findDtl, j) => {
                    console.log('findDtl', findDtl);
                    var fa = findDtl;
                    var attachment = [];
                    this.database
                      .transaction((ty: any) => {
                        ty.executeSql(
                          'SELECT * FROM AUDIT_FINDING_ATTACHMENTS WHERE ORIG_SEQ_NO=? AND FINDING_NO=? AND FINDING_SEQ_NO=?',
                          [fa.ORIG_SEQ_NO, fa.findingsNo, fa.findingSeqNo],
                          (ty: any, findAttachData: any) => {
                            if (findAttachData.rows.length > 0) {
                              for (
                                var d = 0;
                                d < findAttachData.rows.length;
                                d++
                              ) {
                                attachment.push({
                                  /* "curSeqNo": findAttachData.rows.item(d).CUR_AUDIT_SEQ_NO,
                              "orgSeqNo": findAttachData.rows.item(d).ORIG_SEQ_NO,
                              "findingsNo": findAttachData.rows.item(d).FINDING_NO,
                              "findingsSeqNo": findAttachData.rows.item(d).FINDING_SEQ_NO,
                              "fileSeqNo": findAttachData.rows.item(d).FILE_SEQ_NO,
                              "fileName": findAttachData.rows.item(d).FILE_NAME,
                              "flag": findAttachData.rows.item(d).FLAG,
                              "companyId": findAttachData.rows.item(d).COMPANY_ID, */

                                  fileSeqNo:
                                    findAttachData.rows.item(d).FILE_SEQ_NO,
                                  findingNo:
                                    findAttachData.rows.item(d).FINDING_NO,
                                  findingSeqNo:
                                    findAttachData.rows.item(d).FINDING_SEQ_NO,
                                  origAuditSeqNo:
                                    findAttachData.rows.item(d).ORIG_SEQ_NO,
                                  currentAuditSeq:
                                    findAttachData.rows.item(d)
                                      .CUR_AUDIT_SEQ_NO,
                                  companyId:
                                    findAttachData.rows.item(d).COMPANY_ID,
                                  /* auditTypeId:
                                    findAttachData.rows.item(d).AUDIT_TYPE_ID, */
                                  statusSeqNo:
                                    findAttachData.rows.item(d).FINDING_SEQ_NO,
                                  fileName:
                                    findAttachData.rows.item(d).FILE_NAME,
                                  ownerFlag: findAttachData.rows.item(d).FLAG,
                                  userIns: findAttachData.rows.item(d).USER_INS,
                                  dateIns: findAttachData.rows.item(d).DATE_INS,
                                });
                              }
                              console.log(
                                'findAttachData(' + d + ')',
                                attachment
                              );
                              findings[i].findingDtl[j].findingRptAttachs =
                                attachment;
                              attachment = [];
                            }
                          }
                        );
                      })
                      .then(() => {
                        console.log('findings from db : ', findings);
                        resolve(findings);
                      });
                  });
                });
              // resolve(findings);
            });
          } else resolve(findings);
          // resolve(findings);
        });
    });
  }

  public getLinkedDMLReviewList(seqNo) {
    return new Promise<Object>((resolve, reject) => {
      var findings = [];
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM AUDIT_FINDINGS WHERE ORIG_SEQ_NO=?',
            [seqNo],
            (tx: any, find: any) => {
              if (!find.error) {
                for (var x = 0; x < find.rows.length; x++) {
                  console.log(find.rows.item(x));
                  findings.push({
                    currSeqNo: find.rows.item(x).CUR_AUDIT_SEQ_NO,
                    origSeqNo: find.rows.item(x).ORIG_SEQ_NO,
                    findingsNo: find.rows.item(x).FINDING_NO,
                    auditDate: find.rows.item(x).AUDIT_DATE,
                    auditCode: find.rows.item(x).AUDIT_CODE,
                    companyId: find.rows.item(x).COMPANY_ID,
                    auditStatus: find.rows.item(x).AUDIT_STATUS,              //added by archana for jira-Id-MOBILE-873
                    findingStatus: find.rows.item(x).FINDING_STATUS,
                    userIns: find.rows.item(x).USER_INS,
                    dateIns: find.rows.item(x).DATE_INS,
                    serialNo: find.rows.item(x).SERIAL_NO,
                    findingDtl: [],
                  });
                }
              }
            },
            (tx: any, err: any) => {
              console.log('SELECT * FROM AUDIT_FINDINGS, Operation failed.');
            }
          );
        })
        .then(() => {
          if (findings.length > 0) {
            findings.forEach((finding, i) => {
              console.log(
                'findings[' + i + '] from finding details',
                findings[i]
              );
              let findingsNo = finding.findingsNo;
              this.database
                .transaction((tx: any) => {
                  tx.executeSql(
                    'SELECT * FROM AUDIT_FINDINGS_DETAILS WHERE ORIG_SEQ_NO=? AND FINDING_NO=?',
                    [seqNo, findingsNo],
                    (tx: any, findDtl: any) => {
                      if (!findDtl.error) {
                        for (var x = 0; x < findDtl.rows.length; x++) {
                          findings[i].findingDtl.push({
                            currSeqNo: findDtl.rows.item(x).CUR_AUDIT_SEQ_NO,
                            ORIG_SEQ_NO: findDtl.rows.item(x).ORIG_SEQ_NO,
                            findingsNo: findDtl.rows.item(x).FINDING_NO,
                            findingSeqNo: findDtl.rows.item(x).FINDING_SEQ_NO,
                            categoryId: findDtl.rows.item(x).CATEGORY_ID,
                            statusId: findDtl.rows.item(x).STATUS_ID,
                            statusDate: findDtl.rows.item(x).STATUS_DATE,
                            nextActionId: findDtl.rows.item(x).NEXT_ACTION_ID,
                            dueDate: findDtl.rows.item(x).DUE_DATE,
                            description: findDtl.rows.item(x).DESCRIPTION,
                            updateFlag: findDtl.rows.item(x).UPDATE_FLAG,               //added by archana for jira-Id-MOBILE-873
                            checkboxUpdate: findDtl.rows.item(x).CHECKBOX_UPDATE,
                            auditTypeId: findDtl.rows.item(x).AUDIT_TYPE_ID,
                            updateDescription: 
                              findDtl.rows.item(x).UPDATE_DESCRIPTION,
                            auditPlace: findDtl.rows.item(x).AUDIT_PLACE,
                            dateIns: findDtl.rows.item(x).DATE_INS,
                            userIns: findDtl.rows.item(x).USER_INS,
                            findingRptAttachs: [],                                          //added by archana for jira-Id-MOBILE-873
                          });
                          if (x == findDtl.rows.length - 1) {
                            switch (findDtl.rows.item(x).STATUS_ID) {
                              case 1001:
                                findings[i].statusDesc = 'OPENED';
                                break;
                              case 1003:
                                findings[i].statusDesc = 'DOWNGRADED';
                                break;
                              case 1006:
                                findings[i].statusDesc = 'PLAN ACCEPTED';//modifed by lokesh for jira_id(771)
                                break;
                              case 1008:
                                findings[i].statusDesc = 'VERIFIED CLOSED';//modifed by lokesh for jira_id(771)
                                break;
                              case 1010:
                                findings[i].statusDesc = 'NIL';
                                break;
                            }
                          }
                        }
                      }
                    },
                    (tx: any, err: any) => {
                      console.log(
                        'SELECT * FROM AUDIT_FINDINGS_DETAILS, Operation failed.'
                      );
                    }
                  );
                })
                .then(() => {
                  findings[i].findingDtl.forEach((findDtl, j) => {
                    console.log('findDtl', findDtl);
                    var fa = findDtl;
                    var attachment = [];
                    this.database
                      .transaction((ty: any) => {
                        ty.executeSql(
                          'SELECT * FROM AUDIT_FINDING_ATTACHMENTS WHERE ORIG_SEQ_NO=? AND FINDING_NO=? AND FINDING_SEQ_NO=?',
                          [fa.ORIG_SEQ_NO, fa.findingsNo, fa.findingSeqNo],
                          (ty: any, findAttachData: any) => {
                            if (findAttachData.rows.length > 0) {
                              for (
                                var d = 0;
                                d < findAttachData.rows.length;
                                d++
                              ) {
                                attachment.push({
                                  fileSeqNo:
                                    findAttachData.rows.item(d).FILE_SEQ_NO,
                                  findingNo:
                                    findAttachData.rows.item(d).FINDING_NO,
                                  findingSeqNo:
                                    findAttachData.rows.item(d).FINDING_SEQ_NO,               //added by archana for jira-Id-MOBILE-873
                                  origAuditSeqNo:
                                    findAttachData.rows.item(d).ORIG_SEQ_NO,
                                  currentAuditSeq:
                                    findAttachData.rows.item(d)
                                      .CUR_AUDIT_SEQ_NO,
                                  companyId:
                                    findAttachData.rows.item(d).COMPANY_ID,
                                  auditTypeId:
                                    findAttachData.rows.item(d).AUDIT_TYPE_ID,
                                  statusSeqNo:
                                    findAttachData.rows.item(d).FINDING_SEQ_NO,
                                  fileName:
                                    findAttachData.rows.item(d).FILE_NAME,
                                  ownerFlag: findAttachData.rows.item(d).FLAG,
                                  userIns: findAttachData.rows.item(d).USER_INS,
                                  dateIns: findAttachData.rows.item(d).DATE_INS,
                                });
                              }
                              console.log(
                                'findAttachData(' + d + ')',
                                attachment
                              );
                              findings[i].findingDtl[j].findingRptAttachs =
                                attachment;
                              attachment = [];
                            }
                          }
                        );
                      })
                      .then(() => {
                        console.log('findings from db : ', findings);
                        resolve(findings);
                      });
                  });
                });
              // resolve(findings);
            });
          } else resolve(findings);
          // resolve(findings);
        });
    });
  }

  public getCurrentFindingDtlData(seqNo, findingNo) {
    var findingDtl = [];
    return new Promise<Object>((resolve, reject) => {
      this.database.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM AUDIT_FINDINGS_DETAILS WHERE CUR_AUDIT_SEQ_NO=? AND ORIG_SEQ_NO=? AND FINDING_NO=?',
          [seqNo, seqNo, findingNo],
          (tx: any, findDtl: any) => {
            if (!findDtl.error) {
              for (var x = 0; x < findDtl.rows.length; x++) {
                findingDtl.push({
                  currSeqNo: findDtl.rows.item(x).CUR_AUDIT_SEQ_NO,
                  ORIG_SEQ_NO: findDtl.rows.item(x).ORIG_SEQ_NO,
                  findingsNo: findDtl.rows.item(x).FINDING_NO,
                  findingSeqNo: findDtl.rows.item(x).FINDING_SEQ_NO,
                  categoryId: findDtl.rows.item(x).CATEGORY_ID,
                  statusId: findDtl.rows.item(x).STATUS_ID,
                  statusDate: findDtl.rows.item(x).STATUS_DATE,
                  nextActionId: findDtl.rows.item(x).NEXT_ACTION_ID,
                  dueDate: findDtl.rows.item(x).DUE_DATE,
                  description: findDtl.rows.item(x).DESCRIPTION,
                });
              }
              resolve(findingDtl);
            }
          },
          (tx: any, err: any) => {
            console.log(
              'SELECT * FROM AUDIT_FINDINGS_DETAILS, Operation failed.'
            );
          }
        );
      });
    });
  }

  getPrevFindingDetails(req) {
    console.log('req', req);
    return new Promise<Object>((resolve, reject) => {
      var array: any;
      let finding = [],
        findingDetails = [],
        findingAttachments = [],
        auditTransc = [],
        audit = [],
        auditor = [];
      let compImo: any = req.companyImoNo;
      let compDoc: any = req.docTypeNo;
      let auditDate = req.auditDate;
      let seqNoArray = [];
      let leadDataTemp = [];
      // this.database
      /* .transaction((tx: any) => {
        tx.executeSql(
          "SELECT COMPANY_IMO_NO, COMPANY_DOC FROM AUDIT_DETAILS WHERE VESSEL_IMO_NO=? AND AUDIT_TYPE_ID=? AND AUDIT_DATE=?", [imoNo, audiTypeId, audDate],
          (tx: any, docResult: any) => {      
            if (docResult.rows.length > 0) {
               compImo = docResult.rows.item(0).COMPANY_IMO_NO;
              compDoc = docResult.rows.item(0).COMPANY_DOC;
              alert("compImo, compDoc "+compImo+' ' + compDoc)
            } else {
              compImo = '';
              compDoc = '';
            }
          },
          (tx: any, err: any) => {
            console.log("SELECT COMPANY_IMO_NO, COMPANY_DOC FROM AUDIT_DETAILS, Operation failed.");
          }
        );
      }).then((compImo, compDoc) => { */
      if (compImo != '' && compDoc != '') {
        this.database
          .transaction((tx: any) => {
            tx.executeSql(
              'SELECT AUDIT_SEQ_NO FROM AUDIT_DETAILS AD WHERE AD.VESSEL_IMO_NO=? AND date(AD.AUDIT_DATE)<? AND AD.AUDIT_TYPE_ID =? AND AD.COMPANY_IMO_NO=? AND AD.COMPANY_DOC=?',
              [req.vesselImoNo, auditDate, req.auditTypeId, compImo, compDoc],
              (tx: any, seqData: any) => {
                if (seqData.rows.length > 0) {
                  for (var x = 0; x < seqData.rows.length; x++) {
                    seqNoArray.push(seqData.rows.item(x).AUDIT_SEQ_NO);
                  }
                }
              },
              (tx: any, err: any) => {
                console.log(
                  'SELECT AUDIT_SEQ_NO FROM AUDIT_DETAILS, Operation failed.'
                );
              }
            );
          })
          .then(() => {
            console.log('Previous seqNoArray..Test : ', seqNoArray);
            if (seqNoArray.length > 0) {
              for (var i = 0; i < seqNoArray.length; i++) {
                let seqNo = seqNoArray[i];
                this.database
                  .transaction((tx: any) => {
                    tx.executeSql(
                      'SELECT AUDIT_SUB_TYPE_ID,AUDIT_SEQ_NO FROM AUDIT_DETAILS WHERE AUDIT_SEQ_NO=?',
                      [seqNo],
                      (tx: any, subData: any) => {
                        if (!subData.error && subData.rows.length > 0) {
                          for (var x = 0; x < subData.rows.length; x++) {
                            auditTransc.push({
                              auditSubTypeId:
                                subData.rows.item(x).AUDIT_SUB_TYPE_ID,
                              auditSeqNo: subData.rows.item(x).AUDIT_SEQ_NO,
                            });
                          }
                        }
                      },
                      (tx: any, err: any) => {
                        console.log(
                          'SELECT AUDIT_SUB_TYPE_ID,AUDIT_SEQ_NO FROM AUDIT_DETAILS, Operation failed.'
                        );
                      }
                    );
                  })
                  .then(() => {
                    this.database
                      .transaction((tx: any) => {
                        tx.executeSql(
                          'SELECT AUDIT_DATE,AUDIT_SEQ_NO FROM AUDIT_DETAILS WHERE AUDIT_SEQ_NO=?',
                          [seqNo],
                          (tx: any, auditdateData: any) => {
                            if (
                              !auditdateData.error &&
                              auditdateData.rows.length > 0
                            ) {
                              for (
                                var x = 0;
                                x < auditdateData.rows.length;
                                x++
                              ) {
                                audit.push({
                                  auditDate:
                                    auditdateData.rows.item(x).AUDIT_DATE,
                                  auditSeqNo:
                                    auditdateData.rows.item(x).AUDIT_SEQ_NO,
                                });
                              }
                            }
                          },
                          (tx: any, err: any) => {
                            console.log(
                              'SELECT AUDIT_DATE,AUDIT_SEQ_NO FROM AUDIT_DETAILS WHERE AUDIT_SEQ_NO, Operation failed.'
                            );
                          }
                        );
                      })
                      .then(() => {
                        this.database
                          .transaction((tx: any) => {
                            tx.executeSql(
                              'SELECT * FROM AUDIT_AUDITOR_DETAILS WHERE AUDIT_SEQ_NO=? AND AUD_OBS_LEAD = 1',
                              [seqNo],
                              (tx: any, leadData: any) => {
                                if (
                                  !leadData.error &&
                                  leadData.rows.length > 0
                                ) {
                                  for (
                                    var x = 0;
                                    x < leadData.rows.length;
                                    x++
                                  ) {
                                    console.log('leadData', leadData);
                                    leadDataTemp.push({
                                      seqNumber:
                                        leadData.rows.item(x).AUDIT_SEQ_NO,
                                    });
                                  }
                                }
                              },
                              (tx: any, err: any) => {
                                console.log(
                                  'SELECT * FROM AUDIT_AUDITOR_DETAILS WHERE AUDIT_SEQ_NO=? AND AUD_OBS_LEAD = 1, Operation failed.'
                                );
                              }
                            );
                          })
                          .then(() => {
                            leadDataTemp.forEach((element) => {
                              var b = element.seqNumber;
                              this.database.transaction((tx: any) => {
                                tx.executeSql(
                                  'SELECT FIRST_NAME,LAST_NAME FROM MA_USERS WHERE SEQUENCE_NUMBER=?',
                                  [b],
                                  (tx: any, audName: any) => {
                                    var audObsName = '';
                                    if (
                                      !audName.error &&
                                      audName.rows.length > 0
                                    ) {
                                      for (
                                        var x = 0;
                                        x < audName.rows.length;
                                        x++
                                      ) {
                                        audObsName =
                                          audName.rows.item(x).FIRST_NAME +
                                          ' ' +
                                          audName.rows.item(x).LAST_NAME;
                                        auditor.push({
                                          audObsId: audObsName,
                                          auditSeqNo: seqNo,
                                        });
                                      }
                                    }
                                  },
                                  (tx: any, err: any) => {
                                    console.log(
                                      'SELECT FIRST_NAME,LAST_NAME FROM MA_USERS WHERE SEQUENCE_NUMBER, Operation failed.'
                                    );
                                  }
                                );
                              });
                            });
                          });
                      })
                      .then(() => {
                        //previoius findings
                        console.log('@previous findings');
                        console.log(seqNoArray);

                        this.database
                          .transaction((tx: any) => {
                            tx.executeSql(
                              'SELECT * FROM AUDIT_FINDINGS WHERE ORIG_SEQ_NO=? ORDER BY CUR_AUDIT_SEQ_NO DESC',
                              [seqNo],
                              (tx: any, prevFindData: any) => {
                                if (prevFindData.rows.length > 0) {
                                  for (
                                    var y = 0;
                                    y < prevFindData.rows.length;
                                    y++
                                  ) {
                                    console.log(
                                      'previous finding ' + (y + 1) + ' ',
                                      prevFindData.rows.item(y)
                                    );
                                    finding.push({
                                      curSeqNo:
                                        prevFindData.rows.item(y)
                                          .CUR_AUDIT_SEQ_NO,
                                      orgSeqNo:
                                        prevFindData.rows.item(y).ORIG_SEQ_NO,
                                      findingsNo:
                                        prevFindData.rows.item(y).FINDING_NO,
                                      auditDate:
                                        prevFindData.rows.item(y).AUDIT_DATE,
                                      auditCode:
                                        prevFindData.rows.item(y).AUDIT_CODE,
                                      companyId:
                                        prevFindData.rows.item(y).COMPANY_ID,
                                      serialNo:
                                        prevFindData.rows.item(y).SERIAL_NO,
                                      auditStatus:
                                        prevFindData.rows.item(y).AUDIT_STATUS,
                                      findingStatus:
                                        prevFindData.rows.item(y)
                                          .FINDING_STATUS,
                                      userIns:
                                        prevFindData.rows.item(y).USER_INS,
                                      dateIns:
                                        prevFindData.rows.item(y).DATE_INS,
                                      findingDetail: [],
                                    });
                                  }
                                }
                              },
                              (tx: any, err: any) => {
                                console.log(
                                  'SELECT * FROM AUDIT_FINDINGS, Operation failed.'
                                );
                                reject({
                                  error:
                                    'error getting previous audit dtl data',
                                });
                              }
                            );
                          })
                          .then(() => {
                            //previoius findings details
                            console.log('@previous finding details');
                            this.database
                              .transaction((tx: any) => {
                                if (finding.length > 0) {
                                  finding.forEach((pf, ind) => {
                                    let previousAuditFinding = pf;
                                    tx.executeSql(
                                      'SELECT * FROM AUDIT_FINDINGS_DETAILS WHERE ORIG_SEQ_NO=? AND FINDING_NO=? ORDER BY ORIG_SEQ_NO ASC',
                                      [
                                        previousAuditFinding.orgSeqNo,
                                        previousAuditFinding.findingsNo,
                                      ],
                                      (tx: any, prevFindDtlData: any) => {
                                        if (prevFindDtlData.rows.length > 0) {
                                          for (
                                            var z = 0;
                                            z < prevFindDtlData.rows.length;
                                            z++
                                          ) {
                                            /*  if(prevFindDtlData.rows.item(z).CATEGORY_ID == this.appConstant.OBS_FINDING_CATEGORY || prevFindDtlData.rows.item(z).STATUS_ID==this.appConstant.VERIFIED_CLOSED){
                                     prevFindDtlData.rows.item(z).NEXT_ACTION_ID = parseInt(this.appConstant.NIL);
                                   } */
                                            findingDetails.push({
                                              curSeqNo:
                                                prevFindDtlData.rows.item(z)
                                                  .CUR_AUDIT_SEQ_NO,
                                              orgSeqNo:
                                                prevFindDtlData.rows.item(z)
                                                  .ORIG_SEQ_NO,
                                              findingsNo:
                                                prevFindDtlData.rows.item(z)
                                                  .FINDING_NO,
                                              findingsSeqNo:
                                                prevFindDtlData.rows.item(z)
                                                  .FINDING_SEQ_NO,
                                              categoryId:
                                                prevFindDtlData.rows.item(z)
                                                  .CATEGORY_ID,
                                              statusId:
                                                prevFindDtlData.rows.item(z)
                                                  .STATUS_ID,
                                              statusDate:
                                                prevFindDtlData.rows.item(z)
                                                  .STATUS_DATE,
                                              nextActionId:
                                                prevFindDtlData.rows.item(z)
                                                  .NEXT_ACTION_ID,
                                              dueDate:
                                                prevFindDtlData.rows.item(z)
                                                  .DUE_DATE,
                                              description:
                                                prevFindDtlData.rows.item(z)
                                                  .DESCRIPTION,
                                              companyId:
                                                prevFindDtlData.rows.item(z)
                                                  .COMPANY_ID,
                                              updateFlag: prevFindDtlData.rows.item(z)
                                                  .UPDATE_FLAG,          // added by archana for jira-id-720
                                              checkboxUpdate: prevFindDtlData.rows.item(z)
                                                  .CHECKBOX_UPDATE,      // added by archana for jira-id-704
                                              auditTypeId:
                                                prevFindDtlData.rows.item(z)
                                                  .AUDIT_TYPE_ID,
                                              updateDescription:
                                                prevFindDtlData.rows.item(z)
                                                  .UPDATE_DESCRIPTION,
                                              auditPlace:
                                                prevFindDtlData.rows.item(z)
                                                  .AUDIT_PLACE,
                                              userIns:
                                                prevFindDtlData.rows.item(z)
                                                  .USER_INS,
                                              dateIns:
                                                prevFindDtlData.rows.item(z)
                                                  .DATE_INS,
                                              findingRptAttachs: [],
                                            });
                                            if (
                                              z ==
                                              prevFindDtlData.rows.length - 1
                                            ) {
                                              switch (
                                              prevFindDtlData.rows.item(z)
                                                .STATUS_ID
                                              ) {
                                                case 1001:
                                                  finding[ind].statusDesc =
                                                    'OPENED';
                                                  break;
                                                case 1003:
                                                  finding[ind].statusDesc = finding[ind].serialNo.includes('MNC')? 'DOWNGRADED' : 
                                                                            finding[ind].serialNo.includes('MF')? 'DOWNGRADED (COMPLIANCE RESTORED)' :
                                                                            finding[ind].serialNo.includes('SD')? 'DOWNGRADED (RECTIFIED)' : '';            // added by archana for jira ID-MOBILE-902
                                                  break;
                                                case 1005:
                                                  finding[ind].statusDesc='COMPLIANCE RESTORED';//case added by lokesh for jira_id(751)  // changed by archana for jira ID-MOBILE-761 start  
                                                  break;
                                                case 1006:
                                                  finding[ind].statusDesc =
                                                    'PLAN ACCEPTED';//modifed by lokesh for jira_id(771)
                                                  break;
                                                case 1008:
                                                  finding[ind].statusDesc =
                                                    'VERIFIED CLOSED';//modifed by lokesh for jira_id(771)
                                                  break;
                                                case 1010:
                                                  finding[ind].statusDesc =
                                                    'NIL';
                                                  break;
                                              }
                                            }
                                          }
                                          finding[ind].findingDetail =
                                            findingDetails;
                                          // pf.findingDetail = prevFindingDetails;

                                          findingDetails = [];
                                          //console.log("pf",pf);
                                        }
                                      },
                                      (tx: any, err: any) => {
                                        console.log(
                                          'SELECT * FROM AUDIT_FINDINGS_DETAILS, Operation failed.'
                                        );
                                        reject({
                                          error:
                                            'error getting previous finding dtl data',
                                        });
                                      }
                                    );
                                  });
                                }
                              })
                              .then(() => {
                                //previoius findings attachments
                                console.log('@previous finding attachments');
                                this.database
                                  .transaction((tx: any) => {
                                    if (finding.length > 0) {
                                      finding.forEach((pf, i) => {
                                        pf.findingDetail.forEach(
                                          (pfd, pdfIndex) => {
                                            let previousFindDtl = pfd;
                                            //prevFindAttachment
                                            tx.executeSql(
                                              'SELECT * FROM AUDIT_FINDING_ATTACHMENTS WHERE ORIG_SEQ_NO=? AND FINDING_NO=? AND FINDING_SEQ_NO=?',
                                              [
                                                previousFindDtl.orgSeqNo,
                                                previousFindDtl.findingsNo,
                                                previousFindDtl.findingsSeqNo,
                                              ],
                                              (
                                                tx: any,
                                                prevFindAttachData: any
                                              ) => {
                                                if (
                                                  prevFindAttachData.rows
                                                    .length > 0
                                                ) {
                                                  for (
                                                    var d = 0;
                                                    d <
                                                    prevFindAttachData.rows
                                                      .length;
                                                    d++
                                                  ) {
                                                    findingAttachments.push({
                                                      curSeqNo:
                                                        prevFindAttachData.rows.item(
                                                          d
                                                        ).CUR_AUDIT_SEQ_NO,
                                                      orgSeqNo:
                                                        prevFindAttachData.rows.item(
                                                          d
                                                        ).ORIG_SEQ_NO,
                                                      findingsNo:
                                                        prevFindAttachData.rows.item(
                                                          d
                                                        ).FINDING_NO,
                                                      findingsSeqNo:
                                                        prevFindAttachData.rows.item(
                                                          d
                                                        ).FINDING_SEQ_NO,
                                                      fileSeqNo:
                                                        prevFindAttachData.rows.item(
                                                          d
                                                        ).FILE_SEQ_NO,
                                                      fileName:
                                                        prevFindAttachData.rows.item(
                                                          d
                                                        ).FILE_NAME,
                                                      flag: prevFindAttachData.rows.item(
                                                        d
                                                      ).FLAG,
                                                      companyId:
                                                        prevFindAttachData.rows.item(
                                                          d
                                                        ).COMPANY_ID,
                                                    });
                                                  }
                                                  console.log(i, pdfIndex);
                                                  finding[i].findingDetail[
                                                    pdfIndex
                                                  ].findingRptAttachs = findingAttachments;
                                                  findingAttachments = [];
                                                }
                                              }
                                            );
                                          }
                                        );
                                      });
                                    }
                                  })
                                  .then(() => {
                                    array = {
                                      finding: finding,
                                      findingDetails: findingDetails,
                                      findingAttachments: findingAttachments,
                                      audit: audit,
                                      auditTransc: auditTransc,
                                      auditor: auditor,
                                    };
                                    console.log(array);
                                    resolve(array);
                                  }); //final audit data
                              }); //previous audit finding attachment
                          }); //previous audit finding details
                      });
                    // })
                  });
              }
            } else {
              resolve(null);
            }
          });
      }
      // })
      //resolve(array);
    });
  }

  public getMaDatasForFindings(audType) {
    //1.MaFindingsStatus 2.MaAuditCodes 3.MaFindingsCategory
    let maAuditCodes = [],
      maFindingStatus = [],
      maFindingCategory = [];
    return new Promise<Object>((resolve, reject) => {
      this.database
        .transaction((trnx: any) => {
          trnx.executeSql(
            'SELECT * FROM MA_AUDIT_CODES where AUDIT_TYPE_ID=?',
            [audType],
            (trnx: any, res: any) => {
              if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {
                  maAuditCodes.push(res.rows.item(i));
                }
              } else {
                console.log('0 row/record found in the MA_AUDIT_CODES table ');
              }
              // resolve(auditCodes);
            },
            (trnx: any, err: any) => {
              reject({ trnx: trnx, err: err });
            }
          );
        })
        .then(() => {
          this.database
            .transaction((trnx: any) => {
              trnx.executeSql(
                'SELECT * FROM MA_FINDINGS_STATUS where AUDIT_TYPE_ID=?',
                [audType],
                (trnx: any, findStatus: any) => {
                  if (findStatus.rows.length > 0) {
                    for (var j = 0; j < findStatus.rows.length; j++) {
                      maFindingStatus.push(findStatus.rows.item(j));
                    }
                  } else {
                    console.log(
                      '0 row/record found in the MA_FINDINGS_STATUS table '
                    );
                  }
                },
                (trnx: any, err: any) => {
                  reject({ trnx: trnx, err: err });
                }
              );
            })
            .then(() => {
              this.database.transaction((trnx: any) => {
                trnx.executeSql(
                  'SELECT * FROM MA_FINDINGS_CATEGORY where AUDIT_TYPE_ID=?',
                  [audType],
                  (trnx: any, findStatus: any) => {
                    if (findStatus.rows.length > 0) {
                      for (var j = 0; j < findStatus.rows.length; j++) {
                        maFindingCategory.push(findStatus.rows.item(j));
                      }
                    } else {
                      console.log(
                        '0 row/record found in the MA_FINDINGS_CATEGORY table '
                      );
                    }
                    resolve([maAuditCodes, maFindingStatus, maFindingCategory]);
                  },
                  (trnx: any, err: any) => {
                    reject({ trnx: trnx, err: err });
                  }
                );
              });
            });
        });
    });
  }
  getVesselDtlForCertificateCreation(userName) {
    let vesselImoNos = [],
      vesselDtls = [];
    return new Promise<Object>((resolve, reject) => {
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT VESSEL_IMO_NO FROM AUDIT_DETAILS WHERE USER_INS=?',
            [userName],
            (tx: any, auditRes: any) => {
              if (auditRes.rows.length > 0) {
                for (var x = 0; x < auditRes.rows.length; x++) {
                  vesselImoNos.push(auditRes.rows.item(x).VESSEL_IMO_NO);
                }
              }
            },
            (tx: any, err: any) => {
              console.log(
                'get audits for certCereate Screen, Operation failed.'
              );
            }
          );
        })
        .then(() => {
          vesselImoNos.forEach(async (element) => {
            await this.getVesselCompanyData(element).then((response) => {
              vesselDtls.push(response[0]);
            });
          });
          resolve(vesselDtls);
        });
    });
  }

  getAvailableCertificatesOfCurrentUser() {
    return new Promise<Object>((resolve, reject) => {
      var output = [];
      this.database.transaction((tx: any) => {
        tx.executeSql(
          this.certificateDtlSelectQry() + ' FROM CERTIFICATE_DETAIL ',
          [],
          (tx: any, result: any) => {
            if (result.rows.length > 0) {
              for (var x = 0; x < result.rows.length; x++) {
                output.push(result.rows.item(x));
              }
              console.log('CERTIFICATE COUNT ::', output);
              resolve(output);
            } else {
              console.log('TESTING CERTIFICATE_DETAIL TABLE EMPTY');
              resolve(output);
            }
          },
          (tx: any, err: any) => {
            console.log('ERROR SELECT * FROM CERTIFICATE_DETAIL ');
            resolve(output);
          }
        );
      });
    });
  }

  certificateDtlSelectQry() {
    return (
      'SELECT ' +
      'AUDIT_SEQ_NO			   auditSeqNo,' +
      'COMPANY_ID              companyId,' +
      'SEQ_NO                  seqNo,' +
      'CERTIFICATE_ID		   certificateId,' +
      'ENDORSEMENT_ID		   endorsementID,' +
      'AUDIT_TYPE_ID           auditTypeId,' +
      'AUDIT_SUB_TYPE_ID	   auditSubTypeId,' +
      'AUDIT_DATE			   auditDate,' +
      'ENDORSED_DATE    endorsedDate,' +
      'AUDIT_PLACE			   auditPlace,' +
      'CERTIFICATE_NO	       certificateNo,' +
      'AUDIT_REPORT_NO         auditReportNo,' +
      'UTN					   utn,' +
      'CERTIFICATE_ISSUE_ID	   certIssueId,' +
      'QRCODE_URL			   qrCodeUrl,' +
      'CERTIFICATE_VERSION	   certificateVer,' +
      'CERT_ISSUED_DATE		   certIssueDate,' +
      'CERT_EXPIRY_DATE		   certExpireDate,' +
      'EXTENDED_ISSUE_DATE     extendedIssueDate,' +
      'EXTENDED_EXPIRY_DATE    extendedExpireDate,' +
      'ENDORSED_DATE           endorsedDate,' +
      'ACTIVE_STATUS		   activeStatus,' +
      'NOTES				   notes,' +
      'LEAD_NAME			   leadName,' +
      'ISSUER_ID               issuerId,' +
      'ISSUER_SIGN             issuerSign,' +
      'ISSUER_SIGN_DATE        issuerSignDate ,' +
      'NAME_TO_PRINT           nameToPrint ,' +
      'SIGN_TO_PRINT           signToPrint ,' +
      'VERIFY_DONE             verifyDone ,' +
      'VESSEL_ID               vesselId ,' +
      'VESSEL_IMO_NO           vesselImoNo,' +
      'VESSEL_NAME			   vesselName,' +
      'GRT					   grt,' +
      'VESSEL_TYPE			   vesselType,' +
      'PORT_OF_REGISTRY		   portOfRegistry,' +
      'DATE_OF_REGISTRY		   dateOfRegistry,' +
      'COMPANY_IMO_NO		   companyImoNo,' +
      'VESSEL_COMPANY_NAME	   vesselCompanyName,' +
      'VESSEL_COMPANY_ADDRESS  vesselCompanyAddress,' +
      'VESSEL_UK			   vesselUk,' +
      'VESSEL_PK	 		   vesselPk,' +
      'CLASS_SOCIETY	 	   classSociety,' +
      'CALL_SIGN	 	       callSign,' +
      'DOC_TYPE_NUMBER		   docTypeNumber,' +
      'DOC_TYPE				   docTypeNo,' +
      'DOC_ISSUER			   docIssuer,' +
      'DOC_EXPIRY			   docExpiry,' +
      'USER_INS				   userIns,' +
      'PUBLISH_STATUS		   publishStatus,' +
      'ISSUER_NAME		       issuerName,' +
      'DATE_INS				   dateIns,' +
      'OFFICIAL_NO             officialNo,' +
      'SEAL					   seal,' +
      'TITLE				   title,' +
      'CERTIFICATE_LINK_SEQ	   certificateLink,' +
      'CONSECTIVE_SUBSEQUENT   consecutiveId,' +
      'QID 					   qid,' +
      'COMPLETION_DATE     completionDate, ' +
      'DMLCII_ISSUE_DATE    dmlcIssueDate,' +
      'DMLCII_ISSUE_LOCATION    dmlcIssuePlace'
    );
  }

  //generate Certificate
  getMaAuditTypeForCertficateDtlDropdown() {
    let auditType = [];
    return new Promise<Object>((resolve, reject) => {
      this.database.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM MA_AUDIT_TYPE',
          [],
          (tx: any, auditTypeRes: any) => {
            if (auditTypeRes.rows.length > 0) {
              for (var x = 0; x < auditTypeRes.rows.length; x++) {
                auditType.push({
                  auditTypeId: auditTypeRes.rows.item(x).AUDIT_TYPE_ID,
                  auditTypeDesc: auditTypeRes.rows.item(x).AUDIT_TYPE_DESC,
                  companyId: auditTypeRes.rows.item(x).COMPANY_ID,
                });
              }
            }
            resolve(auditType);
          },
          (tx: any, err: any) => {
            console.log('get auditTypes for certDtl Screen, Operation failed.');
          }
        );
      });
    });
  }

  getMaDetailsForCertficateDtlDropdowns(auditTypeId) {
    let auditSubType = [],
      auditStatus = [],
      certIssued = [],
      port = [];

    return new Promise<Object>((resolve, reject) => {
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM MA_AUDIT_SUBTYPE WHERE AUDIT_TYPE_ID=?',
            [auditTypeId],
            (tx: any, auditTypeRes: any) => {
              if (auditTypeRes.rows.length > 0) {
                for (var x = 0; x < auditTypeRes.rows.length; x++) {
                  auditSubType.push({
                    auditTypeId: auditTypeRes.rows.item(x).AUDIT_TYPE_ID,
                    auditSubtypeId: auditTypeRes.rows.item(x).AUDIT_SUBTYPE_ID,
                    auditSubtypeDesc:
                      auditTypeRes.rows.item(x).AUDIT_SUBTYPE_DESC,
                    companyId: auditTypeRes.rows.item(x).COMPANY_ID,
                  });
                }
              }
            },
            (tx: any, err: any) => {
              console.log(
                'get auditSubTypes for certDtl Screen, Operation failed.'
              );
            }
          );
        })
        .then(() => {
          this.database
            .transaction((tx: any) => {
              tx.executeSql(
                'SELECT * FROM MA_AUDIT_STATUS WHERE AUDIT_TYPE_ID=?',
                [auditTypeId],
                (tx: any, auditStatusRes: any) => {
                  if (auditStatusRes.rows.length > 0) {
                    for (var x = 0; x < auditStatusRes.rows.length; x++) {
                      auditStatus.push({
                        auditTypeId: auditStatusRes.rows.item(x).AUDIT_TYPE_ID,
                        auditStatusId:
                          auditStatusRes.rows.item(x).AUDIT_STATUS_ID,
                        auditStatusDesc:
                          auditStatusRes.rows.item(x).AUDIT_STATUS_DESC,
                        companyId: auditStatusRes.rows.item(x).COMPANY_ID,
                      });
                    }
                  }
                },
                (tx: any, err: any) => {
                  console.log(
                    'get auditStatus for certDtl Screen, Operation failed.'
                  );
                }
              );
            })
            .then(() => {
              this.database
                .transaction((tx: any) => {
                  tx.executeSql(
                    'SELECT * FROM MA_CERTIFICATE_ISSUED WHERE AUDIT_TYPE_ID=?',
                    [auditTypeId],
                    (tx: any, certIssuedRes: any) => {
                      if (certIssuedRes.rows.length > 0) {
                        for (var x = 0; x < certIssuedRes.rows.length; x++) {
                          certIssued.push({
                            auditTypeId:
                              certIssuedRes.rows.item(x).AUDIT_TYPE_ID,
                            certificateIssueId:
                              certIssuedRes.rows.item(x).CERTIFICATE_ISSUE_ID,
                            certificateIssueDesc:
                              certIssuedRes.rows.item(x).CERTIFICATE_ISSUE_DESC,
                            companyId: certIssuedRes.rows.item(x).COMPANY_ID,
                          });
                        }
                      }
                    },
                    (tx: any, err: any) => {
                      console.log(
                        'get certificate issued data for certDtl Screen, Operation failed.'
                      );
                    }
                  );
                })
                .then(() => {
                  this.database
                    .transaction((tx: any) => {
                      tx.executeSql(
                        'SELECT PORT_NAME FROM MA_PORT',
                        [],
                        (tx: any, portRes: any) => {
                          if (portRes.rows.length > 0) {
                            for (var x = 0; x < portRes.rows.length; x++) {
                              port.push(portRes.rows.item(x).PORT_NAME);
                            }
                          }
                        },
                        (tx: any, err: any) => {
                          console.log(
                            'get all port data for auditPlace placeholder, Operation failed.'
                          );
                        }
                      );
                    })
                    .then(() => {
                      let result = {
                        auditSubType: auditSubType,
                        auditStatus: auditStatus,
                        certIssued: certIssued,
                        port: port,
                      };
                      resolve(result);
                    });
                });
            });
        });
    });
  }

  getPreviousInitialRenewalData2(auditTypeId, vesselImoNo) {
    return new Promise<Object>((resolve, reject) => {
      var previousCert = [];
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM CERTIFICATE_DETAIL WHERE  AUDIT_TYPE_ID = ? AND VESSEL_IMO_NO = ? order by  AUDIT_SEQ_NO desc',
            [auditTypeId, vesselImoNo + ''],
            (tx: any, pad: any) => {
              if (pad.rows.length > 0) {
                for (var x = 0; x < pad.rows.length; x++) {
                  console.log(pad.rows.item(x));
                  previousCert.push({
                    auditSeqNo: pad.rows.item(x).AUDIT_SEQ_NO,
                    companyId: pad.rows.item(x).COMPANY_ID,
                    seqNo: pad.rows.item(x).SEQ_NO,
                    certificateId: pad.rows.item(x).CERTIFICATE_ID,
                    certificateNo: pad.rows.item(x).CERTIFICATE_NO,
                    endorsementID: pad.rows.item(x).ENDORSEMENT_ID,
                    auditTypeId: pad.rows.item(x).AUDIT_TYPE_ID,
                    auditSubTypeId: pad.rows.item(x).AUDIT_SUB_TYPE_ID,
                    auditDate: pad.rows.item(x).AUDIT_DATE,
                    endorsedDate: pad.rows.item(x).ENDORSED_DATE,
                    auditPlace: pad.rows.item(x).AUDIT_PLACE,
                    issuePlace: pad.rows.item(x).AUDIT_PLACE,
                    auditReportNo: pad.rows.item(x).AUDIT_REPORT_NO,
                    utn: pad.rows.item(x).UTN,
                    certIssueId: pad.rows.item(x).CERTIFICATE_ISSUE_ID,
                    qrCodeUrl: pad.rows.item(x).QRCODE_URL,
                    certificateVer: pad.rows.item(x).CERTIFICATE_VERSION,
                    issueDate: pad.rows.item(x).CERT_ISSUED_DATE,
                    expiryDate: pad.rows.item(x).CERT_EXPIRY_DATE,
                    extendedIssueDate: pad.rows.item(x).EXTENDED_ISSUE_DATE,
                    extendedExpireDate: pad.rows.item(x).EXTENDED_EXPIRY_DATE,
                    publishStatus: pad.rows.item(x).PUBLISH_STATUS,
                    activeStatus: pad.rows.item(x).ACTIVE_STATUS,
                    notes: pad.rows.item(x).NOTES,
                    auditorName: pad.rows.item(x).LEAD_NAME,
                    issuerId: pad.rows.item(x).ISSUER_ID,
                    issuerName: pad.rows.item(x).ISSUER_NAME,
                    issuerSign: pad.rows.item(x).ISSUER_SIGN,
                    signDate: pad.rows.item(x).ISSUER_SIGN_DATE,
                    issuerSignDate: pad.rows.item(x).ISSUER_SIGN_DATE,
                    nameToPrint: pad.rows.item(x).NAME_TO_PRINT,
                    signToPrint: pad.rows.item(x).SIGN_TO_PRINT,
                    verifyDone: pad.rows.item(x).VERIFY_DONE,
                    vesselId: pad.rows.item(x).VESSEL_ID,
                    vesselImoNo: pad.rows.item(x).VESSEL_IMO_NO,
                    vesselName: pad.rows.item(x).VESSEL_NAME,
                    grt: pad.rows.item(x).GRT,
                    vesselType: pad.rows.item(x).VESSEL_TYPE,
                    officialNo: pad.rows.item(x).OFFICIAL_NO,
                    portOfRegistry: pad.rows.item(x).PORT_OF_REGISTRY,
                    dateOfRegistry: pad.rows.item(x).DATE_OF_REGISTRY,
                    companyImoNo: pad.rows.item(x).COMPANY_IMO_NO,
                    companyname: pad.rows.item(x).VESSEL_COMPANY_NAME,
                    companyaddress: pad.rows.item(x).VESSEL_COMPANY_ADDRESS,
                    vesselCompanyName: pad.rows.item(x).VESSEL_COMPANY_NAME,
                    vesselCompanyAddress:
                      pad.rows.item(x).VESSEL_COMPANY_ADDRESS,
                    vesselUk: pad.rows.item(x).VESSEL_UK,
                    vesselPk: pad.rows.item(x).VESSEL_PK,
                    classSociety: pad.rows.item(x).CLASS_SOCIETY,
                    callSign: pad.rows.item(x).CALL_SIGN,
                    docTypeNumber: pad.rows.item(x).DOC_TYPE_NUMBER,
                    docTypeNo: pad.rows.item(x).DOC_TYPE,
                    docIssuer: pad.rows.item(x).DOC_ISSUER,
                    docExpiry: pad.rows.item(x).DOC_EXPIRY,
                    userIns: pad.rows.item(x).USER_INS,
                    dateIns: pad.rows.item(x).DATE_INS,
                    title: pad.rows.item(x).TITLE,
                    seal: pad.rows.item(x).SEAL,
                    certificateLink: pad.rows.item(x).CERTIFICATE_LINK_SEQ,
                    consecutiveId: pad.rows.item(x).CONSECTIVE_SUBSEQUENT,
                    completionDate: pad.rows.item(x).COMPLETION_DATE,
                    dmlcIssueDate: pad.rows.item(x).DMLCII_ISSUE_DATE,
                    dmlcIssuePlace: pad.rows.item(x).DMLCII_ISSUE_LOCATION,
                    certOderNo: pad.rows.item(x).CERT_ORDER_NO,
                    qid: pad.rows.item(x).QID,
                  });
                }
              } else {
                console.log('0 certificates found');
                resolve(previousCert);
              }
            },
            (tx: any, err: any) => {
              console.log('failed');
            }
          );
        })
        .then(() => {
          resolve(previousCert);
        });
    });
  }

  getPreviousInitialRenewalData(auditTypeId, vesselImoNo, auditSeqNo) {
    return new Promise<Object>((resolve, reject) => {
      var previousCert = [];
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM CERTIFICATE_DETAIL WHERE  AUDIT_TYPE_ID = ? AND VESSEL_IMO_NO = ? AND AUDIT_SEQ_NO != ? order by  AUDIT_SEQ_NO desc',
            [auditTypeId, vesselImoNo + '', auditSeqNo],
            (tx: any, pad: any) => {
              if (pad.rows.length > 0) {
                for (var x = 0; x < pad.rows.length; x++) {
                  console.log(pad.rows.item(x));
                  previousCert.push({
                    auditSeqNo: pad.rows.item(x).AUDIT_SEQ_NO,
                    companyId: pad.rows.item(x).COMPANY_ID,
                    seqNo: pad.rows.item(x).SEQ_NO,
                    certificateId: pad.rows.item(x).CERTIFICATE_ID,
                    certificateNo: pad.rows.item(x).CERTIFICATE_NO,
                    endorsementID: pad.rows.item(x).ENDORSEMENT_ID,
                    auditTypeId: pad.rows.item(x).AUDIT_TYPE_ID,
                    auditSubTypeId: pad.rows.item(x).AUDIT_SUB_TYPE_ID,
                    auditDate: pad.rows.item(x).AUDIT_DATE,
                    endorsedDate: pad.rows.item(x).ENDORSED_DATE,
                    auditPlace: pad.rows.item(x).AUDIT_PLACE,
                    issuePlace: pad.rows.item(x).AUDIT_PLACE,
                    auditReportNo: pad.rows.item(x).AUDIT_REPORT_NO,
                    utn: pad.rows.item(x).UTN,
                    certIssueId: pad.rows.item(x).CERTIFICATE_ISSUE_ID,
                    qrCodeUrl: pad.rows.item(x).QRCODE_URL,
                    certificateVer: pad.rows.item(x).CERTIFICATE_VERSION,
                    issueDate: pad.rows.item(x).CERT_ISSUED_DATE,
                    expiryDate: pad.rows.item(x).CERT_EXPIRY_DATE,
                    extendedIssueDate: pad.rows.item(x).EXTENDED_ISSUE_DATE,
                    extendedExpireDate: pad.rows.item(x).EXTENDED_EXPIRY_DATE,
                    publishStatus: pad.rows.item(x).PUBLISH_STATUS,
                    activeStatus: pad.rows.item(x).ACTIVE_STATUS,
                    notes: pad.rows.item(x).NOTES,
                    auditorName: pad.rows.item(x).LEAD_NAME,
                    issuerId: pad.rows.item(x).ISSUER_ID,
                    issuerName: pad.rows.item(x).ISSUER_NAME,
                    issuerSign: pad.rows.item(x).ISSUER_SIGN,
                    signDate: pad.rows.item(x).ISSUER_SIGN_DATE,
                    issuerSignDate: pad.rows.item(x).ISSUER_SIGN_DATE,
                    nameToPrint: pad.rows.item(x).NAME_TO_PRINT,
                    signToPrint: pad.rows.item(x).SIGN_TO_PRINT,
                    verifyDone: pad.rows.item(x).VERIFY_DONE,
                    vesselId: pad.rows.item(x).VESSEL_ID,
                    vesselImoNo: pad.rows.item(x).VESSEL_IMO_NO,
                    vesselName: pad.rows.item(x).VESSEL_NAME,
                    grt: pad.rows.item(x).GRT,
                    vesselType: pad.rows.item(x).VESSEL_TYPE,
                    officialNo: pad.rows.item(x).OFFICIAL_NO,
                    portOfRegistry: pad.rows.item(x).PORT_OF_REGISTRY,
                    dateOfRegistry: pad.rows.item(x).DATE_OF_REGISTRY,
                    companyImoNo: pad.rows.item(x).COMPANY_IMO_NO,
                    companyname: pad.rows.item(x).VESSEL_COMPANY_NAME,
                    companyaddress: pad.rows.item(x).VESSEL_COMPANY_ADDRESS,
                    vesselCompanyName: pad.rows.item(x).VESSEL_COMPANY_NAME,
                    vesselCompanyAddress:
                      pad.rows.item(x).VESSEL_COMPANY_ADDRESS,
                    vesselUk: pad.rows.item(x).VESSEL_UK,
                    vesselPk: pad.rows.item(x).VESSEL_PK,
                    classSociety: pad.rows.item(x).CLASS_SOCIETY,
                    callSign: pad.rows.item(x).CALL_SIGN,
                    docTypeNumber: pad.rows.item(x).DOC_TYPE_NUMBER,
                    docTypeNo: pad.rows.item(x).DOC_TYPE,
                    docIssuer: pad.rows.item(x).DOC_ISSUER,
                    docExpiry: pad.rows.item(x).DOC_EXPIRY,
                    userIns: pad.rows.item(x).USER_INS,
                    dateIns: pad.rows.item(x).DATE_INS,
                    title: pad.rows.item(x).TITLE,
                    seal: pad.rows.item(x).SEAL,
                    certificateLink: pad.rows.item(x).CERTIFICATE_LINK_SEQ,
                    consecutiveId: pad.rows.item(x).CONSECTIVE_SUBSEQUENT,
                    completionDate: pad.rows.item(x).COMPLETION_DATE,
                    dmlcIssueDate: pad.rows.item(x).DMLCII_ISSUE_DATE,
                    dmlcIssuePlace: pad.rows.item(x).DMLCII_ISSUE_LOCATION,
                    certOderNo: pad.rows.item(x).CERT_ORDER_NO,
                    qid: pad.rows.item(x).QID,
                  });
                }
              } else {
                console.log('0 certificates found');
                resolve(previousCert);
              }
            },
            (tx: any, err: any) => {
              console.log('failed');
            }
          );
        })
        .then(() => {
          resolve(previousCert);
        });
    });
  }
  public generateCertificate(a) {
    var valueTestTempVariable = {
      auditSeqNo: a.auditSeqNo,
      companyId: a.companyId ? a.companyId : '',
      seqNo: a.seqNo ? a.seqNo : '',
      certificateId: a.certificateId ? a.certificateId : '',
      endorsementID: a.endorsementID ? a.endorsementID : '',
      auditTypeId: a.auditTypeId ? a.auditTypeId : '',
      auditSubTypeId: a.auditSubTypeId ? a.auditSubTypeId : '',
      auditDate: a.auditDate ? a.auditDate : '',
      issuePlace: a.issuePlace ? a.issuePlace : '',
      certificateNo: a.certificateNo ? a.certificateNo : '',
      auditReportNo: a.auditReportNo ? a.auditReportNo : '',
      utn: a.utn ? a.utn : '',
      certIssueId: a.certIssueId ? a.certIssueId : '',
      qrCodeUrl: a.qrCodeUrl ? a.qrCodeUrl : '',
      certificateVer: a.certificateVer ? a.certificateVer : '',
      issueDate: a.issueDate ? a.issueDate : '',
      expiryDate: a.expiryDate ? a.expiryDate : '',
      extendedIssueDate: a.extendedIssueDate ? a.extendedIssueDate : '',
      extendedExpireDate: a.extendedExpireDate ? a.extendedExpireDate : '',
      endorsedDate: a.endorsedDate ? a.endorsedDate : '',
      publishStatus: a.publishStatus ? a.publishStatus : 0,
      activeStatus: a.activeStatus ? a.activeStatus : 0,
      notes: a.notes ? a.notes : '',
      auditorName: a.auditorName ? a.auditorName : '',
      issuerId: a.issuerId ? a.issuerId : '',
      issuerName: a.issuerName ? a.issuerName : '',
      issuerSign: a.issuerSign ? a.issuerSign : '',
      issuerSignDate: a.signDate ? a.signDate : '',
      nameToBePrinted: a.nameToBePrinted ? a.nameToBePrinted : 0,
      signToBePrinted: a.signToBePrinted ? a.signToBePrinted : 0,
      verifyDone: a.verifyDone ? a.verifyDone : 0,
      vesselId: a.vesselId ? a.vesselId : '',
      vesselImoNo: a.vesselImoNo ? a.vesselImoNo : '',
      vesselName: a.vesselName ? a.vesselName : '',
      grt: a.grt ? a.grt : '',
      vesselType: a.vesselType ? a.vesselType : '',
      officialNo: a.officialNo ? a.officialNo : '',
      portOfReg: a.portOfReg ? a.portOfReg : '',
      dateOfReg: a.dateOfReg ? a.dateOfReg : '',
      companyImoNo: a.companyImoNo ? a.companyImoNo : '',
      companyName: a.companyName ? a.companyName : '',
      companyAddress: a.companyAddress ? a.companyAddress : '',
      vesselUk: a.vesselUk ? a.vesselUk : '',
      vesselPk: a.vesselPk ? a.vesselPk : '',
      classSociety: a.classSociety ? a.classSociety : '',
      callSign: a.callSign ? a.callSign : '',
      docTypeNumber: a.docTypeNumber ? a.docTypeNumber : '',
      docTypeNo: a.docTypeNo ? a.docTypeNo : '',
      docIssuer: a.docIssuer ? a.docIssuer : '',
      docExpiry: a.docExpiry ? a.docExpiry : '',
      userIns: a.userIns ? a.userIns : '',
      dateIns: a.dateIns ? a.dateIns : '',
      title: a.title ? a.title : '',
      seal: a.seal ? a.seal : '',
      certificateLink: a.certificateLink ? a.certificateLink : '',
      consecutiveId: a.consecutiveId ? a.consecutiveId : '',
      completionDate: a.completionDate ? a.completionDate : '',
      dmlcIssueDate: a.dmlcIssueDate ? a.dmlcIssueDate : '',
      dmlcIssuePlace: a.dmlcIssuePlace ? a.dmlcIssuePlace : '',
      qid: a.qid ? a.qid : '',
    };

    console.log('TESTING OBJECT 0001', valueTestTempVariable);

    return new Promise<Object>((resolve, reject) => {
      console.log(
        'a.auditSeqNo,a.companyId, a.vesselImoNo,a.auditTypeId,a.certIssueId',
        a.completionDate,
        ' ',
        a.companyId,
        ' ',
        a.vesselImoNo,
        ' ',
        a.auditTypeId,
        ' ',
        a.certIssueId
      );
      this.database
        .executeSql(
          'DELETE FROM CERTIFICATE_DETAIL WHERE AUDIT_SEQ_NO= ?  AND COMPANY_ID=?  AND CERTIFICATE_ISSUE_ID =? ',
          [a.auditSeqNo, a.companyId, a.certIssueId]
        )
        .then((res) => {
          this.database
            .executeSql(this.CERTIFICATE_DETAIL_INS_QRY, [
              a.auditSeqNo,
              a.companyId ? a.companyId : '',
              a.seqNo ? a.seqNo : '',
              a.certificateId ? a.certificateId : '',
              a.endorsementID ? a.endorsementID : '',
              a.auditTypeId ? a.auditTypeId : '',
              a.auditSubTypeId ? a.auditSubTypeId : '',
              a.auditDate ? a.auditDate : '',
              a.issuePlace ? a.issuePlace : '',
              a.certificateNo ? a.certificateNo : '',
              a.auditReportNo ? a.auditReportNo : '',
              a.utn ? a.utn : '',
              a.certIssueId ? a.certIssueId : '',
              a.qrCodeUrl ? a.qrCodeUrl : '',
              a.certificateVer ? a.certificateVer : '',
              a.issueDate ? a.issueDate : '',
              a.expiryDate ? a.expiryDate : '',
              a.extendedIssueDate ? a.extendedIssueDate : '',
              a.extendedExpireDate ? a.extendedExpireDate : '',
              a.endorsedDate ? a.endorsedDate : '',
              a.publishStatus ? a.publishStatus : 0,
              a.activeStatus ? a.activeStatus : 0,
              a.notes ? a.notes : '',
              a.auditorName ? a.auditorName : '',
              a.issuerId ? a.issuerId : '',
              a.issuerName ? a.issuerName : '',
              a.issuerSign ? a.issuerSign : '',
              a.signDate ? a.signDate : '',
              a.nameToBePrinted ? a.nameToBePrinted : 0,
              a.signToBePrinted ? a.signToBePrinted : 0,
              a.verifyDone ? a.verifyDone : 0,
              a.vesselId ? a.vesselId : '',
              a.vesselImoNo ? a.vesselImoNo : '',
              a.vesselName ? a.vesselName : '',
              a.grt ? a.grt.toString() : '',
              a.vesselType ? a.vesselType : '',
              a.officialNo ? a.officialNo : '',
              a.portOfReg ? a.portOfReg : '',
              a.dateOfReg ? a.dateOfReg : '',
              a.companyImoNo ? a.companyImoNo : '',
              a.companyName ? a.companyName : '',
              a.companyAddress ? a.companyAddress : '',
              a.vesselUk ? a.vesselUk.toString() : '',
              a.vesselPk ? a.vesselPk.toString() : '',
              a.classSociety ? a.classSociety : '',
              a.callSign ? a.callSign : '',
              a.docTypeNumber ? a.docTypeNumber : '',
              a.docTypeNo ? a.docTypeNo : '',
              a.docIssuer ? a.docIssuer : '',
              a.docExpiry ? a.docExpiry : '',
              a.userIns ? a.userIns : '',
              a.dateIns ? a.dateIns : '',
              a.title ? a.title : '',
              a.seal ? a.seal : '',
              a.certificateLink ? a.certificateLink : '',
              a.consecutiveId ? a.consecutiveId : '',
              a.completionDate ? a.completionDate : '',
              a.dmlcIssueDate ? a.dmlcIssueDate : '',
              a.dmlcIssuePlace ? a.dmlcIssuePlace : '',
              a.certOderNo ? a.certOderNo : '',
              a.qid ? a.qid : '',
            ])
            .then((data) => {
              console.log('Testing', JSON.stringify(data));
              console.log('INSERT INTO CERTIFICATE_DETAIL:::success');

              // MOBILE-193 => change issue/expiry date and generate certificate -> update the same into audit detail.
              this.database
                .executeSql(
                  'UPDATE AUDIT_DETAILS SET CERT_ISSUED_DATE=?, CERT_EXPIRY_DATE=? WHERE AUDIT_SEQ_NO= ? AND COMPANY_ID=? AND CERTIFICATE_ISSUED_ID =?',
                  [
                    a.issueDate,
                    a.expiryDate,
                    a.auditSeqNo.toString(),
                    a.companyId,
                    a.certIssueId,
                  ]
                )
                .then((res) => {
                  console.log('UPDATE AUDIT_DETAIL Success');
                  resolve({ status: 'success' });
                })
                .catch((e) => {
                  console.log('UPDATE AUDIT_DETAIL Failed', e);
                });
            })
            .catch((e) => console.log(e));
        });
    }).catch((e) => {
      console.log('DELETE FROM CERTIFICATE_DETAIL Failed', e);
    });
  }

  public getUTNSignatureForCertificate(vesselImoNo, auditTypeId) {
    var utnSignDetails = {};
    return new Promise<Object>((resolve, reject) => {
      this.database.transaction((tx: any) => {
        //CW.QID,
        tx.executeSql(
          'SELECT AD.SIGNATURE,AD.TITLE,AD.SEAL,CW.UTN,CW.CERTIFICATE_NO,CW.AUDIT_SEQ_NO,CW.CERTIFICATE_ID ,CW.COMPANY_ID, CW.UTN,CW.AUDIT_SEQ_NO FROM AUDIT_DETAILS AD,CERTIFICATE_DETAIL_WITHOUT_AUDIT CW WHERE AD.AUDIT_SEQ_NO=AD.AUDIT_SEQ_NO AND CW.VESSEL_IMO_NO=AD.VESSEL_IMO_NO AND AD.AUDIT_TYPE_ID=CW.AUDIT_TYPE_ID and AD.VESSEL_IMO_NO=? and AD.AUDIT_TYPE_ID=?',
          [vesselImoNo, auditTypeId],
          (tx: any, utnSignRes: any) => {
            if (utnSignRes.rows.length > 0) {
              utnSignDetails = utnSignRes.rows.item(0);
              console.log('TESTING OBJ 0002', utnSignDetails);
              resolve(utnSignDetails);
            } else {
              alert('Change Audit-type..!!');
            }
          },
          (tx: any, err: any) => {
            console.log('get utnSignDetails, Operation failed.');
          }
        );
      });
    });
  }

  public getCertificateData(
    auditTypeId,
    companyId,
    certificateNo,
    vesselImoNo
  ) {
    let whereCondition =
      ' WHERE auditTypeId=? AND companyId=? AND certificateNo=? AND vesselImoNo=? AND activeStatus=1'; // AND seqNo=?";
    let resData;
    return new Promise<Object>((resolve, reject) => {
      this.database.transaction((tx: any) => {
        tx.executeSql(
          this.certificateDtlSelectQry() +
          ',' +
          '(SELECT A.AUDIT_STATUS_ID FROM AUDIT_DETAILS A WHERE A.AUDIT_SEQ_NO=C.AUDIT_SEQ_NO AND A.COMPANY_ID = C.COMPANY_ID) auditStatusId,' +
          '(SELECT A.AUDIT_TYPE_DESC FROM MA_AUDIT_TYPE A WHERE A.AUDIT_TYPE_ID = C.AUDIT_TYPE_ID AND A.COMPANY_ID = C.COMPANY_ID) auditTypeDesc,' +
          '(SELECT A.AUDIT_SUBTYPE_DESC FROM MA_AUDIT_SUBTYPE A WHERE A.AUDIT_TYPE_ID=C.AUDIT_TYPE_ID AND A.COMPANY_ID = C.COMPANY_ID AND A.AUDIT_SUBTYPE_ID = C.AUDIT_SUB_TYPE_ID) audSubTypeDesc, ' +
          '(SELECT A.AUD_OBS_ID FROM AUDIT_AUDITOR_DETAILS A WHERE A.AUDIT_SEQ_NO=C.AUDIT_SEQ_NO AND A.AUD_OBS_LEAD=1 ) leadAuditorId, ' +
          '(SELECT A.GRT FROM AUDIT_DETAILS A WHERE A.AUDIT_SEQ_NO=C.AUDIT_SEQ_NO AND A.COMPANY_ID = C.COMPANY_ID) grt ' +
          ' FROM CERTIFICATE_DETAIL C' +
          whereCondition,
          [auditTypeId, companyId, certificateNo, vesselImoNo],

          (tx: any, data: any) => {
            if (data.rows.length > 0) {
              console.log('data.rows.item(0) : ', data.rows.item(0));
              resData = [data.rows.item(0)];
              /* var resData = [{
                  "auditSeqNo": data.rows.item(0).auditSeqNo,
                  "companyId": data.rows.item(0).companyId,
                  "seqNo": data.rows.item(0).seqNo,
                  "certificateId": data.rows.item(0).certificateId,
                  "endorsementID": data.rows.item(0).endorsementID,
                  "auditTypeId": data.rows.item(0).auditTypeId,
                  "auditSubTypeId": data.rows.item(0).auditSubTypeId,
                  "auditDate": data.rows.item(0).auditDate,
                  "auditPlace": data.rows.item(0).auditPlace,
                  "certificateNo": data.rows.item(0).certificateNo,
                  "auditReportNo": data.rows.item(0).auditReportNo,
                  "utn": data.rows.item(0).utn,
                  "certIssueId": data.rows.item(0).certIssueId,
                  "qrCodeUrl": data.rows.item(0).QRCODE_URL,
                  "certificateVer": data.rows.item(0).certificateVer,
                  "certIssueDate": data.rows.item(0).certIssueDate,
                  "certExpireDate": data.rows.item(0).certExpireDate,
                  "extendedIssueDate": data.rows.item(0).extendedIssueDate,
                  "extendedExpireDate": data.rows.item(0).extendedExpireDate,
                  "endorsedDate": data.rows.item(0).endorsedDate,
                  "activeStatus": data.rows.item(0).activeStatus,
                  "notes": data.rows.item(0).notes,
                  "leadName": data.rows.item(0).leadName,
                  "issuerId": data.rows.item(0).issuerId,
                  "issuerSign": data.rows.item(0).issuerSign,
                  "issuerSignDate": data.rows.item(0).issuerSignDate,
                  "nameToPrint": data.rows.item(0).nameToPrint,
                  "signToPrint": data.rows.item(0).signToPrint,
                  "verifyDone": data.rows.item(0).verifyDone,
                  "vesselId": data.rows.item(0).vesselId,
                  "vesselImoNo": data.rows.item(0).vesselImoNo,
                  "vesselName": data.rows.item(0).vesselName,
                  "grt": data.rows.item(0).grt,
                  "vesselType": data.rows.item(0).vesselType,
                  "portOfRegistry": data.rows.item(0).portOfRegistry,
                  "dateOfRegistry": data.rows.item(0).dateOfRegistry,
                  "companyImoNo": data.rows.item(0).companyImoNo,
                  "vesselCompanyName": data.rows.item(0).vesselCompanyName,
                  "vesselCompanyAddress": data.rows.item(0).vesselCompanyAddress,
                  "vesselUk": data.rows.item(0).vesselUk,
                  "vesselPk": data.rows.item(0).vesselPk,
                  "classSociety": data.rows.item(0).classSociety,
                  "callSign": data.rows.item(0).callSign,
                  "docTypeNumber": data.rows.item(0).docTypeNumber,
                  "docTypeNo": data.rows.item(0).docTypeNo,
                  "docIssuer": data.rows.item(0).docIssuer,
                  "docExpiry": data.rows.item(0).docExpiry,
                  "userIns": data.rows.item(0).userIns,
                  "publishStatus": data.rows.item(0).publishStatus,
                  "issuerName": data.rows.item(0).issuerName,
                  "dateIns": data.rows.item(0).dateIns,
                  "officialNo": data.rows.item(0).officialNo,
                  "seal": data.rows.item(0).seal,
                  "title":data.rows.item(0).title,
                  "certificateLink": data.rows.item(0).certificateLink,
                  "consecutiveId": data.rows.item(0).consecutiveId,
                  "qid": data.rows.item(0).qid,
                  "auditStatusId": data.rows.item(0).AUDIT_SEQ_NO,
                  "auditTypeDesc": data.rows.item(0).AUDIT_SEQ_NO,
                  "audSubTypeDesc": data.rows.item(0).AUDIT_SEQ_NO,
                  "leadAuditorId": data.rows.item(0).AUDIT_SEQ_NO,
              }]; */

              resolve(resData);
            } else {
              resolve(resData);
            }
          },
          (tx: any, err: any) => {
            console.log(
              'get certificate for download certificate, Operation failed.'
            );
            reject({ status: 'Error getCertificateData' });
          }
        );
      });
    });
  }

  public getCertificateDataSeqNo(auditSeqNo) {
    return new Promise<Object>((resolve, reject) => {
      var certBased = [];
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM CERTIFICATE_DETAIL WHERE  AUDIT_SEQ_NO = ?',
            [auditSeqNo],
            (tx: any, pad: any) => {
              if (pad.rows.length > 0) {
                for (var x = 0; x < pad.rows.length; x++) {
                  console.log(pad.rows.item(x));
                  certBased.push({
                    auditSeqNo: pad.rows.item(x).AUDIT_SEQ_NO,
                    companyId: pad.rows.item(x).COMPANY_ID,
                    seqNo: pad.rows.item(x).SEQ_NO,
                    certificateId: pad.rows.item(x).CERTIFICATE_ID,
                    certificateNo: pad.rows.item(x).CERTIFICATE_NO,
                    endorsementID: pad.rows.item(x).ENDORSEMENT_ID,
                    auditTypeId: pad.rows.item(x).AUDIT_TYPE_ID,
                    auditSubTypeId: pad.rows.item(x).AUDIT_SUB_TYPE_ID,
                    auditDate: pad.rows.item(x).AUDIT_DATE,
                    endorsedDate: pad.rows.item(x).ENDORSED_DATE,
                    auditPlace: pad.rows.item(x).AUDIT_PLACE,
                    issuePlace: pad.rows.item(x).AUDIT_PLACE,
                    auditReportNo: pad.rows.item(x).AUDIT_REPORT_NO,
                    utn: pad.rows.item(x).UTN,
                    certIssueId: pad.rows.item(x).CERTIFICATE_ISSUE_ID,
                    qrCodeUrl: pad.rows.item(x).QRCODE_URL,
                    certificateVer: pad.rows.item(x).CERTIFICATE_VERSION,
                    issueDate: pad.rows.item(x).CERT_ISSUED_DATE,
                    expiryDate: pad.rows.item(x).CERT_EXPIRY_DATE,
                    extendedIssueDate: pad.rows.item(x).EXTENDED_ISSUE_DATE,
                    extendedExpireDate: pad.rows.item(x).EXTENDED_EXPIRY_DATE,
                    publishStatus: pad.rows.item(x).PUBLISH_STATUS,
                    activeStatus: pad.rows.item(x).ACTIVE_STATUS,
                    notes: pad.rows.item(x).NOTES,
                    auditorName: pad.rows.item(x).LEAD_NAME,
                    issuerId: pad.rows.item(x).ISSUER_ID,
                    issuerName: pad.rows.item(x).ISSUER_NAME,
                    issuerSign: pad.rows.item(x).ISSUER_SIGN,
                    signDate: pad.rows.item(x).ISSUER_SIGN_DATE,
                    issuerSignDate: pad.rows.item(x).ISSUER_SIGN_DATE,
                    nameToPrint: pad.rows.item(x).NAME_TO_PRINT,
                    signToPrint: pad.rows.item(x).SIGN_TO_PRINT,
                    verifyDone: pad.rows.item(x).VERIFY_DONE,
                    vesselId: pad.rows.item(x).VESSEL_ID,
                    vesselImoNo: pad.rows.item(x).VESSEL_IMO_NO,
                    vesselName: pad.rows.item(x).VESSEL_NAME,
                    grt: pad.rows.item(x).GRT,
                    vesselType: pad.rows.item(x).VESSEL_TYPE,
                    officialNo: pad.rows.item(x).OFFICIAL_NO,
                    portOfRegistry: pad.rows.item(x).PORT_OF_REGISTRY,
                    dateOfRegistry: pad.rows.item(x).DATE_OF_REGISTRY,
                    companyImoNo: pad.rows.item(x).COMPANY_IMO_NO,
                    companyname: pad.rows.item(x).VESSEL_COMPANY_NAME,
                    companyaddress: pad.rows.item(x).VESSEL_COMPANY_ADDRESS,
                    vesselCompanyName: pad.rows.item(x).VESSEL_COMPANY_NAME,
                    vesselCompanyAddress:
                      pad.rows.item(x).VESSEL_COMPANY_ADDRESS,
                    vesselUk: pad.rows.item(x).VESSEL_UK,
                    vesselPk: pad.rows.item(x).VESSEL_PK,
                    classSociety: pad.rows.item(x).CLASS_SOCIETY,
                    callSign: pad.rows.item(x).CALL_SIGN,
                    docTypeNumber: pad.rows.item(x).DOC_TYPE_NUMBER,
                    docTypeNo: pad.rows.item(x).DOC_TYPE,
                    docIssuer: pad.rows.item(x).DOC_ISSUER,
                    docExpiry: pad.rows.item(x).DOC_EXPIRY,
                    userIns: pad.rows.item(x).USER_INS,
                    dateIns: pad.rows.item(x).DATE_INS,
                    title: pad.rows.item(x).TITLE,
                    seal: pad.rows.item(x).SEAL,
                    certificateLink: pad.rows.item(x).CERTIFICATE_LINK_SEQ,
                    consecutiveId: pad.rows.item(x).CONSECTIVE_SUBSEQUENT,
                    completionDate: pad.rows.item(x).COMPLETION_DATE,
                    dmlcIssueDate: pad.rows.item(x).DMLCII_ISSUE_DATE,
                    dmlcIssuePlace: pad.rows.item(x).DMLCII_ISSUE_LOCATION,
                    certOderNo: pad.rows.item(x).CERT_ORDER_NO,
                    qid: pad.rows.item(x).QID,
                  });
                }
              } else {
                console.log('0 previousAudits found');
                resolve(certBased);
              }
            },
            (tx: any, err: any) => {
              console.log('failed');
            }
          );
        })
        .then(() => {
          resolve(certBased);
        });
    });
  }

  public getAuditDataSeqNo(auditSeqNo) {
    return new Promise<Object>((resolve, reject) => {
      var auditBased = [];
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM AUDIT_DETAILS WHERE  AUDIT_SEQ_NO = ?',
            [auditSeqNo],
            (tx: any, pad: any) => {
              if (pad.rows.length > 0) {
                for (var x = 0; x < pad.rows.length; x++) {
                  console.log(pad.rows.item(x));
                  auditBased.push({
                    auditSeqNo: pad.rows.item(0).AUDIT_SEQ_NO,
                    companyId: pad.rows.item(0).COMPANY_ID,
                    auditTypeId: pad.rows.item(0).AUDIT_TYPE_ID,
                    vesselImoNo: pad.rows.item(0).VESSEL_IMO_NO,
                    auditSubTypeId: pad.rows.item(0).AUDIT_SUB_TYPE_ID,
                    certificateNo: pad.rows.item(0).CERTIFICATE_NO,
                    auditDate: pad.rows.item(0).AUDIT_DATE,
                    auditPlace: pad.rows.item(0).AUDIT_PLACE,
                    companyImoNo: pad.rows.item(0).COMPANY_IMO_NO,
                    companyDoc: pad.rows.item(0).COMPANY_DOC,
                    auditStatusId: pad.rows.item(0).AUDIT_STATUS_ID,
                    auditReportNo: pad.rows.item(0).AUDIT_REPORT_NO,
                    certIssueId: pad.rows.item(0).CERTIFICATE_ISSUED_ID,
                    interalAuditDate: pad.rows.item(0).INTERNAL_AUDIT_DATE,
                    certExpireDate: pad.rows.item(0).CERT_EXPIRY_DATE,
                    certIssueDate: pad.rows.item(0).CERT_ISSUED_DATE,
                    openMeetingDate: pad.rows.item(0).OPEN_MEETING_DATE,
                    closeMeetingDate: pad.rows.item(0).CLOSE_MEETING_DATE,
                    auditSummaryId: pad.rows.item(0).AUDIT_SUMMARY_ID,
                    lockStatus: 0,
                    narrativeSummary: pad.rows.item(0).NARRATIVE_SUMMARY,
                    userIns: pad.rows.item(0).USER_INS,
                    dateIns: pad.rows.item(0).DATE_INS,
                    lockHolder: '',
                    reviewStatus: pad.rows.item(0).REVIEW_STATUS,
                    docFlag: pad.rows.item(0).DOC_FLAG,
                    vesselNameAud: pad.rows.item(0).VESSEL_NAME,
                    vesselTypeAud: pad.rows.item(0).VESSEL_TYPE,
                    docExpiryAud: pad.rows.item(0).DOC_EXPIRY,
                    docIssuerAud: pad.rows.item(0).DOC_ISSUER,
                    companyAddressAud: pad.rows.item(0).VESSEL_ADDRESS,
                    officialNoAud: pad.rows.item(0).OFFICIAL_NO,
                    docTypeNoAud: pad.rows.item(0).DOC_TYPE_NO,
                    certificateVer: pad.rows.item(0).CERTIFICATE_VERSION,
                  });
                }
              } else {
                console.log('Audits found');
                resolve(auditBased);
              }
            },
            (tx: any, err: any) => {
              console.log('failed');
            }
          );
        })
        .then(() => {
          resolve(auditBased);
        });
    });
  }

  public prepareAndSaveJsonFile(seqNo) {
    return new Promise<Object>((resolve, reject) => {
      var AuditData,
        data,
        prevSeqNos = [],
        findAttachment = [],
        findingData = [],
        findingDetails = [],
        auditorDetailsData = [],
        auditReportData = [],
        prevFindingData = [],
        prevFindingDetails = [],
        prevFindAttachment = [],
        sspReviewDetail = [],
        certificateDetail = [];

      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM AUDIT_DETAILS WHERE AUDIT_SEQ_NO=?',
            [seqNo],
            (tx: any, AuditDtldata: any) => {
              console.log(AuditDtldata.rows.item(0));
              data = AuditDtldata.rows.item(0);
              console.log('@Audit Dtl Data');
            },
            (tx: any, err: any) => {
              console.log('SELECT * FROM AUDIT_DETAILS, Operation failed.');
              reject({ error: 'error getting audit data' });
            }
          );
        })
        .then(() => {
          /* current findings */
          console.log('@current findings');
          if (data) {
            this.database
              .transaction((tx: any) => {
                tx.executeSql(
                  'SELECT * FROM AUDIT_FINDINGS WHERE ORIG_SEQ_NO=?',
                  [data.AUDIT_SEQ_NO],
                  (tx: any, find: any) => {
                    if (find.rows.length > 0) {
                      for (var j = 0; j < find.rows.length; j++) {
                        findingData.push({
                          findingSeqNo: find.rows.item(j).FINDING_NO,
                          auditSeqNo: find.rows.item(j).ORIG_SEQ_NO,
                          companyId: find.rows.item(j).COMPANY_ID,
                          auditTypeId: data.AUDIT_TYPE_ID,
                          auditDate: find.rows.item(j).AUDIT_DATE, //moment(b[4], 'YYYYMMDD').format('YYYY-MM-DD'), //b[4],
                          auditCode: find.rows.item(j).AUDIT_CODE,
                          userIns: find.rows.item(j).USER_INS,
                          dateIns: find.rows.item(j).DATE_INS, //moment(b[9], 'YYYYMMDD').format('YYYY-MM-DD'), //b[9],
                          findingStatus: find.rows.item(j).FINDING_STATUS,
                          auditStatus: find.rows.item(j).AUDIT_STATUS,     //added by archana for jira-id-MOBILE-891
                          findingDetail: [],
                          serialNo: find.rows.item(j).SERIAL_NO,
                        });
                      }
                    }
                  },
                  (tx: any, err: any) => {
                    console.log(
                      'SELECT * FROM AUDIT_FINDINGS, Operation failed.'
                    );
                    reject({ error: 'error getting finding data' });
                  }
                );
              })
              .then(() => {
                if (findingData.length > 0) {
                  findingData.forEach((finding, i) => {
                    console.log(
                      'findings[' + i + '] from finding details',
                      findingData[i]
                    );
                    let findingsNo = finding.findingsNo;

                    this.database
                      .transaction((tx: any) => {
                        // findingData.forEach((a, index) => {

                        //   console.log(finding)

                        tx.executeSql(
                          'SELECT * FROM AUDIT_FINDINGS_DETAILS WHERE ORIG_SEQ_NO=? AND FINDING_NO=?',
                          [finding.auditSeqNo, finding.findingSeqNo],
                          (tx: any, findDtl: any) => {
                            if (findDtl.rows.length > 0) {
                              for (var l = 0; l < findDtl.rows.length; l++) {
                                console.log(
                                  findingData[i],
                                  findDtl.rows.item(l)
                                );

                                findingData[i].findingDetail.push({
                                  auditTypeId: data.AUDIT_TYPE_ID,
                                  statusSeqNo:
                                    findDtl.rows.item(l).FINDING_SEQ_NO,
                                  categoryId:
                                    findDtl.rows.item(l).CATEGORY_ID,
                                  statusId: findDtl.rows.item(l).STATUS_ID,
                                  statusDate:
                                    findDtl.rows.item(l).STATUS_DATE, //c[7] ? moment(c[7], 'YYYYMMDD').format('YYYY-MM-DD') : '',
                                  nextActionId:
                                    findDtl.rows.item(l).NEXT_ACTION_ID,
                                  dueDate: isNaN(
                                    new Date(
                                      findDtl.rows.item(l).DUE_DATE
                                    ).getDate()
                                  )
                                    ? findDtl.rows.item(l).DUE_DATE
                                    : moment(
                                      new Date(
                                        findDtl.rows.item(l).DUE_DATE
                                      )
                                    ).format('DD-MMM-YYYY'),
                                  descriptions:
                                    findDtl.rows.item(l).DESCRIPTION,
                                  userIns: findDtl.rows.item(l).USER_INS,
                                  dateIns: findDtl.rows.item(l).DATE_INS, //moment(c[13], 'YYYYMMDD').format('YYYY-MM-DD'), //c[13],
                                  findingSeqNo:
                                    findDtl.rows.item(l).FINDING_NO,
                                  origAuditSeqNo:
                                    findDtl.rows.item(l).ORIG_SEQ_NO,
                                  currentAuditSeq:
                                    findDtl.rows.item(l).CUR_AUDIT_SEQ_NO,
                                  companyId: findDtl.rows.item(l).COMPANY_ID,
                                  auditPlace: findDtl.rows.item(l).AUDIT_PLACE
                                    ? findDtl.rows.item(l).AUDIT_PLACE
                                    : '',
                                  updateDescription: findDtl.rows.item(l)
                                    .UPDATE_DESCRIPTION
                                    ? findDtl.rows.item(l).UPDATE_DESCRIPTION
                                    : '',
                                  findingRptAttachs: [],
                                });
                              }
                              //  console.log("findingDetails", findingDetails);
                              //a.findingDetail = findingDetails;
                              // findingDetails = [];
                              // console.log("a [" + index + "]", a);
                            }
                          },
                          (tx: any, err: any) => {
                            console.log(
                              'SELECT * FROM AUDIT_FINDINGS_DETAILS, Operation failed.'
                            );
                            reject({
                              error: 'error getting finding Dtls data',
                            });
                          }
                        );
                        // });
                      })
                      .then(() => {
                        this.database.transaction((tx: any) => {
                          console.log(findingData[i]);

                          findingData[i].findingDetail.forEach((b, ind) => {
                            console.log('findingDetailsInAttach', b);

                            tx.executeSql(
                              'SELECT * FROM AUDIT_FINDING_ATTACHMENTS WHERE ORIG_SEQ_NO=? AND FINDING_NO=? AND FINDING_SEQ_NO=?',
                              [b.origAuditSeqNo, b.findingSeqNo, b.statusSeqNo],
                              (tx: any, findattach: any) => {
                                if (findattach.rows.length > 0) {
                                  for (
                                    var k = 0;
                                    k < findattach.rows.length;
                                    k++
                                  ) {
                                    console.log(
                                      'attachement test ',
                                      findattach.rows.item(k)
                                    );

                                    findingData[i].findingDetail[
                                      ind
                                    ].findingRptAttachs.push({
                                      fileSeqNo:
                                        findattach.rows.item(k).FILE_SEQ_NO,
                                      findingSeqNo:
                                        findattach.rows.item(k).FINDING_NO,
                                      origAuditSeqNo:
                                        findattach.rows.item(k).ORIG_SEQ_NO,
                                      currentAuditSeq:
                                        findattach.rows.item(k)
                                          .CUR_AUDIT_SEQ_NO,
                                      companyId:
                                        findattach.rows.item(k).COMPANY_ID,
                                      auditTypeId: data.AUDIT_TYPE_ID,
                                      statusSeqNo:
                                        findattach.rows.item(k).FINDING_SEQ_NO,
                                      fileName:
                                        findattach.rows.item(k).FILE_NAME,
                                      ownerFlag: findattach.rows.item(k).FLAG,
                                      userIns: findattach.rows.item(k).USER_INS,
                                      dateIns: findattach.rows.item(k).DATE_INS, //moment(d[10], 'YYYYMMDD').format('YYYY-MM-DD')//d[10]
                                    });
                                  }
                                  /* findingData[i].findingDetail[
                                    b
                                  ].findingRptAttachs = findAttachment;
                                  findAttachment = []; */
                                  /*  b.findingRptAttachs = findAttachment;
                                  findAttachment = []; */
                                }
                              },
                              (tx: any, err: any) => {
                                console.log(
                                  'SELECT * FROM AUDIT_FINDING_ATTACHMENTS, Operation failed.'
                                );
                                reject({
                                  error: 'error getting finding attach data',
                                });
                              }
                            );
                          });
                        });
                        //Auditor Dtl Data
                      });
                  });
                }
              })
              .then(() => {
                /* Auditor Dtl Data */
                console.log('@Auditor Dtl Data');
                this.database
                  .transaction((tx: any) => {
                    tx.executeSql(
                      'SELECT * FROM AUDIT_AUDITOR_DETAILS WHERE AUDIT_SEQ_NO=?',
                      [data.AUDIT_SEQ_NO],
                      (tx: any, auditorData: any) => {
                        if (auditorData.rows.length > 0) {
                          for (var i = 0; i < auditorData.rows.length; i++) {
                            auditorDetailsData.push({
                              userId: auditorData.rows.item(i).AUD_OBS_ID,
                              auditSeqNo: auditorData.rows.item(i).AUDIT_SEQ_NO,
                              companyId: auditorData.rows.item(i).COMPANY_ID,
                              auditTypeId: data.AUDIT_TYPE_ID,
                              auditRoleID:
                                auditorData.rows.item(i).AUD_OBS_TYPE_ID,
                              auditorName:
                                auditorData.rows.item(i).AUDITOR_NAME,
                              audSignature:
                                auditorData.rows.item(i).AUD_SIGNATURE,
                              audSignatureDate: auditorData.rows.item(i)
                                .AUD_SIGNATURE_DATE
                                ? auditorData.rows.item(i).AUD_SIGNATURE_DATE
                                : '',
                              audLeadStatus:
                                auditorData.rows.item(i).AUD_OBS_LEAD,
                              userIns: auditorData.rows.item(i).USER_INS,
                              dateIns: auditorData.rows.item(i).DATE_INS,
                            });
                          }
                        }
                      },
                      (tx: any, err: any) => {
                        console.log(
                          'SELECT * FROM AUDIT_AUDITOR_DETAILS, Operation failed.'
                        );
                        reject({ error: 'error getting auditor data' });
                      }
                    );
                  })
                  .then(() => {
                    /* attachment Data */
                    console.log('@attachment Data');
                    auditReportData = [];
                    this.database
                      .transaction((tx: any) => {
                        tx.executeSql(
                          'SELECT * FROM AUDIT_REPORT_ATTACHMENTS WHERE AUDIT_SEQ_NO=?',
                          [data.AUDIT_SEQ_NO],
                          (tx: any, reportData: any) => {
                            if (reportData.rows.length > 0) {
                              for (var j = 0; j < reportData.rows.length; j++) {
                                console.log(j, reportData.rows.item(j));
                                auditReportData.push({
                                  seqNo: reportData.rows.item(j).SEQ_NO,
                                  auditSeqNo:
                                    reportData.rows.item(j).AUDIT_SEQ_NO,
                                  companyId: reportData.rows.item(j).COMPANY_ID,
                                  auditTypeId: data.AUDIT_TYPE_ID,
                                  fileName: reportData.rows.item(j).FILE_NAME,
                                  comments: reportData.rows.item(j).COMMENTS,
                                  attachmentTypeId:
                                    reportData.rows.item(j).ATTACHMENT_TYPE_ID,
                                  userIns: reportData.rows.item(j).USER_INS,
                                  dateIns: reportData.rows.item(j).DATE_INS,
                                  otherType: reportData.rows.item(j).OTHER_TYPE,
                                  mandatory: reportData.rows.item(j).MANDATORY,
                                  attchmentTypeDesc:
                                    reportData.rows.item(j)
                                      .ATTACHMENTT_TYPE_DESC,
                                  attchTypeDescAudit:
                                    reportData.rows.item(j)
                                      .ATTACHMENTT_TYPE_DESC,
                                });
                              }
                            }
                          },
                          (tx: any, err: any) => {
                            console.log(
                              'SELECT * FROM AUDIT_REPORT_ATTACHMENTS, Operation failed.'
                            );
                            reject({
                              error: 'error getting report attachment data',
                            });
                          }
                        );
                      })
                      .then(() => {
                        /* sspDtl Data */
                        console.log('@sspDtl Data');
                        //sspReviewDetail = [];
                        this.database
                          .transaction((tx: any) => {
                            tx.executeSql(
                              'SELECT AUDIT_SEQ_NO auditSeqNo, AUDIT_TYPE_ID auditTypeId, COMPANY_ID companyId, SSP_REPORT_NO sspReportNo, SSP_LEAD_NAME sspLeadName, SSP_REVISION_NO sspRevisionNo,  SSP_DMLC_AUDIT_SEQ_NO sspDmlcAuditSeqNo, DUE_DATE dueDate,' +
                              'VESSEL_COMPANY_ADDRESS vesselCompanyAddress, VESSEL_COMPANY_NAME vesselCompanyName, LTRSTATUS ltrStatus, DMLC_AUDIT_PLACE dmlcAuditPlace, DMLC_ISSUED_DATE dmlcIssuedDate FROM SSP_REVIEW_DATA WHERE AUDIT_SEQ_NO = ?',
                              [data.AUDIT_SEQ_NO],
                              (tx: any, sspData: any) => {
                                if (sspData.rows.length > 0) {
                                  sspReviewDetail = [sspData.rows.item(0)];
                                }
                              },
                              (tx: any, err: any) => {
                                console.log(
                                  'SELECT * FROM SSP_REVIEW_DATA, Operation failed.'
                                );
                                reject({
                                  error: 'error getting report sspDtl data',
                                });
                              }
                            );
                          })
                          .then(() => {
                            /* cetificate dtl Data */
                            console.log('@cetificate dtl Data');
                            this.database
                              .transaction((tx: any) => {
                                tx.executeSql(
                                  this.certificateDtlSelectQry() +
                                  ' FROM CERTIFICATE_DETAIL WHERE auditSeqNo=? and auditSeqNo not in (600001,600002,600003)',
                                  [data.AUDIT_SEQ_NO],
                                  (tx: any, certData: any) => {
                                    if (certData.rows.length > 0) {
                                      certData.rows.item(0).completionDate =
                                        certData.rows.item(0).completionDate
                                          ? moment(
                                            certData.rows.item(0)
                                              .completionDate,
                                          ).format('DD-MMM-YYYY')//modified by lokesh for jira_id(910)
                                          : '';
                                      certificateDetail = [
                                        certData.rows.item(0),
                                      ];
                                      console.log(certificateDetail);
                                    }
                                  },
                                  (tx: any, err: any) => {
                                    console.log(
                                      'SELECT * FROM CERTIFICATE_DETAIL, Operation failed.'
                                    );
                                    reject({
                                      error: 'error getting certData dtl data',
                                    });
                                  }
                                );
                              })
                              .then(() => {
                                //previous audits
                                console.log('@previous audits');
                                this.database
                                  .transaction((tx: any) => {
                                    tx.executeSql(
                                      'SELECT AUDIT_SEQ_NO FROM AUDIT_DETAILS WHERE VESSEL_IMO_NO=? AND AUDIT_TYPE_ID=? AND date(AUDIT_DATE)<?',
                                      [
                                        data.VESSEL_IMO_NO,
                                        data.AUDIT_TYPE_ID,
                                        data.AUDIT_DATE,
                                      ],
                                      (tx: any, seqData: any) => {
                                        if (seqData.rows.length > 0) {
                                          for (
                                            var x = 0;
                                            x < seqData.rows.length;
                                            x++
                                          ) {
                                            prevSeqNos.push(
                                              seqData.rows.item(x)
                                            );
                                          }
                                        }
                                      },
                                      (tx: any, err: any) => {
                                        console.log(
                                          'SELECT AUDIT_SEQ_NO FROM AUDIT_DETAILS, Operation failed.'
                                        );
                                        reject({
                                          error:
                                            'error getting seqData dtl data',
                                        });
                                      }
                                    );
                                  })
                                  .then(() => {
                                    //previoius findings
                                    console.log('@previous findings');
                                    this.database
                                      .transaction((tx: any) => {
                                        prevSeqNos.forEach((pasd, i) => {
                                          let previousAuditSeqNo =
                                            pasd.AUDIT_SEQ_NO;
                                          //console.log('previousAuditSeqNo',previousAuditSeqNo);
                                          tx.executeSql(
                                            'SELECT * FROM AUDIT_FINDINGS WHERE date(AUDIT_DATE)<? AND ORIG_SEQ_NO=? ORDER BY CUR_AUDIT_SEQ_NO DESC',
                                            [
                                              data.AUDIT_DATE,
                                              previousAuditSeqNo,
                                            ],
                                            (tx: any, prevFindData: any) => {
                                              if (
                                                prevFindData.rows.length > 0
                                              ) {
                                                for (
                                                  var y = 0;
                                                  y < prevFindData.rows.length;
                                                  y++
                                                ) {
                                                  console.log(
                                                    'previous finding ' +
                                                    (y + 1) +
                                                    ' ',
                                                    prevFindData.rows.item(y)
                                                  );
                                                  prevFindingData.push({
                                                    findingSeqNo:
                                                      prevFindData.rows.item(y)
                                                        .FINDING_NO,
                                                    // "findingNo": prevFindData.rows.item(y).FINDING_NO,
                                                    auditSeqNo:
                                                      prevFindData.rows.item(y)
                                                        .ORIG_SEQ_NO,
                                                    companyId:
                                                      prevFindData.rows.item(y)
                                                        .COMPANY_ID,
                                                    auditTypeId:
                                                      data.AUDIT_TYPE_ID,
                                                    findingStatus:
                                                      prevFindData.rows.item(y)
                                                        .FINDING_STATUS,
                                                    auditDate:
                                                      prevFindData.rows.item(y)
                                                        .AUDIT_DATE,
                                                    auditCode:
                                                      prevFindData.rows.item(y)
                                                        .AUDIT_CODE,
                                                    userIns:
                                                      prevFindData.rows.item(y)
                                                        .USER_INS,
                                                    dateIns:
                                                      prevFindData.rows.item(y)
                                                        .DATE_INS,
                                                    serialNo:
                                                      prevFindData.rows.item(y)
                                                        .SERIAL_NO,
                                                    auditStatus:
                                                      prevFindData.rows.item(y)
                                                        .AUDIT_STATUS,
                                                    findingDetail: [],
                                                  });
                                                }
                                              }
                                            },
                                            (tx: any, err: any) => {
                                              console.log(
                                                'SELECT * FROM AUDIT_FINDINGS, Operation failed.'
                                              );
                                              reject({
                                                error:
                                                  'error getting previous audit dtl data',
                                              });
                                            }
                                          );
                                        });
                                      })
                                      .then(() => {
                                        //previoius findings details
                                        console.log(
                                          '@previous finding details'
                                        );
                                        this.database
                                          .transaction((tx: any) => {
                                            if (prevFindingData.length > 0) {
                                              prevFindingData.forEach(
                                                (pf, ind) => {
                                                  let previousAuditFinding = pf;
                                                  tx.executeSql(
                                                    'SELECT * FROM AUDIT_FINDINGS_DETAILS WHERE ORIG_SEQ_NO=? AND FINDING_NO=? ',
                                                    [
                                                      previousAuditFinding.auditSeqNo,
                                                      previousAuditFinding.findingSeqNo,
                                                    ],
                                                    (
                                                      tx: any,
                                                      prevFindDtlData: any
                                                    ) => {
                                                      if (
                                                        prevFindDtlData.rows
                                                          .length > 0
                                                      ) {
                                                        for (
                                                          var z = 0;
                                                          z <
                                                          prevFindDtlData.rows
                                                            .length;
                                                          z++
                                                        ) {
                                                          prevFindingDetails.push(
                                                            {
                                                              statusSeqNo:
                                                                prevFindDtlData.rows.item(
                                                                  z
                                                                )
                                                                  .FINDING_SEQ_NO,
                                                              findingSeqNo:
                                                                prevFindDtlData.rows.item(
                                                                  z
                                                                ).FINDING_NO,
                                                              origAuditSeqNo:
                                                                prevFindDtlData.rows.item(
                                                                  z
                                                                ).ORIG_SEQ_NO,
                                                              currentAuditSeq:
                                                                prevFindDtlData.rows.item(
                                                                  z
                                                                )
                                                                  .CUR_AUDIT_SEQ_NO,
                                                              companyId:
                                                                prevFindDtlData.rows.item(
                                                                  z
                                                                ).COMPANY_ID,
                                                              auditTypeId:
                                                                prevFindDtlData.rows.item(
                                                                  z
                                                                ).AUDIT_TYPE_ID
                                                                  ? prevFindDtlData.rows.item(
                                                                    z
                                                                  )
                                                                    .AUDIT_TYPE_ID
                                                                  : '',
                                                              categoryId:
                                                                prevFindDtlData.rows.item(
                                                                  z
                                                                ).CATEGORY_ID,
                                                              statusId:
                                                                prevFindDtlData.rows.item(
                                                                  z
                                                                ).STATUS_ID,
                                                              statusDate:
                                                                prevFindDtlData.rows.item(
                                                                  z
                                                                ).STATUS_DATE, //moment(prevFindDtlData.rows.item(z).STATUS_DATE, 'YYYYMMDD').format('YYYY-MM-DD'), //moment(new Date(prevFDet[7])).format('YYYY-MM-DD'), //prevFDet[7],
                                                              nextActionId:
                                                                prevFindDtlData.rows.item(
                                                                  z
                                                                )
                                                                  .NEXT_ACTION_ID,
                                                              dueDate:
                                                                prevFindDtlData.rows.item(
                                                                  z
                                                                ).DUE_DATE,
                                                              descriptions:
                                                                prevFindDtlData.rows.item(
                                                                  z
                                                                ).DESCRIPTION
                                                                  ? prevFindDtlData.rows.item(
                                                                    z
                                                                  )
                                                                    .DESCRIPTION
                                                                  : '',
                                                              userIns:
                                                                prevFindDtlData.rows.item(
                                                                  z
                                                                ).USER_INS,
                                                              dateIns:
                                                                prevFindDtlData.rows.item(
                                                                  z
                                                                ).DATE_INS,
                                                              findingRptAttachs:
                                                                [],
                                                              updateDescription: prevFindDtlData.rows.item(z).UPDATE_DESCRIPTION ? prevFindDtlData.rows.item(z).UPDATE_DESCRIPTION : '',  //added by archana for jira Id-MOBILE-863 
                                                              auditPlace: prevFindDtlData.rows.item(z).AUDIT_PLACE ?  prevFindDtlData.rows.item(z).AUDIT_PLACE : '',                      //added by archana for jira Id-MOBILE-863
                                                              // "updateDescription": prevFindDtlData.rows.item(z).UPDATE_DESCRIPTION ? prevFindDtlData.rows.item(z).UPDATE_DESCRIPTION : '',
                                                              //  "auditPlace": prevFindDtlData.rows.item(z).AUDIT_PLACE ? prevFindDtlData.rows.item(z).AUDIT_PLACE : '',
                                                            }
                                                          );
                                                        }
                                                        prevFindingData[
                                                          ind
                                                        ].findingDetail = prevFindingDetails;
                                                        // pf.findingDetail = prevFindingDetails;
                                                        prevFindingDetails = [];
                                                        //console.log("pf",pf);
                                                      }
                                                    },
                                                    (tx: any, err: any) => {
                                                      console.log(
                                                        'SELECT * FROM AUDIT_FINDINGS_DETAILS, Operation failed.'
                                                      );
                                                      reject({
                                                        error:
                                                          'error getting previous finding dtl data',
                                                      });
                                                    }
                                                  );
                                                }
                                              );
                                            }
                                          })
                                          .then(() => {
                                            //previoius findings attachments
                                            console.log(
                                              '@previous finding attachments'
                                            );
                                            this.database
                                              .transaction((tx: any) => {
                                                if (
                                                  prevFindingData.length > 0
                                                ) {
                                                  prevFindingData.forEach(
                                                    (pf, i) => {
                                                      pf.findingDetail.forEach(
                                                        (pfd, pdfIndex) => {
                                                          let previousFindDtl =
                                                            pfd;
                                                          //prevFindAttachment
                                                          tx.executeSql(
                                                            'SELECT * FROM AUDIT_FINDING_ATTACHMENTS WHERE ORIG_SEQ_NO=? AND FINDING_NO=? AND FINDING_SEQ_NO=?',
                                                            [
                                                              previousFindDtl.origAuditSeqNo,
                                                              previousFindDtl.findingSeqNo,
                                                              previousFindDtl.statusSeqNo,
                                                            ],
                                                            (
                                                              tx: any,
                                                              prevFindAttachData: any
                                                            ) => {
                                                              if (
                                                                prevFindAttachData
                                                                  .rows.length >
                                                                0
                                                              ) {
                                                                for (
                                                                  var d = 0;
                                                                  d <
                                                                  prevFindAttachData
                                                                    .rows
                                                                    .length;
                                                                  d++
                                                                ) {
                                                                  prevFindAttachment.push(
                                                                    {
                                                                      fileSeqNo:
                                                                        prevFindAttachData.rows.item(
                                                                          d
                                                                        )
                                                                          .FILE_SEQ_NO,
                                                                      findingSeqNo:
                                                                        prevFindAttachData.rows.item(
                                                                          d
                                                                        )
                                                                          .FINDING_NO,
                                                                      origAuditSeqNo:
                                                                        prevFindAttachData.rows.item(
                                                                          d
                                                                        )
                                                                          .ORIG_SEQ_NO,
                                                                      currentAuditSeq:
                                                                        prevFindAttachData.rows.item(
                                                                          d
                                                                        )
                                                                          .CUR_AUDIT_SEQ_NO,
                                                                      companyId:
                                                                        prevFindAttachData.rows.item(
                                                                          d
                                                                        )
                                                                          .COMPANY_ID,
                                                                      auditTypeId:
                                                                        data.AUDIT_TYPE_ID,
                                                                      statusSeqNo:
                                                                        prevFindAttachData.rows.item(
                                                                          d
                                                                        )
                                                                          .FINDING_SEQ_NO,
                                                                      fileName:
                                                                        prevFindAttachData.rows.item(
                                                                          d
                                                                        )
                                                                          .FILE_NAME,
                                                                      ownerFlag:
                                                                        prevFindAttachData.rows.item(
                                                                          d
                                                                        ).FLAG,
                                                                      userIns:
                                                                        prevFindAttachData.rows.item(
                                                                          d
                                                                        )
                                                                          .USER_INS,
                                                                      dateIns:
                                                                        prevFindAttachData.rows.item(
                                                                          d
                                                                        )
                                                                          .DATE_INS, //moment(prevFindAttachData.rows.item(d).DATE_INS, 'YYYYMMDD').format('YYYY-MM-DD')//preAtt[10]
                                                                    }
                                                                  );
                                                                }
                                                                console.log(
                                                                  i,
                                                                  pdfIndex
                                                                );
                                                                prevFindingData[
                                                                  i
                                                                ].findingDetail[
                                                                  pdfIndex
                                                                ].findingRptAttachs =
                                                                  prevFindAttachment;
                                                                prevFindAttachment =
                                                                  [];
                                                              }
                                                            }
                                                          );
                                                        }
                                                      );
                                                    }
                                                  );
                                                }
                                              })
                                              .then(() => {
                                                console.log(
                                                  'seqData',
                                                  prevSeqNos
                                                );
                                                AuditData = {
                                                  auditSeqNo: data.AUDIT_SEQ_NO,
                                                  companyId: data.COMPANY_ID,
                                                  auditTypeId:
                                                    data.AUDIT_TYPE_ID,
                                                  vesselImoNo:
                                                    data.VESSEL_IMO_NO,
                                                  auditSubTypeId:
                                                    data.AUDIT_SUB_TYPE_ID,
                                                  certificateNo:
                                                    data.CERTIFICATE_NO,
                                                  auditDate: data.AUDIT_DATE,
                                                  auditPlace: data.AUDIT_PLACE,
                                                  companyImoNo:
                                                    data.COMPANY_IMO_NO, //*
                                                  companyDoc: data.COMPANY_DOC,
                                                  auditStatusId:
                                                    data.AUDIT_STATUS_ID,
                                                  auditReportNo:
                                                    data.AUDIT_REPORT_NO,
                                                  certIssueId:
                                                    data.CERTIFICATE_ISSUED_ID
                                                      ? data.CERTIFICATE_ISSUED_ID
                                                      : null,
                                                  interalAuditDate:
                                                    data.INTERNAL_AUDIT_DATE,
                                                  certIssueDate:
                                                    data.CERT_ISSUED_DATE,
                                                  certExpireDate:
                                                    data.AUDIT_TYPE_ID == 1005
                                                      ? null
                                                      : data.CERT_EXPIRY_DATE,
                                                  openMeetingDate:
                                                    data.OPEN_MEETING_DATE,
                                                  closeMeetingDate:
                                                    data.CLOSE_MEETING_DATE,
                                                  auditSummaryId:
                                                    data.AUDIT_SUMMARY_ID,
                                                  lockStatus:
                                                    data.LOCK_STATUS == 1
                                                      ? 0
                                                      : data.LOCK_STATUS
                                                        ? data.LOCK_STATUS
                                                        : 0,
                                                  lockHolder: data.LOCK_HOLDER
                                                    ? data.LOCK_HOLDER
                                                    : data.USER_INS,
                                                  narrativeSummary:
                                                    data.NARRATIVE_SUMMARY,
                                                  certificateData:
                                                    data.AUDIT_TYPE_ID == 1005
                                                      ? null
                                                      : '',
                                                  userIns: data.USER_INS,
                                                  dateIns: data.DATE_INS,
                                                  auditAuditorDetail:
                                                    auditorDetailsData,
                                                  auditRptAttach:
                                                    auditReportData,
                                                  auditFinding: findingData,
                                                  reviewStatus: 0,
                                                  endorseExpireDate:
                                                    data.ENDORSE_EXPIRY_DATE
                                                      ? data.ENDORSE_EXPIRY_DATE
                                                      : '',
                                                  docFlag: data.DOC_FLAG,
                                                  certificateDetail:
                                                    certificateDetail,
                                                  docTypeNumber:
                                                    data.DOC_TYPE_NUMBER,
                                                  grt: data.GRT,
                                                  dateOfRegistry:
                                                    data.DATE_OF_REGISTRY
                                                      ? data.DATE_OF_REGISTRY
                                                      : '',
                                                  allowNext: data.ALLOW_NEXT,
                                                  sspReviewDetail:
                                                    sspReviewDetail,
                                                  makeFinal: data.MAKE_FINAL ? data.MAKE_FINAL : 0,               //added by archana for jira ID-MOBILE-916
                                                  scope: data.SCOPE
                                                    ? data.SCOPE
                                                    : null,
                                                  title: data.TITLE
                                                    ? data.TITLE
                                                    : null,
                                                  creditDate: data.CREDIT_DATE
                                                    ? data.CREDIT_DATE
                                                    : '',
                                                  vesselNameAud:
                                                    data.VESSEL_NAME,
                                                  vesselTypeAud:
                                                    data.VESSEL_TYPE,
                                                  docExpiryAud: data.DOC_EXPIRY,
                                                  docIssuerAud: data.DOC_ISSUER,
                                                  companyAddressAud:
                                                    data.VESSEL_ADDRESS,
                                                  officialNoAud:
                                                    data.OFFICIAL_NO,
                                                  docTypeNoAud:
                                                    data.DOC_TYPE_NO,
                                                  certificateVer:
                                                    data.CERTIFICATE_VERSION,
                                                  certificateWithoutAudit: [], //"certificateWithoutAudit"
                                                };
                                                console.log(
                                                  'Final AuditData : ',
                                                  AuditData
                                                );
                                                console.log(
                                                  'prevFindingData',
                                                  prevFindingData
                                                );
                                                resolve({
                                                  AuditData,
                                                  prevFindingData,
                                                });
                                              }); //final audit data
                                          }); //previous audit finding attachment
                                      }); //previous audit finding details
                                  }); //previous findings
                              }); //previous audits
                          }); //cetificate dtl Data
                      }); //sspDtl Data
                  }); //attachment Data
              });
          }
        });
    });
  }
  checkRecords() {
    console.log('checkRecords called');
    return this.database
      .executeSql('SELECT * FROM AUDIT_FINDINGS', [])
      .then((data) => {
        if (data.rows.length > 0) {
          for (var a = 0; a < data.rows.length; a++) {
            console.log(data.rows.item(a));
          }
        }
      });
  }

  /*Finding page starts here */
  saveFindingData(data, seqNo) {
    console.log('data', data);
    let findings = data.findings;
    let findingDetails = data.findingDetails;
    let findingAttachments = data.findingAttachments;

    return new Promise<Object>((resolve) => {
      this.database
        .executeSql(
          'DELETE FROM AUDIT_FINDINGS WHERE ORIG_SEQ_NO=? AND CUR_AUDIT_SEQ_NO=?',
          [seqNo, seqNo]
        )
        .then(
          (_) => {
            console.log('findings Deleted');
            if (findings.length > 0) {
              findings.forEach((a, aIndex) => {
                console.log(a);
                this.database.executeSql(
                  'INSERT INTO AUDIT_FINDINGS' +
                  '(SEQ_NO,' +
                  'CUR_AUDIT_SEQ_NO,' +
                  'ORIG_SEQ_NO,' +
                  'FINDING_NO,' +
                  'AUDIT_DATE,' +
                  'AUDIT_CODE,' +
                  'COMPANY_ID,' +
                  'USER_INS,' +
                  'FINDING_STATUS,' +
                  'DATE_INS, SERIAL_NO)' +
                  'VALUES(?,?,?,?,?,?,?,?,?,?,?)',
                  [
                    aIndex + 1,
                    a.currSeqNo,
                    a.origSeqNo,
                    a.findingsNo,
                    a.auditDate,
                    a.auditCode,
                    2,
                    a.userIns ? a.userIns : '',
                    a.findingStatus,
                    a.dateIns ? a.dateIns : '',
                    a.serialNo ? a.serialNo : '',
                  ]
                );
              });

              this.database
                .executeSql(
                  'DELETE FROM AUDIT_FINDINGS_DETAILS WHERE CUR_AUDIT_SEQ_NO=? AND ORIG_SEQ_NO=?',   //changed by archana for jira Id-MOBILE-792
                  [seqNo, seqNo]
                )
                .then(() => {
                  if (findingDetails.length > 0) {
                    findingDetails.forEach((b, aIndex) => {
                      this.database.executeSql(
                        'INSERT INTO AUDIT_FINDINGS_DETAILS' +
                        '(SEQ_NO,' +
                        'CUR_AUDIT_SEQ_NO,' +
                        'ORIG_SEQ_NO,' +
                        'FINDING_NO,' +
                        'FINDING_SEQ_NO,' +
                        'CATEGORY_ID,' +
                        'STATUS_ID,' +
                        'STATUS_DATE,' +
                        'NEXT_ACTION_ID,' +
                        'DUE_DATE,' +
                        'DESCRIPTION,' +
                        'COMPANY_ID,' +
                        'USER_INS,' +
                        'DATE_INS,' +
                        'AUDIT_TYPE_ID,' +
                        'UPDATE_DESCRIPTION,' +
                        'AUDIT_PLACE,' +
                        'UPDATE_FLAG,'+
                        'CHECKBOX_UPDATE)' +
                        'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                        [
                          aIndex + 1,
                          b.currSeqNo,
                          b.origSeqNo,
                          b.findingsNo,
                          b.findingSeqNo,
                          b.categoryId,
                          b.statusId,
                          b.statusDate,
                          b.nextActionId,
                          b.dueDate,
                          b.description,
                          2,
                          b.userIns,
                          b.dateIns,
                          b.auditTypeId,
                          b.updateDescription ? b.updateDescription : '',
                          b.auditPlace ? b.auditPlace : '',
                          b.updateFlag ? b.updateFlag : 0,
                          b.checkboxUpdate ? b.checkboxUpdate : 0,
                        ]
                      );
                    });
                  }
                });

              this.database
                .executeSql(
                  'DELETE FROM AUDIT_FINDING_ATTACHMENTS WHERE CUR_AUDIT_SEQ_NO=? AND ORIG_SEQ_NO=?',
                  [seqNo, seqNo]
                )
                .then(() => {
                  if (findingAttachments.length > 0) {
                    findingAttachments.forEach((c, aIndex) => {
                      this.database.executeSql(
                        'INSERT INTO AUDIT_FINDING_ATTACHMENTS' +
                        '(SEQ_NO,' +
                        'CUR_AUDIT_SEQ_NO,' +
                        'ORIG_SEQ_NO,' +
                        'FINDING_NO,' +
                        'FINDING_SEQ_NO,' +
                        'FILE_SEQ_NO,' +
                        'FILE_NAME,' +
                        'FLAG,' +
                        'COMPANY_ID,' +
                        'USER_INS,' +
                        'DATE_INS)' +
                        'VALUES(?,?,?,?,?,?,?,?,?,?,?)',
                        [
                          aIndex + 1,
                          c.currentAuditSeq,
                          c.origAuditSeqNo,
                          c.findingNo,
                          c.findingSeqNo,
                          c.fileSeqNo,
                          c.fileName,
                          c.ownerFlag,
                          c.companyId,
                          c.userIns,
                          c.dateIns,
                        ]
                      );
                    });
                  }
                  resolve(null);
                });
            }
          },
          (err) => {
            console.log('finding delete operation failed.');
          }
        );
    });
  }

  savePrevFindingData(req, Seq,presentSeq) {
    console.log(Seq);

    console.log(req);

    let findingDetails = req.findingDetails;

    let findingAttach = req.findingAttachments;

    let auditFinding = req.findings;

    let saveFlag = true;

    let error;

    return new Promise<Object>((resolve, reject) => {
      auditFinding.forEach((a) => {
        this.database.executeSql("UPDATE AUDIT_FINDINGS SET FINDING_STATUS=? WHERE ORIG_SEQ_NO=? AND FINDING_NO=?", [a.findingStatus, a.auditSeqNo, a.findingsNo]);
        this.database
          .executeSql(
            'UPDATE AUDIT_FINDINGS SET AUDIT_STATUS = ? WHERE ORIG_SEQ_NO=?',
            [a.auditStatus, a.auditSeqNo]
          )
          .then(
            (_) => {
              console.log('The AUDIT_FINDINGS records updated');
            },
            (err) => {
              error = 'AUDIT_FINDINGS updation error';
              saveFlag = false;
            }
          );
      });

      this.database.executeSql(
        "DELETE FROM AUDIT_FINDINGS_DETAILS WHERE ORIG_SEQ_NO=?", [Seq])            //changed by archana for jira Id-Mobile-765 
        .then(() => {
          findingDetails.forEach((a, aIndex) => {
            this.database
              .executeSql(
                'INSERT INTO AUDIT_FINDINGS_DETAILS ' +
                '(SEQ_NO,' +
                'CUR_AUDIT_SEQ_NO,' +
                'ORIG_SEQ_NO,' +
                'FINDING_NO,' +
                'FINDING_SEQ_NO,' +
                'CATEGORY_ID,' +
                'STATUS_ID,' +
                'STATUS_DATE,' +
                'NEXT_ACTION_ID,' +
                'DUE_DATE,' +
                'DESCRIPTION,' +
                'COMPANY_ID,' +
                'USER_INS,' +
                'DATE_INS,' +
                'AUDIT_TYPE_ID,' +
                'UPDATE_DESCRIPTION,' +
                'AUDIT_PLACE,' +
                'UPDATE_FLAG,'+
                'CHECKBOX_UPDATE)' +
                'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [
                  aIndex + 1,
                  a.currSeqNo = a.updateFlag == 0 ? (Seq ? Seq: '') : (presentSeq ? presentSeq : ''),//added by archana for jira-id MOBILE-599  //changed by archana for jira Id-Mobile-765
                  a.origSeqNo = Seq ? Seq : '',
                  a.findingsNo,
                  a.findingSeqNo,
                  a.categoryId,
                  a.statusId,
                  a.statusDate,
                  a.nextActionId,
                  a.dueDate,
                  a.description,
                  a.companyId,
                  a.userIns,
                  a.dateIns,
                  a.auditTypeId,
                  a.updateDescription ? a.updateDescription : '',
                  a.auditPlace ? a.auditPlace : '',
                  a.updateFlag === 1? a.updateFlag : 0,
                  a.checkboxUpdate === 1? a.checkboxUpdate : 0,
                ]
              )
              .then(
                (_) => {
                  console.log('The AUDIT_FINDINGS_DETAILS updated');
                },
                (err) => {
                  error = 'AUDIT_FINDINGS_DETAILS updation error';
                  saveFlag = false;
                }
              );
          });
        });

     
          if (findingAttach.length > 0) {
            console.log(findingAttach);
            findingAttach.forEach((a, aIndex) => {
               this.database.executeSql("DELETE FROM AUDIT_FINDING_ATTACHMENTS WHERE ORIG_SEQ_NO=? AND FINDING_NO=? AND FINDING_SEQ_NO=? AND FILE_SEQ_NO=?", [Seq, a.findingNo, a.findingSeqNo, a.fileSeqNo])   //changed by archana for jira Id-Mobile-765 
             .then(() => {
              this.database
                .executeSql(
                  'INSERT INTO AUDIT_FINDING_ATTACHMENTS ' +
                  '(SEQ_NO,' +
                  'CUR_AUDIT_SEQ_NO,' +
                  'ORIG_SEQ_NO,' +
                  'FINDING_NO,' +
                  'FINDING_SEQ_NO,' +
                  'FILE_SEQ_NO,' +
                  'FILE_NAME,' +
                  'FLAG,' +
                  'COMPANY_ID,' +
                  'USER_INS,' +
                  'DATE_INS)' +
                  'VALUES(?,?,?,?,?,?,?,?,?,?,?)',
                  [
                    aIndex + 1,
                    a.currentAuditSeq ? a.currentAuditSeq : a.currSeqNo, //added by archana for jira-id MOBILE-599 
                    a.origAuditSeqNo ? a.origAuditSeqNo : a.origSeqNo,
                    a.findingNo ? a.findingNo : a.findingsNo,
                    a.findingSeqNo,
                    a.fileSeqNo,
                    a.fileName,
                    a.flag ? a.flag : 0,
                    a.companyId,
                    a.userIns,
                    a.dateIns,
                  ]
                )
                .then(
                  (_) => {
                    console.log('The AUDIT_FINDING_ATTACHMENTS records updated');
                  },
                  (err) => {
                    error = 'AUDIT_FINDING_ATTACHMENTS updation error';
                    saveFlag = false;
                  }
                );
            });
            if (saveFlag) resolve(null);
            })
          }
        
      if (saveFlag) resolve(null);

      /* if (saveFlag) {
        let saveData = { "status": "SAVED" };
        resolve(saveData);
      } else {
        let errorMsg = { "error": error }
        reject(errorMsg);
      } */
    });
  }
//added by lokesh for jira_id(667) START HERE   
// updateNewfindings(obj)  {     //commented by archana for jira Id-MOBILE-792
//   obj.forEach((a)=>{
//     this.database.executeSql('UPDATE AUDIT_FINDINGS_DETAILS SET STATUS_DATE=? , DUE_DATE=?, DESCRIPTION=? WHERE FINDING_SEQ_NO=?',[a.statusDate,a.dueDate,a.description,a.findingSeqNo]);
//   })  
// }
//added by lokesh for jira_id(667) END HERE
/**added by archana for jira id-Mobile-810 start */
changeCheckboxData(orgSeqNo,obj)  {     
  if(obj.checkboxUpdate == 1 && obj.statusId == 1008){
      console.log(obj);
      
      this.database.executeSql("UPDATE AUDIT_FINDINGS_DETAILS SET CHECKBOX_UPDATE=1 WHERE ORIG_SEQ_NO=? AND STATUS_ID==1008", [orgSeqNo]) //changed by archana for jira Id-Mobile-765 start
     .then(
        (_) => {
          console.log('The AUDIT_FINDINGS_DETAILS checkbox records updated');
        },
      
      );
    } 
   
}
changeCheckboxDataRemove(orgSeqNo,obj)  {     
    this.database.executeSql("UPDATE AUDIT_FINDINGS_DETAILS SET CHECKBOX_UPDATE=0 WHERE ORIG_SEQ_NO=? AND STATUS_ID==1008", [orgSeqNo])  //changed by archana for jira Id-Mobile-765 start
     .then(
        (_) => {
          console.log('The AUDIT_FINDINGS_DETAILS checkbox records updated removed');
        },
       );
   
}
 /**added by archana for jira ID-MOBILE-871 start */
  changeStatusToComplete(orgSeqNo) {
    this.database.executeSql("UPDATE AUDIT_DETAILS SET AUDIT_STATUS_ID=1002 WHERE AUDIT_SEQ_NO=? ", [orgSeqNo])
      .then(
        (_) => {
          console.log('The AUDIT_DETAILS updated');
        },
      );
    this.database.executeSql("UPDATE AUDIT_FINDINGS SET AUDIT_STATUS=1 WHERE ORIG_SEQ_NO=? ", [orgSeqNo])
      .then(
        (_) => {
          console.log('The AUDIT_FINDINGS updated with auditstatus as 1');
        },
      );
  }
  changeStatusToCommenced(orgSeqNo) {
    this.database.executeSql("UPDATE AUDIT_DETAILS SET AUDIT_STATUS_ID=1001 WHERE AUDIT_SEQ_NO=? ", [orgSeqNo])
      .then(
        (_) => {
          console.log('The AUDIT_DETAILS updated removed');
        },
      );
    this.database.executeSql("UPDATE AUDIT_FINDINGS SET AUDIT_STATUS=0 WHERE ORIG_SEQ_NO=? ", [orgSeqNo])
      .then(
        (_) => {
          console.log('The AUDIT_FINDINGS updated with auditstatus as 0');
        },
      );
  }
 /**added by archana for jira ID-MOBILE-871 end */
/**added by archana for jira id-Mobile-810 end */
/**added by archana for jira Id-Mobile-765 start*/
updateFindingStatus(orgSeqNo,findingsNo){
  this.database.executeSql("UPDATE AUDIT_FINDINGS SET FINDING_STATUS=1 WHERE ORIG_SEQ_NO=? AND FINDING_NO=?", [orgSeqNo, findingsNo])
   .then(
        (_) => {
          console.log('The AUDIT_FINDINGS FINDING_STATUS records updated');
        },
       );
}
updateFindingStatusRemove(orgSeqNo,findingsNo){
  this.database.executeSql("UPDATE AUDIT_FINDINGS SET FINDING_STATUS=0 WHERE ORIG_SEQ_NO=? AND FINDING_NO=?", [orgSeqNo, findingsNo])
  .then(
       (_) => {
         console.log('The AUDIT_FINDINGS FINDING_STATUS records updated');
       },
      );
}
/**added by archana for jira Id-Mobile-765 end*/

  deleteFindingReviewNote(obj) {
    return new Promise<Boolean>((resolve, reject) => {
      console.log('delete :', obj);
      this.database.executeSql(
        'DELETE FROM AUDIT_FINDINGS WHERE CUR_AUDIT_SEQ_NO=? AND ORIG_SEQ_NO=? AND FINDING_NO=?',
        [obj.currSeqNo, obj.origSeqNo, obj.findingsNo]
      );
      this.database.executeSql(
        'DELETE FROM AUDIT_FINDINGS_DETAILS WHERE CUR_AUDIT_SEQ_NO=? AND ORIG_SEQ_NO=? AND FINDING_NO=?',
        [obj.currSeqNo, obj.origSeqNo, obj.findingsNo]
      );
      this.database.executeSql(
        'DELETE FROM AUDIT_FINDING_ATTACHMENTS WHERE CUR_AUDIT_SEQ_NO=? AND ORIG_SEQ_NO=? AND FINDING_NO=?',
        [obj.currSeqNo, obj.origSeqNo, obj.findingsNo]
      );
      //delete attachment folder
      resolve(true);
    });
  }

  isMlcDmlcLinked(audit) {
    return new Promise<Boolean>((resolve, reject) => {
      resolve(true);
    });
  }
  /*Finding page ends here */
  checkUserId(emailId) {
    return new Promise<Object>((resolve, reject) => {
      let data;
      this.database.transaction((tx: any) => {
        tx.executeSql(
          'SELECT COUNT(USER_ID) AS COUNT, ACTIVE_STATUS as ACTIVE_STATUS FROM MA_USERS WHERE USER_ID=?',
          [emailId],
          (tx: any, res: any) => {
            if (res.rows.length > 0) {
              data = res.rows.item(0);
            }
            console.log(data);
            resolve(res.rows.item(0));
          }
        );
      });
    });
  }

  updatePassword(mail, pass, key) {
    return new Promise<Object>((resolve, reject) => {
      let data;
      this.database.transaction((tx: any) => {
        tx.executeSql(
          'UPDATE MA_USERS SET PASSWORD=? WHERE USER_ID=?',
          [pass, mail],
          (tx: any, res: any) => {
            console.log(res);
            if (res.rows.length > 0) {
              data = res.rows.item(0);
            }
            console.log(data);
            resolve(res.rows.item(0));
          }
        );
      });
      this.database
        .executeSql(
          'UPDATE CURRENT_USER_DETAILS SET PASSWORD=? WHERE USER_NAME=?',
          [pass, mail]
        )
        .then((data) => {
          console.log('updateCurrentUser data ', data);
          this.loadCurrentUser();
          resolve(null);
        });
    });
  }
  getAuditauditorDetails(seqNo) {
    let auditorDtls: any = [];
    return new Promise<Object>((resolve, reject) => {
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM AUDIT_AUDITOR_DETAILS WHERE AUDIT_SEQ_NO=? AND AUD_OBS_LEAD =?',
            [seqNo, 1],
            (tx: any, auditAuditorDataRes: any) => {
              if (auditAuditorDataRes.rows.length > 0) {
                for (var x = 0; x < auditAuditorDataRes.rows.length; x++) {
                  auditorDtls.push(auditAuditorDataRes.rows.item(x));
                }
                console.log('auditorDtls', auditorDtls);
              }
            },
            (tx: any, err: any) => {
              console.log("get auditor's of current audit, Operation failed.");
            }
          );
        }).then(() => {
          console.log('auditorDtls', auditorDtls);
          resolve(auditorDtls);
        });
    })
  }
  /**added by archana for jira-id MOBILE-599 start  */
  deleteFindingAttach(obj, Seq) {
    return new Promise<Boolean>((resolve, reject) => {
      console.log(Seq);
      console.log(obj);


      this.database.executeSql(
        'DELETE FROM AUDIT_FINDING_ATTACHMENTS WHERE ORIG_SEQ_NO=? AND FINDING_NO=? AND FINDING_SEQ_NO=? AND FILE_SEQ_NO=?',   //changed by archana for jira Id-Mobile-765
        [Seq, obj.findingNo, obj.findingSeqNo, obj.fileSeqNo]
      )
      .then((data) => {
      console.log('AUDIT_FINDING_ATTACHMENTS Deleted', data);
      
      resolve(true);
      })
    })
  }
  /**added by archana for jira-id MOBILE-599 end  */

  checkPinId(data){
    let resp: any = [];
    return new Promise<Boolean>((resolve, reject) => {
      this.database.executeSql("SELECT * FROM MA_USER WHERE LOWER(USER_ID)=?", [data.username.toLowerCase()])
      .then((res)=>{
        if (!res.error) {
          this.database.executeSql("SELECT * FROM LAPTOP_PIN WHERE LOWER(USER_ID)=?", [res.toLowerCase()])
          .then((resp)=>{
          
            if (res.length > 0 && resp.length > 0) {
              
                resp = { 'status': 200, "companyId": res[0].COMPANY_ID, "userId": res[0].SEQUENCE_NUMBER, "userName": res[0].USER_ID, "activeStatus": res[0].ACTIVE_STATUS, "validUser": resp[0].USER_APPROVAL };
                resolve(resp);
              } else {
                resp = { 'status': 401, 'error': 'ERROR' };
                resolve(resp);
  
              }
          });
        }
        
      });
    });
		}

  getMpinData(data){
    let resp;
		var mpin = [];
    return new Promise<Boolean>((resolve, reject) => {
		this.database.executeSql("SELECT * FROM LAPTOP_PIN WHERE USER_ID = ?", [data])
    .then((mpin)=>{ 

			if (!mpin.error) {
				resp = { 'status': 200, 'data': mpin };
				resolve(resp);

			} else {

				resp = { 'status': 204, 'mpin': mpin, 'error': data.error.toString() };
				resolve(resp);
			}
		});
  });
  }

  getCheckMpinData(data){
    let resp;
    var mpin = [];
    return new Promise<Boolean>((resolve, reject) => {
		this.database.executeSql("SELECT * FROM LAPTOP_PIN")
      .then((mpin)=>{ 

			if (!mpin.error && mpin.length > 0) {

				this.database.executeSql("SELECT * FROM USER_DETAILS_CONFIG A, MA_USER B where A.EMAIL_ID=B.USER_ID AND A.EMAIL_ID=?", [mpin[0].USER_ID])
        .then((data)=>{ 
					if (!data.error) {

						resp = { 'status': 200, 'mpin': mpin, 'data': data };
						resolve(resp);

					} else {
						resp = { 'status': 204, 'mpin': mpin, 'error': data.error.toString() };
						resolve(resp);
					}
				});

			} else if (mpin.length == 0) {

				resp = { 'status': 204, 'mpin': mpin, 'data': 'NOT_AVAILABLE' };
				resolve(resp);
			} else {

				resp = { 'status': 204, 'mpin': mpin, 'error': mpin.error.toString() };
				resolve(resp);
			}

		});
  });
  }

  saveMpin(req){
    let resp;

		var mpin = req;

		var saveFlag = true;

		var saveUpdate = false;

		var error;
    return new Promise<Boolean>((resolve, reject) => {
		if (mpin && saveFlag) {

			if (mpin.length > 0) {
          try {
            this.database.executeSql('DELETE FROM LAPTOP_PIN', []);
            console.log('DELETE FROM LAPTOP_PIN Success');
          } catch (error) {
            console.log('DELETE FROM LAPTOP_PIN Failed', error);
          }
  
				this.database.executeSql("INSERT INTO LAPTOP_PIN" +
					"(LAP_UNIQUE_ID," +
					"USER_ID," +
					"COMPANY_ID," +
					"USER_APPROVAL," +
					"USER_INS," +
					"DATE_INS,"+
          "MOB_UNIQUE_ID) " +
					"VALUES(?,?,?,?,?,?,?)",
					[mpin[0].lapUniqId,
					mpin[0].emailId,
					mpin[0].companyId,
						1,
					mpin[0].userIns,
					mpin[0].dateIns,
        mpin[0].mobUniqId]) 
          .then((err)=>{ 

						if (err.error) {
							error = err.error.toString();

							saveFlag = false;
						}
					});

			}
		}

		if (saveFlag === true) {
			var success = { saveFlag };

			resp = { 'status': 200, 'data': success };
			resolve(resp);

		} else {
			var errorMsg = { "error": error };

			resp = { 'status': 409, 'data': errorMsg };
			resolve(resp);
		}
  });
  }

  getlaptopId(req){
    console.log(req);
    return new Promise<Boolean>((resolve, reject) => {
		this.database.executeSql("SELECT MOB_UNIQUE_ID FROM LAPTOP_PIN WHERE USER_ID=?", [req])
     .then((data)=>{ 
      let getMobUniqueId = null;

      if (data.rows.length > 0) {
        getMobUniqueId = {
          mob_unique_id: data.rows.item(0).MOB_UNIQUE_ID
        };
      }
      console.log('getMobUniqueId', getMobUniqueId);
      resolve(getMobUniqueId);
		});
  });
  }

  updateLpinActiveStatus(userId, companyId){
    let resp;
    return new Promise<Boolean>((resolve, reject) => {
		this.database.executeSql("UPDATE LAPTOP_PIN SET USER_APPROVAL=0  WHERE USER_ID=? AND COMPANY_ID=? ", [userId, companyId]) .then((data)=>{  

			resp = { 'status': 200, 'data': 'OK' }
			resolve(resp);
		});
  });
  }

  getLpinActiveStatus(userId, companyId){
    console.log(userId)
    console.log(companyId);
    
    let resp;
    return new Promise<object>((resolve, reject) => {
		this.database.executeSql("SELECT * FROM LAPTOP_PIN WHERE USER_ID=? AND COMPANY_ID=? ", [userId, companyId])
    .then((data)=>{ 
      console.log(data);
      
      let getUserApproval : any;

      if (data.rows.length > 0) {
        getUserApproval= {
          userApproval: data.rows.item(0).USER_APPROVAL
        };}
      console.log('getUserApproval', getUserApproval);
      resolve(getUserApproval);
		});
  });
  }
  //added by lokesh for jira_id(68) Start here
  getPreviousAuditdatails(vesselImoNo) {
    let auditData: any = [];
    let sspDetailsData = [];
    return new Promise<Object>((resolve, reject) => {
      this.database
        .transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM AUDIT_DETAILS WHERE VESSEL_IMO_NO =?',
            [vesselImoNo],
            (tx: any, auditDataRes: any) => {
              if (auditDataRes.rows.length > 0) {
                console.log("before assigining auditdetails", auditDataRes.rows);
                for (var x = 0; x < auditDataRes.rows.length; x++) {
                  auditData.push({
                    auditSeqNo: auditDataRes.rows.item(x).AUDIT_SEQ_NO,
                    companyId: auditDataRes.rows.item(x).COMPANY_ID,
                    auditReportNo: auditDataRes.rows.item(x).AUDIT_REPORT_NO,
                    auditDate: auditDataRes.rows.item(x).AUDIT_DATE,
                    auditPlace: auditDataRes.rows.item(x).AUDIT_PLACE,
                    auditStatusId: auditDataRes.rows.item(x).AUDIT_STATUS_ID,
                    certIssuedId:
                      auditDataRes.rows.item(x).CERTIFICATE_ISSUED_ID,
                    interalAuditDate:
                      auditDataRes.rows.item(x).INTERNAL_AUDIT_DATE,
                    openMeetingDate:
                      auditDataRes.rows.item(x).OPEN_MEETING_DATE,
                    closeMeetingDate:
                      auditDataRes.rows.item(x).CLOSE_MEETING_DATE,
                    auditSummaryId: auditDataRes.rows.item(x).AUDIT_SUMMARY_ID,
                    lockHolder: auditDataRes.rows.item(x).LOCK_HOLDER,
                    lockStatus: auditDataRes.rows.item(x).LOCK_STATUS,
                    vesselImoNo: auditDataRes.rows.item(x).VESSEL_IMO_NO,
                    certificateNo: auditDataRes.rows.item(x).CERTIFICATE_NO,
                    auditTypeId: auditDataRes.rows.item(x).AUDIT_TYPE_ID,
                    auditSubTypeID: auditDataRes.rows.item(x).AUDIT_SUB_TYPE_ID,
                    certExpiryDate: auditDataRes.rows.item(x).CERT_EXPIRY_DATE,
                    certIssuedDate: auditDataRes.rows.item(x).CERT_ISSUED_DATE,
                    dateOfIns: auditDataRes.rows.item(x).DATE_INS,
                    scopeId: auditDataRes.rows.item(x).SCOPE,
                    narrativeSummary:
                      auditDataRes.rows.item(x).NARRATIVE_SUMMARY,
                    sspDetailsData: '',
                    maxStatusDateCar:
                      auditDataRes.rows.item(x).MAX_STATUS_DATE_CAR,
                    seal: auditDataRes.rows.item(x).SEAL,
                    title: auditDataRes.rows.item(x).TITLE,
                    signature: auditDataRes.rows.item(x).SIGNATURE,
                    creditDate: auditDataRes.rows.item(0).CREDIT_DATE,
                    qid: auditDataRes.rows.item(x).QID,
                    docTypeNumber: auditDataRes.rows.item(x).DOC_TYPE_NUMBER,
                    userIns: auditDataRes.rows.item(x).USER_INS,
                    vesselNameAud: auditDataRes.rows.item(x).VESSEL_NAME,
                    vesselTypeAud: auditDataRes.rows.item(x).VESSEL_TYPE,
                    docExpiryAud: auditDataRes.rows.item(x).DOC_EXPIRY,
                    docIssuerAud: auditDataRes.rows.item(x).DOC_ISSUER,
                    companyAddressAud: auditDataRes.rows.item(x).VESSEL_ADDRESS,
                    officialNoAud: auditDataRes.rows.item(x).OFFICIAL_NO,
                    docTypeNoAud: auditDataRes.rows.item(x).DOC_TYPE_NO,
                    certificateVer:
                      auditDataRes.rows.item(x).CERTIFICATE_VERSION,
                      reviewStatus: auditDataRes.rows.item(x).REVIEW_STATUS,
                  });
                  tx.executeSql(
                    'SELECT FIRST_NAME,LAST_NAME,SEQUENCE_NUMBER FROM MA_USERS WHERE USER_ID=?',
                    [auditDataRes.rows.item(x).USER_INS], //*/,FIRST_NAME,LAST_NAME,SEQUENCE_NUMBER
                    (tx: any, res: any) => {
                      if (res.rows.length > 0) {
                        auditData[0].userName =
                          res.rows.item(0).FIRST_NAME +
                          ' ' +
                          res.rows.item(0).LAST_NAME;
                        console.log("user name : ", res.rows.item(0).FIRST_NAME, res.rows.item(0).LAST_NAME)
                      }
                    },
                    (tx: any, err: any) => {
                      console.log('get vesselData, Operation failed.');
                    }
                  );
                }
                console.log('auditDetails', auditData);
              }
            },
            (tx: any, err: any) => {
              console.log(
                "get audit data's of current audit, Operation failed."
              );
            }
          );
        })
        .then(() => {
          console.log('auditData', auditData);
          resolve(auditData);
        }); 
    });
  }
  //added by lokesh for jira_id(68) End here







}
