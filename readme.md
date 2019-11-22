# electron-builder-notarize [![Build Status](https://travis-ci.com/karaggeorge/electron-builder-notarize.svg?branch=master)](https://travis-ci.com/karaggeorge/electron-builder-notarize)

> Notarize Electron applications using electron-builder


## Install

```
# npm
npm i electron-builder-notarize --save-dev

# yarn
yarn add electron-builder-notarize --dev
```


## Usage

In your electron-builder config:

```json
{
	...
	"afterSign": "electron-builder-notarize",
	"mac": {
		...
		"hardenedRuntime": true,
		"entitlements": "./node_modules/electron-builder-notarize/entitlements.mac.inherit.plist",
	}
}
```

You will also need to set two environment variables:

- `APPLE_ID`: The username of your apple developer account
- `APPLE_ID_PASSWORD`: An app-specific password. You can create one at appleid.apple.com

You can replace the entitlements file with your own, as long as those properties are included as well.
