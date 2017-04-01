export class StringUtil {
  
  public static isEmptyNullOrUndefined(inputString: string) : boolean {
    return !(this.hasContent(inputString));
  }

  public static hasContent(inputString: string): boolean {
    if (inputString == null )
      return false;
    if (inputString ==="")
      return false
    return true;
  }
}