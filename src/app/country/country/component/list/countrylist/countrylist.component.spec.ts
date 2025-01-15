import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountrylistComponent } from './countrylist.component';

describe('CountrylistComponent', () => {
  let component: CountrylistComponent;
  let fixture: ComponentFixture<CountrylistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CountrylistComponent]
    });
    fixture = TestBed.createComponent(CountrylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
