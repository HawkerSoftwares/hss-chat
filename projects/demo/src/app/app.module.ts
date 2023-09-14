import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { NgChatModule } from 'projects/hss-chat/src/public-api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgChatModule,
    BrowserAnimationsModule,
    SidebarModule,
    ButtonModule,
RadioButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { } 
