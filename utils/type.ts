import React from "react";
import { View } from "react-native";

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    createdAt: number;
    bossId?: string;
}

export interface Boss {
    id: string;
    title: string;
    xpRemaining: number;  // ✅ New field
  totalXp: number;      // ✅ Total HP for progress %
    description: string;
    progress: number;
    isDefeated: boolean;
    createdAt: number;
    tier: 'mini' | 'elite' | 'mega';  // ✅ NEW
    unlockAfter?: string[];           // ✅ NEW: list of bossIds to unlock this one
    connectsTo?: string[];
    classRequired?: 'ghostrunner' | 'netcrasher' | 'synthmancer';
  }

export type Quest = {
  id: string;
  title: string;
  description: string;
  progress: number; // 0–100
  isComplete: boolean;
  type: 'task' | 'boss' | 'class';
  condition: {
    target: number; // e.g. 5 tasks or 3 bosses
    current: number;
  };
  rewardXp: number;
  timeLimit?: number; // 🆕 In milliseconds (e.g., 6 * 60 * 60 * 1000 for 6h)
  startTime?: number; // 🆕 Timestamp (Date.now())
  isFailed?: boolean;  // ✅ Add this line
};

export interface Npc {
  avatar: string;
  name: string;
  quote: string;
}

export type ClassType = 'ghostrunner' | 'netcrasher' | 'synthmancer';
export type PlayerClass = 'ghostrunner' | 'netcrasher' | 'synthmancer';
