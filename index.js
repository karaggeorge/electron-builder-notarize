'use strict';

const path = require('path');
const {notarize} = require('electron-notarize');
const readPkgUp = require('read-pkg-up');
// eslint-disable-next-line import/no-unresolved
const util = require('builder-util');
const fs = require('fs');
const yaml = require('js-yaml');

/**
 * Validates and returns authentication-related environment variables
 * @return {{appleApiIssuer: string, appleIdPassword: string, appleApiKey: string, appleId: string}}
 * Environment variable values
 */
const getAuthInfo = () => {
	const {
		APPLE_ID: appleId,
		APPLE_ID_PASSWORD: appleIdPassword,
		API_KEY_ID: appleApiKey,
		API_KEY_ISSUER_ID: appleApiIssuer,
		TEAM_SHORT_NAME: teamShortName
	} = process.env;

	if (!appleId && !appleIdPassword && !appleApiKey && !appleApiIssuer) {
		throw new Error(
			'Authentication environment variables for notarization are missing. Either APPLE_ID and ' +
			'APPLE_ID_PASSWORD, or API_KEY_ID and API_KEY_ISSUER_ID must be defined.'
		);
	}

	if ((appleId || appleIdPassword) && (appleApiKey || appleApiIssuer)) {
		throw new Error(
			'Should only provide either Apple ID or API key environment variables.'
		);
	}

	if ((appleId && !appleIdPassword) || (!appleId && appleIdPassword)) {
		throw new Error(
			'One of APPLE_ID and APPLE_ID_PASSWORD environment variables is missing for notarization.'
		);
	}

	if ((appleApiKey && !appleApiIssuer) || (!appleApiKey && appleApiIssuer)) {
		throw new Error(
			'One of API_KEY_ID and API_KEY_ISSUER_ID environment variables is missing for notarization.'
		);
	}

	return {
		appleId,
		appleIdPassword,
		appleApiKey,
		appleApiIssuer,
		teamShortName
	};
};

const isEnvTrue = value => {
	// eslint-disable-next-line no-eq-null, eqeqeq
	if (value != null) {
		value = value.trim();
	}

	return value === 'true' || value === '' || value === '1';
};

module.exports = async params => {
	if (params.electronPlatformName !== 'darwin') {
		return;
	}

	// Read and validate auth information from environment variables
	let authInfo;
	try {
		authInfo = getAuthInfo();
	} catch (error) {
		console.log(`Skipping notarization: ${error.message}`);
		return;
	}

	// https://github.com/electron-userland/electron-builder/blob/c11fa1f1033aeb7c378856d7db93369282d363f5/packages/app-builder-lib/src/codeSign/macCodeSign.ts#L22-L49
	if (util.isPullRequest()) {
		if (!isEnvTrue(process.env.CSC_FOR_PULL_REQUEST)) {
			console.log('Skipping notarizing, since app was not signed.');
			return;
		}
	}

	// Only notarize the app on the master branch
	if (
		!isEnvTrue(process.env.CSC_FOR_PULL_REQUEST) && (
			(process.env.CIRCLE_BRANCH && process.env.CIRCLE_BRANCH !== 'master') ||
			(process.env.TRAVIS_BRANCH && process.env.TRAVIS_BRANCH !== 'master')
		)
	) {
		return;
	}

	const {packageJson} = readPkgUp.sync();
	const buildConfig = packageJson.build;
	let appId = '';

	if (buildConfig) {
		// appId from ./package.json
		appId = buildConfig.appId;
	} else {
		try {
			// fallback for vue-cli-plugin-electron-builder
			// it uses vue.config.js to create electron builder config yaml file
			// https://github.com/nklayman/vue-cli-plugin-electron-builder
			const path = './dist_electron/builder-effective-config.yaml'
			if (fs.existsSync(path)) {
				let fileContents = fs.readFileSync(path, 'utf8');
				let data = yaml.safeLoad(fileContents);
				appId = data.appId;
			}
		} catch(err) {
			console.error(err)
		}
	}

	const appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);

	const notarizeOptions = {appBundleId: appId, appPath};
	if (authInfo.appleId) {
		notarizeOptions.appleId = authInfo.appleId;
		notarizeOptions.appleIdPassword = authInfo.appleIdPassword;
	} else {
		notarizeOptions.appleApiKey = authInfo.appleApiKey;
		notarizeOptions.appleApiIssuer = authInfo.appleApiIssuer;
	}

	if (authInfo.teamShortName) {
		notarizeOptions.ascProvider = authInfo.teamShortName;
	}

	console.log(`Notarizing ${appId} found at ${appPath}`);
	await notarize(notarizeOptions);
	console.log(`Done notarizing ${appId}`);
};
