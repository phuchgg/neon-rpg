import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export const syncFromFirestore = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.warn('🚫 Chưa đăng nhập — bỏ qua bước đồng bộ từ Firestore.');
    return;
  }

  try {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn('⚠️ Không tìm thấy dữ liệu Firestore cho người dùng này.');
      return;
    }

    const data = docSnap.data();
    const keys = Object.keys(data);

    for (const key of keys) {
      const value = data[key];

      // ✅ Xử lý dữ liệu dạng object hoặc đơn giản
      if (typeof value === 'object') {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      } else {
        await AsyncStorage.setItem(key, String(value));
      }
    }

    // ✅ Kiểm tra playerClass bắt buộc
    if (!data.playerClass || typeof data.playerClass !== 'string') {
      await AsyncStorage.setItem('playerClass', 'ghostrunner'); // Dự phòng mặc định
      console.log('🎭 Không thấy playerClass — tự gán "ghostrunner" cho bạn chơi đỡ.');
    }

    // Log nhẹ nhàng cho vui
    console.log('📦 Các key đã đồng bộ từ Firestore:', keys.join(', '));
    console.log('🔥 playerClass đã nhận:', data.playerClass);

    console.log('✅ Dữ liệu cloud đã hồi sinh tại AsyncStorage. All good!');
  } catch (error) {
    console.error('❌ Gặp lỗi khi đồng bộ từ Firestore:', error);
  }
};
