import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-investor-claim-token',
  templateUrl: './investor-claim-token.component.html',
  styleUrls: ['./investor-claim-token.component.css']
})
export class InvestorClaimTokenComponent implements OnInit {
  address:    string;
  amount:    number;
  gasLimit:  number;
  data:      string;

  constructor(private location: Location) { }

  ngOnInit() {
    this.dummy();
  }

  dummy() {
    this.address = '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8';
    this.amount = 0;
    this.gasLimit = 6715652;
    this.data = '0xf2316472';
  }

  back() {
    this.location.back();
  }
}
