import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FindingsListPage } from './findings-list.page';

describe('FindingsListPage', () => {
  let component: FindingsListPage;
  let fixture: ComponentFixture<FindingsListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindingsListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FindingsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
