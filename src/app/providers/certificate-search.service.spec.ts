import { TestBed } from '@angular/core/testing';

import { CertificateSearchService } from './certificate-search.service';

describe('CertificateSearchService', () => {
  let service: CertificateSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CertificateSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
