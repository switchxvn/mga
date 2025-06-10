export interface Settings {
  id: number;
  key: string;
  value: string;
  group: string | null;
  description: string | null;
  is_public: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSettingInput {
  key: string;
  value: string;
  group?: string;
  description?: string;
  is_public?: boolean;
}

export interface UpdateSettingInput {
  id: number;
  value?: string;
  group?: string;
  description?: string;
  is_public?: boolean;
}

export interface SettingsByGroup {
  [group: string]: Settings[];
} 