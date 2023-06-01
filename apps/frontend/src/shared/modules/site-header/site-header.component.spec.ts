import { UserService } from '../../services/user-service/user.service';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SiteHeaderComponent } from './site-header.component';
import { SiteHeaderModule } from './site-header.module';
import { RouterTestingModule } from '@angular/router/testing';
import { mock, instance, when } from 'ts-mockito';
import { EMPTY } from 'rxjs';

describe('SiteHeaderComponent', () => {
  let component: SiteHeaderComponent;
  let fixture: ComponentFixture<SiteHeaderComponent>;
  const userServiceMock = mock(UserService);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SiteHeaderModule, RouterTestingModule],
      providers: [{ provide: UserService, useFactory: () => instance(userServiceMock) }],
    }).compileComponents();

    when(userServiceMock.getCurrentUser$()).thenReturn(EMPTY);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
