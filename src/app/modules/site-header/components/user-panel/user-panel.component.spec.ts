import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserPanelComponent } from './user-panel.component';
import { MatDialog } from '@angular/material';
import { mock, instance, when } from 'ts-mockito';
import { UserService } from '../../../../services/user-service/user.service';
import { RouterTestingModule } from '@angular/router/testing';
import { EMPTY } from 'rxjs';

describe('UserPanelComponent', () => {
    let component: UserPanelComponent;
    let fixture: ComponentFixture<UserPanelComponent>;
    const userServiceMock = mock(UserService);

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [UserPanelComponent],
            providers: [
                { provide: MatDialog, useFactory: () => instance(mock(MatDialog)) },
                { provide: UserService, useFactory: () => instance(userServiceMock) },
            ],
        }).compileComponents();

        when(userServiceMock.getCurrentUser$()).thenReturn(EMPTY);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
