import battle from './battle.mp3';
import battle2 from './battle2.mp3';

const themes = {
  battle: new Audio(battle),
  battle2: new Audio(battle2),
};
themes.battle.loop = true;
themes.battle2.loop = true;
export default themes;
