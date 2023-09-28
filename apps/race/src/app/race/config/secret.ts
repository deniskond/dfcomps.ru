export class SecretsConfig {
  public static get TOKEN_SALT(): string {
    return 'test_salt'; // [FIXME] get from environment
  }
}
