import { Injectable } from '@angular/core';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { File } from '@ionic-native/file/ngx';
import { Zip } from '@ionic-native/zip/ngx';
import { Platform } from '@ionic/angular';
@Injectable({
  providedIn: 'root',
})
export class FileManagerService {
  directoryName: any;

  constructor(
    private file: File,
    private platform: Platform,
    private zip: Zip,
    private fileOpener: FileOpener
  ) {
    console.log(this.file.documentsDirectory);
  }

  getDirectoryURI() {
    if (
      this.platform.is('ipad') ||
      this.platform.is('ios') ||
      this.platform.is('iphone')
    ) {
      console.log('Testdb', this.file.documentsDirectory);
      this.directoryName = this.file.documentsDirectory;
    } else {
      this.directoryName = this.file.externalDataDirectory;
      console.log(this.directoryName);
      
    }
  }

  createAuditDetailsDirectoryIfNotExist(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.getDirectoryURI();
      this.file
        .checkDir(this.directoryName, 'AuditDetails')
        .then((_) => {
          console.info('Audit Details folder Exist');
          resolve(true);
        })
        .catch((err) => {
          console.info('Audit Details folder Not Exist');
          this.createAuditDetailsDirectory().then((res) => {
            resolve(true);
          });
        });
    });
  }

  createAuditDetailsDirectory() {
    return new Promise<Object>((resolve) => {
      console.log(this.directoryName);

      this.file
        .createDir(this.directoryName, 'AuditDetails', false)
        .then((_) => {
          console.info('AuditDetails folder created');
          resolve(true);
        })
        .catch((err) => {
          console.error('AuditDetails Directory Creation Failed..!!');
          resolve(false);
        });
    });
  }
  /* Audit Type Directory */
  createAuditTypeDirectoryIfNotExist(auditType) {
    console.log(this.directoryName + 'AuditDetails/', auditType);
    return new Promise<Object>((resolve, reject) => {
      this.file.getDirectory;
      this.file
        .checkDir(this.directoryName + 'AuditDetails/', auditType)
        .then((res) => {
          console.info('Audit Type folder Exist');
          resolve(true);
        })
        .catch((err) => {
          console.info('Audit Type folder Not Exist');
          this.createAuditTypeDirectory(auditType).then((res) => {
            resolve(true);
          });
        });
    });
  }
  /* Audit Directory */
  createAuditDirectoryIfNotExist(auditType, auditSeqNo) {
    console.log(
      this.directoryName + 'AuditDetails/' + auditType + '/',
      auditSeqNo
    );
    return new Promise<Object>((resolve, reject) => {
      this.file
        .checkDir(
          this.directoryName + 'AuditDetails/' + auditType + '/',
          auditSeqNo
        )
        .then((res) => {
          console.info('Audit folder Exist');
          resolve(true);
        })
        .catch((err) => {
          console.info('Audit folder Not Exist');
          this.createAuditDirectory(auditType, auditSeqNo).then((res) => {
            resolve(true);
          });
        });
    });
  }

  /*  
   createAuditTypeDirectoryIfNotExist(auditType): Promise<boolean> {
     console.log(auditType)
     return new Promise<boolean>((resolve,reject) => {
       this.file.checkDir(this.directoryName + '/AuditDetails', auditType).then(res => {
         console.info("Audit Type folder Exist");
         resolve(true);
       }).catch(err => {
         console.info("Audit Type folder Not Exist")
         this.createAuditTypeDirectory(auditType).then((res) => {
           resolve(true);
         });
       }
 
       );
     })
   } */

  createAuditTypeDirectory(auditType) {
    return new Promise<Object>((resolve) => {
      this.file
        .createDir(this.directoryName + '/AuditDetails', auditType, false)
        .then((_) => {
          console.info('AuditType folder created');
          resolve(true);
        })
        .catch((err) => {
          console.error('AuditType Directory Creation Failed..!!');
          resolve(false);
        });
    });
  }
  createAuditDirectory(auditType, auditSeqNo) {
    return new Promise<Object>((resolve) => {
      this.file
        .createDir(
          this.directoryName + '/AuditDetails/' + auditType,
          auditSeqNo,
          false
        )
        .then((_) => {
          console.info('Audit folder created');
          resolve(true);
        })
        .catch((err) => {
          console.error('Audit Directory Creation Failed..!!');
          resolve(false);
        });
    });
  }

  /*   Write Zip File */
  writeZipFile(
    auditTypeFolder,
    auditFolder,
    auditFileName,
    data
  ): Promise<boolean> {
    return this.file
      .writeFile(
        this.directoryName +
          '/AuditDetails/' +
          auditTypeFolder +
          '/' +
          auditFolder,
        auditFileName,
        data
      )
      .then((res) => {
        console.info('Zip file writed within ' + auditTypeFolder + ' folder');
        return true;
      });
  }

  /* Extract And Remove ZipFile */
  extractAndRemoveZipFile(auditTypeFolder, auditFolder, auditFileName) {
    return new Promise<Object>((resolve) => {
      this.zip
        .unzip(
          this.directoryName +
            'AuditDetails/' +
            auditTypeFolder +
            '/' +
            auditFolder +
            '/' +
            auditFileName,
          this.directoryName +
            '/AuditDetails/' +
            auditTypeFolder +
            '/' +
            auditFolder,
          (progress) =>
            console.log(
              'Unzipping, ' +
                Math.round((progress.loaded / progress.total) * 100) +
                '%'
            )
        )
        .then(
          (result) => {
            console.info(
              'Zip file extracted in ' + auditTypeFolder + ' folder'
            );
            if (result === 0) {
              this.file
                .removeFile(
                  this.directoryName +
                    'AuditDetails/' +
                    auditTypeFolder +
                    '/' +
                    auditFolder,
                  auditFileName
                )
                .then((res) => {
                  resolve(true);
                  console.info('Zip file extracted successfully');
                });
            } else if (result === -1) {
              console.error('Zip file Extract operation failed.');
            }
          },
          (err) => {
            console.log(err);
          }
        );
    });
  }

  /* extractAndRemoveZipFile(auditTypeFolder, auditFileName) {
    this.zip.unzip(this.directoryName + '/AuditDetails/' + auditTypeFolder + '/' + auditFileName, this.directoryName + '/AuditDetails/' + auditTypeFolder, (progress) => console.log('Unzipping, ' + Math.round((progress.loaded / progress.total) * 100) + '%')).then((result) => {
      console.info("Zip file extracted in " + auditTypeFolder + " folder");
      if (result === 0) {
        this.file.removeFile(this.directoryName + '/AuditDetails/' + auditTypeFolder, auditFileName).then(res => {
          console.info("Zip file extracted successfully")
        });
      }
      else if (result === -1) {
        console.error("Zip file Extract operation failed.")
      }
    },(err)=>{
      console.log(err);
    })
  } */

  getAuditDataFromJsonFile(auditTypeFolder, auditSeqNo): Promise<any> {
    this.directoryName == undefined ? this.getDirectoryURI() : '';
    console.log(
      this.directoryName,
      'AuditDetails' +
        '/' +
        auditTypeFolder +
        '/' /* + auditSeqNo + '/' */ +
        auditSeqNo +
        '/' +
        auditSeqNo +
        '.json'
    );
    return this.file
      .readAsText(
        this.directoryName,
        'AuditDetails' +
          '/' +
          auditTypeFolder +
          '/' /* + auditSeqNo + '/' */ +
          auditSeqNo +
          '/' +
          auditSeqNo +
          '.json'
      )
      .then((res) => {
        return JSON.parse(res);
      });
  }

  check_PF_Existance(auditTypeFolder, auditSeqNo): Promise<any> {
    return this.file
      .checkFile(
        this.directoryName +
          'AuditDetails/' +
          auditTypeFolder +
          '/' +
          auditSeqNo +
          '/pf/',
        'pf.json'
      )
      .then((res) => {
        return true;
      })
      .catch((err) => {
        console.log('previous findings not found..');
        return false;
      });
  }
  check_PAD_Existance(auditTypeFolder, auditSeqNo): Promise<any> {
    return this.file
      .checkFile(
        this.directoryName +
          'AuditDetails/' +
          auditTypeFolder +
          '/' +
          auditSeqNo +
          '/pf/',
        'PAD.json'
      )
      .then((res) => {
        return true;
      })
      .catch((err) => {
        console.log('previous audits not found..');
        return false;
      });
  }
  getPreviousFindingsDataFromJsonFile(
    auditTypeFolder,
    auditSeqNo
  ): Promise<any> {
    return this.file
      .readAsText(
        this.directoryName,
        'AuditDetails' +
          '/' +
          auditTypeFolder +
          '/' +
          auditSeqNo +
          '/pf/' +
          'pf.json'
      )
      .then((res) => {
        return JSON.parse(res);
      });
  }

  getPreviousAuditDataFromJsonFile(auditTypeFolder, auditSeqNo): Promise<any> {
    return this.file
      .readAsText(
        this.directoryName,
        'AuditDetails' +
          '/' +
          auditTypeFolder +
          '/' +
          auditSeqNo +
          '/' +
          'pf/' +
          'PAD.json'
      )
      .then((res) => {
        return JSON.parse(res);
      });
  }
  /* Retrieve part ends */

  /* Synchronization part starts here */

  /*   Write Audit Json File */
  writeFinalAuditJSON_File(
    auditTypeFolder,
    auditFolder,
    auditFileName,
    data
  ): Promise<boolean> {
    console.log(
      'writeFinalAuditJSON_File starts here.....',
      this.directoryName +
        '/AuditDetails/' +
        auditTypeFolder +
        '/' +
        auditFolder,
      auditFileName,
      data
    );
    const str = JSON.stringify(data);
    const bytes = new TextEncoder().encode(str);
    const blob = new Blob([bytes], {
      type: 'application/json;charset=utf-8',
    });

    return this.file
      .writeExistingFile(
        this.directoryName +
          '/AuditDetails/' +
          auditTypeFolder +
          '/' +
          auditFolder,
        auditFileName,
        blob
      )
      .then((res) => {
        console.info(
          'Final JSON file writed within ' +
            auditTypeFolder +
            '/' +
            auditFolder +
            ' folder'
        );
        return true;
      });
  }
  deleteInvalidAttachmentFiles(auditTypeFolder, auditFolder, fileName) {
    this.getDirectoryURI();
    let dirUrl =
      this.directoryName +
      '/AuditDetails/' +
      auditTypeFolder +
      '/' +
      auditFolder;
    console.log(
      this.directoryName +
        '/AuditDetails/' +
        auditTypeFolder +
        '/' +
        auditFolder
    );
    console.log(fileName);
    return new Promise<Object>((resolve, reject) => {
      this.file.removeFile(dirUrl, fileName).then((res) => {
        console.info(' file deleted successfully');
        resolve(true);
      });
    });
  }

  /* PF Directory */
  createPF_DirectoryIfNotExist(auditType, auditSeqNo) {
    return new Promise<Object>((resolve, reject) => {
      this.file
        .checkDir(
          this.directoryName +
            'AuditDetails/' +
            auditType +
            '/' +
            auditSeqNo +
            '/',
          'pf'
        )
        .then((res) => {
          console.info('PF Folder Exist');
          resolve(true);
        })
        .catch((err) => {
          console.info('PF Folder Not Exist');
          this.createPFDirectory(auditType, auditSeqNo).then((res) => {
            resolve(true);
          });
        });
    });
  }

  createPFDirectory(auditType, auditSeqNo) {
    return new Promise<Object>((resolve) => {
      this.file
        .createDir(
          this.directoryName + '/AuditDetails/' + auditType + '/' + auditSeqNo,
          'pf',
          false
        )
        .then((_) => {
          console.info('pf folder created');
          resolve(true);
        })
        .catch((err) => {
          console.error('pf Directory Creation Failed..!!');
          resolve(false);
        });
    });
  }

  /*   Write Audit Json File */
  writeFinalPFJSON_File(
    auditTypeFolder,
    auditFolder,
    auditFileName,
    data
  ): Promise<boolean> {
    const str = JSON.stringify(data);
    const bytes = new TextEncoder().encode(str);
    const blob = new Blob([bytes], {
      type: 'application/json;charset=utf-8',
    });
    return this.file
      .writeExistingFile(
        this.directoryName +
          '/AuditDetails/' +
          auditTypeFolder +
          '/' +
          auditFolder +
          '/pf',
        auditFileName,
        blob
      )
      .then((res) => {
        console.info(
          'Final PF JSON file writed within ' +
            auditTypeFolder +
            '/' +
            auditFolder +
            ' folder'
        );
        return true;
      });
  }

  getListOfDirectory(path: string, folderName: string, root?: boolean) {
    path = root === true ? this.directoryName + path : path;
    return new Promise<Array<any>>((resolve, reject) => {
      this.file
        .listDir(path, folderName)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          console.error('getting list of directory, failed.');
          reject([]);
        });
    });
  }

  getFileOfDirectory(path, fileName) {
    console.log('getFileOfDirectory called for', fileName);
    path = path.substring(0, path.lastIndexOf('/'));
    let val: any = null;
    return this.file.readAsArrayBuffer(path, fileName).then((res) => {
      return res;
    });
  }

  createDirectory(parentDirInstance, dirEle /* , zip, zipDestLocation */) {
    let dirName = dirEle.name,
      dirUrl = dirEle.nativeURL,
      dirInstance;
    dirUrl = dirUrl.substring(0, dirUrl.lastIndexOf('/'));
    dirUrl = dirUrl.substring(0, dirUrl.lastIndexOf('/'));
    dirInstance = parentDirInstance.folder(dirName); //create new folder with zip instance
    this.getListOfDirectory(dirUrl, dirName).then((dir) => {
      //get list of avail directory elements
      if (dir) {
        console.log('list of directories of ' + dirName, dir);
        dir.forEach((element) => {
          if (element.isFile) {
            //get file from file system and add file with zip instance
            dirInstance.file(
              element.name,
              this.getFileOfDirectory(element.nativeURL, element.name)
            );
          } else if (element.isDirectory) {
            this.createDirectory(
              dirInstance,
              element /* , zip, zipDestLocation */
            );
          }
        });
        //this.generateAndSaveZipFile(zipDestLocation.type, zipDestLocation.seq, zip);
      }
    });
  }

  generateAndSaveZipFile(audType, seqNo, zip) {
    return new Promise<boolean>((resolve, reject) => {
      zip.generateAsync({ type: 'blob' }).then((content) => {
        this.file
          .writeExistingFile(
            this.directoryName + 'AuditDetails/' + audType + '/',
            seqNo + '.zip',
            content
          )
          .then(
            (res) => {
              console.log('Zip File Created');
              resolve(true);
            },
            (err) => {
              console.log(err);
              reject(false);
            }
          );
      });
    });
  }

  getZipDataToSync(path) {
    return new Promise<string>((resolve, reject) => {
      console.log(
        this.directoryName + 'AuditDetails/' + path.type,
        path.seq + '.zip'
      );
      this.file
        .readAsDataURL(
          this.directoryName + 'AuditDetails/' + path.type,
          path.seq + '.zip'
        )
        .then(
          (res) => {
            //resolve(res);
            resolve(res.split(',')[1]);
          },
          (err) => {
            console.log(err);
            reject(null);
          }
        );
    });
  }

  removeAuditDirectory(audType, seq) {
    return new Promise<boolean>((resolve, reject) => {
      this.file
        .removeRecursively(this.directoryName + '/AuditDetails/' + audType, seq)
        .then(
          (res) => {
            this.file
              .removeFile(
                this.directoryName + '/AuditDetails/' + audType,
                seq + '.zip'
              )
              .then(
                (resp) => {
                  resolve(true);
                },
                (err) => {
                  console.log('zip file does not exist to remove.');
                  resolve(true);
                }
              );
          },
          (err) => {
            console.log('audit folder remove operation, failed.');
            resolve(true);
          }
        );
    });
  }

  checkPdfDirectory() {
    this.getDirectoryURI();
    return new Promise((resolve, reject) => {
      console.log('directory url ->>', this.directoryName + '/AuditDetails/');
      this.file
        .checkDir(this.directoryName + '/AuditDetails/', 'pdf')
        .then((res) => {
          console.log(res);
          resolve(true);
        })
        .catch((err) => {
          this.file
            .createDir(this.directoryName + '/AuditDetails', 'pdf', false)
            .then((res) => {
              console.log('pdf' + ' Directory Creating::res');
              resolve(true);
            })
            .catch((err) => {
              console.log('pdf' + ' Directory exists::err');
              reject(err);
            });
        });
    });
  }

  openPdf(fileName) {
    return new Promise((resolve, reject) => {
      this.fileOpener
        .open(
          this.directoryName + '/AuditDetails/' + 'pdf/' + fileName,
          'application/pdf'
        )
        .then(() => console.log('File is opened'))
        .catch((e) => console.log('Error opening file', e));
    });
  }
  /** added by archana for jira-id MOBILE-715 start */
  openPdfFindings(dir,attach) {
    return new Promise((resolve, reject) => {
      this.fileOpener
        .open(
          dir + attach,
          'application/pdf'
        )
        .then(() => console.log('File is opened'))
        .catch((e) => console.log('Error opening file', e));
    });
  }
  /** added by archana for jira-id MOBILE-715 end */


  writePdfInTheDirectory(data, fileName, certOrRep) {
    return new Promise((resolve, reject) => {
      this.file
        .writeFile(
          this.directoryName + '/AuditDetails/pdf',
          fileName,
          data /* base64ToArrayBuffer(data) */
        )
        .then(
          (res) => {
            //added by Ramya on 18-10-2022 for jira id - Mobile-713
            this.file
            .copyFile(
              this.directoryName +
                'AuditDetails/pdf/',
                fileName,
              this.file.externalRootDirectory +
                'Download/AUDITING_APP_DOWNLOADS/',
                fileName
               )
            console.log(certOrRep + ' Saved in the directory');
            resolve(true);
          },
          (err) => {
            this.file
              .writeExistingFile(
                this.directoryName + '/AuditDetails/pdf',
                fileName,
                data
              )
              .then(() => {
                //added by Ramya on 18-10-2022 for jira id - Mobile-713
                this.file
                .copyFile(
                  this.directoryName +
                    'AuditDetails/pdf/',
                    fileName,
                  this.file.externalRootDirectory +
                    'Download/AUDITING_APP_DOWNLOADS/',
                    fileName
                 )
                console.log(certOrRep + ' Saved in the directory');
                resolve(true);
              });
          }
        );
    });
  }

  /* Synchronization part end */

  /*  * Finding part starts  */

  deleteFindingAttachment(auditType, auditSeqNo, attachmentObj) {
    return new Promise((resolve, reject) => {
      /* attachmentObj contains :
    fileName
    fileSeqNo
    findingNo
    findingSeqNo */
      this.getDirectoryURI();
      console.log(attachmentObj);
     
       if(auditType == 'DMLC II'){           //added by archana for jira ID-MOBILE-808 
        auditType = 'DMLC_II';
       }
       
      this.file
        .removeFile(
          this.directoryName +
            '/AuditDetails/' +
            auditType +
            '/' +
            auditSeqNo +
            '/' +
            attachmentObj.findingNo +
            '/' +
            attachmentObj.findingSeqNo,
          attachmentObj.fileName
        )
        .then((_) => {
          console.info(
            'Finding attachment ' +
              attachmentObj.fileName +
              ' has been deleted successfully..'
          );
          resolve(true);
        })
        .catch((err) => {
          console.error(
            'Finding attachment ' +
              attachmentObj.fileName +
              ' deletion Failed..!!',
            err
          );
          resolve(false);
        });
    });
  }

  saveFindingAttachment(auditType, auditSeqNo, attachmentObj) {
    this.getDirectoryURI();
    if(auditType == 'DMLC II'){   //added by archana for jira ID-MOBILE-808 
      auditType = 'DMLC_II';
    }
    console.log(typeof auditType, typeof auditSeqNo, attachmentObj);
    /* attachmentObj contains :
        file
        fileName
        findingNo
        findingSeqNo
        fileSeqNo
    */

    return new Promise((resolve, reject) => {
      this.createFindingDirectoryIfNotExist(
        auditType,
        auditSeqNo,
        attachmentObj.findingNo
      ).then((_) => {
        this.createFindingDetailDirectoryIfNotExist(
          auditType,
          auditSeqNo,
          attachmentObj.findingNo,
          attachmentObj.findingSeqNo
        ).then((_) => {
          this.saveAttachedFindingFile(
            this.directoryName +
              '/AuditDetails/' +
              auditType +
              '/' +
              auditSeqNo +
              '/' +
              attachmentObj.findingNo +
              '/' +
              attachmentObj.findingSeqNo,
            attachmentObj.fileName,
            attachmentObj.file
          ).then((res) => {
            resolve(true);
          });
        });
      });
    });
  }

  createFindingDirectoryIfNotExist(
    auditType,
    auditSeqNo,
    findingNo
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.file
        .checkDir(
          this.directoryName +
            '/AuditDetails/' +
            auditType +
            '/' +
            auditSeqNo +
            '/',
          findingNo
        )
        .then((_) => {
          console.info('Finding Directory ' + findingNo + ' is Exist');
          resolve(true);
        })
        .catch((err) => {
          console.info('Finding Directory Not Exist');
          console.log(
            this.directoryName + '/AuditDetails/' + auditType + '/' + auditSeqNo
          );

          this.createFindingDirectory(
            this.directoryName +
              '/AuditDetails/' +
              auditType +
              '/' +
              auditSeqNo,
            findingNo
          ).then((res) => {
            resolve(true);
          });
        });
    });
  }

  createFindingDetailDirectoryIfNotExist(
    auditType,
    auditSeqNo,
    findingNo,
    findingSeqNo
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.file
        .checkDir(
          this.directoryName +
            '/AuditDetails/' +
            auditType +
            '/' +
            auditSeqNo +
            '/' +
            findingNo +
            '/',
          findingSeqNo
        )
        .then((_) => {
          console.info('Finding Directory ' + findingNo + ' is Exist');
          resolve(true);
        })
        .catch((err) => {
          console.info('Finding Directory Not Exist');
          console.log(
            this.directoryName + '/AuditDetails/' + auditType + '/' + auditSeqNo
          );

          this.createFindingDirectory(
            this.directoryName +
              '/AuditDetails/' +
              auditType +
              '/' +
              auditSeqNo +
              '/' +
              findingNo,
            findingSeqNo
          ).then((res) => {
            resolve(true);
          });
        });
    });
  }

  createFindingDirectory(path, folderName) {
    return new Promise<Object>((resolve) => {
      this.file
        .createDir(path, folderName, false)
        .then((_) => {
          console.info('Finding Directory created');
          resolve(true);
        })
        .catch((err) => {
          console.error(
            'Finding Directory ' + folderName + 'Creation Failed..!!',
            err
          );
          resolve(false);
        });
    });
  }

  saveAttachedFindingFile(path, fileName, file) {
    return new Promise<Object>((resolve) => {
      this.file
        .writeFile(path, fileName, file)
        .then((_) => {
          console.info('Write/save ' + fileName + ' created');
          resolve(true);
        })
        .catch((err) => {
          console.error('Write/save' + fileName + 'Creation Failed..!!', err);
          resolve(false);
        });
    });
  }

  /*   checkFindingDirectory() {
    return new Promise<boolean>((resolve, reject) => {
      checkFindingDirectory;
    });
  }

  checkFindingDetailsDirectory(): Boolean {
    return;
  }
 */
  /*  * Finding part end  */




  /**added by archana for jira-id MOBILE-599 start  */ 

  deletePrevFindingAttachment(auditType, auditSeqNo, attachmentObj, presentSeqNo) {
    return new Promise((resolve, reject) => {
      /* attachmentObj contains :
    fileName
    fileSeqNo
    findingNo
    findingSeqNo */
      this.getDirectoryURI();
      console.log(attachmentObj);

      this.file
        .removeFile(
          this.directoryName +
            '/AuditDetails/' +
            auditType +
            '/' +
            presentSeqNo +
            '/' +
            'pf/'+
            auditSeqNo + '/'+
            attachmentObj.findingNo +
            '/' +
            attachmentObj.findingSeqNo,
          attachmentObj.fileName
        )
        .then((_) => {
          console.info(
            'Finding attachment ' +
              attachmentObj.fileName +
              ' has been deleted successfully..'
          );
          resolve(true);
        })
        .catch((err) => {
          console.error(
            'Finding attachment ' +
              attachmentObj.fileName +
              ' deletion Failed..!!',
            err
          );
          resolve(false);
        });
    });
  }

 


  savePrevFindingAttachmentFile(auditType, auditSeqNo, attachmentObj, presentSeqNo) {
    console.log(this.getDirectoryURI());
    
    this.getDirectoryURI();
    console.log(typeof auditType, typeof auditSeqNo, attachmentObj, presentSeqNo);
    /* attachmentObj contains :
        file
        fileName
        findingNo
        findingSeqNo
        fileSeqNo
    */

    return new Promise((resolve, reject) => {
      console.log("a");
      
      this.createAuditDetailsDirectoryIfNotExist()
      .then((_)=>{
        this.createAuditTypeDirectoryIfNotExist(auditType)
        .then((_)=>{
          this.createAuditDirectoryIfNotExist(auditType, presentSeqNo)
          .then((_)=>{
            this.createPF_DirectoryIfNotExist(auditType, presentSeqNo)
            .then((_)=>{
              this.createPrevFindingAuditSeqNo(auditType,presentSeqNo,auditSeqNo)
              .then((_)=>{
      this.createPrevFindingDirectoryIfNotExist(
        auditType,
        auditSeqNo,
        attachmentObj.findingNo,presentSeqNo
      ).then((_) => {
        this.createPrevFindingDetailDirectoryIfNotExist(
          auditType,
          auditSeqNo,
          attachmentObj.findingNo,
          attachmentObj.findingSeqNo,presentSeqNo
        ).then((_) => {
          this.saveAttachedPrevFindingFile(
            this.directoryName +
              '/AuditDetails/' +
              auditType +
              '/' +
              presentSeqNo +
              '/' +
              'pf/'+
              auditSeqNo + '/'+
              attachmentObj.findingNo +
              '/' +
              attachmentObj.findingSeqNo,
            attachmentObj.fileName,
            attachmentObj.file
          ).then((res) => {
            resolve(true);
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


  createPrevFindingAuditSeqNo(auditType,presentSeqNo, auditSeqNo) {
    return new Promise<Object>((resolve, reject) => {
      this.file
        .checkDir(
          this.directoryName +
            'AuditDetails/' +
            auditType +
            '/' +
            presentSeqNo +
            '/pf/',
            auditSeqNo
        )
        .then((res) => {
          console.info('PF Folder Exist');
          resolve(true);
        })
        .catch((err) => {
          console.info('PF Folder Not Exist');
          this.createPFDirectoryForSeqno(auditType,presentSeqNo,auditSeqNo).then((res) => {
            resolve(true);
          });
        });
    });
  }
  createPFDirectoryForSeqno(auditType,presentSeqNo, auditSeqNo) {
    return new Promise<Object>((resolve) => {
      console.log(typeof auditSeqNo);
      
      this.file
        .createDir(
          this.directoryName + '/AuditDetails/' + auditType + '/' + presentSeqNo +
          '/pf',
          auditSeqNo.toString(),
          false
        )
        .then((_) => {
          console.info('AuditSeqNo folder created');
          resolve(true);
        })
        .catch((err) => {
          console.error('AuditSeqNo  Directory Creation Failed..!!');
          resolve(false);
        });
    });
  }


  

  createPrevFindingDirectoryIfNotExist(
    auditType,
    auditSeqNo,
    findingNo,
    presentSeqNo
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.file
        .checkDir(
          this.directoryName +
            '/AuditDetails/' +
            auditType +
            '/' +
            presentSeqNo +
            '/'+
            'pf/'+
            auditSeqNo +'/' 
            ,
          findingNo
        )
        .then((_) => {
          console.info('Finding Directory ' + findingNo + ' is Exist');
          resolve(true);
        })
        .catch((err) => {
          console.info('Finding Directory Not Exist');
          console.log(
            this.directoryName + '/AuditDetails/' + auditType + '/' + presentSeqNo + '/'+
            'pf/'+
            auditSeqNo 
          );

          this.createPrevFindingDirectory(
            this.directoryName +
              '/AuditDetails/' +
              auditType +
              '/' +
              presentSeqNo +
              '/pf/'+
              auditSeqNo ,
            findingNo
          ).then((res) => {
            resolve(true);
          });
        });
    });
  }

  createPrevFindingDetailDirectoryIfNotExist(
    auditType,
    auditSeqNo,
    findingNo,
    findingSeqNo,presentSeqNo
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.file
        .checkDir(
          this.directoryName +
            '/AuditDetails/' +
            auditType +
            '/' +
            presentSeqNo +
            '/' +
            'pf/'+
            auditSeqNo + '/'+
            findingNo +
            '/',
          findingSeqNo
        )
        .then((_) => {
          console.info('Finding Directory ' + findingNo + ' is Exist');
          resolve(true);
        })
        .catch((err) => {
          console.info('Finding Directory Not Exist');
          console.log(
            this.directoryName + '/AuditDetails/' + auditType + '/' + presentSeqNo
          );

          this.createPrevFindingDirectory(
            this.directoryName +
              '/AuditDetails/' +
              auditType +
              '/' +
              presentSeqNo +
              '/pf/'+
              auditSeqNo +
              '/' +
              findingNo,
            findingSeqNo
          ).then((res) => {
            resolve(true);
          });
        });
    });
  }

  createPrevFindingDirectory(path, folderName) {
    return new Promise<Object>((resolve) => {
      this.file
        .createDir(path, folderName, false)
        .then((_) => {
          console.info('Finding Directory created');
          resolve(true);
        })
        .catch((err) => {
          console.error(
            'Finding Directory ' + folderName + 'Creation Failed..!!',
            err
          );
          resolve(false);
        });
    });
  }

  saveAttachedPrevFindingFile(path, fileName, file) {
    return new Promise<Object>((resolve) => {
      this.file
        .writeFile(path, fileName, file)
        .then((_) => {
          console.info('Write/save ' + fileName + ' created');
          resolve(true);
        })
        .catch((err) => {
          console.error('Write/save' + fileName + 'Creation Failed..!!', err);
          resolve(false);
        });
    });
  }
/**added by archana for jira-id MOBILE-599 end  */ 

}
