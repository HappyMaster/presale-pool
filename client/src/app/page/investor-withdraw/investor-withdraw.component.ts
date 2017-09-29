import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { PositiveOrNull } from '../../validator/positive-or-null.validator';
import { Location } from '@angular/common';

@Component({
  selector: 'app-investor-withdraw',
  templateUrl: './investor-withdraw.component.html',
  styleUrls: ['./investor-withdraw.component.css']
})
export class InvestorWithdrawComponent implements OnInit {
  FormGroup: FormGroup;
  address:   string;
  amount:    number;
  gasLimit:  number;
  data:      string;

  constructor(
    private _formBuilder: FormBuilder,
    private location: Location) { }

  ngOnInit() {
    this.FormGroup = this._formBuilder.group({
      max:  [false, Validators.required],
      amount: ['', PositiveOrNull]
    });
  }

  onStepChange($event) {
    console.log($event);
    if($event.selectedIndex === 1) {
      this.address = '0xD4D83f833f0185eB00788C4A5e85F1dfCD7C36D8';
      this.amount = 0;
      this.gasLimit = 6715652;
      this.data = '0xf2316472';
    }
  }

  onNextClicked() {

  }

  close() {
    this.location.back();
  }
}
