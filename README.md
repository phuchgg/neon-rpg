# ⚡ NeonRPG - Productivity XP Tracker App

> A futuristic, cyberpunk-themed task manager that turns your real-life goals into RPG-style quests.  
> Built with Expo + React Native.

![screenshot](./screenshots/main-ui.png) <!-- Add your image later -->

---

## 💡 Features

- ✅ Add, complete, and delete daily tasks
- 🎮 XP & Leveling system (Max level: 100)
- 🧬 Choose your class: Ghostrunner, Netcrasher, or Synthmancer
- 🎁 XP bonuses based on class logic
- 🔥 Streak system + daily tracking
- 🎇 Lottie animations for level-up & bonus rewards
- 🛒 Role Shop: spend XP to switch your life class
- 💾 Data persistence using AsyncStorage

---

## 🧬 Classes

| Class         | Bonus Effect                                |
|---------------|---------------------------------------------|
| 🏃 Ghostrunner | +20% XP for short tasks (≤10 characters)     |
| 💻 Netcrasher  | +5 XP for tasks like “code”, “debug”, “fix” |
| 🔮 Synthmancer | +2 XP flat per completed task               |

---

## 🚀 Tech Stack

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Lottie Animations](https://airbnb.io/lottie/)
- AsyncStorage for local data
- TypeScript

---

## 📦 Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/neon-rpg-app.git
cd neon-rpg-app
npm install
npx expo start
