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

describe('Using randomization for mocked data', () => {
    it('renders data of default in-schengen airport', async () => {
        /**
         * This test uses factory approach with all parts being randomized by faker-js library.
         * Such approach is based on an assumption that all data not related with further assertions should get randomized,
         * to better reflect users using the application unpredictably.
         * Similarly, all portions of data to be asserted on the test case should be hardcoded and override the base mock structure.
         */

        // Given country name
        const countryName = 'test country name';

        // And in-schengen country
        const country = countryFactory.build({
            name: countryName,
            is_in_schengen: true,
        });

        // And airport id
        const airportId = 1;

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

    it.each<boolean>([true, false])('renders passport requirement (%s) of non-schengen airport', async (isPassportRequired) => {
        /**
         * This test case asserts only passport requirement part of details page. In such case most airport data may remain randomized,
         * as it's not going to be tested. It is crucial, however, to manually override connected country data,
         * to make it non-schengen one.
         */

        // Given non-schengen country
        const country = countryFactory.build({
            is_in_schengen: false,
            is_passport_required: isPassportRequired,
        });

        // And airport id
        const airportId = 1;

        // And tested airport details
        const airport = airportFactory.build({
            id: airportId,
            country_id: country.id,
            regions: [],
        });

        // And mocks of api calls triggered during the test
        server.use(countriesHandler([country]), regionsHandler([]), airportHandler(airportId, airport));

        // When component render
        renderWithContexts(<AirportViewGuard />, {path: '/airports/:id', url: `/airports/${airportId}`});

        // Then page header is visible
        expect(await screen.findByRole('heading', {level: 1})).toBeInTheDocument();

        // And passport requirement info is displayed
        const passportRequirementInfo = isPassportRequired ? 'Passport required' : /no passport required/i;
        expect(await screen.findByText(passportRequirementInfo)).toBeInTheDocument();
    });
});
