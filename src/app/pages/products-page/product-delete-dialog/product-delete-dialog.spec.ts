import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDeleteDialogComponent } from './product-delete-dialog';

describe('ProductDeleteDialog', () => {
  let component: ProductDeleteDialogComponent;
  let fixture: ComponentFixture<ProductDeleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDeleteDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDeleteDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
