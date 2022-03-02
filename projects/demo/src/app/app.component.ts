import { Component } from '@angular/core';
import { ChatAdapter } from 'projects/hss-chat/src/public-api';
import { DemoAdapter } from './demo-adapter';
import { DemoAdapterPagedHistory } from './demo-adapter-paged-history';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  //public adapter: ChatAdapter = new DemoAdapter();

  public adapter: ChatAdapter = new DemoAdapterPagedHistory();

  public messageSeen(event: any)
  {
    console.log(event);
  }
}
