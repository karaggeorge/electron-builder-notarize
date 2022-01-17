# electron-builder-notarize [![Build Status](https://travis-ci.com/karaggeorge/electron-builder-notarize.svg?branch=master)](https://travis-ci.com/karaggeorge/electron-builder-notarize)

> Notarize Electron applications using electron-builder

For more details regarding the options and functionality: https://github.com/electron/electron-notarize

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

You can replace the entitlements file with your own, as long as those properties are included as well.

You will also need to authenticate yourself, either with your Apple ID or using an API key. This is done by setting the corresponding environment variables.

If for some reason the script can't locate your project's `appId`, you can specify it using the `APP_ID` environment variable.

### Using `notarytool`

In order to use `notarytool` for notarization, XCode 13 or later is required

Authentication methods:
- username and password
  - `APPLE_ID` String - The username of your apple developer account
  - `APPLE_ID_PASSWORD` String - The [app-specific password](https://support.apple.com/HT204397) (not your Apple ID password).
  - `APPLE_TEAM_ID` String - The team ID you want to notarize under.
- apiKey with apiIssuer:
  - `APPLE_API_KEY` String - Required for JWT authentication. See Note on JWT authentication below.
  - `APPLE_API_KEY_ID` String - Required for JWT authentication. See Note on JWT authentication below.
  - `APPLE_API_KEY_ISSUER` String - Issuer ID. Required if `APPLE_API_KEY` is specified.
- keychain with keychainProfile:
  - `APPLE_KEYCHAIN` String - The name of the keychain or path to the keychain you stored notarization credentials in.
  - `APPLE_KEYCHAIN_PROFILE` String - The name of the profile you provided when storing notarization credentials.

### Using Legacy

General options:
- `TEAM_SHORT_NAME` String - Your [Team Short Name](#notes-on-your-team-short-name).

Authentication methods:
- username and password
  - `APPLE_ID` String - The username of your apple developer account
  - `APPLE_ID_PASSWORD` String - The [app-specific password](https://support.apple.com/HT204397) (not your Apple ID password).
- apiKey with apiIssuer
  - `APPLE_API_KEY` String - Required for JWT authentication. See Note on JWT authentication below.
  - `APPLE_API_KEY_ISSUER` String - Issuer ID. Required if `APPLE_API_KEY` is specified.

### Multiple Teams

If your developer account is a member of multiple teams or organizations, you might see an error. In this case, you need to provide your [Team Short Name](https://github.com/electron/electron-notarize#notes-on-your-team-short-name) as an environment variable:

```sh
export TEAM_SHORT_NAME=XXXXXXXXX
```

## Credits

This package is inspired by this [article](https://medium.com/@TwitterArchiveEraser/notarize-electron-apps-7a5f988406db)

The library used for notarization: https://github.com/electron/electron-notarize

## License

MIT
