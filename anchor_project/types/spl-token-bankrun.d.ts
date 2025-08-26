declare module "spl-token-bankrun" {
  export function createMint(...args: any[]): Promise<any>;
  export function mintTo(...args: any[]): Promise<any>;
}
