// import { Directive } from '@angular/core';
import {FormControl} from '@angular/forms';

function validatePositiveOrNull(c: FormControl) {
  return (!c.value || parseFloat(c.value) >= 0) ? null : {
    PositiveOrNull: {
      valid: false
    }
  };
}

export class PositiveOrNull {
  validator: Function;

  constructor() {
    this.validator = validatePositiveOrNull;
  }

  validate(c: FormControl) {
    return this.validator(c);
  }
}

