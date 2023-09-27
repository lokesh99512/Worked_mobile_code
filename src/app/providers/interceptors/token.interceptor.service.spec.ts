import { TestBed } from '@angular/core/testing';

import { InterceptorService } from './token.interceptor.service';

describe('Token.InterceptorService', () => {
  let service: InterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
