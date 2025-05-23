export const rewards: Reward[] = [
  // 🎨 Chủ đề giao diện
  { id: 'jade_echo', name: 'Jade Echo', cost: 100, type: 'theme' },
  { id: 'fire_red', name: 'Lửa Đỏ', cost: 120, type: 'theme' },
  { id: 'nightwave', name: 'Sóng Đêm', cost: 130, type: 'theme' },
  { id: 'ice_pulse', name: 'Xung Băng', cost: 140, type: 'theme' },
  { id: 'synthcore', name: 'Synthcore', cost: 160, type: 'theme' },

  // 🐶 Thú cưng cho beta tester
  { id: 'pet_dog', name: 'Chó Cỏ', cost: 50, type: 'pet', description: 'Thú cưng đồng hành cho người dùng bản beta. Trung thành nhưng hơi đơn giản.', buff: '+Hỗ trợ tinh thần' },

  // 🐾 Thú cưng
  { id: 'pet_byte', name: 'Tí Byte', cost: 100, type: 'pet', description: 'Chuột mini chuyên gặm file lỗi. Hoàn thành task là nó dọn rác số ngay.', buff: '+Tự dọn bộ nhớ khi hoàn thành task' },
  { id: 'pet_mucdien', name: 'Mực Điện', cost: 120, type: 'pet', description: 'Bạch tuộc neon mini. Hút sạch stress và bơm đầy sáng tạo. Cười nham hiểm như boss cuối.', buff: '+Tăng sáng tạo' },
  { id: 'pet_bapmach', name: 'Bắp Mạch', cost: 150, type: 'pet', description: 'Thỏ cyber màu bắp. Làm việc nhanh như lệnh compile 0.1s.', buff: '+Tăng tốc độ task' },
  { id: 'pet_meonhieu', name: 'Mèo Nhiễu', cost: 180, type: 'pet', description: 'Mèo glitch liên tục. Trông như lỗi nhưng giúp bạn phân tâm địch và tăng kiên nhẫn.', buff: '+Tăng kiên nhẫn' },
  { id: 'pet_chiplua', name: 'Chíp Lửa', cost: 200, type: 'pet', description: 'Chim sẻ tí hon nhưng buff siêu mạnh. Tăng hiệu suất task quan trọng như đốt deadline.', buff: '+Boost cho nhiệm vụ ưu tiên' },
  { id: 'pet_domxanh', name: 'Đóm Xanh', cost: 220, type: 'pet', description: 'Đom đóm điện tử, chuyên soi sáng ý tưởng mờ mịt. Tăng focus như uống cà phê sữa đá.', buff: '+Tăng tập trung nhẹ' },
  { id: 'pet_caonhapnhay', name: 'Cáo Nhấp Nháy', cost: 250, type: 'pet', description: 'Cáo neon đuôi RGB. Thành thạo nhiệm vụ lén lút. Buff "tàng hình" và "tinh ranh".', buff: '+Tàng hình & mưu mẹo' },
  { id: 'pet_teptia', name: 'Tép Tia', cost: 180, type: 'pet', description: 'Tép nhỏ nhưng giật điện căng. Mỗi lần bạn lười là nó quất cho tỉnh. XP tăng vì sợ.', buff: '+Shock XP khi trì hoãn' },
  { id: 'pet_bomach', name: 'Bò Mạch', cost: 160, type: 'pet', description: 'Ốc sên cyber bò tới đâu fix bug tới đó. Chậm mà chắc. Vừa giúp vừa cà khịa.', buff: '+Fix bug dần theo thời gian' },
  { id: 'pet_banhbao', name: 'Bánh Bao Độn', cost: 300, type: 'pet', description: 'Ngoài tròn, trong AI. Khi bạn chán, nó giúp reset tâm trạng.', buff: '+Reset cảm xúc' },

  // 🐉 Thú cưng hiếm như boss
  { id: 'pet_lansohoa', name: 'Lân Số Hóa', cost: 100, type: 'pet', description: 'Lân máy móc. Mỗi lần bạn làm tốt, nó múa buff may mắn lên tận trời.', buff: '+Buff may mắn khi hoàn thành task' },
  { id: 'pet_rongcapquang', name: 'Rồng Cáp Quang', cost: 150, type: 'pet', description: 'Xử lý công việc x2 khi bạn bật “mode cháy cáp”. Quét deadline như bão.', buff: '+Tăng gấp đôi tốc độ khi rush' },
  { id: 'pet_hobangmach', name: 'Hổ Băng Mạch', cost: 180, type: 'pet', description: 'Cực lạnh, cực chính xác. Buff focus và sát thương thẳng vào mấy task khó.', buff: '+Tăng focus và độ chính xác cho task khó' },

  // 🎖️ Huy hiệu
  { id: 'badge_glitch', name: 'Glitch', cost: 500, type: 'badge' },
  { id: 'badge_cyberfox', name: 'Cáo Cyber', cost: 100, type: 'badge' },
  { id: 'badge_neoncat', name: 'Mèo Neon', cost: 150, type: 'badge' },
  { id: 'badge_mechskull', name: 'Đầu Máy', cost: 2000, type: 'badge' },
  { id: 'badge_pixelbot', name: 'Pixel Bot', cost: 2500, type: 'badge' },
  { id: 'badge_glowslime', name: 'Slime Phát Sáng', cost: 3000, type: 'badge' },
  { id: 'badge_hologram', name: 'Hologram', cost: 40, type: 'badge' },
  { id: 'badge_darklotus', name: 'Hoa Sen Bóng Tối', cost: 5000, type: 'badge' },
  { id: 'badge_auraflame', name: 'Hào Quang Lửa', cost: 60, type: 'badge' },
  { id: 'badge_neonphoenix', name: 'Phượng Hoàng Neon', cost: 75, type: 'badge' },
];
