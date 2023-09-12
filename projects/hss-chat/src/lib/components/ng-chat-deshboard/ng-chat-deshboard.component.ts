import { Component } from '@angular/core';
interface City {
  name: string,
  code: string
}

@Component({
  selector: 'ng-chat-deshboard',
  templateUrl: './ng-chat-deshboard.component.html',
  styleUrls: ['./ng-chat-deshboard.component.css']
})
export class NgChatDeshboardComponent {
  cities!: City[];
  selectedCity!: City;

  ngOnInit() {
 
  this.cities = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' }
  ];
} 

}
