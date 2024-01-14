import { ReactNode } from "react";

export type ROOM_TYPE = {
  room_id: string;
  created_at: Date;
  state: number;
};

export type ReadyState = {
  [key: string]: boolean;
};

export type StateMappingType = {
  [key: number]: ReactNode;
};

export type QuestionType = { id: number; question: string; created_at: Date };
