import { Component, OnInit, ViewChild } from '@angular/core';
import { PDFDocument, StandardFonts, rgb, PDFString } from 'pdf-lib' // https://pdf-lib.js.org/#examples
import * as downloadjs from 'downloadjs'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

import fontkit from '@pdf-lib/fontkit';

import { CanvasFabricComponent } from '../canvas-fabric/canvas-fabric.component'

import { AppService } from '../app.service';
import { GridOptions } from 'ag-grid-community';

interface TemplateSetting {
  [key: string]: any; // tell TypeScript that any string can be used to access a property of type 'any'

  text: string,
  size: number,
  x: number,
  y: number,
  color?: string
}

@Component({
  selector: 'app-create-pdf',
  templateUrl: './create-pdf.component.html',
  styleUrls: ['./create-pdf.component.scss']
})
export class CreatePdfComponent implements OnInit {

  @ViewChild('CanvasFabricComponent', {static: true}) CanvasFabricComponent?: CanvasFabricComponent;

  pdfDoc: any;
  drawTextSettings: any = {
    size: 12,
    color: rgb(0, 0, 0)
  }

  width: any;
  height: any;

  rowData = [
    { No: 1, Item: 'No. 1 ベルトC/V', Amount: 1, Unit: '式', Price: '1,042,000', Total: '1,042,000' },
    { No: 1, Item: 'No. 1 ベルトC/V', Amount: 1, Unit: '式', Price: '1,042,000', Total: '1,042,000' },
    { No: 1, Item: 'No. 1 ベルトC/V', Amount: 1, Unit: '式', Price: '1,042,000', Total: '1,042,000' },
  ];  
  columnDefs = [
    { field: 'No', headerName: 'No.' },
    { field: 'Item', headerName: '名称' },
    { field: 'Amount', headerName: '数量' },
    { field: 'Unit', headerName: '単位' },
    { field: 'Price', headerName: '評価' },
    { field: 'Total', headerName: '金額' },
  ];
  gridOptions: GridOptions = {
    rowSelection: 'single',
    defaultColDef: {
      editable: true,
    },
  };
  private gridApi: any;


  constructor(
    private appService: AppService
  ) { }

  ngOnInit(): void {
    // this.setDefaultDrawSettings();
  }

  async setDefaultDrawSettings() {
    // font family
    this.pdfDoc = await PDFDocument.create();
    const fontArrayBuffer = await this.appService.getFont();
    this.pdfDoc.registerFontkit(fontkit)
    const fontFamily = await this.pdfDoc.embedFont(fontArrayBuffer)
    this.drawTextSettings['font'] = fontFamily;
  }

  async createPdf() {
    await this.setDefaultDrawSettings();

    // add new page
    const pdfDoc = this.pdfDoc;
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize();
    this.width = width * 0.98;
    this.height = height * 0.98;

    // create template
    this.createTemplate(page);

    // create table
    await this.createTable(page, pdfDoc);

    // download & preview
    const pdfBytes = await pdfDoc.save();
    this.openPreviewInNewTab(pdfBytes);
    // this.downloadPdf(pdfBytes, "pdf-lib_creation_example.pdf");
  }

  createTemplate(page: any) {
    // console.log(this.CanvasFabricComponent)
    // const CanvasFabricComponent: any = this.CanvasFabricComponent;
    // const settingsFromCanvas = CanvasFabricComponent.textBoxes;
    // const templateSettings: TemplateSetting[] = settingsFromCanvas



    const templateSettings: TemplateSetting[] = [
      {text: '御見見積', size: 25, x: 0.075, y: 0.050},
      {text: '現在No.', size: 12, x: 0.7, y: 0.050},
      {text: '株式会社', size: 12, x: 0.75, y: 0.13},
      {text: 'SKY', size: 16, x: 0.85, y: 0.13},
    ]
    

    for (const setting of templateSettings) {
      this.drawText(page, setting)
    }


  }

  drawText(page: any, setting: TemplateSetting) {
    const { text } = setting;
    const drawTextSettings = this.drawTextSettings;

    Object.keys(setting).forEach((key: string) => {
      if (key === 'x') setting[key] = setting[key] * this.width;
      if (key === 'y') setting[key] = (1 - setting[key]) * this.height;
      // if (key === 'x' || key === 'y') console.log(key, setting[key])  
      drawTextSettings[key] = setting[key];
    });

    page.drawText(text, drawTextSettings);
  }



  /* ------------------------------------------------------------------------------------------------------------
  Base OK, needs fine-tuning
  ------------------------------------------------------------------------------------------------------------ */
  async createTable(page: any, pdfDoc: any) {
    const doc: any = new jsPDF()
    const getFontList = doc.getFontList();
    console.log(getFontList)

    const fontArrayBuffer = await this.appService.getFont();
    const binaryString = Array.from(new Uint8Array(fontArrayBuffer)).map(byte => String.fromCharCode(byte)).join('');
    await doc.addFileToVFS('myfont.ttf', binaryString);
    await doc.addFont('myfont.ttf', 'myfont', 'normal');

    const columns = this.columnDefs.map(obj => obj['headerName']);
    const rowData: any = [];
    this.gridApi.forEachNode((node: any) => rowData.push(node.data));
    const rows = rowData.map((obj: any) => Object.values(obj));
    // console.log(columns);
    // console.log(rows);


    doc.autoTable({
      theme: 'grid',
      headStyles: {
        fillColor: 'white',
        textColor: 'black',
        lineColor: '#000000',
        lineWidth: 0.3,
        font: 'myfont'
      },
      bodyStyles: {
        fillColor: 'white',
        textColor: 'black',
        lineColor: '#000000',
        lineWidth: 0.3,
        font: 'myfont'
      },
      columnStyles: {
        0: {cellWidth: 10},
        1: {cellWidth: 80},
        2: {cellWidth: 12},
        3: {cellWidth: 12},
        4: {cellWidth: 35},
        5: {cellWidth: 35},
      },
      head: [columns],
      body: rows,
    });

    // as bytes
    const tableArrayBuffer: ArrayBuffer = await doc.output('arraybuffer');
    const [myTable] = await pdfDoc.embedPdf(tableArrayBuffer);
    const myTableDims = myTable.scale(1);
    page.drawPage(myTable, {
      ...myTableDims,
      x: -12,
      y: -100
    });

    return tableArrayBuffer;
  }






  /* ------------------------------------------------------------------------------------------------------------
  Finished
  ------------------------------------------------------------------------------------------------------------ */
  openPreviewInNewTab(pdfBytes: any) {
    const pdfUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
    window.open(pdfUrl, '_blank');
  }
  downloadPdf(pdfBytes: any, fileName: any) {
    downloadjs(pdfBytes, fileName, "application/pdf");
  }
















  /* ------------------------------------------------------------------------------------------------------------
  AG Grid
  ------------------------------------------------------------------------------------------------------------ */

  onGridReady(params: any) {
    this.gridApi = params.api;
    console.log(this.gridApi);
  }

  onAddRow() {
    console.log(this.gridApi);

    const newRow = { id: this.rowData.length + 1, name: '', age: 0 };
    this.gridApi.applyTransaction({ add: [newRow] });
  }

  onDeleteRow() {
    const selectedNodes = this.gridApi.getSelectedNodes();
    this.gridApi.applyTransaction({ remove: selectedNodes });
  }

  onUploadExcel() {

  }


}
