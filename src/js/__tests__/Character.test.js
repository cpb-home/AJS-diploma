import Vampire from '../characters/Vampire';
import Undead from '../characters/Undead';
import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Bowman from '../characters/Bowman';
import Character from '../Character';

test.each([
  ['Bowman', {health: 100, level: 1, attack: 25, defence: 25, type: 'bowman'}],
  ['Undead', {health: 100, level: 1, attack: 40, defence: 10, type: 'undead'}],
  ['Swordsman', {health: 100, level: 1, attack: 40, defence: 10, type: 'swordsman'}],
  ['Vampire', {health: 100, level: 1, attack: 25, defence: 25, type: 'vampire'}],
  ['Magician', {health: 100, level: 1, attack: 10, defence: 40, type: 'magician'}],
  ['Daemon', {health: 100, level: 1, attack: 10, defence: 10, type: 'daemon'}]
])(
  ('Tests for %s type'),
  (type, res) => {
    let result;
    if (type == 'Bowman') {
      result = new Bowman(1);
    } else if (type == 'Undead') {
      result = new Undead(1);
    } else if (type == 'Swordsman') {
      result = new Swordsman(1);
    } else if (type == 'Vampire') {
      result = new Vampire(1);
    } else if (type == 'Magician') {
      result = new Magician(1);
    } else if (type == 'Daemon') {
      result = new Daemon(1);
    }
    
    expect(result).toEqual(res);
  }
)

test('creating too short name', () => {
  expect(() => new Character(1)).toThrow('Нельзя использовать new Character()');
});