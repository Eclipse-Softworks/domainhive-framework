export interface Protocol {
  name: string;
  connect(config: any): Promise<void>;
  disconnect(): Promise<void>;
  send(data: any): Promise<void>;
  receive(callback: (data: any) => void): void;
}
