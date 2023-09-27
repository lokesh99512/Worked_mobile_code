import { Injectable } from "@angular/core";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { File } from "@ionic-native/file/ngx";
import { FileOpener } from "@ionic-native/file-opener/ngx";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from "moment";
//import * as _ from 'lodash';
import * as _ from "lodash"
import { AppConstant } from "src/app/constants/app.constants";
import * as usjs from "underscore";
import * as rasterizeHTML from 'rasterizehtml';
import $ from "jquery";
import { LoadingIndicatorService } from './loading-indicator.service';
import { HttpClient } from '@angular/common/http';
import { FileManagerService } from "./file-manager.service";
import { LoginPage } from "../pages/auth/login/login.page";

declare function decodeURIComp(base64): any;
declare function encodeURIComp(data): any;
/* ../../../assets/base64data.json */

@Injectable({
  providedIn: "root"
})
export class PdfService {

  private dataUrl: string = "../../assets/json/base64data.json"
  fonts: any;
  images: any;
  /* fonts: any = (urlDatas as any).default.fonts;
  images: any = (urlDatas as any).default.images; */
  constructor(
    private file: File,
    private http: HttpClient,
    private fileOpener: FileOpener,
    public loader: LoadingIndicatorService,
    private appConstant: AppConstant,
    public fileManager: FileManagerService
  ) {
    this.http.get(this.dataUrl).subscribe((data: any) => {
      this.fonts = data.fonts;
      this.images = data.images;
    })

  }

  /**
   * ismPdfService
   */
  public ismPdfService1(certificateData) {
    return new Promise<Object>((resolve, reject) => {
      this.loader.showLoader("PreparingCertificate");

      let _that = this;
      console.log(certificateData)
      var tempcertificateHead, voidStatus, tempcertificatetype, audittype, auditsubtypeidCaps, auditsubtypeidsmall, headSubTitle, cmpnytype, nmecompny = "", shipType = "Type of Ship", Grt = "Gross Tonnage:", signaturetext = "Signature of the duly authorized official issuing the Certificate", subsequentCertificate = "No";
      var voluntaryCert = certificateData.voluntaryCert;
      if (certificateData.AuditStatusId == this.appConstant.VOID_AUDIT_STATUS || certificateData.res.activeStatus === 0 || certificateData.auditSummarId === 1005 || certificateData.crossLineStatus === "extent-inactive") {
        voidStatus = true;
      }
      if (certificateData.auditSubTypeId == this.appConstant.INTERIM_SUB_TYPE_ID) {
        auditsubtypeidCaps = "INTERIM";
        auditsubtypeidsmall = "Interim"
      } else {
        auditsubtypeidCaps = "";
        auditsubtypeidsmall = ""
      }


      tempcertificateHead = "" + auditsubtypeidsmall
        + " Safety Management Certificate";

      tempcertificatetype = "" + auditsubtypeidsmall
        + " Safety Management Certificate";

      tempcertificateHead = voluntaryCert ? auditsubtypeidsmall + " Voluntary Statement of Compliance" : tempcertificateHead

      audittype = "ISM";

      var issuedDay = this.dateSuffix(Number(certificateData.certIssueDate
        .split(' ')[0]));

      var issuedDay1 = issuedDay ? issuedDay : '(Day)';

      var issuedMonth = certificateData.certIssueDate.split(' ')[1];

      var issuedMonth1 = issuedMonth ? issuedMonth : '(Month';

      var issuedYear = certificateData.certIssueDate.split(' ')[2];

      var issuedYear1 = issuedYear ? issuedYear : 'Year)';

      var place = certificateData.auditplace ? certificateData.auditplace : '(Location)';

      var certificateAuthority = 'Issued by the authority of the Republic of the Marshall Islands Maritime Administrator\n at '
        + place
        + ' this '
        + issuedDay1
        + ' day of ' + issuedMonth1 + ", " + issuedYear1 + '.';

      var footerNote;

      if (certificateData.auditSubTypeId == this.appConstant.INTERIM_SUB_TYPE_ID) {
        footerNote = voluntaryCert ? "MSC-297EV Rev. 10/19" : "MSC-297E Rev. 2/18";

      } else if (certificateData.auditSubTypeId == this.appConstant.INITIAL_SUB_TYPE_ID
        || certificateData.auditSubTypeId == this.appConstant.RENEWAL_SUB_TYPE_ID
        || certificateData.auditSubTypeId == this.appConstant.INTERMEDIATE_SUB_TYPE_ID
        || certificateData.auditSubTypeId == this.appConstant.ADDITIONAL_SUB_TYPE_ID) {

        footerNote = voluntaryCert ? "MSC-297FV Rev. 10/19" : "MSC-297F Rev. 2/18";

      }

      cmpnytype = "Company";

      nmecompny = "Name and Address of the " + cmpnytype + ":";
      var docDef: any;

      console.log(certificateData.auditSubTypeId);

      if (certificateData.auditSubTypeId == this.appConstant.INTERIM_SUB_TYPE_ID) {

        console.log(certificateData);

        console.log(certificateData);
        docDef = {
          ownerPassword: "123456",
          permissions: {
            printing: "highResolution",
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: false,
            documentAssembly: false
          },

          defaultStyle: {
            //font: "Times"
          },
          pageSize: "Letter",

          footer: {
            text: footerNote,
            //alignment : 'right',
            margin: [470, -10, 0, 70],
            fontSize: 9
          },

          content: [],
          // pageMargins: [5, 5, 5, 5],
          background: function (currentPage, pageSize) {
            return {
              image: _that.images['watermark'],
              width: 300,
              absolutePosition: {
                x: 150,
                y: 260
              },
              opacity: 0.7
            };
          },
          styles: {
            rightme: {
              alignment: "center",
              margin: [0, 10]
            },
            header: {
              fontSize: 16,
              bold: true
            }
          }
        };

        docDef.content.push({
          columns: [
            {
              image: "",
              width: 80,
              height: 80,
              margin: [10, 15, 0, 0]
            },
            {
              width: 350,
              margin: [0, 10, 0, 0],
              text: [
                {
                  text: "Republic of the Marshall Islands\n",
                  fontSize: 23,
                  bold: true,
                  color: "#525252",
                  style: "rightme"
                },
                {
                  text: "Maritime Administrator\n",
                  fontSize: 14,
                  bold: true,
                  color: "#666666",
                  style: "rightme"
                },
                {
                  text: tempcertificateHead + "\n",
                  fontSize: 17,
                  bold: true,
                  color: "#666666",
                  style: "rightme"
                },
                {
                  text: "",
                  fontSize: 9,
                  color: "black",
                  alignment: "center"
                },
                {
                  text:
                    "Issued under the provisions of the International Convention for the \n Safety of Life at Sea, 1974 (SOLAS) as amended" +
                    "\n\n",
                  fontSize: 10,
                  color: "black",
                  alignment: "center"
                },
                {
                  text:
                    "Under the authority of the Government of the Republic of the Marshall Islands\n\n",
                  fontSize: 10,
                  color: "black",
                  alignment: "center"
                }
              ]
            },
            {
              columns: [
                [
                  {
                    text: "Certificate Number",
                    fontSize: 10,
                    margin: [2, 6, 0, 0]
                  },
                  {
                    table: {
                      widths: [80],
                      body: [[certificateData.certificateNo]]
                    },
                    margin: [-3, 2, 0, 0],
                    fontSize: 8
                  },
                  {
                    qr: certificateData.qrCodeUrl,
                    fit: 100,
                    margin: [1, 10, 0, 0]
                    /*image:certificateData.QrC,
              width : 60,
              height : 60,
              margin : [ 12, 10,0,0 ]*/
                  }
                  /*{	qr : certificateData.qrCodeUrl,
              fit : '80',
              margin : [ -10, 10,0,-10 ]
              //margin : [ 15, 10 ]
            }*/
                ]
              ],
              width: "auto"
            }
          ]
        });

        docDef.content[0].columns[0].image = _that.images['logo'];
        docDef.content.push({
          text: "1",
          fontSize: 7,
          absolutePosition:
            certificateData.vesselName.length < 54
              ? { x: 59, y: 708 }
              : { x: 59, y: 718 }
        });

        docDef.content.push({
          text: "Particulars of the Ship:",
          bold: true,
          fontSize: 10,
          margin: [20, 10]
        });
        docDef.content.push([
          {
            margin: [20, 0, 0, 0],
            table: {
              widths: [155, 315],
              heights: [0, 0],
              body: [
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [{ text: "Name of Ship:", fontSize: 10, bold: false }]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.vesselName,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: "Distinctive Number or Letters:",
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.officialNo,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      { text: "Port of Registry:", fontSize: 10, bold: false }
                    ]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.portofreg,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [{ text: Grt, fontSize: 10, bold: false }]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      { text: certificateData.grt, fontSize: 10, bold: false }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [{ text: "IMO No.:", fontSize: 10, bold: false }]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.vesselImoNo,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      { text: "Type of Ship :", fontSize: 10, bold: false }
                    ]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.shiptype + "\n\n",
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ]
              ]
            },
            layout: "noBorders"
          }
        ]);

        docDef.content.push({
          text: nmecompny,
          bold: true,
          fontSize: 10,
          margin: [20, 0]
        });

        if (certificateData.AuditTypeId == this.appConstant.ISM_TYPE_ID) {
          docDef.content.push({
            text: "(see paragraph 1.1.2 of the ISM Code) \n\n",
            bold: false,
            fontSize: 10,
            margin: [20, 0]
          });
        }

        var companyname = "",
          companyaddress = "";
        if (
          certificateData.AuditTypeId == this.appConstant.ISM_TYPE_ID ||
          certificateData.AuditTypeId == this.appConstant.ISPS_TYPE_ID
        ) {
          companyname = "Company Name:";
        } else if (
          certificateData.AuditTypeId == this.appConstant.MLC_TYPE_ID
        ) {
          companyname = "Shipowner Name:";
        }

        if (
          certificateData.AuditTypeId == this.appConstant.ISM_TYPE_ID ||
          certificateData.AuditTypeId == this.appConstant.ISPS_TYPE_ID
        ) {
          companyaddress = "Company Address:";
        } else if (
          certificateData.AuditTypeId == this.appConstant.MLC_TYPE_ID
        ) {
          companyaddress = "Shipowner Address:";
        }

        docDef.content.push([
          {
            margin: [20, 0, 0, 0],
            table: {
              widths: [155, 300],
              heights: [25, 55],
              body: [
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [{ text: companyname, fontSize: 10, bold: false }]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.companyname,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [{ text: companyaddress, fontSize: 10, bold: false }]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.companyaddress,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ]
              ]
            },
            layout: "noBorders"
          }
        ]);

        docDef.content.push({
          columns: [
            {
              width: "*",
              text: [],
              fontSize: 10,
              margin: [10, 0]
            },
            {
              width: "*",
              text: [],
              fontSize: 10,
              margin: [-82, 0]
            }
          ],
          margin: [10, 0],
          fontSize: 11,
          color: "#141414"
        });

        if (
          certificateData.AuditTypeId == this.appConstant.ISM_TYPE_ID ||
          certificateData.AuditTypeId == this.appConstant.ISPS_TYPE_ID
        ) {
          docDef.content[7].columns[0].text.push(
            "Company Identification Number: \n\n"
          );

          docDef.content[7].columns[1].text.push(
            certificateData.companyimono + "\n\n"
          );
        }

        docDef.content.push({
          // to draw a horizontal line
          canvas: [
            {
              type: "line",
              x1: 15,
              y1: 5,
              x2: 520,
              y2: 5,
              lineWidth: 2
            }
          ]
        });
        console.log(certificateData);
        var certificateInterim = " ",
          certificateInitial = " ",
          certificateInitial1 = " ";

        if (certificateData.AuditTypeId == this.appConstant.ISM_TYPE_ID) {
          if (
            certificateData.auditSubTypeId ==
            this.appConstant.INTERIM_SUB_TYPE_ID
          ) {
            var interimismcontent =
              " the requirements of paragraph 14.4 of the International Management Code for the Safe Operation of Ships and for Pollution Prevention (ISM Code) have been met and that the ";

            var interimismvalidity =
              "This Interim Safety Management Certificate is valid until " +
              certificateData.expirydate.replace(/^0+/, "") +
              ", subject to the ";

            docDef.content.push({
              text: [
                { text: "\nTHIS IS TO CERTIFY THAT", bold: true },
                { text: interimismcontent },
                { text: "Document of Compliance ", italics: true },
                { text: "of the Company is relevant to this ship." + "\n\n" },
                { text: interimismvalidity },
                { text: "Document of Compliance ", italics: true },
                { text: "remaining valid." + "\n\n\n\n\n\n" }
              ],
              margin: [20, 0],
              fontSize: 10,
              alignment: "justify"
            });
          } else {
            certificateInitial =
              "THIS IS TO CERTIFY THAT the safety management system of the ship has been audited and that it complies with the requirements of the International Management Code for the Safe Operation of Ships and for Pollution Prevention (ISM Code), following verification that the Document of Compliance for the Company is applicable to this type of ship.";

            certificateInitial1 =
              "The Safety Management Certificate is valid until: " +
              certificateData.expirydate +
              " subject to periodical verification and the Document of Compliance remaining valid.";
          }
        }

        docDef.content.push({
          columns: [
            {
              width: 100,
              text: "",
              fontSize: 10
            },
            {
              width: "*",
              text: "",
              fontSize: 10,
              margin: [62, -20, 0, 0]
            }
          ]
        });
        console.log("DOce", docDef.content);
        docDef.content.push({
          columns: [
            {
              image: "",
              width: 80,
              height: 80,
              margin: [60, 0, 0, 0]
            },
            {
              width: "*",
              text: [],
              fontSize: 10
            },
            {
              columns: [
                [
                  {
                    text: ["\n\n\n"]
                  },
                  {
                    image: "",
                    width: 150,
                    height: 20,
                    margin: [-130, 15, 0, 0]
                  }
                ]
              ],
              width: 80,
              height: 20
            }
          ]
        });
        docDef.content[10].columns[1].text = certificateAuthority;

        docDef.content[11].columns[0].image = certificateData.currInitialPage[0]
          ? certificateData.currInitialPage[0].sealImage
          : _that.images["transparent"];
        docDef.content[11].columns[2].columns[0][1].image =
          certificateData.currInitialPage[0] &&
            certificateData.currInitialPage[0].signToPrint == 1
            ? "data:image/png;base64," +
            certificateData.currInitialPage[0].issuerSign
            : _that.images["transparent"];

        docDef.content.push({
          columns: [
            {
              width: "*",
              text: certificateData.sealcontent + "\n",
              fontSize: 10,
              margin: [20, 0, 0, 0]
            },
            {
              canvas: [
                {
                  type: "line",
                  x1: 0,
                  y1: 10,
                  x2: 250,
                  y2: 10,
                  lineWidth: 1
                }
              ]
            }
          ]
        });

        docDef.content.push({
          columns: [
            {
              width: "*",
              text: [
                "\n",
                {
                  text: "Unique Tracking Number: ",
                  fontSize: 10
                },
                {
                  text: certificateData.utn,
                  bold: true,
                  fontSize: 10
                }
              ],
              margin: [20, 0, 0, 0]
            },
            {
              width: "*",
              text: [
                {
                  text: "",
                  alignment: "center",
                  fontSize: 10,
                  italics: false
                },
                {
                  text: "",
                  alignment: "center",
                  fontSize: 10,
                  italics: false
                }
              ]
            }
          ]
        });

        docDef.content[13].columns[1].text[0].text = certificateData
          .currInitialPage[0]
          ? certificateData.currInitialPage[0].nameFull
          : "(Name) \n";
        docDef.content[13].columns[1].text[0].italics = certificateData
          .currInitialPage[0]
          ? certificateData.currInitialPage[0].nameItalics
          : true;
        docDef.content[13].columns[1].text[1].text = certificateData
          .currInitialPage[0]
          ? certificateData.currInitialPage[0].title
          : "(Appointment)";
        docDef.content[13].columns[1].text[1].italics = certificateData
          .currInitialPage[0]
          ? false
          : true;

        docDef.content.push({
          canvas: [
            {
              type: "line",
              x1: 20,
              y1: 5,
              x2: 200,
              y2: 5,
              lineWidth: 1
            }
          ]
        });
        /* docDef.content.push({
          stack: [
            {
              text:
                "\nInsert the type of ship from among the following: passenger ship; passenger high-speed craft; cargo high-speed craft; bulk carrier; oil tanker; chemical \n",
              fontSize: 8,
              margin: [25, 0, 10, 0]
            },
            {
              text:
                "tanker; gas carrier; mobile offshore drilling unit; other cargo ship.\n",
              fontSize: 8,
              margin: [20, 0, 10, 0]
            }
          ]
        }); */
        /* docDef.content.push({
          text: "1",
          fontSize: 7,
          absolutePosition:
            certificateData.vesselName.length < 54
              ? { x: 111, y: 273 }
              : { x: 111, y: 284 }
        }); */
        docDef.content.push({
          stack: [
            {
              canvas: [
                {
                  type: "rect",
                  x: 5,
                  y: certificateData.vesselName.length < 54 ? 28 : 18,
                  w: 525,
                  h: -720,
                  fillOpacity: 0.5,
                  lineWidth: 2
                }
              ]
            },
            {
              canvas: [
                {
                  type: "rect",
                  x: 0,
                  y: certificateData.vesselName.length < 54 ? 33 : 23,
                  w: 535,
                  h: -730,
                  fillOpacity: 0.5
                }
              ]
            },
            voidStatus == true
              ? {
                //ism initial second page
                canvas: [
                  {
                    type: "line",
                    x1: 0,
                    y1: -40,
                    x2: 525,
                    y2: -765,
                    color: "red",
                    lineWidth: 2
                  }
                ],
                absolutePosition: { x: 45, y: 798 }
              }
              : {}
          ]
        });
        console.log(docDef.content);

        var ismExtendauditPlace = certificateData.extension[0]
          ? certificateData.extension[0].auditPlace
          : "";

        var ismExtendDay = certificateData.extension[0]
          ? certificateData.extension[0].extendedIssueDate.split(" ")[0]
          : "";

        var ismExtendMnth = certificateData.extension[0]
          ? certificateData.extension[0].extendedIssueDate.split(" ")[1]
          : "";

        var ismExtendYear = certificateData.extension[0]
          ? certificateData.extension[0].extendedIssueDate.split(" ")[2]
          : "";

        var IsmExtendMnthYear = "";

        if (ismExtendMnth != "") {
          IsmExtendMnthYear = ismExtendMnth + ", " + ismExtendYear;
        }

        certificateAuthority =
          "Issued by the authority of the Republic of the Marshall Islands Maritime Administrator \nat " +
          ismExtendauditPlace +
          " this " +
          ismExtendDay +
          " day of " +
          IsmExtendMnthYear +
          ".";

        if (certificateData.AuditTypeId == this.appConstant.ISM_TYPE_ID) {
          if (
            certificateData.auditSubTypeId ==
            this.appConstant.INTERIM_SUB_TYPE_ID
          ) {
            var ismExtendExpiryDate = certificateData.extension[0]
              ? certificateData.extension[0].extendedExpireDate
              : "(Date)";

            docDef.content.push({
              stack: [
                {
                  columns: [
                    [
                      {
                        text: "Certificate Number",
                        fontSize: 10,
                        margin: [435, 0, 0, 0]
                      },
                      {
                        table: {
                          widths: [80],
                          body: [
                            [
                              voluntaryCert
                                ? certificateData.certificateNo.replace(
                                  "E",
                                  "EV"
                                )
                                : certificateData.certificateNo
                            ]
                          ]
                        },
                        margin: [427, 2, 0, 0],
                        fontSize: 8
                      }
                    ]
                  ],
                  pageBreak: "before"
                  //alignment:'right'
                },
                {
                  text: [
                    {
                      text:
                        "\n\n\nThe Validity of this Interim Safety Management Certificate is extended to ",
                      fontSize: 10
                    },
                    {
                      text: ismExtendExpiryDate.replace(/^0+/, "") + ".",
                      italics: ismExtendExpiryDate == "(Date)" ? true : false,
                      fontSize: 10
                    }
                  ],
                  margin: [25, 0, 0, 0]
                }
              ]
            });
            var ismExtendauditPlace = certificateData.extension[0]
              ? certificateData.extension[0].auditPlace
              : "(Location)";

            var ismExtendDay = certificateData.extension[0]
              ? certificateData.extension[0].extendedIssueDate.split(" ")[0]
              : "(Day)";

            var ismExtendMnth = certificateData.extension[0]
              ? certificateData.extension[0].extendedIssueDate.split(" ")[1]
              : "";

            var ismExtendYear = certificateData.extension[0]
              ? certificateData.extension[0].extendedIssueDate.split(" ")[2]
              : "";
            docDef.content.push({
              columns: [
                {
                  width: 100,
                  text: ""
                },
                {
                  width: "*",
                  text: [
                    {
                      text:
                        "\n\n\n\nIssued by the authority of the Republic of the Marshall Islands Maritime Administrator\nat "
                    },
                    {
                      text: certificateData.extension[0]
                        ? ismExtendauditPlace
                        : "(Location)",
                      italics:
                        ismExtendauditPlace == "(Location)" ? true : false
                    },
                    { text: " this " },
                    {
                      text: certificateData.extension[0]
                        ? this.ordinal_suffix_of(
                          ismExtendDay.replace(/^0+/, "")
                        )
                        : "(Day)",
                      italics: ismExtendDay == "(Day)" ? true : false
                    },
                    { text: " day of " },
                    {
                      text: certificateData.extension[0]
                        ? IsmExtendMnthYear + "."
                        : "(Month, Year).",
                      italics: certificateData.extension[0] ? false : true
                    }
                  ],
                  fontSize: 10,
                  margin: [60, 0, 0, 0]
                }
              ]
            });

            var extTitle = "";
            extTitle = certificateData.extension[0]
              ? certificateData.extension[0].sealImage
              : _that.images["transparent"];

            docDef.content.push({
              columns: [
                {
                  image: extTitle,
                  width: 80,
                  height: 80,
                  margin: [60, 0, 0, 0]
                },
                {
                  width: "*",
                  text: []
                },
                {
                  columns: [
                    [
                      {
                        text: ["\n\n\n"]
                      },
                      {
                        image: "",
                        width: 150,
                        height: 20,
                        margin: [0, 0, 60, 0]
                      }
                    ]
                  ],
                  width: "auto"
                }
              ]
            });



            docDef.content[18].columns[2].columns[0][1].image = certificateData.extension[0] && certificateData.extension[0].signToPrint == 1 ? "data:image/png;base64,"
              + certificateData.extension[0].issuerSign : _that.images['transparent'];

            docDef.content.push({
              columns: [
                {
                  width: "*",
                  text: certificateData.sealcontent + "\n",
                  fontSize: 10,
                  margin: [20, 0, 0, 0]
                },
                {
                  canvas: [
                    {
                      type: "line",
                      x1: 0,
                      y1: 0,
                      x2: 250,
                      y2: 0,
                      lineWidth: 1
                    }
                  ]
                }
              ]
            });

            docDef.content.push({
              columns: [
                {
                  width: '*',
                  text: ['']
                },
                {
                  width: '*',
                  text: [
                    {
                      text: '',
                      alignment: "center",
                      fontSize: 10,
                      italics: false
                    },
                    {
                      text: '',
                      alignment: "center",
                      fontSize: 10,
                      italics: false
                    }
                  ],
                  margin: [0, -10, 0, 0]
                }
              ]
            });

            docDef.content[20].columns[1].text[0].text = certificateData
              .extension[0]
              ? certificateData.extension[0].nameFull
              : "(Name) \n";
            docDef.content[20].columns[1].text[0].italics = certificateData
              .extension[0]
              ? certificateData.extension[0].nameItalics
              : true;
            docDef.content[20].columns[1].text[1].text = certificateData
              .extension[0]
              ? certificateData.extension[0].title
              : "(Appointment)";
            docDef.content[20].columns[1].text[1].italics = certificateData
              .extension[0]
              ? false
              : true;
          }
        }
        docDef.content.push(
          //ism second page border
          {
            stack: [
              {
                canvas: [
                  {
                    type: "rect",
                    x: 5,
                    y: 456,
                    w: 525,
                    h: -720,
                    fillOpacity: 0.5,
                    lineWidth: 2
                  }
                ]
              },
              {
                canvas: [
                  {
                    type: "rect",
                    x: 0,
                    y: 460,
                    w: 535,
                    h: -730,
                    fillOpacity: 0.5
                  }
                ]
              },
              voidStatus == true
                ? {
                  //ism initial second page
                  canvas: [
                    {
                      type: "line",
                      x1: 0,
                      y1: -40,
                      x2: 525,
                      y2: -765,
                      color: "red",
                      lineWidth: 2
                    }
                  ],
                  absolutePosition: { x: 45, y: 798 }
                }
                : {}
            ]
          }
        );




      } else if (certificateData.auditSubTypeId == this.appConstant.INITIAL_SUB_TYPE_ID || certificateData.auditSubTypeId == this.appConstant.RENEWAL_SUB_TYPE_ID) {
        console.log(certificateData)
        var intermediateCross = false;//(certificateData.additional[0] && certificateData.additional[0].withoutCross)?certificateData.additional[0].withoutCross:'';
        var additionalCross1 = false;
        var additionalCross2 = false;
        var additionalCross3 = false;
        var withoutcross = true;


        intermediateCross = (certificateData.intermediateReissue[0]) ? certificateData.intermediateReissue[0].interReissue : false;
        additionalCross1 = (certificateData.additionalReissue1[0]) ? certificateData.additionalReissue1[0].addReissue : false;
        additionalCross2 = (certificateData.additionalReissue2[0]) ? certificateData.additionalReissue2[0].addReissue : false;
        additionalCross3 = (certificateData.additionalReissue3[0]) ? certificateData.additionalReissue3[0].addReissue : false;

        docDef = {
          ownerPassword: '123456',
          permissions: {
            printing: 'highResolution',
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: false,
            documentAssembly: false
          },

          defaultStyle: {
            font: 'Times'
          }, pageSize: 'Letter',

          footer: {
            text: footerNote,
            alignment: 'right',
            margin: [60, -10, 60, 0],
            fontSize: 9
          },

          content: [],
          // pageMargins: [5, 5, 5, 5],
          background: function (currentPage, pageSize) {
            return {
              image: _that.images["watermark"],
              width: 300,
              absolutePosition: {
                x: 150,
                y: 260
              },
              opacity: 0.7
            }
          },
          styles: {
            rightme: {
              alignment: 'center',
              //margin : [ 0, 10 ]
            },
            header: {
              fontSize: 16,
              bold: true
            }
          }
        };


        docDef.content.push({
          columns: [{
            image: '',
            width: 80,
            height: 80,
            margin: [10, 15, 0, 0]
          }, {
            width: 350,
            margin: [0, 10, 0, 0],
            text: [{
              text: 'Republic of the Marshall Islands\n',
              fontSize: 23,
              bold: true,
              color: '#525252'
            }, {
              text: 'Maritime Administrator\n',
              fontSize: 14,
              bold: true,
              color: '#666666'
            }, {
              text: tempcertificateHead,
              fontSize: 17,
              bold: true,
              color: '#666666'
            }, {
              text: "\nIssued under the provisions of the International Convention for the "
                + '\n',
              fontSize: 10,
              color: 'black',
              alignment: 'center'
            },
            {
              text: "Safety of Life at Sea, 1974 (SOLAS), as amended"
                + '\n\n',
              fontSize: 10,
              color: 'black',
              alignment: 'center'
            },
            {
              text: 'Under the authority of the Government of the Republic of the Marshall Islands\n\n',
              fontSize: 10,
              color: 'black',
              alignment: 'center'
            }],
            style: 'rightme'
          }, {
            columns: [[{
              text: 'Certificate Number',
              fontSize: 10,
              margin: [3, 0, 0, 0]
            }, {
              table: {
                widths: [80],
                body: [[voluntaryCert ? certificateData.certificateNo.replace("F", "FV") : certificateData.certificateNo]]
              },
              margin: [-3, 2, 0, 0], fontSize: 8
            }, {
              qr: certificateData.qrCodeUrl,
              fit: 90,
              margin: [1, 10, 0, 0]
              /*image:certificateData.QrC,
              width : 60,
              height : 60,
              margin : [ 12, 10,0,0 ]*/
            }]],
            width: 'auto'
          }]
        });

        docDef.content[0].columns[0].image = _that.images["logo"];

        docDef.content
          .push({
            text: [
            ],
            margin: [0, -40, 0, 0]
          });

        docDef.content.push({
          text: 'Particulars of the Ship:',
          bold: true,
          fontSize: 10,
          margin: [20, 50, 0, 10]
        });

        docDef.content.push([{

          margin: [20, 0, 0, 0],
          table: {
            widths: [155, 315],
            heights: [0, 0],
            body: [
              [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "Name of Ship:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.vesselName, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: 'Distinctive Number or Letters:', fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.officialNo, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "Port of Registry:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.portofreg, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: Grt, fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.grt, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "IMO No.:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.vesselImoNo, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "Type of Ship :", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.shiptype + '\n\n', fontSize: 10, bold: false }]


                }
              ]]
          },
          layout: 'noBorders'
        }

        ])
        var num = {
          text: '1',
          fontSize: 5,
          italics: true
        };

        docDef.content.push({
          text: nmecompny,
          bold: true,
          fontSize: 10,
          margin: [20, 0]
        });


        docDef.content.push({
          text: '(see paragraph 1.1.2 of the ISM Code) \n\n',
          bold: false,
          fontSize: 10,
          margin: [20, 0]
        });

        var companyname = '', companyaddress = "";
        if (certificateData.AuditTypeId == this.appConstant.ISM_TYPE_ID
          || certificateData.AuditTypeId == this.appConstant.ISPS_TYPE_ID) {

          companyname = 'Company Name:';

        } else if (certificateData.AuditTypeId == this.appConstant.MLC_TYPE_ID) {

          companyname = 'Shipowner Name:';

        }

        if (certificateData.AuditTypeId == this.appConstant.ISM_TYPE_ID
          || certificateData.AuditTypeId == this.appConstant.ISPS_TYPE_ID) {

          companyaddress = 'Company Address:';

        } else if (certificateData.AuditTypeId == this.appConstant.MLC_TYPE_ID) {

          companyaddress = 'Shipowner Address:';

        }

        docDef.content.push([{

          margin: [20, 0, 0, 0],
          table: {
            widths: [155, 300],
            heights: [25, 45],
            body: [
              [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: companyname, fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.companyname, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: companyaddress, fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.companyaddress, fontSize: 10, bold: false }]


                }
              ]]
          },
          layout: 'noBorders'
        }

        ])




        docDef.content.push({
          columns: [{
            width: '*',
            text: [],
            margin: [10, 0]

          }, {
            width: '*',
            text: [],
            margin: [-83, 0, 0, 0]
          }],
          margin: [10, 0],
          fontSize: 10,
          color: '#141414'
        });

        if (certificateData.companyaddress.length > 60) {
          docDef.content[7].columns[0].text
            .push('Company Identification Number: \n\n');

          docDef.content[7].columns[1].text
            .push(certificateData.companyimono = certificateData.companyimono ? certificateData.companyimono : '' + '\n\n');
        } else {
          docDef.content[7].columns[0].text
            .push('Company Identification Number: \n\n');

          docDef.content[7].columns[1].text
            .push(certificateData.companyimono = certificateData.companyimono ? certificateData.companyimono : '' + '\n\n');
        }

        docDef.content.push({ // to draw a horizontal line
          canvas: [{
            type: 'line',
            x1: 15,
            y1: 5,
            x2: 520,
            y2: 5,
            lineWidth: 2
          }]
        });
        var certificateInitial = ' the safety management system of the ship has been audited and that it complies'
          + ' with the requirements of the International Management Code for the Safe Operation of Ships and for Pollution'
          + ' Prevention (ISM Code), following verification that the Document of Compliance for the Company is'
          + ' applicable to this type of ship.';


        var expirydate = certificateData.expirydate ? certificateData.expirydate : '(Date)';

        var certificateInitial1 = 'This Safety Management Certificate is valid until ' + expirydate.replace(/^0+/, '') + ', subject to periodical verification and that the Document of Compliance remains valid.';
        docDef.content.push({
          text: [{ text: '\nTHIS IS TO CERTIFY THAT', bold: true },
          { text: certificateInitial + '\n\n' + certificateInitial1 + '\n\n' },
          ],
          width: 10,
          margin: [20, 0],
          fontSize: 10,
          alignment: 'justify'
        });
        //var auditDate=certificateData.certIssueDate?certificateData.auditDate:'dd/mm/yy';
        var issueDate = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].completionDate : certificateData.certificateDetails[0].completionDate;
        var finalIssuedDate = '(Date)';
        if (issueDate != 'N.A') {
          if (moment(issueDate, 'YYYY-MM-DD', true).isValid())
            finalIssuedDate = moment(issueDate, 'YYYY-MM-DD').format('DD MMMM YYYY');
          else if (moment(issueDate, 'DD-MMM-YYYY', true).isValid())
            finalIssuedDate = moment(issueDate, 'DD-MMM-YYYY').format('DD MMMM YYYY');//date formate is changed by lokesh for jira_id)(900)
          else
            finalIssuedDate = issueDate;
        }
        else {
          finalIssuedDate = '(Date)';
        }



        var certificateInitial2 = 'Completion date of the verification on which this Certificate is based: ' + finalIssuedDate + '.';

        docDef.content.push({
          text: certificateInitial2 + '\n\n\n',
          fontSize: 10,
          margin: [20, 0]
        });


        docDef.content.push({
          stack: [
            {
              text: certificateAuthority + '\n\n',
              fontSize: 10,
              margin: [130, -10, 0, 0]
            },
            { text: '1', fontSize: 7, absolutePosition: (certificateData.vesselName.length < 54) ? { x: 59, y: 690 } : { x: 59, y: 700 } }
          ]
        });


        docDef.content.push({
          columns: [{
            image: _that.images['transparent'],
            width: 80,
            height: 80,
            margin: [40, -20, 0, 0]
          }, {
            width: '*',
            text: []
          }, {
            columns: [[{
              text: ['\n\n\n']
            }, {
              image: _that.images['transparent'],
              width: 160,
              height: 30,
              margin: [20, -20, 0, 0]
            }]],
            //width : 'auto'
          }]
        })
        //initial section
        docDef.content[12].columns[0].image = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].sealImage : _that.images['transparent'];
        docDef.content[12].columns[2].columns[0][1].image = certificateData.currInitialPage[0] && certificateData.currInitialPage[0].signToPrint == 1 ? "data:image/png;base64,"
          + certificateData.currInitialPage[0].issuerSign : _that.images['transparent'];


        docDef.content.push({
          columns: [{
            width: '*',
            text: certificateData.sealcontent + '\n',
            fontSize: 10,
            margin: [20, 0, 0, 0]
          }, {
            canvas: [{
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 250,
              y2: 0,
              lineWidth: 1
            }]
          }]
        })

        docDef.content.push({
          columns: [{
            width: '*',
            text: ['\n', {
              text: "Unique Tracking Number: ",
              fontSize: 10
            }, {
                text: certificateData.utn,
                bold: true,
                fontSize: 10
              }],
            margin: [20, 0, 0, 0]
          }, {
            width: '*',
            text: [{
              text: '',
              alignment: 'center',
              fontSize: 10,
              italics: false
            }, {
              text: '',
              alignment: 'center',
              fontSize: 10,
              italics: false
            }],
            margin: [0, -10, 0, 0]
          }]
        })
        //initial section name and title

        docDef.content[14].columns[1].text[0].text = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].nameFull : '(Name) \n';
        docDef.content[14].columns[1].text[0].italics = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].nameItalics : true
        docDef.content[14].columns[1].text[1].text = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].title : '(Appointment)';
        docDef.content[14].columns[1].text[1].italics = certificateData.currInitialPage[0] ? false : true;


        docDef.content.push({
          canvas: [{
            type: 'line',
            x1: 20,
            y1: 5,
            x2: 197,
            y2: 5,
            lineWidth: 1
          }]
        })

        var isminitialDesc1 = '\n Insert the type of ship from among the following: passenger ship; passenger high-speed craft; cargo high-speed craft; bulk ';
        var isminitialDesc2 = 'carrier; oil tanker;chemical tanker; gas carrier; mobile offshore drilling unit; other cargo ship.';
        var isminitialDesc1 = isminitialDesc1 + isminitialDesc2;
        docDef.content.push({ text: '1', fontSize: 7, absolutePosition: (certificateData.vesselName.length < 54) ? { x: 111, y: 273 } : { x: 111, y: 283 } });
        docDef.content.push({
          stack: [
            { text: "\nInsert the type of ship from among the following: passenger ship; passenger high-speed craft; cargo high-speed craft; bulk carrier; oil tanker; chemical ", fontSize: 8, margin: [25, 0, 10, 0] },
            { text: "tanker; gas carrier; mobile offshore drilling unit; other cargo ship. \n", fontSize: 8, margin: [20, 0, 10, 0] },
            { text: '\n\n' }
          ]
        },
          {
            stack: [
              {
                canvas: [
                  {
                    type: 'rect',
                    x: 5, y: (certificateData.vesselName.length < 54) ? 20 : 20,
                    w: 525,
                    h: -725,
                    fillOpacity: 0.5,
                    lineWidth: 2
                  }
                ]
              },
              {
                canvas: [
                  {
                    type: 'rect',
                    x: 0, y: (certificateData.vesselName.length < 54) ? 25 : 25,
                    w: 535,
                    h: -735,
                    fillOpacity: 0.5
                  }
                ]
              },
              voidStatus == true ? {//ism initial second page
                canvas: [{
                  type: 'line',
                  x1: 0,
                  y1: -40,
                  x2: 525,
                  y2: -765,
                  color: 'red',
                  lineWidth: 2
                }
                ],
                absolutePosition: { x: 45, y: 798 }
              } : {}
            ]

          });

        var ismendorse = 'ENDORSEMENT FOR INTERMEDIATE VERIFICATION AND ADDITIONAL VERIFICATION';
        var ismendorse1 = '(IF REQUIRED)';
        docDef.content.push({
          columns: [{
            columns: [[{
              text: 'Certificate Number',
              fontSize: 10,
              pageBreak: 'before',
              margin: [435, 0, 0, 0]
            }, {
              table: {
                widths: [80],
                body: [[voluntaryCert ? certificateData.certificateNo.replace("F", "FV") : certificateData.certificateNo]]
              },
              margin: [427, 2, 0, 0], fontSize: 8
            }]],
            width: 'auto',
          }]
        }, {

          stack: [
            {
              canvas: [
                {
                  type: 'rect',
                  x: 5, y: 693,
                  w: 525,
                  h: -727,
                  fillOpacity: 0.5,
                  lineWidth: 2
                }
              ]
            },
            {
              canvas: [
                {
                  type: 'rect',
                  x: 0, y: 698,
                  w: 535,
                  h: -737,
                  fillOpacity: 0.5
                }
              ]
            }
          ]
        });
        docDef.content.push({
          text: ismendorse + '\n',
          fontSize: 10,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 0]
        });
        docDef.content.push({
          text: ismendorse1 + '\n\n',
          fontSize: 10,
          bold: true,
          alignment: 'center',
          margin: [30, 0, 0, 0]
        });

        var endorseContent = 'THIS IS TO CERTIFY that, at the periodical verification in accordance with regulation IX/6.1 of SOLAS and paragraph \n13.8 of the ISM Code, the Safety Management System was found to comply with the requirements of the ISM Code.';

        docDef.content.push({
          text: endorseContent + '\n\n\n',
          fontSize: 10,
          margin: [30, 0, 20, 0]
        });

        // ISM Intermediate Starts here...

        var IntermediatesealContent = '';

        IntermediatesealContent = certificateData.intermediate[0] ? certificateData.intermediate[0].sealImage : _that.images['transparent'];

        docDef.content.push({
          alignment: 'justify',
          columns: [
            {
              width: 215,
              stack: [
                {
                  text: [
                    { text: "Intermediate Verification:\n" },
                    { text: '(to be completed between the' + '\n' + ' second and third anniversary date)', italics: true }
                  ], fontSize: 10, margin: [30, 0, 0, 0]
                }, {
                  image: IntermediatesealContent,
                  width: 70,
                  height: 70,
                  margin: [45, 10, 0, 0]
                }
              ]
            },
            {
              width: '*',
              table: {
                body: [
                  [
                    {
                      stack: [
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Signed:", fontSize: 10
                            }, {
                              image: (certificateData.intermediate[0] && certificateData.intermediate[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.intermediate[0].issuerSign : _that.images['transparent'],
                              width: 150,
                              height: 20,
                              margin: [45, -15, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        }, {
                          text: [
                            { text: (certificateData.intermediate[0] && certificateData.intermediate[0].nameToPrint === 1) ? certificateData.intermediate[0].issuerName + '\n' : '(Name)\n', italics: (certificateData.intermediate[0] && certificateData.intermediate[0].nameToPrint === 1 && certificateData.intermediate[0].issuerName) ? false : true },
                            { text: (certificateData.intermediate[0] && certificateData.intermediate[0].title) ? certificateData.intermediate[0].title : '(Appointment)', italics: (certificateData.intermediate[0] && certificateData.intermediate[0].title) ? false : true }
                          ],
                          fontSize: 10, margin: [20, 0, 0, 0],
                          alignment: 'center'
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Place:",
                              fontSize: 10,
                              margin: [0, 13, 0, 0]
                            }, {
                              text: (certificateData.intermediate[0] && certificateData.intermediate[0].auditPlace) ? certificateData.intermediate[0].auditPlace : '   ',
                              fontSize: 10,
                              margin: [5, 10, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Date:",
                              fontSize: 10,
                              margin: [0, 30, 0, 0]
                            }, {
                              text: (certificateData.intermediate[0] && certificateData.intermediate[0].issuerSignDate) ? certificateData.intermediate[0].issuerSignDate.replace(/^0+/, '') : '    ',
                              fontSize: 10,
                              margin: [5, 25, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                ]
              }, layout: 'noBorders'
            }
          ]
        })
        docDef.content.push({
          text: '(Seal or stamp of issuing authority, as appropriate)' + '\n\n',
          fontSize: 10,
          italics: true,
          margin: [30, 10, 0, 0]
        })
        if ((intermediateCross)) {
          docDef.content.push({
            columns: [{
              width: '*',
              text: 'VERIFICATION PREVIOUSLY CARRIED OUT',
              fontSize: 15,
              absolutePosition: { x: 175, y: 190 }
            }]
          });
          docDef.content.push({
            canvas: [{
              type: 'line',
              x1: 20,
              y1: -15,
              x2: 510,
              y2: -148,
              lineWidth: 1
            }]
          });
        }

        // ISM Additional Starts here... (1)

        if (certificateData.additional1[0] || certificateData.additional1.length == 0) {

          var AdditionalsealContent = '';
          AdditionalsealContent = certificateData.additional1[0] ? certificateData.additional1[0].sealImage : _that.images['transparent'];


          docDef.content.push({
            alignment: 'justify',
            columns: [
              {
                width: 215,
                stack: [
                  {
                    text: [
                      { text: "Additional Verification*:\n" }
                    ], fontSize: 10, margin: [30, 0, 0, 0]
                  }, {
                    image: AdditionalsealContent,
                    width: 70,
                    height: 70,
                    margin: [45, 17, 0, 0]
                  }
                ]
              },
              {
                width: '*',
                table: {
                  body: [
                    [
                      {
                        stack: [
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Signed:", fontSize: 10
                              }, {
                                image: (certificateData.additional1[0] && certificateData.additional1[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.additional1[0].issuerSign : _that.images['transparent'],
                                width: 150,
                                height: 20,
                                margin: [45, -15, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }, {
                            text: [
                              { text: (certificateData.additional1[0] && certificateData.additional1[0].nameToPrint === 1) ? certificateData.additional1[0].issuerName + '\n' : '(Name)\n', italics: (certificateData.additional1[0] && certificateData.additional1[0].nameToPrint === 1 && certificateData.additional1[0].issuerName) ? false : true },
                              { text: (certificateData.additional1[0] && certificateData.additional1[0].title) ? certificateData.additional1[0].title : '(Appointment)', italics: (certificateData.additional1[0] && certificateData.additional1[0].title) ? false : true }
                            ],
                            fontSize: 10, margin: [20, 0, 0, 0],
                            alignment: 'center'
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Place:",
                                fontSize: 10,
                                margin: [0, 13, 0, 0]
                              }, {
                                text: (certificateData.additional1[0] && certificateData.additional1[0].auditPlace) ? certificateData.additional1[0].auditPlace : '     ',
                                fontSize: 10,
                                margin: [5, 10, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Date:",
                                fontSize: 10,
                                margin: [0, 30, 0, 0]
                              }, {
                                text: (certificateData.additional1[0] && certificateData.additional1[0].issuerSignDate) ? certificateData.additional1[0].issuerSignDate.replace(/^0+/, '') : '   ',
                                fontSize: 10,
                                margin: [5, 25, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  ]
                }, layout: 'noBorders'
              }
            ]
          })

          docDef.content.push({
            text: '(Seal or stamp of issuing authority, as appropriate)' + '\n\n',
            fontSize: 10,
            italics: true,
            margin: [30, 10, 0, 0]
          })
          if ((additionalCross1)) {
            docDef.content.push({
              columns: [{
                width: '*',
                text: 'VERIFICATION PREVIOUSLY CARRIED OUT',
                fontSize: 15,
                absolutePosition: { x: 175, y: 333 }
              }]
            });
            docDef.content.push({
              canvas: [{
                type: 'line',
                x1: 20,
                y1: -15,
                x2: 510,
                y2: -148,
                lineWidth: 1
              }]
            });
          }
        }

        // ISM Additional Starts here... (2)

        if (certificateData.additional2[0] || certificateData.additional2.length == 0) {

          var AdditionalsealContent1 = '';
          AdditionalsealContent1 = certificateData.additional2[0] ? certificateData.additional2[0].sealImage : _that.images['transparent'];

          docDef.content.push({
            alignment: 'justify',
            columns: [
              {
                width: 215,
                stack: [
                  {
                    text: [
                      { text: "Additional Verification*:\n" }
                    ], fontSize: 10, margin: [30, 0, 0, 0]
                  }, {
                    image: AdditionalsealContent1,
                    width: 70,
                    height: 70,
                    margin: [45, 17, 0, 0]
                  }
                ]
              },
              {
                width: '*',
                table: {
                  body: [
                    [
                      {
                        stack: [
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Signed:", fontSize: 10
                              }, {
                                image: (certificateData.additional2[0] && certificateData.additional2[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.additional2[0].issuerSign : _that.images['transparent'],
                                width: 150,
                                height: 20,
                                margin: [45, -15, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }, {
                            text: [
                              { text: (certificateData.additional2[0] && certificateData.additional2[0].nameToPrint === 1) ? certificateData.additional2[0].issuerName + '\n' : '(Name)\n', italics: (certificateData.additional2[0] && certificateData.additional2[0].nameToPrint === 1 && certificateData.additional2[0].issuerName) ? false : true },
                              { text: (certificateData.additional2[0] && certificateData.additional2[0].title) ? certificateData.additional2[0].title : '(Appointment)', italics: (certificateData.additional2[0] && certificateData.additional2[0].title) ? false : true }
                            ],
                            fontSize: 10, margin: [20, 0, 0, 0],
                            alignment: 'center'
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Place:",
                                fontSize: 10,
                                margin: [0, 13, 0, 0]
                              }, {
                                text: (certificateData.additional2[0] && certificateData.additional2[0].auditPlace) ? certificateData.additional2[0].auditPlace : '     ',
                                fontSize: 10,
                                margin: [5, 10, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Date:",
                                fontSize: 10,
                                margin: [0, 30, 0, 0]
                              }, {
                                text: (certificateData.additional2[0] && certificateData.additional2[0].issuerSignDate) ? certificateData.additional2[0].issuerSignDate.replace(/^0+/, '') : '   ',
                                fontSize: 10,
                                margin: [5, 25, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  ]
                }, layout: 'noBorders'
              }
            ]
          })
          docDef.content.push({
            text: '(Seal or stamp of issuing authority, as appropriate)' + '\n\n',
            fontSize: 10,
            italics: true,
            margin: [30, 10, 0, 0]
          })
          if (additionalCross2) {

            docDef.content.push({
              columns: [{
                width: '*',
                text: 'VERIFICATION PREVIOUSLY CARRIED OUT',
                fontSize: 15,
                absolutePosition: { x: 175, y: 470 }
              }]
            });
            docDef.content.push({
              canvas: [{
                type: 'line',
                x1: 20,
                y1: -15,
                x2: 510,
                y2: -148,
                lineWidth: 1
              }]
            });

          }

          // ISM Additional Starts here... (3)

          if (certificateData.additional3[0] || certificateData.additional3.length == 0) {
            var AdditionalsealContent2 = '';
            AdditionalsealContent1 = certificateData.additional3[0] ? certificateData.additional3[0].sealImage : _that.images['transparent'];

            docDef.content.push({
              alignment: 'justify',
              columns: [
                {
                  width: 215,
                  stack: [
                    {
                      text: [
                        { text: "Additional Verification*:\n" }
                      ], fontSize: 10, margin: [30, 0, 0, 0]
                    }, {
                      image: AdditionalsealContent1,
                      width: 70,
                      height: 70,
                      margin: [45, 17, 0, 0]
                    }
                  ]
                },
                {
                  width: '*',
                  table: {
                    body: [
                      [
                        {
                          stack: [
                            {
                              columns: [
                                {
                                  width: 40,
                                  text: "Signed:", fontSize: 10
                                }, {
                                  image: (certificateData.additional3[0] && certificateData.additional3[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.additional3[0].issuerSign : _that.images['transparent'],
                                  width: 150,
                                  height: 20,
                                  margin: [45, -15, 0, 0]
                                }
                              ]
                            },
                            {
                              columns: [
                                {
                                }, {
                                  canvas: [{
                                    type: 'line',
                                    x1: -125,
                                    y1: 10,
                                    x2: 125,
                                    y2: 10,
                                    lineWidth: 1
                                  }],
                                  margin: [20, -11, 0, 0]
                                }
                              ]
                            }, {
                              text: [
                                { text: (certificateData.additional3[0] && certificateData.additional3[0].nameToPrint === 1) ? certificateData.additional3[0].issuerName + '\n' : '(Name)\n', italics: (certificateData.additional3[0] && certificateData.additional3[0].nameToPrint === 1 && certificateData.additional3[0].issuerName) ? false : true },
                                { text: (certificateData.additional3[0] && certificateData.additional3[0].title) ? certificateData.additional3[0].title : '(Appointment)', italics: (certificateData.additional3[0] && certificateData.additional3[0].title) ? false : true }
                              ],
                              fontSize: 10, margin: [20, 0, 0, 0],
                              alignment: 'center'
                            },
                            {
                              columns: [
                                {
                                  width: 40,
                                  text: "Place:",
                                  fontSize: 10,
                                  margin: [0, 13, 0, 0]
                                }, {
                                  text: (certificateData.additional3[0] && certificateData.additional3[0].auditPlace) ? certificateData.additional3[0].auditPlace : '     ',
                                  fontSize: 10,
                                  margin: [5, 10, 0, 0]
                                }
                              ]
                            },
                            {
                              columns: [
                                {
                                }, {
                                  canvas: [{
                                    type: 'line',
                                    x1: -125,
                                    y1: 10,
                                    x2: 125,
                                    y2: 10,
                                    lineWidth: 1
                                  }],
                                  margin: [20, -11, 0, 0]
                                }
                              ]
                            },
                            {
                              columns: [
                                {
                                  width: 40,
                                  text: "Date:",
                                  fontSize: 10,
                                  margin: [0, 30, 0, 0]
                                }, {
                                  text: (certificateData.additional3[0] && certificateData.additional3[0].issuerSignDate) ? certificateData.additional3[0].issuerSignDate.replace(/^0+/, '') : '   ',
                                  fontSize: 10,
                                  margin: [5, 25, 0, 0]
                                }
                              ]
                            },
                            {
                              columns: [
                                {
                                }, {
                                  canvas: [{
                                    type: 'line',
                                    x1: -125,
                                    y1: 10,
                                    x2: 125,
                                    y2: 10,
                                    lineWidth: 1
                                  }],
                                  margin: [20, -11, 0, 0]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    ]
                  }, layout: 'noBorders'
                }
              ]
            })
            docDef.content.push(voidStatus == true ? {//ism initial second page
              canvas: [{
                type: 'line',
                x1: 0,
                y1: -40,
                x2: 525,
                y2: -765,
                color: 'red',
                lineWidth: 2
              }
              ],
              absolutePosition: { x: 45, y: 800 }
            } : {})
            docDef.content.push({
              text: '(Seal or stamp of issuing authority, as appropriate)' + '\n\n',
              fontSize: 10,
              italics: true,
              margin: [30, 10, 0, 0]
            })
            if ((additionalCross3)) {
              docDef.content.push({
                columns: [{
                  width: '*',
                  text: 'VERIFICATION PREVIOUSLY CARRIED OUT',
                  fontSize: 15,
                  absolutePosition: { x: 175, y: 602 }
                }]
              });
              docDef.content.push({
                canvas: [{
                  type: 'line',
                  x1: 20,
                  y1: -15,
                  x2: 510,
                  y2: -148,
                  lineWidth: 1
                }]
              });
            }
          }
        }


        var ismendContents = '*If applicable. Refer to the relevant provisions of section 4.3, Initial verification, of the Revised Guidelines on the Implementation of the International Safety Management (ISM) Code by Administrations adopted by the Organization by Resolution A.1118(30).';
        docDef.content.push({
          text: ismendContents,
          fontSize: 10,
          margin: [30, 0, 20, 0],
          italics: true,
          alignment: 'justify',
          pageBreak: 'after'

        });


        // Next Page
        docDef.content.push({
          columns: [{
            columns: [[{
              text: 'Certificate Number',
              fontSize: 10,
              //pageBreak:'before',
              margin: [435, 0, 0, 0]
            }, {
              table: {
                widths: [80],
                body: [[voluntaryCert ? certificateData.certificateNo.replace("F", "FV") : certificateData.certificateNo]]
              },
              margin: [427, 2, 0, 0], fontSize: 8
            }]],
            width: 'auto',
          }]
        }, {

          stack: [
            {
              canvas: [
                {
                  type: 'rect',
                  x: 5, y: 693,
                  w: 525,
                  h: -727,
                  fillOpacity: 0.5,
                  lineWidth: 2
                }
              ]
            },
            {
              canvas: [
                {
                  type: 'rect',
                  x: 0, y: 698,
                  w: 535,
                  h: -737,
                  fillOpacity: 0.5
                }
              ]
            }
          ]
        });

        var ismendorsecontent2 = 'ENDORSEMENT WHERE THE RENEWAL VERIFICATION HAS BEEN COMPLETED AND PART B 13.13 OF THE ISM CODE APPLIES.';

        docDef.content.push({
          text: ismendorsecontent2 + '\n\n',
          fontSize: 10,
          bold: true,
          margin: [30, 10, 30, 0]
        });
        var renewalDate = (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].extendedExpireDate) ? certificateData.renewalEndorse2[0].extendedExpireDate : '(Date)'
        var ismendorsecontent3 = 'The ship complies with the relevant provisions of part B of the ISM Code and the Certificate should, in accordance with part B 13.13 of the ISM Code, be accepted as valid until ';
        docDef.content.push({
          text: [
            { text: ismendorsecontent3 },
            { text: renewalDate.replace(/^0+/, '') + '.\n\n', italics: (renewalDate == '(Date)') ? true : false }
          ],
          fontSize: 10,
          margin: [30, 0]
        });

        // Renewal Endorsement start
        if (certificateData.crossLineStatus == "extent-inactive" || certificateData.crossLineStatus == "inactive") {
          if (certificateData.currentCertiObj.certIssueId == 1002) {
            certificateData.renewalEndorse2.length = 0;
          } else if (certificateData.currentCertiObj.seqNo < (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].seqNo)) {
            certificateData.renewalEndorse2.length = 0;
            /*certificateData.certificateDetails.forEach(function (exten){
              if(certificateData.currentCertiObj.seqNo > )
            })*/
          }
        }

        var renewalsealContent = '';

        renewalsealContent = certificateData.renewalEndorse2[0] ? certificateData.renewalEndorse2[0].sealImage : _that.images['transparent'];

        docDef.content.push({
          alignment: 'justify',
          columns: [
            {
              width: 215,
              stack: [
                {
                  text: [
                    { text: "Endorsement:" },
                  ], fontSize: 10, margin: [30, 0, 0, 0]
                }, {
                  image: renewalsealContent,
                  width: 70,
                  height: 70,
                  margin: [45, 10, 0, 0]
                }
              ]
            },
            {
              width: '*',
              table: {
                body: [
                  [
                    {
                      stack: [
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Signed:", fontSize: 10
                            }, {
                              image: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.renewalEndorse2[0].issuerSign : _that.images['transparent'],
                              width: 150,
                              height: 20,
                              margin: [45, -15, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        }, {
                          text: [
                            { text: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].nameToPrint === 1) ? certificateData.renewalEndorse2[0].issuerName + '\n' : '(Name)\n', italics: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].nameToPrint === 1 && certificateData.renewalEndorse2[0].issuerName) ? false : true },
                            { text: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].title) ? certificateData.renewalEndorse2[0].title : '(Appointment)', italics: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].title) ? false : true }
                          ],
                          fontSize: 10, margin: [20, 0, 0, 0],
                          alignment: 'center'
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Place:",
                              fontSize: 10,
                              margin: [0, 13, 0, 0]
                            }, {
                              text: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].auditPlace) ? certificateData.renewalEndorse2[0].auditPlace : '   ',
                              fontSize: 10,
                              margin: [5, 10, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Date:",
                              fontSize: 10,
                              margin: [0, 30, 0, 0]
                            }, {
                              text: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].issuerSignDate) ? certificateData.renewalEndorse2[0].issuerSignDate.replace(/^0+/, '') : '    ',
                              fontSize: 10,
                              margin: [5, 25, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                ]
              }, layout: 'noBorders'
            }
          ], margin: [0, 10, 0, 0]
        })
        docDef.content.push({
          text: '(Seal or stamp of issuing authority, as appropriate)' + '\n\n',
          fontSize: 10,
          italics: true,
          margin: [30, 10, 0, 0]
        })
        // end
        var endorseExtendContent = 'ENDORSEMENT TO EXTEND THE VALIDITY OF THE CERTIFICATE UNTIL REACHING THE PORT OF VERIFICATION WHERE PART B 13.12 OF THE ISM CODE APPLIES OR FOR A PERIOD OF GRACE WHERE PART B 13.14 OF THE ISM CODE APPLIES.';

        docDef.content.push({
          text: endorseExtendContent + '\n\n',
          fontSize: 10,
          bold: true,
          margin: [30, 0]
        });
        var extensionDate = (certificateData.extension[0] && certificateData.extension[0].extendedExpireDate) ? certificateData.extension[0].extendedExpireDate : '(Date)'
        var endorseExtendContent1 = 'This Certificate should, in accordance with part B 13.12 or part B 13.14 of the ISM Code, be accepted as valid until ';
        docDef.content.push({
          text: [
            { text: endorseExtendContent1 },
            { text: extensionDate.replace(/^0+/, '') + '.\n\n\n', italics: (extensionDate == '(Date)') ? true : false }
          ],
          fontSize: 10,
          margin: [30, 0]
        });
        // extension start

        if (certificateData.crossLineStatus == "extent-inactive" || certificateData.crossLineStatus == "inactive") {

          if (certificateData.currentCertiObj.certIssueId == 1002) {
            console.log("extent-inactive");
            certificateData.extension.length = 0;
          } else if (certificateData.currentCertiObj.seqNo < (certificateData.extension[0] && certificateData.extension[0].seqNo)) {
            console.log("t-inactive");
            certificateData.extension.length = 0;
            /*certificateData.certificateDetails.forEach(function (exten){
              if(certificateData.currentCertiObj.seqNo > )
            })*/
          }
        }
        var renewalsealContent1 = '';

        renewalsealContent1 = certificateData.extension[0] ? certificateData.extension[0].sealImage : _that.images['transparent'];

        docDef.content.push({
          alignment: 'justify',
          columns: [
            {
              width: 215,
              stack: [
                {
                  text: [
                    { text: "Endorsement to Extend:" },
                  ], fontSize: 10, margin: [30, 0, 0, 0]
                }, {
                  image: renewalsealContent1,
                  width: 70,
                  height: 70,
                  margin: [45, 10, 0, 0]
                }
              ]
            },
            {
              width: '*',
              table: {
                body: [
                  [
                    {
                      stack: [
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Signed:", fontSize: 10
                            }, {
                              image: (certificateData.extension[0] && certificateData.extension[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.extension[0].issuerSign : _that.images['transparent'],
                              width: 150,
                              height: 20,
                              margin: [45, -15, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        }, {
                          text: [
                            { text: (certificateData.extension[0] && certificateData.extension[0].nameToPrint === 1) ? certificateData.extension[0].issuerName + '\n' : '(Name)\n', italics: (certificateData.extension[0] && certificateData.extension[0].nameToPrint === 1 && certificateData.extension[0].issuerName) ? false : true },
                            { text: (certificateData.extension[0] && certificateData.extension[0].title) ? certificateData.extension[0].title : '(Appointment)', italics: (certificateData.extension[0] && certificateData.extension[0].title) ? false : true }
                          ],
                          fontSize: 10, margin: [20, 0, 0, 0],
                          alignment: 'center'
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Place:",
                              fontSize: 10,
                              margin: [0, 13, 0, 0]
                            }, {
                              text: (certificateData.extension[0] && certificateData.extension[0].auditPlace) ? certificateData.extension[0].auditPlace : '   ',
                              fontSize: 10,
                              margin: [5, 10, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Date:",
                              fontSize: 10,
                              margin: [0, 30, 0, 0]
                            }, {
                              text: (certificateData.extension[0] && certificateData.extension[0].issuerSignDate) ? certificateData.extension[0].issuerSignDate.replace(/^0+/, '') : '    ',
                              fontSize: 10,
                              margin: [5, 25, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                ]
              }, layout: 'noBorders'
            }
          ]
        })
        docDef.content.push({
          text: '(Seal or stamp of issuing authority, as appropriate)' + '\n\n',
          fontSize: 10,
          italics: true,
          margin: [30, 10, 0, 0]
        })
        //end

        docDef.content.push(voidStatus == true ? {//ism initial second page
          canvas: [{
            type: 'line',
            x1: 0,
            y1: -40,
            x2: 525,
            y2: -765,
            color: 'red',
            lineWidth: 2
          }
          ],
          absolutePosition: { x: 45, y: 800 }
        } : {})

      }
      pdfMake.createPdf(docDef, "", "", this.fonts).getBlob(data => {
        this.fileManager.checkPdfDirectory().then(() => {
          this.fileManager.writePdfInTheDirectory(
            data,
            "" + certificateData.certificateNo + ".pdf",
            "Certificate"
          ).then(() => {
            this.fileManager.openPdf("" + certificateData.certificateNo + ".pdf").then(() => {
              resolve({ data: "Success" });
            });
          }, err => {
            this.loader.hideLoader();
          });
        });
      });
      this.loader.hideLoader();
    })
  }

  public ismPdfService(certificateData) {
    return new Promise<Object>((resolve, reject) => {
      this.loader.showLoader("PreparingCertificate");
      console.log(certificateData);
      var tempcertificateHead,
        voidStatus,
        tempcertificatetype,
        audittype,
        auditsubtypeidCaps,
        auditsubtypeidsmall,
        headSubTitle,
        cmpnytype,
        nmecompny = "",
        shipType = "Type of Ship",
        Grt = "Gross Tonnage:",
        signaturetext =
          "Signature of the duly authorized official issuing the Certificate",
        subsequentCertificate = "No";
      var voluntaryCert = certificateData.voluntaryCert;
      let _that = this;
      if (
        certificateData.AuditStatusId == this.appConstant.VOID_AUDIT_STATUS ||
        certificateData.res.activeStatus === 0 ||
        certificateData.auditSummarId === 1005 ||
        certificateData.crossLineStatus === "extent-inactive"
      ) {
        voidStatus = true;
      }
      if (
        certificateData.auditSubTypeId == this.appConstant.INTERIM_SUB_TYPE_ID
      ) {
        auditsubtypeidCaps = "INTERIM";
        auditsubtypeidsmall = "Interim";
      } else {
        auditsubtypeidCaps = "";
        auditsubtypeidsmall = "";
      }

      tempcertificateHead =
        "" + auditsubtypeidsmall + " Safety Management Certificate";

      tempcertificatetype =
        "" + auditsubtypeidsmall + " Safety Management Certificate";

      tempcertificateHead = voluntaryCert
        ? auditsubtypeidsmall + " Voluntary Statement of Compliance"
        : tempcertificateHead;

      audittype = "ISM";


      var issuedDay = this.dateSuffix(
        Number(moment(certificateData.certIssueDate, 'YYYY-MM-DD').format('DD MMMM YYYY').split(" ")[0])
      );


      var issuedDay1 = issuedDay ? issuedDay : "(Day)";

      var issuedMonth = moment(certificateData.certIssueDate, 'YYYY-MM-DD').format('DD MMMM YYYY').split(" ")[1];

      var issuedMonth1 = issuedMonth ? issuedMonth : "(Month";

      var issuedYear = moment(certificateData.certIssueDate, 'YYYY-MM-DD').format('DD MMMM YYYY').split(" ")[2];

      var issuedYear1 = issuedYear ? issuedYear : "Year)";

      var place = certificateData.auditplace
        ? certificateData.auditplace
        : "(Location)";

      var certificateAuthority =
        "Issued by the authority of the Republic of the Marshall Islands Maritime Administrator at " +
        place +
        " this " +
        issuedDay1 +
        " day of " +
        issuedMonth1 +
        ", " +
        issuedYear1 +
        ".";

      var footerNote;

      if (
        certificateData.auditSubTypeId == this.appConstant.INTERIM_SUB_TYPE_ID
      ) {
        footerNote = voluntaryCert
          ? "MSC-297EV Rev. 10/19"
          : "MSC-297E Rev. 2/18";
      } else if (
        certificateData.auditSubTypeId ==
        this.appConstant.INITIAL_SUB_TYPE_ID ||
        certificateData.auditSubTypeId ==
        this.appConstant.RENEWAL_SUB_TYPE_ID ||
        certificateData.auditSubTypeId ==
        this.appConstant.INTERMEDIATE_SUB_TYPE_ID ||
        certificateData.auditSubTypeId ==
        this.appConstant.ADDITIONAL_SUB_TYPE_ID
      ) {
        footerNote = voluntaryCert
          ? "MSC-297FV Rev. 10/19"
          : "MSC-297F Rev. 2/18";
      }

      cmpnytype = "Company";

      nmecompny = "Name and Address of the " + cmpnytype + ":";
      var docDef: any = {};

      console.log(certificateData.auditSubTypeId);

      if (
        certificateData.auditSubTypeId == this.appConstant.INTERIM_SUB_TYPE_ID
      ) {

        console.log(certificateData);
        docDef = {
          ownerPassword: "123456",
          permissions: {
            printing: "highResolution",
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: false,
            documentAssembly: false
          },

          defaultStyle: {
            //font: "Times"
          },
          pageSize: "Letter",

          footer: {
            text: footerNote,
            //alignment : 'right',
            margin: [470, -15, 0, 70],
            fontSize: 9
          },

          content: [],
          // pageMargins: [5, 5, 5, 5],
          background: function (currentPage, pageSize) {
            return {
              image: _that.images['watermark'],
              width: 300,
              absolutePosition: {
                x: 150,
                y: 260
              },
              opacity: 0.7
            };
          },
          styles: {
            rightme: {
              alignment: "center",
              margin: [0, 10]
            },
            header: {
              fontSize: 16,
              bold: true
            }
          }
        };

        docDef.content.push({
          columns: [
            {
              image: "",
              width: 80,
              height: 80,
              margin: [10, 20, 0, 0]
            },
            {
              width: 350,
              margin: [10,17, 0, 0],
              text: [
                {
                  text: "Republic of the Marshall Islands\n",
                  fontSize: 23,
                  bold: true,
                  color: "#525252",
                  style: "rightme"
                },
                {
                  text: "Maritime Administrator\n",
                  fontSize: 14,
                  bold: true,
                  color: "#666666",
                  style: "rightme"
                },
                {
                  text: tempcertificateHead + "\n",
                  fontSize: 17,
                  bold: true,
                  color: "#666666",
                  style: "rightme"
                },
                {
                  text: "",
                  fontSize: 9,
                  color: "black",
                  alignment: "center"
                },
                {
                  text:
                    "Issued under the provisions of the International Convention for the \n Safety of Life at Sea, 1974 (SOLAS) as amended" +
                    "\n\n",
                  fontSize: 10,
                  color: "black",
                  alignment: "center"
                },
                {
                  text:
                    "Under the authority of the Government of the Republic of the Marshall Islands\n\n",
                  fontSize: 10,
                  color: "black",
                  alignment: "center"
                }
              ]
            },
            {
              columns: [
                [
                  {
                    text: "Certificate Number",
                    fontSize: 10,
                    margin: [8, 10, 0, 0]
                  },
                  {
                    table: {
                      widths: [80],
                      body: [[certificateData.certificateNo]]
                    },
                    margin: [5, 5, 0, 0],
                    fontSize: 8
                  },
                  {
                    qr: certificateData.qrCodeUrl,
                    fit: 100,
                    margin: [3, 10, 0, 0]
                    /*image:certificateData.QrC,
              width : 60,
              height : 60,
              margin : [ 12, 10,0,0 ]*/
                  }
                  /*{	qr : certificateData.qrCodeUrl,
              fit : '80',
              margin : [ -10, 10,0,-10 ]
              //margin : [ 15, 10 ]
            }*/
                ]
              ],
              width: "auto"
            }
          ]
        });

        docDef.content[0].columns[0].image = _that.images['logo'];
        docDef.content.push({
          text: "1",
          fontSize: 7,
          absolutePosition:
            certificateData.vesselName.length < 54
              ? { x: 59, y: 705 }
              : { x: 59, y: 718 }
        });

        docDef.content.push({
          text: "Particulars of the Ship:",
          bold: true,
          fontSize: 10,
          margin: [20, 10]
        });
        docDef.content.push([
          {
            margin: [20, 0, 0, 0],
            table: {
              widths: [155, 315],
              heights: [0, 0],
              body: [
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [{ text: "Name of Ship:", fontSize: 10, bold: false }]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.vesselName,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: "Distinctive Number or Letters:",
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.officialNo,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      { text: "Port of Registry:", fontSize: 10, bold: false }
                    ]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.portofreg,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [{ text: Grt, fontSize: 10, bold: false }]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      { text: certificateData.grt, fontSize: 10, bold: false }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [{ text: "IMO No.:", fontSize: 10, bold: false }]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.vesselImoNo,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      { text: "Type of Ship :", fontSize: 10, bold: false }
                    ]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.shiptype + "\n\n",
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ]
              ]
            },
            layout: "noBorders"
          }
        ]);

        docDef.content.push({
          text: nmecompny,
          bold: true,
          fontSize: 10,
          margin: [20, 0]
        });

        if (certificateData.AuditTypeId == this.appConstant.ISM_TYPE_ID) {
          docDef.content.push({
            text: "(see paragraph 1.1.2 of the ISM Code) \n\n",
            bold: false,
            fontSize: 10,
            margin: [20, 0]
          });
        }

        var companyname = "",
          companyaddress = "";
        if (
          certificateData.AuditTypeId == this.appConstant.ISM_TYPE_ID ||
          certificateData.AuditTypeId == this.appConstant.ISPS_TYPE_ID
        ) {
          companyname = "Company Name:";
        } else if (
          certificateData.AuditTypeId == this.appConstant.MLC_TYPE_ID
        ) {
          companyname = "Shipowner Name:";
        }

        if (
          certificateData.AuditTypeId == this.appConstant.ISM_TYPE_ID ||
          certificateData.AuditTypeId == this.appConstant.ISPS_TYPE_ID
        ) {
          companyaddress = "Company Address:";
        } else if (
          certificateData.AuditTypeId == this.appConstant.MLC_TYPE_ID
        ) {
          companyaddress = "Shipowner Address:";
        }

        docDef.content.push([
          {
            margin: [20, 0, 0, 0],
            table: {
              widths: [155, 300],
              heights: [25, 55],
              body: [
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [{ text: companyname, fontSize: 10, bold: false }]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.companyname,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [{ text: companyaddress, fontSize: 10, bold: false }]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.companyaddress,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ]
              ]
            },
            layout: "noBorders"
          }
        ]);

        docDef.content.push({
          columns: [
            {
              width: "*",
              text: [],
              fontSize: 10,
              margin: [10, 0]
            },
            {
              width: "*",
              text: [],
              fontSize: 10,
              margin: [-82, 0]
            }
          ],
          margin: [10, 0],
          fontSize: 11,
          color: "#141414"
        });

        if (
          certificateData.AuditTypeId == this.appConstant.ISM_TYPE_ID ||
          certificateData.AuditTypeId == this.appConstant.ISPS_TYPE_ID
        ) {
          docDef.content[7].columns[0].text.push(
            "Company Identification Number: \n\n"
          );

          docDef.content[7].columns[1].text.push(
            certificateData.companyimono + "\n\n"
          );
        }

        docDef.content.push({
          // to draw a horizontal line
          canvas: [
            {
              type: "line",
              x1: 15,
              y1: 5,
              x2: 520,
              y2: 5,
              lineWidth: 2
            }
          ]
        });
        console.log(certificateData);
        var certificateInterim = " ",
          certificateInitial = " ",
          certificateInitial1 = " ";

        if (certificateData.AuditTypeId == this.appConstant.ISM_TYPE_ID) {
          if (
            certificateData.auditSubTypeId ==
            this.appConstant.INTERIM_SUB_TYPE_ID
          ) {
            var interimismcontent =
              " the requirements of paragraph 14.4 of the International Management Code for the Safe Operation of Ships and for Pollution Prevention (ISM Code) have been met and that the ";

            var interimismvalidity =
              "This Interim Safety Management Certificate is valid until " +
              moment(certificateData.expirydate, 'YYYY-MM-DD').format('DD MMMM YYYY') +
              ", subject to the ";

            docDef.content.push({
              text: [
                { text: "\nTHIS IS TO CERTIFY THAT", bold: true },
                { text: interimismcontent },
                { text: "Document of Compliance ", italics: true },
                { text: "of the Company is relevant to this ship." + "\n\n" },
                { text: interimismvalidity },
                { text: "Document of Compliance ", italics: true },
                { text: "remaining valid." + "\n\n\n\n\n" }
              ],
              margin: [20, 0],
              fontSize: 10,
              alignment: "justify"
            });
          } else {
            certificateInitial =
              "THIS IS TO CERTIFY THAT the safety management system of the ship has been audited and that it complies with the requirements of the International Management Code for the Safe Operation of Ships and for Pollution Prevention (ISM Code), following verification that the Document of Compliance for the Company is applicable to this type of ship.";

            certificateInitial1 =
              "The Safety Management Certificate is valid until: " +
              certificateData.expirydate +
              " subject to periodical verification and the Document of Compliance remaining valid.";
          }
        }

        docDef.content.push({
          columns: [
            {
              width: 100,
              text: "",
              fontSize: 10
            },
            {
              width: "*",
              text: "",
              fontSize: 10,
              margin: [62, -20, 0, 0]
            }
          ]
        });
        console.log("DOce", docDef.content);
        docDef.content.push({
          columns: [
            {
              image: "",
              width: 80,
              height: 80,
              margin: [60, 0, 0, 0]
            },
            {
              width: "*",
              text: [],
              fontSize: 10
            },
            {
              columns: [
                [
                  {
                    text: ["\n\n\n"]
                  },
                  {
                    image: "",
                    width: 150,
                    height: 20,
                    margin: [-130, 15, 0, 0]
                  }
                ]
              ],
              width: 80,
              height: 20
            }
          ]
        });
        docDef.content[10].columns[1].text = certificateAuthority;

        docDef.content[11].columns[0].image = certificateData.currInitialPage[0]
          ? certificateData.currInitialPage[0].sealImage
          : _that.images["transparent"];
        docDef.content[11].columns[2].columns[0][1].image =
          certificateData.currInitialPage[0] &&
            certificateData.currInitialPage[0].signToPrint == 1
            ? "data:image/png;base64," +
            certificateData.currInitialPage[0].issuerSign
            : _that.images["transparent"];

        docDef.content.push({
          columns: [
            {
              width: "*",
              text: certificateData.sealcontent + "\n",
              fontSize: 10,
              margin: [20, 0, 0, 0]
            },
            {
              canvas: [
                {
                  type: "line",
                  x1: 0,
                  y1: 10,
                  x2: 250,
                  y2: 10,
                  lineWidth: 1
                }
              ]
            }
          ]
        });

        docDef.content.push({
          columns: [
            {
              width: "*",
              text: [
                "\n",
                {
                  text: "Unique Tracking Number: ",
                  fontSize: 10
                },
                {
                  text: certificateData.utn,
                  bold: true,
                  fontSize: 10
                }
              ],
              margin: [20, 0, 0, 0]
            },
            {
              width: "*",
              text: [
                {
                  text: "",
                  alignment: "center",
                  fontSize: 10,
                  italics: false
                },
                {
                  text: "",
                  alignment: "center",
                  fontSize: 10,
                  italics: false
                }
              ]
            }
          ]
        });

        docDef.content[13].columns[1].text[0].text = certificateData
          .currInitialPage[0]
          ? certificateData.currInitialPage[0].nameFull
          : "(Name) \n";
        docDef.content[13].columns[1].text[0].italics = certificateData
          .currInitialPage[0]
          ? certificateData.currInitialPage[0].nameItalics
          : true;
        docDef.content[13].columns[1].text[1].text = certificateData
          .currInitialPage[0]
          ? certificateData.currInitialPage[0].title
          : "(Appointment)";
        docDef.content[13].columns[1].text[1].italics = certificateData
          .currInitialPage[0]
          ? false
          : true;

        docDef.content.push({
          canvas: [
            {
              type: "line",
              x1: 20,
              y1: 5,
              x2: 200,
              y2: 5,
              lineWidth: 1
            }
          ]
        });
        /* docDef.content.push({
          stack: [
            {
              text:
                "\nInsert the type of ship from among the following: passenger ship; passenger high-speed craft; cargo high-speed craft; bulk carrier; oil tanker; chemical \n",
              fontSize: 8,
              margin: [25, 0, 10, 0]
            },
            {
              text:
                "tanker; gas carrier; mobile offshore drilling unit; other cargo ship.\n",
              fontSize: 8,
              margin: [20, 0, 10, 0]
            }
          ]
        }); */
        /* docDef.content.push({
          text: "1",
          fontSize: 7,
          absolutePosition:
            certificateData.vesselName.length < 54
              ? { x: 111, y: 273 }
              : { x: 111, y: 284 }
        }); */
        //added by lokesh for jira_id(707)
        docDef.content.push({
          stack: [
            {
              text:
                "\nInsert the type of ship from among the following: passenger ship; passenger high-speed craft; cargo high-speed craft; bulk carrier; oil tanker;",
              fontSize: 8,
              margin: [25, 0, 10, 0]
            },
            {
              text:
                " chemical tanker; gas carrier; mobile offshore drilling unit; other cargo ship.\n\n",
              fontSize: 8,
              margin: [20, 0, 10, 0]
            },
            { text: '1', absolutePosition: (certificateData.vesselName.length < 54) ? { x: 114, y: 277 } : { x: 125, y: 277 }, fontSize: 8 },
            
            {
              canvas: [
                {
                  type: "rect",
                  x: 5,
                  y: certificateData.vesselName.length < 54 ? 28 : 18,
                  w: 525,
                  h: -720,
                  fillOpacity: 0.5,
                  lineWidth: 2
                }
              ]
            },
            {
              canvas: [
                {
                  type: "rect",
                  x: 0,
                  y: certificateData.vesselName.length < 54 ? 33 : 23,
                  w: 535,
                  h: -730,
                  fillOpacity: 0.5
                }
              ]
            },
            voidStatus == true
              ? {
                //ism initial second page
                canvas: [
                  {
                    type: "line",
                    x1: 0,
                    y1: -40,
                    x2: 525,
                    y2: -765,
                    color: "red",
                    lineWidth: 2
                  }
                ],
                absolutePosition: { x: 45, y: 798 }
              }
              : {}
          ]
        });
        console.log(docDef.content);

        var ismExtendauditPlace = certificateData.extension[0]
          ? certificateData.extension[0].auditPlace
          : "";

        var ismExtendDay = certificateData.extension[0]
          ? certificateData.extension[0].extendedIssueDate.split(" ")[0]
          : "";

        var ismExtendMnth = certificateData.extension[0]
          ? certificateData.extension[0].extendedIssueDate.split(" ")[1]
          : "";

        var ismExtendYear = certificateData.extension[0]
          ? certificateData.extension[0].extendedIssueDate.split(" ")[2]
          : "";

        var IsmExtendMnthYear = "";

        if (ismExtendMnth != "") {
          IsmExtendMnthYear = ismExtendMnth + ", " + ismExtendYear;
        }

        certificateAuthority =
          "Issued by the authority of the Republic of the Marshall Islands Maritime Administrator \nat " +
          ismExtendauditPlace +
          " this " +
          ismExtendDay +
          " day of " +
          IsmExtendMnthYear +
          ".";

        if (certificateData.AuditTypeId == this.appConstant.ISM_TYPE_ID) {
          if (
            certificateData.auditSubTypeId ==
            this.appConstant.INTERIM_SUB_TYPE_ID
          ) {
            var ismExtendExpiryDate = certificateData.extension[0]
              ? certificateData.extension[0].extendedExpireDate
              : "(Date)";

            docDef.content.push({
              stack: [
                {
                  columns: [
                    [
                      {
                        text: "Certificate Number",
                        fontSize: 10,
                        margin: [435, 0, 0, 0]
                      },
                      {
                        table: {
                          widths: [80],
                          body: [
                            [
                              voluntaryCert
                                ? certificateData.certificateNo.replace(
                                  "E",
                                  "EV"
                                )
                                : certificateData.certificateNo
                            ]
                          ]
                        },
                        margin: [427, 2, 0, 0],
                        fontSize: 8
                      }
                    ]
                  ],
                  pageBreak: "before"
                  //alignment:'right'
                },
                {
                  text: [
                    {
                      text:
                        "\n\n\nThe Validity of this Interim Safety Management Certificate is extended to ",
                      fontSize: 10
                    },
                    {
                      text: ismExtendExpiryDate.replace(/^0+/, "") + ".",
                      italics: ismExtendExpiryDate == "(Date)" ? true : false,
                      fontSize: 10
                    }
                  ],
                  margin: [25, 0, 0, 0]
                }
              ]
            });
            var ismExtendauditPlace = certificateData.extension[0]
              ? certificateData.extension[0].auditPlace
              : "(Location)";

            var ismExtendDay = certificateData.extension[0]
              ? certificateData.extension[0].extendedIssueDate.split(" ")[0]
              : "(Day)";

            var ismExtendMnth = certificateData.extension[0]
              ? certificateData.extension[0].extendedIssueDate.split(" ")[1]
              : "";

            var ismExtendYear = certificateData.extension[0]
              ? certificateData.extension[0].extendedIssueDate.split(" ")[2]
              : "";
            docDef.content.push({
              columns: [
                {
                  width: 100,
                  text: ""
                },
                {
                  width: "*",
                  text: [
                    {
                      text:
                        "\n\n\n\n\nIssued by the authority of the Republic of the Marshall Islands Maritime Administrator at "
                    },
                    {
                      text: certificateData.extension[0]
                        ? ismExtendauditPlace
                        : "(Location)",
                      italics:
                        ismExtendauditPlace == "(Location)" ? true : false
                    },
                    { text: " this " },
                    {
                      text: certificateData.extension[0]
                        ? this.ordinal_suffix_of(
                          ismExtendDay.replace(/^0+/, "")
                        )
                        : "(Day)",
                      italics: ismExtendDay == "(Day)" ? true : false
                    },
                    { text: " day of " },
                    {
                      text: certificateData.extension[0]
                        ? IsmExtendMnthYear + "."
                        : "(Month, Year).",
                      italics: certificateData.extension[0] ? false : true
                    }
                  ],
                  fontSize: 10,
                  margin: [60, 0, 0, 0]
                }
              ]
            });

            var extTitle = "";
            extTitle = certificateData.extension[0]
              ? certificateData.extension[0].sealImage
              : _that.images["transparent"];

            docDef.content.push({
              columns: [
                {
                  image: extTitle,
                  width: 80,
                  height: 80,
                  margin: [60, 0, 0, 0]
                },
                {
                  width: "*",
                  text: []
                },
                {
                  columns: [
                    [
                      {
                        text: ["\n\n\n"]
                      },
                      {
                        image: "",
                        width: 150,
                        height: 20,
                        margin: [0, 0, 60, 0]
                      }
                    ]
                  ],
                  width: "auto"
                }
              ]
            });



            docDef.content[18].columns[2].columns[0][1].image = certificateData.extension[0] && certificateData.extension[0].signToPrint == 1 ? "data:image/png;base64,"
              + certificateData.extension[0].issuerSign : _that.images['transparent'];

            docDef.content.push({
              columns: [
                {
                  width: "*",
                  text: certificateData.sealcontent + "\n",
                  fontSize: 10,
                  margin: [20, 0, 0, 0]
                },
                {
                  canvas: [
                    {
                      type: "line",
                      x1: 0,
                      y1: 0,
                      x2: 250,
                      y2: 0,
                      lineWidth: 1
                    }
                  ]
                }
              ]
            });

            docDef.content.push({
              columns: [
                {
                  width: '*',
                  text: ['']
                },
                {
                  width: '*',
                  text: [
                    {
                      text: '',
                      alignment: "center",
                      fontSize: 10,
                      italics: false
                    },
                    {
                      text: '',
                      alignment: "center",
                      fontSize: 10,
                      italics: false
                    }
                  ],
                  margin: [0, -10, 0, 0]
                }
              ]
            });

            docDef.content[20].columns[1].text[0].text = certificateData
              .extension[0]
              ? certificateData.extension[0].nameFull
              : "(Name) \n";
            docDef.content[20].columns[1].text[0].italics = certificateData
              .extension[0]
              ? certificateData.extension[0].nameItalics
              : true;
            docDef.content[20].columns[1].text[1].text = certificateData
              .extension[0]
              ? certificateData.extension[0].title
              : "(Appointment)";
            docDef.content[20].columns[1].text[1].italics = certificateData
              .extension[0]
              ? false
              : true;
          }
        }
        docDef.content.push(
          //ism second page border
          {
            stack: [
              {
                canvas: [
                  {
                    type: "rect",
                    x: 5,
                    y: 456,
                    w: 525,
                    h: -720,
                    fillOpacity: 0.5,
                    lineWidth: 2
                  }
                ]
              },
              {
                canvas: [
                  {
                    type: "rect",
                    x: 0,
                    y: 460,
                    w: 535,
                    h: -730,
                    fillOpacity: 0.5
                  }
                ]
              },
              voidStatus == true
                ? {
                  //ism initial second page
                  canvas: [
                    {
                      type: "line",
                      x1: 0,
                      y1: -40,
                      x2: 525,
                      y2: -765,
                      color: "red",
                      lineWidth: 2
                    }
                  ],
                  absolutePosition: { x: 45, y: 798 }
                }
                : {}
            ]
          }
        );





      } else if (
        certificateData.auditSubTypeId ==
        this.appConstant.INITIAL_SUB_TYPE_ID ||
        certificateData.auditSubTypeId == this.appConstant.RENEWAL_SUB_TYPE_ID
      ) {

        console.log(certificateData);
        var intermediateCross = false; //(certificateData.additional[0] && certificateData.additional[0].withoutCross)?certificateData.additional[0].withoutCross:'';
        var additionalCross1 = false;
        var additionalCross2 = false;
        var additionalCross3 = false;
        var withoutcross = true;

        intermediateCross = certificateData.intermediateReissue[0]
          ? certificateData.intermediateReissue[0].interReissue
          : false;
        additionalCross1 = certificateData.additionalReissue1[0]
          ? certificateData.additionalReissue1[0].addReissue
          : false;
        additionalCross2 = certificateData.additionalReissue2[0]
          ? certificateData.additionalReissue2[0].addReissue
          : false;
        additionalCross3 = certificateData.additionalReissue3[0]
          ? certificateData.additionalReissue3[0].addReissue
          : false;

        docDef = {
          ownerPassword: "123456",
          permissions: {
            printing: "highResolution",
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: false,
            documentAssembly: false
          },

          defaultStyle: {
            //font: "Times"
          },
          pageSize: "Letter",

          footer: {
            text: footerNote,
            alignment: "right",
            margin: [60, -20, 60, 0],
            fontSize: 9
          },

          content: [],
          // pageMargins: [5, 5, 5, 5],
          background: function (currentPage, pageSize) {
            return {
              image: _that.images["watermark"],
              width: 300,
              absolutePosition: {
                x: 150,
                y: 260
              },
              opacity: 0.7
            };
          },
          styles: {
            rightme: {
              alignment: "center"
              //margin : [ 0, 10 ]
            },
            header: {
              fontSize: 16,
              bold: true
            }
          }
        };

        docDef.content.push({
          columns: [
            {
              image: "",
              width: 80,
              height: 80,
              margin: [10, 15, 0, 0]
            },
            {
              width: 350,
              margin: [0, 10, 0, 0],
              text: [
                {
                  text: "Republic of the Marshall Islands\n",
                  fontSize: 23,
                  bold: true,
                  color: "#525252"
                },
                {
                  text: "Maritime Administrator\n",
                  fontSize: 14,
                  bold: true,
                  color: "#666666"
                },
                {
                  text: tempcertificateHead,
                  fontSize: 17,
                  bold: true,
                  color: "#666666"
                },
                {
                  text:
                    "\nIssued under the provisions of the International Convention for the " +
                    "\n",
                  fontSize: 10,
                  color: "black",
                  alignment: "center"
                },
                {
                  text:
                    "Safety of Life at Sea, 1974 (SOLAS), as amended" + "\n\n",
                  fontSize: 10,
                  color: "black",
                  alignment: "center"
                },
                {
                  text:
                    "Under the authority of the Government of the Republic of the Marshall Islands\n\n",
                  fontSize: 10,
                  color: "black",
                  alignment: "center"
                }
              ],
              style: "rightme"
            },
            {
              columns: [
                [
                  {
                    text: "Certificate Number",
                    fontSize: 10,
                    margin: [3, 4, 0, 0]
                  },
                  {
                    table: {
                      widths: [80],
                      body: [
                        [
                          voluntaryCert
                            ? certificateData.certificateNo.replace("F", "FV")
                            : certificateData.certificateNo
                        ]
                      ]
                    },
                    margin: [-3, 2, 0, 0],
                    fontSize: 8
                  },
                  {
                    qr: certificateData.qrCodeUrl,
                    fit: 90,
                    margin: [1, 10, 0, 0]
                    /*image:certificateData.QrC,
                width : 60,
                height : 60,
                margin : [ 12, 10,0,0 ]*/
                  }
                ]
              ],
              width: "auto"
            }
          ]
        });

        docDef.content[0].columns[0].image = _that.images['logo'];

        docDef.content.push({
          text: [],
          margin: [0, -40, 0, 0]
        });

        docDef.content.push({
          text: "Particulars of the Ship:",
          bold: true,
          fontSize: 10,
          margin: [20, 50, 0, 10]
        });

        docDef.content.push([
          {
            margin: [20, 0, 0, 0],
            table: {
              widths: [155, 315],
              heights: [0, 0],
              body: [
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [{ text: "Name of Ship:", fontSize: 10, bold: false }]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.vesselName,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: "Distinctive Number or Letters:",
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.officialNo,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      { text: "Port of Registry:", fontSize: 10, bold: false }
                    ]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.portofreg,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [{ text: Grt, fontSize: 10, bold: false }]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      { text: certificateData.grt, fontSize: 10, bold: false }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [{ text: "IMO No.:", fontSize: 10, bold: false }]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.vesselImoNo,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      { text: "Type of Ship :", fontSize: 10, bold: false }
                    ]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.shiptype + "\n\n",
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ]
              ]
            },
            layout: "noBorders"
          }
        ]);
        /* var num = {
           text: "1",
           fontSize: 5,
           italics: true
         };*/

        docDef.content.push({
          text: nmecompny,
          bold: true,
          fontSize: 10,
          margin: [20, 0]
        });

        docDef.content.push({
          text: "(see paragraph 1.1.2 of the ISM Code) \n\n",
          bold: false,
          fontSize: 10,
          margin: [20, 0]
        });

        var companyname = "",
          companyaddress = "";
        if (
          certificateData.AuditTypeId == this.appConstant.ISM_TYPE_ID ||
          certificateData.AuditTypeId == this.appConstant.ISPS_TYPE_ID
        ) {
          companyname = "Company Name:";
        } else if (
          certificateData.AuditTypeId == this.appConstant.MLC_TYPE_ID
        ) {
          companyname = "Shipowner Name:";
        }

        if (
          certificateData.AuditTypeId == this.appConstant.ISM_TYPE_ID ||
          certificateData.AuditTypeId == this.appConstant.ISPS_TYPE_ID
        ) {
          companyaddress = "Company Address:";
        } else if (
          certificateData.AuditTypeId == this.appConstant.MLC_TYPE_ID
        ) {
          companyaddress = "Shipowner Address:";
        }

        docDef.content.push([
          {
            margin: [20, 0, 0, 0],
            table: {
              widths: [155, 300],
              heights: [25, 45],
              body: [
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [{ text: companyname, fontSize: 10, bold: false }]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.companyname,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ],
                [
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [{ text: companyaddress, fontSize: 10, bold: false }]
                  },
                  {
                    border: [true, true, true, true],
                    fillColor: "",
                    /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                    text: [
                      {
                        text: certificateData.companyaddress,
                        fontSize: 10,
                        bold: false
                      }
                    ]
                  }
                ]
              ]
            },
            layout: "noBorders"
          }
        ]);

        docDef.content.push({
          columns: [
            {
              width: "*",
              text: [],
              margin: [10, 0]
            },
            {
              width: "*",
              text: [],
              margin: [-83, 0, 0, 0]
            }
          ],
          margin: [10, 0],
          fontSize: 10,
          color: "#141414"
        });

        if (certificateData.companyaddress.length > 60) {
          docDef.content[7].columns[0].text.push(
            "Company Identification Number: \n\n"
          );

          docDef.content[7].columns[1].text.push(
            (certificateData.companyimono = certificateData.companyimono
              ? certificateData.companyimono
              : "" + "\n\n")
          );
        } else {
          docDef.content[7].columns[0].text.push(
            "Company Identification Number: \n\n"
          );

          docDef.content[7].columns[1].text.push(
            (certificateData.companyimono = certificateData.companyimono
              ? certificateData.companyimono
              : "" + "\n\n")
          );
        }

        docDef.content.push({
          // to draw a horizontal line
          canvas: [
            {
              type: "line",
              x1: 15,
              y1: 5,
              x2: 520,
              y2: 5,
              lineWidth: 2
            }
          ]
        });
        var certificateInitial =
          " the safety management system of the ship has been audited and that it complies" +
          " with the requirements of the International Management Code for the Safe Operation of Ships and for Pollution" +
          " Prevention (ISM Code), following verification that the Document of Compliance for the Company is" +
          " applicable to this type of ship.";

        var expirydate = certificateData.expirydate
          ? moment(certificateData.expirydate, 'YYYY-MM-DD').format('DD MMMM YYYY')
          : "(Date)";

        var certificateInitial1 =
          "This Safety Management Certificate is valid until " +
          expirydate +
          ", subject to periodical verification and that the Document of Compliance remains valid.";
        docDef.content.push({
          text: [
            { text: "\nTHIS IS TO CERTIFY THAT", bold: true },
            { text: certificateInitial + "\n\n" + certificateInitial1 + "\n\n" }
          ],
          width: 10,
          margin: [20, 0],
          fontSize: 10,
          alignment: "justify"
        });
        var auditDate = certificateData.certIssueDate
          ? certificateData.auditDate
          : "dd/mm/yy";

        var issueDate = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].completionDate != "" ? certificateData.certificateDetails[0].completionDate : certificateData.certificateDetails[0].certIssueDate : certificateData.certificateDetails[0].certIssueDate;
        var finalIssuedDate = '(Date)';
        console.log(issueDate)
        if (issueDate != 'N.A') {
          if (moment(issueDate, 'YYYY-MM-DD', true).isValid())
            finalIssuedDate = moment(issueDate, 'YYYY-MM-DD').format('DD MMMM YYYY');
          else if (moment(issueDate, 'DD-MMM-YYYY', true).isValid())
            finalIssuedDate = moment(issueDate, 'DD-MMM-YYYY').format('DD MMMM YYYY');//date formate is changed by lokesh for jira_id)(900)
          else
            finalIssuedDate = issueDate;

        }
        else {
          finalIssuedDate = '(Date)';
        }

        var certificateInitial2 =
          "Completion date of the verification on which this Certificate is based: " +
          finalIssuedDate +
          ".";

        docDef.content.push({
          text: certificateInitial2 + "\n\n\n",
          fontSize: 10,
          margin: [20, 0]
        });

        docDef.content.push({
          stack: [
            {
              text: certificateAuthority + "\n\n",
              fontSize: 10,
              margin: [130, -10, 0, 0]
            },
            /*{
              text: "1",
              fontSize: 7,
              absolutePosition:
                certificateData.vesselName.length < 54
                  ? { x: 59, y: 690 }
                  : { x: 59, y: 700 }
            }*/
          ]
        });

        docDef.content.push({
          columns: [
            {
              image: _that.images["transparent"],
              width: 80,
              height: 80,
              margin: [40, -20, 0, 0]
            },
            {
              width: "*",
              text: []
            },
            {
              columns: [
                [
                  {
                    text: ["\n\n\n"]
                  },
                  {
                    image: _that.images["transparent"],
                    width: 160,
                    height: 30,
                    margin: [20, -20, 0, 0]
                  }
                ]
              ]
              //width : 'auto'
            }
          ]
        });
        //initial section
        docDef.content[12].columns[0].image = certificateData.currInitialPage[0]
          ? certificateData.currInitialPage[0].sealImage
          : _that.images["transparent"];
        docDef.content[12].columns[2].columns[0][1].image =!(certificateData.auditSubTypeId == this.appConstant.INITIAL_SUB_TYPE_ID)?
          certificateData.currInitialPage[0] &&
            certificateData.currInitialPage[0].signToPrint == 1
            ? "data:image/png;base64," +
            certificateData.currInitialPage[0].issuerSign
            : _that.images["transparent"]:
           ( certificateData.intermediate[0] &&certificateData.currInitialPage[0])?       (certificateData.intermediate[0] && certificateData.intermediate[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.intermediate[0].issuerSign : _that.images['transparent'] :
           certificateData.currInitialPage[0] &&
            certificateData.currInitialPage[0].signToPrint == 1
            ? "data:image/png;base64," +
            certificateData.currInitialPage[0].issuerSign
            : _that.images["transparent"]//condision changed by lokesh for jira_id(781,887)

        docDef.content.push({
          columns: [
            {
              width: "*",
              text: certificateData.sealcontent + "\n",
              fontSize: 10,
              margin: [20, 0, 0, 0]
            },
            {
              canvas: [
                {
                  type: "line",
                  x1: 0,
                  y1: 0,
                  x2: 250,
                  y2: 0,
                  lineWidth: 1
                }
              ]
            }
          ]
        });

        docDef.content.push({
          columns: [
            {
              width: "*",
              text: [
                "\n",
                {
                  text: "Unique Tracking Number: ",
                  fontSize: 10
                },
                {
                  text: certificateData.utn,
                  bold: true,
                  fontSize: 10
                }
              ],
              margin: [20, 0, 0, 0]
            },
            {
              width: "*",
              text: [
                {
                  text: "",
                  alignment: "center",
                  fontSize: 10,
                  italics: false
                },
                {
                  text: "",
                  alignment: "center",
                  fontSize: 10,
                  italics: false
                }
              ],
              margin: [0, -10, 0, 0]
            }
          ]
        });
        //initial section name and title
        //condision changed by lokesh for jira_id(781,887) 
        docDef.content[14].columns[1].text[0].text =!(certificateData.auditSubTypeId == this.appConstant.INITIAL_SUB_TYPE_ID)?
       (  certificateData.currInitialPage[0]&&certificateData.currInitialPage[0].nameToPrint===1)
          ? certificateData.currInitialPage[0].nameFull
          : "(Name) \n":(certificateData.intermediate[0]&&certificateData.currInitialPage[0])? (certificateData.intermediate[0] && certificateData.intermediate[0].nameToPrint === 1) ? certificateData.intermediate[0].issuerName + '\n' : '(Name)\n':
          (  certificateData.currInitialPage[0]&&certificateData.currInitialPage[0].nameToPrint===1)
          ? certificateData.currInitialPage[0].nameFull
          : "(Name) \n"
        docDef.content[14].columns[1].text[0].italics = certificateData
          .currInitialPage[0]
          ? certificateData.currInitialPage[0].nameItalics
          : true;
        docDef.content[14].columns[1].text[1].text = certificateData
          .currInitialPage[0]
          ? certificateData.currInitialPage[0].title
          : "(Appointment)";
        docDef.content[14].columns[1].text[1].italics = certificateData
          .currInitialPage[0]
          ? false
          : true;

        docDef.content.push({
          canvas: [
            {
              type: "line",
              x1: 20,
              y1: 5,
              x2: 197,
              y2: 5,
              lineWidth: 1
            }
          ]
        });

        /*  var isminitialDesc1 =
          "\n Insert the type of ship from among the following: passenger ship; passenger high-speed craft; cargo high-speed craft; bulk ";
        var isminitialDesc2 =
          "carrier; oil tanker;chemical tanker; gas carrier; mobile offshore drilling unit; other cargo ship.";
        var isminitialDesc1 = isminitialDesc1 + isminitialDesc2;
        docDef.content.push({
          text: "1",
          fontSize: 7,
          absolutePosition:
            certificateData.vesselName.length < 54
              ? { x: 111, y: 273 }
              : { x: 111, y: 283 }
        }); */
        docDef.content.push(
          {
            // stack: [
              /*   {
                text:
                  "\nInsert the type of ship from among the following: passenger ship; passenger high-speed craft; cargo high-speed craft; bulk carrier; oil tanker; chemical ",
                fontSize: 8,
                margin: [25, 0, 10, 0]
              },
              {
                text:
                  "tanker; gas carrier; mobile offshore drilling unit; other cargo ship. \n",
                fontSize: 8,
                margin: [20, 0, 10, 0]
              }, */
            //   { text: "\n\n" }
            // ]
            //added by Ramya on 18-10-2022 for jira id - Mobile-707
					stack:[
						      {text:"\nInsert the type of ship from among the following: passenger ship; passenger high-speed craft; cargo high-speed craft; bulk carrier; oil tanker; chemical ",fontSize : 7.5,margin:[25,0,10,0]},
						      {text:"tanker; gas carrier; mobile offshore drilling unit; other cargo ship. \n",fontSize : 7.5,margin:[20,0,10,0]},
						      { text: '1', absolutePosition: (certificateData.vesselName.length < 54) ? { x: 114, y: 270 } : { x: 125, y: 277 }, fontSize: 8 },
                  { text: '1', margin: [20, -20, 0, 0], fontSize: 7 },
                  {text: '\n\n'}
						      ]
				},
          {
            stack: [
              {
                canvas: [
                  {
                    type: "rect",
                    x: 5,
                    y: certificateData.vesselName.length < 54 ? 20 : 20,
                    w: 525,
                    h: -725,
                    fillOpacity: 0.5,
                    lineWidth: 2
                  }
                ]
              },
              {
                canvas: [
                  {
                    type: "rect",
                    x: 0,
                    y: certificateData.vesselName.length < 54 ? 25 : 25,
                    w: 535,
                    h: -735,
                    fillOpacity: 0.5
                  }
                ]
              },
              voidStatus == true
                ? {
                  //ism initial second page
                  canvas: [
                    {
                      type: "line",
                      x1: 0,
                      y1: -40,
                      x2: 525,
                      y2: -765,
                      color: "red",
                      lineWidth: 2
                    }
                  ],
                  absolutePosition: { x: 45, y: 798 }
                }
                : {}
            ]
          }
        );

        var ismendorse =
          "ENDORSEMENT FOR INTERMEDIATE VERIFICATION AND ADDITIONAL VERIFICATION";
        var ismendorse1 = "(IF REQUIRED)";
        docDef.content.push(
          {
            columns: [
              {
                columns: [
                  [
                    {
                      text: "Certificate Number",
                      fontSize: 10,
                      pageBreak: "before",
                      margin: [435, 0, 0, 0]
                    },
                    {
                      table: {
                        widths: [80],
                        body: [
                          [
                            voluntaryCert
                              ? certificateData.certificateNo.replace("F", "FV")
                              : certificateData.certificateNo
                          ]
                        ]
                      },
                      margin: [427, 2, 0, 0],
                      fontSize: 8
                    }
                  ]
                ],
                width: "auto"
              }
            ]
          },
          {
            stack: [
              {
                canvas: [
                  {
                    type: "rect",
                    x: 5,
                    y: 693,
                    w: 525,
                    h: -727,
                    fillOpacity: 0.5,
                    lineWidth: 2
                  }
                ]
              },
              {
                canvas: [
                  {
                    type: "rect",
                    x: 0,
                    y: 698,
                    w: 535,
                    h: -737,
                    fillOpacity: 0.5
                  }
                ]
              }
            ]
          }
        );
        docDef.content.push({
          text: ismendorse + "\n",
          fontSize: 10,
          bold: true,
          alignment: "center",
          margin: [0, 10, 0, 0]
        });
        docDef.content.push({
          text: ismendorse1 + "\n\n",
          fontSize: 10,
          bold: true,
          alignment: "center",
          margin: [30, 0, 0, 0]
        });

        var endorseContent =
          "THIS IS TO CERTIFY that, at the periodical verification in accordance with regulation IX/6.1 of SOLAS and paragraph \n13.8 of the ISM Code, the Safety Management System was found to comply with the requirements of the ISM Code.";

        docDef.content.push({
          text: endorseContent + "\n\n\n",
          fontSize: 9,
          margin: [30, 0, 20, 0]
        });

        // ISM Intermediate Starts here...

        var IntermediatesealContent = "";

        IntermediatesealContent = certificateData.intermediate[0]
          ? certificateData.intermediate[0].sealImage
          : _that.images["transparent"];

        docDef.content.push({
          alignment: "justify",
          columns: [
            {
              width: 215,
              stack: [
                {
                  text: [
                    { text: "Intermediate Verification:\n" },
                    {
                      text:
                        "(to be completed between the" +
                        "\n" +
                        " second and third anniversary date)",
                      italics: true
                    }
                  ],
                  fontSize: 10,
                  margin: [30, 0, 0, 0]
                },
                {
                  image: IntermediatesealContent,
                  width: 70,
                  height: 70,
                  margin: [45, 10, 0, 0]
                }
              ]
            },
            {
              width: "*",
              table: {
                body: [
                  [
                    {
                      stack: [
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Signed:",
                              fontSize: 10
                            },
                            {
                              image:
                                certificateData.intermediate[0] &&
                                  certificateData.intermediate[0].signToPrint ===
                                  1
                                  ? "data:image/jpeg;base64," +
                                  certificateData.intermediate[0].issuerSign
                                  : _that.images["transparent"],
                              width: 150,
                              height: 20,
                              margin: [45, -15, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {},
                            {
                              canvas: [
                                {
                                  type: "line",
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }
                              ],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        },
                        {
                          text: [
                            {
                              text:
                                certificateData.intermediate[0] &&
                                  certificateData.intermediate[0].nameToPrint ===
                                  1
                                  ? certificateData.intermediate[0].issuerName +
                                  "\n"
                                  : "(Name)\n",
                              italics:
                                certificateData.intermediate[0] &&
                                  certificateData.intermediate[0].nameToPrint ===
                                  1 &&
                                  certificateData.intermediate[0].issuerName
                                  ? false
                                  : true
                            },
                            {
                              text:
                                certificateData.intermediate[0] &&
                                  certificateData.intermediate[0].title
                                  ? certificateData.intermediate[0].title
                                  : "(Appointment)",
                              italics:
                                certificateData.intermediate[0] &&
                                  certificateData.intermediate[0].title
                                  ? false
                                  : true
                            }
                          ],
                          fontSize: 10,
                          margin: [20, 0, 0, 0],
                          alignment: "center"
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Place:",
                              fontSize: 10,
                              margin: [0, 13, 0, 0]
                            },
                            {
                              text:
                                certificateData.intermediate[0] &&
                                  certificateData.intermediate[0].auditPlace
                                  ? certificateData.intermediate[0].auditPlace
                                  : "   ",
                              fontSize: 10,
                              margin: [5, 10, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {},
                            {
                              canvas: [
                                {
                                  type: "line",
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }
                              ],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Date:",
                              fontSize: 10,
                              margin: [0, 30, 0, 0]
                            },
                            {
                              text:
                                certificateData.intermediate[0] &&
                                  certificateData.intermediate[0].issuerSignDate
                                  ? certificateData.intermediate[0].issuerSignDate.replace(
                                    /^0+/,
                                    ""
                                  )
                                  : "    ",
                              fontSize: 10,
                              margin: [5, 25, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {},
                            {
                              canvas: [
                                {
                                  type: "line",
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }
                              ],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                ]
              },
              layout: "noBorders"
            }
          ]
        });
        docDef.content.push({
          text: "(Seal or stamp of issuing authority, as appropriate)" + "\n\n",
          fontSize: 10,
          italics: true,
          margin: [30, 10, 0, 0]
        });
        if (intermediateCross) {
          docDef.content.push({
            columns: [
              {
                width: "*",
                text: "VERIFICATION PREVIOUSLY CARRIED OUT",
                fontSize: 15,
                absolutePosition: { x: 175, y: 190 }
              }
            ]
          });
          docDef.content.push({
            canvas: [
              {
                type: "line",
                x1: 20,
                y1: -15,
                x2: 510,
                y2: -148,
                lineWidth: 1
              }
            ]
          });
        }

        // ISM Additional Starts here... (1)

        if (
          certificateData.additional1[0] ||
          certificateData.additional1.length == 0
        ) {
          var AdditionalsealContent = "";
          AdditionalsealContent = certificateData.additional1[0]
            ? certificateData.additional1[0].sealImage
            : _that.images["transparent"];

          docDef.content.push({
            alignment: "justify",
            columns: [
              {
                width: 215,
                stack: [
                  {
                    text: [{ text: "Additional Verification*:\n" }],
                    fontSize: 10,
                    margin: [30, 0, 0, 0]
                  },
                  {
                    image: AdditionalsealContent,
                    width: 70,
                    height: 70,
                    margin: [45, 17, 0, 0]
                  }
                ]
              },
              {
                width: "*",
                table: {
                  body: [
                    [
                      {
                        stack: [
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Signed:",
                                fontSize: 10
                              },
                              {
                                image:
                                  certificateData.additional1[0] &&
                                    certificateData.additional1[0].signToPrint ===
                                    1
                                    ? "data:image/jpeg;base64," +
                                    certificateData.additional1[0].issuerSign
                                    : _that.images["transparent"],
                                width: 150,
                                height: 20,
                                margin: [45, -15, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {},
                              {
                                canvas: [
                                  {
                                    type: "line",
                                    x1: -125,
                                    y1: 10,
                                    x2: 125,
                                    y2: 10,
                                    lineWidth: 1
                                  }
                                ],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          },
                          {
                            text: [
                              {
                                text:
                                  certificateData.additional1[0] &&
                                    certificateData.additional1[0].nameToPrint ===
                                    1
                                    ? certificateData.additional1[0]
                                      .issuerName + "\n"
                                    : "(Name)\n",
                                italics:
                                  certificateData.additional1[0] &&
                                    certificateData.additional1[0].nameToPrint ===
                                    1 &&
                                    certificateData.additional1[0].issuerName
                                    ? false
                                    : true
                              },
                              {
                                text:
                                  certificateData.additional1[0] &&
                                    certificateData.additional1[0].title
                                    ? certificateData.additional1[0].title
                                    : "(Appointment)",
                                italics:
                                  certificateData.additional1[0] &&
                                    certificateData.additional1[0].title
                                    ? false
                                    : true
                              }
                            ],
                            fontSize: 10,
                            margin: [20, 0, 0, 0],
                            alignment: "center"
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Place:",
                                fontSize: 10,
                                margin: [0, 13, 0, 0]
                              },
                              {
                                text:
                                  certificateData.additional1[0] &&
                                    certificateData.additional1[0].auditPlace
                                    ? certificateData.additional1[0].auditPlace
                                    : "     ",
                                fontSize: 10,
                                margin: [5, 10, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {},
                              {
                                canvas: [
                                  {
                                    type: "line",
                                    x1: -125,
                                    y1: 10,
                                    x2: 125,
                                    y2: 10,
                                    lineWidth: 1
                                  }
                                ],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Date:",
                                fontSize: 10,
                                margin: [0, 30, 0, 0]
                              },
                              {
                                text:
                                  certificateData.additional1[0] &&
                                    certificateData.additional1[0].issuerSignDate
                                    ? certificateData.additional1[0].issuerSignDate.replace(
                                      /^0+/,
                                      ""
                                    )
                                    : "   ",
                                fontSize: 10,
                                margin: [5, 25, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {},
                              {
                                canvas: [
                                  {
                                    type: "line",
                                    x1: -125,
                                    y1: 10,
                                    x2: 125,
                                    y2: 10,
                                    lineWidth: 1
                                  }
                                ],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  ]
                },
                layout: "noBorders"
              }
            ]
          });

          docDef.content.push({
            text:
              "(Seal or stamp of issuing authority, as appropriate)" + "\n\n",
            fontSize: 10,
            italics: true,
            margin: [30, 10, 0, 0]
          });
          if (additionalCross1) {
            docDef.content.push({
              columns: [
                {
                  width: "*",
                  text: "VERIFICATION PREVIOUSLY CARRIED OUT",
                  fontSize: 15,
                  absolutePosition: { x: 175, y: 333 }
                }
              ]
            });
            docDef.content.push({
              canvas: [
                {
                  type: "line",
                  x1: 20,
                  y1: -15,
                  x2: 510,
                  y2: -148,
                  lineWidth: 1
                }
              ]
            });
          }
        }

        // ISM Additional Starts here... (2)

        if (
          certificateData.additional2[0] ||
          certificateData.additional2.length == 0
        ) {
          var AdditionalsealContent1 = "";
          AdditionalsealContent1 = certificateData.additional2[0]
            ? certificateData.additional2[0].sealImage
            : _that.images["transparent"];

          docDef.content.push({
            alignment: "justify",
            columns: [
              {
                width: 215,
                stack: [
                  {
                    text: [{ text: "Additional Verification*:\n" }],
                    fontSize: 10,
                    margin: [30, 0, 0, 0]
                  },
                  {
                    image: AdditionalsealContent1,
                    width: 70,
                    height: 70,
                    margin: [45, 17, 0, 0]
                  }
                ]
              },
              {
                width: "*",
                table: {
                  body: [
                    [
                      {
                        stack: [
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Signed:",
                                fontSize: 10
                              },
                              {
                                image:
                                  certificateData.additional2[0] &&
                                    certificateData.additional2[0].signToPrint ===
                                    1
                                    ? "data:image/jpeg;base64," +
                                    certificateData.additional2[0].issuerSign
                                    : _that.images["transparent"],
                                width: 150,
                                height: 20,
                                margin: [45, -15, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {},
                              {
                                canvas: [
                                  {
                                    type: "line",
                                    x1: -125,
                                    y1: 10,
                                    x2: 125,
                                    y2: 10,
                                    lineWidth: 1
                                  }
                                ],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          },
                          {
                            text: [
                              {
                                text:
                                  certificateData.additional2[0] &&
                                    certificateData.additional2[0].nameToPrint ===
                                    1
                                    ? certificateData.additional2[0]
                                      .issuerName + "\n"
                                    : "(Name)\n",
                                italics:
                                  certificateData.additional2[0] &&
                                    certificateData.additional2[0].nameToPrint ===
                                    1 &&
                                    certificateData.additional2[0].issuerName
                                    ? false
                                    : true
                              },
                              {
                                text:
                                  certificateData.additional2[0] &&
                                    certificateData.additional2[0].title
                                    ? certificateData.additional2[0].title
                                    : "(Appointment)",
                                italics:
                                  certificateData.additional2[0] &&
                                    certificateData.additional2[0].title
                                    ? false
                                    : true
                              }
                            ],
                            fontSize: 10,
                            margin: [20, 0, 0, 0],
                            alignment: "center"
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Place:",
                                fontSize: 10,
                                margin: [0, 13, 0, 0]
                              },
                              {
                                text:
                                  certificateData.additional2[0] &&
                                    certificateData.additional2[0].auditPlace
                                    ? certificateData.additional2[0].auditPlace
                                    : "     ",
                                fontSize: 10,
                                margin: [5, 10, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {},
                              {
                                canvas: [
                                  {
                                    type: "line",
                                    x1: -125,
                                    y1: 10,
                                    x2: 125,
                                    y2: 10,
                                    lineWidth: 1
                                  }
                                ],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Date:",
                                fontSize: 10,
                                margin: [0, 30, 0, 0]
                              },
                              {
                                text:
                                  certificateData.additional2[0] &&
                                    certificateData.additional2[0].issuerSignDate
                                    ? certificateData.additional2[0].issuerSignDate.replace(
                                      /^0+/,
                                      ""
                                    )
                                    : "   ",
                                fontSize: 10,
                                margin: [5, 25, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {},
                              {
                                canvas: [
                                  {
                                    type: "line",
                                    x1: -125,
                                    y1: 10,
                                    x2: 125,
                                    y2: 10,
                                    lineWidth: 1
                                  }
                                ],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  ]
                },
                layout: "noBorders"
              }
            ]
          });
          docDef.content.push({
            text:
              "(Seal or stamp of issuing authority, as appropriate)" + "\n\n",
            fontSize: 10,
            italics: true,
            margin: [30, 10, 0, 0]
          });
          if (additionalCross2) {
            docDef.content.push({
              columns: [
                {
                  width: "*",
                  text: "VERIFICATION PREVIOUSLY CARRIED OUT",
                  fontSize: 15,
                  absolutePosition: { x: 175, y: 470 }
                }
              ]
            });
            docDef.content.push({
              canvas: [
                {
                  type: "line",
                  x1: 20,
                  y1: -15,
                  x2: 510,
                  y2: -148,
                  lineWidth: 1
                }
              ]
            });
          }

          // ISM Additional Starts here... (3)

          if (
            certificateData.additional3[0] ||
            certificateData.additional3.length == 0
          ) {
            var AdditionalsealContent2 = "";
            AdditionalsealContent1 = certificateData.additional3[0]
              ? certificateData.additional3[0].sealImage
              : _that.images["transparent"];

            docDef.content.push({
              alignment: "justify",
              columns: [
                {
                  width: 215,
                  stack: [
                    {
                      text: [{ text: "Additional Verification*:\n" }],
                      fontSize: 10,
                      margin: [30, 0, 0, 0]
                    },
                    {
                      image: AdditionalsealContent1,
                      width: 70,
                      height: 70,
                      margin: [45, 17, 0, 0]
                    }
                  ]
                },
                {
                  width: "*",
                  table: {
                    body: [
                      [
                        {
                          stack: [
                            {
                              columns: [
                                {
                                  width: 40,
                                  text: "Signed:",
                                  fontSize: 10
                                },
                                {
                                  image:
                                    certificateData.additional3[0] &&
                                      certificateData.additional3[0]
                                        .signToPrint === 1
                                      ? "data:image/jpeg;base64," +
                                      certificateData.additional3[0]
                                        .issuerSign
                                      : _that.images["transparent"],
                                  width: 150,
                                  height: 20,
                                  margin: [45, -15, 0, 0]
                                }
                              ]
                            },
                            {
                              columns: [
                                {},
                                {
                                  canvas: [
                                    {
                                      type: "line",
                                      x1: -125,
                                      y1: 10,
                                      x2: 125,
                                      y2: 10,
                                      lineWidth: 1
                                    }
                                  ],
                                  margin: [20, -11, 0, 0]
                                }
                              ]
                            },
                            {
                              text: [
                                {
                                  text:
                                    certificateData.additional3[0] &&
                                      certificateData.additional3[0]
                                        .nameToPrint === 1
                                      ? certificateData.additional3[0]
                                        .issuerName + "\n"
                                      : "(Name)\n",
                                  italics:
                                    certificateData.additional3[0] &&
                                      certificateData.additional3[0]
                                        .nameToPrint === 1 &&
                                      certificateData.additional3[0].issuerName
                                      ? false
                                      : true
                                },
                                {
                                  text:
                                    certificateData.additional3[0] &&
                                      certificateData.additional3[0].title
                                      ? certificateData.additional3[0].title
                                      : "(Appointment)",
                                  italics:
                                    certificateData.additional3[0] &&
                                      certificateData.additional3[0].title
                                      ? false
                                      : true
                                }
                              ],
                              fontSize: 10,
                              margin: [20, 0, 0, 0],
                              alignment: "center"
                            },
                            {
                              columns: [
                                {
                                  width: 40,
                                  text: "Place:",
                                  fontSize: 10,
                                  margin: [0, 13, 0, 0]
                                },
                                {
                                  text:
                                    certificateData.additional3[0] &&
                                      certificateData.additional3[0].auditPlace
                                      ? certificateData.additional3[0]
                                        .auditPlace
                                      : "     ",
                                  fontSize: 10,
                                  margin: [5, 10, 0, 0]
                                }
                              ]
                            },
                            {
                              columns: [
                                {},
                                {
                                  canvas: [
                                    {
                                      type: "line",
                                      x1: -125,
                                      y1: 10,
                                      x2: 125,
                                      y2: 10,
                                      lineWidth: 1
                                    }
                                  ],
                                  margin: [20, -11, 0, 0]
                                }
                              ]
                            },
                            {
                              columns: [
                                {
                                  width: 40,
                                  text: "Date:",
                                  fontSize: 10,
                                  margin: [0, 30, 0, 0]
                                },
                                {
                                  text:
                                    certificateData.additional3[0] &&
                                      certificateData.additional3[0]
                                        .issuerSignDate
                                      ? certificateData.additional3[0].issuerSignDate.replace(
                                        /^0+/,
                                        ""
                                      )
                                      : "   ",
                                  fontSize: 10,
                                  margin: [5, 25, 0, 0]
                                }
                              ]
                            },
                            {
                              columns: [
                                {},
                                {
                                  canvas: [
                                    {
                                      type: "line",
                                      x1: -125,
                                      y1: 10,
                                      x2: 125,
                                      y2: 10,
                                      lineWidth: 1
                                    }
                                  ],
                                  margin: [20, -11, 0, 0]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    ]
                  },
                  layout: "noBorders"
                }
              ]
            });
            docDef.content.push(
              voidStatus == true
                ? {
                  //ism initial second page
                  canvas: [
                    {
                      type: "line",
                      x1: 0,
                      y1: -40,
                      x2: 525,
                      y2: -765,
                      color: "red",
                      lineWidth: 2
                    }
                  ],
                  absolutePosition: { x: 45, y: 800 }
                }
                : {}
            );
            docDef.content.push({
              text:
                "(Seal or stamp of issuing authority, as appropriate)" + "\n",
              fontSize: 10,
              italics: true,
              margin: [30, 10, 0, 0]
            });
            if (additionalCross3) {
              docDef.content.push({
                columns: [
                  {
                    width: "*",
                    text: "VERIFICATION PREVIOUSLY CARRIED OUT",
                    fontSize: 15,
                    absolutePosition: { x: 175, y: 602 }
                  }
                ]
              });
              docDef.content.push({
                canvas: [
                  {
                    type: "line",
                    x1: 20,
                    y1: -15,
                    x2: 510,
                    y2: -148,
                    lineWidth: 1
                  }
                ]
              });
            }
          }
        }

        var ismendContents =
          "*If applicable. Refer to the relevant provisions of section 4.3, Initial verification, of the Revised Guidelines on the Implementation of the International Safety Management (ISM) Code by Administrations adopted by the Organization by Resolution A.1118(30).";
        docDef.content.push({
          text: ismendContents,
          fontSize: 9,
          margin: [30, 0, 20, 0],
          italics: true,
          alignment: "justify",
          pageBreak: "after"
        });

        // Next Page
        docDef.content.push(
          {
            columns: [
              {
                columns: [
                  [
                    {
                      text: "Certificate Number",
                      fontSize: 10,
                      //pageBreak:'before',
                      margin: [435, 0, 0, 0]
                    },
                    {
                      table: {
                        widths: [80],
                        body: [
                          [
                            voluntaryCert
                              ? certificateData.certificateNo.replace("F", "FV")
                              : certificateData.certificateNo
                          ]
                        ]
                      },
                      margin: [427, 2, 0, 0],
                      fontSize: 8
                    }
                  ]
                ],
                width: "auto"
              }
            ]
          },
          {
            stack: [
              {
                canvas: [
                  {
                    type: "rect",
                    x: 5,
                    y: 693,
                    w: 525,
                    h: -727,
                    fillOpacity: 0.5,
                    lineWidth: 2
                  }
                ]
              },
              {
                canvas: [
                  {
                    type: "rect",
                    x: 0,
                    y: 698,
                    w: 535,
                    h: -737,
                    fillOpacity: 0.5
                  }
                ]
              }
            ]
          }
        );

        var ismendorsecontent2 =
          "ENDORSEMENT WHERE THE RENEWAL VERIFICATION HAS BEEN COMPLETED AND PART B 13.13 OF THE ISM CODE APPLIES.";

        docDef.content.push({
          text: ismendorsecontent2 + "\n\n",
          fontSize: 10,
          bold: true,
          margin: [30, 10, 30, 0]
        });
        var renewalDate =
          certificateData.renewalEndorse2[0] &&
          certificateData.renewalEndorse2[0].extendedExpireDate
          ? moment(certificateData.renewalEndorse2[0].extendedExpireDate , 'YYYY-MM-DD').format('DD MMMM YYYY')
          : "(Date)";
        var ismendorsecontent3 =
          "The ship complies with the relevant provisions of part B of the ISM Code and the Certificate should, in accordance with part B 13.13 of the ISM Code, be accepted as valid until ";
        docDef.content.push({
          text: [
            { text: ismendorsecontent3 },
            {
              text: renewalDate + ".\n\n",
              italics: renewalDate == "(Date)" ? true : false
            }
          ],
          fontSize: 10,
          margin: [30, 0]
        });

        // Renewal Endorsement start
        if (
          certificateData.crossLineStatus == "extent-inactive" ||
          certificateData.crossLineStatus == "inactive"
        ) {
          if (certificateData.currentCertiObj.certIssueId == 1002) {
            certificateData.renewalEndorse2.length = 0;
          } else if (
            certificateData.currentCertiObj.seqNo <
            (certificateData.renewalEndorse2[0] &&
              certificateData.renewalEndorse2[0].seqNo)
          ) {
            certificateData.renewalEndorse2.length = 0;
            /*certificateData.certificateDetails.forEach(function (exten){
            if(certificateData.currentCertiObj.seqNo > )
          })*/
          }
        }

        var renewalsealContent = "";

        renewalsealContent = certificateData.renewalEndorse2[0]
          ? certificateData.renewalEndorse2[0].sealImage
          : _that.images["transparent"];

        docDef.content.push({
          alignment: "justify",
          columns: [
            {
              width: 215,
              stack: [
                {
                  text: [{ text: "Endorsement:" }],
                  fontSize: 10,
                  margin: [30, 0, 0, 0]
                },
                {
                  image: renewalsealContent,
                  width: 70,
                  height: 70,
                  margin: [45, 10, 0, 0]
                }
              ]
            },
            {
              width: "*",
              table: {
                body: [
                  [
                    {
                      stack: [
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Signed:",
                              fontSize: 10
                            },
                            {
                              image:
                                certificateData.renewalEndorse2[0] &&
                                  certificateData.renewalEndorse2[0]
                                    .signToPrint === 1
                                  ? "data:image/jpeg;base64," +
                                  certificateData.renewalEndorse2[0]
                                    .issuerSign
                                  : _that.images["transparent"],
                              width: 150,
                              height: 20,
                              margin: [45, -15, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {},
                            {
                              canvas: [
                                {
                                  type: "line",
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }
                              ],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        },
                        {
                          text: [
                            {
                              text:
                                certificateData.renewalEndorse2[0] &&
                                  certificateData.renewalEndorse2[0]
                                    .nameToPrint === 1
                                  ? certificateData.renewalEndorse2[0]
                                    .issuerName + "\n"
                                  : "(Name)\n",
                              italics:
                                certificateData.renewalEndorse2[0] &&
                                  certificateData.renewalEndorse2[0]
                                    .nameToPrint === 1 &&
                                  certificateData.renewalEndorse2[0].issuerName
                                  ? false
                                  : true
                            },
                            {
                              text:
                                certificateData.renewalEndorse2[0] &&
                                  certificateData.renewalEndorse2[0].title
                                  ? certificateData.renewalEndorse2[0].title
                                  : "(Appointment)",
                              italics:
                                certificateData.renewalEndorse2[0] &&
                                  certificateData.renewalEndorse2[0].title
                                  ? false
                                  : true
                            }
                          ],
                          fontSize: 10,
                          margin: [20, 0, 0, 0],
                          alignment: "center"
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Place:",
                              fontSize: 10,
                              margin: [0, 13, 0, 0]
                            },
                            {
                              text:
                                certificateData.renewalEndorse2[0] &&
                                  certificateData.renewalEndorse2[0].auditPlace
                                  ? certificateData.renewalEndorse2[0]
                                    .auditPlace
                                  : "   ",
                              fontSize: 10,
                              margin: [5, 10, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {},
                            {
                              canvas: [
                                {
                                  type: "line",
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }
                              ],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Date:",
                              fontSize: 10,
                              margin: [0, 30, 0, 0]
                            },
                            {
                              text:
                                certificateData.renewalEndorse2[0] &&
                                  certificateData.renewalEndorse2[0]
                                    .issuerSignDate
                                  ? certificateData.renewalEndorse2[0].issuerSignDate.replace(
                                    /^0+/,
                                    ""
                                  )
                                  : "    ",
                              fontSize: 10,
                              margin: [5, 25, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {},
                            {
                              canvas: [
                                {
                                  type: "line",
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }
                              ],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                ]
              },
              layout: "noBorders"
            }
          ],
          margin: [0, 10, 0, 0]
        });
        docDef.content.push({
          text: "(Seal or stamp of issuing authority, as appropriate)" + "\n\n",
          fontSize: 10,
          italics: true,
          margin: [30, 10, 0, 0]
        });
        // end
        var endorseExtendContent =
          "ENDORSEMENT TO EXTEND THE VALIDITY OF THE CERTIFICATE UNTIL REACHING THE PORT OF VERIFICATION WHERE PART B 13.12 OF THE ISM CODE APPLIES OR FOR A PERIOD OF GRACE WHERE PART B 13.14 OF THE ISM CODE APPLIES.";

        docDef.content.push({
          text: endorseExtendContent + "\n\n",
          fontSize: 10,
          bold: true,
          margin: [30, 0]
        });
        var extensionDate =
          certificateData.extension[0] &&
            certificateData.extension[0].extendedExpireDate
            ? certificateData.extension[0].extendedExpireDate
            : "(Date)";
        var endorseExtendContent1 =
          "This Certificate should, in accordance with part B 13.12 or part B 13.14 of the ISM Code, be accepted as valid until ";
        docDef.content.push({
          text: [
            { text: endorseExtendContent1 },
            {
              text: extensionDate.replace(/^0+/, "") + ".\n\n\n",
              italics: extensionDate == "(Date)" ? true : false
            }
          ],
          fontSize: 10,
          margin: [30, 0]
        });
        // extension start

        if (
          certificateData.crossLineStatus == "extent-inactive" ||
          certificateData.crossLineStatus == "inactive"
        ) {
          if (certificateData.currentCertiObj.certIssueId == 1002) {
            console.log("extent-inactive");
            certificateData.extension.length = 0;
          } else if (
            certificateData.currentCertiObj.seqNo <
            (certificateData.extension[0] && certificateData.extension[0].seqNo)
          ) {
            console.log("t-inactive");
            certificateData.extension.length = 0;
            /*certificateData.certificateDetails.forEach(function (exten){
            if(certificateData.currentCertiObj.seqNo > )
          })*/
          }
        }
        var renewalsealContent1 = "";

        renewalsealContent1 = certificateData.extension[0]
          ? certificateData.extension[0].sealImage
          : _that.images["transparent"];

        docDef.content.push({
          alignment: "justify",
          columns: [
            {
              width: 215,
              stack: [
                {
                  text: [{ text: "Endorsement to Extend:" }],
                  fontSize: 10,
                  margin: [30, 0, 0, 0]
                },
                {
                  image: renewalsealContent1,
                  width: 70,
                  height: 70,
                  margin: [45, 10, 0, 0]
                }
              ]
            },
            {
              width: "*",
              table: {
                body: [
                  [
                    {
                      stack: [
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Signed:",
                              fontSize: 10
                            },
                            {
                              image:
                                certificateData.extension[0] &&
                                  certificateData.extension[0].signToPrint === 1
                                  ? "data:image/jpeg;base64," +
                                  certificateData.extension[0].issuerSign
                                  : _that.images["transparent"],
                              width: 150,
                              height: 20,
                              margin: [45, -15, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {},
                            {
                              canvas: [
                                {
                                  type: "line",
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }
                              ],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        },
                        {
                          text: [
                            {
                              text:
                                certificateData.extension[0] &&
                                  certificateData.extension[0].nameToPrint === 1
                                  ? certificateData.extension[0].issuerName +
                                  "\n"
                                  : "(Name)\n",
                              italics:
                                certificateData.extension[0] &&
                                  certificateData.extension[0].nameToPrint ===
                                  1 &&
                                  certificateData.extension[0].issuerName
                                  ? false
                                  : true
                            },
                            {
                              text:
                                certificateData.extension[0] &&
                                  certificateData.extension[0].title
                                  ? certificateData.extension[0].title
                                  : "(Appointment)",
                              italics:
                                certificateData.extension[0] &&
                                  certificateData.extension[0].title
                                  ? false
                                  : true
                            }
                          ],
                          fontSize: 10,
                          margin: [20, 0, 0, 0],
                          alignment: "center"
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Place:",
                              fontSize: 10,
                              margin: [0, 13, 0, 0]
                            },
                            {
                              text:
                                certificateData.extension[0] &&
                                  certificateData.extension[0].auditPlace
                                  ? certificateData.extension[0].auditPlace
                                  : "   ",
                              fontSize: 10,
                              margin: [5, 10, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {},
                            {
                              canvas: [
                                {
                                  type: "line",
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }
                              ],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Date:",
                              fontSize: 10,
                              margin: [0, 30, 0, 0]
                            },
                            {
                              text:
                                certificateData.extension[0] &&
                                  certificateData.extension[0].issuerSignDate
                                  ? certificateData.extension[0].issuerSignDate.replace(
                                    /^0+/,
                                    ""
                                  )
                                  : "    ",
                              fontSize: 10,
                              margin: [5, 25, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {},
                            {
                              canvas: [
                                {
                                  type: "line",
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }
                              ],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                ]
              },
              layout: "noBorders"
            }
          ]
        });
        docDef.content.push({
          text: "(Seal or stamp of issuing authority, as appropriate)" + "\n\n",
          fontSize: 10,
          italics: true,
          margin: [30, 10, 0, 0]
        });
        //end

        docDef.content.push(
          voidStatus == true
            ? {
              //ism initial second page
              canvas: [
                {
                  type: "line",
                  x1: 0,
                  y1: -40,
                  x2: 525,
                  y2: -765,
                  color: "red",
                  lineWidth: 2
                }
              ],
              absolutePosition: { x: 45, y: 800 }
            }
            : {}
        );

      }

      pdfMake.createPdf(docDef, "", "", this.fonts).getBlob(data => {
        this.fileManager.checkPdfDirectory().then(() => {
          this.fileManager.writePdfInTheDirectory(
            data,
            "" + certificateData.certificateNo + ".pdf",
            "Certificate"
          ).then(() => {
            this.fileManager.openPdf("" + certificateData.certificateNo + ".pdf").then(() => {
              resolve({ data: "Success" });
            });
          });
        });
      });
      this.loader.hideLoader();
    });
  }
  /**
   * ispsPdfService
   */
  public ispsPdfService(certificateData) {
    return new Promise<Object>((resolve, reject) => {
      this.loader.showLoader("PreparingCertificate");
      console.log(certificateData);
      let _that = this;
      var tempcertificateHead, voidStatus, tempcertificatetype, audittype, auditsubtypeidCaps, auditsubtypeidsmall, headSubTitle, cmpnytype, nmecompny = "", shipType = "Type of Ship", Grt = "Gross Tonnage:", signaturetext = "Signature of the duly authorized official issuing the Certificate", subsequentCertificate = "No";
      var voluntaryCert = certificateData.voluntaryCert;
      if (certificateData.AuditStatusId == this.appConstant.VOID_AUDIT_STATUS || certificateData.auditSummarId === 1005 || certificateData.res.activeStatus === 0 || certificateData.crossLineStatus === "extent-inactive") {
        voidStatus = true;
      }
      if (certificateData.auditSubTypeId == this.appConstant.INTERIM_SUB_TYPE_ID) {
        auditsubtypeidCaps = "INTERIM";
        auditsubtypeidsmall = "Interim"
      } else {
        auditsubtypeidCaps = "";
        auditsubtypeidsmall = ""
      }

      tempcertificateHead = "" + auditsubtypeidsmall
        + " International Ship Security Certificate";

      tempcertificatetype = "" + auditsubtypeidsmall
        + " International Ship Security Certificate";
      tempcertificateHead = voluntaryCert ? auditsubtypeidsmall + " Voluntary Statement of Compliance" : tempcertificateHead;

      audittype = "ISPS";

      var issuedDay = this.dateSuffix(Number(moment(certificateData.certIssueDate, 'YYYY-MM-DD').format('DD MMMM YYYY')
        .split(' ')[0]));

      var issuedMonth = moment(certificateData.certIssueDate, 'YYYY-MM-DD').format('DD MMMM YYYY').split(' ')[1];

      var issuedYear = moment(certificateData.certIssueDate, 'YYYY-MM-DD').format('DD MMMM YYYY').split(' ')[2];

      var certificateAuthority = 'Issued by the authority of the Republic of the Marshall Islands Maritime Administrator \nat '
        + certificateData.auditplace
        + ' this '
        + issuedDay
        + ' day of ' + issuedMonth + ", " + issuedYear + '.';

      var footerNote;

      if (certificateData.auditSubTypeId == this.appConstant.INTERIM_SUB_TYPE_ID) {
        footerNote = voluntaryCert ? "MSC-296GV Rev. 10/19" : "MSC-296G Rev. 2/18";

      } else if (certificateData.auditSubTypeId == this.appConstant.INITIAL_SUB_TYPE_ID
        || certificateData.auditSubTypeId == this.appConstant.RENEWAL_SUB_TYPE_ID
        || certificateData.auditSubTypeId == this.appConstant.INTERMEDIATE_SUB_TYPE_ID
        || certificateData.auditSubTypeId == this.appConstant.ADDITIONAL_SUB_TYPE_ID) {

        footerNote = voluntaryCert ? "MSC-296HV Rev. 10/19" : "MSC-296H Rev. 2/18";


      }

      cmpnytype = "Company"

      nmecompny = "Name and Address of the " + cmpnytype + ":";

      var docDef: any = {};

      if (certificateData.auditSubTypeId == this.appConstant.INTERIM_SUB_TYPE_ID) {
        console.log("Interim", certificateData);



        docDef = {
          ownerPassword: '123456',
          permissions: {
            printing: 'highResolution',
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: false,
            documentAssembly: false
          },

          defaultStyle: {
            // font: 'Times'
          },
          pageSize: 'Letter',

          content: [],
          // pageMargins: [5, 5, 5, 5],
          background: function (currentPage, pageSize) {
            return {
              image: _that.images['watermark'],
              width: 300,
              absolutePosition: {
                x: 150,
                y: 260
              },
              opacity: 0.7
            }
          },
          styles: {
            rightme: {
              alignment: 'center',
              //margin : [ 0, 10 ]
            },
            header: {
              fontSize: 16,
              bold: true
            }
          }
        };
        docDef.content.push({
          columns: [{
            image: '',
            width: 80,
            height: 80,
            margin: [10, 15, 0, 0]
          }, {
            width: 355,
            margin: [13, 10, 0, 0],
            text: [{
              text: 'Republic of the Marshall Islands\n',
              fontSize: 23,
              bold: true,
              color: '#525252'
            }, {
              text: 'Maritime Administrator\n',
              fontSize: 14,
              bold: true,
              color: '#666666', style: 'rightme'
            }, {
              text: tempcertificateHead + '\n',
              fontSize: 16,
              bold: true,
              color: '#666666'
            },
            {
              text: '',
              fontSize: 10,
              color: 'black',
              alignment: 'center',
            },
            {
              text: 'Issued under the provisions of the International Ship and \n Port Facility Security (ISPS) Code' + '\n\n',
              fontSize: 10,
              color: 'black',
              alignment: 'center',
            },
            {
              text: 'Under the authority of the Government of the Republic of the Marshall Islands\n',
              fontSize: 9,
              color: 'black',
              alignment: 'center'
            }]

          }, {
            columns: [[{
              text: 'Certificate Number',
              fontSize: 10,
              margin: [7, 0, 0, 0]
            }, {
              table: {
                widths: [77],
                body: [[voluntaryCert ? certificateData.certificateNo.replace("G", "GV") : certificateData.certificateNo]]
              },
              margin: [3, 2, 0, 0], fontSize: 8
            }, {
              qr: certificateData.qrCodeUrl,
              fit: 100,
              margin: [6, 10, 0, 0]
              /*image:certificateData.QrC,
              width : 60,
              height : 60,
              margin : [ 18, 10,0,0 ]*/
            }]],
            width: 'auto'
          }]
        });

        docDef.content[0].columns[0].image = _that.images['logo'];
        docDef.content
          .push({});


        docDef.content.push({
          text: 'Particulars of the Ship:',
          bold: true,
          fontSize: 10,
          margin: [20, 10]
        });

        docDef.content.push([{

          margin: [20, 0, 0, 0],
          table: {
            widths: [155, 315],
            heights: [0, 0],
            body: [
              [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: "Name of Ship:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.vesselName, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: 'Distinctive Number or Letters:', fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: certificateData.officialNo, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "Port of Registry:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: certificateData.portofreg, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: Grt, fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: certificateData.grt, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: "IMO No.:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: certificateData.vesselImoNo, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: "Type of Ship:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: certificateData.shiptype, fontSize: 10, bold: false }]


                }
              ]]
          },
          layout: 'noBorders'
        }

        ])


        docDef.content.push({
          text: "Name and Address of the Company:\n",
          bold: true,
          fontSize: 10,
          margin: [20, 25, 0, 0]
        });

        docDef.content.push([{

          margin: [20, 0, 0, 0],
          table: {
            widths: [155, 300],
            heights: [25, 40],
            body: [
              [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: "Company Name:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: certificateData.companyname, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: "Company Address:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: certificateData.companyaddress, fontSize: 10, bold: false }]


                }
              ]]
          },
          layout: 'noBorders'
        }

        ])

        docDef.content.push({
          columns: [
            {
              text: [
                { text: 'Company Identification Number: \n', margin: [30, 0, 0, 0] }
              ],
              margin: [20, 10, 0, 0]

            },
            {
              text: [
                { text: (certificateData.vesselName.length < 54) ? certificateData.companyimono + '\n\n\n' : certificateData.companyimono + '\n\n', alignment: 'justify' }
              ],
              margin: [-83, 10, 0, 0]
            }],
          //margin : [ 10, 0 ],
          fontSize: 10,
          color: '#141414'
        })
        var issueDateOfInterimCert;
        if (certificateData.consecutiveId == 1001 && certificateData.ispsPreviousIssueDate == "") {
          issueDateOfInterimCert = certificateData.certificateDetails[0].certIssueDate;
        } else {
          issueDateOfInterimCert = (certificateData.consecutiveId) == 1001 ? certificateData.ispsPreviousIssueDate : 'NA';
        }
        docDef.content.push({
          text: [
            { text: 'Is this a subsequent, consecutive Interim Certificate? ', fontSize: 10, color: 'black' },
            { text: (certificateData.consecutiveId != 1001) ? 'No' : 'Yes', fontSize: 10, color: 'black', italics: false },
            { text: '\n If yes, date of issue of initial Interim Certificate: ', fontSize: 10, color: 'black' },
            { text: issueDateOfInterimCert, fontSize: 10, color: 'black', italics: false },
          ],
          margin: [20, 0, 0, 0]
        })
        docDef.content.push({ // to draw a horizontal line
          canvas: [{
            type: 'line',
            x1: 15,
            y1: 5,
            x2: 520,
            y2: 5,
            lineWidth: 2
          }]
        });


        docDef.content.push({
          text: "",
          margin: [10, 0],
          bold: true,
          fontSize: 10
        });

        docDef.content.push({

          text: [
            { text: 'THIS IS TO CERTIFY THAT ', fontSize: 10, margin: [10, 20, 0, 0], bold: true },
            { text: 'the requirements of section A/19.4.2 of the ISPS Code have been complied with. \n\n', fontSize: 10, margin: [10, 0, 0, 0], alignment: 'justify' },
            { text: 'This Certificate is issued pursuant to section A/19.4 of the ISPS Code.\n\n', fontSize: 10, margin: [10, 0, 0, 0], alignment: 'justify' },
          ],
          margin: [20, 20, 0, 0]

        });

        docDef.content.push({
          text: ['This Certificate is valid until ' + moment(certificateData.expirydate, 'YYYY-MM-DD').format('DD MMMM YYYY') + '.' + '\n'],
          margin: [20, 0],
          fontSize: 10, alignment: 'justify'
        });


        docDef.content.push({
          /*text : [ '' + mlcValidity1 + '\n\n' ],
          margin : [ 20, 0 ],
          fontSize : 10,alignment:'justify'*/
        });


        docDef.content.push({
          text: ["Issued by the authority of the Republic of the Marshall Islands Maritime Administrator"],
          //alignment:'right',
          margin: [160, 20, 0, 0],
          fontSize: 10
        });

        docDef.content.push({
          text: ['at ' + certificateData.auditplace
            + ' this '
            + issuedDay
            + ' day of ' + issuedMonth + ", " + issuedYear + '.' + '\n'],
          margin: [160, 0, 0, 0],
          fontSize: 10
        });
        docDef.content.push({
          columns: [{
            image: '',
            width: 80,
            height: 80,
            margin: [45, -10, 0, 0]
          }, {
            width: '*',
            text: []
          }, {
            columns: [[{
              text: ['\n\n']
            }
              , {
              image: '',
              width: 150,
              height: 30,
              margin: [20, 15, 0, 0]
            }
            ]]
          }]
        })

        docDef.content[15].columns[0].image = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].sealImage : _that.images['transparent'];
        docDef.content[15].columns[2].columns[0][1].image = certificateData.currInitialPage[0] && certificateData.currInitialPage[0].signToPrint == 1 ? "data:image/png;base64,"
          + certificateData.currInitialPage[0].issuerSign : _that.images['transparent'];


        docDef.content.push({
          columns: [{
            width: '*',
            text: certificateData.sealcontent + '\n',
            fontSize: 9,
            margin: [20, 5, 0, 0]

          }, {
            canvas: [{
              type: 'line',
              x1: 0,
              y1: 10,
              x2: 250,
              y2: 10,
              lineWidth: 1
            }]
          }]
        })
        console.log(docDef.content)
        docDef.content.push({
          columns: [{
            width: '*',
            text: ['\n\n\n', {
              text: "Unique Tracking Number: ",
              fontSize: 10
            }, {
                text: certificateData.utn,
                bold: true,
                fontSize: 10
              }],
          }, {
            width: '*',
            text: [{
              text: '',
              alignment: 'center',
              fontSize: 10,
              italics: false
            }, {
              text: '',
              alignment: 'center',
              fontSize: 10,
              italics: false
            }]
          }], margin: [20, 0, 0, 0]
        })

        docDef.content[17].columns[1].text[0].text = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].nameFull : '(Name) \n';
        docDef.content[17].columns[1].text[0].italics = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].nameItalics : true;
        docDef.content[17].columns[1].text[1].text = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].title : '(Appointment)';
        docDef.content[17].columns[1].text[1].italics = certificateData.currInitialPage[0] ? false : true;

        docDef.content.push(
          {
            stack: [
              {
                canvas: [
                  {
                    type: 'rect',
                    x: 5, y: (certificateData.vesselName.length < 54) ? 10 : 10,
                    w: 525,
                    h: -720,
                    fillOpacity: 0.5,
                    lineWidth: 2
                  }
                ]
              },
              {
                canvas: [
                  {
                    type: 'rect',
                    x: 0, y: (certificateData.vesselName.length < 54) ? 15 : 15,
                    w: 535,
                    h: -730,
                    fillOpacity: 0.5
                  }
                ]
              },
              voidStatus == true ? {//ism initial second page
                canvas: [{
                  type: 'line',
                  x1: 0,
                  y1: -40,
                  x2: 525,
                  y2: -765,
                  color: 'red',
                  lineWidth: 2
                }
                ],
                absolutePosition: { x: 45, y: 798 }
              } : {}
            ]

          });

        console.log("isps interim", docDef.content);


      } else if (certificateData.auditSubTypeId == this.appConstant.INITIAL_SUB_TYPE_ID || certificateData.auditSubTypeId == this.appConstant.RENEWAL_SUB_TYPE_ID) {

        console.log("ISPS initial/renewal certificateData", certificateData);

        var expiryDate = certificateData.expirydate ? certificateData.expirydate : '(Date)';

        var place = certificateData.auditplace = certificateData.auditplace ? certificateData.auditplace : '(Location)';

        var issueDate = certificateData.certIssueDate = certificateData.certIssueDate ? certificateData.certIssueDate : '(Date)';

        var issuedDay = this.dateSuffix(Number(moment(certificateData.certIssueDate, 'YYYY-MM-DD').format('DD MMMM YYYY')
          .split(' ')[0]));

        var issuedDay1 = issuedDay ? issuedDay : '(Day)';

        var issuedMonth = moment(certificateData.certIssueDate, 'YYYY-MM-DD').format('DD MMMM YYYY').split(' ')[1];

        var issuedMonth1 = issuedMonth ? issuedMonth : '(Month';

        var issuedYear = moment(certificateData.certIssueDate, 'YYYY-MM-DD').format('DD MMMM YYYY').split(' ')[2];

        var issuedYear1 = issuedYear ? issuedYear : 'Year)';

        var certificateAuthority = 'Issued by the authority of the Republic of the Marshall Islands Maritime Administrator at '
          + place
          + ' this '
          + issuedDay1
          + ' day of ' + issuedMonth1 + ', ' + issuedYear1 + '.';

        var intermediateCross = false;
        var additionalCross1 = false;
        var additionalCross2 = false;
        var additionalCross3 = false;
        var withoutcross = true;

        intermediateCross = (certificateData.intermediateReissue[0]) ? certificateData.intermediateReissue[0].interReissue : false;
        additionalCross1 = (certificateData.additionalReissue1[0]) ? certificateData.additionalReissue1[0].addReissue : false;
        additionalCross2 = (certificateData.additionalReissue2[0]) ? certificateData.additionalReissue2[0].addReissue : false;
        additionalCross3 = (certificateData.additionalReissue3[0]) ? certificateData.additionalReissue3[0].addReissue : false;

        docDef = {
          ownerPassword: '123456',
          permissions: {
            printing: 'highResolution',
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: false,
            documentAssembly: false
          },

          defaultStyle: {
            //font: 'Times'
          }, pageSize: 'Letter',

          /*header : {
            columns : [ {
              width : 80,
              text : ''
            }, {
              width : '*',
              text : ''
            }, {
              columns : [ [ {
                text : 'Certificate Number',
                fontSize : 10,
                margin : [ 5, 0 ]
              }, {
                table : {
                  body : [ [ certificateData.certificateNo ] ]
                },
                margin : [ 20, 2 ]
              } ] ],
              width : 'auto',
              margin : [ 40, 5 ],
            } ]
          },*/

          /*	footer : {
              text : footerNote,
              alignment : 'right',
              margin : [ 60,0],
              fontSize : 10
            },*/

          content: [],
          // pageMargins: [5, 5, 5, 5],
          background: function (currentPage, pageSize) {
            return {
              image: _that.images['watermark'],
              width: 300,
              absolutePosition: {
                x: 150,
                y: 260
              },
              opacity: 0.7
            }
          },
          styles: {
            rightme: {
              alignment: 'center',
              margin: [0, 10]
            },
            header: {
              fontSize: 16,
              bold: true
            }
          }
        };
        docDef.content.push({
          columns: [{
            image: '',
            width: 80,
            height: 80,
            margin: [10, 15, 0, 0]
          }, {
            width: 350,
            margin: [0, 10, 0, 0],
            text: [{
              text: 'Republic of the Marshall Islands\n',
              fontSize: 23,
              bold: true,
              color: '#525252', style: 'rightme'
            }, {
              text: 'Maritime Administrator\n',
              fontSize: 14,
              bold: true,
              color: '#666666', style: 'rightme'
            }, {
              text: tempcertificateHead + '\n',
              fontSize: 17,
              bold: true,
              color: '#666666', style: 'rightme'
            },
            {
              text: 'Issued under the provisions of the International Ship and \n Port Facility Security (ISPS) Code' + '\n\n',
              fontSize: 10,
              color: 'black',
              alignment: 'center',
            },
            {
              text: 'Under the authority of the Government of the Republic of the Marshall Islands\n',
              fontSize: 10,
              color: 'black',
              alignment: 'center'
            }]

          }, {
            columns: [[{
              text: 'Certificate Number',
              fontSize: 10,
              margin: [3, 5, 0, 0]
            }, {
              table: {
                widths: [80],
                body: [[voluntaryCert ? certificateData.certificateNo.replace("H", "HV") : certificateData.certificateNo]]
              },
              margin: [-3, 2, 0, 0], fontSize: 8
            }, {
              qr: certificateData.qrCodeUrl,
              fit: 100,
              margin: [1, 10, 0, 0]
              /*image:certificateData.QrC,
              width : 60,
              height : 60,
              margin : [ 12, 10,0,0 ]*/
            }]],
            width: 'auto'
          }]
        });

        docDef.content[0].columns[0].image = _that.images['logo'];

        docDef.content
          .push({
            text: [
      /*{
        text : certificateData.HeadSubTitle
            + '\n',
        fontSize : 9,
        color : 'black',
        //alignment : 'center',
        //margin:[0,-90,0,0],
        absolutePosition: {x:80, y:50}
      },
      {
        text : certificateData.headSubTitlemlc
            + '\n',
        fontSize : 9,
        color : 'black',
        alignment : 'center'
      },
      {
        text : certificateData.headSubTitle2
            + '\n',
        fontSize : 9,
        color : 'black',
        alignment : 'center',
        //absolutePosition: {x:80, y:50}
        //margin:[0,-30,0,0]
      },
      {
        text : 'Under the authority of the Government of the Republic of the Marshall Islands\n\n',
        fontSize : 9,
        color : 'black',
        alignment : 'center'
      }*/ ]
          });

        docDef.content.push({
          text: 'Particulars of the Ship:',
          bold: true,
          fontSize: 10,
          margin: [20, 10]
        });

        docDef.content.push([{

          margin: [20, 0, 0, 0],
          table: {
            widths: [155, 315],
            heights: [0, 0],
            body: [
              [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: "Name of Ship:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: certificateData.vesselName, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: 'Distinctive Number or Letters:', fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: certificateData.officialNo, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "Port of Registry:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.portofreg, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: Grt, fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.grt, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "IMO No.:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.vesselImoNo, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: "Type of Ship:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: certificateData.shiptype, fontSize: 10, bold: false }]


                }
              ]]
          },
          layout: 'noBorders'
        }

        ])


        docDef.content.push({
          text: "Name and Address of the Company:\n",
          bold: true,
          fontSize: 10,
          margin: [20, 15, 0, 10]
        });



        docDef.content.push({
          stack: [
            {

              margin: [20, 0, 0, 0],
              table: {
                widths: [155, 300],
                heights: [25, 40],
                body: [
                  [
                    {
                      border: [true, true, true, true],
                      fillColor: '',
                      text: [{ text: "Company Name:", fontSize: 10, bold: false }]
                    }, {
                      border: [true, true, true, true],
                      fillColor: '',
                      text: [{ text: certificateData.companyname, fontSize: 10, bold: false }]


                    }
                  ], [
                    {
                      border: [true, true, true, true],
                      fillColor: '',
                      text: [{ text: "Company Address:", fontSize: 10, bold: false }]
                    }, {
                      border: [true, true, true, true],
                      fillColor: '',
                      text: [{ text: certificateData.companyaddress, fontSize: 10, bold: false }]


                    }
                  ]]
              },
              layout: 'noBorders'
            },
            {
              columns: [
                {
                  text: [
                    { text: 'Company Identification Number: \n', margin: [30, 20, 0, 0] }
                  ],
                  margin: [20, 0, 0, 0]

                },
                {
                  text: [
                    { text: certificateData.companyimono, margin: [30, 20, 0, 0] }
                  ],
                  margin: [-83, 0, 0, 0]
                }],
              margin: [0, 0, 0, 0],
              fontSize: 10,
              color: '#141414'
            }
          ]
        });

        docDef.content.push({ // to draw a horizontal line
          canvas: [{
            type: 'line',
            x1: 15,
            y1: 5,
            x2: 520,
            y2: 5,
            lineWidth: 1
          }]
        });


        docDef.content.push({
          text: " THIS IS TO CERTIFY THAT:\n\n",
          margin: [20, 10, 0, 0],
          bold: true,
          fontSize: 10
        });

        docDef.content.push({
          fontSize: 9,
          ol: [
            { text: "the security system and any associated security equipment of the ship has been verified in accordance with section 19.1 of part A of the ISPS Code; ", fontSize: 10, margin: [30, 0, 25, 0], alignment: 'justify' },
            { text: "the verification showed that the security system and any associated security equipment of the ship is in all respects satisfactory and that the ship complies with the applicable requirements of chapter XI-2 of the International Convention for the Safety of Life at Sea, 1974 (SOLAS) as amended and part A of the ISPS Code; and", fontSize: 10, margin: [30, 5, 25, 0], alignment: 'justify' },
            { text: "the ship is provided with an approved Ship Security Plan. \n\n", fontSize: 10, margin: [30, 5, 25, 0], alignment: 'justify' }

          ]

        });
        /*	docDef.content.push({
            text:[
                  {text:"the security system and any associated security equipment of the ship has been verified in accordance with section 19.1 of part A of the ISPS Code; \n"},
                  {text:"the verification showed that the security system and any associated security equipment of the ship is in all respects satisfactory and that the ship complies with the applicable requirements of chapter XI-2 of the International Convention for the Safety of Life at Sea, 1974 (SOLAS) as amended and part A of the ISPS Code; and\n"},
                  {text:"the ship is provided with an approved ship security plan. \n\n"}
              ],
            margin : [ 30, 0,25,0 ],
            fontSize : 10,alignment:'justify'
          });*/

        var issueDate = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].completionDate : certificateData.certificateDetails[0].completionDate;
        var finalIssuedDate = '(Date)';
        if (issueDate && issueDate != 'N.A') {
          if (moment(issueDate, 'YYYY-MM-DD', true).isValid())
            finalIssuedDate = moment(issueDate, 'YYYY-MM-DD').format('DD MMMM YYYY');
          else if (moment(issueDate, 'DD-MMM-YYYY', true).isValid())
            finalIssuedDate = moment(issueDate, 'DD-MMM-YYYY').format('DD MMMM YYYY');//date formate is changed by lokesh for jira_id)(900)
          else
            finalIssuedDate = issueDate;
        }
        else {
          finalIssuedDate = '(Date)';

        }

        docDef.content.push({
          text: [
            { text: "Date of " },
            { text: ((certificateData.AuditTypeId) == 1002) ? 'initial ' : 'renewal ', italics: false },
            { text: "verification on which this Certificate is based: " },
            { text: finalIssuedDate + '.', italics: false }
          ],
          margin: [20, 0],
          fontSize: 10, alignment: 'justify'
        });


        docDef.content.push({
          text: [
            { text: "\nThis Certificate is valid until " },
            { text: moment(certificateData.expirydate, 'YYYY-MM-DD').format('DD MMMM YYYY'), italics: false },
            { text: ", subject to verifications in accordance with section 19.1.1 of part A of the ISPS Code.\n" }
          ],
          margin: [20, -5, 25, 0],
          fontSize: 10, alignment: 'justify'
        });


        docDef.content.push({
          text: 'Issued by the authority of the Republic of the Marshall Islands Maritime Administrator\n', fontSize: 10, alignment: 'right', margin: [-20, 15, 25, 0]
        });


        docDef.content.push({
          stack: [
            {
              text: [
                { text: 'at ', fontSize: 10, margin: [100, 0, 0, 0] },
                { text: (certificateData.auditplace) ? certificateData.auditplace : '(Location)', fontSize: 10, italics: false },
                { text: ' this ', fontSize: 10 },
                { text: (issuedDay) ? issuedDay : '(Day)', fontSize: 10, italics: false },
                { text: ' day of ', fontSize: 10 },
                { text: (issuedMonth) ? issuedMonth + ', ' : ' (Month)', fontSize: 10, italics: false },
                { text: (issuedYear) ? issuedYear + '.' : ' (Year)' + '.', fontSize: 10, italics: false }
              ],
              margin: [158, 0, 0, 0],
              fontSize: 10
            }
          ]
        });

        docDef.content.push({
          columns: [{
            image: '',
            width: 80,
            height: 80,
            margin: [45, -20, 0, 0]
          }, {
            width: '*',
            text: []
          }, {
            columns: [[{
              text: ['\n\n']
            }
              , {
              image: '',
              width: 150,
              height: 30,
              margin: [0, 0, 60, 0]
            }
            ]],
            width: 'auto'
          }]
        })

        //initial section
        docDef.content[13].columns[0].image = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].sealImage : _that.images['transparent'];
        docDef.content[13].columns[2].columns[0][1].image = !(certificateData.auditSubTypeId == this.appConstant.INITIAL_SUB_TYPE_ID)?
        certificateData.currInitialPage[0] && certificateData.currInitialPage[0].signToPrint == 1? "data:image/png;base64," + certificateData.currInitialPage[0].issuerSign: _that.images["transparent"]:
        ( certificateData.intermediate[0] &&certificateData.currInitialPage[0])?       (certificateData.intermediate[0] && certificateData.intermediate[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.intermediate[0].issuerSign : _that.images['transparent'] :
        certificateData.currInitialPage[0] &&
         certificateData.currInitialPage[0].signToPrint == 1
         ? "data:image/png;base64," +
         certificateData.currInitialPage[0].issuerSign
         : _that.images["transparent"]//condision changed by lokesh for jira_id(781,887)
        docDef.content.push({
          columns: [{
            width: '*',
            text: certificateData.sealcontent + '\n',
            fontSize: 10, margin: [20, 0, 0, 0]

          }, {
            canvas: [{
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 250,
              y2: 0,
              lineWidth: 1
            }]
          }]
        })
        console.log(docDef.content)
        docDef.content.push({
          columns: [{
            width: '*',
            text: ['', {
              text: "Unique Tracking Number: ",
              fontSize: 10
            }, {
                text: certificateData.utn,
                bold: true,
                fontSize: 10
              }],
            margin: [20, 30, 0, 0]
          }, {
            width: '*',
            text: [{
              text: '',
              alignment: 'center',
              fontSize: 10,
              italics: false
            }, {
              text: '',
              alignment: 'center',
              fontSize: 10
            }
            ],
            margin: [0, -10, 0, 0]
          }]
        })

        //initial section name and title
        //condision changed by lokesh for jira_id(781,887)
        docDef.content[15].columns[1].text[0].text = !(certificateData.auditSubTypeId == this.appConstant.INITIAL_SUB_TYPE_ID)?
        (  certificateData.currInitialPage[0]&&certificateData.currInitialPage[0].nameToPrint===1)
           ? certificateData.currInitialPage[0].nameFull
           : "(Name) \n":(certificateData.intermediate[0]&&certificateData.currInitialPage[0])? (certificateData.intermediate[0] && certificateData.intermediate[0].nameToPrint === 1) ? certificateData.intermediate[0].issuerName + '\n' : '(Name)\n':
           (  certificateData.currInitialPage[0]&&certificateData.currInitialPage[0].nameToPrint===1)
           ? certificateData.currInitialPage[0].nameFull
           : "(Name) \n",
        docDef.content[15].columns[1].text[0].italics = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].nameItalics : true
        docDef.content[15].columns[1].text[1].text = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].title : '(Appointment)';
        docDef.content[15].columns[1].text[1].italics = certificateData.currInitialPage[0] ? false : true;

        docDef.content.push({
          text: footerNote,
          alignment: 'right',
          margin: [60, -10, 10, 0],
          fontSize: 10
        });

        docDef.content.push(
          {
            stack: [
              {
                canvas: [
                  {
                    type: 'rect',
                    x: 5, y: (certificateData.vesselName.length < 54) ? 14 : 11,
                    w: 525,
                    h: (certificateData.vesselName.length < 54) ? -720 : -725,
                    fillOpacity: 0.5,
                    lineWidth: 2
                  }
                ]
              },
              {
                canvas: [
                  {
                    type: 'rect',
                    x: 0, y: (certificateData.vesselName.length < 54) ? 18 : 16,
                    w: 535,
                    h: (certificateData.vesselName.length < 54) ? -727 : -735,
                    fillOpacity: 0.5
                  }
                ]
              },
              voidStatus == true ? {//ism initial second page
                canvas: [{
                  type: 'line',
                  x1: 0,
                  y1: -40,
                  x2: 525,
                  y2: -765,
                  color: 'red',
                  lineWidth: 2
                }
                ],
                absolutePosition: { x: 45, y: 800 }
              } : {}
            ]

          });
        // Second Page
        docDef.content.push({
          columns: [{
            columns: [[{
              text: 'Certificate Number',
              fontSize: 10,
              pageBreak: 'before',
              margin: [435, 0, 0, 0]
            }, {
              table: {
                widths: [80],
                body: [[voluntaryCert ? certificateData.certificateNo.replace("H", "HV") : certificateData.certificateNo]]
              },
              margin: [427, 2, 0, 0], fontSize: 8
            }]],
            width: 'auto',
          }]
        }, {

          stack: [
            {
              canvas: [
                {
                  type: 'rect',
                  x: 5, y: 693,
                  w: 525,
                  h: -727,
                  fillOpacity: 0.5,
                  lineWidth: 2
                }
              ]
            },
            {
              canvas: [
                {
                  type: 'rect',
                  x: 0, y: 698,
                  w: 535,
                  h: -737,
                  fillOpacity: 0.5
                }
              ]
            }
          ]
        });
        docDef.content.push({
          text: 'ENDORSEMENT FOR INTERMEDIATE VERIFICATION ',
          bold: true,
          fontSize: 10,
          alignment: 'center'
        });

        var endroseContent = ' at an intermediate verification required by section 19.1.1 of part A of the ISPS Code, the ship was found to comply with the relevant provisions of chapter XI-2 of SOLAS and part A of the ISPS Code. ';
        docDef.content.push({
          text: [{ text: 'THIS IS TO CERTIFY THAT', bold: true },
          { text: endroseContent + '\n\n\n' }
          ],
          fontSize: 9,
          alignment: 'justify',
          margin: [30, 10, 30, 10]
        });

        // Intermediate Starts here...

        var IntermediatesealContent = '';
        IntermediatesealContent = certificateData.intermediate[0] ? certificateData.intermediate[0].sealImage : _that.images['transparent'];

        docDef.content.push({
          alignment: 'justify',
          columns: [
            {
              width: 215,
              stack: [
                {
                  text: [
                    { text: "Intermediate Verification:\n" }
                  ], fontSize: 10, margin: [30, 0, 0, 0]
                }, {
                  image: IntermediatesealContent,
                  width: 70,
                  height: 70,
                  margin: [45, 10, 0, 0]
                }
              ]
            },
            {
              width: '*',
              table: {
                body: [
                  [
                    {
                      stack: [
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Signed:", fontSize: 10
                            }, {
                              image: (certificateData.intermediate[0] && certificateData.intermediate[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.intermediate[0].issuerSign : _that.images['transparent'],
                              width: 150,
                              height: 20,
                              margin: [45, -15, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        }, {
                          text: [
                            { text: (certificateData.intermediate[0] && certificateData.intermediate[0].nameToPrint === 1) ? certificateData.intermediate[0].issuerName + '\n' : '(Name)\n', italics: (certificateData.intermediate[0] && certificateData.intermediate[0].nameToPrint === 1 && certificateData.intermediate[0].issuerName) ? false : true },
                            { text: (certificateData.intermediate[0] && certificateData.intermediate[0].title) ? certificateData.intermediate[0].title : '(Appointment)', italics: (certificateData.intermediate[0] && certificateData.intermediate[0].title) ? false : true }
                          ],
                          fontSize: 10, margin: [20, 0, 0, 0],
                          alignment: 'center'
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Place:",
                              fontSize: 10,
                              margin: [0, 13, 0, 0]
                            }, {
                              text: (certificateData.intermediate[0] && certificateData.intermediate[0].auditPlace) ? certificateData.intermediate[0].auditPlace : '   ',
                              fontSize: 10,
                              margin: [5, 10, 0, 0]
                            }
                          ], margin: [0, -3, 0, 0]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Date:",
                              fontSize: 10,
                              margin: [0, 30, 0, 0]
                            }, {
                              text: (certificateData.intermediate[0] && certificateData.intermediate[0].issuerSignDate) ? certificateData.intermediate[0].issuerSignDate.replace(/^0+/, '') : '    ',
                              fontSize: 10,
                              margin: [5, 25, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                ]
              }, layout: 'noBorders'
            }
          ]
        })
        docDef.content.push({
          text: '(Seal or stamp of issuing authority, as appropriate)' + '\n\n',
          fontSize: 10,
          italics: true,
          margin: [30, 10, 0, 0]
        })
        if ((intermediateCross)) {
          docDef.content.push({
            columns: [{
              width: '*',
              text: 'VERIFICATION PREVIOUSLY CARRIED OUT',
              fontSize: 15,
              absolutePosition: { x: 175, y: 205 }
            }]
          });
          docDef.content.push({
            canvas: [{
              type: 'line',
              x1: 20,
              y1: -15,
              x2: 510,
              y2: -148,
              lineWidth: 1
            }]
          });
        }
        // end

        // ISPS Additional Starts here... (1)
        docDef.content.push({
          text: '\nENDORSEMENT FOR ADDITIONAL VERIFICATIONS \n\n\n',
          bold: true,
          fontSize: 10,
          alignment: 'center',
          margin: [0, -15, 0, 10]
        });

        if (certificateData.additional1[0] || certificateData.additional1.length == 0) {
          var AdditionalsealContent = '';
          AdditionalsealContent = certificateData.additional1[0] ? certificateData.additional1[0].sealImage : _that.images['transparent'];
          docDef.content.push({
            alignment: 'justify',
            columns: [
              {
                width: 215,
                stack: [
                  {
                    text: [
                      { text: "Additional Verification*:\n" }
                    ], fontSize: 10, margin: [30, 0, 0, 0]
                  }, {
                    image: AdditionalsealContent,
                    width: 70,
                    height: 70,
                    margin: [45, 17, 0, 0]
                  }
                ]
              },
              {
                width: '*',
                table: {
                  body: [
                    [
                      {
                        stack: [
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Signed:", fontSize: 10
                              }, {
                                image: (certificateData.additional1[0] && certificateData.additional1[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.additional1[0].issuerSign : _that.images['transparent'],
                                width: 150,
                                height: 20,
                                margin: [45, -15, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }, {
                            text: [
                              { text: (certificateData.additional1[0] && certificateData.additional1[0].nameToPrint === 1) ? certificateData.additional1[0].issuerName + '\n' : '(Name)\n', italics: (certificateData.additional1[0] && certificateData.additional1[0].nameToPrint === 1 && certificateData.additional1[0].issuerName) ? false : true },
                              { text: (certificateData.additional1[0] && certificateData.additional1[0].title) ? certificateData.additional1[0].title : '(Appointment)', italics: (certificateData.additional1[0] && certificateData.additional1[0].title) ? false : true }
                            ],
                            fontSize: 10, margin: [20, 0, 0, 0],
                            alignment: 'center'
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Place:",
                                fontSize: 10,
                                margin: [0, 13, 0, 0]
                              }, {
                                text: (certificateData.additional1[0] && certificateData.additional1[0].auditPlace) ? certificateData.additional1[0].auditPlace : '     ',
                                fontSize: 10,
                                margin: [5, 10, 0, 0]
                              }
                            ], margin: [0, -3, 0, 0]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Date:",
                                fontSize: 10,
                                margin: [0, 30, 0, 0]
                              }, {
                                text: (certificateData.additional1[0] && certificateData.additional1[0].issuerSignDate) ? certificateData.additional1[0].issuerSignDate.replace(/^0+/, '') : '   ',
                                fontSize: 10,
                                margin: [5, 25, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  ]
                }, layout: 'noBorders'
              }
            ]
          })
          docDef.content.push({
            text: '(Seal or stamp of issuing authority, as appropriate)' + '\n\n',
            fontSize: 10,
            italics: true,
            margin: [30, 10, 0, 0]
          })
          if (additionalCross1) {
            docDef.content.push({
              columns: [{
                width: '*',
                text: 'VERIFICATION PREVIOUSLY CARRIED OUT',
                fontSize: 15,
                absolutePosition: { x: 175, y: 357 }
              }]
            });
            docDef.content.push({
              canvas: [{
                type: 'line',
                x1: 20,
                y1: -15,
                x2: 510,
                y2: -148,
                lineWidth: 1
              }]
            });
          }
        }

        // ISPS Additional Starts here... (2)

        if (certificateData.additional2[0] || certificateData.additional2.length == 0) {
          var AdditionalsealContent2 = '';
          AdditionalsealContent2 = certificateData.additional2[0] ? certificateData.additional2[0].sealImage : _that.images['transparent'];

          docDef.content.push({
            alignment: 'justify',
            columns: [
              {
                width: 215,
                stack: [
                  {
                    text: [
                      { text: "Additional Verification*:\n" }
                    ], fontSize: 10, margin: [30, 0, 0, 0]
                  }, {
                    image: AdditionalsealContent2,
                    width: 70,
                    height: 70,
                    margin: [45, 17, 0, 0]
                  }
                ]
              },
              {
                width: '*',
                table: {
                  body: [
                    [
                      {
                        stack: [
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Signed:", fontSize: 10
                              }, {
                                image: (certificateData.additional2[0] && certificateData.additional2[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.additional2[0].issuerSign : _that.images['transparent'],
                                width: 150,
                                height: 20,
                                margin: [45, -15, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }, {
                            text: [
                              { text: (certificateData.additional2[0] && certificateData.additional2[0].nameToPrint === 1) ? certificateData.additional2[0].issuerName + '\n' : '(Name)\n', italics: (certificateData.additional2[0] && certificateData.additional2[0].nameToPrint === 1 && certificateData.additional2[0].issuerName) ? false : true },
                              { text: (certificateData.additional2[0] && certificateData.additional2[0].title) ? certificateData.additional2[0].title : '(Appointment)', italics: (certificateData.additional2[0] && certificateData.additional2[0].title) ? false : true }
                            ],
                            fontSize: 10, margin: [20, 0, 0, 0],
                            alignment: 'center'
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Place:",
                                fontSize: 10,
                                margin: [0, 13, 0, 0]
                              }, {
                                text: (certificateData.additional2[0] && certificateData.additional2[0].auditPlace) ? certificateData.additional2[0].auditPlace : '     ',
                                fontSize: 10,
                                margin: [5, 10, 0, 0]
                              }
                            ], margin: [0, -3, 0, 0]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Date:",
                                fontSize: 10,
                                margin: [0, 30, 0, 0]
                              }, {
                                text: (certificateData.additional2[0] && certificateData.additional2[0].issuerSignDate) ? certificateData.additional2[0].issuerSignDate.replace(/^0+/, '') : '   ',
                                fontSize: 10,
                                margin: [5, 25, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  ]
                }, layout: 'noBorders'
              }
            ]
          })
          docDef.content.push({
            text: '(Seal or stamp of issuing authority, as appropriate)' + '\n\n',
            fontSize: 10,
            italics: true,
            margin: [30, 10, 0, 0]
          })
          if (additionalCross2) {

            docDef.content.push({
              columns: [{
                width: '*',
                text: 'VERIFICATION PREVIOUSLY CARRIED OUT',
                fontSize: 15,
                absolutePosition: { x: 175, y: 490 }
              }]
            });
            docDef.content.push({
              canvas: [{
                type: 'line',
                x1: 20,
                y1: -15,
                x2: 510,
                y2: -148,
                lineWidth: 1
              }]
            });
          }
        }

        // ISPS Additional Starts here... (3)

        if (certificateData.additional3[0] || certificateData.additional3.length == 0) {
          var AdditionalsealContent1 = '';
          AdditionalsealContent1 = certificateData.additional3[0] ? certificateData.additional3[0].sealImage : _that.images['transparent'];

          docDef.content.push({
            alignment: 'justify',
            columns: [
              {
                width: 215,
                stack: [
                  {
                    text: [
                      { text: "Additional Verification*:\n" }
                    ], fontSize: 10, margin: [30, 0, 0, 0]
                  }, {
                    image: AdditionalsealContent1,
                    width: 70,
                    height: 70,
                    margin: [45, 17, 0, 0]
                  }
                ]
              },
              {
                width: '*',
                table: {
                  body: [
                    [
                      {
                        stack: [
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Signed:", fontSize: 10
                              }, {
                                image: (certificateData.additional3[0] && certificateData.additional3[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.additional3[0].issuerSign : _that.images['transparent'],
                                width: 150,
                                height: 20,
                                margin: [45, -15, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }, {
                            text: [
                              { text: (certificateData.additional3[0] && certificateData.additional3[0].nameToPrint === 1) ? certificateData.additional3[0].issuerName + '\n' : '(Name)\n', italics: (certificateData.additional3[0] && certificateData.additional3[0].nameToPrint === 1 && certificateData.additional3[0].issuerName) ? false : true },
                              { text: (certificateData.additional3[0] && certificateData.additional3[0].title) ? certificateData.additional3[0].title : '(Appointment)', italics: (certificateData.additional3[0] && certificateData.additional3[0].title) ? false : true }
                            ],
                            fontSize: 10, margin: [20, 0, 0, 0],
                            alignment: 'center'
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Place:",
                                fontSize: 10,
                                margin: [0, 13, 0, 0]
                              }, {
                                text: (certificateData.additional3[0] && certificateData.additional3[0].auditPlace) ? certificateData.additional3[0].auditPlace : '     ',
                                fontSize: 10,
                                margin: [5, 10, 0, 0]
                              }
                            ], margin: [0, -3, 0, 0]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Date:",
                                fontSize: 10,
                                margin: [0, 30, 0, 0]
                              }, {
                                text: (certificateData.additional3[0] && certificateData.additional3[0].issuerSignDate) ? certificateData.additional3[0].issuerSignDate.replace(/^0+/, '') : '   ',
                                fontSize: 10,
                                margin: [5, 25, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  ]
                }, layout: 'noBorders'
              }
            ]
          })
          docDef.content.push({
            text: '(Seal or stamp of issuing authority, as appropriate)' + '\n\n',
            fontSize: 10,
            italics: true,
            margin: [30, 10, 0, 0]
          })
          if (additionalCross3) {
            docDef.content.push({
              columns: [{
                width: '*',
                text: 'VERIFICATION PREVIOUSLY CARRIED OUT',
                fontSize: 15,
                absolutePosition: { x: 175, y: 622 }
              }]
            });
            docDef.content.push({
              canvas: [{
                type: 'line',
                x1: 20,
                y1: -15,
                x2: 510,
                y2: -148,
                lineWidth: 1
              }]
            });
          }
        }
        docDef.content.push({
          text: "*This part of the certificate shall be adapted by the Administration to indicate whether it has established additional verifications as provided for in section 19.1.1.4.",
          fontSize: 9,
          alignment: 'justify',
          margin: [30, 0, 30, 0]
        })
        docDef.content.push(voidStatus == true ? {//ism initial second page
          canvas: [{
            type: 'line',
            x1: 0,
            y1: -40,
            x2: 525,
            y2: -765,
            color: 'red',
            lineWidth: 2
          }
          ],
          absolutePosition: { x: 45, y: 800 }
        } : {})

        docDef.content.push({ text: footerNote, absolutePosition: { x: 480, y: 740 }, fontSize: 9 });
        // Next Page
        docDef.content.push({
          columns: [{
            columns: [[{
              text: 'Certificate Number',
              fontSize: 10,
              pageBreak: 'before',
              margin: [435, 0, 0, 0]
            }, {
              table: {
                widths: [80],
                body: [[voluntaryCert ? certificateData.certificateNo.replace("H", "HV") : certificateData.certificateNo]]
              },
              margin: [427, 2, 0, 0], fontSize: 8
            }]],
            width: 'auto',
          }]
        }, {

          stack: [
            {
              canvas: [
                {
                  type: 'rect',
                  x: 5, y: 693,
                  w: 525,
                  h: -727,
                  fillOpacity: 0.5,
                  lineWidth: 2
                }
              ]
            },
            {
              canvas: [
                {
                  type: 'rect',
                  x: 0, y: 698,
                  w: 535,
                  h: -737,
                  fillOpacity: 0.5
                }
              ]
            }]
        });


        var ismendorsecontent2 = '\nENDORSEMENT WHERE THE RENEWAL VERIFICATION HAS BEEN COMPLETED AND SECTION A/19.3.4 OF THE ISPS CODE APPLIES';

        docDef.content.push({
          text: ismendorsecontent2 + '\n\n',
          fontSize: 10,
          bold: true, alignment: 'center',
          margin: [10, 0]
        });
        var renewalDate = (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].extendedExpireDate) ? certificateData.renewalEndorse2[0].extendedExpireDate : '[DATE]'
        var ismendorsecontent3 = 'The ship complies with the relevant provisions of Part A of the ISPS Code, and the Certificate shall, in accordance with section 19.3.4 of part A of the ISPS Code, be accepted as valid until ';
        var ismendorsecontent4 = renewalDate.replace(/^0+/, '');
        docDef.content.push({
          text: [
            { text: ismendorsecontent3 },
            { text: ismendorsecontent4 + '.', /*italics:(ismendorsecontent4 == '[DATE]')?true:false*/ }
          ],
          fontSize: 10,
          margin: [30, 10, 30, 15]
        });

        // Renewal Endorsement start

        var renewalsealContent = '';
        renewalsealContent = certificateData.renewalEndorse2[0] ? certificateData.renewalEndorse2[0].sealImage : _that.images['transparent'];

        docDef.content.push({
          alignment: 'justify',
          columns: [
            {
              width: 215,
              stack: [
                {
                  text: [
                    { text: "Endorsement:" },
                  ], fontSize: 10, margin: [30, 0, 0, 0]
                }, {
                  image: renewalsealContent,
                  width: 70,
                  height: 70,
                  margin: [45, 10, 0, 0]
                }
              ]
            },
            {
              width: '*',
              table: {
                body: [
                  [
                    {
                      stack: [
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Signed:", fontSize: 10
                            },
                            {
                              image: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.renewalEndorse2[0].issuerSign : _that.images['transparent'],
                              width: 150,
                              height: 20,
                              margin: [45, -15, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        }, {
                          text: [
                            { text: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].nameToPrint === 1) ? certificateData.renewalEndorse2[0].issuerName + '\n' : '(Name)\n', italics: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].nameToPrint === 1 && certificateData.renewalEndorse2[0].issuerName) ? false : true },
                            { text: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].title) ? certificateData.renewalEndorse2[0].title : '(Appointment)', italics: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].title) ? false : true }
                          ],
                          fontSize: 10, margin: [20, 0, 0, 0],
                          alignment: 'center'
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Place:",
                              fontSize: 10,
                              margin: [0, 13, 0, 0]
                            }, {
                              text: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].auditPlace) ? certificateData.renewalEndorse2[0].auditPlace : '   ',
                              fontSize: 10,
                              margin: [5, 10, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Date:",
                              fontSize: 10,
                              margin: [0, 30, 0, 0]
                            }, {
                              text: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].issuerSignDate) ? certificateData.renewalEndorse2[0].issuerSignDate.replace(/^0+/, '') : '    ',
                              fontSize: 10,
                              margin: [5, 25, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                ]
              }, layout: 'noBorders'
            }
          ]
        })
        docDef.content.push({
          text: '(Seal or stamp of issuing authority, as appropriate)' + '\n\n',
          fontSize: 10,
          italics: true,
          margin: [30, 10, 0, 0]
        })
        //end

        var endorseExtendContent = 'ENDORSEMENT TO EXTEND THE VALIDITY OF THE CERTIFICATE UNTIL REACHING THE PORT OF VERIFICATION WHERE SECTION A/19.3.5 OF THE ISPS CODE APPLIES OR FOR A PERIOD OF GRACE WHERE SECTION A/19.3.6 OF THE ISPS CODE APPLIES ';

        docDef.content.push({
          text: endorseExtendContent + '\n\n',
          fontSize: 10,
          bold: true,
          margin: [20, 0],
          alignment: 'center'
        });
        var extensionDate = (certificateData.extension[0] && certificateData.extension[0].extendedExpireDate) ? certificateData.extension[0].extendedExpireDate : '(Date)'
        var endorseExtendContent1 = 'This Certificate shall, in accordance with section 19.3.5/19.3.6 of part A of the ISPS Code, be accepted as valid until ';
        docDef.content.push({
          text: [
            { text: "This Certificate shall, in accordance with section 19.3.5/19.3.6 of part A of the ISPS Code, be accepted as valid until " },
            { text: extensionDate.replace(/^0+/, '') + '.', italics: (extensionDate == '(Date)') ? true : false }
          ],
          fontSize: 10,
          margin: [30, 0, 30, 20]
        });
        // extension start

        if (certificateData.crossLineStatus == "extent-inactive" || certificateData.crossLineStatus == "inactive") {

          if (certificateData.currentCertiObj.certIssueId == 1002) {
            console.log("extent-inactive");
            certificateData.extension.length = 0;
          } else if (certificateData.currentCertiObj.seqNo < (certificateData.extension[0] && certificateData.extension[0].seqNo)) {
            console.log("t-inactive");
            certificateData.extension.length = 0;
          }
        }

        var renewalsealContent1 = '';

        renewalsealContent1 = certificateData.extension[0] ? certificateData.extension[0].sealImage : _that.images['transparent'];
        docDef.content.push({
          alignment: 'justify',
          columns: [
            {
              width: 215,
              stack: [
                {
                  text: [
                    { text: "Endorsement to Extend:" },
                  ], fontSize: 10, margin: [30, 0, 0, 0]
                }, {
                  image: renewalsealContent1,
                  width: 70,
                  height: 70,
                  margin: [45, 10, 0, 0]
                }
              ]
            },
            {
              width: '*',
              table: {
                body: [
                  [
                    {
                      stack: [
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Signed:", fontSize: 10
                            }, {
                              image: (certificateData.extension[0] && certificateData.extension[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.extension[0].issuerSign : _that.images['transparent'],
                              width: 150,
                              height: 20,
                              margin: [45, -15, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        }, {
                          text: [
                            { text: (certificateData.extension[0] && certificateData.extension[0].nameToPrint === 1) ? certificateData.extension[0].issuerName + '\n' : '(Name)\n', italics: (certificateData.extension[0] && certificateData.extension[0].nameToPrint === 1 && certificateData.extension[0].issuerName) ? false : true },
                            { text: (certificateData.extension[0] && certificateData.extension[0].title) ? certificateData.extension[0].title : '(Appointment)', italics: (certificateData.extension[0] && certificateData.extension[0].title) ? false : true }
                          ],
                          fontSize: 10, margin: [20, 0, 0, 0],
                          alignment: 'center'
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Place:",
                              fontSize: 10,
                              margin: [0, 13, 0, 0]
                            }, {
                              text: (certificateData.extension[0] && certificateData.extension[0].auditPlace) ? certificateData.extension[0].auditPlace : '   ',
                              fontSize: 10,
                              margin: [5, 10, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Date:",
                              fontSize: 10,
                              margin: [0, 30, 0, 0]
                            }, {
                              text: (certificateData.extension[0] && certificateData.extension[0].issuerSignDate) ? certificateData.extension[0].issuerSignDate.replace(/^0+/, '') : '    ',
                              fontSize: 10,
                              margin: [5, 25, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                ]
              }, layout: 'noBorders'
            }
          ]
        })
        docDef.content.push({
          text: '(Seal or stamp of issuing authority, as appropriate)' + '\n\n',
          fontSize: 10,
          italics: true,
          margin: [30, 10, 0, 0]
        })
        // end
        /*docDef.content.push({
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0,
              x2: 490, y2: 0,
              lineWidth: 1
            }
          ],
          margin: [20, 140, 0, 0]
        });*/





      }
      console.log(docDef.content);


      //renewal endorsement cross line of isps
      docDef.content.push(voidStatus == true ? {
        canvas: [{
          type: 'line',
          x1: 10,
          y1: 90,
          x2: 530,
          y2: -622,
          color: 'red',
          lineWidth: 2
        }
        ]
      } : {});

      docDef.content.push({ text: footerNote, absolutePosition: { x: 480, y: 725 }, fontSize: 9 });

      pdfMake.createPdf(docDef, "", "", this.fonts).getBlob(data => {
        this.fileManager.checkPdfDirectory().then(() => {
          this.fileManager.writePdfInTheDirectory(
            data,
            "" + certificateData.certificateNo + ".pdf",
            "Certificate"
          ).then(() => {
            this.fileManager.openPdf("" + certificateData.certificateNo + ".pdf").then(() => {
              resolve({ data: "Success" });
            });
          });
        });
      });
      this.loader.hideLoader();
    });
  }
  /**
   * mlcPdfService
   */
  public mlcPdfService(certificateData) {
    return new Promise<Object>((resolve, reject) => {
      this.loader.showLoader("PreparingCertificate");
      console.log(certificateData);
      let _that = this;


      console.log(certificateData);

      var tempcertificateHead, voidStatus, tempcertificatetype, audittype, auditsubtypeidCaps, auditsubtypeidsmall, headSubTitle, cmpnytype, nmecompny = "", shipType = "Type of Ship", Grt = "Gross Tonnage:", signaturetext = "Signature of the duly authorized official issuing the Certificate", subsequentCertificate = "No";
      var voluntaryCert = certificateData.voluntaryCert;
      if (certificateData.AuditStatusId == this.appConstant.VOID_AUDIT_STATUS || certificateData.auditSummarId === 1005 || certificateData.res.activeStatus === 0) {
        voidStatus = true;
      }
      if (certificateData.auditSubTypeId == this.appConstant.INTERIM_SUB_TYPE_ID) {
        auditsubtypeidCaps = "INTERIM";
        auditsubtypeidsmall = "Interim"
      } else {
        auditsubtypeidCaps = "";
        auditsubtypeidsmall = ""
      }

      tempcertificateHead = "" + auditsubtypeidsmall
        + " Maritime Labour Certificate";

      tempcertificatetype = "" + auditsubtypeidsmall
        + " Maritime Labour Certificate";

      tempcertificateHead = voluntaryCert ? auditsubtypeidsmall + " Voluntary Statement of Compliance" : tempcertificateHead



      audittype = "MLC";

      headSubTitle = certificateData.headSubTitlemlc;
      var mlcIntialContent = "THIS IS TO CERTIFY THAT: ";

      var mlcContent1 = "this ship has been inspected and verified to be in compliance with the requirements of the Convention and the provisions of the attached Declaration of Maritime Labour Compliance; and ";

      var mlcContent2 = "the seafarers’ working and living conditions specified in Appendix A5-I of the Convention were found to correspond to the Republic of the Marshall Islands’ national requirements implementing the Convention. These national requirements are summarized in the Declaration of Maritime Labour Compliance, Part I. \n";

      var expiryDate = certificateData.expirydate ? certificateData.expirydate : '(Date)';

      var place = certificateData.auditplace = certificateData.auditplace ? certificateData.auditplace : '(Location)';

      var issueDate = certificateData.certIssueDate = certificateData.certIssueDate ? certificateData.certIssueDate : '(Date)';

      var auditDate = certificateData.auditDate ? certificateData.auditDate : '(Date)';

      var issueDate = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].completionDate : certificateData.certificateDetails[0].completionDate;
      var finalIssuedDateAudit = '(Date)';

      if (issueDate != 'N.A') {
        if (moment(issueDate, 'YYYY-MM-DD', true).isValid())
          finalIssuedDate = moment(issueDate, 'YYYY-MM-DD').format('DD MMMM YYYY');
        else if (moment(issueDate, 'DD-MMM-YYYY', true).isValid())
          finalIssuedDate = moment(issueDate, 'DD-MMM-YYYY').format('DD MMMM YYYY');//date formate is changed by lokesh for jira_id)(900)
        else
          finalIssuedDate = issueDate;
      }
      else {
        finalIssuedDateAudit = '(Date)'

      } 

      var dmlcIssuePlace = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].dmlcIssuePlace : (certificateData.certificateDetails[0] ? certificateData.certificateDetails[0].dmlcIssuePlace : '(Location)');
      
      console.log("dmlcIssuePlace",dmlcIssuePlace)
      
      if (dmlcIssuePlace == 'N.A')
        dmlcIssuePlace = '(Location)';
      var place = certificateData.auditplace = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].auditPlace : certificateData.auditplace ? certificateData.auditplace : '(Location)';
      var issueDate = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].dmlcIssueDate : certificateData.certificateDetails[0] ? certificateData.certificateDetails[0].dmlcIssueDate : 'N.A';
      var finalIssuedDate = '(Date)';
      if (issueDate != 'N.A') {
        var issuedDayDmlc = issueDate;
        finalIssuedDate = issuedDayDmlc;
      }

      var issueDate = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].completionDate : certificateData.certificateDetails[0].completionDate;
      var finalIssuedDateAudit = '(Date)';

      if (issueDate != 'N.A') {
        if (moment(issueDate, 'YYYY-MM-DD', true).isValid())
          finalIssuedDate = moment(issueDate, 'YYYY-MM-DD').format('DD MMMM YYYY');//date formate is changed by lokesh for jira_id)(900)
        else if (moment(issueDate, 'DD-MMM-YYYY', true).isValid())
          finalIssuedDate = moment(issueDate, 'DD-MMM-YYYY').format('DD MMMM YYYY');//date formate is changed by lokesh for jira_id)(900)
        else
          finalIssuedDate = issueDate;
      }
      else {
        finalIssuedDateAudit = '(Date)'

      }

      var mlcValidity = 'This Certificate is valid until '
        + moment(certificateData.expirydate, 'YYYY-MM-DD').format('DD MMMM YYYY')
        + ', subject to inspections in accordance with Standards A5.1.3 and A5.1.4 of the Convention. ';

      var mlcValidity1 = 'This Certificate is valid only when the Declaration of Maritime Labour Compliance issued at ' + dmlcIssuePlace + ' on ' + finalIssuedDate + ' is attached.';

      var mlcComplition = 'Completion date of the inspection on which this Certificate is based: ' + finalIssuedDateAudit + '.'


      var issuedDay = this.dateSuffix(Number(moment(certificateData.certIssueDate, 'YYYY-MM-DD').format('DD MMMM YYYY')
        .split(' ')[0]));

      var issuedDay1 = issuedDay ? issuedDay : '(Day)';

      var issuedMonth = moment(certificateData.certIssueDate, 'YYYY-MM-DD').format('DD MMMM YYYY').split(' ')[1];

      var issuedMonth1 = issuedMonth ? issuedMonth : '(Month';

      var issuedYear = moment(certificateData.certIssueDate, 'YYYY-MM-DD').format('DD MMMM YYYY').split(' ')[2];

      var issuedYear1 = issuedYear ? issuedYear : 'Year)';

      var certificateAuthority = 'Issued by the authority of the Republic of the Marshall Islands Maritime Administrator at \n'
        + certificateData.auditplace
        + ' this '
        + issuedDay1
        + ' day of ' + issuedMonth1 + ", " + issuedYear1 + '.';

      var footerNote;

      if (certificateData.auditSubTypeId == this.appConstant.INTERIM_SUB_TYPE_ID) {
        footerNote = voluntaryCert ? "MSC-400IV Rev. 10/19" : "MSC-400I Rev. 2/18";

      } else if (certificateData.auditSubTypeId == this.appConstant.INITIAL_SUB_TYPE_ID
        || certificateData.auditSubTypeId == this.appConstant.RENEWAL_SUB_TYPE_ID
        || certificateData.auditSubTypeId == this.appConstant.INTERMEDIATE_SUB_TYPE_ID
        || certificateData.auditSubTypeId == this.appConstant.ADDITIONAL_SUB_TYPE_ID) {

        footerNote = voluntaryCert ? "MSC-400JV Rev. 10/19" : "MSC-400J Rev. 2/18";
      }

      cmpnytype = "Shipowner"

      nmecompny = "Name and Address of the " + cmpnytype + "";

      var docDef: any = {};

      if (certificateData.auditSubTypeId == this.appConstant.INTERIM_SUB_TYPE_ID) {

        docDef = {
          ownerPassword: '123456',
          permissions: {
            printing: 'highResolution',
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: false,
            documentAssembly: false
          },

          defaultStyle: {
            //font: 'Times'
          },
          pageSize: 'Letter',

          /*header : {
            columns : [ {
              width : 80,
              text : ''
            }, {
              width : '*',
              text : ''
            }, {
              columns : [ [ {
                text : 'Certificate Number',
                fontSize : 10,
                margin : [ 5, 0 ]
              }, {
                table : {
                  body : [ [ certificateData.certificateNo ] ]
                },
                margin : [ 20, 2 ]
              } ] ],
              width : 'auto',
              margin : [ 40, 5 ],
            } ]
          },*/

          footer: {
            text: footerNote,
            alignment: 'right',
            margin: [50, -5],//modified by lokesh for jira_id(676)
            fontSize: 10
          },

          content: [],
          // pageMargins: [5, 5, 5, 5],
          background: function (currentPage, pageSize) {
            return {
              image: _that.images['watermark'],
              width: 300,
              absolutePosition: {
                x: 150,
                y: 260
              },
              opacity: 0.7
            }
          },
          styles: {
            rightme: {
              alignment: 'center',
              margin: [0, 10]
            },
            header: {
              fontSize: 16,
              bold: true
            }
          }
        };
        docDef.content.push({
          columns: [{
            image: '',
            width: 80,
            height: 80,
            margin: [10, 15, 0, 0]
          }, {
            width: 350,
            margin: [0, 10, 25, 0],//modified by lokesh for jira_id(806)
            text: [{
              text: 'Republic of the Marshall Islands\n',
              fontSize: 23,
              bold: true,
              color: '#525252', style: 'rightme'
            }, {
              text: 'Maritime Administrator\n',
              fontSize: 14,
              bold: true,
              color: '#666666', style: 'rightme'
            }, {
              text: tempcertificateHead + '\n',
              fontSize: 17,
              bold: true,
              color: '#666666', style: 'rightme'
            },
            {
              text: 'Issued under the provisions of Article V and Title 5 of the\n  Maritime Labour Convention, 2006 \n(referred to below as the "Convention")' + '\n\n',
              fontSize: 10,
              color: 'black',
              alignment: 'center',
            },
            {
              text: 'Under the authority of the Government of the Republic of the Marshall Islands\n',
              fontSize: 10,
              color: 'black',
              alignment: 'center', margin: [0, 10, 0, 0]
            }]

          }, {
            columns: [[{
              text: 'Certificate Number',
              fontSize: 10,
              margin: [1, 0, 0, 0]
            }, {
              table: {
                widths: [80],
                body: [[voluntaryCert ? certificateData.certificateNo.replace("I", "IV") : certificateData.certificateNo]]
              },
              margin: [-3, 2, 0, 0], fontSize: 8
            }, {
              qr: certificateData.qrCodeUrl,
              fit: 100,
              margin: [1, 10, 0, 0]
              /*image:certificateData.QrC,
              width : 60,
              height : 60,
              margin : [ 12, 10,0,0 ]*/
            }]],
            width: 'auto'
          }]
        });

        docDef.content[0].columns[0].image = _that.images['logo'];

        docDef.content
          .push({
            text: [
              /*{
                text : certificateData.HeadSubTitle
                    + '\n',
                fontSize : 9,
                color : 'black',
                //alignment : 'center',
                //margin:[0,-90,0,0],
                absolutePosition: {x:80, y:50}
              },
              {
                text : certificateData.headSubTitlemlc
                    + '\n',
                fontSize : 9,
                color : 'black',
                alignment : 'center'
              },
              {
                text : certificateData.headSubTitle2
                    + '\n',
                fontSize : 9,
                color : 'black',
                alignment : 'center',
                //absolutePosition: {x:80, y:50}
                //margin:[0,-30,0,0]
              },
              {
                text : 'Under the authority of the Government of the Republic of the Marshall Islands\n\n',
                fontSize : 9,
                color : 'black',
                alignment : 'center'
              }*/ ]
          });
        docDef.content.push({
          text: 'Particulars of the Ship:',
          bold: true,
          fontSize: 10,
          margin: [20, 10]
        });

        docDef.content.push([{

          margin: [20, 0, 0, 0],
          table: {
            widths: [155, 315],
            heights: [0, 0],
            body: [
              [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: "Name of Ship:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: certificateData.vesselName, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: 'Distinctive Number or Letters:', fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [{ text: certificateData.officialNo, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "Port of Registry:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.portofreg, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "Date of Registry:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.dateOfReg, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "Gross Tonnage :", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.grt, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "IMO No.:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.vesselImoNo, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "Type of Ship:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.shiptype, fontSize: 10, bold: false }]


                }
              ]]
          },
          layout: 'noBorders'
        }

        ])


        docDef.content.push({
          text: "Name and Address of the Shipowner  :",
          bold: true,
          fontSize: 10,
          margin: [20, 10, 0, 0]
        });



        docDef.content.push([{

          margin: [20, 0, 0, 0],
          table: {
            widths: [155, 300],
            heights: [20, 40],
            body: [
              [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: 'Shipowner Name:', fontSize: 10 }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.companyname, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "Shipowner Address:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.companyaddress, fontSize: 10, bold: false }]


                }
              ]]
          },
          layout: 'noBorders'
        }

        ])

        docDef.content.push({ // to draw a horizontal line
          canvas: [{
            type: 'line',
            x1: 15,
            y1: 5,
            x2: 520,
            y2: 5,
            lineWidth: 2
          }]
        });


        docDef.content.push({
          text: "THIS IS TO CERTIFY, for the purpose of Standard A5.1.3, paragraph 7, of the Convention, that:",
          margin: [20, 2, 10, 0],
          bold: true,
          fontSize: 10
        });

        docDef.content.push({
          type: 'lower-alpha',
          ol: [
            'this ship has been inspected, as far as reasonable and practicable, for the matters listed in Appendix A5-I to the Convention, taking into account verification of items under (b), (c) and (d) below;',
            'the shipowner has demonstrated to the competent authority or Recognized Organization that the ship has adequate procedures to comply with the Convention;',
            'the Master is familiar with the requirements of the Convention and the responsibilities for implementation; and',
            'relevant information has been submitted to the competent authority or Recognized Organization to produce a Declaration of Maritime Labour Compliance.'
          ], fontSize: 9, alignment: 'justify', margin: [20, 7, 20, 0]
        }
        );

        docDef.content.push({
          text: ['\n' + mlcValidity + ' Completion date of the inspection referred to under (a) above was ' + auditDate.replace(/^0+/, '') + '.' + '\n\n'],
          margin: [20, 0],
          fontSize: 9, alignment: 'justify'
        });


        docDef.content.push({
          /*text : [ '' + mlcValidity1 + '\n\n' ],
          margin : [ 20, 0 ],
          fontSize : 10,alignment:'justify'*/
        });


        docDef.content.push({
          text: [],
          fontSize: 10, alignment: 'justify'
        });


        docDef.content.push({
          text: ['' + certificateAuthority + '\n'],
          margin: [155, 0, 0, 0],
          fontSize: 9
        });

        docDef.content.push({
          columns: [{
            image: '',
            width: 80,
            height: 80,
            margin: [45, -20, 0, 0]
          }, {
            width: '*',
            text: []
          }, {
            columns: [[{
              text: ['\n\n']
            }
              , {
              image: '',
              width: 150,
              height: 30,
              margin: [0, 0, 60, 0]
            }
            ]],
            width: 'auto'
          }]
        })

        docDef.content[13].columns[0].image = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].sealImage : _that.images['transparent'];
        docDef.content[13].columns[2].columns[0][1].image = certificateData.currInitialPage[0] && certificateData.currInitialPage[0].signToPrint == 1 ? "data:image/png;base64,"
          + certificateData.currInitialPage[0].issuerSign : _that.images['transparent'];

        docDef.content.push({
          columns: [{
            width: '*',
            text: certificateData.sealcontent + '\n',
            fontSize: 9, margin: [20, 3, 0, 0]

          }, {
            canvas: [{
              type: 'line',
              x1: 0,
              y1: 10,
              x2: 250,
              y2: 10,
              lineWidth: 1
            }]
          }]
        })
        console.log(docDef.content)
        docDef.content.push({
          columns: [{
            width: '*',
            text: ['\n\n', {
              text: "Unique Tracking Number: ",
              fontSize: 10
            }, {
                text: certificateData.utn,
                bold: true,
                fontSize: 10
              }], margin: [20, 5, 0, 0]
          }, {
            width: '*',
            text: [{
              text: '',
              alignment: 'center',
              fontSize: 10,
              italics: false
            }, {
              text: '',
              alignment: 'center',
              fontSize: 9,
              italics: false
            }]
          }]
        })


        docDef.content[15].columns[1].text[0].text = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].nameFull : '(Name) \n';
        docDef.content[15].columns[1].text[0].italics = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].nameItalics : true;
        docDef.content[15].columns[1].text[1].text = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].title : '(Appointment)';
        docDef.content[15].columns[1].text[1].italics = certificateData.currInitialPage[0] ? false : true;


        docDef.content.push({
          canvas: [{
            type: 'line',
            x1: 20,
            y1: 5,
            x2: 195,
            y2: 5,
            lineWidth: 1
          }]
        })

        docDef.content.push({


          stack: [
            { text: "For ships covered by the tonnage measurement interim scheme adopted by the International Maritime Organization, the gross tonnage is that which is " + '\n', fontSize: 7, alignment: 'justify', margin: [25, 8, 20, 0] },
            { text: "included in the REMARKS column of the International Tonnage Certificate (1969).  See Article II(1)(c) of the Convention." + '\n', fontSize: 7, alignment: 'justify', margin: [21, 0, 20, 0] },
            { text: "Shipowner means the owner of the ship or another organization or person, such as the manager, agent or bareboat charterer, who has assumed the " + '\n', fontSize: 7, alignment: 'justify', margin: [25, 5, 20, 0] },
            { text: "responsibility for the operation of the ship from the owner and who, on assuming such responsibility, has agreed to take over the duties and responsibilities imposed on shipowners in accordance with this Convention, regardless of whether any other organizations or persons fulfil certain of the duties or responsibilities on behalf of the shipowner. See Article II(l)(j) of the Convention.", fontSize: 7, alignment: 'justify', margin: [21, 0, 20, 0] },
            { text: '1', absolutePosition: (certificateData.vesselName.length < 54) ? { x: 125, y: 267 } : { x: 125, y: 277 }, fontSize: 8 },
            { text: '2', absolutePosition: (certificateData.vesselName.length < 54) ? { x: 217, y: 321 } : { x: 217, y: 331 }, fontSize: 8 },
            { text: '1', margin: [20, -60, 0, 0], fontSize: 7 },
            { text: '2', absolutePosition: (certificateData.vesselName.length < 54) ? { x: 59, y: 707 } : { x: 59, y: 717 }, fontSize: 7 }
          ]

        },
          {
            stack: [
              {
                canvas: [
                  {
                    type: 'rect',
                    x: 5, y: (certificateData.vesselName.length < 54) ? 73 : 63,
                    w: 525,
                    h: -727,
                    fillOpacity: 0.5,
                    lineWidth: 2
                  }
                ]
              },
              {
                canvas: [
                  {
                    type: 'rect',
                    x: 0, y: (certificateData.vesselName.length < 54) ? 78 : 68,
                    w: 535,
                    h: -737,
                    fillOpacity: 0.5
                  }
                ]
              }, voidStatus == true ? {//ism initial second page
                canvas: [{
                  type: 'line',
                  x1: 0,
                  y1: -40,
                  x2: 525,
                  y2: -765,
                  color: 'red',
                  lineWidth: 2
                }
                ],
                absolutePosition: { x: 45, y: 798 }
              } : {}
            ]

          });
      }
      else if (certificateData.auditSubTypeId == this.appConstant.INITIAL_SUB_TYPE_ID || certificateData.auditSubTypeId == this.appConstant.RENEWAL_SUB_TYPE_ID) {
        console.log("MLC certificateData", certificateData);


        var mlcIntialContent = "THIS IS TO CERTIFY THAT: ";

        var mlcContent1 = "this ship has been inspected and verified to be in compliance with the requirements of the Convention and the provisions of the attached Declaration of Maritime Labour Compliance; and ";

        var mlcContent2 = "the seafarers’ working and living conditions specified in Appendix A5-I of the Convention were found to correspond to the Republic of the Marshall Islands’ national requirements implementing the Convention. These national requirements are summarized in the Declaration of Maritime Labour Compliance, Part I. \n";

        var expiryDate = certificateData.expirydate ? certificateData.expirydate : '(Date)';


        /* certificateData.currInitialPage[0].dmlcIssuePlace = certificateData.currInitialPage[0].dmlcIssuePlace
          ? decodeURIComponent(window.atob(certificateData.currInitialPage[0].dmlcIssuePlace)) : '(Location)';
 */
        console.log('2.certificateData.currInitialPage[0].dmlcIssuePlace',certificateData.currInitialPage[0].dmlcIssuePlace)

        certificateData.currInitialPage[0].dmlcIssueDate = (certificateData.currInitialPage[0].dmlcIssueDate != "N.A")
          ? moment(certificateData.currInitialPage[0].dmlcIssueDate, 'DD-MM-YYYY').format('DD MMMM YYYY')
          :'(Date)';

        certificateData.currInitialPage[0].completionDate = (certificateData.currInitialPage[0].completionDate != "NA")
          ? moment(certificateData.currInitialPage[0].completionDate, 'YYYY-MM-DD').format('DD MMMM YYYY')
          : 'NA';

        certificateData.currInitialPage[0].dmlcIssuePlace = certificateData.currInitialPage[0].dmlcIssuePlace 
          ? decodeURIComponent(window.atob(certificateData.currInitialPage[0].issuePlace)) : '(Location)'  //Changed by Sudharsan on 6-4-2022 for JIRA-ID MOBILE-323

        var auditPlace = certificateData.auditplace = certificateData.auditplace ? certificateData.auditplace : '(Location)';
      
        var place = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].dmlcIssuePlace : '(Location)';

        var issueDate = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].dmlcIssueDate : '(Date)';

        var mlcValidity = 'This Certificate is valid until '
          + moment(certificateData.expirydate, 'YYYY-MM-DD').format('DD MMMM YYYY')
          + ', subject to inspections in accordance with Standards A5.1.3 and A5.1.4 of the Convention. ';

        var mlcValidity1 = 'This Certificate is valid only when the Declaration of Maritime Labour Compliance issued at ' + place + ' on ' + issueDate + ' is attached.';
        let completionDate=certificateData.currInitialPage[0]&&certificateData.currInitialPage[0].completionDate&&certificateData.currInitialPage[0].completionDate!='Invalid date'? certificateData.currInitialPage[0].completionDate.replace(/^0+/, ''):certificateData.completionDate?moment(certificateData.completionDate).format('DD MMM YYYY'):''//added by lokesh for jira_id(910)
        var mlcComplition = 'Completion date of the inspection on which this Certificate is based: ' + completionDate



        var issuedDay = this.dateSuffix(Number(moment(certificateData.certIssueDate, 'YYYY-MM-DD').format('DD MMMM YYYY')
          .split(' ')[0]));

        var issuedDay1 = issuedDay ? issuedDay : '(Day)';

        var issuedMonth = moment(certificateData.certIssueDate, 'YYYY-MM-DD').format('DD MMMM YYYY').split(' ')[1];

        var issuedMonth1 = issuedMonth ? issuedMonth : '(Month';

        var issuedYear = moment(certificateData.certIssueDate, 'YYYY-MM-DD').format('DD MMMM YYYY').split(' ')[2];

        var issuedYear1 = issuedYear ? issuedYear : 'Year)';



        var certificateAuthority = 'Issued by the authority of the Republic of the Marshall Islands Maritime Administrator at \n'
          + auditPlace
          + ' this '
          + issuedDay1
          + ' day of ' + issuedMonth1 + ', ' + issuedYear1 + '.';

        var intialDescription0 = "For ships covered by the tonnage measurement interim scheme adopted by the International Maritime Organization, the gross tonnage is that which is ";
        var intialDescription1 = "included in the REMARKS column of the International Tonnage Certificate (1969).  See Article II(1)(c) of the Convention. ";

        var intialDescription2 = "  Shipowner means the owner of the ship or another organization or person, such as the manager, agent or bareboat charterer, who has assumed the ";
        var intialDescription5 = "responsibility for the operation of the ship from the owner and who, on assuming such responsibility, has agreed to take over the duties and responsibilities imposed on shipowners in accordance with this Convention, regardless of whether any other organizations or persons fulfil certain of the duties or responsibilities on behalf of the shipowner. See Article II(l)(j) of the Convention.";

        var intialDescription3 = "  See Standard A5.1.3, paragraph 10.";



        console.log(certificateData)
        var intermediateCross = false;
        var additionalCross1 = false;
        var additionalCross2 = false;
        var additionalCross3 = false;
        var withoutcross = true;


        intermediateCross = (certificateData.intermediateReissue[0]) ? certificateData.intermediateReissue[0].interReissue : false;
        additionalCross1 = (certificateData.additionalReissue1[0]) ? certificateData.additionalReissue1[0].addReissue : false;
        additionalCross2 = (certificateData.additionalReissue2[0]) ? certificateData.additionalReissue2[0].addReissue : false;
        additionalCross3 = (certificateData.additionalReissue3[0]) ? certificateData.additionalReissue3[0].addReissue : false;


        docDef = {
          ownerPassword: '123456',
          permissions: {
            printing: 'highResolution',
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: false,
            documentAssembly: false
          },

          defaultStyle: {
            // font: 'Times'
          }, pageSize: 'Letter',


          footer: {
            text: footerNote,
            alignment: 'right',
            margin: [50, -5],
            fontSize: 10
          },

          content: [],
          // pageMargins: [5, 5, 5, 5],
          background: function (currentPage, pageSize) {
            return {
              image: _that.images['watermark'],
              width: 300,
              absolutePosition: {
                x: 150,
                y: 260
              },
              opacity: 0.7
            }
          },
          styles: {
            rightme: {
              alignment: 'center',
              margin: [0, 10]
            },
            header: {
              fontSize: 16,
              bold: true
            }
          }
        };
        docDef.content.push({
          columns: [{
            image: '',
            width: 80,
            height: 80,    //changed by lokesh for jira_id(760)
            margin: [10, 15, 0, 0]
          }, {
            width: 350,
            margin: [0, 10, 30, 0],//modified by lokesh for  jira_id(836,806)
            text: [{
              text: 'Republic of the Marshall Islands\n',
              fontSize: 23,
              bold: true,
              color: '#525252', style: 'rightme'
            }, {
              text: 'Maritime Administrator\n',
              fontSize: 14,
              bold: true,
              color: '#666666', style: 'rightme'
            }, {
              text: tempcertificateHead + '\n',
              fontSize: 17,
              bold: true,
              color: '#666666', style: 'rightme'
            },
            {
              text: certificateData.HeadSubTitle + '\n\n',
              fontSize: 8,
              color: '#696969',
              alignment: 'center'
            },
            {
              text: 'Issued under the provisions of Article V and Title 5 of the\n  Maritime Labour Convention, 2006 \n(referred to below as the "Convention")' + '\n\n',
              fontSize: 9,
              color: 'black',
              alignment: 'center',
            },
            {
              text: 'Under the authority of the Government of the Republic of the Marshall Islands\n\n',
              fontSize: 9,
              color: 'black',
              alignment: 'center'
            }]

          }, {
            columns: [[{
              text: 'Certificate Number',
              fontSize: 10,
              margin: [3, 10, 0, 0]         //changed by Archana  jira ID-MOBILE-586
            }, {
              table: {
                widths: [80],
                body: [[voluntaryCert ? certificateData.certificateNo.replace("J", "JV") : certificateData.certificateNo]]
              },
              margin: [-3, 2, 0, 0], fontSize: 8
            }, {
              qr: certificateData.qrCodeUrl,
              fit: 100,
              margin: [1, 10, 0, 0]
              /*image:certificateData.QrC,
              width : 60,
              height : 60,
              margin : [ 12, 10,0,0 ]*/
            }]],
            width: 'auto'
          }]
        });

        docDef.content[0].columns[0].image = _that.images['logo'];
        docDef.content
          .push({

          });

        docDef.content.push({
          text: 'Particulars of the Ship:',
          bold: true,
          fontSize: 10,
          margin: [20, 5, 20, 10]
        });
        docDef.content.push([{

          margin: [20, 0, 0, 0],
          table: {
            widths: [155, 315],
            heights: [0, 0],
            body: [
              [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "Name of Ship:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.vesselName, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: 'Distinctive Number or Letters:', fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.officialNo, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "Port of Registry:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.portofreg, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "Date of Registry:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.dateOfReg, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "Gross Tonnage :", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.grt, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "IMO No.:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.vesselImoNo, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "Type of Ship:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.shiptype, fontSize: 10, bold: false }]


                }
              ]]
          },
          layout: 'noBorders'
        }

        ])


        docDef.content.push({
          text: "Name and Address of the Shipowner  :",
          bold: true,
          fontSize: 10,
          margin: [20, 5, 0, 0]
        });



        docDef.content.push([{

          margin: [20, 0, 0, 0],
          table: {
            widths: [155, 300],
            heights: [25, 40],
            body: [
              [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: 'Shipowner Name:', fontSize: 10 }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.companyname, fontSize: 10, bold: false }]


                }
              ], [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: "Shipowner Address:", fontSize: 10, bold: false }]
                }, {
                  border: [true, true, true, true],
                  fillColor: '',
                  /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                  text: [{ text: certificateData.companyaddress, fontSize: 10, bold: false }]


                }
              ]]
          },
          layout: 'noBorders'
        }

        ])

        docDef.content.push({ // to draw a horizontal line
          canvas: [{
            type: 'line',
            x1: 15,
            y1: 5,
            x2: 520,
            y2: 5,
            lineWidth: 2
          }]
        });


        docDef.content.push({
          text: [mlcIntialContent],
          margin: [20, 5, 20, 0],
          bold: true,
          fontSize: 9
        });

        docDef.content.push({
          fontSize: 9,
          ol: [
            { text: mlcContent1, fontSize: 9, margin: [20, 3, 20, 0], alignment: 'justify' },
            { text: mlcContent2, fontSize: 9, margin: [20, 5, 20, 0], alignment: 'justify' }

          ]

        });

        docDef.content.push({
          text: [mlcValidity + '\n'],
          margin: [20, 5, 20, 0],
          fontSize: 9, alignment: 'justify'
        });


        docDef.content.push({
          text: [mlcValidity1 + '\n'],
          margin: [20, 4, 20, 0],
          fontSize: 9, alignment: 'justify'
        });


        docDef.content.push({
          text: ['' + mlcComplition + '\n'],
          margin: [20, 4, 20, 5],
          fontSize: 9, alignment: 'justify'
        });


        docDef.content.push({
          text: ['' + certificateAuthority + '\n'],
          margin: [155, 0, 0, 0],
          fontSize: 9
        });

        docDef.content.push({
          columns: [{
            image: '',
            width: 70,
            height: 70,
            margin: [45, -20, 0, 0]
          }, {
            width: '*',
            text: []
          }, {
            columns: [[{
              text: ['\n\n']
            }
              , {
              image: '',
              width: 150,
              height: 30,
              margin: [20, -5, 60, 0]
            }
            ]],
            //width : 'auto'
          }]
        })
        //initial section
        docDef.content[13].columns[0].image = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].sealImage : _that.images['transparent'];
        docDef.content[13].columns[2].columns[0][1].image =!(certificateData.auditSubTypeId == this.appConstant.INITIAL_SUB_TYPE_ID)?
        certificateData.currInitialPage[0] && certificateData.currInitialPage[0].signToPrint == 1? "data:image/png;base64," + certificateData.currInitialPage[0].issuerSign: _that.images["transparent"]:
        ( certificateData.intermediate[0] &&certificateData.currInitialPage[0])?       (certificateData.intermediate[0] && certificateData.intermediate[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.intermediate[0].issuerSign : _that.images['transparent'] :
        certificateData.currInitialPage[0] &&
         certificateData.currInitialPage[0].signToPrint == 1
         ? "data:image/png;base64," +
         certificateData.currInitialPage[0].issuerSign
         : _that.images["transparent"]//condision changed by lokesh for jira_id(781,887)


        docDef.content.push({
          columns: [{
            width: '*',
            text: certificateData.sealcontent + '\n',
            fontSize: 9, margin: [20, 0, 0, 0]

          }, {
            canvas: [{
              type: 'line',
              x1: 0,
              y1: 5,
              x2: 250,
              y2: 5,
              lineWidth: 1
            }]
          }]
        })
        console.log(docDef.content)
        docDef.content.push({
          columns: [{
            width: '*',
            text: ['\n', {
              text: "Unique Tracking Number: ",
              fontSize: 10
            }, {
                text: certificateData.utn,
                bold: true,
                fontSize: 10
              }], margin: [20, 1, 0, 0]
          }, {
            width: '*',
            text: [{
              text: '',
              alignment: 'center',
              fontSize: 10,
              italics: false
            }, {
              text: '',
              alignment: 'center',
              fontSize: 10, italics: false
            }], margin: [0, -5, 0, 0]
          }]
        })


        //initial section name and title
        //condision changed by lokesh for jira_id(781,887)
        docDef.content[15].columns[1].text[0].text = !(certificateData.auditSubTypeId == this.appConstant.INITIAL_SUB_TYPE_ID)?
        (  certificateData.currInitialPage[0]&&certificateData.currInitialPage[0].nameToPrint===1)
           ? certificateData.currInitialPage[0].nameFull
           : "(Name) \n":(certificateData.intermediate[0]&&certificateData.currInitialPage[0])? (certificateData.intermediate[0] && certificateData.intermediate[0].nameToPrint === 1) ? certificateData.intermediate[0].issuerName + '\n' : '(Name)\n':
           (  certificateData.currInitialPage[0]&&certificateData.currInitialPage[0].nameToPrint===1)
           ? certificateData.currInitialPage[0].nameFull
           : "(Name) \n"
        docDef.content[15].columns[1].text[0].italics = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].nameItalics : true
        docDef.content[15].columns[1].text[1].text = certificateData.currInitialPage[0] ? certificateData.currInitialPage[0].title : '(Appointment)';
        docDef.content[15].columns[1].text[1].italics = certificateData.currInitialPage[0] ? false : true;


        docDef.content.push({
          canvas: [{
            type: 'line',
            x1: 20,
            y1: 0,
            x2: 195,
            y2: 0,
            lineWidth: 1
          }]
        })
        var writeRotatedText = function (text) {
          var ctx, canvas = document.createElement('canvas');
          // I am using predefined dimensions so either make this part of the arguments or change at will 
          canvas.width = 36;
          canvas.height = 270;
          ctx = canvas.getContext('2d');
          var x = new Array(text);
          for (var i = 0; i < x.length; i++) {
            var size = ctx.measureText(x[i]);
            ctx.save();
            var tx = (i * 50 + 20) + (size.width / 2);
            var ty = (50);
            ctx.translate(tx, ty);
            ctx.rotate(Math.PI / -5);
            ctx.translate(-tx, -ty);
            ctx.fillText(x[i], i * 50 + 20, 50);
            return canvas.toDataURL();
          }
        };

        docDef.content.push({
          stack: [
            { text: intialDescription0 + '\n', fontSize: 7, alignment: 'justify', margin: [25, 7, 22, 0] },
            { text: intialDescription1 + '\n', fontSize: 7, alignment: 'justify', margin: [20, 0, 22, 0] },
            { text: intialDescription2 + '\n', fontSize: 7, alignment: 'justify', margin: [25, 4, 20, 0] },
            { text: intialDescription5, fontSize: 7, alignment: 'justify', margin: [20, 0, 20, 0] },
            { text: '1', absolutePosition: (certificateData.vesselName.length < 54) ? { x: 126, y: 282 } : { x: 120, y: 285 }, fontSize: 8 },
            { text: '2', absolutePosition: (certificateData.vesselName.length < 54) ? { x: 216, y: 348 } : { x: 216, y: 334 }, fontSize: 8 },
            { text: '1', margin: [20, -59, 0, 0], fontSize: 7 },
            { text: '2', margin: [20, 15, 0, 0], fontSize: 7 }
          ]

        },
          {
            stack: [
              {
                canvas: [
                  {
                    type: 'rect',
                    x: 5, y: (certificateData.vesselName.length < 54) ? 51 : 41,
                    w: 525,
                    h: -727,
                    fillOpacity: 0.5,
                    lineWidth: 2
                  }
                ]
              },
              {
                canvas: [
                  {
                    type: 'rect',
                    x: 0, y: (certificateData.vesselName.length < 54) ? 56 : 46,
                    w: 535,
                    h: -737,
                    fillOpacity: 0.5
                  }
                ]
              },
              voidStatus == true ? {//ism initial second page
                canvas: [{
                  type: 'line',
                  x1: 0,
                  y1: -40,
                  x2: 525,
                  y2: -740,
                  color: 'red',
                  lineWidth: 2
                }
                ],
                absolutePosition: { x: 45, y: 798 }
              } : {}
            ]

          });
        var ismendorse = 'ENDORSEMENT FOR MANDATORY INTERMEDIATE INSPECTION AND, IF REQUIRED, ANY';
        var ismendorse1 = 'ADDITIONAL INSPECTION';
        docDef.content.push({
          columns: [{
            columns: [[{
              text: 'Certificate Number',
              fontSize: 10,
              pageBreak: 'before',
              margin: [435, 0, 0, 0]
            }, {
              table: {
                widths: [80],
                body: [[voluntaryCert ? certificateData.certificateNo.replace("J", "JV") : certificateData.certificateNo]]
              },
              margin: [427, 2, 0, 0], fontSize: 8
            }]],
            width: 'auto',
          }]
        }, {

          stack: [
            {
              canvas: [
                {
                  type: 'rect',
                  x: 5, y: 693,
                  w: 525,
                  h: -727,
                  fillOpacity: 0.5,
                  lineWidth: 2
                }
              ]
            },
            {
              canvas: [
                {
                  type: 'rect',
                  x: 0, y: 698,
                  w: 535,
                  h: -737,
                  fillOpacity: 0.5
                }
              ]
            }
          ]
        });
        docDef.content.push({
          text: ismendorse + '\n',
          fontSize: 10,
          bold: true,
          alignment: 'center',
          margin: [20, 5, 0, 0]
        });
        docDef.content.push({
          text: ismendorse1 + '\n',
          fontSize: 10,
          bold: true,
          alignment: 'center',
          margin: [20, 0, 0, 5]
        });

        var endorseContent = 'THIS IS TO CERTIFY THAT the ship was inspected in accordance with Standards A5.1.3 and A5.1.4 of the Convention and that the seafarers’ working and living conditions specified in Appendix A5-I of the Convention were found to correspond to the Republic of the Marshall Islands’ national requirements implementing the Convention. ';

        docDef.content.push({
          text: endorseContent + '\n\n',
          fontSize: 9,
          margin: [20, 0, 20, 10], alignment: 'justify'
        });

        // Intermediate Starts here...

        // ISM Intermediate Starts here...

        var IntermediatesealContent = '';

        IntermediatesealContent = certificateData.intermediate[0] ? certificateData.intermediate[0].sealImage : _that.images['transparent'];
        docDef.content.push({
          alignment: 'justify',
          columns: [
            {
              width: 215,
              stack: [
                {
                  text: [
                    { text: "Intermediate Inspection:\n" },
                    { text: '(to be completed between the' + '\n' + ' second and third anniversary date)', italics: true }
                  ], fontSize: 10, margin: [20, 0, 0, 0]
                }, {
                  image: IntermediatesealContent,
                  width: 70,
                  height: 70,
                  margin: [45, 0, 0, 0]
                }
              ]
            },
            {
              width: '*',
              table: {
                body: [
                  [
                    {
                      stack: [
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Signed:", fontSize: 10
                            }, {
                              image: (certificateData.intermediate[0] && certificateData.intermediate[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.intermediate[0].issuerSign : _that.images['transparent'],
                              width: 150,
                              height: 20,
                              margin: [45, -15, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        }, {
                          text: [
                            { text: (certificateData.intermediate[0] && certificateData.intermediate[0].nameToPrint === 1) ? certificateData.intermediate[0].issuerName + '\n' : '(Name)\n', italics: (certificateData.intermediate[0] && certificateData.intermediate[0].nameToPrint === 1 && certificateData.intermediate[0].issuerName) ? false : true },
                            { text: (certificateData.intermediate[0] && certificateData.intermediate[0].title) ? certificateData.intermediate[0].title : '(Appointment)', italics: (certificateData.intermediate[0] && certificateData.intermediate[0].title) ? false : true }
                          ],
                          fontSize: 10, margin: [20, 0, 0, 0],
                          alignment: 'center'
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Place:",
                              fontSize: 10,
                              margin: [0, 13, 0, 0]
                            }, {
                              text: (certificateData.intermediate[0] && certificateData.intermediate[0].auditPlace) ? certificateData.intermediate[0].auditPlace : '   ',
                              fontSize: 10,
                              margin: [5, 10, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                              width: 40,
                              text: "Date:",
                              fontSize: 10,
                              margin: [0, 30, 0, 0]
                            }, {
                              text: (certificateData.intermediate[0] && certificateData.intermediate[0].issuerSignDate) ? certificateData.intermediate[0].issuerSignDate.replace(/^0+/, '') : '    ',
                              fontSize: 10,
                              margin: [5, 25, 0, 0]
                            }
                          ]
                        },
                        {
                          columns: [
                            {
                            }, {
                              canvas: [{
                                type: 'line',
                                x1: -125,
                                y1: 10,
                                x2: 125,
                                y2: 10,
                                lineWidth: 1
                              }],
                              margin: [20, -11, 0, 0]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                ]
              }, layout: 'noBorders'
            }
          ], margin: [0, -5, 0, 0]
        })
        docDef.content.push({
          text: '(Seal or stamp of issuing authority, as appropriate)' + '\n',
          fontSize: 10,
          italics: true,
          margin: [20, 7, 0, 0]
        })
        if ((intermediateCross)) {
          docDef.content.push({
            columns: [{
              width: '*',
              text: 'VERIFICATION PREVIOUSLY CARRIED OUT',
              fontSize: 15,
              absolutePosition: { x: 175, y: 185 }
            }]
          });
          docDef.content.push({
            canvas: [{
              type: 'line',
              x1: 20,
              y1: -15,
              x2: 510,
              y2: -148,
              lineWidth: 1
            }]
          });
        }

        // MLC Additional Starts here... (1)
        docDef.content.push({
          text: 'ADDITIONAL ENDORSEMENTS (IF REQUIRED)',
          bold: true,
          fontSize: 10,
          alignment: 'center',
          margin: [20, 0, 0, 0]
        });
        var additionalEndorseContent = 'THIS IS TO CERTIFY THAT the ship was the subject of an additional inspection for the purpose of verifying that the ship continued to be in compliance with the Republic of the Marshall Islands’ national requirements implementing the Convention, as required by Standard A3.1, paragraph 3, of the Convention (re-registration or substantial alteration of accommodation) or for other reasons. ';
        docDef.content.push({
          text: additionalEndorseContent + '\n\n',
          fontSize: 9,
          alignment: 'justify',
          margin: [20, 5, 20, 10]
        });


        if (certificateData.additional1[0] || certificateData.additional1.length == 0) {
          var AdditionalsealContent = '';
          AdditionalsealContent = certificateData.additional1[0] ? certificateData.additional1[0].sealImage : _that.images['transparent'];

          docDef.content.push({
            alignment: 'justify',
            columns: [
              {
                width: 215,
                stack: [
                  {
                    text: [
                      { text: "Additional Inspection:\n(if required)" }
                    ], fontSize: 10, margin: [20, 0, 0, 0]
                  }, {
                    image: AdditionalsealContent,
                    width: 70,
                    height: 70,
                    margin: [45, 8, 0, 0]
                  }
                ]
              },
              {
                width: '*',
                table: {
                  body: [
                    [
                      {
                        stack: [
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Signed:", fontSize: 10
                              }, {
                                image: (certificateData.additional1[0] && certificateData.additional1[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.additional1[0].issuerSign : _that.images['transparent'],
                                width: 150,
                                height: 20,
                                margin: [45, -15, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }, {
                            text: [
                              { text: (certificateData.additional1[0] && certificateData.additional1[0].nameToPrint === 1) ? certificateData.additional1[0].issuerName + '\n' : '(Name)\n', italics: (certificateData.additional1[0] && certificateData.additional1[0].nameToPrint === 1 && certificateData.additional1[0].issuerName) ? false : true },
                              { text: (certificateData.additional1[0] && certificateData.additional1[0].title) ? certificateData.additional1[0].title : '(Appointment)', italics: (certificateData.additional1[0] && certificateData.additional1[0].title) ? false : true }
                            ],
                            fontSize: 10, margin: [20, 0, 0, 0],
                            alignment: 'center'
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Place:",
                                fontSize: 10,
                                margin: [0, 13, 0, 0]
                              }, {
                                text: (certificateData.additional1[0] && certificateData.additional1[0].auditPlace) ? certificateData.additional1[0].auditPlace : '     ',
                                fontSize: 10,
                                margin: [5, 10, 0, 0]
                              }
                            ], margin: [0, -3, 0, 0]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Date:",
                                fontSize: 10,
                                margin: [0, 30, 0, 0]
                              }, {
                                text: (certificateData.additional1[0] && certificateData.additional1[0].issuerSignDate) ? certificateData.additional1[0].issuerSignDate.replace(/^0+/, '') : '   ',
                                fontSize: 10,
                                margin: [5, 25, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  ]
                }, layout: 'noBorders'
              }
            ]
          })
          docDef.content.push({
            text: '(Seal or stamp of issuing authority, as appropriate)' + '\n\n',
            fontSize: 10,
            italics: true,
            margin: [20, 8, 0, 0]
          })
          if ((additionalCross1)) {
            docDef.content.push({
              columns: [{
                width: '*',
                text: 'VERIFICATION PREVIOUSLY CARRIED OUT',
                fontSize: 15,
                absolutePosition: { x: 175, y: 394 }
              }]
            });
            docDef.content.push({
              canvas: [{
                type: 'line',
                x1: 20,
                y1: -15,
                x2: 510,
                y2: -148,
                lineWidth: 1
              }]
            });
          }
        }
        // MLC Additional Starts here... (2)

        if (certificateData.additional2[0] || certificateData.additional2.length == 0) {

          var AdditionalsealContent1 = '';
          AdditionalsealContent1 = certificateData.additional2[0] ? certificateData.additional2[0].sealImage : _that.images['transparent'];

          docDef.content.push({
            alignment: 'justify',
            columns: [
              {
                width: 215,
                stack: [
                  {
                    text: [
                      { text: "Additional Inspection:\n(if required)" }
                    ], fontSize: 10, margin: [20, 0, 0, 0]
                  }, {
                    image: AdditionalsealContent1,
                    width: 70,
                    height: 70,
                    margin: [45, 8, 0, 0]
                  }
                ]
              },
              {
                width: '*',
                table: {
                  body: [
                    [
                      {
                        stack: [
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Signed:", fontSize: 10
                              }, {
                                image: (certificateData.additional2[0] && certificateData.additional2[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.additional2[0].issuerSign : _that.images['transparent'],
                                width: 150,
                                height: 20,
                                margin: [45, -15, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }, {
                            text: [
                              { text: (certificateData.additional2[0] && certificateData.additional2[0].nameToPrint === 1) ? certificateData.additional2[0].issuerName + '\n' : '(Name)\n', italics: (certificateData.additional2[0] && certificateData.additional2[0].nameToPrint === 1 && certificateData.additional2[0].issuerName) ? false : true },
                              { text: (certificateData.additional2[0] && certificateData.additional2[0].title) ? certificateData.additional2[0].title : '(Appointment)', italics: (certificateData.additional2[0] && certificateData.additional2[0].title) ? false : true }
                            ],
                            fontSize: 10, margin: [20, 0, 0, 0],
                            alignment: 'center'
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Place:",
                                fontSize: 10,
                                margin: [0, 13, 0, 0]
                              }, {
                                text: (certificateData.additional2[0] && certificateData.additional2[0].auditPlace) ? certificateData.additional2[0].auditPlace : '     ',
                                fontSize: 10,
                                margin: [5, 10, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Date:",
                                fontSize: 10,
                                margin: [0, 30, 0, 0]
                              }, {
                                text: (certificateData.additional2[0] && certificateData.additional2[0].issuerSignDate) ? certificateData.additional2[0].issuerSignDate.replace(/^0+/, '') : '   ',
                                fontSize: 10,
                                margin: [5, 25, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  ]
                }, layout: 'noBorders'
              }
            ]
          })
          docDef.content.push({
            text: '(Seal or stamp of issuing authority, as appropriate)' + '\n\n',
            fontSize: 10,
            italics: true,
            margin: [20, 8, 0, 0]
          })
          console.log(additionalCross2)
          if ((additionalCross2)) {
            docDef.content.push({
              columns: [{
                width: '*',
                text: 'VERIFICATION PREVIOUSLY CARRIED OUT',
                fontSize: 15,
                absolutePosition: { x: 175, y: 530 }
              }]
            });
            docDef.content.push({
              canvas: [{
                type: 'line',
                x1: 20,
                y1: -15,
                x2: 510,
                y2: -148,
                lineWidth: 1
              }]
            });
          }
        }


        // MLC Additional Starts here... (3)

        if (certificateData.additional3[0] || certificateData.additional3.length == 0) {

          var AdditionalsealContent2 = '';
          AdditionalsealContent2 = certificateData.additional3[0] ? certificateData.additional3[0].sealImage : _that.images['transparent'];
          docDef.content.push({
            alignment: 'justify',
            columns: [
              {
                width: 215,
                stack: [
                  {
                    text: [
                      { text: "Additional Inspection:\n(if required)" }
                    ], fontSize: 10, margin: [20, 0, 0, 0]
                  }, {
                    image: AdditionalsealContent2,
                    width: 70,
                    height: 70,
                    margin: [45, 8, 0, 0]
                  }
                ]
              },
              {
                width: '*',
                table: {
                  body: [
                    [
                      {
                        stack: [
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Signed:", fontSize: 10
                              }, {
                                image: (certificateData.additional3[0] && certificateData.additional3[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.additional3[0].issuerSign : _that.images['transparent'],
                                width: 150,
                                height: 20,
                                margin: [45, -15, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }, {
                            text: [
                              { text: (certificateData.additional3[0] && certificateData.additional3[0].nameToPrint === 1) ? certificateData.additional3[0].issuerName + '\n' : '(Name)\n', italics: (certificateData.additional3[0] && certificateData.additional3[0].nameToPrint === 1 && certificateData.additional3[0].issuerName) ? false : true },
                              { text: (certificateData.additional3[0] && certificateData.additional3[0].title) ? certificateData.additional3[0].title : '(Appointment)', italics: (certificateData.additional3[0] && certificateData.additional3[0].title) ? false : true }
                            ],
                            fontSize: 10, margin: [20, 0, 0, 0],
                            alignment: 'center'
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Place:",
                                fontSize: 10,
                                margin: [0, 13, 0, 0]
                              }, {
                                text: (certificateData.additional3[0] && certificateData.additional3[0].auditPlace) ? certificateData.additional3[0].auditPlace : '     ',
                                fontSize: 10,
                                margin: [5, 10, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Date:",
                                fontSize: 10,
                                margin: [0, 30, 0, 0]
                              }, {
                                text: (certificateData.additional3[0] && certificateData.additional3[0].issuerSignDate) ? certificateData.additional3[0].issuerSignDate.replace(/^0+/, '') : '   ',
                                fontSize: 10,
                                margin: [5, 25, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }
                        ]
                      },
                      voidStatus == true ? {//ism initial second page
                        canvas: [{
                          type: 'line',
                          x1: 0,
                          y1: -40,
                          x2: 525,
                          y2: -765,
                          color: 'red',
                          lineWidth: 2
                        }
                        ],
                        absolutePosition: { x: 45, y: 798 }
                      } : {}
                    ]
                  ]
                }, layout: 'noBorders'
              }
            ]
          })
          if ((additionalCross3)) {
            docDef.content.push({
              columns: [{
                width: '*',
                text: 'VERIFICATION PREVIOUSLY CARRIED OUT',
                fontSize: 15,
                absolutePosition: { x: 175, y: 663 }
              }]
            });
            docDef.content.push({
              canvas: [{
                type: 'line',
                x1: 40,
                y1: -15,
                x2: 510,
                y2: -108,
                lineWidth: 1
              }]
            });
          }
          docDef.content.push({
            text: '(Seal or stamp of issuing authority, as appropriate)' + '\n\n',
            fontSize: 10,
            italics: true,
            margin: [20, 8, 0, 0]
          })
          /*docDef.content.push(voidStatus==true?{//ism initial second page
        canvas : [ {
            type : 'line',
                  x1 : 0,
            y1 : -40,
            x2 : 525,
            y2 : -740,
            color:'red',
            lineWidth : 2
          } 
       ],
       absolutePosition:{x:45,y:800} 
           }:{})*/

        }
        //3rd page start
        if (certificateData.auditSubTypeId != 1001) {

          docDef.content.push({
            columns: [{
              columns: [[{
                text: 'Certificate Number',
                pageBreak: 'before',
                fontSize: 10,

                margin: [435, 0, 0, 0]
              }, {
                table: {
                  widths: [80],
                  body: [[voluntaryCert ? certificateData.certificateNo.replace("J", "JV") : certificateData.certificateNo]]
                },
                margin: [427, 2, 0, 0], fontSize: 8
              }]],
              width: 'auto',
            }]
          }, {

            stack: [
              {
                canvas: [
                  {
                    type: 'rect',
                    x: 5, y: 693,
                    w: 525,
                    h: -727,
                    fillOpacity: 0.5,
                    lineWidth: 2
                  }
                ]
              },
              {
                canvas: [
                  {
                    type: 'rect',
                    x: 0, y: 698,
                    w: 535,
                    h: -737,
                    fillOpacity: 0.5
                  }
                ]
              },
              {

              }]
          });


          var ismendorsecontent2 = '\nEXTENSION AFTER RENEWAL INSPECTION (IF REQUIRED)';

          docDef.content.push({
            text: ismendorsecontent2 + '\n\n',
            fontSize: 10,
            bold: true, alignment: 'center',
            margin: [10, 0]
          });
          var extensionDate = (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].extendedExpireDate) ? moment(certificateData.renewalEndorse2[0].extendedExpireDate).format('D MMMM YYYY') : '[EXTENSION DATE]'
          var renewalDate = (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].endorsedDate) ? moment(certificateData.renewalEndorse2[0].endorsedDate).format('D MMMM YYYY') : '[RENEWAL DATE]'
          var ismendorsecontent3 = 'THIS IS TO CERTIFY THAT, following a renewal inspection, the ship was found to continue to be in compliance with national laws'
            + ' and regulations or other measures implementing the requirements of this Convention, and that the present certificate is hereby'
            + ' extended, in accordance with paragraph 4 of Standard A5.1.3, until ' + extensionDate + ' (not more than five months after the'
            + ' expiry date of the existing certificate) to allow for the new certificate to be issued to and made available on board the ship.'
            + '\n\nCompletion date of the renewal inspection on which this extension is based was '; /*[RENEWAL DATE].*/
          var ismendorsecontent4 = renewalDate.replace(/^0+/, '');
          docDef.content.push({
            text: [
              { text: ismendorsecontent3 },
              { text: ismendorsecontent4 + '.', /*italics:(ismendorsecontent4 == '[DATE]')?true:false*/ }
            ],
            fontSize: 10,
            alignment: 'justify',
            margin: [20, 10, 20, 25]
          });

          // Renewal Endorsement start

          var renewalsealContent = '';

          renewalsealContent = certificateData.renewalEndorse2[0] ? certificateData.renewalEndorse2[0].sealImage : _that.images['transparent'];
          //{text:"Endorsement:"},

          docDef.content.push({
            alignment: 'justify',
            columns: [
              {
                width: 215,
                stack: [
                  {
                    text: [

                      { text: "" },
                    ], fontSize: 10, margin: [20, 0, 0, 0]
                  }, {
                    image: renewalsealContent,
                    width: 70,
                    height: 70,
                    margin: [45, 50, 0, 0]
                  }
                ]
              },
              {
                width: '*',
                table: {
                  body: [
                    [
                      {
                        stack: [
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Signed:", fontSize: 10
                              }, {
                                image: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].signToPrint === 1) ? 'data:image/jpeg;base64,' + certificateData.renewalEndorse2[0].issuerSign : _that.images['transparent'],
                                width: 150,
                                height: 20,
                                margin: [45, -15, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }, {
                            text: [
                              { text: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].nameToPrint === 1) ? certificateData.renewalEndorse2[0].issuerName + '\n' : '(Name)\n', italics: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].nameToPrint === 1 && certificateData.renewalEndorse2[0].issuerName) ? false : true },
                              { text: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].title) ? certificateData.renewalEndorse2[0].title : '(Appointment)', italics: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].title) ? false : true }
                            ],
                            fontSize: 10, margin: [20, 0, 0, 0],
                            alignment: 'center'
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Place:",
                                fontSize: 10,
                                margin: [0, 13, 0, 0]
                              }, {
                                text: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].auditPlace) ? certificateData.renewalEndorse2[0].auditPlace : '   ',
                                fontSize: 10,
                                margin: [5, 10, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                                width: 40,
                                text: "Date:",
                                fontSize: 10,
                                margin: [0, 30, 0, 0]
                              }, {
                                text: (certificateData.renewalEndorse2[0] && certificateData.renewalEndorse2[0].issuerSignDate) ? certificateData.renewalEndorse2[0].issuerSignDate.replace(/^0+/, '') : '    ',
                                fontSize: 10,
                                margin: [5, 25, 0, 0]
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                              }, {
                                canvas: [{
                                  type: 'line',
                                  x1: -125,
                                  y1: 10,
                                  x2: 125,
                                  y2: 10,
                                  lineWidth: 1
                                }],
                                margin: [20, -11, 0, 0]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  ]
                }, layout: 'noBorders'
              }
            ]
          })
          docDef.content.push({
            text: '(Seal or stamp of issuing authority, as appropriate)' + '\n\n',
            fontSize: 10,
            italics: true,
            margin: [20, 10, 0, 0]
          })
        }
        //renewal endorsement cross line of mlc
        docDef.content.push(voidStatus == true ? {//ism initial second page
          canvas: [{
            type: 'line',
            x1: 0,
            y1: -40,
            x2: 525,
            y2: -740,
            color: 'red',
            lineWidth: 2
          }
          ],
          absolutePosition: { x: 45, y: 800 }
        } : {})


      }

      pdfMake.createPdf(docDef, "", "", this.fonts).getBlob(data => {
        this.fileManager.checkPdfDirectory().then(() => {
          this.fileManager.writePdfInTheDirectory(
            data,
            "" + certificateData.certificateNo + ".pdf",
            "Certificate"
          ).then(() => {
            this.fileManager.openPdf("" + certificateData.certificateNo + ".pdf").then(() => {
              resolve({ data: "Success" });
            });
          });
        });
      });
      this.loader.hideLoader();
    });
  }

  /* New Report */
  public reportAuditGenerate(ReportData) {
    return new Promise<Object>(async (resolve, reject) => {
      this.loader.showLoader("PreparingReport");
      const YYYYMMDD = "YYYY-MM-DD",
        HHmm = "HH:mm";
      var audittype = "",
        reportTypeCaps = "",
        reportTypeSmall = "",
        audinsTypeCaps = "",
        audinsTypeSmall = "",
        reportsubTypeSmall = "",
        reportCertifidet = "",
        reportSummaryTypeCaps = "",
        currfindtemp = "",
        prevtempsec = "",
        reportsubDateSmall = "",
        reportrevreport = "";
      let _that = this;
      /* special/specific field variables*/

      /*vessel / company section fields*/
      var docExpiry = ReportData.DocExpiry ? moment(ReportData.DocExpiry, YYYYMMDD).format("DD-MMM-YYYY") : "N/A";

      /*title and audit/certificate section fields*/
      var auditStatus = ReportData.AuditStatus ? ReportData.AuditStatus : "-";
      var reportTitle = "",
        dateOfRegistry = "",
        dateOfRegistryValue = "",
        certIssued = "",
        certIssuedVal = "",
        expiryDate = "",
        expiryDateVal = "",
        meetingOrRecipt = "",
        meetingOrReciptVal = "",
        SSPAuditorName = "",
        SSPAuditorNameVal = "",
        SSPRevNo = "",
        SSPRevNoVal = "";
      var auditDate = ReportData.CurVesData.auditDate
        ? moment(ReportData.CurVesData.auditDate, YYYYMMDD).format(
          "DD-MMM-YYYY"
        )
        : "N / A";

      //3rd and 4th column fields
      console.log('ReportData.CurVesData.auditPlace', ReportData.CurVesData.auditPlace);
      var auditPlace = ReportData.CurVesData.auditPlace
        ? decodeURIComp(ReportData.CurVesData.auditPlace)
        : "-";
      console.log('audit place', auditPlace);
      var certiOrLettNo = "",
        certiOrLettNoVal = "",
        issueDate = "",
        issueDateVal = "",
        interAuditDate = "",
        interAuditDateVal = "",
        closeMeetOrIssueDate = "",
        closeMeetOrIssueDateVal = "",
        revRptNo = "",
        revRptNoVal = "",
        dmlcIssueDate = "",
        dmlcIssueDateVal = "",
        revNo = "",
        revNoVal = "";

      /*audit summary section fields*/
      var summaryHeading = "",
        auditSummaryValue = "";

      console.log(ReportData);
      if (ReportData.CurVesData.auditTypeId == 1001) {
        audinsTypeCaps = "AUDITOR";

        audinsTypeSmall = "Auditor";

        audittype = "ISM";

        reportTypeCaps = "AUDIT";

        reportSummaryTypeCaps = "AUDIT";

        reportTypeSmall = "Audit";

        reportsubTypeSmall = "Audit";

        reportsubDateSmall = "Audit";
      } else if (
        ReportData.CurVesData.auditTypeId == 1002 ||
        ReportData.CurVesData.auditTypeId == 1004
      ) {
        if (ReportData.CurVesData.auditTypeId == 1002) {
          audittype = "ISPS";

          reportsubTypeSmall = "Audit";

          reportSummaryTypeCaps = "AUDIT";

          reportsubDateSmall = "Audit";

          reportrevreport = "SSP";
        } else if (ReportData.CurVesData.auditTypeId == 1004) {
          audittype = "SSP";

          reportsubTypeSmall = "Review";

          reportsubDateSmall = "Approval";

          reportSummaryTypeCaps = "REVIEW";
        }

        audinsTypeCaps = "AUDITOR";

        audinsTypeSmall = "Auditor";

        reportTypeCaps = "AUDIT";

        reportTypeSmall = "Audit";

        reportCertifidet = "SSP";
      } else if (
        ReportData.CurVesData.auditTypeId == 1003 ||
        ReportData.CurVesData.auditTypeId == 1005
      ) {
        if (ReportData.CurVesData.auditTypeId == 1003) {
          audittype = "MLC";

          reportsubTypeSmall = "Inspection";

          reportSummaryTypeCaps = "INSPECTION";

          reportsubDateSmall = "Inspection";

          reportrevreport = "DMLC II Review";
        } else if (ReportData.CurVesData.auditTypeId == 1005) {
          audittype = "DMLC II";

          reportsubTypeSmall = "Review";

          reportSummaryTypeCaps = "REVIEW";

          reportsubDateSmall = "Review";
        }

        reportCertifidet = "DMLC II";

        audinsTypeCaps = "INSPECTOR";

        audinsTypeSmall = "Inspector";

        reportTypeCaps = "INSPECTION";

        reportTypeSmall = "Inspection";
      }

      // report Title

      if (ReportData.prelimAudit == "Yes") {
        if (ReportData.CurVesData.auditTypeId == 1001) {
          reportTitle = "PRELIMINARY ISM SHIPBOARD AUDIT REPORT";
        } else if (ReportData.CurVesData.auditTypeId == 1002) {
          reportTitle = "PRELIMINARY ISPS SHIPBOARD AUDIT REPORT";
        } else if (ReportData.CurVesData.auditTypeId == 1003) {
          reportTitle = "PRELIMINARY MLC INSPECTION REPORT";
        } else if (ReportData.CurVesData.auditTypeId == 1004) {
          if (ReportData.CurVesData.auditSubTypeId == 1001) {
            reportTitle = "PRELIMINARY SHIP SECURITY PLAN (SSP) REVIEW REPORT";
          } else if (ReportData.CurVesData.auditSubTypeId == 1002) {
            reportTitle =
              "PRELIMINARY SHIP SECURITY PLAN (SSP) AMENDMENT REVIEW REPORT";
          }
        } else if (ReportData.CurVesData.auditTypeId == 1005) {
          if (ReportData.CurVesData.auditSubTypeId == 1001) {
            reportTitle =
              "PRELIMINARY DECLARATION OF MARITIME LABOUR COMPLIANCE PART II\n(DMLC PART II) REVIEW REPORT";
          } else if (ReportData.CurVesData.auditSubTypeId == 1002) {
            reportTitle =
              "PRELIMINARY DECLARATION OF MARITIME LABOUR COMPLIANCE PART II\n(DMLC PART II) AMENDMENT REVIEW REPORT";
          }
        }
      } else if (ReportData.prelimAudit == "No") {
        if (ReportData.CurVesData.auditTypeId == 1001) {
          reportTitle = "ISM SHIPBOARD AUDIT REPORT";
        } else if (ReportData.CurVesData.auditTypeId == 1002) {
          reportTitle = "ISPS SHIPBOARD AUDIT REPORT";
        } else if (ReportData.CurVesData.auditTypeId == 1003) {
          reportTitle = "MLC INSPECTION REPORT";
        } else if (ReportData.CurVesData.auditTypeId == 1004) {
          if (ReportData.CurVesData.auditSubTypeId == 1001) {
            reportTitle = "SHIP SECURITY PLAN (SSP) REVIEW REPORT";
          } else if (ReportData.CurVesData.auditSubTypeId == 1002) {
            reportTitle = "SHIP SECURITY PLAN (SSP) AMENDMENT REVIEW REPORT";
          }
        } else if (ReportData.CurVesData.auditTypeId == 1005) {
          if (ReportData.CurVesData.auditSubTypeId == 1001) {
            reportTitle =
              "DECLARATION OF MARITIME LABOUR COMPLIANCE PART II \n(DMLC PART II) REVIEW REPORT";
          } else if (ReportData.CurVesData.auditSubTypeId == 1002) {
            reportTitle =
              "DECLARATION OF MARITIME LABOUR COMPLIANCE PART II \n(DMLC PART II) AMENDMENT REVIEW REPORT";
          }
        }
      }

      //(check)certificate issued , expiry date, ssp auditor.name, ssp rev.no

      if (
        ReportData.CurVesData.auditTypeId != 1005 &&
        ReportData.CurVesData.auditTypeId != 1004
      ) {
        certIssued = "Certificate Issued";

        certIssuedVal = ReportData.CertificateIssued
          ? ReportData.CertificateIssued
          : "-";
        //certIssuedVal = '\n :  '+certIssuedVal;
      }

      if (ReportData.CurVesData.auditTypeId != 1005) {
        if (ReportData.CurVesData.auditTypeId != 1004) {
          expiryDate = "Expiry Date";
        } else if (ReportData.CurVesData.auditTypeId == 1004) {
          expiryDate = "ISPS Audit Due Date";
        }

        expiryDateVal = ReportData.CurVesData.certExpireDate
          ? moment(ReportData.CurVesData.certExpireDate, YYYYMMDD).format(
            "DD-MMM-YYYY"
          )
          : "N / A";
        //expiryDateVal = '\n :  '+expiryDateVal;
      }

      if (
        ReportData.CurVesData.auditTypeId == 1001 ||
        ReportData.CurVesData.auditTypeId == 1002 ||
        ReportData.CurVesData.auditTypeId == 1003
      ) {
        meetingOrRecipt = "Opening Meeting Date";
        /**Fixed MOBILE-528 code added by kiran */
        meetingOrReciptVal = ReportData.CurVesData.openMeetingDate
        ? moment(
          ReportData.CurVesData.openMeetingDate,
          YYYYMMDD + HHmm
        ).format("DD-MMM-YYYY" + ' ' + HHmm)
        : "N / A";
      } else if (
        ReportData.CurVesData.auditTypeId == 1005 ||
        ReportData.CurVesData.auditTypeId == 1004
      ) {
        meetingOrRecipt = "Receipt Date ";
      meetingOrReciptVal = ReportData.CurVesData.openMeetingDate
        ? moment(ReportData.CurVesData.openMeetingDate, YYYYMMDD).format(
          "DD-MMM-YYYY" + ' '
        )
        : "N / A";
      }
      //meetingOrReciptVal = '\n :  '+ meetingOrReciptVal;

      if (
        ReportData.CurVesData.auditTypeId == 1003 ||
        ReportData.CurVesData.auditTypeId == 1002
      ) {
        SSPAuditorName = reportCertifidet + " " + audinsTypeSmall + " Name";

        SSPAuditorNameVal = ReportData.CurVesData.sspReviewDetail.sspLeadName
          ? ReportData.CurVesData.sspReviewDetail.sspLeadName
          : "-";

        //	SSPAuditorNameVal ='\n :  '+SSPAuditorNameVal;
      }

      if (
        ReportData.CurVesData.auditTypeId == 1005 ||
        ReportData.CurVesData.auditTypeId == 1003 ||
        ReportData.CurVesData.auditTypeId == 1002
      ) {
        SSPRevNo = reportCertifidet + " Rev. No.";

        SSPRevNoVal = ReportData.CurVesData.sspReviewDetail.sspRevisionNo
          ? ReportData.CurVesData.sspReviewDetail.sspRevisionNo
          : "-";

        SSPRevNoVal = SSPRevNoVal;
      }

      //3rd and 4th coloum of auditor/certificate section

      if (
        ReportData.CurVesData.auditTypeId == 1001 ||
        ReportData.CurVesData.auditTypeId == 1002 ||
        ReportData.CurVesData.auditTypeId == 1003
      ) {
        certiOrLettNo = "Certificate Number.";
      } else if (
        ReportData.CurVesData.auditTypeId == 1005 ||
        ReportData.CurVesData.auditTypeId == 1004
      ) {
        certiOrLettNo = "Letter No.";
      }

      certiOrLettNoVal = ReportData.CurVesData.certificateNo
        ? ReportData.CurVesData.certificateNo
        : "-";
      //certiOrLettNoVal = '\n :  '+certiOrLettNoVal;

      if (ReportData.CurVesData.auditTypeId != 1005) {
        if (ReportData.CurVesData.auditTypeId == 1004) {
          issueDate = "SSP Issue Date";
        } else if (ReportData.CurVesData.auditTypeId != 1004) {
          issueDate = "Issue Date";
        }

        issueDateVal = ReportData.CurVesData.certIssueDate
          ? moment(ReportData.CurVesData.certIssueDate, YYYYMMDD).format(
            "DD-MMM-YYYY"
          )
          : "N / A";
        //issueDateVal = '\n :  '+issueDateVal;
      }

      if (
        ReportData.CurVesData.auditTypeId != 1005 &&
        ReportData.CurVesData.auditTypeId != 1004
      ) {
        interAuditDate = "Internal " + reportTypeSmall + " Date";
        interAuditDateVal = ReportData.CurVesData.interalAuditDate;

        if (
          ReportData.CurVesData.interalAuditDate == undefined ||
          ReportData.CurVesData.interalAuditDate == "" ||  ReportData.CurVesData.interalAuditDate == "Invalid date"  /**Fixed MOBILE-472 by kiran */
        ) {
          ReportData.CurVesData.interalAuditDate = "N / A";
          interAuditDateVal = ReportData.CurVesData.interalAuditDate;
        }
      }

      if (
        ReportData.CurVesData.auditTypeId != 1004 &&
        ReportData.CurVesData.auditTypeId != 1005
      ) {
        closeMeetOrIssueDate = "Closing Meeting Date";
      } else if (ReportData.CurVesData.auditTypeId == 1005) {
        closeMeetOrIssueDate = "DMLC II Issue Date";
      }

      closeMeetOrIssueDateVal =
        closeMeetOrIssueDate == "DMLC II Issue Date"
          ? ReportData.CurVesData.closeMeetingDate
            ? moment(ReportData.CurVesData.closeMeetingDate, YYYYMMDD).format(
              "DD-MMM-YYYY"
            )
            : "N / A"
          : ReportData.CurVesData.closeMeetingDate
            ? moment(
              ReportData.CurVesData.closeMeetingDate,
              YYYYMMDD + HHmm
            ).format("DD-MMM-YYYY" + ' ' + HHmm)
            : "N / A";

      //	closeMeetOrIssueDateVal ='\n :  '+ closeMeetOrIssueDateVal;

      if (
        ReportData.CurVesData.auditTypeId == 1003 ||
        ReportData.CurVesData.auditTypeId == 1002
      ) {
        revRptNo = reportrevreport + " Rpt. No.";
        revRptNoVal = ReportData.CurVesData.sspReviewDetail.sspReportNo
          ? ReportData.CurVesData.sspReviewDetail.sspReportNo
          : "-";
        //	revRptNoVal = '\n :  '+revRptNoVal;
      }

      if (ReportData.CurVesData.auditTypeId == 1005) {
        dmlcIssueDate = "DMLC I Issue Date";
        dmlcIssueDateVal = ReportData.CurVesData.interalAuditDate
          ? ReportData.CurVesData.interalAuditDate
          : "N/A";

        if (
          ReportData.CurVesData.interalAuditDate == undefined ||
          ReportData.CurVesData.interalAuditDate == " "
        ) {
          dmlcIssueDateVal = ReportData.CurVesData.interalAuditDate = "N / A";
        }
        //dmlcIssueDateVal = '\n :  '+dmlcIssueDateVal;
      }

      if (ReportData.CurVesData.auditTypeId == 1004) {
        revNo = "SSP Rev. No.";
        revNoVal = ReportData.CurVesData.sspReviewDetail.sspRevisionNo
          ? ReportData.CurVesData.sspReviewDetail.sspRevisionNo
          : "-";
        // revNoVal = '\n :  '+revNoVal;
      }
      //check and set audit summary data
      if (ReportData.CurVesData.auditTypeId == 1001) {
        summaryHeading =
          "The undersigned has carried out the above audit according to the ISM Code and found the vessel:";
      } else if (ReportData.CurVesData.auditTypeId == 1002) {
        summaryHeading =
          "The undersigned has carried out the above audit according to the ISPS Code and found the vessel:";
      } else if (ReportData.CurVesData.auditTypeId == 1003) {
        summaryHeading =
          "The undersigned has carried out the above inspection according to the MLC Code and found the vessel:";
      } else if (ReportData.CurVesData.auditTypeId == 1004) {
        summaryHeading =
          "The undersigned has carried out the Ship Security Plan (SSP) review for and on behalf of the Government of the Republic of the Marshall Islands (RMI) for compliance with the International Code for the Security of Ships and Port Facilities (ISPS Code), Part A and the provisions of ISPS Code B/8.1 to B/13.8 as appropriate for the ship:";
      } else if (ReportData.CurVesData.auditTypeId == 1005) {
        summaryHeading =
          "The undersigned has carried out the DMLC Part II review pursuant to Standard A5.1.3 paragraph 10(b) of the MLC 2006 and RMI requirements for implementing MLC 2006 and found the DMLC Part II:";
      }

      if (ReportData.AuditSummary.indexOf("Non") > 1) {
        var auditSummaryValueSplit =
          ReportData.AuditSummary.indexOf("Non") > 1
            ? ReportData.AuditSummary.split(" ")
            : "NIL";
        console.log(auditSummaryValueSplit);
        var auditSummary1 = "",
          auditSummary2 = "";
        if (
          ReportData.CurVesData.auditSubTypeId ==
          this.appConstant.INTERIM_SUB_TYPE_ID
        ) {
          for (var i = 0; i < 12; i++) {
            auditSummary1 = auditSummary1 + " " + auditSummaryValueSplit[i];
          }
          for (var j = 13; j < auditSummaryValueSplit.length; j++) {
            auditSummary2 = auditSummary2 + " " + auditSummaryValueSplit[j];
          }
        } else if (
          ReportData.CurVesData.auditSubTypeId ==
          this.appConstant.INITIAL_SUB_TYPE_ID ||
          ReportData.CurVesData.auditSubTypeId ==
          this.appConstant.RENEWAL_SUB_TYPE_ID ||
          ReportData.CurVesData.auditSubTypeId ==
          this.appConstant.INTERMEDIATE_SUB_TYPE_ID ||
          ReportData.CurVesData.auditSubTypeId ==
          this.appConstant.ADDITIONAL_SUB_TYPE_ID
        ) {
          for (var i = 0; i < 13; i++) {
            auditSummary1 = auditSummary1 + " " + auditSummaryValueSplit[i];
          }
          for (var j = 14; j < auditSummaryValueSplit.length; j++) {
            auditSummary2 = auditSummary2 + " " + auditSummaryValueSplit[j];
          }
        }

        var auditSummaryd = auditSummary1 + " Non-Conformity" + auditSummary2;
        auditSummaryd = auditSummaryd.replace(/\s*,/g, ",");
        auditSummaryValue = auditSummaryd.replace(/\s+/g, " ");
      } else {
        auditSummaryValue = ReportData.AuditSummary
          ? ReportData.AuditSummary
          : "NIL";
        console.log(auditSummaryValue);
      }
      console.log(auditSummaryValue);

      /* check date of registry */
      if (
        ReportData.CurVesData.auditTypeId == 1003 ||
        ReportData.CurVesData.auditTypeId == 1005
      ) {
        dateOfRegistry = "Date of Registry";
          /**Fixed MOBILE-480 by kiran */
        dateOfRegistryValue = ReportData.dateOfReg ? moment(ReportData.dateOfReg).format('DD-MMM-YYYY') : "";
      }
      var ss = ReportData.CurVesData.vesselName;
      //dd object for pdfmake

      var dd: any = {
        ownerPassword: "123456",
        permissions: {
          //pageSize: {width: 797, height: 1122},
          printing: "highResolution",
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: false,
          documentAssembly: false
        },
        pageSize: "letter",
        defaultStyle: {
          //font: 'Times'
        },
        header: {
          text: [
            {
              text: "RMI Report No.:  ",
              alignment: "right",
              fontSize: 10,
              bold: false
            },
            {
              text: ReportData.reportNo,
              alignment: "right",
              fontSize: 11,
              bold: true
            }
          ],
          margin: [0, 15, 30, 10]
        },
        content: [],
        background: function (currentPage, pageSize) {
          return {
            image: _that.images["watermark"],
            width: 300,
            absolutePosition: {
              x: 150,
              y: 260
            }
            //opacity : 1
          };
        },
        styles: {
          prevfindigTable: {
            margin: [-10, 0, 0, 30]
          },
          currentfindigTable: {
            margin: [-10, 0, 0, 30]
          },
          dmlcRevNoteTable: {
            margin:
              ReportData.PreviousDetails.length == 0
                ? [-10, 0, 0, 30]
                : [-10, 0, 0, 30]
          }
        },
        footer: function (currentPage, pageCount) {
          if (currentPage == 1) {
            return {
              table: {
                widths: ["*"],
                body: [
                  [
                    {
                      text:
                        "Page " + currentPage.toString() + " of " + pageCount,
                      alignment: "center",
                      margin: [0, 10, 0, 0],
                      fontSize: 11,
                      bold: true
                    }
                  ]
                ]
              },
              layout: "noBorders"
            };
          } else {
            return {
              table: {
                widths: ["*"],
                body: [
                  [
                    {
                      text:
                        "Page " + currentPage.toString() + " of " + pageCount,
                      alignment: "center",
                      margin: [0, 0, 0, 10],
                      fontSize: 11,
                      bold: true
                    }
                  ]
                ]
              },
              layout: "noBorders"
            };
          }
        }
      };

      /* report header / Title */
      var reportHeader = [
        {
          text: [
            {
              text: "\n" + reportTitle,
              alignment: "center",
              fontSize: 14,
              bold: true,
              margin: [0, 8, 0, 4]
            }
          ],
          margin: [0, -20, 0, 0]
        }
      ];

      /* VESSEL / COMPANY Section */
      var nam = ReportData.CurVesData.vesselName;
      var reportVesselDtl: any = [
        {
          text: "VESSEL / COMPANY",
          alignment: "left",
          fontSize: 12,
          bold: "true",
          margin: [0, 10, 0, 5]
        },
        {
          margin: [-10, 0, 0, 0],
          table: {
            widths: [290, 240],
            body: [
              [
                {
                  border: [true, true, false, false],
                  fontSize: 11,
                  bold: false,
                  table: {
                    widths: [133, 1, 145],
                    body: [
                      ["Vessel Name", ":", ReportData.CurVesData.vesselName == "ST�R LIGHT" ? "STÖR LIGHT" : ReportData.CurVesData.vesselName],
                      ["Vessel Type", ":", ReportData.VesselType],
                      ["GRT (MT)", ":", ReportData.Grt],
                      ["DOC Type", ":", ReportData.DocTypeNo],
                      ["DOC Expiry", ":", docExpiry]
                    ]
                  },
                  layout: "noBorders"
                },

                {
                  border: [false, true, true, false],
                  fontSize: 11,
                  bold: false,
                  table: {
                    widths: [105, 1, 111],
                    body: [
                      [
                        "Vessel IMO No.",
                        ":",
                        ReportData.CurVesData.vesselImoNo
                      ],
                      ["Official No.", ":", ReportData.OfficialNo],
                      ["Company IMO No.", ":", ReportData.CompanyImoNo],
                      ["DOC Issuer", ":", ReportData.DocIssuer]
                    ]
                  },
                  layout: "noBorders"
                }
              ],
              [
                {
                  colSpan: 2,
                  margin: [0, -6, 0, 0],
                  border: [true, false, true, true],
                  fontSize: 11,
                  bold: false,
                  table: {
                    widths: [133, 1, 310],
                    body: [
                      [
                        "Name / Address of Company",
                        ":",
                        ReportData.CompanyAddress
                      ]
                    ]
                  },
                  layout: "noBorders"
                },
                ""
              ]
            ]
          },
          layout: {
            hLineWidth: function (i, node) {
              return i === 0 || i === 1 || i === node.table.body.length
                ? 1.5
                : 1;
            },

            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 1.5 : 1;
            }
          }
        }
      ];

      if (dateOfRegistryValue != '') {
        var k = [dateOfRegistry, ':', dateOfRegistryValue]
        reportVesselDtl[1].table.body[0][0].table.body.push(k);
      }

      /*AUDITOR / CERTIFICATE SECTION */

      var auditorCertiDtl: any = [
        { text: 'AUDIT / CERTIFICATE', alignment: 'left', fontSize: 12, bold: 'true', margin: [0, 10, 0, 5] },
        {
          margin: [-10, 0, 0, 0],
          table: {
            widths: [290, 240],
            heights: ['auto', '10', 10, 'auto', 10, 'auto', 10, 10],
            body: [
              [
                {
                  border: [true, true, false, true], fontSize: 11, bold: false,
                  table: {
                    widths: [133, 1, 145],
                    body: [
                      [reportsubTypeSmall + ' Report No.', ':', ReportData.reportNo],
                      [reportsubTypeSmall + ' Sub Type', ':', ReportData.AuditSubTypeId],
                      [reportsubTypeSmall + ' Status', ':', auditStatus]

                    ]
                  }, layout: 'noBorders'
                },

                {
                  border: [false, true, true, true], fontSize: 11, bold: false,
                  table: {
                    widths: [105, 1, 111],
                    body: [
                      [reportsubDateSmall + ' Date ', ':', auditDate],
                      [reportsubTypeSmall + ' Place', ':', auditPlace],
                    ]

                  }, layout: 'noBorders'
                }
              ]]
          }, layout: {
            hLineWidth: function (i, node) {
              return (i === 0 || i === 1 || i === node.table.body.length) ? 1.5 : 1;
            },

            vLineWidth: function (i, node) {
              return (i === 0 || i === node.table.widths.length) ? 1.5 : 1;
            }
          }
        }

      ];
      var cerDtlLeft, cerDtlLeftVal, cerDtlRight, cerDtlRightVal;
      cerDtlLeft = [certIssued, expiryDate, meetingOrRecipt, SSPAuditorName, SSPRevNo];
      cerDtlLeftVal = [certIssuedVal, expiryDateVal == 'Invalid date' ? 'N / A' : expiryDateVal, meetingOrReciptVal, SSPAuditorNameVal, SSPRevNoVal];
      cerDtlRight = [certiOrLettNo, issueDate, interAuditDate, closeMeetOrIssueDate, revRptNo, dmlcIssueDate, revNo];
      cerDtlRightVal = [certiOrLettNoVal, issueDateVal, interAuditDateVal, closeMeetOrIssueDateVal, revRptNoVal, dmlcIssueDateVal, revNoVal];
      for (var i = 0; i < 5; i++) {
        if (cerDtlLeft[i] != '') {
          let k = [cerDtlLeft[i], ':', cerDtlLeftVal[i]]
          auditorCertiDtl[1].table.body[0][0].table.body.push(k);
        }
      }
      for (var i = 0; i < 7; i++) {
        if (cerDtlRight[i] != '') {
          let k = [cerDtlRight[i], ':', cerDtlRightVal[i]]
          auditorCertiDtl[1].table.body[0][1].table.body.push(k);
        }
      }

      /*REPORT ATTACHMENT SECTION*/

      var at1 = '', at2 = '', at3 = '', at4 = '', at5 = '', at6 = '', at7 = '', at8 = '', at9 = '', at10 = '', at11 = '', at12 = '', at13 = '', at14 = '', at15 = '', at16 = '',at17='',at18='',at19='',at20='';
     /*modification are done by lokesh for jira_id(653,901) start here*/
      var typeAudit = ReportData.CurVesData.auditTypeId;
      if (typeAudit <= 1005 && ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {

        var atBox1: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox2: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox3: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox4: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox5: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox6: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox7: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox8: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox9: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox10: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox11: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox12: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox13: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox14: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox15: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox16: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox17: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox18: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox19: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox20: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
      }
      else if (typeAudit == 1006) {

        var atBox1: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
        var atBox2: any = [{ type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 }];
      }
      var boxWithcross = [
        { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
        { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
        { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
      ];
      let attachments = ReportData.CurVesData.auditRptAttach;
      var attachmentFile1 = attachments[0] ? attachments[0].fileName.toString() : "";

      var attachmentFile2 = attachments[1] ? attachments[1].fileName.toString() : "";

      var attachmentFile3 = attachments[2] ? attachments[2].fileName.toString() : "";

      var attachmentFile4 = attachments[3] ? attachments[3].fileName.toString() : "";

      var attachmentFile5 = attachments[4] ? attachments[4].fileName.toString() : "";

      var attachmentFile6 = attachments[5] ? attachments[5].fileName.toString() : "";

      var attachmentFile7 = attachments[6] ? attachments[6].fileName.toString() : "";

      var attachmentFile8 = attachments[7] ? attachments[7].fileName.toString() : "";

      var attachmentFile9 = attachments[8] ? attachments[8].fileName.toString() : "";

      var attachmentFile10 = attachments[9] ? attachments[9].fileName.toString() : "";

      var attachmentFile11 = attachments[10] ? attachments[10].fileName.toString() : "";

      var attachmentFile12 = attachments[11] ? attachments[11].fileName.toString() : "";

      var attachmentFile13 = attachments[12] ? attachments[12].fileName.toString() : "";

      var attachmentFile14 = attachments[13] ? attachments[13].fileName.toString() : "";

      var attachmentFile15 = attachments[14] ? attachments[14].fileName.toString() : "";

      var attachmentFile16 = attachments[15] ? attachments[15].fileName.toString() : "";
     
      var attachmentFile17 = attachments[16] ? attachments[16].fileName.toString() : "";
      
      var attachmentFile18 = attachments[17] ? attachments[17].fileName.toString() : "";

      var attachmentFile19 = attachments[18] ? attachments[18].fileName.toString() : "";

      var attachmentFile20 = attachments[19] ? attachments[19].fileName.toString() : "";

      /*var attachmentFile6 = _(ReportData.CurVesData.auditRptAttach)
          .chain().where({
            'attachmentTypeId' : Number(1006)
          }).pluck('fileName').toString();*/
      var typeAudit = ReportData.CurVesData.auditTypeId;

      if (typeAudit > 1000 && typeAudit <= 1005 || typeAudit == 1006) {

        if (attachmentFile1 != "") {

          atBox1 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];
        }

        if (typeAudit == 1006) {

          at1 = "Check Sheet";

        } else if (typeAudit == 1006) {

          at1 = "" + reportTypeSmall + " Plan";

        } if (typeAudit > 1000 && typeAudit <= 1005) {
          if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {
           //added by archana for jira id=MOBILE-580
            at1 = ReportData.CurVesData.auditRptAttach[0] ? (ReportData.CurVesData.auditRptAttach[0].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[0].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[0].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[0].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[0].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[0].attachmentTypeDesc == 'OTHER' ? '(' + ReportData.CurVesData.auditRptAttach[0].otherType + ')' : " ") : " ";
          }
        }

      }

      if (typeAudit > 1000 && typeAudit <= 1005 || typeAudit == 1006) {

        if (attachmentFile2 != "") {
          atBox2 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];
        }

        if (typeAudit > 1000 && typeAudit <= 1005) {
          if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {
            at2 = ReportData.CurVesData.auditRptAttach[1] ? (ReportData.CurVesData.auditRptAttach[1].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[1].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[1].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[1].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[1].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[1].attachmentTypeDesc == 'OTHER' ? '(' + ReportData.CurVesData.auditRptAttach[1].otherType + ')' : " ") : " ";

          }
        }

        else if (typeAudit == 1006) {
          at2 = "IHM Part I/Investigation report";
        }

      }



      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile3 != "") {
          atBox3 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];
        }

        if (typeAudit > 1000 && typeAudit <= 1005) {


          if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {
            at3 = ReportData.CurVesData.auditRptAttach[2] ? (ReportData.CurVesData.auditRptAttach[2].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[2].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[2].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[2].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[2].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[2].attachmentTypeDesc == 'OTHER'? '(' + ReportData.CurVesData.auditRptAttach[2].otherType + ')' : " ") : " ";

          }
        }

      }
      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile4 != "") {
          atBox4 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];
        }
        if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {
          at4 = ReportData.CurVesData.auditRptAttach[3] ? (ReportData.CurVesData.auditRptAttach[3].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[3].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[3].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[3].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[3].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[3].attachmentTypeDesc == 'OTHER' ? '(' + ReportData.CurVesData.auditRptAttach[3].otherType + ')' : " ") : " ";

        }
      }

      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile5 != "") {
          atBox5 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];

        }

        if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {

          at5 = ReportData.CurVesData.auditRptAttach[4] ? (ReportData.CurVesData.auditRptAttach[4].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[4].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[4].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[4].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[4].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[4].attachmentTypeDesc == 'OTHER'? '(' + ReportData.CurVesData.auditRptAttach[4].otherType + ')' : " ") : " ";

        }
      }
      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile6 != "") {
          atBox6 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];

        }

        if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {

          at6 = ReportData.CurVesData.auditRptAttach[5] ? (ReportData.CurVesData.auditRptAttach[5].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[5].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[5].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[5].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[5].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[5].attachmentTypeDesc == 'OTHER' ? '(' + ReportData.CurVesData.auditRptAttach[5].otherType + ')' : " ") : " ";

        }
      }
      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile7 != "") {
          atBox7 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];

        }

        if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {

          at7 = ReportData.CurVesData.auditRptAttach[6] ? (ReportData.CurVesData.auditRptAttach[6].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[6].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[6].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[6].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[6].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[6].attachmentTypeDesc == 'OTHER' ? '(' + ReportData.CurVesData.auditRptAttach[6].otherType + ')' : " ") : " ";

        }
      }
      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile8 != "") {
          atBox8 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];

        }

        if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {
          at8 = ReportData.CurVesData.auditRptAttach[7] ? (ReportData.CurVesData.auditRptAttach[7].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[7].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[7].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[7].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[7].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[7].attachmentTypeDesc == 'OTHER' ? '(' + ReportData.CurVesData.auditRptAttach[7].otherType + ')' : " ") : " ";

        }
      }
      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile9 != "") {
          atBox9 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];

        }

        if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {
          at9 = ReportData.CurVesData.auditRptAttach[8] ? (ReportData.CurVesData.auditRptAttach[8].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[8].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[8].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[8].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[8].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[8].attachmentTypeDesc == 'OTHER'? '(' + ReportData.CurVesData.auditRptAttach[8].otherType + ')' : " ") : " ";

        }
      }
      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile10 != "") {
          atBox10 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];

        }

        if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {
          at10 = ReportData.CurVesData.auditRptAttach[9] ? (ReportData.CurVesData.auditRptAttach[9].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[9].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[9].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[9].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[9].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[9].attachmentTypeDesc == 'OTHER'? '(' + ReportData.CurVesData.auditRptAttach[9].otherType + ')' : " ") : " ";

        }
      }
      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile11 != "") {
          atBox11 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];

        }

        if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {
          at11 = ReportData.CurVesData.auditRptAttach[10] ? (ReportData.CurVesData.auditRptAttach[10].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[10].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[10].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[10].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[10].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[10].attachmentTypeDesc == 'OTHER'? '(' + ReportData.CurVesData.auditRptAttach[10].otherType + ')' : " ") : " ";

        }
      }
      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile12 != "") {
          atBox12 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];

        }

        if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {
          at12 = ReportData.CurVesData.auditRptAttach[11] ? (ReportData.CurVesData.auditRptAttach[11].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[11].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[11].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[11].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[11].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[11].attachmentTypeDesc == 'OTHER'  ? '(' + ReportData.CurVesData.auditRptAttach[11].otherType + ')' : " ") : " ";

        }
      }
      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile13 != "") {
          atBox13 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];

        }

        if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {
          at13 = ReportData.CurVesData.auditRptAttach[12] ? (ReportData.CurVesData.auditRptAttach[12].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[12].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[12].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[12].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[12].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[12].attachmentTypeDesc == 'OTHER'? '(' + ReportData.CurVesData.auditRptAttach[12].otherType + ')' : " ") : " ";

        }
      }
      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile14 != "") {
          atBox14 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];

        }

        if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {
          at14 = ReportData.CurVesData.auditRptAttach[13] ? (ReportData.CurVesData.auditRptAttach[13].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[13].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[13].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[13].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[13].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[13].attachmentTypeDesc == 'OTHER'? '(' + ReportData.CurVesData.auditRptAttach[13].otherType + ')' : " ") : " ";

        }
      }
      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile15 != "") {
          atBox15 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];

        }

        if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {
          at15 = ReportData.CurVesData.auditRptAttach[14] ? (ReportData.CurVesData.auditRptAttach[14].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[14].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[14].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[14].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[14].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[14].attachmentTypeDesc == 'OTHER'? '(' + ReportData.CurVesData.auditRptAttach[14].otherType + ')' : " ") : " ";

        }
      }
      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile16 != "") {
          atBox16 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];

        }

        if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {
          at16 = ReportData.CurVesData.auditRptAttach[15] ? (ReportData.CurVesData.auditRptAttach[15].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[15].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[15].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[15].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[15].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[15].attachmentTypeDesc == 'OTHER' ? '(' + ReportData.CurVesData.auditRptAttach[15].otherType + ')' : " ") : " ";

        }
      }
      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile17 != "") {
          atBox17 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];

        }

        if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {
          at17 = ReportData.CurVesData.auditRptAttach[16] ? (ReportData.CurVesData.auditRptAttach[16].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[16].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[16].attachmentTypeDesc) +'\n\n\n'+ (ReportData.CurVesData.auditRptAttach[16].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[16].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[16].attachmentTypeDesc == 'OTHER' ? '(' + ReportData.CurVesData.auditRptAttach[16].otherType + ')' : " ") : " ";

        }
      }
      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile18 != "") {
          atBox18 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];

        }

        if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {
          at18 = ReportData.CurVesData.auditRptAttach[17] ? (ReportData.CurVesData.auditRptAttach[17].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[17].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[17].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[17].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[17].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[17].attachmentTypeDesc == 'OTHER' ? '(' + ReportData.CurVesData.auditRptAttach[17].otherType + ')' : " ") : " ";

        }
      }
      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile19 != "") {
          atBox19 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];

        }

        if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {
          at19 = ReportData.CurVesData.auditRptAttach[18] ? (ReportData.CurVesData.auditRptAttach[18].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[18].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[18].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[18].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[18].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[18].attachmentTypeDesc == 'OTHER' ? '(' + ReportData.CurVesData.auditRptAttach[18].otherType + ')' : " ") : " ";

        }
      }
      if (typeAudit > 1000 && typeAudit <= 1005) {

        if (attachmentFile20 != "") {
          atBox20 = [
            { type: 'rect', x: 10, y: 1, w: 11, h: 11, lineColor: '#000', lineWidth: 1.2 },
            { type: 'line', x1: 21, y1: 1, x2: 10, y2: 12, lineWidth: 1.2 },
            { type: 'line', x1: 10, y1: 1, x2: 21, y2: 12, lineWidth: 1.2 }
          ];

        }

        if (ReportData.CurVesData.auditRptAttach.length && ReportData.CurVesData.auditRptAttach.length > 0) {
          at20 = ReportData.CurVesData.auditRptAttach[19] ? (ReportData.CurVesData.auditRptAttach[19].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[19].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[19].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[19].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[19].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[19].attachmentTypeDesc == 'OTHER' ? '(' + ReportData.CurVesData.auditRptAttach[19].otherType + ')' : " ") : " ";

        }
      }
      /*if (_(ReportData.CurVesData.auditRptAttach).chain().where({
        'attachmentTypeId' : Number(1005)
      }).pluck('attachmentTypeId').toString().indexOf("1005") != -1) {
      
        if (attachmentFile5 != '') {
      
        }
      
        at5 = "Other";
      
      }*/ 
     var othertype='';
     var  finaltype='';
       if(ReportData.CurVesData.auditRptAttach){
        for(let i=0;i<ReportData.CurVesData.auditRptAttach.length;i++){
        if  (ReportData.CurVesData.auditRptAttach[i].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[i].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[i].attachmentTypeDesc == 'OTHER'){
        finaltype= ((finaltype!='')? finaltype+',':'')+ ReportData.CurVesData.auditRptAttach[i].otherType
        }
        othertype = ReportData.CurVesData.auditRptAttach[i]&&(ReportData.CurVesData.auditRptAttach[i].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[i].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[i].attachmentTypeDesc == 'OTHER') ? (ReportData.CurVesData.auditRptAttach[i].attchTypeDescAudit || ReportData.CurVesData.auditRptAttach[i].attchmentTypeDesc || ReportData.CurVesData.auditRptAttach[i].attachmentTypeDesc) + (ReportData.CurVesData.auditRptAttach[i].attchTypeDescAudit == 'OTHER' || ReportData.CurVesData.auditRptAttach[i].attchmentTypeDesc == 'OTHER' || ReportData.CurVesData.auditRptAttach[i].attachmentTypeDesc == 'OTHER' ? '(' + finaltype + ')' : " ") : " ";
       }
      }
      var reportAttachment = [
        {
          text: 'ATTACHMENT TO THIS REPORT', alignment: 'left', fontSize: 12, bold: 'true',
          margin: [0, 10, 0, 5]
        },
        {
          margin: [-10, 0, 0, 0],

          table: {
            /*widths: [20, 103, 20, typeAudit==1005?200:120, 20, typeAudit==1005?15:95, 20, 77],*/

            /*heights: ['auto', '10', 10, 'auto', 10, 'auto', 10, 10],*/
            widths: [130, 140, 125, 125],
            /*heights: ['auto', '10', 10, 'auto', 10, 'auto', 10, 10],*/
            body: [
              [
                {
                  border: [true, true, false, true],
                  table: {
                    widths: [20,526], /**	MOBILE-498 fixed by kiran */
                    body: [
                      [{

                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas:at1 != " " &&!at1.includes('OTHER')? (atBox1 ? atBox1 : []) : []
                      },
                      {
                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at1.includes('OTHER')? at1.length>14? at1.substring(0,15)+'\n'+at1.substring(15,29)+'\n'+at1.substring(29,at1.length):at1:'', fontSize: 11, bold: false//modified by lokesh for jira_id(912)
                      }],
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas:at5 != " " &&!at5.includes('OTHER')? (atBox5 ? atBox5 : []) : []

                      },
                      {

                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at5.includes('OTHER')?at5.length>14? at5.substring(0,15)+'\n'+at5.substring(15,29)+'\n'+at5.substring(29,at5.length):at5:'', fontSize: 11, bold: false
                      }],
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas: at9 != " " &&!at9.includes('OTHER')? (atBox9 ? atBox9 : []) : []

                      },
                      {

                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at9.includes('OTHER')? at9.length>14? at9.substring(0,13)+'\n'+at9.substring(13,27)+'\n'+at9.substring(27,at9.length):at9:'', fontSize: 11, bold: false
                      }],
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas:at13 != " " &&!at13.includes('OTHER')? (atBox13 ? atBox13 : []) : []

                      },
                      {

                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at13.includes('OTHER')?at13.length>14?  at13.substring(0,13)+'\n'+at13.substring(15,29)+'\n'+at13.substring(29,at13.length):at13:'', fontSize: 11, bold: false
                      }],
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas: at17 != " " &&!at17.includes('OTHER')?(atBox17 ? atBox17 : []) : []

                      },
                      {
                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at17.includes('OTHER')? at17.length>14? at17.substring(0,15)+'\n'+at17.substring(15,29)+'\n'+at17.substring(29,at17.length):at17:'', fontSize: 11, bold: false
                      }],
                      
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                       // canvas: other[0] != " " &&other[0]? (other[0]? other[0].box : []) : []
                       canvas:othertype&&othertype!=''&&othertype!=' '? [
                        {type: 'rect', x: 10, y:1, w: 11, h: 11, lineColor: '#000',lineWidth: 1.2 },
                        {type: 'line',	x1: 21, y1: 1,x2: 10, y2: 12,lineWidth: 1.2},
                        {type: 'line',	x1: 10, y1: 1,x2: 21, y2: 12,lineWidth: 1.2}
                    ]:[]
                      },
                      {
                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text:othertype? othertype:'', fontSize: 11, bold: false
                      }],

                    ]
                  }, layout: 'noBorders'
                },
                {
                  border: [false, true, false, true],
                  table: {
                    widths: [20,526],
                    body: [
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas:  at2 != " " &&!at2.includes('OTHER')? (atBox2 ? atBox2 : []) : []
                      },
                      {
                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at2.includes('OTHER')? at2.length>14? at2.substring(0,15)+'\n'+at2.substring(15,29)+'\n'+at2.substring(29,at2.length):at2:'', fontSize: 11, bold: false//added by lokesh for jira_id(912)
                      }],
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas: at6 != " " &&!at6.includes('OTHER')? (atBox6 ? atBox6 : []) : []

                      },
                      {
                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text:!at6.includes('OTHER')?at6.length>14? at6.substring(0,14)+'\n'+at6.substring(14,27)+'\n'+at6.substring(27,at6.length):at6:'', fontSize: 11, bold: false
                      }],
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas:  at10 != " " &&!at10.includes('OTHER')?(atBox10 ? atBox10 : []) : []

                      },
                      {
                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at10.includes('OTHER')?at10.length>14? at10.substring(0,14)+'\n'+at10.substring(14,27)+'\n'+at10.substring(27,at10.length):at10:'', fontSize: 11, bold: false
                      }],
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas: at14 != " " &&!at14.includes('OTHER')?(atBox14 ? atBox14 : []) : []

                      },
                      {
                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at14.includes('OTHER')?at14.length>14?  at14.substring(0,14)+'\n'+at14.substring(14,27)+'\n'+at14.substring(27,at14.length):at14:'', fontSize: 11, bold: false
                      }],
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas: at18 != " " &&!at18.includes('OTHER')?(atBox18 ? atBox18 : []) : []

                      },
                      {
                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at18.includes('OTHER')?at18.length>14?  at18.substring(0,14)+'\n'+at18.substring(14,27)+'\n'+at18.substring(27,at18.length):at18:'', fontSize: 11, bold: false
                      }],

                    ]
                  }, layout: 'noBorders'
                },
                {
                  border: [false, true, false, true],
                  table: {
                    widths: [16,100],
                    body: [
                      [{
                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        canvas:  at3 != " " &&!at3.includes('OTHER')? (atBox3 ? atBox3 : []) : []

                      },
                      {
                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at3.includes('OTHER')? at3:'', fontSize: 11, bold: false
                      }],
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas:  at7 != " " &&!at7.includes('OTHER')? (atBox7 ? atBox7 : []) : []

                      },
                      {

                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at7.includes('OTHER')? at7:'', fontSize: 11, bold: false
                      }],
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas:  at11 != " " &&!at11.includes('OTHER')? (atBox11 ? atBox11 : []) : []

                      },
                      {

                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at11.includes('OTHER')? at11:'', fontSize: 11, bold: false
                      }],
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas:  at15 != " " &&!at15.includes('OTHER')? (atBox15 ? atBox15 : []) : []

                      },
                      {

                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at15.includes('OTHER')? at15:'', fontSize: 11, bold: false
                      }],
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas:  at19 != " " &&!at19.includes('OTHER')? (atBox19 ? atBox19 : []) : []

                      },
                      {

                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at19.includes('OTHER')? at19:'', fontSize: 11, bold: false
                      }],

                    ]
                  }, layout: 'noBorders'
                },
                {
                  border: [false, true, true, true],
                  table: {
                    widths: [16,100],
                    body: [
                      [{
                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        canvas: at4 != " " &&!at4.includes('OTHER')?(atBox4 ? atBox4 : []) : []

                      },
                      {
                        border: attachmentFile5 ? [false, true, true, false] : [false, true, true, true],
                        fillColor: '',
                        text: !at4.includes('OTHER')? at4:'', fontSize: 11, bold: false
                      }],
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas:  at8 != " " &&!at8.includes('OTHER')? (atBox8 ? atBox8 : []) : []

                      },
                      {

                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at8.includes('OTHER')? at8:'', fontSize: 11, bold: false
                      }],
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas:  at12 != " " &&!at12.includes('OTHER')? (atBox12 ? atBox12 : []) : []

                      },
                      {

                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at12.includes('OTHER')? at12:'', fontSize: 11, bold: false
                      }],
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas:  at16 != " " &&!at16.includes('OTHER')? (atBox16 ? atBox16 : []) : []

                      },
                      {

                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at16.includes('OTHER')? at16:'', fontSize: 11, bold: false
                      }],
                      [{
                        border: attachmentFile5 ? [true, true, false, false] : [true, true, false, true],
                        canvas:  at20 != " " &&!at20.includes('OTHER')? (atBox20 ? atBox20 : []) : []

                      },
                      {

                        border: attachmentFile5 ? [false, true, false, false] : [false, true, false, true],
                        fillColor: '',
                        text: !at20.includes('OTHER')? at20:'', fontSize: 11, bold: false
                      }],
                    ]
                  }, layout: 'noBorders'
                },
              ]]
          }, layout: {
            hLineWidth: function (i, node) {
              return (i === 0 || i === 1 || i === node.table.body.length) ? 1.6 : 1;
            },

            vLineWidth: function (i, node) {
              return (i === 0 || i === node.table.widths.length) ? 1.6 : 1;
            }
          }
        }

      ];
       /*modification are done by lokesh for jira_id(653,901) end here*/
      /*if(attachmentFile5!=''){
          
        reportAttachment[1].table.body.push([   
                
                {
                border: [true, false, false, true],
                  canvas: [
                                {type: 'rect', x: 10, y:1, w: 11, h: 11, lineColor: '#000',lineWidth: 1.2 },
                                {type: 'line',	x1: 21, y1: 1,x2: 10, y2: 12,lineWidth: 1.2},
                                {type: 'line',	x1: 10, y1: 1,x2: 21, y2: 12,lineWidth: 1.2}
                               ]
              },
              {   colSpan:7,
                border: [false, false, true, true],
                text: 'Others ('+othersName+')', fontSize: 11, bold:false
              },
              
              '','','','','',''
            ]);
        }*/
      /*AUDIT SUMMARY SECTION*/
      var auditSummary = [{
        text: [
          { text: reportSummaryTypeCaps + " SUMMARY", alignment: 'left', fontSize: 12, bold: 'true' }
        ], margin: [0, 10, 0, 5]
      },
      {
        margin: [-10, 0, 0, 0],
        table: {
          widths: [538],
          /*heights: ['auto', '10', 10, 'auto', 10, 'auto', 10, 10],*/
          body: [
            [
              {
                border: [true, true, true, true],
                fillColor: '',
                /*text:summaryHeading+'\n\n'+'     '+auditSummary,fontSize: 11, bold:false*/
                text: [
                  { text: summaryHeading + '\n\n', fontSize: 11, bold: false },
                  { text: auditSummaryValue, fontSize: 11, bold: false }]
              }
            ]]
        }, layout: {
          hLineWidth: function (i, node) {
            return (i === 0 || i === 1 || i === node.table.body.length) ? 1.5 : 1;
          },

          vLineWidth: function (i, node) {
            return (i === 0 || i === node.table.widths.length) ? 1.5 : 1;
          }
        }
      }

      ];

      /*AUDITOR DETAILS SECTION*/
      var auditorDetails: any = [{
        text: [
          { text: audinsTypeCaps + " DETAILS", alignment: 'left', fontSize: 12, bold: 'true' }
        ], margin: [0, 10, 0, 5]
      },
      {
        margin: [-10, 0, 0, 30],
        table: {
          widths: [115, 115, 80, 112, 70],
          /*heights: ['auto', '10', 10, 'auto', 10, 'auto', 10, 10],*/
          body: [
            [
              {
                border: [true, true, false, false],
                fillColor: '',
                text: 'Type', fontSize: 11, bold: true
              },
              {
                border: [false, true, false, false],
                fillColor: '',
                text: 'Name', fontSize: 11, bold: true
              },
              {
                border: [false, true, false, false],
                fillColor: '',
                text: 'ID', fontSize: 11, bold: true
              },
              {
                border: [false, true, false, false],
                fillColor: '',
                text: 'Signature', fontSize: 11, bold: true
              },
              {
                border: [false, true, true, false],
                fillColor: '',
                text: 'Date', fontSize: 11, bold: true, margin: [10, 0, 0, 0]
              }

            ]
          ]
        }, layout: {
          hLineWidth: function (i, node) {
            return (i === 0 || i === 1 || i === node.table.body.length) ? 1.5 : 1;
          },

          vLineWidth: function (i, node) {
            return (i === 0 || i === node.table.widths.length) ? 1.5 : 1;
          }
        }
      }

      ];

      var auditorDtl = ReportData.CurVesData.auditAuditorDetail
      var orderedAuditDtl = [];

      /*		forauditorDtl.length
          if(auditorDtl.length>2){
              auditorDtl.auditRoleDesc. =='Lead Auditor'
                
          }
        */

      /** added by kiran */
      var inspectarray = ReportData.CurVesData.auditAuditorDetail
      var leadauditorfilter = inspectarray.filter(function (otheratt) {
        return otheratt.audObsLead == 1;
      });
      var nonleadauditorfilter = inspectarray.filter(function (otheratt) {
        return otheratt.audObsLead != 1;
      });
      var mergingauditor = [...leadauditorfilter, ...nonleadauditorfilter];
      ReportData.CurVesData.auditAuditorDetail = mergingauditor

      /**end */

      ReportData.CurVesData.auditAuditorDetail
        .forEach(function (a, index) {

          var temp = false, auditorSignObj: any = '', tempArray = [], date = '', auditorSign = '';

          var userId = a.userId ? a.userId : '  -';

          if (ReportData.prelimAudit == 'No') {
            date = (a.audSignatureDate) ? (moment(a.audSignatureDate, YYYYMMDD)
              .format('DD-MMM-YYYY')) : "  -";

            auditorSign = (a.audSignature) ? 'data:image/jpeg;base64,' + atob(a.audSignature) : '';
          }

          if (index == ReportData.CurVesData.auditAuditorDetail.length - 1) {
            temp = true;
          }
          if (auditorSign === '') {
            auditorSignObj = [{
              border: temp == true ? [false, false, false, true] : [false, false, false, false],
              text: '', fontSize: 11, bold: false
            }];
          } else {
            auditorSignObj = [{
              border: temp == true ? [false, false, false, true] : [false, false, false, false],
              image: auditorSign, margin: [-20, 0, 0, 0], fit: [152, 30]
            }];
          }
   
          if(ReportData.CurVesData.auditTypeId == 1003 || ReportData.CurVesData.auditTypeId == 1005 ){
            tempArray = [
              {
                border: temp === true ? [true, false, false, true] : [true, false, false, false],
                text: ReportData.CurVesData.auditTypeId == 1006 ? "REVIEWER" :
                a.audObsLead==1?"LEAD INSPECTOR" :a.auditRoleDesc == "AUDITOR"? "INSPECTOR": a.auditRoleDesc, fontSize: 11, bold: false,
                margin: auditorSign != '' ? [0, 8, 0, 0] : [0, 0, 0, 0]
              },
              {
                border: temp === true ? [false, false, false, true] : [false, false, false, false],
                text: a.auditorName, fontSize: 11, bold: false,
                margin: auditorSign != '' ? [0, 8, 0, 0] : [0, 0, 0, 0]
              },
              {
                border: temp === true ? [false, false, false, true] : [false, false, false, false],
                text: userId, fontSize: 11, bold: false,
                margin: auditorSign != '' ? [0, 8, 0, 0] : [0, 0, 0, 0]
              }
            ]
  
          }else{
            tempArray = [
              {
                border: temp === true ? [true, false, false, true] : [true, false, false, false],
                text: ReportData.CurVesData.auditTypeId == 1006 ? "REVIEWER" :
                a.audObsLead==1?"LEAD"+" "+ a.auditRoleDesc : a.auditRoleDesc, fontSize: 11, bold: false,
                margin: auditorSign != '' ? [0, 8, 0, 0] : [0, 0, 0, 0]
              },
              {
                border: temp === true ? [false, false, false, true] : [false, false, false, false],
                text: a.auditorName, fontSize: 11, bold: false,
                margin: auditorSign != '' ? [0, 8, 0, 0] : [0, 0, 0, 0]
              },
              {
                border: temp === true ? [false, false, false, true] : [false, false, false, false],
                text: userId, fontSize: 11, bold: false,
                margin: auditorSign != '' ? [0, 8, 0, 0] : [0, 0, 0, 0]
              }
            ]
  
          }
         
         
          tempArray.push(auditorSignObj[0], {
            border: temp === true ? [false, false, true, true] : [false, false, true, false],
            text: date, fontSize: 11, bold: false,
            margin: auditorSign != '' ? [10, 8, 0, 0] : [10, 0, 0, 0]
          })

          auditorDetails[1].table.body.push(tempArray);



        });

      /*PREVIOUS AUDIT FINDINGS SECTION*/
      var auditFinding = ReportData.CurVesData.auditFinding;

      var previousAuditFingdings: any = [], PreviousDetails = [];
      var lastStatus: any = '';

      //
      var countInfoNew = 0;

      for (var i = 0; i < auditFinding.length; i++) {

        for (var j = 0; j < auditFinding[i].findingDetail.length; j++) {  // changed by archana for jira ID MOBILE-703
          if (auditFinding[i].findingDetail[j].descriptions) {      
            var vb = auditFinding[i].findingDetail[j].descriptions;  // changed by archana for jira ID MOBILE-703
            vb = (vb.match(/\n/g) || []).length;
            countInfoNew += vb;
          }
        }
      }

      /* Number.prototype.countDecimals = function () {
           if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
           return this.toString().split(".")[1].length || 0; 
       } */
      var pageCnt = countInfoNew / 50;
      var decPageCnt: any = pageCnt - Math.floor(pageCnt);
      decPageCnt = decPageCnt.toFixed(2) * 100;



      if (ReportData.CurVesData.auditTypeId != 1005
        && ReportData.CurVesData.auditTypeId != 1004) {
        if (ReportData.PreviousDetails
          && ReportData.PreviousDetails.length > 0) {
          //common content for all findings
          console.log("ReportData.PreviousDetails.length", ReportData.PreviousDetails);
          for (var i = 0; i < ReportData.PreviousDetails.length; i++) {
            var pushBlock = true;
            lastStatus = ReportData.PreviousDetails[i].findingDetail[ReportData.PreviousDetails[i].findingDetail.length - 1];
            console.log(lastStatus);
            if (lastStatus.statusDesc == "VERIFIED /CLOSED" && (lastStatus.currentAuditSeq < ReportData.CurVesData.auditSeqNo)) {
              pushBlock = false;
              console.log("entering false");
            } else {
              PreviousDetails.push(ReportData.PreviousDetails[i]);
            }

          }
          console.log("PreviousDetails", PreviousDetails);
          for (var n = 0; n < PreviousDetails.length; n++) {
            if (PreviousDetails[n].serialNo.indexOf('OBS') >= 0) {
              PreviousDetails.splice(n, 1);
            }
          }

          for (var n = 0; n < PreviousDetails.length; n++) {

            var countInfo = 0;
            var prevInfo = 0;
            if (n != 0 && PreviousDetails.length != 0) {
              for (var j = 0; j < PreviousDetails[n].findingDetail.length; j++) {

                if (PreviousDetails[n].findingDetail[j].descriptions) {
                  var vb = PreviousDetails[n].findingDetail[j].descriptions;
                  vb = (vb.match(/\n/g) || []).length;
                  countInfo += vb;
                }
              }
              for (var j = 0; j < PreviousDetails[n - 1].findingDetail.length; j++) {
                if (PreviousDetails[n - 1].findingDetail[j].descriptions) {
                  var vb = PreviousDetails[n - 1].findingDetail[j].descriptions;
                  vb = (vb.match(/\n/g) || []).length;
                  prevInfo += vb;
                }
              }
            }


            var findingHeader: any = '';

            if (n === 0) {
              findingHeader = { text: 'PREVIOUS ' + reportTypeCaps + ' FINDINGS', alignment: 'left', fontSize: 12, bold: true, pageBreak: (decPageCnt > 75) || (auditFinding.length > 0) ? '' : '', margin: [0, -20, 0, 4] }; // changed by archana for jira id MOBILE-703
            }

            previousAuditFingdings.push([
              findingHeader,
              {   /*lineHeight: 1.2,*/
                /*pageBreak: ((ReportData.CurVesData.previousFinding[0] && (ReportData.CurVesData.previousFinding[0].findingDetail.length == 1 || ReportData.CurVesData.previousFinding[0].findingDetail.length == 2)) && n===0 && 
                  ReportData.CurVesData.auditAuditorDetail.length <=2 && ReportData.CurVesData.auditFinding.length == 0)?'after':'',*/
                style: 'prevfindigTable',
                table: {
                  widths: [96, 99, 93, 99, 115],
                  heights: ['auto', 10, 10, 'auto', 10, 'auto', 10, 10],
                  body: [
                    [
                      {
                        colSpan: 5,
                        border: [true, true, true, true],
                        table: {
                          widths: [115, 150],
                          body: [
                            [{ text: 'CATEGORY', fontSize: 11, bold: false }, { text: audittype + " CODE", fontSize: 11, bold: false }],
                            [{ text: PreviousDetails[n].serialNo, fontSize: 11, bold: false }, { text: PreviousDetails[n].auditCode, fontSize: 11, bold: false }],
                          ]
                        }, layout: 'noBorders'
                      }, '', '', '', ''

                    ],
                    [
                      {
                        colSpan: 5,
                        border: [true, true, true, true],
                        fillColor: '',
                        text: [
                          { text: 'CATEGORY           ', fontSize: 12, bold: true },
                          { text: 'STATUS                     ', fontSize: 12, bold: true },
                          { text: 'STATUS DATE       ', fontSize: 12, bold: true },
                          { text: 'NEXT ACTION        ', fontSize: 12, bold: true },
                          { text: 'DUE DATE        ', fontSize: 12, bold: true },
                        ]
                      }, '', '', '', ''


                    ]]
                }, layout: {
                  hLineWidth: function (i, node) {
                    return (i === 0 || i === 1 || i === 2 || i === node.table.body.length) ? 1.5 : 1;
                  },

                  vLineWidth: function (i, node) {
                    return (i === 0 || i === node.table.widths.length) ? 1.5 : 1;
                  },
                  hLineColor: function (i, node) {
                    return (i === 0 || i === node.table.body.length) ? 'black' : 'black';
                  },
                  vLineColor: function (i, node) {
                    return (i === 0 || i === node.table.widths.length) ? 'black' : 'black';
                  },
                  paddingTop: function (i, node) { return 3; }

                },
                unbreakable: ((prevInfo < 35) || (countInfo > 42)) && ((n == 0) && decPageCnt > 75) ? false : true
              }]);
            for (var j = 0; j < PreviousDetails[n].findingDetail.length; j++) {

              if (PreviousDetails[n].findingDetail[j].updateDescription) {
                var Updatemsg = PreviousDetails[n].findingDetail[j].updateDescription;
                previousAuditFingdings[n][1].table.body.push([
                  {
                    colSpan: 5,
                    border: [true, true, true, true],
                    table: {
                      body: [[{

                        border: [true, true, true, true],
                        text: [{ text: Updatemsg, alignment: 'center', fontSize: 11 }
                        ]
                      }]]
                    }, layout: 'noBorders'
                  }, '', '', '', ''

                ])
              }
               /**  added by archana for jira ID MOBILE-703 start */
              var nextStatusDesc = '';
              if (PreviousDetails[n].findingDetail[j].categoryId == 1004) {
                nextStatusDesc = 'NIL';
              }
              else if (PreviousDetails[n].findingDetail[j].nextActionId == 1001) {
                nextStatusDesc = 'OPENED';
              } else if (PreviousDetails[n].findingDetail[j].nextActionId == 1002) {
                if(ReportData.CurVesData.auditTypeId == 1002 && PreviousDetails[n].findingDetail[j].categoryId == 1001){                //Added by @Archana jira id -Mobile-487
                  nextStatusDesc = 'DOWNGRADE  (RESTORE COMPLIANCE)';   
                }else if(ReportData.CurVesData.auditTypeId == 1002 && PreviousDetails[n].findingDetail[j].categoryId == 1002){
                  nextStatusDesc = 'RESTORE COMPLIANCE'
                } else {
                  nextStatusDesc = 'DOWNGRADE';
                }
              } else if (PreviousDetails[n].findingDetail[j].nextActionId == 1003) {
                nextStatusDesc = 'DOWNGRADED';
              }else if (PreviousDetails[n].findingDetail[j].nextActionId == 1004) {  //added by lokesh for jira_id(753)
                nextStatusDesc = 'RESTORE COMPLIANCE';
              } else if (PreviousDetails[n].findingDetail[j].nextActionId == 1006) {
                nextStatusDesc = 'PLAN ACCEPTED';
              } else if (PreviousDetails[n].findingDetail[j].nextActionId == 1007) {
                nextStatusDesc = 'VERIFIED /CLOSED';
              } else if (PreviousDetails[n].findingDetail[j].nextActionId == 1008) {
                nextStatusDesc = 'VERIFY / CLOSE';
              } else if (PreviousDetails[n].findingDetail[j].nextActionId == 1009) {
                nextStatusDesc = 'CLOSE';
              } else if (PreviousDetails[n].findingDetail[j].nextActionId == 1010) {
                nextStatusDesc = 'NIL';
              } else if (PreviousDetails[n].findingDetail[j].nextActionId == 1011) {
                nextStatusDesc = 'PREVIOUS STATUS';
              }
  
             
              if (ReportData.CurVesData.auditTypeId == 1001) {
                var CatagoryDesc = PreviousDetails[n].findingDetail[j].categoryId == 1001 ? 'MNC' : (PreviousDetails[n].findingDetail[j].categoryId == 1002 ? 'NC' : 'OBS');
              }
              else if (ReportData.CurVesData.auditTypeId == 1002) {
                var CatagoryDesc = PreviousDetails[n].findingDetail[j].categoryId == 1001 ? 'MF' : (PreviousDetails[n].findingDetail[j].categoryId == 1002 ? 'FAILURE' : 'OBS');
              } 
              else if(ReportData.CurVesData.auditTypeId == 1005){
                var CatagoryDesc = PreviousDetails[n].findingDetail[j].categoryId == 1005 ? 'REVIEW NOTES':"";
              }
              else {
                var CatagoryDesc = PreviousDetails[n].findingDetail[j].categoryId == 1001 ? 'SD' : (PreviousDetails[n].findingDetail[j].categoryId == 1002 ? 'DEFICIENCY' : 'OBS');
              }
             
  
              var PrevstatusDesc = '';
              if (PreviousDetails[n].findingDetail[j].statusId == 1001) {
                PrevstatusDesc = "OPEN"
              } else if (PreviousDetails[n].findingDetail[j].statusId == 1003) {
                if(ReportData.CurVesData.auditTypeId == 1002 && PreviousDetails[n].findingDetail[j].categoryId == 1001){       
                  PrevstatusDesc = "DOWNGRADED  (COMPLIANCE RESTORED)"
                }else{
                  PrevstatusDesc = "DOWNGRADED"
                }
              } else if (PreviousDetails[n].findingDetail[j].statusId == 1005) {
                if(ReportData.CurVesData.auditTypeId == 1002 && PreviousDetails[n].findingDetail[j].categoryId == 1002){       
                  PrevstatusDesc = "COMPLIANCE RESTORED"
                }else{
                  PrevstatusDesc = "DOWNGRADE  (RESTORE COMPLIANCE)"
                }
              } else if (PreviousDetails[n].findingDetail[j].statusId == 1006) {
                PrevstatusDesc = "PLAN ACCEPTED"
              } else if (PreviousDetails[n].findingDetail[j].statusId == 1008) {
                PrevstatusDesc = "VERIFIED /CLOSED"
              } else if (PreviousDetails[n].findingDetail[j].statusId == 1010) {
                PrevstatusDesc = "NIL"
              }
            console.log(PrevstatusDesc);
            console.log(CatagoryDesc);
            console.log(nextStatusDesc);
            
            /**  added by archana for jira ID MOBILE-703 end */
            
              previousAuditFingdings[n][1].table.body.push(

                [
                  {
                    border: [true, true, true, true],
                    fillColor: '',
                    text: CatagoryDesc, fontSize: 11, bold: false  // added by archana for jira ID MOBILE-703 
                  },
                  {
                    border: [false, true, true, true],
                    fillColor: '',
                    text: PrevstatusDesc, fontSize: 11, bold: false  // added by archana for jira ID MOBILE-703 
                  },
                  {
                    border: [false, true, true, true],
                    fillColor: '',
                    text: (PreviousDetails[n].findingDetail[j].statusDate) ? moment(
                      PreviousDetails[n].findingDetail[j].statusDate).format('DD-MMM-YYYY') : "NIL", fontSize: 11, bold: false
                  },
                  {
                    border: [false, true, true, true],
                    fillColor: '',
                    text: nextStatusDesc, fontSize: 11, bold: false    // added by archana for jira ID MOBILE-703  
                  }, {
                    border: [false, true, true, true],
                    fillColor: '',
                    text: (/[A-Z]/.test(PreviousDetails[n].findingDetail[j].dueDate) )? PreviousDetails[n].findingDetail[j].dueDate :
                          moment(PreviousDetails[n].findingDetail[j].dueDate).format('DD-MMM-YYYY'), fontSize: 11, bold: false        // added by archana for jira id MOBILE-729
                  }

                ],
                [
                  {
                    colSpan: 5,
                    border: [true, true, true, true],
                    fillColor: '',
                    text: [
                      { text: 'DESCRIPTION\n', fontSize: 12, bold: true },
                      {
                        text: PreviousDetails[n].findingDetail[j].descriptions ?
                          PreviousDetails[n].findingDetail[j].descriptions : '    NIL   '
                        , fontSize: 11, bold: false
                      },
                    ],
                    margin: [0, 0, 0, 0]
                  }, '', '', '', ''


                ]
              )
            }
          }
          //}

        }


      }
      
      /**added by archana for jira Id-MOBILE-746 start */
      var dmlcReviewNote=[];
      	if(ReportData.CurVesData.auditTypeId == 1003 && ReportData.dmlcFinding!=''){
				var dmlcReviewNoteHeader:any = '';
				var auditFinding = ReportData.dmlcFinding;
				
				dmlcReviewNoteHeader = "DMLC-II REVIEW NOTES";
				if (auditFinding.length > 0) {
					 for( var i=0; i<auditFinding.length; i++){
					       
					     var findingHeader:any = '';
					     
					    if(i===0){
					    findingHeader={text: dmlcReviewNoteHeader, alignment: 'left', fontSize: 12, bold: true, margin: ReportData.PreviousDetails.length ==0?[0, -20, 0, 4]: [0, -20, 0, 4]};
					    }
					    
					    dmlcReviewNote.push([
						    findingHeader,
					        {   
							style: 'dmlcRevNoteTable',
							table: {
							    	widths: [96, 99, 93, 99, 115],
							    	heights: ['auto', 10, 10, 'auto', 10, 'auto', 10, 10],
								body: [
									[
										{   colSpan: 5,
											border: [true, true, true, true],
								 			fillColor: '',
								 			table: {
											     widths: [115,150],
												body: [
													[{text:'CATEGORY',fontSize: 11, bold:false},{text:"DMLCII CODE",fontSize: 11, bold:false}],
													[{text:auditFinding[i].serialNo,fontSize: 11, bold:false},{text:auditFinding[i].auditCode,fontSize: 11, bold:false}],
												]
											},layout: 'noBorders'
										},'','','',''
									],
									[
										{   colSpan: 5,
											border: [true, true, true, true],
								 			fillColor: '',
										    text: [
										            {text: 'CATEGORY           ', fontSize: 12, bold: true},
							                        {text: 'STATUS                     ', fontSize: 12, bold: true},
							                        {text: 'STATUS DATE       ', fontSize: 12, bold: true},
							                        {text: 'NEXT ACTION        ', fontSize: 12, bold: true},
							                        {text: 'DUE DATE        ', fontSize: 12, bold: true},
							                      ]
										},'','','',''
										 
										
									]]},layout: {
								hLineWidth: function (i, node) {
									return (i === 0 || i === 1|| i === 2||i === node.table.body.length) ? 1.5 : 1;
								},
								
								vLineWidth: function (i, node) {
									return (i === 0 || i === node.table.widths.length) ? 1.5 : 1;
								},
								hLineColor: function (i, node) {
									return (i === 0 || i === node.table.body.length) ? 'black' : 'black';
								},
								vLineColor: function (i, node) {
									return (i === 0 || i === node.table.widths.length) ? 'black' : 'black';
								},
								 paddingTop: function(i, node) { return 3; }
								
						}
						}]);

							for( var j=0; j<auditFinding[i].findingDtl.length; j++){
								
								if(auditFinding[i].findingDtl[j].updateDescription){
									var Updatemsg = ReportData.dmlcFinding[i].findingDtl[j].updateDescription;
									dmlcReviewNote[i][1].table.body.push([
									   {   colSpan: 5,
										   border: [true, true, true, true],
										   table: { 
												body: [[{
														 
													border: [true, true, true, true],
													  text:[{text:Updatemsg , alignment: 'justify' , fontSize: 11}
												         ]
													 }]]
										   },layout: 'noBorders'
										},'','','',''
									                                              
									  ])
								}

                if(ReportData.CurVesData.auditTypeId == 1003){
                  console.log(auditFinding[i].findingDtl[j].categoryId);
                  
                  var catagoryDesc = auditFinding[i].findingDtl[j].categoryId == 1005 ? 'REVIEW NOTES':"";
                }

                if (auditFinding[i].findingDtl[j].nextActionId == 1007) {
                   var nextActionDesc = 'VERIFY / CLOSE';
                } else if(auditFinding[i].findingDtl[j].nextActionId == 1010){
                  var nextActionDesc = 'NIL'
                }

                if (auditFinding[i].findingDtl[j].statusId == 1001) {
                  var statusDesc = 'OPEN';
               } else if(auditFinding[i].findingDtl[j].statusId == 1008){
                 var statusDesc = 'VERIFIED /CLOSED'
               }
             
                dmlcReviewNote[i][1].table.body.push(
							        
							        [
										{
											border: [true, true, true, true],
								 			fillColor: '',
											text: catagoryDesc,fontSize: 11, bold:false
										},
										{
											border: [false, true, true, true],
											fillColor: '',
											text:statusDesc, fontSize: 10, bold:false
										},
										{
											border: [false, true, true, true],
											fillColor: '',
											text:(auditFinding[i].findingDtl[j].statusDate) ? moment(
													auditFinding[i].findingDtl[j].statusDate).format('DD-MMM-YYYY') : "NIL", fontSize: 11, bold:false
										},
						                {
											border: [false, true, true, true],
											fillColor: '',
											text:nextActionDesc, fontSize: 10, bold:false
										},{
											border: [false, true, true, true],
											fillColor: '',
											text: auditFinding[i].findingDtl[j].dueDate, fontSize: 11, bold:false
										}
										
									],
									[
										{   colSpan: 5,
											border: [true, true, true, true],
								 			fillColor: '',
										    text: [
								                    {text: 'DESCRIPTION\n', fontSize: 12, bold: true},
							                        {text: auditFinding[i].findingDtl[j].descriptions ?
							                        		auditFinding[i].findingDtl[j].descriptions : '    NIL   '
							                        		, fontSize: 11, bold: false},
							                      ]
										},'','','',''
										
										
									]
								)
							}
					    }
					
				}
				else if(auditFinding.length == 0){
					dmlcReviewNoteHeader =	{text: dmlcReviewNoteHeader+"               :    NIL", alignment: 'left', fontSize: 12, bold: true, margin: [0, 0, 0, 20]};
					dmlcReviewNote.push([dmlcReviewNoteHeader]);
				}
			}
      /**added by archana for jira Id-MOBILE-746 end */

      /*NARRATIVE SUMMARY SECTION*/
      var summaryVal = ReportData.CurVesData.narrativeSummary ?
        decodeURIComp(ReportData.CurVesData.narrativeSummary) : '';
      var textStrInner = summaryVal;
      var domParser = new DOMParser();
      var docElement = domParser.parseFromString(textStrInner, "text/html").documentElement;

      summaryVal = docElement.textContent;
      //added by lokesh for jira_id(844)
      if(summaryVal==null||summaryVal==undefined||summaryVal=="null"||summaryVal=="undefined"){
        summaryVal='';
      }

      var narrativeSummary: any = [
        { text: summaryVal ? 'NARRATIVE SUMMARY' : 'NARRATIVE SUMMARY             :    NIL', alignment: 'left', fontSize: 12, bold: 'true', margin: [0, -10, 0, 0], pageBreak: summaryVal ? 'before' : '' },   // changed by archana for jira id MOBILE-656
        {
          margin: [-10, 0, 0, 0],
          table: {
            widths: [538],
            heights: [700],  // changed by archana for jira id MOBILE-656
            body: []
          }, layout: {
            hLineWidth: function (i, node) {
              return (i === 0 || i === 1 || i === node.table.body.length) ? 1.5 : 1;
            },

            vLineWidth: function (i, node) {
              return (i === 0 || i === node.table.widths.length) ? 1.5 : 1;
            }
          }
        }

      ];

      if (!summaryVal) {
        narrativeSummary[1].table.body.push([{ border: [false, false, false, false], text: '' }]);
      } /**Added code to fix MOBILE-506 by kiran */
      // else if (summaryVal) { 
      //   narrativeSummary[1].table.body.push([{ border: [true, true, true, true], text: summaryVal }]);  // removed by archana for jira id MOBILE-656
      // } 
      else {
        await this.getHeight(ReportData).then((res) => {
          var canvas: any = document.createElement('canvas');
          canvas.id = "canvasReport";
          canvas.width = 890;
          canvas.height = res;
          console.log("canvas.height", canvas.height)

          var body = document.getElementsByTagName("body")[0];
          body.appendChild(canvas);
          var canvashiddenEnd = document.getElementById('canvasReport');
          //	canvashiddenEnd.addClass('hidden');    

          canvas = document.getElementById("canvasReport");
          var html_container: HTMLElement = document.createElement('e1');
          html_container.innerHTML = decodeURIComp(ReportData.CurVesData.narrativeSummary);

          /*OVERALL  IMAGE DATA*/
          console.log(html_container);
          var html = html_container.innerHTML;
          rasterizeHTML.drawHTML(html, canvas);
          console.log(rasterizeHTML.drawHTML(html, canvas));
          //narrativeSummary[1].table.body.push([{border: [false, false, false, false],text:'asdfasdfsdfsdfsd'}]);	
          console.log('summaryVal', summaryVal);
          //PAGE COUNT
          console.log(res);
          var val: any = ('' + res / 1160).split('.')[0];
          console.log('val : ', val);
          var arr = [];

          for (var i = 0; i <= val; i++) {
            console.log(arr[i]);
            arr[i] = (i + 1) * 1160;
            console.log(arr[i]);
            if (i == val) {
              arr[i] = res - (val * 1160);
            } console.log(arr[i]);
          }

          //setTimeout( () => {

          var temp = 0, tempValue = 0;
          console.log("arr.length : ", arr.length);
          for (var k = 0; k < arr.length; k++) {
            var canvasEle: any = document.createElement('canvas');
            canvasEle.id = "canvasEle";
            canvasEle.width = 890;
            canvasEle.height = 1160;

            var body = document.getElementsByTagName("body")[0];
            body.appendChild(canvasEle);

            var canvashiddenEnd = document.getElementById('canvasEle');
            // canvashiddenEnd.addClass('hidden');
            canvasEle = document.getElementById("canvasEle");
            var ctx = canvasEle.getContext("2d");
            ctx.fillText(summaryVal, 10, 50);
            ctx.font = "30px Arial";
            var top = 0;

            tempValue = (arr.length - 1 == k) ? arr[k] : 1160;

            var img: any = document.getElementById("canvasReport");

            ctx.drawImage(img, 0, temp, 890, tempValue, 0, 0, 890, tempValue);

            temp = arr[k];

            var elem = canvasEle.toDataURL('image/jpg', '1.0');

            console.log("element image", elem)
            narrativeSummary[1].table.body.push([{
              text: summaryVal,  // changed by archana for jira id MOBILE-656
              border: [true, true, true, true],
              image: elem,
              // fit: [600, 700], // removed by archana for jira id MOBILE-656

            }]);
            $('#canvasEle').remove();

            if ((k != (arr.length - 1))) {

              //doc.addPage();
            }

            if (k == (arr.length - 1)) {

              $('#canvasReport').remove();
            }
          }
          console.log("narrative summary end...")
          //},1000);	         


        })

      }

      /*NEW AUDIT FINDINGS SECTION*/

      var newAuditFingdings = [];
      var newAuditFindingHeader: any = '';
      var newFinding = ReportData.auditFinding;

      if (ReportData.CurVesData.auditTypeId != 1005 && ReportData.CurVesData.auditTypeId != 1006) {
        newAuditFindingHeader = "NEW " + reportTypeCaps + " FINDINGS";

      } else if (ReportData.CurVesData.auditTypeId == 1005) {
        newAuditFindingHeader = "REVIEW NOTES:";
      }

      if (newFinding.length > 0) {

        //common content for all findings
        for (var i = 0; i < newFinding.length; i++) {
          var countInfo = 0;
          var prevInfo = 0;

          if (i != 0) {
            console.log(newFinding);
            for (var j = 0; j < newFinding[i].findingDtl.length; j++) {
              if (newFinding[i].findingDtl[j].descriptions) {
                var vb = newFinding[i].findingDtl[j].descriptions;
                vb = (vb.match(/\n/g) || []).length;
                countInfo += vb;
              }
            }
            for (var j = 0; j < newFinding[i - 1].findingDtl.length; j++) {
              if (newFinding[i - 1].findingDtl[j].descriptions) {
                var vb = newFinding[i - 1].findingDtl[j].descriptions;
                vb = (vb.match(/\n/g) || []).length;
                prevInfo += vb;
              }
            }
          }
          var findingHeader: any = '';

          if (i === 0) {
            findingHeader = { text: newAuditFindingHeader, alignment: 'left', fontSize: 12, bold: true, /*pageBreak: (countInfo >15) ? 'before' : '',*/  margin: [0, -20, 0, 4] };
          }

          newAuditFingdings.push([
            findingHeader,
            {   /*lineHeight: 1.2,*/
              style: 'currentfindigTable',
              /*pageBreak: ((ReportData.CurVesData.auditFinding[0] && ReportData.CurVesData.auditFinding[0].findingDetail.length == 2) && i===0 && 
                  ReportData.CurVesData.auditAuditorDetail.length <=3 )?'after':'',*/
              table: {
                widths: [96, 99, 93, 99, 115],
                heights: ['auto', 10, 10, 'auto', 10, 'auto', 10, 10],
                body: [
                  [
                    {
                      colSpan: 5,
                      border: [true, true, true, true],
                      fillColor: '',
                      table: {
                        widths: [115, 150],
                        body: [
                          [{ text: 'CATEGORY', fontSize: 11, bold: false }, { text: audittype + " CODE", fontSize: 11, bold: false }],
                          [{ text: newFinding[i].serialNo, fontSize: 11, bold: false }, { text: newFinding[i].auditCode, fontSize: 11, bold: false }],
                        ]
                      }, layout: 'noBorders'
                    }, '', '', '', ''

                  ],
                  [
                    {
                      colSpan: 5,
                      border: [true, true, true, true],
                      fillColor: '',
                      text: [{ text: 'CATEGORY           ', fontSize: 12, bold: true },
                      { text: 'STATUS                     ', fontSize: 12, bold: true },
                      { text: 'STATUS DATE       ', fontSize: 12, bold: true },
                      { text: 'NEXT ACTION        ', fontSize: 12, bold: true },
                      { text: 'DUE DATE        ', fontSize: 12, bold: true },

                      ]
                    }, '', '', '', ''


                  ]]
              }, layout: {
                hLineWidth: function (i, node) {
                  return (i === 0 || i === 1 || i === 2 || i === node.table.body.length) ? 1.5 : 1;
                },

                vLineWidth: function (i, node) {
                  return (i === 0 || i === node.table.widths.length) ? 1.5 : 1;
                },
                hLineColor: function (i, node) {
                  return (i === 0 || i === node.table.body.length) ? 'black' : 'black';
                },
                vLineColor: function (i, node) {
                  return (i === 0 || i === node.table.widths.length) ? 'black' : 'black';
                },
                paddingTop: function (i, node) { return 3; }

              },
              unbreakable: ((prevInfo < 35) || (countInfo > 42)) && (i == 0) ? false : true
            }]);
          //need to check.....
          for (var j = 0; j < newFinding[i].findingDtl.length; j++) {

            if (newFinding[i].findingDtl[j].updateDescription) {
              var Updatemsg = newFinding[i].findingDtl[j].updateDescription;
              newAuditFingdings[i][1].table.body.push([
                {
                  colSpan: 5,
                  border: [true, true, true, true],
                  table: {
                    body: [[{

                      border: [true, true, true, true],
                      text: [{ text: Updatemsg, alignment: 'center', fontSize: 11 }
                      ]
                    }]]
                  }, layout: 'noBorders'
                }, '', '', '', ''

              ])
            }
/******/				console.log(newFinding[i].findingDtl[j].nextActionDesc)
            //	if(auditFinding[i].findingDetail[j].catagoryDesc != 'OBS'){
            var nextStatus = '';
            if (newFinding[i].findingDtl[j].categoryId == 1004) {
              nextStatus = 'NIL';
            }
            else if (newFinding[i].findingDtl[j].nextActionId == 1001) {
              nextStatus = 'OPENED';
            } else if (newFinding[i].findingDtl[j].nextActionId == 1002) {
              if(ReportData.CurVesData.auditTypeId == 1002 && newFinding[i].findingDtl[j].categoryId == 1001){                //Added by @Archana jira id -Mobile-487
                nextStatus = 'DOWNGRADE  (RESTORE COMPLIANCE)';   
              }else if(ReportData.CurVesData.auditTypeId == 1002 && newFinding[i].findingDtl[j].categoryId == 1002){
                nextStatus = 'RESTORE COMPLIANCE'
              } else {
                nextStatus = 'DOWNGRADE';
              }
            } else if (newFinding[i].findingDtl[j].nextActionId == 1003) {
              nextStatus = 'DOWNGRADED';
            } else if (newFinding[i].findingDtl[j].nextActionId == 1006) {
              nextStatus = 'PLAN ACCEPTED';
            } else if (newFinding[i].findingDtl[j].nextActionId == 1007) {
              nextStatus = 'VERIFIED /CLOSED';
            } else if (newFinding[i].findingDtl[j].nextActionId == 1008) {
              nextStatus = 'VERIFY / CLOSE';
            } else if (newFinding[i].findingDtl[j].nextActionId == 1009) {
              nextStatus = 'CLOSE';
            } else if (newFinding[i].findingDtl[j].nextActionId == 1010) {
              nextStatus = 'NIL';
            } else if (newFinding[i].findingDtl[j].nextActionId == 1011) {
              nextStatus = 'PREVIOUS STATUS';
            }

            /** fixed MOBILE-397 added by kiran start */
            if (ReportData.CurVesData.auditTypeId == 1001) {
              var catagoryDesc = newFinding[i].findingDtl[j].categoryId == 1001 ? 'MNC' : (newFinding[i].findingDtl[j].categoryId == 1002 ? 'NC' : 'OBS');
            }
            else if (ReportData.CurVesData.auditTypeId == 1002) {
              var catagoryDesc = newFinding[i].findingDtl[j].categoryId == 1001 ? 'MF' : (newFinding[i].findingDtl[j].categoryId == 1002 ? 'FAILURE' : 'OBS');
            } /** Fixed MOBILE-482 added by kiran */
            else if(ReportData.CurVesData.auditTypeId == 1005){
              var catagoryDesc = newFinding[i].findingDtl[j].categoryId == 1005 ? 'REVIEW NOTES':"";
            }
            else {
              var catagoryDesc = newFinding[i].findingDtl[j].categoryId == 1001 ? 'SD' : (newFinding[i].findingDtl[j].categoryId == 1002 ? 'DEFICIENCY' : 'OBS');
            }
            /** fixed MOBILE-397 added by kiran end */

            var statusDesc = '';
            if (newFinding[i].findingDtl[j].statusId == 1001) {
              statusDesc = "OPEN"
            } else if (newFinding[i].findingDtl[j].statusId == 1003) {
              if(ReportData.CurVesData.auditTypeId == 1002 && newFinding[i].findingDtl[j].categoryId == 1001){        //Added by @Archana jira id -Mobile-487
                statusDesc = "DOWNGRADED  (COMPLIANCE RESTORED)"
              }else{
                statusDesc = "DOWNGRADED"
              }
            } else if (newFinding[i].findingDtl[j].statusId == 1005) {
              if(ReportData.CurVesData.auditTypeId == 1002 && newFinding[i].findingDtl[j].categoryId == 1002){       //Added by @Archana jira id -Mobile-487
                statusDesc = "COMPLIANCE RESTORED"
              }else{
                statusDesc = "DOWNGRADE  (RESTORE COMPLIANCE)"
              }
            } else if (newFinding[i].findingDtl[j].statusId == 1006) {
              statusDesc = "PLAN ACCEPTED"
            } else if (newFinding[i].findingDtl[j].statusId == 1008) {
              statusDesc = "VERIFIED /CLOSED"
            } else if (newFinding[i].findingDtl[j].statusId == 1010) {
              statusDesc = "NIL"
            }

            newAuditFingdings[i][1].table.body.push(

              [
                {
                  border: [true, true, true, true],
                  fillColor: '',
                  text: catagoryDesc, fontSize: 11, bold: false
                },
                {
                  border: [false, true, true, true],
                  fillColor: '',
                  text: statusDesc, fontSize: 10, bold: false
                },
                {
                  border: [false, true, true, true],
                  fillColor: '',
                  text: (newFinding[i].findingDtl[j].statusDate) ? moment(
                    newFinding[i].findingDtl[j].statusDate).format('DD-MMM-YYYY') : "NIL", fontSize: 11, bold: false
                },
                {
                  border: [false, true, true, true],
                  fillColor: '',
                  text: nextStatus, fontSize: 10, bold: false
                }, {
                  border: [false, true, true, true],
                  fillColor: '',
                  //**Fixed MOBILE-451 by kiran */
                  text: (/[A-Z]/.test(newFinding[i].findingDtl[j].dueDate) )? newFinding[i].findingDtl[j].dueDate :
                    moment(newFinding[i].findingDtl[j].dueDate).format('DD-MMM-YYYY'),
                     fontSize: 11, bold: false
                }

              ],
              [
                {
                  colSpan: 5,
                  border: [true, true, true, true],
                  fillColor: '',
                  text: [
                    { text: 'DESCRIPTION\n', fontSize: 12, bold: true },
                    { text: newFinding[i].findingDtl[j].description ? newFinding[i].findingDtl[j].description : '    NIL   ', fontSize: 11, margin: [0, 20] }
                  ],
                  margin: [0, 0, 0, 10]

                }, '', '', '', ''


              ]
            )
            //}
          
          }
        }

      }

      if (ReportData.CurVesData.auditTypeId != 1004 && ReportData.CurVesData.auditTypeId != 1006) {
        if (newFinding.length == 0) {
          newAuditFindingHeader = { text: newAuditFindingHeader + "               :    NIL", alignment: 'left', fontSize: 12, bold: true, margin: [0, -20, 0, 30] };
          newAuditFingdings.push([newAuditFindingHeader]);
        }

        if (ReportData.PreviousDetails
          && ReportData.PreviousDetails.length == 0 && ReportData.CurVesData.auditTypeId != 1005 && ReportData.CurVesData.auditTypeId != 1006) {
          findingHeader = { text: 'PREVIOUS ' + reportTypeCaps + ' FINDINGS    :    NIL', alignment: 'left', fontSize: 12, bold: true, margin: auditFinding.length == 0 ? [0, -20, 0, 30] : [0, -20, 0, 30] };
          previousAuditFingdings.push([findingHeader]);
        }
        console.log(ReportData);
      }



      dd.content.push(
        reportHeader,
        reportVesselDtl,
        auditorCertiDtl,
        reportAttachment,
        auditSummary,
        auditorDetails,
        newAuditFingdings,
        previousAuditFingdings,
        dmlcReviewNote,
        narrativeSummary
      );

      pdfMake.createPdf(dd, "", "", this.fonts).getBlob(data => {
        this.fileManager.checkPdfDirectory().then(() => {
          this.fileManager.writePdfInTheDirectory(data, ReportData.CurVesData.vesselName + '_' + ReportData.CurVesData.vesselImoNo + '_Prelim' + audittype + '_' + moment(new Date()).format('DD-MMMM-YYYY') + '.pdf', "Report").then(
            () => {
              this.fileManager.openPdf(ReportData.CurVesData.vesselName + '_' + ReportData.CurVesData.vesselImoNo + '_Prelim' + audittype + '_' + moment(new Date()).format('DD-MMMM-YYYY') + '.pdf').then(() => {
                resolve({ data: "Success" });
              });
            }
          );
        });
      });
      this.loader.hideLoader();
    });
  }

  /* dmlcII Receipt letter*/
  public dmlcReceiptletter(ReceiptData) {
    return new Promise<object>(async (resolve, reject) => {
      this.loader.showLoader("Preparing Letter");
      
      var companyaddress = ReceiptData.companyaddress.split("  ");
      if(ReceiptData.auditSubTypeID != 1002){
        var check = moment(ReceiptData.receiptdate, 'DDMMMYYYY');  
        var Adate = check.format('MMMM');
        var splitAuditDate = ReceiptData.receiptdate.split('-');
        var AuditDate = splitAuditDate[0] + ' ' + Adate + ' ' + splitAuditDate[2];
      }else 
      if(ReceiptData.auditSubTypeID == 1002){
        var check = moment(ReceiptData.receiptdate, 'YYYY/MM/DD'); 
        var Adate = check.format('MMMM'); 
        var splitAuditDate = ReceiptData.receiptdate.split('-');
        splitAuditDate[2] =  splitAuditDate[2]?splitAuditDate[2].slice(0,2):'';//modified by lokesh for  jira_id(845)
        var AuditDate = splitAuditDate[2] + ' ' + Adate + ' ' + splitAuditDate[0];
      }
      var footer = 'MSC-400P Rev. 4/18';
      var auditorName = ReceiptData.nameFull ? ReceiptData.nameFull : "(Name)";
      var title = ReceiptData.title ? ReceiptData.title : "(Appointment)";
      let _that = this;

      var dmlcReceiptletter = {
        ownerPassword: '123456',
        permissions: {
          printing: 'lowResolution',
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: false,
          documentAssembly: false,
        },
        footer: {
          columns: [
            // 'Left part',
            { text: footer, alignment: 'right', margin: [30, -50] }
          ]
        },
        /* defaultStyle:{
         font:'TimesNewRoman'
         },*/
        pageSize: 'Letter',

        content: [
          {
            columns: [
              {
                image: _that.images['logo'],
                width: 80,
                height: 80,
                margin: [20, 10],

              },

              {
                width: '*',
                text: [
                  { text: 'Republic of the Marshall Islands\n', fontSize: 18, bold: true, color: 'black' },
                  { text: 'Maritime Administrator\n\n', fontSize: 14, bold: true, color: 'black' },
                  { text: '11495 Commerce Park Drive, Reston, Virginia 20191-1506\n', fontSize: 10, bold: false, color: 'black' },
                  { text: 'Telephone: +1-703-620-4880   Fax: +1-703-476-8522 \n', fontSize: 10, color: 'black' },
                  { text: 'Email: msc@register-iri.com   Website: www.register-iri.com', fontSize: 10, color: 'black' },
                ],
                style: 'rightme'
              },
            ]
          },
          {
            text: 'Maritime Administrator', bold: false, fontSize: 8, margin: [20, 0, 0, 0], italics: true
          },
          {
            columns: [
              {
                text: AuditDate.replace(/^0+/, ''),
                margin: [20, 30, 0, 0],
                fontSize: 12
              }
            ]
          },
          {
            text: [
              { text: 'RE: ', fontSize: 12, bold: true },
              { text: 'Declaration of Maritime Labour Compliance (DMLC), Part II Review Receipt', bold: true, fontSize: 12 }
            ],
            margin: [20, 20, 0, 0]
          },

          // Vessel Details
          {
            columns: [
              {
                text: [
                  { text: ReceiptData.vesselNameAud },
                  { text: " (Official Number " + ReceiptData.officialNoAud + ", " + "IMO Number " + ReceiptData.vesselImoNo + ')' }
                ],
                fontSize: 12
              },

            ],
            margin: [20, 20, 0, 0]
          },
          {
            text: ReceiptData.companyName + '\n',
            margin: [20, 0, 0, 0],
            fontSize: 12
          },
          // {  // removed by archana for jira id-MOBILE-651
          //   text: companyaddress[0],
          //   margin: [20, 0, 0, 0],
          //   fontSize: 12
          // },
          {   // (companyaddress[0]+' '+) commented by archana for jira id-MOBILE-651
            text: companyaddress[0]+' '+(companyaddress[1] ? companyaddress[1] :'' ) +  ' ' + (companyaddress[2] ? companyaddress[2] : '' ) + ' ' + (companyaddress[3] ? companyaddress[3] : '' ) + ' ' + (companyaddress[4] ? companyaddress[4] : '' ) + ' ' + (companyaddress[5] ? companyaddress[5] : '' ),    //changed by @Archana id - Mobile-554
            margin: [20, 0, 0, 0],
            fontSize: 12
          },
          {
            text: "To Whom It May Concern:",
            margin: [20, 20, 0, 0], fontSize: 12
          },
          {
            text: "Please be advised that the DMLC, Part II for the vessel named above has been received for review by the Republic of the Marshall Islands Maritime Administrator.",
            margin: [20, 20, 20, 0],
            alignment: 'justify',
            fontSize: 12
          },
          {
            text: 'A copy of this letter must be placed on board the vessel as evidence that the DMLC, Part II was submitted for review under Standard  A5.1.3,  paragraph  10  of the Maritime Labour Convention, 2006.',
            margin: [20, 10, 20, 0],
            alignment: 'justify',
            fontSize: 12
          },
          {
            text: "Regards,",
            margin: [20, 20, 0, 0],
            fontSize: 12
          },
          {
            stack: [
              {
                image: ReceiptData.signature ? "data:image/png;base64," + ReceiptData.signature : _that.images["transparent"],
                width: 230,
                height: 30,
                //alignment:'right',
                margin: [0, 30, 0, 0]
              },

              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0, y1: 5,
                    x2: 290, y2: 5,
                    lineWidth: 1
                  }
                ]
              },
              {
                text: auditorName + "\n" + title + "\n" + "Issued by the authority of the Republic of the \n Marshall Islands Maritime Administrator",

              },
              {
                image: ReceiptData.sealImage ? "data:image/png;base64," + ReceiptData.sealImage : _that.images["transparent"],
                width: 120,
                height: 120,
                alignment: 'right',
                margin: [20, -100]
              }

            ],
            margin: [20, 20, 0, 0]
          }

        ],
        //    				pageMargins: [10, 10, 20, 10],
        background: function (currentPage, pageSize) {
          return {
            image: _that.images['watermark'],
            width: 300,
            absolutePosition: { x: 150, y: 260 },
            opacity: 0.7
          }
        },
        styles: {
          rightme:
          {
            alignment: 'center',
            margin: [0, 10, 80, 0]
          },
          fntSize:
          {
            fontSize: 12
          }
        }

      }

      console.log(dmlcReceiptletter);
      pdfMake.createPdf(dmlcReceiptletter, "", "", this.fonts).getBlob(data => {
        console.log(data);
        this.fileManager.checkPdfDirectory().then(() => {
          console.log("dada");
          this.fileManager.writePdfInTheDirectory(
            data,
            "" + ReceiptData.certificateNo + ".pdf",
            "Certificate"
          ).then(() => {
            this.fileManager.openPdf("" + ReceiptData.certificateNo + ".pdf").then(() => {
              resolve({ data: "Success" });
            });
          });
        });
      });
      this.loader.hideLoader()

    });


  }

  /*DMLCII Review Letter */
  public dmlcReviewletter(ReviewData) {
    return new Promise<object>(async (resolve, reject) => {
      this.loader.showLoader("Preparing Letter");

      var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      var companyaddress = ReviewData.companyaddress.split("  ");
      console.log(companyaddress);
      var check = moment(ReviewData.auditDate, 'MMMDDYYYY');
      var Adate = check.format('MMMM');
      var splitAuditDate = ReviewData.auditDate.split('-');
      var AuditDate = splitAuditDate[0] + ' ' + Adate + ' ' + splitAuditDate[2];
      console.log("AuditDate", AuditDate);

      var footer = 'MI-400F Rev. 4/18';
      var auditorName = ReviewData.nameFull ? ReviewData.nameFull : "(Name)";
      var title = ReviewData.title ? ReviewData.title : "(Appointment)";

      var check1 = moment(ReviewData.receiptdate, 'MMMDDYYYY');
      var Rdate = check1.format('MMMM');
      var splitReceiptDate = ReviewData.receiptdate.split('-');
      var receiptDate = splitReceiptDate[0] + ' ' + Rdate + ' ' + splitReceiptDate[2];
      let _that = this;

      var dmlcReviewletter = {
        ownerPassword: '123456',
        permissions: {
          printing: 'lowResolution',
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: false,
          documentAssembly: false,
        },
        footer: {
          columns: [
            // 'Left part',
            { text: footer, alignment: 'right', margin: [30, -50] }
          ]
        },
        /*defaultStyle:{
          font:'Times'
        },*/
        pageSize: 'Letter',
        content: [
          {
            columns: [
              {
                image: _that.images['logo'],
                width: 80,
                height: 80,
                margin: [20, 10],

              },
              {
                width: '*',
                text: [
                  { text: 'Republic of the Marshall Islands\n', fontSize: 18, bold: true, color: 'black' },
                  { text: 'Maritime Administrator\n\n', fontSize: 14, bold: true, color: 'black' },
                  { text: '11495 Commerce Park Drive, Reston, Virginia 20191-1506\n', fontSize: 10, bold: false, color: 'black' },
                  { text: 'Telephone: +1-703-620-4880   Fax: +1-703-476-8522 \n', fontSize: 10, color: 'black' },
                  { text: 'Email: msc@register-iri.com   Website: www.register-iri.com', fontSize: 10, color: 'black' },
                ],
                style: 'rightme'
              },
            ]
          },
          {
            text: 'Maritime Administrator', bold: false, fontSize: 8, margin: [20, 0, 0, 0], italics: true
          },
          {
            columns: [
              {

                text: AuditDate.replace(/^0+/, ''),
                margin: [20, 30, 0, 0],
                style: 'fntSize'
              }
            ]
          },
          {
            text: [
              { text: 'RE: ', fontSize: 12, bold: true },
              { text: 'Declaration of Maritime Labour Compliance (DMLC), Part II Review Letter', bold: true, fontSize: 12 }
            ],
            margin: [20, 20, 0, 0]
          },

          // Vessel Details
          {
            columns: [
              {
                text: [
                  { text: ReviewData.vesselNameAud },
                  { text: "(Official Number " + ReviewData.officialNoAud + ", " + "IMO Number " + ReviewData.vesselImoNo + ')' }
                ],
                style: 'fntSize'
              },

            ],
            margin: [20, 30, 0, 0]
          },
          {
            text: ReviewData.companyName + '\n',
            margin: [20, 0, 0, 0],
            style: 'fntSize'
          },
          // {
          //   text: companyaddress[0],
          //   margin: [20, 0, 0, 0],
          //   style: 'fntSize'
          // },
          {  // (companyaddress[0]+' '+) commented by archana for jira id-MOBILE-651
            text: companyaddress[0]+' '+(companyaddress[1] ? companyaddress[1] :'' ) +  ' ' + (companyaddress[2] ? companyaddress[2] : '' ) + ' ' + (companyaddress[3] ? companyaddress[3] : '' ) + ' ' + (companyaddress[4] ? companyaddress[4] : '' ) + ' ' + (companyaddress[5] ? companyaddress[5] : '' ),    //changed by @Archana id - Mobile-554
            margin: [20, 0, 0, 0],
            style: 'fntSize'
          },
          {
            text: "To Whom It May Concern:",
            margin: [20, 20, 0, 0],
            style: 'fntSize'
          },
          {
            text: "The  DMLC,  Part  II   revision " + ReviewData.revisionNo + ",  dated " + receiptDate + ",  for the vessel named above has been reviewed by the Republic of the Marshall Islands (RMI) Maritime  Administrator  pursuant  to  Standard  A5.1.3,  paragraph   10   of   the Maritime Labour Convention, 2006 (MLC, 2006)  and  RMI  requirements  for  implementing  MLC,  2006. The DMLC, Part II review is considered satisfactory subject to:",
            margin: [20, 20, 20, 0],
            alignment: 'justify',
            style: 'fntSize'
          },
          {
            ol: [
              { text: 'Satisfactory completion  of  onboard  inspection  to  verify implementation  of the measures drawn up by the shipowner in the DMLC, Part II.', fontSize: 12 }
            ],
            margin: [60, 20, 15, 0],
            style: 'fntSize'
          },
          {
            text: "Regards,",
            margin: [20, 20, 0, 0],
            style: 'fntSize'
          },
          {
            stack: [
              {
                image: ReviewData.signature ? "data:image/png;base64," + ReviewData.signature : _that.images["transparent"],
                width: 230,
                height: 30,
                //alignment:'right',
                margin: [0, 30, 0, 0]
              },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0, y1: 5,
                    x2: 290, y2: 5,
                    lineWidth: 1
                  }
                ]
              },
              {
                text: auditorName + "\n" + title + "\n" + "Issued by the authority of the Republic of the \n Marshall Islands Maritime Administrator",

              },
              {
                image: ReviewData.sealImage ? "data:image/png;base64," + ReviewData.sealImage : _that.images["transparent"],
                width: 120,
                height: 120,
                alignment: 'right',
                margin: [10, -100]
              }
            ],
            margin: [20, 20, 0, 0]
          }

        ],

        background: function (currentPage, pageSize) {
          return {
            image: _that.images['watermark'],
            width: 300,
            absolutePosition: { x: 150, y: 260 },
            opacity: 0.7
          }
        },
        styles: {
          rightme:
          {
            alignment: 'center',
            margin: [0, 10, 80, 0]
          },
          fntSize:
          {
            fontSize: 12
          }
        }
      }

      pdfMake.createPdf(dmlcReviewletter, "", "", this.fonts).getBlob(data => {
        this.fileManager.checkPdfDirectory().then(() => {
          this.fileManager.writePdfInTheDirectory(
            data,
            "" + ReviewData.certificateNo + ".pdf",
            "Certificate"
          ).then(() => {
            this.fileManager.openPdf("" + ReviewData.certificateNo + ".pdf").then(() => {
              resolve({ data: "Success" });
            });
          });
        });
      });
      this.loader.hideLoader()

    });
  }

  /* dmlc amendmentReview letter*/
  public dmlcAmendmentReviewLetter(ReviewData) {
    console.log('+++++++++++++++++++++++++++++++',ReviewData,'+++++++++++++++++++++++++');
    return new Promise<object>(async (resolve, reject) => {
      this.loader.showLoader("Preparing Letter");

      var footer = 'MI-400G Rev. 4/18';
      var companyaddress = ReviewData.companyaddress.split("  ");
      var check = moment(ReviewData.auditDate, 'MMMDDYYYY');
      var Adate = check.format('MMMM');
      var splitAuditDate = ReviewData.auditDate.split('-');
      var AuditDate = splitAuditDate[2] + ' ' + Adate + ' ' + splitAuditDate[0];

      var check1 = moment(ReviewData.receiptdate, 'MMMDDYYYY');
      var Rdate = check1.format('MMMM');
      var splitReceiptDate = ReviewData.receiptdate.split('-');
      splitReceiptDate[2] =  splitReceiptDate[2]?splitReceiptDate[2].slice(0,2):''; // Added by sudharsan for Jira id-543
      var receiptDate = splitReceiptDate[2] + ' ' + Rdate + ' ' + splitReceiptDate[0];
      var auditorName = ReviewData.nameFull ? ReviewData.nameFull : "(Name)";
      var title = ReviewData.title ? ReviewData.title : "(Appointment)";
      let _that = this;

      var dmlcAmendmentletter = {
        ownerPassword: '123456',
        permissions: {
          printing: 'lowResolution',
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: false,
          documentAssembly: false,
        },
        footer: {
          columns: [
            // 'Left part',
            { text: footer, alignment: 'right', margin: [30, -50], fontSize: 12 }
          ]
        },
        content: [
          {
            columns: [
              {
                image: _that.images['logo'],
                width: 80,
                height: 80,
                margin: [20, 10],

              },
              {
                width: '*',
                text: [
                  { text: 'Republic of the Marshall Islands\n', fontSize: 18, bold: true, color: 'black' },
                  { text: 'Maritime Administrator\n\n', fontSize: 14, bold: true, color: 'black' },
                  { text: '11495 Commerce Park Drive, Reston, Virginia 20191-1506\n', fontSize: 10, bold: false, color: 'black' },
                  { text: 'Telephone: +1-703-620-4880   Fax: +1-703-476-8522 \n', fontSize: 10, color: 'black' },
                  { text: 'Email: msc@register-iri.com   Website: www.register-iri.com', fontSize: 10, color: 'black' },
                ],
                style: 'rightme'
              },
            ]
          },
          {
            text: 'Maritime Administrator', bold: false, fontSize: 8, margin: [20, 0, 0, 0], italics: true
          },
          {
            columns: [
              {
                text: AuditDate,
                margin: [20, 30, 0, 0]
              }
            ]
          },
          {
            text: [
              { text: 'RE: ', style: 'fntSize', bold: true, },
              { text: 'Declaration of Maritime Labour Compliance (DMLC), Part II Amendment(s) Review Letter', bold: true, fontSize: 12 }
            ],
            margin: [20, 20, 0, 0]
          },

          // Vessel Details 

          {
            columns: [
              {
                text: [
                  { text: ReviewData.vesselNameAud },
                  { text: " (Official Number " + ReviewData.officialNoAud + ", " + "IMO Number " + ReviewData.vesselImoNo + ')' }
                ]
              },

            ],
            margin: [20, 30, 0, 0]
          },
          {
            text: ReviewData.companyName,     //changed by @Archana jira id - Mobile-557
            margin: [20, 0, 0, 0],
            fontSize: 12
          },
          // {
          //   text: companyaddress[0],
          //   margin: [20, 0, 0, 0],
          //   fontSize: 12
          // },
          { // (companyaddress[0]+' '+) commented by archana for jira id-MOBILE-651
            text: companyaddress[0]+' '+(companyaddress[1] ? companyaddress[1] :'' ) +  ' ' + (companyaddress[2] ? companyaddress[2] : '' ) + ' ' + (companyaddress[3] ? companyaddress[3] : '' ) + ' ' + (companyaddress[4] ? companyaddress[4] : '' ) + ' ' + (companyaddress[5] ? companyaddress[5] : '' ),    //changed by @Archana id - Mobile-554
            margin: [20, 0, 0, 0],
            fontSize: 12
          },
          {
            text: "To Whom It May Concern:",
            margin: [20, 20, 0, 0],
            fontSize: 12
          },
          {
            text: "Please be advised that the DMLC, Part II Amendment(s) revision " + ReviewData.revisionNo + ", dated " + receiptDate + ", for the vessel named above has/have been reviewed and is/are considered acceptable pursuant to Standard A5.1.3, paragraph 10 of the Maritime Labour Convention, 2006 (MLC, 2006) and the Republic of the Marshall Islands requirements for implementing MLC, 2006.",
            margin: [20, 20, 0, 0],
            alignment: 'left',
            fontSize: 12
          },
          {
            text: 'A copy of this letter and associated DMLC, Part II amendment(s) must be available on board.',
            margin: [20, 10, 0, 0],
            fontSize: 12
          },
          {
            text: "Regards,",
            margin: [20, 20, 0, 0],
            fontSize: 12
          },
          {
            stack: [
              {
                image: ReviewData.signature ? "data:image/png;base64," + ReviewData.signature : _that.images["transparent"],
                width: 230,
                height: 30,
                //alignment:'right',
                margin: [0, 30, 0, 0]
              },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0, y1: 5,
                    x2: 290, y2: 5,
                    lineWidth: 1
                  }
                ]
              },
              {
                text: auditorName + "\n" + title + "\n" + "Issued by the authority of the Republic of the \n Marshall Islands Maritime Administrator",
                margin: [0, 10]

              },
              {
                image: ReviewData.sealImage ? "data:image/png;base64," + ReviewData.sealImage : _that.images["transparent"],
                width: 120,
                height: 120,
                alignment: 'right',
                margin: [10, -100]
              }
            ],
            margin: [20, 20, 0, 0]
          }

        ],
        pageSize: 'Letter',
        //		pageMargins: [10, 10, 20, 10],
        background: function (currentPage, pageSize) {
          return {
            image: _that.images['watermark'],
            width: 300,
            absolutePosition: { x: 150, y: 260 },
            opacity: 0.7
          }
        },
        styles: {
          rightme:
          {
            alignment: 'center',
            margin: [0, 10, 80, 0]
          },
          fntSize:
          {
            fontSize: 12
          }
        }
      }
      pdfMake.createPdf(dmlcAmendmentletter, "", "", this.fonts).getBlob(data => {
        this.fileManager.checkPdfDirectory().then(() => {
          this.fileManager.writePdfInTheDirectory(
            data,
            "" + ReviewData.certificateNo + ".pdf",
            "Certificate"
          ).then(() => {
            this.fileManager.openPdf("" + ReviewData.certificateNo + ".pdf").then(() => {
              resolve({ data: "Success" });
            });
          });
        });
      });
      this.loader.hideLoader()

    });
  }

  getHeight(ReportData: any) {
    return new Promise<number>((resolve, reject) => {
      var canvasGetHgt = document.createElement('canvas');
      var tmpHgt = 0;
      canvasGetHgt.id = "canvasGetHeight";
      canvasGetHgt.width = 797;
      var body = document.getElementsByTagName("body")[0];
      body.appendChild(canvasGetHgt);
      var canvashiddenhgt = document.getElementById('canvasGetHeight');

      // canvashiddenhgt.hidden;

      var canvashgt: any = document.getElementById("canvasGetHeight");
      rasterizeHTML.drawHTML(ReportData.narrativeSummary, canvashgt).then(function success(result: any) {
        var parser = new DOMParser();
        var parsedHtml = parser.parseFromString(result.svg, 'text/html');
        tmpHgt = parsedHtml.getElementsByTagName("svg")[0].height.baseVal.value;
        console.log("tmphgt", parsedHtml);
        resolve(tmpHgt);
      });
    });
  }

  dateSuffix(a) {
    if ((a >= 4 && a <= 20) || (a >= 24 && a <= 30)) {
      console.log("th");

      return a + "th";
    }

    if (a == 1 || a == 21 || a == 31) {
      console.log("st");

      return a + "st";
    }

    if (a == 2 || a == 22) {
      console.log("nd");

      return a + "nd";
    }

    if (a == 3 || a == 23) {
      console.log("rd");
      return a + "rd";
    }

    return " ";
  }

  ordinal_suffix_of(i) {
    var j = i % 10,
      k = i % 100;
    if (j == 1 && k != 11) {
      return i + "st";
    }
    if (j == 2 && k != 12) {
      return i + "nd"; 
    }
    if (j == 3 && k != 13) {
      return i + "rd";
    }
    return i + "th";
  }


}
