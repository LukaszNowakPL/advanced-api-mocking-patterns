import {screen} from '@testing-library/react';
import {describe, vi} from 'vitest';
import {renderWithContexts} from '../../integration/utils/render';
import {server} from '../../integration/mocks/server';
import {addAirportHandler, airportsHandler} from '../../integration/api-handlers/airports';
import {AirportModel} from '../../../src/api/rest/airports.dto';
import {CountriesDto} from '../../../src/api/rest/countries.dto';
import {RegionDto, RegionsDto} from '../../../src/api/rest/regions.dto';
import {countriesHandler} from '../../integration/api-handlers/countries';
import {regionsHandler} from '../../integration/api-handlers/regions';
import {AddAirportViewGuard} from '../../../src/views/AddAirportView/AddAirportView.guard';
import {userEvent} from '@testing-library/user-event';

describe('Being strict on api call mocking', () => {
    it('sends collected data to backend service and displays the confirmation', async () => {
        /**
         * Required by radix-ui components used on tested view.
         */
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
        window.HTMLElement.prototype.hasPointerCapture = vi.fn();

        /**
         * This test mocks only endpoints being triggered during the scenario.
         * It is strict to path arguments as well as to body used on mutation calls (POST/PUT endpoint calls).
         * Such strict approach allows to control communication between tested component and backend services.
         * If altered functionality perform not expected api call, such fact is going to be reported in the console.
         */
        // Given countries list available on the system
        const countries: CountriesDto = [
            {
                id: 1,
                name: 'test country name',
                is_in_schengen: true,
            },
        ];

        // And region to be selected during the test
        const regionToSelect: RegionDto = {
            id: 1,
            name: 'test region to select',
        };

        // And regions available on the system
        const regions: RegionsDto = [
            regionToSelect,
            {
                id: 2,
                name: 'test region not to select',
            },
        ];

        // And new airport data
        const airport: AirportModel = {
            name: 'test airport name',
            iata: 'TES',
            country_id: countries[0].id,
            regions: [regionToSelect.id],
            vaccination_notes: 'test vaccination notes',
        };

        // And mocks of api calls triggered during the test
        server.use(
            /**
             * Handlers for GET endpoint called during the test
             */
            countriesHandler(countries),
            regionsHandler(regions),
            airportsHandler([]),
            /**
             * Handler for POST endpoint call. Please note the construction of handler. Unlike the functional test scenario,
             * there is no further checks whether endpoint was triggered with expected body here. Such assertion is built
             * on handler itself. It resolves api call only if request body is same to airport argument.
             * Otherwise, the handler does not respond and prints console message of not expected body shape.
             * Lack of api call response will not print final addition confirmation, making scenario fail.
             */
            addAirportHandler(airport),
        );

        // When component render
        renderWithContexts(<AddAirportViewGuard />, {path: '/airports/add', url: '/airports/add'});

        // Then page header is visible
        expect(await screen.findByRole('heading', {name: /add airport/i, level: 1})).toBeInTheDocument();

        // When user fulfill entire form
        await userEvent.type(screen.getByRole('textbox', {name: /name/i}), airport.name);
        await userEvent.type(screen.getByRole('textbox', {name: /iata code/i}), airport.iata);
        await userEvent.click(screen.getByRole('combobox', {name: /country/i}));
        await userEvent.click(screen.getByRole('option', {name: countries[0].name}));
        await userEvent.click(screen.getByRole('checkbox', {name: regionToSelect.name}));
        await userEvent.type(screen.getByRole('textbox', {name: /vaccination notes/i}), airport.vaccination_notes as string);

        // And send the data to the backend
        await userEvent.click(screen.getByRole('button', {name: /submit/i}));

        // Then all form elements are disabled during api call
        const disabledElements = [
            ...screen.getAllByRole('textbox'),
            ...screen.getAllByRole('combobox'),
            ...screen.getAllByRole('checkbox'),
            ...screen.getAllByRole('button'),
        ];
        for (let i in disabledElements) {
            expect(disabledElements[i]).toBeDisabled();
        }

        // And addition confirmation is displayed after api call is resolved
        expect(await screen.findByText('Airport added successfully')).toBeInTheDocument();
    });
});
