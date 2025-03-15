import {Page} from '@playwright/test';
import {assertHeaderContent, assertIsOn} from '../../playwright/assertions';

export class FunctionalPage {
    page: Page;
    pageHeader: string | RegExp;
    pageUrl: string;

    public constructor(page: Page, pageHeader: string | RegExp, pageUrl: string) {
        this.page = page;
        this.pageHeader = pageHeader;
        this.pageUrl = pageUrl;
    }

    public async assertReady() {
        await assertIsOn(this.page, this.pageUrl);
        await assertHeaderContent(this.page, this.pageHeader);
    }
}
