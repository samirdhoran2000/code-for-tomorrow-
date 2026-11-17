export type ChatType = 'direct' | 'group';

export interface Chat {
  id: string;
  type: ChatType;
  name: string | null;
  createdAt: Date;
  memberIds: string[];
}
