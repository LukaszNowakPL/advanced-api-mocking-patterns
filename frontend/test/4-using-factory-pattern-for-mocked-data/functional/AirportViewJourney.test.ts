import {test} from '@playwright/test';
import {goTo} from '../../playwright/navigation';
import {Mockiavelli} from 'mockiavelli';
import {airportMock} from '../../playwright/api-mocks/airports';
import {countryFactory} from '../factories/countries';
import {airportFactory} from '../factories/airports';
import {countriesMock} from '../../playwright/api-mocks/countries';
import {regionsMock} from '../../playwright/api-mocks/regions';
import {AirportPage} from '../../functional/pages/AirportPage';

test.describe('Using factory pattern for mocked data', () => {
    test.beforeEach(async ({page}) => {
        await Mockiavelli.setup(page);
    });

    test('In-schengen airport details journey', async ({page}) => {
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
        await countriesMock(page, [country]);
        await regionsMock(page, []);
        await airportMock(page, airportId, airport);

        // And airportPage setup
        const airportPage = new AirportPage(page, airport.name, airportId);

        // When I go to details page of given airport
        await goTo(page, `/airports/${airportId}`);

        // Then page header is visible
        await airportPage.assertReady();

        // And remained part of airport data is displayed
        await airportPage.assertCountryNameDisplay(countryName);
        await airportPage.assertSchengenPart(country.is_in_schengen);

        // And non-schengen related parts are not displayed
        await airportPage.assertNonSchengenPart(country);
    });

    test('Non-schengen airport details journey', async ({page}) => {
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
        await countriesMock(page, [country]);
        await regionsMock(page, []);
        await airportMock(page, airportId, airport);

        // And airportPage setup
        const airportPage = new AirportPage(page, airport.name, airportId);

        // When I go to details page of given airport
        await goTo(page, `/airports/${airportId}`);

        // Then page header is visible
        await airportPage.assertReady();

        // And schengen related info contains 'outside schengen'
        await airportPage.assertSchengenPart(country.is_in_schengen);

        // And non-schengen related parts are displayed
        await airportPage.assertNonSchengenPart(country);
    });
});
