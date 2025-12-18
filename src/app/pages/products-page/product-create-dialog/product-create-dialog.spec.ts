import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCreateDialogComponent } from './product-create-dialog';

describe('ProductCreateDialog', () => {
  let component: ProductCreateDialogComponent;
  let fixture: ComponentFixture<ProductCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCreateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCreateDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
