import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SnackBarService } from '@eng-it4h/heart-ui-utils';
import {
  AccountRequestControllerService,
  AccountRequestDTO,
} from '@modules/registration/services/registration-api';
interface AppOption {
  value: string;
  display: string;
}
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  apps: AppOption[] = [
    { value: 'happy-plant', display: 'registration.form.application.hp.label' },
    { value: 'webapp', display: 'registration.form.application.webapp.label' },
  ];
  constructor(
    private fb: FormBuilder,
    private _accountBackend: AccountRequestControllerService,
    private _snackBar: SnackBarService,
  ) {
    this.registerForm = this.fb.nonNullable.group({
      username: ['', [Validators.email, Validators.required]],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      organization: [''],
      application: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const request: AccountRequestDTO = {
      email: this.registerForm.get('username')?.value,
      firstName: this.registerForm.get('firstname')?.value,
      lastName: this.registerForm.get('lastname')?.value,
      organisation: this.registerForm.get('organization')?.value,
      application: this.registerForm.get('application')?.value,
      reason: this.registerForm.get('description')?.value,
    };

    this.sendRequest$(request).subscribe({
      next: (response) => {
        this.registerForm.reset();
        this._snackBar.openSnackBar(
          'registration.request-success.snack',
          undefined,
          5000,
          'snack-success',
        );
      },
      error: (err) => {
        console.error('Error sending account request', err);
        this._snackBar.openSnackBar(
          'registration.request-error.snack',
          undefined,
          4000,
          'snack-error',
        );
      },
    });
  }

  private sendRequest$(req: AccountRequestDTO) {
    return this._accountBackend.requestAccount(req, 'response');
  }
}
