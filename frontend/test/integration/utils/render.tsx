import {QueryClient} from '@tanstack/react-query';
import {render} from '@testing-library/react';
import {ReactQueryContext} from '../../../src/context/ReactQueryContext';
import {createMemoryHistory} from 'history';
import {History} from '@remix-run/router';
import {unstable_HistoryRouter as HistoryRouter, Route, Routes} from 'react-router';
import {Theme} from '@radix-ui/themes';

interface RenderWithContextsOptions {
    path?: string;
    url?: string;
}

/**
 * This function wraps tested component with React router, Tanstack query and Radix ui context providers.
 * Such trick includes mentioned libraries inside the integration, requiring less mocks to be performed.
 */
export const renderWithContexts = (component: React.ReactElement, options: RenderWithContextsOptions = {}) => {
    const {path = options.url || '/', url = ''} = options;

    const history = createMemoryHistory({initialEntries: [url]});

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retryDelay: 0,
            },
        },
    });

    return render(
        <HistoryRouter history={history as unknown as History}>
            <Theme>
                <ReactQueryContext queryClient={queryClient}>
                    <Routes>
                        <Route path={'*'} element={<div />} />
                        <Route path={path} element={component} />
                    </Routes>
                </ReactQueryContext>
            </Theme>
        </HistoryRouter>,
    );
};
