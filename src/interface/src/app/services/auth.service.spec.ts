import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';
import { of, throwError } from 'rxjs';

import { BackendConstants } from '../backend-constants';
import { AuthGuard, AuthService } from './auth.service';

describe('AuthService', () => {
  let httpTestingController: HttpTestingController;
  let service: AuthService;

  beforeEach(() => {
    const cookieServiceStub = () => ({ get: (string: string) => ({}) });
    const snackbarSpy = jasmine.createSpyObj<MatSnackBar>(
      'MatSnackBar',
      {
        open: undefined,
      },
      {}
    );
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: CookieService, useFactory: cookieServiceStub },
        {
          provide: MatSnackBar,
          useValue: snackbarSpy,
        },
      ],
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('can load instance', () => {
    expect(service).toBeTruthy();
  });

  it(`isLoggedIn$ has default value`, () => {
    expect(service.isLoggedIn$).toEqual(service.loggedInStatus$);
  });

  describe('login', () => {
    it('makes request to backend /login endpoint', (done) => {
      const mockResponse = {
        accessToken: 'test',
      };

      service.login('username', 'password').subscribe((res) => {
        expect(res).toEqual(mockResponse);
        done();
      });

      const req = httpTestingController.expectOne(
        BackendConstants.END_POINT + '/dj-rest-auth/login/'
      );
      expect(req.request.method).toEqual('POST');
      req.flush(mockResponse);
      httpTestingController
        .expectOne(BackendConstants.END_POINT + '/dj-rest-auth/user/')
        .flush({ username: 'username' });
      httpTestingController.verify();
    });

    it('if successful, updates logged in status to true', (done) => {
      const mockResponse = {
        accessToken: 'test',
      };

      service.login('username', 'password').subscribe((_) => {
        expect(service.loggedInStatus$.value).toBeTrue();
        done();
      });

      const req = httpTestingController.expectOne(
        BackendConstants.END_POINT + '/dj-rest-auth/login/'
      );
      req.flush(mockResponse);
    });

    it('if unsuccessful, does not update logged in status', (done) => {
      service.login('username', 'password').subscribe(
        (_) => {},
        (_) => {
          expect(service.loggedInStatus$.value).toBeFalse();
          done();
        }
      );

      const req = httpTestingController.expectOne(
        BackendConstants.END_POINT + '/dj-rest-auth/login/'
      );
      req.flush('Unsuccessful', { status: 400, statusText: 'Bad request' });
    });

    it('if successful, makes request to backend /user endpoint', (done) => {
      const mockResponse = {
        accessToken: 'test',
      };
      const mockUser = {
        username: 'username',
      };

      service.login('username', 'password').subscribe((_) => {
        expect(service.loggedInStatus$.value).toBeTrue();
        done();
      });

      const req1 = httpTestingController.expectOne(
        BackendConstants.END_POINT + '/dj-rest-auth/login/'
      );
      req1.flush(mockResponse);

      const req2 = httpTestingController.expectOne(
        BackendConstants.END_POINT + '/dj-rest-auth/user/'
      );
      req2.flush(mockUser);
    });

    it('if unsuccessful, does not make request to backend /user endpoint', (done) => {
      service.login('username', 'password').subscribe(
        (_) => {
          expect(service.loggedInStatus$.value).toBeFalse();
          done();
        },
        (_) => {
          expect(service.loggedInStatus$.value).toBeFalse();
          done();
        }
      );

      const req = httpTestingController.expectOne(
        BackendConstants.END_POINT + '/dj-rest-auth/login/'
      );
      req.flush('Unsuccessful', { status: 400, statusText: 'Bad request' });
      httpTestingController.verify();
    });
  });

  describe('signup', () => {
    it('makes request to /registration backend endpoint', (done) => {
      const mockResponse = {
        accessToken: 'test',
      };

      service
        .signup('username', 'email', 'password1', 'password2')
        .subscribe((res) => {
          expect(res).toEqual(mockResponse);
          done();
        });

      const req = httpTestingController.expectOne(
        BackendConstants.END_POINT + '/dj-rest-auth/registration/'
      );
      expect(req.request.method).toEqual('POST');
      req.flush(mockResponse);
      httpTestingController
        .expectOne(BackendConstants.END_POINT + '/dj-rest-auth/user/')
        .flush({ username: 'username' });
      httpTestingController.verify();
    });

    it('if successful, updates logged in status to true', (done) => {
      const mockResponse = {
        accessToken: 'test',
      };

      service
        .signup('username', 'email', 'password1', 'password2')
        .subscribe((_) => {
          expect(service.loggedInStatus$.value).toBeTrue();
          done();
        });

      const req = httpTestingController.expectOne(
        BackendConstants.END_POINT + '/dj-rest-auth/registration/'
      );
      req.flush(mockResponse);
    });

    it('if unsuccessful, does not update logged in status', (done) => {
      service.signup('username', 'email', 'password1', 'password2').subscribe(
        (_) => {},
        (_) => {
          expect(service.loggedInStatus$.value).toBeFalse();
          done();
        }
      );

      const req = httpTestingController.expectOne(
        BackendConstants.END_POINT + '/dj-rest-auth/registration/'
      );
      req.flush('Unsuccessful', { status: 400, statusText: 'Bad request' });
    });

    it('if successful, makes request to backend /user endpoint', (done) => {
      const mockResponse = {
        accessToken: 'test',
      };
      const mockUser = {
        username: 'username',
      };

      service
        .signup('username', 'email', 'password1', 'password2')
        .subscribe((_) => {
          expect(service.loggedInStatus$.value).toBeTrue();
          done();
        });

      const req1 = httpTestingController.expectOne(
        BackendConstants.END_POINT + '/dj-rest-auth/registration/'
      );
      req1.flush(mockResponse);

      const req2 = httpTestingController.expectOne(
        BackendConstants.END_POINT + '/dj-rest-auth/user/'
      );
      req2.flush(mockUser);
    });

    it('if unsuccessful, does not make request to backend /user endpoint', (done) => {
      service.signup('username', 'email', 'password1', 'password2').subscribe(
        (_) => {},
        (_) => {
          expect(service.loggedInStatus$.value).toBeFalse();
          done();
        }
      );

      const req = httpTestingController.expectOne(
        BackendConstants.END_POINT + '/dj-rest-auth/registration/'
      );
      req.flush('Unsuccessful', { status: 400, statusText: 'Bad request' });
      httpTestingController.verify();
    });
  });

  describe('logout', () => {
    it('makes request to backend', (done) => {
      const mockResponse = {
        detail: 'Successfully logged out',
      };

      service.logout().subscribe((res) => {
        expect(res).toEqual(mockResponse);
        done();
      });

      const req = httpTestingController.expectOne(
        BackendConstants.END_POINT + '/dj-rest-auth/logout/'
      );
      expect(req.request.method).toEqual('GET');
      req.flush(mockResponse);
      httpTestingController.verify();
    });

    it('updates logged in status to false and logged in user to be null', (done) => {
      const mockResponse = {
        detail: 'Successfully logged out',
      };

      service.logout().subscribe((_) => {
        expect(service.loggedInStatus$.value).toBeFalse();
        expect(service.loggedInUser$.value).toBeNull();
        done();
      });

      const req = httpTestingController.expectOne(
        BackendConstants.END_POINT + '/dj-rest-auth/logout/'
      );
      req.flush(mockResponse);
    });
  });

  describe('refreshLoggedInUser', () => {
    it('makes request to backend for access token and user', (done) => {
      const cookieServiceStub: CookieService = TestBed.inject(CookieService);
      spyOn(cookieServiceStub, 'get').and.callThrough();
      const mockResponse = { access: true };
      const mockUser = {
        username: 'username',
      };

      service.refreshLoggedInUser().subscribe((res) => {
        expect(res).toEqual(mockUser);
        done();
      });

      const req1 = httpTestingController.expectOne(
        BackendConstants.END_POINT + '/dj-rest-auth/token/refresh/'
      );
      expect(req1.request.method).toEqual('POST');
      expect(cookieServiceStub.get).toHaveBeenCalled();
      req1.flush(mockResponse);

      const req2 = httpTestingController.expectOne(
        BackendConstants.END_POINT + '/dj-rest-auth/user/'
      );
      expect(req2.request.method).toEqual('GET');
      req2.flush(mockUser);

      httpTestingController.verify();
    });

    it('updates loggedInStatus to true when token is refreshed', (done) => {
      const mockResponse = { access: true };
      const mockUser = {
        username: 'username',
      };

      service.refreshLoggedInUser().subscribe((_) => {
        expect(service.loggedInStatus$.value).toBeTrue();
        expect(service.loggedInUser$.value).toEqual(mockUser);
        done();
      });

      httpTestingController
        .expectOne(BackendConstants.END_POINT + '/dj-rest-auth/token/refresh/')
        .flush(mockResponse);
      httpTestingController
        .expectOne(BackendConstants.END_POINT + '/dj-rest-auth/user/')
        .flush(mockUser);
    });

    it('updates loggedInStatus to false when token cannot be refreshed', (done) => {
      service.refreshLoggedInUser().subscribe(
        (_) => {
          expect(service.loggedInStatus$.value).toBeFalse();
          expect(service.loggedInUser$.value).toBeNull();
          done();
        },
        (_) => {
          expect(service.loggedInStatus$.value).toBeFalse();
          expect(service.loggedInUser$.value).toBeNull();
          done();
        }
      );

      httpTestingController
        .expectOne(BackendConstants.END_POINT + '/dj-rest-auth/token/refresh/')
        .flush('Unsuccessful', { status: 400, statusText: 'Bad request' });
      httpTestingController.verify();
    });
  });
});

describe('AuthGuard', () => {
  let service: AuthGuard;

  beforeEach(() => {
    const cookieServiceStub = () => ({ get: (string: string) => ({}) });
    const snackbarSpy = jasmine.createSpyObj<MatSnackBar>(
      'MatSnackBar',
      {
        open: undefined,
      },
      {}
    );
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        AuthGuard,
        { provide: CookieService, useFactory: cookieServiceStub },
        {
          provide: MatSnackBar,
          useValue: snackbarSpy,
        },
      ],
    });
    service = TestBed.inject(AuthGuard);
  });

  it('can load instance', () => {
    expect(service).toBeTruthy();
  });

  describe('canActivate', () => {
    it('returns true if refreshLoggedInUser succeeds', (done) => {
      const authServiceStub: AuthService = TestBed.inject(AuthService);
      spyOn(authServiceStub, 'refreshLoggedInUser').and.returnValue(
        of({ username: 'username' })
      );

      service.canActivate().subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('returns false if refreshLoggedInUser fails', (done) => {
      const authServiceStub: AuthService = TestBed.inject(AuthService);
      spyOn(authServiceStub, 'refreshLoggedInUser').and.returnValue(
        throwError(() => new Error())
      );

      service.canActivate().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });
  });
});
