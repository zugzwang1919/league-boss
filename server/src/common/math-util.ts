export class MathUtil {

  static createGuid(): string {
    return MathUtil.s4() + MathUtil.s4() + '-' + 
      MathUtil.s4() + '-' + 
      MathUtil.s4() + '-' +
      MathUtil.s4() + '-' + 
      MathUtil.s4() + MathUtil.s4() + MathUtil.s4();
  }
  
  private static s4(): string {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
}
