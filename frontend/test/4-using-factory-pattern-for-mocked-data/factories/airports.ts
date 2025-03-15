import * as Factory from 'factory.ts';
import {AirportDto} from '../../../src/api/rest/airports.dto';

export const airportFactory = Factory.Sync.makeFactory<AirportDto>({
    id: 1,
    name: 'test airport name',
    iata: 'TES',
    country_id: 1,
    regions: [],
});
