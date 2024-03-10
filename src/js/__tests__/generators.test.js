import { characterGenerator, generateTeam } from '../generators';
import Vampire from '../characters/Vampire';
import Undead from '../characters/Undead';
import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Bowman from '../characters/Bowman';


//const playerTypes = [Bowman, Swordsman, Magician];
//const pcTypes = [Undead, Vampire, Daemon];

//characterGenerator(allowedTypes, 4);

test('generating many chars tests', () => {
  const allowedTypes = [Undead, Vampire, Daemon, Magician, Swordsman, Bowman];
  const arrOfTypes = [
    JSON.stringify(new Undead(1)),
    JSON.stringify(new Vampire(1)),
    JSON.stringify(new Daemon(1)),
    JSON.stringify(new Magician(1)),
    JSON.stringify(new Swordsman(1)),
    JSON.stringify(new Bowman(1))
  ];
  let res = false;
  for (let i = 0; i < 15; i++) {
    const generated = characterGenerator(allowedTypes, 1); 
    res = arrOfTypes.includes(JSON.stringify(generated.next().value));
    if (res == false) {
      break;
    }
  }
  
  expect(res).toBe(true);
});

test.each([
  [1],
  [2],
  [3],
  [4]
])(
  ('Generating %s chars quantity'),
  (quantity) => {
    const allowedTypes = [Undead, Vampire, Daemon, Magician, Swordsman, Bowman];
    const team = generateTeam(allowedTypes, 4, quantity);
    
    expect(team.characters.length).toBe(quantity);
  }
)

test('generating many chars of required level', () => {
  const allowedTypes = [Undead, Vampire, Daemon, Magician, Swordsman, Bowman];  
  const levels = [1, 2, 3, 4];
  let res = false;
  const team = generateTeam(allowedTypes, 4, 15);

  for (let i = 0; i < team.characters.length; i++) {
    
    res = levels.includes(team.characters[i].level);
    if (res == false) {
      break;
    }
  }
  
  expect(res).toBe(true);
});