// Boss Icons
import MiniBossIcon from '../assets/bosses/mini.png';
import EliteBossIcon from '../assets/bosses/elite.png';
import MegaBossIcon from '../assets/bosses/mega.png';

// Buttons
import BossMapIcon from '../assets/buttons/bossmap.png';
import RewardStoreIcon from '../assets/buttons/rewardstore.png';
import RoleShopIcon from '../assets/buttons/roleshop.png';
import QuestJournalIcon from '../assets/buttons/questjournal.png';
import HistoryIcon from '../assets/buttons/history.png';
import ClassQuestIcon from '../assets/buttons/classquests.png';
import LeaderboardIcon from '../assets/buttons/achievement.png';

// Rewards
import CyberfoxIcon from '../assets/rewards/cyberfox.png';
import MechskullIcon from '../assets/rewards/mechskull.png';
import NeonphoenixIcon from '../assets/rewards/neonphoenix.png';
import AuraflameIcon from '../assets/rewards/auraflame.png';
import DarklotusIcon from '../assets/rewards/darklotus.png';
import HologramIcon from '../assets/rewards/hologram.png';
import GlowslimeIcon from '../assets/rewards/glowslime.png';
import PixelbotIcon from '../assets/rewards/pixelbot.png';
import NeoncatIcon from '../assets/rewards/neoncat.png';
import GlitchBadgeIcon from '../assets/rewards/glitchbadge.png'

// Characters / Avatars (future-proof example)
import GhostrunnerIcon from '../assets/characters/ghostrunner.png';
import NetcrasherIcon from '../assets/characters/netcrasher.png';
import SynthmancerIcon from '../assets/characters/synthmancer.png';
import EdgeWalkerIcon from '../assets/characters/edgewalker.png'

//Maps
import ZoneMap1 from '../assets/maps/cyber_map_bg.png'
import ZoneMap2 from '../assets/maps/cyber_map_bg_2.png'
import ZoneMap3 from '../assets/maps/cyber_map_bg_final.png'

///Pets
import DogPet from '../assets/pets/dog.png'
import MousePet from '../assets/pets/mouse.png'
import SquidPet from '../assets/pets/squid.png'
import RabbitPet from '../assets/pets/rabbit.png'
import CatPet from '../assets/pets/cat.png'
import BirdPet from '../assets/pets/bird.png'
import FireFlyPet from '../assets/pets/firefly.png'
import FoxPet from '../assets/pets/fox.png'
import ShrimpPet from '../assets/pets/shrimp.png'
import SnailPet from '../assets/pets/snail.png'
import BaoPet from '../assets/pets/bao.png'
import LionPet from '../assets/pets/lion.png'
import DragonPet from '../assets/pets/dragon.png'
import TigerPet from '../assets/pets/tiger.png'

const AssetManager = {
  BossIcons: {
    mini: MiniBossIcon,
    elite: EliteBossIcon,
    mega: MegaBossIcon,
  },
  Buttons: {
    BossMap: BossMapIcon,
    RewardStore: RewardStoreIcon,
    RoleShop: RoleShopIcon,
    QuestJournal: QuestJournalIcon,
    History: HistoryIcon,
    ClassQuest: ClassQuestIcon,
    Leaderboard: LeaderboardIcon,
  },
  Rewards: {
    Cyberfox: CyberfoxIcon,
    Mechskull: MechskullIcon,
    Neonphoenix: NeonphoenixIcon,
    Auraflame: AuraflameIcon,
    Darklotus: DarklotusIcon,
    Hologram: HologramIcon,
    Glowslime: GlowslimeIcon,
    Pixelbot: PixelbotIcon,
    Neoncat: NeoncatIcon,
    GlitchBadge: GlitchBadgeIcon,
  } as Record<string, any>,
  
  Maps: {
    Zone1: ZoneMap1,
    Zone2: ZoneMap2,
    Zone3: ZoneMap3
  },
  Pets: {
  dog: DogPet,
  byte: MousePet,
  mucdien: SquidPet,
  bapmach: RabbitPet,
  meonhieu: CatPet,
  chiplua: BirdPet,
  domxanh: FireFlyPet,
  caonhapnhay: FoxPet,
  teptia: ShrimpPet,
  bomach: SnailPet,
  banhbao: BaoPet,
  lansohoa: LionPet,
  rongcapquang: DragonPet,
  hobangmach: TigerPet,
} as Record<string, any>, // <-- ADD THIS

Characters: {
  ghostrunner: GhostrunnerIcon,
  netcrasher: NetcrasherIcon,
  synthmancer: SynthmancerIcon,
},
   
  // Characters: {
  //   Ghostrunner: GhostrunnerIcon,
  //   Netcrasher: NetcrasherIcon,
  //   Synthmancer: SynthmancerIcon,
  // },
};

export default AssetManager;


export const PetImageMap: Record<string, any> = {
  pet_dog: DogPet,
  pet_byte: MousePet,
  pet_mucdien: SquidPet,
  pet_bapmach: RabbitPet,
  pet_meonhieu: CatPet,
  pet_chiplua: BirdPet,
  pet_domxanh: FireFlyPet,
  pet_caonhapnhay: FoxPet,
  pet_teptia: ShrimpPet,
  pet_bomach: SnailPet,
  pet_banhbao: BaoPet,
  pet_lansohoa: LionPet,
  pet_rongcapquang: DragonPet,
  pet_hobangmach: TigerPet,
};

export const BadgeImageMap: Record<string, any> = {
  badge_cyberfox: CyberfoxIcon,
  badge_mechskull: MechskullIcon,
  badge_neonphoenix: NeonphoenixIcon,
  badge_auraflame: AuraflameIcon,
  badge_darklotus: DarklotusIcon,
  badge_hologram: HologramIcon,
  badge_glowslime: GlowslimeIcon,
  badge_pixelbot: PixelbotIcon,
  badge_neoncat: NeoncatIcon,
  badge_glitch: GlitchBadgeIcon,
};

export const ClassAvatarMap: Record<string, any> = {
  ghostrunner: GhostrunnerIcon,
  netcrasher: NetcrasherIcon,
  synthmancer: SynthmancerIcon,
};