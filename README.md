# SmartCHANGE HCP Web Application

This project is the clinician-facing Angular application for the SmartCHANGE ecosystem. It provides healthcare professionals with a web portal for reviewing participant data, monitoring progress, managing interventions, and interacting with SmartCHANGE backend services and identity infrastructure. The app is configured as a single-page Angular application and is built around a set of SmartCHANGE-specific domain libraries, translation support, and OpenID Connect-based authentication.

<img src="docs/eu-co-funded.png" alt="Co-funded by the European Union" width="300">

> This project has received funding from the Horizon Europe R&I programme under Grant Agreement No. 101080965 (SmartCHANGE). The information
> provided reflects solely the authors' views; the European Commission is not liable for any use that may be made of it.

## Core capabilities

The source code shows the application is designed to support:

- clinician and patient-facing workflow screens for monitoring participant progress
- FHIR-based clinical data and risk assessment workflows
- patient questionnaire and self-reported data review
- multilingual UI support through translation bundles
- backend integration for EMR, user event, and XCDS-style services
- OIDC-enabled authentication and secure routed API access

## Runtime dependencies and integrations

The project depends on the following key technologies and libraries from the source code:

- Angular 15 and Angular Material / CDK
- TypeScript 4.8 and RxJS 7
- OpenID Connect authentication via `angular-auth-oidc-client`
- Internationalisation via `@ngx-translate/core` and `@ngx-translate/http-loader`
- Pre-built Heart UI libraries (`@eng-it4h/*`) for FHIR data conversion, domain models, backend connectivity, and supporting UI features. The required versions are distributed with this repository under `vendor/heart-ui/` as npm package archives and are licensed separately under the Apache License, Version 2.0.
- File and archive utilities such as `lz-string`
- Charts and visualisation support via `@swimlane/ngx-charts` and D3 libraries
- Data management helpers such as `lodash-es`, `ngx-date-fns`, and `ngx-markdown`

The app bootstrap in `src/app/app.module.ts` also wires in:

- the translation module with locale setup
- `AuthModule`
- `BackendApiModule`
- `UserEventsApiModule`
- `SlofitEmrApiModule`
- `ServiceModule`

This is consistent with a multi-service clinical web application rather than a simple CRUD frontend.

## Project structure

```text
webapp/
├── src/
│   ├── app/
│   │   ├── config/          Application configuration and service settings
│   │   ├── modules/         Feature modules, API integrations, auth, services
│   │   └── ...
│   ├── assets/
│   │   ├── i18n/           Translation JSON files
│   │   └── ...
│   ├── environments/        Environment-specific configuration
│   ├── index.html
│   ├── main.ts
│   └── silent-renew.html
├── vendor/
│   └── heart-ui/            Pre-built Heart UI npm packages required by the application
├── THIRD-PARTY-LICENSES/
│   └── APACHE-2.0.txt       Apache 2.0 licence applicable to Heart UI packages
├── docker/                   Dockerfile and nginx configuration
├── angular.json
├── package.json
├── tsconfig*.json
├── karma.conf.js
├── README.md
├── NOTICE
└── LICENSE
```

## Prerequisites

The project is configured for an Angular 15 toolchain. For local development, use:

- Node.js 18 LTS (recommended)
- npm
- Angular CLI 15.x (installed via the repo dependencies)

Check that the toolchain is available:

```bash
node --version
npm --version
npx ng version
```

## Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd hcp-webapp
npm install
```

The Heart UI libraries required by the application are provided as pre-built npm package archives under `vendor/heart-ui/`. The corresponding `@eng-it4h/*` dependencies in `package.json` reference these local packages directly.

No access to the original Heart UI package registry is required to install these dependencies or build the application.

The vendored Heart UI libraries are distributed under the Apache License, Version 2.0. See [License](#license) for details.

## Running locally

The project defines the following useful scripts in `package.json`:

```bash
npm start
npm run start:gui
npm run start:testvm
```

The default development server runs on the local host and is configured as:

```bash
ng serve --host=127.0.0.1
```

The application is served at:

```text
http://localhost:4200
```

## Environment configuration

The runtime configuration is defined in the environment files under `src/environments/`.

The default development configuration in `src/environments/environment.ts` includes settings such as:

- `production: false`
- `useOidc: true`
- `enableAuthentication: true`
- `apiUrl: 'http://localhost/emr'`
- `authBaseUrl: 'http://localhost/auth'`
- `realm: 'smartchange'`
- `xcdsServiceUrl: 'http://localhost/xcdsbroker'`
- `feBasePath: '/assets/i18n/'`
- `defaultLanguage: 'en'`

The authentication setup in `src/app/config/server-configuration.conf.ts` also configures the OIDC client with:

- authority: `${environment.authBaseUrl}/realms/${environment.realm}`
- client ID: `heart-webapp`
- redirect URL: `${window.location.origin}/web/callback`
- secure routes that include the API and XCDS service URLs

Before running the app against a real backend, update the relevant environment settings to match the deployment or local test environment.

## Build and packaging

Run a local build:

```bash
npm run build
```

Build a Docker image for the application:

```bash
docker build -f docker/Dockerfile -t ghcr.io/smartchange-eu/webapp:latest .
```

The repository also includes additional Docker helper scripts:

```bash
npm run docker:build
npm run docker:push
npm run docker:build-push
```

## Development notes

This app uses Angular CLI conventions and supports standard Angular generators, for example:

```bash
npx ng generate component my-component
npx ng generate service my-service
npx ng generate module my-module
```

The app uses a very modular structure, with feature-specific modules for backend APIs, auth, user events, and EMR-related integrations. If you are extending the application, the most important places to review are:

- `src/app/app.module.ts`
- `src/app/modules/`
- `src/environments/`
- `src/app/config/`

## Related components in the SmartCHANGE ecosystem

This frontend integrates with other SmartCHANGE services, including:

- backend API services
- FHIR/EMR connectivity
- XCDS broker integration
- user event logging
- multilingual content delivered from the static asset bundles

The web app acts as the clinician portal for the wider SmartCHANGE platform and is designed to work alongside the backend and mobile application ecosystem.

## License

The source code of this project is developed within the SmartCHANGE initiative and is distributed under the MIT License. See [LICENSE](LICENSE).

The pre-built Heart UI libraries distributed under `vendor/heart-ui/` are separate components licensed under the Apache License, Version 2.0. See [THIRD-PARTY-LICENSES/APACHE-2.0.txt](THIRD-PARTY-LICENSES/APACHE-2.0.txt) and [NOTICE](NOTICE).