import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractAuthService } from '@modules/auth/services/abstract-auth-service';
import { DataBusService } from '@modules/service/services/data-bus.service';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss'],
})
export class UnauthorizedComponent {
  public constructor(
    private _auth: AbstractAuthService,
    private _router: Router,
    private _dataBusService: DataBusService
  ) {}

  protected navigateToAuth(): void {
    this._auth?.logout();
    this._dataBusService.clear();
  }
}
