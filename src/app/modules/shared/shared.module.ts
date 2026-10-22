import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DateFnsModule } from 'ngx-date-fns';
import { BreadcrumbModule } from 'xng-breadcrumb';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule.forChild(),
    DateFnsModule,
    BreadcrumbModule,
  ],
  exports: [CommonModule, BreadcrumbModule, DateFnsModule, TranslateModule],
})
export class SharedModule {}
