export class SecretsConfig {
  public static get TOKEN_SALT(): string {
    return process.env.SALT ?? '';
  }
}
