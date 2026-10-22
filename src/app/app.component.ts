import { Component, OnInit } from '@angular/core';
import { Role } from '@eng-it4h/heart-ui-model';
import { environment } from '@env/environment';
import { AbstractAuthService } from '@modules/auth/services/abstract-auth-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public static extra_roles = [
    new Role('teacher'),
    new Role('patient-intervention'),
    new Role('patient-control'),
  ];

  constructor(private authService: AbstractAuthService) {
    console.info(`Production: ${environment.production}`);
    const logged = this.authService.observeAuthenticated();
    Role.EXTRA.push(...AppComponent.extra_roles);
    logged.subscribe((authenticated) => {
      if (environment.debug) {
        console.info(`User is ${authenticated ? 'logged' : 'not logged'}`);
      }
    });
    if (environment.debug) {
      console.info(
        `[App Component] Environment: ${JSON.stringify(environment)}`,
      );
    }
  }
  ngOnInit(): void {}
}
