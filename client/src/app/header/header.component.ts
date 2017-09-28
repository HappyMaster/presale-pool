import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  contractAddress: string;
  searchAddress: string;
  selected = 'CREATOR';
  select(text: string) { this.selected = text; }

  constructor(
    private route: ActivatedRoute,
    private router: Router) {
    // Subscribe to all router events to retrieve contract address when available
    // Due to header being higher in hierarchy than components with address param in route
    router.events.forEach((e) => {
      if (e instanceof NavigationEnd && route.firstChild) {
        const address = route.firstChild.snapshot.params['address'];
        this.contractAddress = address ? address : null;
      }
    });
  }

  ngOnInit() {  }

  isSearchActive() {
    return this.searchAddress && this.searchAddress.length > 0;
  }

  keyDownFunction(event) {
    if (event.keyCode === 13) {
      this.OpenSearchAddress();
    }
  }

  OpenSearchAddress() {
    console.log('test');
    this.router.navigate(['/pool/' +
      this.searchAddress.replace(/[^a-z0-9]/gi, '') +
      '/investor']);
  }
}
