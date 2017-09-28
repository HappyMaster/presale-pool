import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './page/home/home.component';
import { FaqComponent } from './page/faq/faq.component';
import { CreatePoolComponent } from './page/create-pool/create-pool.component';
import { CreatorComponent } from './page/creator/creator.component';
import { InvestorComponent } from './page/investor/investor.component';

import { MaterialModule } from './material/material.module';

const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'create', component: CreatePoolComponent },
  { path: 'creator', component: CreatorComponent },
  { path: 'investor', component: InvestorComponent },
  { path: 'pool/:address/creator', component: CreatorComponent },
  { path: 'pool/:address/investor', component: InvestorComponent },
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
    InvestorComponent,
    CreatePoolComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
