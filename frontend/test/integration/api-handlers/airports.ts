import {DefaultBodyType, delay, http, HttpResponse, StrictRequest} from 'msw';
import {AirportDto, AirportModel, AirportsDto} from '../../../src/api/rest/airports.dto';

export const airportsHandler = (responseData: AirportsDto, status = 200) =>
    http.get('*/api/airports', () => HttpResponse.json(responseData, {status}));

export const airportHandler = (id: number, responseData: AirportDto, status = 200) =>
    http.get(`*/api/airports/${id}`, () => HttpResponse.json(responseData, {status}));

export const addAirportHandler = (formData: AirportModel, status = 200) => {
    return http.post('*/api/airports', async ({request}) => {
        if (status === 200) {
            if (await isModelCorrect(formData, request)) {
                /**
                 * It will resolve only if request body is equal to formData argument. Headers or cookies can also be part of such logic
                 * if they play crucial role on integration with backend. However, it's not a case here.
                 *
                 * Delay added for asserting form element disabling during api call.
                 */
                await delay();
                return HttpResponse.json({}, {status});
            }
        } else {
            return HttpResponse.json(null, {status});
        }
    });
};

const isModelCorrect = async (formData: any, request: StrictRequest<DefaultBodyType>) => {
    const requestBody = await request.clone().text();
    const stringifiedFormData = JSON.stringify(formData);

    /**
     * Note: this function holds only the idea of arguments comparison. Due to simplification purposes it also holds
     * bad developer experience, as the result is affected by order of requestBody and formData elements.
     * It is possible to perform such checks independently of elements order, however, it requires more code to be produced.
     */
    if (requestBody === stringifiedFormData) {
        return true;
    } else {
        console.error(
            `Request body of POST ${request.url} call does not match with expected.\nBelow data should match exactly, including appearance order.\n     Api call: ${requestBody}\nExpected data: ${stringifiedFormData}`,
        );
        return false;
    }
};
