import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemcategorylistComponent } from './itemcategorylist.component';

describe('ItemcategorylistComponent', () => {
  let component: ItemcategorylistComponent;
  let fixture: ComponentFixture<ItemcategorylistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ItemcategorylistComponent]
    });
    fixture = TestBed.createComponent(ItemcategorylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
