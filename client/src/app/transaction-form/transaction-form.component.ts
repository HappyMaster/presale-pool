import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css']
})
export class TransactionFormComponent {
  @Input() address:    string;
  @Input() amount:    number;
  @Input() gasLimit:  number;
  @Input() data:      string;

  constructor() { }
}
