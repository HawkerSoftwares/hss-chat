import { NgModule } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';


const NGBODULES = [
  NgbDropdownModule
];

@NgModule({
  imports: NGBODULES,
  exports: NGBODULES
})
export class NGBBootstrapModule { }
