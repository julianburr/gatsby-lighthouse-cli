#! /usr/bin/env node

const express = require('express');
const chalk = require('chalk');
const lighthouse = require('lighthouse');
const launcher = require('chrome-launcher');
const fs = require('fs');
const argv = require('yargs').argv;

const PORT = argv.port || 9001;

const app = express();
app.use(express.static(argv.sourceDir || 'public'));

const defaultOtions = { chromeFlags: [ '--headless' ] };
let options = Object.assign({}, defaultOtions); // load config from project (optional)

const server = app.listen(PORT, () => {
  launcher
    .launch({ chromeFlags: options.chromeFlags })
    .then((chrome) => {
      const url = `http://localhost:${PORT}`;
      options.port = chrome.port;
      return lighthouse(url, options, null).then((results) => {
        // use results.lhr for the JS-consumeable output
        // https://github.com/GoogleChrome/lighthouse/blob/master/typings/lhr.d.ts
        return chrome.kill().then(() => results.lhr);
      });
    })
    .then((results) => {
      logReport(results);
      if (argv.reportPath) {
        const filePath = path.resolve(process.cwd(), argv.reportPath);
        fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
      }
      server.close();
    });
});

function logReport (results) {
  let failed = false;
  Object.keys(results.categories).forEach((id) => {
    const category = results.categories[id];
    const passed = logCategory(category.title, argv[id], category.score);
    if (!passed) {
      failed = true;
    }
  });

  if (argv.logErrors) {
    logErrors(results);
  }

  if (failed && !argv.noExit) {
    process.exit(1);
  }
}

function logCategory (name, threshold, score) {
  if (!threshold) {
    log(chalk.grey(`  ${name}: ${score * 100}/100`));
    return true;
  }
  if (score * 100 >= threshold) {
    log(chalk.green.bold(`  ${name}: ${score * 100}/100`));
    return true;
  }
  log(chalk.red.bold(`✖︎ ${name}: ${score * 100}/100`));

  return false;
}

function logErrors (results) {
  Object.keys(results.audits)
    .map((id) => results.audits[id])
    .filter((audit) => audit.score !== 1)
    .forEach((error) => {
      if (error.score < 0.5) {
        console.log(
          chalk.red(
            `\n✖︎ ${error.title} [${error.id}] - ` +
              `Score: ${error.score * 100}/100\n`
          ) + chalk.grey(error.description)
        );
      } else {
        console.log(
          chalk.yellow(
            `\n⚠︎ ${error.title} [${error.id}] - ` +
              `Score: ${error.score * 100}/100\n`
          ) + chalk.grey(error.description)
        );
      }
    });
}

function log (log) {
  if (!argv.silent) {
    console.log(log);
  }
}
