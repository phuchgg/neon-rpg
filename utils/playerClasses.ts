export const CLASS_SWITCH_COST = 50;

export const playerClasses = [
  {
    id: 'ghostrunner',
    name: 'Kẻ Bóng Ma',
    bonus: '+20% XP cho nhiệm vụ nhanh (≤10 ký tự)',
    lore: 'Di chuyển lặng lẽ. Di chuyển nhanh. Không để sót nhiệm vụ.',
  },
  {
    id: 'netcrasher',
    name: 'Kẻ Đâm Mạng',
    bonus: '+5 XP cho nhiệm vụ liên quan đến code/debug/học tập',
    lore: 'Không có nhiệm vụ nào quá rối rắm với dòng chân lý.',
  },
  {
    id: 'synthmancer',
    name: 'Pháp Sư Âm Thanh',
    bonus: '+2 XP mỗi nhiệm vụ (cộng thêm cố định)',
    lore: 'Cân bằng tạo nên sự tinh thông. Kiên định là thánh thần.',
  },
  {
    id: 'edgewalker',
    name: 'Kẻ Bước Bờ',
    bonus: '+XP cho nhiệm vụ boss/dự án/dài hạn',
    lore: 'Họ không theo đuổi XP. Họ săn đuổi di sản.',
    locked: true,
  },
];
