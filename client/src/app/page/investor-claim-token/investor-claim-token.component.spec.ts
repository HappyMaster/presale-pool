import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorClaimTokenComponent } from './investor-claim-token.component';

describe('InvestorClaimTokenComponent', () => {
  let component: InvestorClaimTokenComponent;
  let fixture: ComponentFixture<InvestorClaimTokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestorClaimTokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestorClaimTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
