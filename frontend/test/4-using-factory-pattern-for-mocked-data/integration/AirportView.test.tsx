import {screen} from '@testing-library/react';
import {describe} from 'vitest';
import {renderWithContexts} from '../../integration/utils/render';
import {server} from '../../integration/mocks/server';
import {airportHandler} from '../../integration/api-handlers/airports';
import {countriesHandler} from '../../integration/api-handlers/countries';
import {regionsHandler} from '../../integration/api-handlers/regions';
import {countryFactory} from '../factories/countries';
import {airportFactory} from '../factories/airports';
import {AirportViewGuard} from '../../../src/views/AirportView/AirportView.guard';

describe('Using factory pattern for mocked data', () => {
    it('renders data based on default in-schengen airport factory', async () => {
        /**
         * This test uses factory approach with base mocks of an airport of inside-schengen country and no region connections set.
         * The factory can be manually overridden, like on an airport data example. This approach is recommended to make test case
         * independent of base mock structure. This is crucial for each mock portion that is going to be asserted later in test.
         * If some mock portions are not being asserted, the default value may be used.
         */

        // Given name of country
        const countryName = 'test country name';

        // And in-schengen country
        const country = countryFactory.build({name: countryName});

        // And airport id
        const airportId = 1;

        /**
         * Overriding almost all airport data, as all those portions are going to be asserted later in the test.
         */
        // And tested airport details
        const airport = airportFactory.build({
            id: airportId,
            name: 'test airport name',
            country_id: country.id,
            regions: [],
        });

        // And mocks of api calls triggered during the test
        server.use(countriesHandler([country]), regionsHandler([]), airportHandler(airportId, airport));

        // When component render
        renderWithContexts(<AirportViewGuard />, {path: '/airports/:id', url: `/airports/${airportId}`});

        // Then page header is visible
        expect(await screen.findByRole('heading', {name: airport.name, level: 1})).toBeInTheDocument();

        // And remained part of airport data is displayed
        expect(await screen.findByText(countryName)).toBeInTheDocument();
        expect(screen.getByText(/in schengen/i)).toBeInTheDocument();

        // And non-schengen related parts are not displayed
        expect(screen.queryByText(/non-schengen info/i)).not.toBeInTheDocument();
    });
    it('renders data based on non-schengen airport mock', async () => {
        /**
         * This test case asserts only non-schengen part of details page. In such case most airport data may remain unchanged,
         * as it's not going to be tested. It is crucial, however, to manually override connected country data,
         * to make it non-schengen one.
         */

        // Given non-schengen country
        const country = countryFactory.build({
            is_in_schengen: false,
            is_passport_required: true,
            is_visa_required: false,
        });

        // And airport id
        const airportId = 1;

        // And tested airport details
        const airport = airportFactory.build({
            id: airportId,
            country_id: country.id,
        });

        // And mocks of api calls triggered during the test
        server.use(countriesHandler([country]), regionsHandler([]), airportHandler(airportId, airport));

        // When component render
        renderWithContexts(<AirportViewGuard />, {path: '/airports/:id', url: `/airports/${airportId}`});

        // Then page header is visible
        expect(await screen.findByRole('heading', {name: airport.name, level: 1})).toBeInTheDocument();

        // And schengen related info contains 'outside schengen'
        expect(await screen.findByText(/outside schengen/i)).toBeInTheDocument();

        // And non-schengen related parts are displayed
        expect(screen.getByText(/passport required/i)).toBeInTheDocument();
        expect(screen.getByText(/no visa required/i)).toBeInTheDocument();
    });
});
