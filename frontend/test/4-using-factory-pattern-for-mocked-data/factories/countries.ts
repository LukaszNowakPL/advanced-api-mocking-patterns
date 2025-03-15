import {CountryDto} from '../../../src/api/rest/countries.dto';
import * as Factory from 'factory.ts';

export const countryFactory = Factory.Sync.makeFactory<CountryDto>({
    id: 1,
    name: 'test country name',
    is_in_schengen: true,
});
