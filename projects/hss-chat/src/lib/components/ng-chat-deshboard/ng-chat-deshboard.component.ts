import { Component, Input } from '@angular/core';
import { Window } from '../../core/window';
interface City {
  name: string,
  code: string
}

@Component({
  selector: 'ng-chat-deshboard',
  templateUrl: './ng-chat-deshboard.component.html',
  styleUrls: ['./ng-chat-deshboard.component.scss']
})
export class NgChatDeshboardComponent {
  @Input() windows: Window[] = [];

  ngOnInit() {
 
  } 

}
