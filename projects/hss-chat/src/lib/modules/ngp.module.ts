import { NgModule } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { DialogModule } from 'primeng/dialog';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {ButtonModule} from 'primeng/button';


const NGBODULES = [
  GalleriaModule,
  DialogModule,
  OverlayPanelModule,
  ButtonModule
];

@NgModule({
  imports: NGBODULES,
  exports: NGBODULES
})
export class NGPrimeModule { }
