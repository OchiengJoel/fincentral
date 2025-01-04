import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyaddeditComponent } from './companyaddedit.component';

describe('CompanyaddeditComponent', () => {
  let component: CompanyaddeditComponent;
  let fixture: ComponentFixture<CompanyaddeditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompanyaddeditComponent]
    });
    fixture = TestBed.createComponent(CompanyaddeditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
