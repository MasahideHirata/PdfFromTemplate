import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AgGridModule } from 'ag-grid-angular';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { CreatePdfComponent } from './create-pdf/create-pdf.component';
import { CanvasFabricComponent } from './canvas-fabric/canvas-fabric.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    CreatePdfComponent,
    CanvasFabricComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AgGridModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
