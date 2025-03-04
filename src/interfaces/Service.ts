export interface Service {
  id: string;
  name: string;
  version: string;
  endpoints: string[];
  health: () => Promise<boolean>;
}
