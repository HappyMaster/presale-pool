import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorWithdrawComponent } from './investor-withdraw.component';

describe('InvestorWithdrawComponent', () => {
  let component: InvestorWithdrawComponent;
  let fixture: ComponentFixture<InvestorWithdrawComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestorWithdrawComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestorWithdrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
