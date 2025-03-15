import {test} from '@playwright/test';
import {goTo} from '../../playwright/navigation';
import {Mockiavelli} from 'mockiavelli';
import {airportMock} from '../../playwright/api-mocks/airports';
import {countryFactory} from '../factories/countries';
import {airportFactory} from '../factories/airports';
import {countriesMock} from '../../playwright/api-mocks/countries';
import {regionsMock} from '../../playwright/api-mocks/regions';
import {AirportPage} from '../../functional/pages/AirportPage';

test.describe('Using randomization for mocked data', () => {
    test.beforeEach(async ({page}) => {
        await Mockiavelli.setup(page);
    });

    test('In-schengen airport details journey', async ({page}) => {
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
         * This test case asserts only non-schengen part of details page. In such case most airport data may remain randomized,
         * as it's not going to be tested. It is crucial, however, to manually override connected country data,
         * to make it non-schengen one.
         */

        // Given country not being in schengen
        const isInSchengen = false;

        // And no passport requirement
        const isPassportRequired = false;

        // And non-schengen country
        const country = countryFactory.build({
            is_in_schengen: isInSchengen,
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
        await countriesMock(page, [country]);
        await regionsMock(page, []);
        await airportMock(page, airportId, airport);

        // And airportPage setup
        const airportPage = new AirportPage(page, airport.name, airportId);

        // When I go to details page of given airport
        await goTo(page, `/airports/${airportId}`);

        // Then page header is visible
        await airportPage.assertReady();

        // And schengen related info is displayed
        await airportPage.assertSchengenPart(isInSchengen);

        // And no passport requirement is displayed
        await airportPage.assertPassportRequirement(isPassportRequired);
    });
});
