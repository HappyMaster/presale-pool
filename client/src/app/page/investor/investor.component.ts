import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import * as accounting from 'accounting';

@Component({
  selector: 'app-investor',
  templateUrl: './investor.component.html',
  styleUrls: ['./investor.component.css']
})
export class InvestorComponent implements OnInit {
  contractAdress: string;
  status: String;
  maxAllocation: Number;
  maxPerContributor: Number;
  currentValue: Number;
  minPerContributor: Number;
  contributors: Array<Object>;

  constructor(private route: ActivatedRoute) {  }

  ngOnInit() {
    this.contractAdress = this.route.snapshot.paramMap.get('address');
    console.log('Investor => Current contract address: ', this.contractAdress);
    this.dummyData();
  }

  dummyData() {
    this.status = 'PAID';
    this.maxAllocation = 10000;
    this.maxPerContributor = 900;
    this.currentValue = 1000.01;
    this.minPerContributor = 100;
    this.contributors = [
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10},
      {address: '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8', amount: 10}
   ];
  }

  formatMoney(value) {
    return accounting.formatMoney(value, { symbol: 'ETH',  format: '%v %s' });
  }

  getMyTokens() {
    console.log('getMyTokens!');
  }

  withdrawEther() {
    console.log('withdrawEther!');
  }
}
