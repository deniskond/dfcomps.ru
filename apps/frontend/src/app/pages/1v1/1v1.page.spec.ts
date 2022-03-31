import { OneVOnePageComponent } from './1v1.page';
import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { OneVOnePageModule } from './1v1.page.module';

describe('OneVOnePageComponent', () => {
  let component: OneVOnePageComponent;
  let fixture: ComponentFixture<OneVOnePageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [OneVOnePageModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OneVOnePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
