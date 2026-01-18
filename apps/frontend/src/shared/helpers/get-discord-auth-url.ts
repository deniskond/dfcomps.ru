export function getDiscordAuthURL(state: 'link' | 'login' | 'register'): string {
  const origin = window.location.origin;
  const dfcompsRedirectURI = `${origin}/oauth/discord`;

  return `https://discord.com/oauth2/authorize?response_type=token&client_id=1154028126783946772&scope=identify&state=${state}&redirect_uri=${dfcompsRedirectURI}`;
}
