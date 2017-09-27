import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FaqComponent } from './page/faq/faq.component';
import { MainComponent } from './page/main/main.component';
import { FooterComponent } from './footer/footer.component';

const appRoutes: Routes = [
  { path: 'faq', component: FaqComponent },
  { path: 'home', component: MainComponent },
  { path: '**', component: MainComponent },
  // { path: 'contributor', component: MainComponent },
  // { path: 'investor', component: MainComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FaqComponent,
    MainComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
