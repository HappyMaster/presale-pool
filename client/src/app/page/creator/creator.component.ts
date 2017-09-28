import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-creator',
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.css']
})
export class CreatorComponent implements OnInit {
  contractAdress: string;

  constructor(private route: ActivatedRoute) { }


  ngOnInit() {
    this.contractAdress = this.route.snapshot.paramMap.get('address');
    console.log('Creator => Current contract address: ', this.contractAdress);
  }

}
