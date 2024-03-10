import Vampire from '../Vampire';

test('creating Zombie', () => {
  const result = new Vampire(1);
  
  expect(result).toEqual({health: 100, level: 1, attack: 25, defence: 25, type: 'vampire'});
});