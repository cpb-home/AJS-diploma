import Undead from '../Undead';

test('creating Undead', () => {
  const result = new Undead(1);
  
  expect(result).toEqual({health: 100, level: 1, attack: 40, defence: 10, type: 'undead'});
});