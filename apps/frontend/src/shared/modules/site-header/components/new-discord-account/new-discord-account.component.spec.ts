import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewDiscordAccountComponent } from './new-discord-account.component';

describe('NewDiscordAccountComponent', () => {
  let component: NewDiscordAccountComponent;
  let fixture: ComponentFixture<NewDiscordAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewDiscordAccountComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewDiscordAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
