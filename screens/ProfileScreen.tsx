// ProfileScreen.tsx - Redesigned to match TaskScreen UI/UX with improved layout
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigation';
import { XPManager } from '../utils/XPManager';
import { auth, db } from '../utils/firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { syncToFirestore } from '../utils/syncToFirestore';
import { syncFromFirestore } from '../utils/syncFromFirestore';
import { useTheme } from '../contexts/ThemeContext';
import { ClassAvatarMap } from '../utils/AssetManager';

export default function ProfileScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [playerClass, setPlayerClass] = useState<string | null>(null);
  const [bossesDefeated, setBossesDefeated] = useState(0);
  const [pet, setPet] = useState<string | null>(null);
  const [badge, setBadge] = useState<string | null>(null);
  const [questsDone, setQuestsDone] = useState(0);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ProfileScreen'>>();
  const { theme } = useTheme();

  useEffect(() => {
    const sub = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email || null);
    });

    const preventBack = () => {
      if (!auth.currentUser) return true;
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', preventBack);

    return () => {
      backHandler.remove();
      sub();
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const totalXp = await XPManager.getXp();
      const currentLevel = await XPManager.getLevel();
      const streakCount = await AsyncStorage.getItem('streakCount');
      const classId = await AsyncStorage.getItem('playerClass');
      const bossHistoryJson = await AsyncStorage.getItem('bossHistory');
      const bossHistory = bossHistoryJson ? JSON.parse(bossHistoryJson) : [];
      const monthlyData = await AsyncStorage.getItem('userMonthlyProgress');
      const parsed = monthlyData ? JSON.parse(monthlyData) : {};
      const equippedPet = await AsyncStorage.getItem('equippedPet');
      const equippedBadge = await AsyncStorage.getItem('equippedBadge');
      const questHistoryJson = await AsyncStorage.getItem('questHistory');
      const questHistory = questHistoryJson ? JSON.parse(questHistoryJson) : [];
      const storedName = await AsyncStorage.getItem('playerName');

      setName(storedName || '');
      setPet(equippedPet);
      setBadge(equippedBadge);
      setQuestsDone(questHistory.length);
      setXp(totalXp);
      setLevel(currentLevel);
      setStreak(streakCount ? parseInt(streakCount) : 0);
      setPlayerClass(classId || null);
      setTasksCompleted(parsed.tasksCompleted || 0);
      setBossesDefeated(bossHistory.length);
    };
    loadData();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Đăng nhập thành công');
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await syncFromFirestore();
      navigation.replace('TaskScreen');
    } catch (err: any) {
      Alert.alert('Đăng nhập thất bại', err.message);
    }
  };

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await syncFromFirestore();
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
        xp: 0,
        level: 1,
        language: null,
        name: name,
      });
      await AsyncStorage.setItem('playerName', name);
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await syncToFirestore();
      Alert.alert('Đăng ký thành công');
      navigation.replace('TaskScreen');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        Alert.alert('Email đã được sử dụng', 'Email này đã được đăng ký. Vui lòng đăng nhập.');
      } else {
        Alert.alert('Đăng ký thất bại', err.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await syncToFirestore();
      await signOut(auth);
      await AsyncStorage.clear();
      setUserEmail(null);
      setXp(0);
      setLevel(1);
      setTasksCompleted(0);
      setStreak(0);
      setPlayerClass(null);
      setBossesDefeated(0);
      setPet(null);
      setBadge(null);
      setQuestsDone(0);
      await XPManager.setXp(0);
      await AsyncStorage.setItem('level', '1');
      Alert.alert('Đã đăng xuất', 'Khởi động lại ứng dụng để sử dụng ở chế độ offline.');
    } catch (e) {
      Alert.alert('Đăng xuất thất bại');
    }
  };

    const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
      justifyContent: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.accent,
      textAlign: 'center',
      marginBottom: 30,
    },
    authCard: {
      width: '100%',
      maxWidth: 360,
      alignSelf: 'center',
      backgroundColor: '#1a1a2e',
      padding: 20,
      borderRadius: 12,
      borderColor: '#666',
      borderWidth: 1,
    },
    profileCard: {
      padding: 20,
      backgroundColor: '#1a1a2e',
      borderRadius: 12,
      borderColor: '#666',
      borderWidth: 1,
      width: '100%',
      alignSelf: 'center',
    },
    avatarSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    avatarImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: theme.accent,
      marginRight: 16,
    },
    infoLine: {
      color: theme.text,
      fontSize: 14,
      marginBottom: 4,
    },
    infoValue: {
      fontWeight: 'bold',
      color: theme.accent,
    },
    statsBox: {
      backgroundColor: '#0f172a',
      padding: 14,
      borderRadius: 10,
      borderColor: theme.accent,
      borderWidth: 1,
      marginBottom: 20,
    },
    statLine: {
      fontSize: 14,
      marginBottom: 6,
      color: '#ddd',
    },
    statValue: {
      fontWeight: 'bold',
      color: theme.accent,
    },
    input: {
      backgroundColor: '#1f1f2e',
      color: '#fff',
      padding: 10,
      marginBottom: 10,
      borderRadius: 8,
      borderColor: '#666',
      borderWidth: 1,
    },
    inputFocused: {
      borderColor: theme.accent,
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryButton: {
      backgroundColor: theme.accent,
      padding: 12,
      borderRadius: 8,
      marginTop: 10,
    },
    primaryText: {
      color: '#000',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    switchText: {
      marginTop: 18,
      textAlign: 'center',
      color: theme.text,

    },
    logoutBtn: {
      backgroundColor: '#ff4d4d',
      padding: 12,
      borderRadius: 8,
    },
    logoutText: {
      color: '#fff',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    titleWide: {
  fontSize: 28,
  fontWeight: 'bold',
  color: theme.accent,
  textAlign: 'center',
  marginBottom: 20,
  alignSelf: 'stretch',
  paddingLeft: 10,
},
  });

  return (
    <View style={styles.container}>
        
      {userEmail ? (
        <View style={styles.profileCard}>
            <Text style={styles.titleWide}>Hồ sơ người chơi</Text>
          <View style={styles.avatarSection}>
            <Image source={ClassAvatarMap[playerClass || 'ghostrunner']} style={styles.avatarImage} />
            <View>
              <Text style={styles.infoLine}>🧑 Tên: <Text style={styles.infoValue}>{name || 'N/A'}</Text></Text>
              <Text style={styles.infoLine}>🎮 Class: <Text style={styles.infoValue}>{playerClass}</Text></Text>
              <Text style={styles.infoLine}>🏅 Huy hiệu: <Text style={styles.infoValue}>{badge?.replace('badge_', '') || 'Chưa có'}</Text></Text>
              <Text style={styles.infoLine}>🐾 Pet: <Text style={styles.infoValue}>{pet?.replace('pet_', '') || 'Chưa có'}</Text></Text>
            </View>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statLine}>✨ Kinh Nghiệm: <Text style={styles.statValue}>{xp}</Text></Text>
            <Text style={styles.statLine}>📈 Cấp: <Text style={styles.statValue}>{level}</Text></Text>
            <Text style={styles.statLine}>✅ Nhiệm vụ: <Text style={styles.statValue}>{tasksCompleted}</Text></Text>
            <Text style={styles.statLine}>🔥 Chuỗi: <Text style={styles.statValue}>{streak} days</Text></Text>
            <Text style={styles.statLine}>👑 Boss đã hạ: <Text style={styles.statValue}>{bossesDefeated}</Text></Text>
            <Text style={styles.statLine}>📜 Nhiệu vụ nhóm: <Text style={styles.statValue}>{questsDone}</Text></Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Thoát</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.authCard}>
          <Text style={styles.title}>Hồ sơ người chơi</Text>
          {mode === 'register' && (
            <TextInput style={styles.input} placeholder="Tên của bạn" placeholderTextColor={theme.text} value={name} onChangeText={setName} />
          )}
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor={theme.text} value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Mật khẩu" placeholderTextColor={theme.text}  secureTextEntry value={password} onChangeText={setPassword} />
          <TouchableOpacity style={styles.primaryButton} onPress={mode === 'login' ? handleLogin : handleRegister}>
            <Text style={styles.primaryText}>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</Text>
          </TouchableOpacity>
          <Text style={styles.switchText} onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
          </Text>
        </View>
      )}
    </View>
  );
}
