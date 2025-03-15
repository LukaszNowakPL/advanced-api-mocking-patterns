import {Page} from '@playwright/test';
import {CountriesDto} from '../../../src/api/rest/countries.dto';

export const countriesMock = async (page: Page, responseData: CountriesDto, status = 200) =>
    await page.route('*/**/api/countries', async (route) => {
        await route.fulfill({json: responseData, status});
    });
