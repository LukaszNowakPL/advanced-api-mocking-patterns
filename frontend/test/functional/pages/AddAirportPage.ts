import {FunctionalPage} from './FunctionalPage';
import {Page, expect} from '@playwright/test';
import {AirportModel} from '../../../src/api/rest/airports.dto';

export class AddAirportPage extends FunctionalPage {
    page: Page;
    public constructor(page: Page) {
        super(page, /add airport/i, 'airports/add');
        this.page = page;
    }

    public fulfillForm = async (data: AirportModel, country: string, region: string) => {
        await this.page.getByRole('textbox', {name: /name/i}).fill(data.name);
        await this.page.getByRole('textbox', {name: /iata code/i}).fill(data.iata);
        await this.page.getByRole('combobox', {name: /country/i}).click();
        await this.page.getByRole('option', {name: country}).click();
        await this.page.getByRole('checkbox', {name: region}).click();
        await this.page.getByRole('textbox', {name: /vaccination notes/i}).fill(data.vaccination_notes as string);
        await this.page.getByRole('button', {name: /submit/i}).click();
    };

    public assertAdditionConfirmationDisplay = async () => {
        await expect(this.page.getByText(/airport added successfully/i)).toBeVisible();
    };
}
