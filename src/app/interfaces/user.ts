export interface CurrentUser {
    userId: string
    userName: string,
    password: string,
    displayName: string,
    imageUrl:string,
    masterDataRefresh: Date,
    companyId: number,
    isLogout:boolean
  }

  export interface MaUser {
    firstName: string,
    lastName: string,
    phoneNo: number,
    address: string,
    sequenceNo: number,
    identification: Blob,
    userId: string,
    userName: string,
    password: string,
    companyId: number,
    activeStatus: boolean,
    userIns: string,
    dateIns: Date,
    emailId: string,
    otp: string,
    signature: Blob,
}

/* NOTIFICATIONS */
export interface Notification{
  userName: string,
  msg:string,
  dateTime:Date,
  type:string
}