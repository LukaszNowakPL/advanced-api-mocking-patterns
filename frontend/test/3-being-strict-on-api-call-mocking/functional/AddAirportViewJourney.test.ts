import {expect, test} from '@playwright/test';
import {goTo} from '../../playwright/navigation';
import {Mockiavelli} from 'mockiavelli';
import {AirportModel} from '../../../src/api/rest/airports.dto';
import {airportsMock, mockPostAirportsRequest} from '../../playwright/api-mocks/airports';
import {CountriesDto} from '../../../src/api/rest/countries.dto';
import {RegionDto, RegionsDto} from '../../../src/api/rest/regions.dto';
import {countriesMock} from '../../playwright/api-mocks/countries';
import {regionsMock} from '../../playwright/api-mocks/regions';
import {AddAirportPage} from '../../functional/pages/AddAirportPage';

test.describe('Being strict on api call mocking', () => {
    let mockiavelli: Mockiavelli;
    let addAirportPage: AddAirportPage;

    test.beforeEach(async ({page}) => {
        mockiavelli = await Mockiavelli.setup(page);
        addAirportPage = new AddAirportPage(page);
    });

    test('Airport addition journey', async ({page}) => {
        /**
         * This test mocks only endpoints being triggered during the scenario.
         * It is strict to path arguments as well as to body used on mutation calls (POST/PUT endpoint calls).
         * Such strict approach allows to control communication between tested page and backend services.
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

        /**
         * Mocking GET endpoints expected to be called and catching POST endpoint call, which will be asserted later.
         */
        // And mocks of api calls triggered during the test
        await countriesMock(page, countries);
        await regionsMock(page, regions);
        await airportsMock(page, []);
        const postAirportMock = mockPostAirportsRequest(mockiavelli);

        // When I go to Add airport page
        await goTo(page, '/airports/add');

        // Then I see dedicated page
        await addAirportPage.assertReady();

        // When I fulfill and send the form
        await addAirportPage.fulfillForm(airport, countries[0].name, regionToSelect.name);

        /**
         * Asserting whether functionality send nothing but expected data object, down to single data piece.
         */
        // Then POST api call is resolved with expected body
        const postAirportRequest = await postAirportMock.waitForRequest();
        expect(postAirportRequest.body).toEqual(airport);

        // And addition confirmation is displayed after api call is resolved
        await addAirportPage.assertAdditionConfirmationDisplay();
    });
});
