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

You can replace the entitlements file with your own, as long as those properties are included as well.

You will also need to authenticate yourself, either with your Apple ID or using an API key. This is done by setting the corresponding environment variables.

### App ID

If for some reason the script can't locate your project's `appId`, you can specify it using the `APP_ID` environment variable.

### Apple ID

- `APPLE_ID`: The username of your Apple developer account.
- `APPLE_ID_PASSWORD`: An app-specific password. You can create one at [appleid.apple.com](https://appleid.apple.com).

### API Key

- `API_KEY_ID`: The ID of your App Store Connect API key, which can be generated [here](https://appstoreconnect.apple.com/access/api).
- `API_KEY_ISSUER_ID`: The issuer ID of your API key, which can be looked up on the same site.

You will also need the API key `.p8` file at the correct location on your file system. See [`electron-notarize`](https://github.com/electron/electron-notarize)'s docs for details on this setup.

### Multiple Teams

If your developer account is a member of multiple teams or organizations, you might see an error. In this case, you need to provide your [Team Short Name](https://github.com/electron/electron-notarize#notes-on-your-team-short-name) as an environment variable:

```sh
export TEAM_SHORT_NAME=XXXXXXXXX
```

## Credits

This package is inspired by this [article](https://medium.com/@TwitterArchiveEraser/notarize-electron-apps-7a5f988406db)

## License

MIT
