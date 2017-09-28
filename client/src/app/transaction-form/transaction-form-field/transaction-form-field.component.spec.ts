import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionFormFieldComponent } from './transaction-form-field.component';

describe('TransactionFormFieldComponent', () => {
  let component: TransactionFormFieldComponent;
  let fixture: ComponentFixture<TransactionFormFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionFormFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionFormFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
