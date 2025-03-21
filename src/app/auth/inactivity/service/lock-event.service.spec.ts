import { TestBed } from '@angular/core/testing';

import { LockEventService } from './lock-event.service';

describe('LockEventService', () => {
  let service: LockEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LockEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
