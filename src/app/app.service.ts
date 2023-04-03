//https://developers.google.com/sheets/api/quickstart/js

import { EventEmitter, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

declare const gapi: any;
declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor(private http: HttpClient) { }

  defaultFontPath = '/assets/fonts/MSMINCHO.TTF';

  tokenClient: any;
  accessToken: any;

  spreadsheetId: string = '1pMIXAIQYjxzhsYcLdr2_2SN0sTTfbeifLeHTkUzeFI8';
  
  async getFont() {
    const fontArrayBuffer = await firstValueFrom(this.http.get(this.defaultFontPath, { responseType: 'arraybuffer' }));
    return fontArrayBuffer;
  }


  /* ------------------------------------------------------------------------------------
  Utility
  ------------------------------------------------------------------------------------ */
  loadScript(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }






  /* ------------------------------------------------------------------------------------
  Google & Sheets API Initialization
  ------------------------------------------------------------------------------------ */

  public async signIn() {
    // load google gsi and get tokenClient
    await this.loadScript('https://accounts.google.com/gsi/client')
    await this.getTokenClient();
    console.log(google);
    console.log(this.tokenClient);


    // load gapi
    await this.loadScript('https://apis.google.com/js/api.js')
    
    // get access token
    await this.requestAccessToken();

    // load Google Sheets
    await gapi.load('client', () => {
      gapi.client.init({
        apiKey: "AIzaSyBQMYuBi-RbndP99AQ_pePeBpA4BY1Cyus",
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        accessToken: this.accessToken
      }).then(() => {
        console.log('Google Sheets API V4 loaded.');
        console.log(google);
        console.log(gapi)
        // console.log(google.client.sheets.spreadsheets);

      }, (error: any) => {
        console.log('Error loading Google Sheets API', error);
      });
    });
  }

  async getTokenClient() {
    this.tokenClient = await google.accounts.oauth2.initTokenClient({
      client_id: "1072647161509-omifqi8tbmkcveeau8fcvusc7ltf5dfm.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/spreadsheets",
    });
  }

  async requestAccessToken() {
    this.tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) { throw (resp) }
      else {
        const { access_token } = resp;
        this.accessToken = access_token;
        console.log('acccess token is loaded.', this.accessToken)
      } 
    };
    this.tokenClient.requestAccessToken({prompt: ''}); 
  }

  /* ------------------------------------------------------------------------------------
  Spreadsheet API
  ------------------------------------------------------------------------------------ */

  getSheets() {
    gapi.client.sheets.spreadsheets.get({
      spreadsheetId: '1pMIXAIQYjxzhsYcLdr2_2SN0sTTfbeifLeHTkUzeFI8', // turn this into this.spreadsheetId?
      headers: {
        Authorization: 'Bearer ' + this.accessToken
      },
    }).execute((response: any) => {
      console.log(response);
    });
  }

  async createColumns(columnNames: any) {
    let columnCount = columnNames.length;
    let rowValues = [];
    for (var i = 0; i < columnCount; i++) {
      rowValues.push(columnNames[i]);
    }


    const sheetName = 'Sheet1';
    return gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: '1pMIXAIQYjxzhsYcLdr2_2SN0sTTfbeifLeHTkUzeFI8',
      range: sheetName + '!A1:' + String.fromCharCode(65 + columnCount - 1) + '1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [rowValues]
      }
    });

    // gapi.client.sheets.spreadsheets.values.update({
    //   spreadsheetId: '1pMIXAIQYjxzhsYcLdr2_2SN0sTTfbeifLeHTkUzeFI8',
    //   range: 'Sheet1!A1:' + String.fromCharCode(65 + columnCount - 1) + '1',
    //   valueInputOption: 'USER_ENTERED',
    //   resource: {
    //     values: [rowValues]
    //   }
    // }).then(function(response: any) {
    //   console.log('Columns created:', response);
    // }, function(error: any) {
    //   console.error('Error creating columns:', error);
    // });
  }

  async saveDataToSheet(data: any) {
    // create column names
    const columnNames = Object.keys(data[0]);
    const createColumnsRes = await this.createColumns(columnNames);
    console.log(createColumnsRes)


    // // delete everything after row 2
    // const sheetResponse = await gapi.client.sheets.spreadsheets.get({
    //   spreadsheetId: this.spreadsheetId
    // });
    // const sheetId = sheetResponse.result.sheets[0].properties.sheetId
    // console.log(sheetId);
    // const deleteRequest = {
    //   deleteDimension: {
    //     range: {
    //       sheetId: sheetId,
    //       dimension: 'ROWS',
    //       startIndex: 1 // Start from row 2
    //     }
    //   }
    // };
    // const batchUpdateRequest = {
    //   spreadsheetId: this.spreadsheetId,
    //   resource: {
    //     requests: [deleteRequest]
    //   }
    // };
    // await gapi.client.sheets.spreadsheets.batchUpdate(batchUpdateRequest)



    // update with the row data
    const sheetName = 'Sheet1';
    const endColumn = String.fromCharCode(65 + columnNames.length - 1);
    const endRow = data.length + 1;
    const range = sheetName + "!A2:" + String(endColumn) + (endRow);
    console.log(range);
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: range, // start from row 2
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: data.map(function(row: any) {
          return columnNames.map(function(column) {
            return row[column];
          });
        })
      }
    });
  }
}
