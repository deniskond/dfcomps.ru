const PROD_CONFIG: Record<string, number> = {
  BAN_TIMER_SECONDS: 30,
  MATCH_TIMER_SECONDS: 15 * 60,
  LAG_COMPENSATION: 1000,
  BOT_TIMER: 60 * 1000,
};

const TEST_CONFIG: Record<string, number> = {
  BAN_TIMER_SECONDS: 1,
  MATCH_TIMER_SECONDS: 1,
  LAG_COMPENSATION: 0,
  BOT_TIMER: 10 * 1000,
};

export class TimingsConfig {
  private static targetConfig = process.env.NODE_ENV === 'prod' ? PROD_CONFIG : TEST_CONFIG;

  public static get BAN_TIMER_SECONDS(): number {
    return this.targetConfig.BAN_TIMER_SECONDS;
  }

  public static get MATCH_TIMER_SECONDS(): number {
    return this.targetConfig.MATCH_TIMER_SECONDS;
  }

  public static get LAG_COMPENSATION(): number {
    return this.targetConfig.LAG_COMPENSATION;
  }

  public static get BOT_TIMER(): number {
    return this.targetConfig.BOT_TIMER;
  }
}
