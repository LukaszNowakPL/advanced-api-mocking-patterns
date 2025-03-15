import {expect, test} from '@playwright/test';
import {goTo} from '../../playwright/navigation';
import {Mockiavelli} from 'mockiavelli';
import {AirportDto} from '../../../src/api/rest/airports.dto';
import {airportMock} from '../../playwright/api-mocks/airports';

test.describe('Overmocking api calls examples', () => {
    test.beforeEach(async ({page}) => {
        await Mockiavelli.setup(page);
    });

    test.afterEach(async ({page}) => {
        /**
         * For test case simplicity, we only assert the loader being displayed. This happens because of pending GET /airports/{id} api call
         * Once test case is finished in the middle of process, there are errors populated into the console.
         * This workaround is for muting such errors, however, you shouldn't use it on production application tests.
         */
        await page.unrouteAll({behavior: 'ignoreErrors'});
    });

    test.describe('Bad approach - mocking wildcards or api calls not triggered during the test', () => {
        test.beforeEach(async ({page}) => {
            const airportData = {
                id: 1,
                name: 'test airport name',
                iata: 'TES',
                regions: [],
                country_id: 1,
            };

            /**
             * Wildcard bad approach - mocking api calls for details of any airport.
             * Narrowing it down to airport identified by id will end up with better control over what api calls was triggered.
             */
            await page.route('*/**/api/airports/*', async (route) => {
                await page.waitForTimeout(1000);
                await route.fulfill({json: airportData});
            });

            /**
             * Just-in-case bad approach - this api call is not triggered by tests. If the endpoint started to get triggered,
             * there should be a warning displayed, as it indicates a functionality change.
             */
            await page.route('*/**/api/airports', async (route) => {
                await route.fulfill({json: [airportData]});
            });
        });

        test('Displays loader initially', async ({page}) => {
            /**
             * The test itself finishes successfully, however, it's based on overmocking approach.
             */

            // When I go to details page of an airport
            await goTo(page, '/airports/1');

            // Then I see loader displayed during api call
            await expect(page.getByTestId('progress-bar')).toBeVisible();
        });
    });

    test.describe('Good approach mocking only api calls triggered during the test', () => {
        test('renders progress bar initially', async ({page}) => {
            /**
             * This test case is aware of which api calls are being triggered during its execution.
             * If the functionality change and tested page will trigger any new api call, the test end up with console warning.
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

            // And GET /airport/{airportId} mock
            await airportMock(page, airportId, airportData);

            // When I go to details page of given airport
            await goTo(page, url);

            // Then I see loader displayed during api call
            await expect(page.getByTestId('progress-bar')).toBeVisible();
        });
    });
});
