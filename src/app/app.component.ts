import { ChangeDetectorRef, Component } from '@angular/core';
import { PDFDocument, StandardFonts, rgb, PDFString } from 'pdf-lib' // https://pdf-lib.js.org/#examples
import * as downloadjs from 'downloadjs'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

import fontkit from '@pdf-lib/fontkit';

import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AppService } from './app.service';
declare var google: any;

// @ts-ignore
import { GoogleAuth, GoogleUser } from 'gapi-client';
declare const gapi: any;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  isLoading = true;
  isSignedIn = false;

  constructor(
    private http: HttpClient,
    private appService: AppService,
    private cdRef: ChangeDetectorRef
  ) {}

  async ngOnInit() { }

  onClickSignIn() {
    this.appService.signIn();
  }

  onClickInitSheet() {

    // const columns = ['Hello', 'World', 'of', 'Columns']
    // this.appService.createColumns(columns);

    const rowData = [
      {name: "Bulbasaur", type: "Grass", gen: 1},
      {name: "Charmander", type: "Fire", gen: 1},
      {name: "Squirtle", type: "Water", gen: 1}
    ]
    this.appService.saveDataToSheet(rowData);

  }
}
