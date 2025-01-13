import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemcategoryformComponent } from './itemcategoryform.component';

describe('ItemcategoryformComponent', () => {
  let component: ItemcategoryformComponent;
  let fixture: ComponentFixture<ItemcategoryformComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ItemcategoryformComponent]
    });
    fixture = TestBed.createComponent(ItemcategoryformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
