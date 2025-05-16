export interface Reward {
  id: string;
  name: string;
  cost: number;
  type: 'theme' | 'badge' | 'pet' | 'avatar';
  description?: string;
  buff?: string;
}

export const rewards: Reward[] = [
  // 🎨 Themes
  { id: 'neon_theme', name: '🟢 Neon Green Theme', cost: 1000, type: 'theme' },
  { id: 'fire_red', name: '🔥 Fire Red Theme', cost: 120, type: 'theme' },
  { id: 'nightwave', name: '🌌 Nightwave Theme', cost: 1300, type: 'theme' },
  { id: 'ice_pulse', name: '❄️ Ice Pulse Theme', cost: 1400, type: 'theme' },
  { id: 'synthcore', name: '💜 Synthcore Theme', cost: 1600, type: 'theme' },

  // 🐶 Existing Dog (Reworked)
  { id: 'pet_dog', name: '🐶 Doggo Beta', cost: 50, type: 'pet', description: 'Companion pet for beta testers. Loyal but basic.', buff: '+Moral Support' },

  // 🐾 Pets
  { id: 'pet_byte', name: '🐭 Tí Byte', cost: 100, type: 'pet', description: 'Em chuột bé tí chuyên gặm mấy file lỗi. Cứ mỗi lần ông xong task là nó tự động "dọn rác số".', buff: '+Clean Cache on task complete' },
  { id: 'pet_mucdien', name: '🦑 Mực Điện', cost: 120, type: 'pet', description: 'Bạch tuộc mini có xúc tu neon. Hút cạn stress & bơm thêm “năng lượng sáng tạo”. Cười nham hiểm.', buff: '+Creativity Boost' },
  { id: 'pet_bapmach', name: '🐰 Bắp Mạch', cost: 150, type: 'pet', description: 'Bé thỏ cyber màu ngô non. Tăng tốc độ làm việc, chạy nhảy như code compile 0.1s.', buff: '+Task Speed' },
  { id: 'pet_meonhieu', name: '🐱‍💻 Mèo Nhiễu', cost: 180, type: 'pet', description: 'Con mèo glitch liên tục, tưởng lỗi chứ thật ra đang giúp ông phân tán kẻ địch. Buff kiên nhẫn.', buff: '+Patience Buff' },
  { id: 'pet_chiplua', name: '🐦 Chíp Lửa', cost: 200, type: 'pet', description: 'Chim sẻ bé xíu nhưng phóng hỏa cực mạnh. Boost task quan trọng, thổi bay deadline.', buff: '+Priority Task Boost' },
  { id: 'pet_domxanh', name: '💡 Đóm Xanh', cost: 220, type: 'pet', description: 'Đom đóm điện tử, chuyên thắp sáng mấy ý tưởng mờ mịt. Buff focus nhẹ nhàng như cafe sữa đá.', buff: '+Light Focus' },
  { id: 'pet_caonhapnhay', name: '🦊 Cáo Nhấp Nháy', cost: 250, type: 'pet', description: 'Cáo neon đuôi led RGB, giỏi làm mấy nhiệm vụ lén lút. Buff stealth + tinh ranh như mấy meme "vãi cả cáo".', buff: '+Stealth & Smart Tricks' },
  { id: 'pet_teptia', name: '🦐 Tép Tia', cost: 180, type: 'pet', description: 'Con tép nhỏ nhưng phóng điện ầm ầm. Mỗi lần ông lười, nó giật phát tỉnh luôn. XP tăng vì sợ.', buff: '+XP Jolt when Idle' },
  { id: 'pet_bomach', name: '🐌 Bò Mạch', cost: 160, type: 'pet', description: 'Ốc sên cyberpunk nhưng bò tới đâu sửa lỗi hệ thống tới đó. Buff chậm mà chắc. Hơi cà khịa.', buff: '+Bug Fix Over Time' },
  { id: 'pet_banhbao', name: '🥟 Bánh Bao Độn', cost: 300, type: 'pet', description: 'Hình dạng dễ thương, núc ních, nhưng giấu cả kho AI bên trong. Buff reset tâm trạng khi chán nản.', buff: '+Mood Reset' },

  // 🐉 Rare Boss-like Pets
  { id: 'pet_lansohoa', name: '🦁 Lân Số Hóa', cost: 1000, type: 'pet', description: 'Con lân máy móc, mỗi lần ông làm tốt nó múa phát buff may mắn lên trời.', buff: '+Luck Buff on Task Complete' },
  { id: 'pet_rongcapquang', name: '🐉 Rồng Cáp Quang', cost: 1500, type: 'pet', description: 'Boost tốc độ xử lý công việc x2 khi “bật mode cháy cáp”. Cực hợp deadline thần tốc.', buff: '+x2 Work Speed during Rush Mode' },
  { id: 'pet_hobangmach', name: '🐯 Hổ Băng Mạch', cost: 1800, type: 'pet', description: 'Cực lạnh, cực chính xác. Buff tập trung sát thương thẳng vào mấy task khó.', buff: '+Focus & Precision on Hard Tasks' },

  

  // 🎖️ Badges
  { id: 'badge_glitch', name: 'Glitch Badge', cost: 500, type: 'badge' },
  { id: 'badge_cyberfox', name: 'Cyber Fox Badge', cost: 100, type: 'badge' },
  { id: 'badge_neoncat', name: 'Neon Cat Badge', cost: 150, type: 'badge' },
  { id: 'badge_mechskull', name: 'Mech Skull Badge', cost: 2000, type: 'badge' },
  { id: 'badge_pixelbot', name: 'Pixel Bot Badge', cost: 2500, type: 'badge' },
  { id: 'badge_glowslime', name: 'Glow Slime Badge', cost: 3000, type: 'badge' },
  { id: 'badge_hologram', name: 'Hologram Badge', cost: 4000, type: 'badge' },
  { id: 'badge_darklotus', name: 'Dark Lotus Badge', cost: 5000, type: 'badge' },
  { id: 'badge_auraflame', name: 'Aura Flame Badge', cost: 6000, type: 'badge' },
  { id: 'badge_neonphoenix', name: 'Neon Phoenix Badge', cost: 7500, type: 'badge' },
];
