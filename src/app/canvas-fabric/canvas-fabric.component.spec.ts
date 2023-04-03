import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasFabricComponent } from './canvas-fabric.component';

describe('CanvasFabricComponent', () => {
  let component: CanvasFabricComponent;
  let fixture: ComponentFixture<CanvasFabricComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CanvasFabricComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasFabricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
