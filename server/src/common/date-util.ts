
export class DateUtil {
  static createAuthenticationExpirationDate(): Date {
    const now: Date = new Date();
    let expirationDate: Date = new Date();
    expirationDate.setMilliseconds(now.getMilliseconds() + (8 * 60 * 60 * 1000));
    console.log("DateUtil.createAuthenticationExpirationDate - New Authentication Expiration Date = " + expirationDate);
    return expirationDate;
  }
}
