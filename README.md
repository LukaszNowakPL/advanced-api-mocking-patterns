# Advanced api mocking patterns

This repository supports `Advanced patterns of api mocking in tests` talk. Its aim is to explain several most common mistakes on tests of applications/components triggering api endpoint calls. It also contains example of factory pattern and data randomization to better reflect unpredictable way users use the application.

This talk was performed during:

- Online track of [Warszawskie Dni Informatyki](https://warszawskiedniinformatyki.pl/conference/) conference (04.04.2025)

## Project structure

The project contains React frontend application and supporting backend stub service based on `json-server` component.

Test examples supporting each chapter of the talk are groupped on [/frontend/test](/frontend/test) directory. To cover both - developer and Tester/QA/SDET - approach, each chapter contains Playwright functional examples as well as Vitest integration examples.

## Commands available

`npm install` for installing dependencies of overall project.

`npm run install-all` for installing dependencies for backend and frontend components respectively.

`npm run all-components` will fire backend and frontend components locally. Frontend application will automatically open in the browser using http://localhost:3000/ url. Backend service is available under http://localhost:4000/ url.

`npm run test-frontend` for all tests of frontend project. This will fire both - Vitest integration and Playwright functional tests suites.

`npm run preview` will bundle frontend project and preview the production build. Frontend preview is available under http://localhost:9000/ url. Backend service is available under http://localhost:4000/ url.

## Presentation

Presentation supporting the talk will be available after the conference.

## Contact

- [GitHub profile](https://github.com/LukaszNowakPL/)
- [Linkedin profile](https://linkedin.com/in/%C5%82ukasz-nowak-533844101)
