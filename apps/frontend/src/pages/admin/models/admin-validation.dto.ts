export interface PlayerDemosValidationDto {
  nick: string;
  demos: {
    ftime: string;
    verified: string;
    reason: string;
    demopath: string;
  }[];
}

export interface AdminValidationDto {
  cup: {
    id: string;
    full_name: string;
  };
  players_demos_cpm: PlayerDemosValidationDto[];
  players_demos_vq3: PlayerDemosValidationDto[];
}
