# PRX Pixel Tracker

A generic pixel tracker to log impressions to kinesis (and eventually BigQuery)

# Description

This repo is deployed as an [API Gateway Lambda](https://aws.amazon.com/api-gateway/)
function.  Incoming requests for the `/i.gif` path will log information about the
user to kinesis, for later processing and shipping to BigQuery by the
[analytics-ingest-lambda](https://github.com/PRX/analytics-ingest-lambda).

In order for a request to be recorded by the pixel tracker, 3 pieces of information
must be present, and 2 optional:

1. A valid `?k=` key query param (any string).
2. A valid `?c=` canonical-url query param (any string).
3. A non-bot user-agent header.
4. _(optional)_ An `x-forwarded-for` header. Defaults to the source-ip of the request.
5. _(optional)_ A `referer` header.

Additionally, the timestamp of the request will be recorded to kinesis.

# Installation

To get started, first install dev dependencies with `yarn`.  Then run `yarn test`.  End of list!

Or to use docker, just run `docker-compose build` and `docker-compose run test`.

# Deploying

The source code zipfile for the lambda can be build with the `yarn run build` command.
Just deploy that to your API gateway lambda and you're all set.

# License

[AGPL License](https://www.gnu.org/licenses/agpl-3.0.html)
