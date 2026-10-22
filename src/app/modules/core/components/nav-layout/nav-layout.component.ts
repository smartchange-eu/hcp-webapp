import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AbstractAuthService } from '@modules/auth/services/abstract-auth-service';
import { lastValueFrom, Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import {
  Menu,
  MenuItemsService,
} from '@modules/core/services/menu-items.service';
import { LocaleService } from '@modules/service/services/locale.service';
import {
  Locale,
  Patient,
  User,
  Role,
  TranslationLanguage,
} from '@eng-it4h/heart-ui-model';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { Router } from '@angular/router';
import pkg from '../../../../../../package.json';
import { environment } from '@env/environment';
import { MatDialog } from '@angular/material/dialog';
import { Card } from '@eng-it4h/heart-ui-cdss';
import { intersection } from 'lodash-es';
import { XcdsConfig } from '@config/service/xcds-config';
import { ConfirmationDialogComponent } from '@eng-it4h/heart-ui-utils';
import { PatientService } from '@modules/service/services/patient.service';
import { SuggestionService } from '@modules/service/services/suggestion.service';
import { LogEvent } from '@modules/service/services/logging.decorator';
import { USER_EVENT_CONSTANTS } from '@config/user-events.conf';

@Component({
  selector: 'app-nav-layout',
  templateUrl: './nav-layout.component.html',
  styleUrls: ['./nav-layout.component.scss'],
})
export class NavLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private debug = environment.debug;
  public webAppVersion: string = pkg.version;

  public isSmall$: Observable<boolean>;
  // private translateSub$!: Subscription; // unused
  private DIALOG_WIDTH = '800px';

  public supportedLanguages: TranslationLanguage[];
  public currentLocale?: Locale;

  public currentPatient?: Patient;
  public lang?: string;
  public currentUser?: User;

  protected suggestionSidebar: boolean = environment.xcdsServiceEnabled;
  protected suggestionOpened: boolean = false;
  protected suggestionBadge: number = 0;
  protected messageBadge: number = 0;
  protected presentBadge: number = 0;

  protected tooltipDelay = 500; //ms di ritardo per l'apertura del tooltip

  protected menuItems: Menu[] = [];
  protected controlGroup = false;
  protected bugReportUrl?: string;
  constructor(
    private breakpointObserver: BreakpointObserver,
    private _auth: AbstractAuthService,
    private menuItemsService: MenuItemsService,
    private _localeService: LocaleService,
    private _dataBusService: DataBusService,
    private _patientService: PatientService,
    private _router: Router,
    private _suggestionService: SuggestionService,
    private dialog: MatDialog
  ) {
    this.isSmall$ = this.breakpointObserver
      .observe([
        Breakpoints.Handset,
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
      ])
      .pipe(
        map((result) => result.matches),
        shareReplay()
      );
    this.supportedLanguages = this._localeService.getSupportedLanguages();
    this._dataBusService.currentPatient$
      .pipe(takeUntil(this.destroy$))
      .subscribe((p) => {
        if (p?.patientIdentifier || p?.uuid?.value || p?.id) {
          this.currentPatient = p;
        } else {
          this.currentPatient = undefined;
        }
      });

    this._dataBusService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((u) => {
        if (u?.username) {
          this.currentUser = u;

          if (
            intersection(this.currentUser.roles, XcdsConfig.xcdsDisabledRoles)
              .length > 0
          ) {
            environment.xcdsServiceEnabled = false;
            this.suggestionSidebar = false;
          }
        } else {
          this.currentUser = undefined;
        }
      });

    if (environment.xcdsServiceEnabled) {
      this._dataBusService.currentGroup$
        .pipe(takeUntil(this.destroy$))
        .subscribe((p) => {
          if (p) this.controlGroup = p.group.code === 'control';
          else this.controlGroup = false;
        });

      this._suggestionService.cards$
        .pipe(takeUntil(this.destroy$))
        .subscribe((cards?: Card[]) => {
          if (this.debug) {
            console.log(
              'New: ' + cards?.length + ' ' + new Date().toISOString()
            );
          }
          this.updateSuggestionBadge();
          this.updatePresentBadge();
        });
      this._suggestionService.resetObs$
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.suggestionBadge = 0;
          },
        });
    }

    if (environment.bugReportUrl && environment.bugReportUrl.length > 0) {
      this.bugReportUrl = environment.bugReportUrl;
    }
  }

  ngOnInit(): void {
    this.lang = this._localeService.currentLanguage.toString();

    const patient: Patient =
      this.currentPatient instanceof User
        ? (this.currentPatient?.person as Patient)
        : (this.currentPatient as Patient);

    this.menuItems = this.menuItemsService.getMenuitem(patient) || [];
    this._localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });
    if (this.debug) {
      console.log(`CDSS Enabled: ${this.suggestionSidebar}`);
    }
  }

  @LogEvent(USER_EVENT_CONSTANTS.USER_LOGGED_OUT)
  public logout() {
    this._auth?.logout();
    this._dataBusService.clear();
    if (this.suggestionSidebar) {
      this._suggestionService.clearAllCards();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @LogEvent(USER_EVENT_CONSTANTS.USER_CHANGED_LOCALE)
  public switchTo(l: TranslationLanguage) {
    this._localeService.currentLanguage = l.locale;
  }

  public toPatientList() {
    this.navigateByRole();
  }

  public async deselectPatient() {
    const msg = await lastValueFrom(
      this._localeService.translateService.get(
        'user.deselect.confirmation.msg',
        { identifier: this.currentPatient?.getFullName() }
      )
    );
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: this.DIALOG_WIDTH,
        data: {
          title: 'user.deselect.confirmation.title',
          msg: msg,
          closeLabel: 'answer.no.label',
          okLabel: 'answer.yes.label',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res == true) {
          this._patientService.deselectPatient();
        }
      });
  }

  private navigateByRole() {
    this._router.navigateByUrl('/web');
  }

  // ********************* //
  // SUGGESIONS MANAGEMENT //
  // ********************* //
  private updateSuggestionBadge(): void {
    // this.suggestionOpened = true;
    const filteredCards = this._suggestionService.cards
      ?.filter((card) => card.unseen)
      .filter((card) => card.status == 'new');

    // this is the right bardge in accent color higlithing the new cards coming from the backend
    this.suggestionBadge = filteredCards?.length ?? 0;
    // this.cards?.push(...c);
  }

  private updatePresentBadge(): void {
    // nel badge di CARD PRESENTI dovrebbero essere contate tutte quelle
    // NOT HIDDEN
    // NOT ACCEPTED
    // NOT OVERRIDDEN
    // NOT STALE
    // NOT READ

    // quindi forse basterebbe che fossero IN OR
    // NEW
    // ACCEPTING
    const filteredCards = this._suggestionService.cards.filter(
      (card) => card.status == 'new' || card.status == 'accepting'
    );
    //TODO: ToCHECK la coerenza con quello che si vede quando si apre la barra laterale (non deve comprendere quelli nascosti)
    this.presentBadge = filteredCards?.length ?? 0;
  }

  private updateMessageBadge(): void {
    // TODO: add sync with message badge
  }
}
