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
    description: string;
    progress: number;
    isDefeated: boolean;
    createdAt: number;
    tier: 'mini' | 'elite' | 'mega';  // ✅ NEW
    unlockAfter?: string[];           // ✅ NEW: list of bossIds to unlock this one
  }