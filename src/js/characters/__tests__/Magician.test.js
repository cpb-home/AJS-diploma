import Magician from '../Magician';

test('creating Magician', () => {
  const result = new Magician(1);
  
  expect(result).toEqual({health: 100, level: 1, attack: 10, defence: 40, type: 'magician'});
});