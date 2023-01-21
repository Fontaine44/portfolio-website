import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShotPlotComponent } from './shot-plot.component';

describe('ShotPlotComponent', () => {
  let component: ShotPlotComponent;
  let fixture: ComponentFixture<ShotPlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShotPlotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShotPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
