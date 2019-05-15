# PRX Pixel Tracker

A generic pixel tracker to log impressions to kinesis (and eventually BigQuery)

# Description

This repo is deployed as an [API Gateway Lambda](https://aws.amazon.com/api-gateway/)
function.  Incoming requests for the `/i.gif` path will log information about the
user to kinesis, for later processing and shipping to BigQuery by the
[analytics-ingest-lambda](https://github.com/PRX/analytics-ingest-lambda).

In order for a request to be recorded by the pixel tracker, 5 pieces of information
must be present, and 3 optional:

1. A string `?k=` key query param.
2. A string `?c=` canonical-url query param.
3. A string `?d=` destination bigquery table.
4. A valid `?s=` signature for any query params on the request
5. A non-bot user-agent header.
6. _(optional)_ An `x-forwarded-for` header. Defaults to the source-ip of the request.
7. _(optional)_ A `referer` header.
8. _(optional)_ A `cookie` header containing the `_pxid` key

Additionally, requests without a cookie will be redirected from `/i.gif` to
`/r.gif` in an attempt to set the optional `_pxid` cookie.

With all those present, a record will be put to the `KINESIS_STREAM` env stream
name, containing a json object:

```json
{
  "type": "pixel",
  "destination": "dataset1.table_name_1",
  "timestamp": 1490827132999,
  "key": "any-string-here",
  "canonical": "https://www.prx.org/url1",
  "remoteAgent": "some-user-agent",
  "remoteIp": "50.21.204.248, 127.0.0.1",
  "remoteReferrer": "https://www.prx.org/technology/",
  "userId": "my-user-id-string"
}
```

## Signing requests

An admin page is included at the `/admin` route to assist in signing requests.
It includes a form allowing authorized users to fill in:

1. A string key
2. A canonical url
3. Select a destination `dataset.table`, preset in the `DESTINATIONS` env variable

After submitting the form, the request is signed with a `?s=` query param, and is
now a valid pixel tracker url.

## Environment variables

- `DESTINATIONS` a comma separated list of `dataset.table` BigQuery tables to
  include on the admin page dropdown.
- `ID_HOST` the PRX ID server used to authenticate users for access to the admin page
- `KINESIS_STREAM` the destination stream for tracked pixels
- `SIGNER_SECRET` a secret string used to sign pixel query parameters

# Installation

To get started, first install dev dependencies with `yarn`.  Then run `yarn test`.  End of list!

Or to use docker, just run `docker-compose build` and `docker-compose run test`.

To run the development server (simulates API gateway at localhost:3000):

```sh
cp env-example .env
vi .env
yarn start
```

# Deploying

The source code zipfile for the lambda can be build with the `yarn run build` command.
Just deploy that to your API gateway lambda and you're all set.

# License

[AGPL License](https://www.gnu.org/licenses/agpl-3.0.html)
