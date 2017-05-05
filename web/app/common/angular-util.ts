import {NgForm, FormGroup } from '@angular/forms';

export class AngularUtil {
  
  public static markFormPristine(form: FormGroup | NgForm): void {
    Object.keys(form.controls).forEach(control => {
      form.controls[control].markAsPristine();
    });
  }
  
}