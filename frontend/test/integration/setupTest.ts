import '@testing-library/jest-dom';
import {configure} from '@testing-library/react';
import {server} from './mocks/server';

configure({testIdAttribute: 'data-test-id'});

/**
 * Api mocking by MSW before all tests.
 * onUnhandledRequest configuration prints console error if there is any unexpected api call triggered.
 */
beforeAll(() =>
    server.listen({
        onUnhandledRequest({method, url}) {
            console.error('Found un unhandled %s request to %s', method, url);
        },
    }),
);
