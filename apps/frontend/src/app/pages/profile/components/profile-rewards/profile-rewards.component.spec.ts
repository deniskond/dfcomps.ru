import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ProfileRewardsComponent } from './profile-rewards.component';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('ProfileRewardsComponent', () => {
  let component: ProfileRewardsComponent;
  let fixture: ComponentFixture<ProfileRewardsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatTooltipModule],
      declarations: [ProfileRewardsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileRewardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
