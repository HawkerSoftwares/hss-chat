import { NgModule } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { DialogModule } from 'primeng/dialog';


const NGBODULES = [
  GalleriaModule,
  DialogModule
];

@NgModule({
  imports: NGBODULES,
  exports: NGBODULES
})
export class NGPrimeModule { }
