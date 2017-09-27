import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MdButtonModule, MdMenuModule} from '@angular/material';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    MdButtonModule,
    MdMenuModule
  ],
  exports: [
    BrowserAnimationsModule,
    MdButtonModule,
    MdMenuModule
  ],
  declarations: []
})
export class MaterialModule { }
