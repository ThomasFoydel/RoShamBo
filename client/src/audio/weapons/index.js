import rock from './rock.mp3';
import paper from './paper.mp3';
import scissors from './scissors.mp3';
import tree from './tree.mp3';
import bird from './bird.mp3';

const weapons = {
  rock: new Audio(rock),
  paper: new Audio(paper),
  scissors: new Audio(scissors),
  tree: new Audio(tree),
  bird: new Audio(bird),
};

export default weapons;
