import { expect } from 'chai';
import { dateFns } from '../';

describe('date fns', () => {
  it('should parse a random given date', () => {
    const badString1 = '11:31AM Oct 23-2019';
    const formatter1 = 'hh:mmaa MMM dd-yyyy';

    const parseDate = dateFns.parse(badString1, formatter1, new Date());

    expect(parseDate.toISOString()).equal('2019-10-23T11:31:00.000Z');
  });

  it('should format a date with a given format', () => {
    const badString1 = '11:31AM Oct 23-2019';
    const formatter1 = 'hh:mmaa MMM dd-yyyy';

    const parseDate = dateFns.parse(badString1, formatter1, new Date());

    const formattedDate1 = dateFns.format(parseDate, 'dd-MM-yyyy');
    const formattedDate2 = dateFns.format(parseDate, 'MM-dd-yyyy');
    expect(formattedDate1).equal('23-10-2019');
    expect(formattedDate2).equal('10-23-2019');
  });
});
