import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  signupForm: FormGroup;
  signupModel: any = {};
  modalRef: BsModalRef;
  errorMessage: String = '';
  registerLoading: boolean = false;
  @ViewChild('template') input;

  constructor(
    private authService: AuthService,
    private modalService: BsModalService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.loggedIn()) {
      let roleId = this.authService.getRoleId();
      switch(roleId) {
        case 1 : {
          this.router.navigate(['/admin-dashboard']);
          break;
        }
        case 2 : {
          this.router.navigate(['']);
          break;
        }
        case 3 : {
          this.router.navigate(['/dashboard']);
          break;
        }
        default : {
          break;
        }
      }
    }

    this.signupForm = new FormGroup({
      signupFirstName: new FormControl(null, [
        Validators.required,
        Validators.pattern('(.*[a-zA-Z]){2}'),
      ]),
      signupMiddleName: new FormControl(null, [
        Validators.required,
        Validators.pattern('(.*[a-zA-Z]){2}'),
      ]),
      signupLastName: new FormControl(null, [
        Validators.required,
        Validators.pattern('(.*[a-zA-Z]){2}'),
      ]),
      signupGender: new FormControl(null, [Validators.required]),
      signupMobile: new FormControl(null, [
        Validators.required,
        Validators.pattern(
          '^(?:(?:\\+|0{0,2})91(\\s*[\\-]\\s*)?|[0]?)?[789]\\d{9}$'
        ),
      ]),
      signupEmail: new FormControl(null, [
        Validators.required,
        Validators.email,
      ]),
      passwords: new FormGroup(
        {
          signupPassword: new FormControl(null, [
            Validators.required,
            Validators.pattern(
              '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$'
            ),
          ]),
          signupConfirmPassword: new FormControl(null, [Validators.required]),
        },
        this.isPasswordMatch.bind(this)
      ),
    });
  }

  isPasswordMatch(passwords: FormGroup) {
    let confirmPswrdCtrl = passwords.get('signupConfirmPassword');
    if (
      confirmPswrdCtrl.errors == null ||
      'passwordMismatch' in confirmPswrdCtrl.errors
    ) {
      if (passwords.get('signupPassword').value != confirmPswrdCtrl.value)
        confirmPswrdCtrl.setErrors({ passwordMismatch: true });
      else {
        confirmPswrdCtrl.setErrors(null);
      }
    }
  }

  register() {
    if (this.signupForm.valid) {
      this.registerLoading = true;

      this.signupModel.firstName = this.signupForm.get('signupFirstName').value;
      this.signupModel.middleName = this.signupForm.get(
        'signupMiddleName'
      ).value;
      this.signupModel.lastName = this.signupForm.get('signupLastName').value;
      this.signupModel.gender = this.signupForm.get('signupGender').value == 'Male' ? 'm' : 'f';
      this.signupModel.phone = this.signupForm.get('signupMobile').value;
      this.signupModel.emailid = this.signupForm.get('signupEmail').value;
      this.signupModel.password = this.signupForm.get(
        'passwords.signupPassword'
      ).value;

      this.authService.register(this.signupModel).subscribe(
        (next) => {
        },
        (error) => {
          if (error.status == 400) {
            this.errorMessage = error.error.message;
          } else if (error.status == 500) {
            this.errorMessage = 'Server error';
          } else {
            this.errorMessage = 'Error';
          }

          this.registerLoading = false;
        },
        () => {
          this.registerLoading = false;
          this.signupForm.reset();
          this.openModal();
          this.router.navigate(['/']);
        }
      );
    }
  }

  openModal() {
    this.modalRef = this.modalService.show(this.input);
  }
}
