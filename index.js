'use strict';

const path = require('path');
const fs = require('fs');
const readPkgUp = require('read-pkg-up');
const {notarize} = require('electron-notarize');
const yaml = require('js-yaml');
// eslint-disable-next-line import/no-unresolved
const util = require('builder-util');
const getAuthCreds = require('./validate');

const isEnvTrue = value => {
	// eslint-disable-next-line no-eq-null, eqeqeq
	if (value != null) {
		value = value.trim();
	}

	return value === 'true' || value === '' || value === '1';
};

const getAppId = params => {
	const {packager, outDir} = params;

	// Try getting appId from the packager object
	const config = packager.info._configuration;
	const appId = config && config.appId;

	if (appId) {
		return appId;
	}

	// Try getting appId from the `builder-effective-config.yml`
	const effectiveConfigPath = path.join(outDir, 'builder-effective-config.yaml');
	// This doesn't exist in CI
	if (fs.existsSync(effectiveConfigPath)) {
		const buildConfig = fs.readFileSync(effectiveConfigPath);
		const {appId} = yaml.safeLoad(buildConfig);
		return appId;
	}

	// Try getting appId from `package.json` or from an env var
	const {packageJson} = readPkgUp.sync();
	return (packageJson.build && packageJson.build.appId) || process.env.APP_ID;
};

module.exports = async params => {
	if (params.electronPlatformName !== 'darwin') {
		return;
	}

	// https://github.com/electron-userland/electron-builder/blob/c11fa1f1033aeb7c378856d7db93369282d363f5/packages/app-builder-lib/src/codeSign/macCodeSign.ts#L22-L49
	if (util.isPullRequest()) {
		if (!isEnvTrue(process.env.CSC_FOR_PULL_REQUEST)) {
			console.log('Skipping notarizing, since app was not signed.');
			return;
		}
	}

	// Read and validate auth information from environment variables
	let authInfo;
	try {
		authInfo = await getAuthCreds();
	} catch (error) {
		console.log(`Skipping notarization: ${error.message}`);
		return;
	}

	const appId = getAppId(params);

	if (!appId) {
		throw new Error('`appId` was not found');
	}

	const appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);

	const notarizeOptions = {
		...authInfo,
		appPath,
		appBundleId: appId
	};

	console.log(`Notarizing ${appId} found at ${appPath}`);
	await notarize(notarizeOptions);
	console.log(`Done notarizing ${appId}`);
};
