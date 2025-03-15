import {screen, waitForElementToBeRemoved} from '@testing-library/react';
import {describe} from 'vitest';
import {renderWithContexts} from '../../integration/utils/render';
import {AirportViewGuard} from '../../../src/views/AirportView/AirportView.guard';
import {server} from '../../integration/mocks/server';
import {airportHandler} from '../../integration/api-handlers/airports';
import {AirportDto} from '../../../src/api/rest/airports.dto';
import {CountryDto} from '../../../src/api/rest/countries.dto';
import {countriesHandler} from '../../integration/api-handlers/countries';
import {regionsHandler} from '../../integration/api-handlers/regions';

describe('Lack of API calls mocking examples', () => {
    describe('Bad approach - not mocking api calls, lack of errors produced', () => {
        beforeAll(() =>
            server.listen({
                /**
                 * We use MSW server by default on vitest/jest tests. At this case, however, we want to mute
                 * all console errors if api call is not being mocked.
                 * This is how test would be uninformative if there was no MSW attached at all.
                 */
                onUnhandledRequest() {},
            }),
        );

        it('renders progress bar initially', () => {
            /**
             * This test scenario finishes with success, as 'progress-bar' loader is found on the page.
             * However, the loader indicates there is a pending api call happening in the background.
             * The api call is not mocked and this fact is unnoticed due to no information being published.
             *
             * The test, although successful, finishes in the middle of the process. For better test stability,
             * it's considered a good practice to finish testing once tested component is on an idle mode.
             */

            // Given data-test-id to identify progress bar on the Dom
            const dataTestId = 'progress-bar';

            // When component render
            renderWithContexts(<AirportViewGuard />);

            // Then progress bar is displayed
            expect(screen.getByTestId(dataTestId)).toBeInTheDocument();
        });
    });

    describe('Good approach using MSW (or any substitution) for api call mocks', () => {
        test('Lack of api call handler triggers MSW error', () => {
            /**
             * This test scenario finishes with success, however, there is a console information
             * that api call triggered during test is not mocked.
             */

            // Given data-test-id to identify progress bar on the Dom
            const dataTestId = 'progress-bar';

            // When component render
            renderWithContexts(<AirportViewGuard />, {path: '/airports/:id', url: '/airports/1'});

            // Then progress bar is displayed
            expect(screen.getByTestId(dataTestId)).toBeInTheDocument();
        });
        test('No MSW error if all api calls are handled', async () => {
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

            server.use(
                // And GET /airport/{airportId} handler
                airportHandler(airportId, airportData),
                // And handlers of other endpoints called during test
                countriesHandler([countryData]),
                regionsHandler([]),
            );

            // And data-test-id to identify progress bar on the Dom
            const dataTestId = 'progress-bar';

            // When component render
            renderWithContexts(<AirportViewGuard />, {path: '/airports/:id', url});

            // Then progress bar is displayed
            expect(screen.getByTestId(dataTestId)).toBeInTheDocument();

            // When progress bar disappears
            await waitForElementToBeRemoved(screen.queryByTestId(dataTestId));

            // Then page header is displayed
            expect(screen.getByRole('heading', {name: airportData.name, level: 1})).toBeInTheDocument();
        });
    });
});
