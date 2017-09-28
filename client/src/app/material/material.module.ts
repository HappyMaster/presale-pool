import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MdButtonModule, MdMenuModule, MdStepperModule} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MdButtonModule,
    MdMenuModule,
    MdStepperModule,
    ClipboardModule
  ],
  exports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MdButtonModule,
    MdMenuModule,
    MdStepperModule,
    ClipboardModule
  ],
  declarations: []
})
export class MaterialModule { }
