
export class DateUtil {
  public static createAuthenticationExpirationDate(): Date {
    const now: Date = new Date();
    const expirationDate: Date = new Date();
    expirationDate.setMilliseconds(now.getMilliseconds() + (8 * 60 * 60 * 1000));
    console.log("DateUtil.createAuthenticationExpirationDate - New Authentication Expiration Date = " + expirationDate);
    return expirationDate;
  }
}
