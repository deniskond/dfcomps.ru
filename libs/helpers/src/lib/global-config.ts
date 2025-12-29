export class GlobalConfig {
  public static get settings(): Record<string, boolean> {
    return {
      isWorldspawnParserEnabled: false,
    };
  }
}
