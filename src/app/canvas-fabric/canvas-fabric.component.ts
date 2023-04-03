import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fabric } from 'fabric';
import jsPDF from 'jspdf'

@Component({
  selector: 'app-canvas-fabric',
  templateUrl: './canvas-fabric.component.html',
  styleUrls: ['./canvas-fabric.component.scss']
})
export class CanvasFabricComponent implements OnInit {

  @ViewChild('canvasElement', { static: true }) canvasElement: any;
  canvas!: fabric.Canvas;
  textBoxes: any = [];
  
  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.createCanvas();
    this.addRightClickEvent();
  }


  createCanvas() {
    const A4PageWidth = 2480;
    const A4PageHeight = 3508;
    const Rescale = 0.35;

    // create a new canvas
    this.canvas = new fabric.Canvas(this.canvasElement.nativeElement, {
      width: A4PageWidth * Rescale,
      height: A4PageHeight * Rescale,
      backgroundColor: 'white',
      fireRightClick: true,  // <-- enable firing of right click events
      stopContextMenu: true, // <--  prevent context menu from showing
      selection: true,
    });
    this.canvas.setZoom(1);

    const canvasWrapper: any = this.canvas.getElement().parentNode;
    canvasWrapper.style.border = '3px solid black';
  }

  addRightClickEvent() {
    // add event listener for right-click
    this.canvas.on('mouse:down', (event) => {
      if (event.button === 3) {
        const textBox = this.canvas.getActiveObject() as fabric.IText;
        if (textBox) {
          this.canvas.remove(textBox);
        }
      }
    });
  }

  addTextBox() {
    // create a new text box
    const textBox = new fabric.IText('Type something here', {
      left: 30,
      top: 30,
      fontFamily: 'Helvetica',
      fontSize: 16,
      fill: '#000000',
      hasControls: true,
      lockMovementX: false,
      lockMovementY: false,
    });

    // add the text box to the canvas
    this.canvas.add(textBox);
  }

  getTextBoxes() {
    const textBoxes = this.canvas.getObjects('i-text') as fabric.IText[];
    const containerWidth = this.canvasElement.nativeElement.offsetWidth;
    const containerHeight = this.canvasElement.nativeElement.offsetHeight;

    if (textBoxes) {
      this.textBoxes = [];

      textBoxes.forEach((tb: fabric.IText) => {
        console.log(textBoxes);

        const tbLeft: any = tb.left;
        const tbTop: any = tb.top;
        // console.log('X position: ' + tbLeft, 'Y position: ' + tbTop);

        const xPosRelative = (tbLeft / containerWidth).toFixed(2);
        const yPosRelative = (tbTop / containerHeight).toFixed(2);

        const scaleX: any = tb.scaleX;
        const scaleY: any = tb.scaleY;

        const scale = (scaleX + scaleY) / 2; 
        const fontSize: any = tb.fontSize;
        const size = fontSize * scale;

        console.log('X position: ' + Number(xPosRelative) * 100  + '%', 'Y position: ' + Number(yPosRelative) * 100 + '%');
        
        const textBoxObj = {
          text: tb.text,
          size: size,
          x: xPosRelative,
          y: yPosRelative,
        }

        this.textBoxes.push(textBoxObj);
      });
    }
  }
}
