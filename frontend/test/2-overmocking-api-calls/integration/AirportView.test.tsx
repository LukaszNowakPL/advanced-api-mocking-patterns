import {screen} from '@testing-library/react';
import {describe} from 'vitest';
import {renderWithContexts} from '../../integration/utils/render';
import {AirportViewGuard} from '../../../src/views/AirportView/AirportView.guard';
import {server} from '../../integration/mocks/server';
import {airportHandler} from '../../integration/api-handlers/airports';
import {AirportDto} from '../../../src/api/rest/airports.dto';
import {http, HttpResponse} from 'msw';

describe('Overmocking api calls examples', () => {
    describe('Bad approach - mocking wildcards or api calls not triggered during the test', () => {
        beforeAll(() => {
            /**
             * Setting up bad pattern scene. This overmocking usually happens on test scenarios,
             * or during setupServer() function call for starting a MSW server.
             */
            const airportData = {
                id: 1,
                name: 'test airport name',
                iata: 'TES',
                regions: [],
                country_id: 1,
            };

            server.use(
                /**
                 * Wildcard bad approach - mocking api calls for details of any airport.
                 * Narrowing it down to airport identified by id will end up with better control over what api calls was triggered.
                 */
                http.get(`*/api/airports/*`, () => HttpResponse.json(airportData)),
                /**
                 * Just-in-case bad approach - this api call is not triggered by tests. If the endpoint started to get triggered,
                 * there should be a warning displayed, as it indicates a functionality change.
                 */
                http.get(`*/api/airports`, () => HttpResponse.json([airportData])),
            );
        });

        it('renders progress bar initially', () => {
            /**
             * The test itself finishes successfully, however, it's based on overmocking approach.
             * It's getting problematic once the test suite or tested component is getting more complicated.
             */

            // Given data-test-id to identify progress bar on the Dom
            const dataTestId = 'progress-bar';

            // When component render
            renderWithContexts(<AirportViewGuard />);

            // Then progress bar is displayed
            expect(screen.getByTestId(dataTestId)).toBeInTheDocument();
        });
    });

    describe('Good approach mocking only api calls triggered during the test', () => {
        test('renders progress bar initially', () => {
            /**
             * This test case is aware of which api calls are being triggered during its execution.
             * It requires to have a little bit of a boilerplate at the beginning of each test, however,
             * f the functionality change and tested component will trigger any new api call, the test end up with console warning.
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

            // And GET /airport/{airportId} handler
            server.use(airportHandler(airportId, airportData));

            // And data-test-id to identify progress bar on the Dom
            const dataTestId = 'progress-bar';

            // When component render
            renderWithContexts(<AirportViewGuard />, {path: '/airports/:id', url});

            // Then progress bar is displayed
            expect(screen.getByTestId(dataTestId)).toBeInTheDocument();
        });
    });
});
