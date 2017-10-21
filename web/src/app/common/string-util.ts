export class StringUtil {

  public static isEmptyNullOrUndefined(inputString: string): boolean {
    return !(this.hasContent(inputString));
  }

  public static hasContent(inputString: string): boolean {
    return inputString && (inputString !== "");
  }
}
