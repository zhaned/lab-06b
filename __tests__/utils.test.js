const { getCategoryId } = require('../data/dataUtils.js');

describe('utils for data', () => {
 
  test('getCategoryId', async () => {
    const expectation = 1;
    const cpuData = {
      name: '3700x',
      category: 'Ryzen',
    };

    const categories = [
      {
        name: 'Ryzen',
        id: 1
      },
      {
        name: 'Athlon',
        id: 2
      }
    ];

    const actual = getCategoryId(cpuData, categories);

    expect(actual).toEqual(expectation);
  });

});

