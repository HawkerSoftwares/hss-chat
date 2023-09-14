import { NgModule } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { DialogModule } from 'primeng/dialog';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {ButtonModule} from 'primeng/button';
import {ListboxModule} from 'primeng/listbox';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { TabViewModule } from 'primeng/tabview';

const NGBODULES = [
  GalleriaModule,
  DialogModule,
  OverlayPanelModule,
  ButtonModule,
  ListboxModule,
  InputTextModule,
  AvatarModule,
  AvatarGroupModule,
  TabViewModule
];

@NgModule({
  imports: NGBODULES,
  exports: NGBODULES
})
export class NGPrimeModule { }
