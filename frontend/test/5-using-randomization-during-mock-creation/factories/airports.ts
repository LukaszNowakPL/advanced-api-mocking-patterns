import * as Factory from 'factory.ts';
import {AirportDto} from '../../../src/api/rest/airports.dto';
import {faker} from '@faker-js/faker';

export const airportFactory = Factory.Sync.makeFactory<AirportDto>({
    id: faker.number.int(),
    name: faker.airline.airport().name,
    iata: faker.airline.airport().iataCode,
    country_id: faker.number.int(),
    regions: faker.helpers.multiple(() => faker.number.int(), {count: faker.number.int(5)}),
});
