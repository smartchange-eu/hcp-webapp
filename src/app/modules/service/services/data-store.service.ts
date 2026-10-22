import { Injectable } from '@angular/core';
import { DataModelUtils } from '@eng-it4h/heart-ui-model';
import { environment } from '@env/environment';
import SecureLS from 'secure-ls';

@Injectable({
  providedIn: 'root',
})
export class DataStoreService {
  private readonly useSecured: boolean = localStorage !== undefined;
  private ls: SecureLS | undefined;
  private cache: Map<string, any> | undefined;

  private prefix: string;

  public constructor() {
    if (this.useSecured) {
      this.ls = new SecureLS({
        //    encodingType: 'aes'
      });
    } else {
      this.cache = new Map<string, any>();
    }

    this.prefix = !environment.production ? 'd_' : '';
  }

  public getData(
    key: DataStoreKey | string,
    revive: boolean = true,
    secure: boolean = true
  ): any {
    const strKey: string = this.getKey(key);
    let storedObj: any = undefined;
    if (this.useSecured && secure && this.ls) {
      storedObj = this.ls.get(strKey);
    } else {
      const item = localStorage.getItem(strKey);
      if (item) {
        storedObj = JSON.parse(item);
      }
    }
    if (storedObj) {
      return revive ? this.reviveStoredObject(storedObj) : storedObj;
    }

    return undefined;
  }

  public saveData(
    key: DataStoreKey | string,
    objToStore: any,
    secure: boolean = true
  ): void {
    const strKey: string = this.getKey(key);
    if (objToStore instanceof Map) {
      const entriesToStore: any = Array.from(objToStore.entries());

      if (this.useSecured && secure && this.ls) {
        this.ls.set(strKey, entriesToStore);
      } else {
        localStorage.setItem(strKey, JSON.stringify(entriesToStore));
      }
    } else {
      if (this.useSecured && secure && this.ls) {
        this.ls.set(strKey, objToStore);
      } else {
        localStorage.setItem(strKey, JSON.stringify(objToStore));
      }
    }
  }

  public isSaved(key: DataStoreKey, secure: boolean = true): boolean {
    if (this.getData(key, secure) === undefined) {
      return false;
    }

    return true;
  }

  public deleteObj(key: DataStoreKey | string, secure: boolean = true): void {
    const strKey: string = this.getKey(key);

    if (this.useSecured && secure && this.ls) {
      this.ls.remove(strKey);
    } else {
      localStorage.removeItem(strKey);
    }
  }

  public flushMem(): void {
    if (!this.useSecured && this.cache) {
      this.cache.clear();
    } else if (this.ls) {
      this.ls.removeAll();
      this.ls.clear();
      // localStorage.clear();
    }
  }

  private reviveStoredObject(storedObj: any): any {
    return DataModelUtils.attributeRevive(
      storedObj,
      DataModelUtils.loadClassByTypeName(storedObj['resourceType']).revive
    );
  }

  private getKey(obj: DataStoreKey | string): string {
    const key: string = obj.toString();

    return this.prefix + key;
  }
}

export enum DataStoreKey {
  LOGGED_USER = 'loggedUser' as any,
  SECTION = 'section' as any,
  CURRENT_PATIENT = 'currentPatient' as any,
  CURRENT_PROGRAMME = 'currentProgramme' as any,
  CURRENT_EPISODE = 'currentEpisode' as any,
  CURRENT_ENCOUNTER = 'currentEncounter' as any,
}
