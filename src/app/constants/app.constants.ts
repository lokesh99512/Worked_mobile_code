export class AppConstant {
    CREATE = 'Create';
    UPDATE = 'Update';
    NEW_FINDING = 'NF';
    PREVIOUS_FINDING = 'PF';

    ISM_TYPE_ID = 1001;
    ISPS_TYPE_ID = 1002;
    MLC_TYPE_ID = 1003;
    SSP_TYPE_ID = 1004;
    DMLC_TYPE_ID = 1005;
    ISM_SRC = 'ISM';
    ISPS_SRC = 'ISPS';
    MLC_SRC = 'MLC';
    SSP_SRC = 'SSP';
    DMLC_SRC = 'DMLC';

    COMMENCED_AUDIT_STATUS = 1001;
    COMPLETED_AUDIT_STATUS = 1002;
    CLOSED_AUDIT_STATUS = 1003;
    VOID_AUDIT_STATUS = 1004;
    REOPEN_AUDIT_STATUS = 1005;

    AUDITOR_ROLE_ID = 1001;
    ADMIN_ROLE_ID = 1002;
    MANAGER_ROLE_ID = 1003;
    AUDIT_AUDITOR_ROLE_ID = 1001;
    AUDIT_OBSERVER_ROLE_ID = 1002;
    AUDIT_REVIEWER_ROLE_ID = 1003;
    INSPECTOR = 'INSPECTOR';
    AUDITOR = 'AUDITOR';

    INTERIM_SUB_TYPE_ID = 1001;
    INITIAL_SUB_TYPE_ID = 1002;
    INTERMEDIATE_SUB_TYPE_ID = 1003;
    RENEWAL_SUB_TYPE_ID = 1004;
    ADDITIONAL_SUB_TYPE_ID = 1005;
    SSP_DMLC_INITIAL_AUD_SUBTYPEID = 1001;
    SSP_DMLC_AMENDMENT_AUD_SUBTYPEID = 1002;

    INTERIM_CERT = 1001;
    SHORT_TERM_CERT = 1002;
    FULL_TERM_CERT = 1002;
    RE_ISSUE = 1008;

    INTERMEDAITE_ENDORSED = 1004;
    ADDITIONAL_ENDORSED = 1005;
    RENEWAL_ENDORSED1 = 1006;
    RENEWAL_ENDORSED2 = 1007;

    INTERIM_SUMMARY_ID = 1004;

    OPEN_FINDING_STATUS = 0;
    CLOSE_FINDING_STATUS = 1;

    MAJOR_FINDING_CATEGORY = 1001;
    MINOR_FINDING_CATEGORY = 1002;
    MAJOR_DOWNGRADE_FINDING_CATEGORY = 1003;
    OBS_FINDING_CATEGORY = 1004;
    REVIEW_NOTE = 1005;

    /* OPEN= '1001';
     DOWNGRADED= '1002';
     COMPLAINCE_RESTORED= '1003';
     PLAN_ACCEPTED= '1004';
     VERIFY_CLOSE= '1005';
     CLOSE= '1008';
     PREVIOUS_STATUS= '1009'; */

    OPEN = '1001';
    DOWNGRADE = '1002';
    DOWNGRADED = '1003';
    RESTORE_COMPLAINCE = '1004';
    COMPLAINCE_RESTORED = '1005';
    PLAN_ACCEPTED = '1006';
    VERIFY_CLOSE = '1007';
    VERIFIED_CLOSED = '1008';
    CLOSE = '1009';
    NIL = '1010';
    PREVIOUS_STATUS = '1011';

    AUD_LEAD_STATUS = 1;
    RETRIEVE_STATUS = 1;

    INITIATE_REVIEW_STATUS = 1;
    REVERT_REVIEW_STATUS = 0;
    ACCEPTED_REVIEW_STATUS = 2;
    REJECTED_REVIEW_STATUS = 3;

    DEFAULT_DOC_FLAG = 0;
    ACCEPTED_DOC_FLAG = 1;
    NON_ACCEPTED_DOC_FLAG = 2;
    ISPS_REVIEW_OK = 1;

    CAR_UPDATED_CURRENT_SEQ = 600000;

    AUDIT_PLAN_RPT_ATCH_ID = 1001;
    ATTENDANCE_LIST_RPT_ATCH_ID = 1002;
    CERTIFICATE_RPT_ATCH_ID = 1003;
    CREW_LIST_RPT_ATCH_ID = 1004;
    OTHER_RPT_ATCH_ID = 1005;
    INTERNAl_ATCH_ID = 1006;
    INITIAL_CERT_ISSUE = 1001;
    ADMINISTRATIVE_CERT_ISSUE = 1002;
    GRT_MAX_LEN = 9;


    AUDIT_SUB_TYPE = {
        '1001': { 'SUB_TYPE_DESC': 'Interim', 'nextScheduledType': 'INITIAL' },
        '1002': { 'SUB_TYPE_DESC': 'Initial', 'nextScheduledType': 'INTERMEDIATE' },
        '1003': { 'SUB_TYPE_DESC': 'Intermediate', 'nextScheduledType': 'RENEWAL' },
        '1004': { 'SUB_TYPE_DESC': 'Renewal', 'nextScheduledType': 'INTERMEDIATE' },
        '1005': { 'SUB_TYPE_DESC': 'Additional', 'nextScheduledType': 'RENEWAL' }
    };

    NOT_APPROVED_SUMMARY = 1005;
    CERTI_URL = "https://13.126.205.40:8888/certificate/viewer/";

    CarFlowStructure = {


        1001: {

            1001: [{
                'index': 0,
                'categoryId': this.MAJOR_FINDING_CATEGORY,
                'statusId': this.OPEN,
                'statusDate': '',
                'nextActionId': this.DOWNGRADE,
                'dueDate': 'CURRENT AUDIT'
            },
            {
                'index': 1,
                'categoryId': this.MAJOR_FINDING_CATEGORY,
                'statusId': this.DOWNGRADED,
                'statusDate': '',
                'nextActionId': this.PLAN_ACCEPTED,
                'dueDate': 30
            },
            {
                'index': 2,
                'categoryId': this.MAJOR_FINDING_CATEGORY,
                'statusId': this.PLAN_ACCEPTED,
                'statusDate': '',
                'nextActionId': this.VERIFY_CLOSE,
                'dueDate': 90
            },
            {
                'index': 3,
                'categoryId': this.MAJOR_FINDING_CATEGORY,
                'statusId': this.VERIFIED_CLOSED,
                'statusDate': '',
                'nextActionId': this.NIL,
                'nextActionId2': 'NIL',
                'dueDate': 'N.A.'
            }],

            1002: [{
                'index': 0,
                'categoryId': this.MINOR_FINDING_CATEGORY,
                'statusId': this.OPEN,
                'statusDate': '',
                'nextActionId': this.PLAN_ACCEPTED,
                'dueDate': 30
            },
            {
                'index': 1,
                'categoryId': this.MINOR_FINDING_CATEGORY,
                'statusId': this.PLAN_ACCEPTED,
                'statusDate': '',
                'nextActionId': this.VERIFY_CLOSE,
                'dueDate': 'NEXT SCHEDULED AUDIT'
            },
            {
                'index': 2,
                'categoryId': this.MINOR_FINDING_CATEGORY,
                'statusId': this.VERIFIED_CLOSED,
                'statusDate': '',
                'nextActionId': this.NIL,//AppConstant.CLOSE,
                'nextActionId2': 'NIL',
                'dueDate': 'N.A.'
            }],

            1004: [{
                'index': 0,
                'categoryId': this.OBS_FINDING_CATEGORY,
                'statusId': this.OPEN,
                'statusDate': '',
                'nextActionId2': 'NIL',
                'dueDate': 'N.A.'
            }]
        },

        1002: {
            1001: [{
                'index': 0,
                'categoryId': this.MAJOR_FINDING_CATEGORY,
                'statusId': this.OPEN,
                'statusDate': '',
                'nextActionId': this.DOWNGRADE,
                'dueDate': 'DURING CURRENT AUDIT.'
            },
            {
                'index': 1,
                'categoryId': this.MAJOR_FINDING_CATEGORY,
                'statusId': this.DOWNGRADED,
                'statusDate': '',
                'nextActionId': this.PLAN_ACCEPTED,
                'dueDate': 30
            },
            {
                'index': 2,
                'categoryId': this.MAJOR_FINDING_CATEGORY,
                'statusId': this.PLAN_ACCEPTED,
                'statusDate': '',
                'nextActionId': this.VERIFY_CLOSE,
                'dueDate': 90
            },
            {
                'index': 3,
                'categoryId': this.MAJOR_FINDING_CATEGORY,
                'statusId': this.VERIFIED_CLOSED,
                'statusDate': '',
                'nextActionId': this.NIL,//AppConstant.CLOSE,
                'nextActionId2': 'NIL',
                'dueDate': 'N.A.'
            }],

            1002: [{
                'index': 0,
                'categoryId': this.MINOR_FINDING_CATEGORY,
                'statusId': this.OPEN,
                'statusDate': '',
                'nextActionId': this.RESTORE_COMPLAINCE,
                'dueDate': 'DURING CURRENT AUDIT.'
            },
            {
                'index': 1,
                'categoryId': this.MINOR_FINDING_CATEGORY,
                'statusId': this.COMPLAINCE_RESTORED,
                'statusDate': '',
                'nextActionId': this.PLAN_ACCEPTED,
                'dueDate': 30
            },
            {
                'index': 2,
                'categoryId': this.MINOR_FINDING_CATEGORY,
                'statusId': this.PLAN_ACCEPTED,
                'statusDate': '',
                'nextActionId': this.VERIFY_CLOSE,
                'dueDate': 'NEXT SCHEDULED AUDIT'
            },
            {
                'index': 3,
                'categoryId': this.MINOR_FINDING_CATEGORY,
                'statusId': this.VERIFIED_CLOSED,
                'statusDate': '',
                'nextActionId': this.NIL,//AppConstant.CLOSE,
                'nextActionId2': 'NIL',
                'dueDate': 'N.A.'
            }],

            1003: [{
                'index': 0,
                'categoryId': this.MINOR_FINDING_CATEGORY,
                'statusId': this.OPEN,
                'statusDate': '',
                'nextActionId': this.PLAN_ACCEPTED,
                'dueDate': 30
            },
            {
                'index': 1,
                'categoryId': this.MINOR_FINDING_CATEGORY,
                'statusId': this.PLAN_ACCEPTED,
                'statusDate': '',
                'nextActionId': this.VERIFY_CLOSE,
                'dueDate': 'NEXT SCHEDULED AUDIT'
            },
            {
                'index': 2,
                'categoryId': this.MINOR_FINDING_CATEGORY,
                'statusId': this.VERIFIED_CLOSED,
                'statusDate': '',
                'nextActionId': this.NIL,//AppConstant.CLOSE,
                'nextActionId2': 'NIL',
                'dueDate': 'N.A.'
            }],

            1004: [{
                'index': 0,
                'categoryId': this.OBS_FINDING_CATEGORY,
                'statusId': this.OPEN,
                'statusDate': '',
                'nextActionId2': 'NIL',
                'dueDate': 'N.A.'
            }]
        },

        1003: {

            1001: [{
                'index': 0,
                'categoryId': this.MAJOR_FINDING_CATEGORY,
                'statusId': this.OPEN,
                'statusDate': '',
                'nextActionId': this.DOWNGRADE,
                'dueDate': 'CURRENT INSPECTION.'
            },
            {
                'index': 2,
                'categoryId': this.MAJOR_FINDING_CATEGORY,
                'statusId': this.DOWNGRADED,
                'statusDate': '',
                'nextActionId': this.PLAN_ACCEPTED,
                'dueDate': 'DURING CURRENT INSPECTION.'
            },
            {
                'index': 3,
                'categoryId': this.MAJOR_FINDING_CATEGORY,
                'statusId': this.PLAN_ACCEPTED,
                'statusDate': '',
                'nextActionId': this.VERIFY_CLOSE,
                'dueDate': 90
            },
            {
                'index': 4,
                'categoryId': this.MAJOR_FINDING_CATEGORY,
                'statusId': this.VERIFIED_CLOSED,
                'statusDate': '',
                'nextActionId': this.NIL,//AppConstant.CLOSE,
                'nextActionId2': 'NIL',
                'dueDate': 'N.A.'
            }],

            1002: [{
                'index': 0,
                'categoryId': this.MINOR_FINDING_CATEGORY,
                'statusId': this.OPEN,
                'statusDate': '',
                'nextActionId': this.PLAN_ACCEPTED,
                'dueDate': 'DURING CURRENT INSPECTION.'
            },
            {
                'index': 2,
                'categoryId': this.MINOR_FINDING_CATEGORY,
                'statusId': this.PLAN_ACCEPTED,
                'statusDate': '',
                'nextActionId': this.VERIFY_CLOSE,
                'dueDate': 'NEXT SCHEDULED AUDIT'
            },
            {
                'index': 3,
                'categoryId': this.MINOR_FINDING_CATEGORY,
                'statusId': this.VERIFIED_CLOSED,
                'statusDate': '',
                'nextActionId': this.NIL,//AppConstant.CLOSE,
                'nextActionId2': 'NIL',
                'dueDate': 'N.A.'
            }],

            1004: [{
                'index': 0,
                'categoryId': this.OBS_FINDING_CATEGORY,
                'statusId': this.OPEN,
                'statusDate': '',
                'nextActionId2': 'NIL',
                'dueDate': 'N.A.'
            }]
        },

        1005: {

            1005: [{
                'index': 0,
                'categoryId': this.REVIEW_NOTE,
                'statusId': this.OPEN,
                'statusDate': '',
                'nextActionId': this.VERIFY_CLOSE,
                'dueDate': 'DURING NEXT SCHEDULED INSPECTION.'
            },
            {
                'index': 1,
                'categoryId': this.REVIEW_NOTE,
                'statusId': this.VERIFIED_CLOSED,
                'statusDate': '',
                'nextActionId': this.NIL,//AppConstant.CLOSE,
                'nextActionId2': 'NIL',
                'dueDate': 'N.A.'
            }]
        }

    }
    DDMMYYYY = 'DD-MM-YYYY';
    MMMDDYYYY = 'MMM-DD-YYYY';
    YYYYMMDD = 'YYYY-MM-DD';
    DDMMMYYYY = 'DD-MM-YYYY';
    MASTERDATA_REFRESED_ACTIVITY_ID = 1000;
    AUDIT_RETRIVED_ACTIVITY_ID = 1001;
    AUDIT_MODIFIED_ACTIVITY_ID = 1002;
    AUDIT_SYNC_ACTIVITY_ID = 1003;
    CERTIFICATE_GENERATED_ACTIVITY_ID = 1004;

    AUDIT_RETRIVED_ACTIVITY_MSG = 'Audit retrieved for the Vessel';
    AUDIT_MODIFIED_ACTIVITY_MSG = 'Audit modified for the vessel';
    AUDIT_SYNC_ACTIVITY_MSG = 'Audit synchronized for the vessel';
    CERTIFICATE_GENERATED_ACTIVITY_MSG = 'Certficate created for the vessel';
    MASTERDATA_REFRESED_ACTIVITY_MSG = 'Master data refreshed.'
}

