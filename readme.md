# Homey - Betterstack
📣 Logtail is now part of Better Stack. [Learn more ⇗](https://betterstack.com/press/introducing-better-stack/)

[![Better Stack dashboard](https://github.com/logtail/logtail-js/assets/10132717/96b422e7-3026-49c1-bd45-a946c37211d0)](https://betterstack.com/logs)

## Introduction

This package provides integration between your Homey app and Betterstack logging service. By using this package, you can easily log events, errors, and other information from your Homey app to Betterstack for monitoring and analysis.

## Setup

1. Create an account and project on [Betterstack](https://betterstack.com/logs).
2. Obtain the `source_token` provided by Betterstack.
3. Add the `source_token` as `HOMEY_BETTERSTACK_TOKEN` in your `env.json` file.

## Installation

You can install the package via npm:

```bash
npm install homey-betterstack
```

or 

```bash
yarn add homey-betterstack
```

## Usage
### Import the package

```javascript

const HomeyLog = require('homey-betterstack');
```

### Extend the app class

Edit the app class to extend `HomeyLog`:

```javascript
//From:
class App extends Homey.App {
```


```javascript
// To
class App extends HomeyLog {
```

### Logging from app.js

Use `this.log` or `this.error` within your `app.js`:

```javascript
this.log("Event occurred");
this.error("Error occurred", error);
```

### Logging from devices and drivers

Use `this.homey.app.log` from within your devices and drivers:

```javascript

this.homey.app.log("Event occurred in device/driver");
this.homey.app.error("Error occurred in device/driver", error);
```

## Example
```javascript
class App extends HomeyLog {
    async onInit() {
        try {       
            this.log(`${Homey.manifest.id} - ${Homey.manifest.version} started...`);
        } catch (error) {
            this.homey.app.log(error);
        }
    }
}

module.exports = App;

```

## Result
In the terminal:

```bash
[info] com.test.app - 0.0.1 started...
```

In Betterstack:

<img src="https://github.com/martijnpoppen/homey-betterstack/blob/main/assets/image1.png?raw=true">

