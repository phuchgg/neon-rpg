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
// import GhostrunnerIcon from '../assets/characters/ghostrunner.png';
// import NetcrasherIcon from '../assets/characters/netcrasher.png';
// import SynthmancerIcon from '../assets/characters/synthmancer.png';

//Maps
import ZoneMap1 from '../assets/maps/cyber_map_bg.png'
import ZoneMap2 from '../assets/maps/cyber_map_bg_2.png'
import ZoneMap3 from '../assets/maps/cyber_map_bg_final.png'

///Pets
import DogPet from '../assets/pets/dog.jpg'

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
  Pets:{
    dog: DogPet
  } as Record<string, any>, // <-- ADD THIS
   
  // Characters: {
  //   Ghostrunner: GhostrunnerIcon,
  //   Netcrasher: NetcrasherIcon,
  //   Synthmancer: SynthmancerIcon,
  // },
};

export default AssetManager;
