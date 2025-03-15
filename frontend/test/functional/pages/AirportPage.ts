import {FunctionalPage} from './FunctionalPage';
import {Page, expect} from '@playwright/test';
import {CountryDto} from '../../../src/api/rest/countries.dto';

export class AirportPage extends FunctionalPage {
    public constructor(page: Page, airportName: string | RegExp, airportId: number) {
        super(page, airportName, `airports/${airportId}`);
    }

    public assertCountryNameDisplay = async (countryName: string) => {
        await expect(this.page.getByText(countryName)).toBeVisible();
    };

    public assertSchengenPart = async (isInSchengen: boolean) => {
        const inSchengenConfirmation = isInSchengen ? /in schengen/i : /outside schengen/i;

        await expect(this.page.getByText('Schengen info', {exact: true})).toBeVisible();
        await expect(this.page.getByText(inSchengenConfirmation)).toBeVisible();
    };

    public assertNonSchengenPart = async (country: CountryDto) => {
        const {is_in_schengen: isInSchengen} = country;
        if (isInSchengen) {
            await expect(this.page.getByText(/non-schengen info/i)).not.toBeVisible();
        } else {
            await expect(this.page.getByText(/non-schengen info/i)).toBeVisible();

            const {is_passport_required: isPassportRequired, is_visa_required: isVisaRequired} = country;

            if (isPassportRequired) {
                await expect(this.page.getByText('Passport required')).toBeVisible();
            } else {
                await expect(this.page.getByText(/no passport required/i)).toBeVisible();
            }

            if (isVisaRequired) {
                await expect(this.page.getByText('Visa required')).toBeVisible();
            } else {
                await expect(this.page.getByText(/no visa required/i)).toBeVisible();
            }
        }
    };

    public assertPassportRequirement = async (isPassportRequired: boolean) => {
        if (isPassportRequired) {
            await expect(this.page.getByText('Passport required')).toBeVisible();
        } else {
            await expect(this.page.getByText(/no passport required/i)).toBeVisible();
        }
    };
}
