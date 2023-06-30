const {isNotaryToolAvailable} = require('@electron/notarize/lib/notarytool');
const {
	validateNotaryToolAuthorizationArgs,
	validateLegacyAuthorizationArgs
} = require('@electron/notarize/lib/validate-args');

function getAuthInfo() {
	const {
		APPLE_ID: appleId,
		APPLE_ID_PASSWORD: appleIdPassword,
		APPLE_API_KEY: appleApiKey,
		APPLE_API_KEY_ID: appleApiKeyId,
		APPLE_API_KEY_ISSUER: appleApiIssuer,
		API_KEY_ID: legacyApiKey,
		API_KEY_ISSUER_ID: legacyApiIssuer,
		TEAM_SHORT_NAME: teamShortName,
		APPLE_TEAM_ID: teamId,
		APPLE_KEYCHAIN: keychain,
		APPLE_KEYCHAIN_PROFILE: keychainProfile
	} = process.env;

	return {
		appleId,
		appleIdPassword,
		appleApiKey,
		appleApiKeyId,
		appleApiIssuer,
		teamShortName,
		teamId,
		keychain,
		keychainProfile,
		legacyApiIssuer,
		legacyApiKey
	};
}

module.exports = async () => {
	const options = getAuthInfo();

	if (!options.legacyApiIssuer && !options.legacyApiKey && await isNotaryToolAvailable()) {
		try {
			const creds = validateNotaryToolAuthorizationArgs(options);
			return {
				...creds,
				tool: 'notarytool'
			};
		} catch {}
	} else {
		console.log('notarytool not found, trying legacy.');
	}

	const creds = validateLegacyAuthorizationArgs({
		...options,
		// Backwards compatibility
		appleApiKey: options.appleApiKey || options.legacyApiKey,
		appleApiIssuer: options.appleApiIssuer || options.legacyApiIssuer
	});

	return {
		...creds,
		tool: 'legacy',
		ascProvider: options.teamShortName
	};
};
