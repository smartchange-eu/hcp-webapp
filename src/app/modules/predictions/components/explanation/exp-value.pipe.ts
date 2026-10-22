import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'expValue',
})
export class ExpValuePipe implements PipeTransform {
  constructor(private _translate: TranslateService) {}

  transform(value: any): string {
    const toSearch = 'questionnaire.' + value + '.label';
    const toRet = this._translate.instant(toSearch);
    return toRet == toSearch ? value : toRet;
  }
}
