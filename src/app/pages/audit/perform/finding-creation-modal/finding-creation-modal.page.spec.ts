import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FindingCreationModalPage } from './finding-creation-modal.page';

describe('FindingCreationModalPage', () => {
  let component: FindingCreationModalPage;
  let fixture: ComponentFixture<FindingCreationModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindingCreationModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FindingCreationModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
