import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-transaction-form-field',
  templateUrl: './transaction-form-field.component.html',
  styleUrls: ['./transaction-form-field.component.css']
})
export class TransactionFormFieldComponent {
  @Input() label: string;
  @Input() value: string;

  isCopied = false;
  constructor() { }

}
