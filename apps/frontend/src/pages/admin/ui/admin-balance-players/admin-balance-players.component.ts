import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnlineCupServersPlayersInterface } from '@dfcomps/contracts';
import { AdminDataService } from '~pages/admin/business/admin-data.service';

@Component({
  selector: 'admin-balance-players',
  templateUrl: './admin-balance-players.component.html',
  styleUrls: ['./admin-balance-players.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBalancePlayersComponent implements OnInit {
  public serversPlayers: OnlineCupServersPlayersInterface;
  private cupId: number;

  constructor(
    private adminDataService: AdminDataService,
    private changeDetectorRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.cupId = this.activatedRoute.snapshot.params['id'];

    this.adminDataService
      .getOnlineCupServersPlayers$(this.cupId)
      .subscribe((serversPlayers: OnlineCupServersPlayersInterface) => {
        this.serversPlayers = serversPlayers;
        this.changeDetectorRef.markForCheck();
      });
  }

  public transferPlayer(playerId: number, serverIndex: number): void {
    const targetServer = serverIndex === 0 ? 2 : 1;
    const targetIndex = targetServer - 1;

    this.adminDataService.setPlayerServer$(playerId, targetServer, this.cupId).subscribe(() => {
      const targetPlayer = this.serversPlayers.servers[serverIndex].players.find((player) => player.id === playerId)!;

      this.serversPlayers.servers[serverIndex].players = this.serversPlayers.servers[serverIndex].players.filter(
        (player) => player.id !== playerId,
      );

      this.serversPlayers.servers[targetIndex].players.push(targetPlayer);

      this.changeDetectorRef.markForCheck();
    });
  }
}
