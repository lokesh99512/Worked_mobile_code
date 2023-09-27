import { TestBed } from '@angular/core/testing';

import { AuditSearchService } from './audit-search.service';

describe('AuditSearchService', () => {
  let service: AuditSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuditSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
