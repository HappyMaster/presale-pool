import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { PositiveOrNull } from '../../validator/positive-or-null.validator';
/**
 * Custom validator ensuring the input is either null or >= 0
 * @param {FormControl} c
 * @returns {{PositiveOrNull: {valid: boolean}}}
 */
// function validatePositiveOrNull(c: FormControl) {
//   return (!c.value || parseFloat(c.value) >= 0) ? null : {
//     PositiveOrNull: {
//       valid: false
//     }
//   };
// }

@Component({
  selector: 'app-create-pool',
  templateUrl: './create-pool.component.html',
  styleUrls: ['./create-pool.component.css']
})
export class CreatePoolComponent implements OnInit {
  FormGroupDefine: FormGroup;
  FormGroupLaunch: FormGroup;
  testValue1 = 'This is a test 1';
  testValue2 = 'This is a test 2';
  testValue3 = 'This is a test 3';
  isCopied1 = false;
  isCopied2 = false;
  isCopied3 = false;

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.FormGroupDefine = this._formBuilder.group({
      maxAllocation:  ['', PositiveOrNull],
      maxPerInvestor: ['', PositiveOrNull],
      minPerInvestor: ['', PositiveOrNull]
    });
    this.FormGroupLaunch = this._formBuilder.group({
      transactionId:  ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  onNextClicked() {
    console.log('Next clicked. Form status: ', this.FormGroupDefine.status, ', values: ', this.FormGroupDefine.value);
  }

  onLaunchClicked() {
    console.log('Launch clicked. Form status: ', this.FormGroupLaunch.status, ', values: ', this.FormGroupLaunch.value);
  }
}
