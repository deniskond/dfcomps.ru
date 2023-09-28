import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscordOauthComponent } from './discord-oauth.component';

describe('DiscordOauthComponent', () => {
  let component: DiscordOauthComponent;
  let fixture: ComponentFixture<DiscordOauthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscordOauthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscordOauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
