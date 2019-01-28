![Logo](./logo.svg)


# gatsby-lighthouse-cli

![npm](https://img.shields.io/npm/v/gatsby-lighthouse-cli.svg?style=for-the-badge) ![license](https://img.shields.io/github/license/julianburr/gatsby-lighthouse-cli.svg?style=for-the-badge)

Run [lighthouse](https://github.com/GoogleChrome/lighthouse) on your [gatsby](https://github.com/gatsbyjs/gatsby) app locally.

## How to use it

```bash
yarn add gatsby-lighthouse-cli --dev
```

It exposes the functionality through a binary, which you can call e.g. in your package json scripts:

```json
{
  "scripts": {
    "lighthouse": "gatsby-lighthouse --performance=100 --accessibility=100"
  }
}
```

## CLI Args

**`--performance`**

Threshold for performance category (number between 1 and 100). If not specified, no threshold will be applied. The CLI will still display the score.

**`--pwa, --accessibility, --best-practises, --seo`**

Same for other categories.

**`--show-errors`**

Shows all metrics of the audit that have a score less than 100.

**`--silent`**

Don't output any logs.

**`--port`**

The port your gatsby app will be served on for the audit (defaults to `9001`)

## Config

> ⚠️ This is still work in progress, the below is just a plan atm

Ideally you can override the lighthouse and chrome configs easily. The best way would be a `gatsby-lighthouse-config.js` file that automatically gets detected. An additional option would be via cli argument `--config` allowing to specify a specific file path to pick up the config, which would allow having multiple configs for different testing scenarios.

## How does it work?

It's pretty simple. All this library does is starting up an [express](https://github.com/expressjs/express/) server that serves your gatsby app. It then launches a headless instance of chrome and runs lighthouse with the given config and checks the resulting scores against any given thresholds. If a score is lower than a given threshold, the command will exit with code 1, allowing you to use it e.g. in pre-commit hooks or CI preventing deployments.

## Similar projects

Inspired by [https://github.com/ivanoats/gatsby-lighthouse](https://github.com/ivanoats/gatsby-lighthouse) and [https://github.com/andreasonny83/lighthouse-ci](https://github.com/andreasonny83/lighthouse-ci).