import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './page/home/home.component';
import { FaqComponent } from './page/faq/faq.component';
import { CreatorComponent } from './page/creator/creator.component';
import { InvestorComponent } from './page/investor/investor.component';

const appRoutes: Routes = [
  { path: 'faq', component: FaqComponent },
  { path: 'home', component: HomeComponent },
  { path: 'creator', component: CreatorComponent },
  { path: 'investor', component: InvestorComponent },
  { path: '**', component: HomeComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    FaqComponent,
    CreatorComponent,
    InvestorComponent
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
