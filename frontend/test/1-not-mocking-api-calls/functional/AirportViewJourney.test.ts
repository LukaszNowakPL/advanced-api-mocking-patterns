import {expect, test} from '@playwright/test';
import {goTo} from '../../playwright/navigation';
import {Mockiavelli} from 'mockiavelli';
import {AirportDto} from '../../../src/api/rest/airports.dto';
import {airportMock} from '../../playwright/api-mocks/airports';
import {countriesMock} from '../../playwright/api-mocks/countries';
import {CountryDto} from '../../../src/api/rest/countries.dto';
import {regionsMock} from '../../playwright/api-mocks/regions';

test.describe('Lack of API calls mocking examples', () => {
    test.describe('Bad approach - not mocking api calls, lack of errors produced', () => {
        test('Displays loader initially', async ({page}) => {
            /**
             * This test scenario finishes with success, as 'progress-bar' loader is found on the page.
             * However, the loader indicates there is a pending api call happening in the background.
             * The api call is not mocked and this fact is unnoticed due to no information being published.
             *
             * The test, although successful, finishes in the middle of the process. For better test stability,
             * it's considered a good practice to finish testing once application is on an idle mode.
             */

            // When I go to details page of an airport
            await goTo(page, '/airports/1');

            // Then I see loader displayed during api call
            await expect(page.getByTestId('progress-bar')).toBeVisible();
        });
    });

    test.describe('Good approach using Mockiavelli (or any substitution) for api call mocks', () => {
        test.beforeEach(async ({page}) => {
            /**
             * Mockiavelli library helps to mock api calls. We will use it more accurate on following examples.
             * Right now we use it only for having information in the console once any api call triggered during the test case
             * is left unmocked by Mockiavelli itself or Playwright native pattern.
             */
            await Mockiavelli.setup(page);
        });

        test('Lack of api call handler triggers Mockiavelli error', async ({page}) => {
            /**
             * This test scenario finishes with success, however, there is a console information
             * that api call triggered during test is not mocked.
             */
            // When I go to details page of an airport
            await goTo(page, '/airports/1');

            // Then I see loader displayed during api call
            await expect(page.getByTestId('progress-bar')).toBeVisible();
        });

        test('No Mockiavelli error if all api calls are handled', async ({page}) => {
            /**
             * This test scenario proves that if all api calls triggered by test are mocked
             * there is no console information printed.
             */

            // Given airport id
            const airportId = 1;

            // And url of given airport details page
            const url = `/airports/${airportId}`;

            // And Airport data returned by api call
            const airportData: AirportDto = {
                id: airportId,
                name: 'test airport name',
                iata: 'TES',
                regions: [],
                country_id: 1,
            };

            // And Country data returned by api call
            const countryData: CountryDto = {
                id: airportData.country_id,
                name: 'test country name',
                is_in_schengen: true,
            };

            // And GET /airport/{airportId} mock
            await airportMock(page, airportId, airportData);

            // And mocks of other endpoints called during test
            await countriesMock(page, [countryData]);
            await regionsMock(page, []);

            // When I go to details page of given airport
            await goTo(page, url);

            // Then I see loader displayed during api call
            await expect(page.getByTestId('progress-bar')).toBeVisible();

            // And I see page header after api call is resolved
            await expect(page.getByText(airportData.name)).toBeVisible();
        });
    });
});
