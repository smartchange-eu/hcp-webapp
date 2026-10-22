import {
  AfterViewInit,
  Component,
  DoCheck,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CareGiver } from '@eng-it4h/heart-ui-model';

import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { TableAction } from './table-action.model';
import { TableEntry } from './table-entry.model';

export type COLUMN =
  | 'select'
  | 'id'
  | 'username'
  | 'name'
  | 'family'
  | 'organization'
  | 'gender'
  | 'age'
  | 'birthDate'
  | 'analyses'
  | 'edit'
  | 'enable'
  | 'group';
export type EXPAND = 'expand';

@Component({
  selector: 'heart-trial-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ),
    ]),
  ],
})
export class PatientListComponent
  implements OnInit, OnChanges, DoCheck, AfterViewInit
{
  public stdDisplayedColumns: COLUMN[] = [
    'id',
    'username',
    'name',
    'family',
    'organization',
    'gender',
    'age',
  ];
  public stdPaginationOptions = [5, 10, 25, 100];
  public stdPageSize = 10;

  dataSource?: MatTableDataSource<TableEntry>;

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  @Input() displayedColumns?: COLUMN[];
  @Input() actions?: TableAction[];
  @Input() patients: TableEntry[] = [];
  @Input() paginationOptions?: number[]; // default value [5, 10, 25, 100]
  @Input() pageSize?: number; // default value 25
  @Input() lang?: string;
  @Input() public enableRefreshButton: boolean = false;
  @Input() expand: boolean = false;
  @Input() canRemoveFM: boolean = false;
  @Output() selected = new EventEmitter<TableEntry>();

  @Output() askRefresh = new EventEmitter();
  @Output() askEdit = new EventEmitter<{ entry: TableEntry; action: string }>();
  @Output() askRemove = new EventEmitter<{
    entry: TableEntry;
    fm: CareGiver;
  }>();

  expandedElement: TableEntry | undefined = undefined;
  public toShow: TableEntry[] = [];
  protected columnsToDisplayWithExpand: (COLUMN | EXPAND)[] = [];
  private prevLength?: number;

  constructor(private _translate: TranslateService) {}

  ngDoCheck(): void {
    if (this.patients?.length != this.prevLength) {
      this.refresh();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log("OnChanges: "+changes);
    this.refresh();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.refresh();
  }

  refresh() {
    // console.log(`refreshing`);
    this.prevLength = this.toShow?.length;
    this.toShow = this.patients;
    this.dataSource = new MatTableDataSource(this.patients);
    this.dataSource.paginator = this.paginator ?? null;
    this.dataSource.sort = this.sort ?? null;
    this.columnsToDisplayWithExpand =
      this.displayedColumns ?? this.stdDisplayedColumns;
    if (this.expand && !this.columnsToDisplayWithExpand.includes('expand')) {
      this.columnsToDisplayWithExpand.push('expand');
    }
    this.pageSize = this.pageSize ?? this.stdPageSize;
    this.paginationOptions =
      this.paginationOptions ?? this.stdPaginationOptions;
    this.dataSource.filterPredicate = this.getFilterPredicate();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource!.filter = filterValue.trim().toLowerCase();

    if (this.dataSource!.paginator) {
      this.dataSource!.paginator.firstPage();
    }
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    if (this.dataSource && this.dataSource.data) {
      const data = this.dataSource?.data.slice();
      this.dataSource.data = data?.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'id':
            return compare(a.patient.id, b.patient.id, isAsc);
          case 'name':
            return compare(a.patient.firstName, b.patient.firstName, isAsc);
          case 'family':
            return compare(a.patient.lastName, b.patient.lastName, isAsc);
          case 'gender':
            return compare(
              a.patient.gender.toString(),
              b.patient.gender.toString(),
              isAsc,
            );
          case 'age':
            return compare(
              b.patient.birthDate?.getTime(),
              a.patient.birthDate?.getTime(),
              isAsc,
            );
          case 'organization':
            return compare(
              a.patient.managingOrganization?.name,
              b.patient.managingOrganization?.name,
              isAsc,
            );
          case 'group':
            return compare(a.trialGroup?.code, b.trialGroup?.code, isAsc);
          default:
            return 0;
        }
      });
    }
  }

  getFilterPredicate() {
    let filterPredicate = (
      data: TableEntry,
      value: string, // filtering string
    ) => {
      const matchFilter = [];
      // primitive
      matchFilter.push(
        this._translate
          .instant(data.trialGroup.uniqueLabelKey)
          ?.toString()
          .toLowerCase()
          .includes(value.toLocaleLowerCase()),
      );
      matchFilter.push(
        data.patient.managingOrganization?.name
          ?.toString()
          .toLowerCase()
          .includes(value.toLocaleLowerCase()),
      );
      matchFilter.push(
        data.patient.firstName
          ?.toString()
          .toLowerCase()
          .includes(value.toLocaleLowerCase()),
      );
      matchFilter.push(
        data.patient.lastName
          ?.toString()
          .toLowerCase()
          .includes(value.toLocaleLowerCase()),
      );
      matchFilter.push(
        data.patient.age
          ?.toString()
          .toLowerCase()
          .includes(value.toLocaleLowerCase()),
      );
      matchFilter.push(
        data.patient.id
          ?.toString()
          .toLowerCase()
          .includes(value.toLocaleLowerCase()),
      );
      return matchFilter.some(Boolean);
    };
    return filterPredicate;
  }

  public clicked(row: TableEntry) {
    if (this.expand)
      this.expandedElement = this.expandedElement === row ? undefined : row;
    this.selected.emit(row);
  }

  public refreshList() {
    this.askRefresh.emit();
  }

  public editPatient(row: TableEntry, action: string) {
    this.askEdit.emit({ entry: row, action: action });
  }
}

function compare(
  a: number | string | undefined,
  b: number | string | undefined,
  isAsc: boolean,
): number {
  if (a === undefined && b === undefined) return 0;
  if (a === undefined) return isAsc ? -1 : 1;
  if (b === undefined) return isAsc ? 1 : -1;

  return (a < b ? -1 : a > b ? 1 : 0) * (isAsc ? 1 : -1);
}
