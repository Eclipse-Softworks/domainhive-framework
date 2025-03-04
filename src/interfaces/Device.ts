export interface Device {
  id: string;
  type: string;
  status: 'connected' | 'disconnected';
  protocol: string;
  lastSeen: Date;
  metadata: Record<string, any>;
}
