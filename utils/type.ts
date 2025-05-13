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
};

export interface Npc {
  avatar: string;
  name: string;
  quote: string;
}

export type ClassType = 'ghostrunner' | 'netcrasher' | 'synthmancer';