// utils/syncToFirestore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

export const syncToFirestore = async () => {
  const user = auth.currentUser;
  if (!user) return; // Không có người dùng thì miễn bàn luôn

  const keysToSync = [
    'xp', 'level', 'tasks', 'bosses', 'quests',
    'streakCount', 'lastActiveDate', 'playerClass',
    'equippedBadge', 'equippedHud', 'equippedPet',
    'unlockedRewards', 'userMonthlyProgress',
    'bossHistory', 'questHistory', 'questStreak', 'lastQuestDate',
  ];

  const data: Record<string, any> = {};

  for (const key of keysToSync) {
    const value = await AsyncStorage.getItem(key);
    if (value) {
      try {
        data[key] = JSON.parse(value); // Nếu là object → parse ra luôn
      } catch {
        data[key] = value; // Nếu là string thường → giữ nguyên
      }
    }
  }

  await setDoc(doc(db, 'users', user.uid), data, { merge: true });

  // Log siêu nhẹ nhàng, tránh quá "máy móc"
  console.log('📤 Dữ liệu đã được cập nhật lên đám mây thành công.');
};
