# GoogleAuth

Google auth with token helps you to easily create google authentication available for your users with idToken. It uses the official google-auth-library library to execute the actions and verify the token. You can get it working in seconds in your application. EASY!

![Dashboard Screenshot](https://github.com/kirwako/strapi-google-auth-with-token/blob/main/screenshots/dashboard.png)

# Features

-   Official GoogleAPIs integration
-   One Tap support using token [One Tap](https://developers.google.com/identity/gsi/web/guides/features)
-   Using strapi default user-permission collection
-   JWT Authentication
-   Sanitized response
-   Highly secure

# Activate the Plugin

1. Install the plugin using npm or yarn

```bash
npm install strapi-google-auth-with-token
# or
yarn add strapi-google-auth-with-token
```

2. Add the following lines of code in the file: config/plugins.js or config/plugins.ts

```js
module.exports = {
	'strapi-google-auth-with-token': {
		enabled: true,
	},
};
```

# Configuration

1. Create a google project from the [Google Cloud Console](https://console.cloud.google.com/projectcreate?previousPage=%2Fcloud-resource-manager%3Fproject%3D%26folder%3D%26organizationId%3D).
2. Create OAuth Consent Screen (Nav Menu -> APIs & Services -> [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)).
3. Go to [Credentials](https://console.cloud.google.com/apis/credentials), click create credentials -> OAuth Client ID
4. Put the CLIENT_ID in the plugin page of Strapi, and save it.

# How to use

### Get User jwt token and user data

```js
    {
        method: 'POST',
        path: 'STRAPI_BACKEND_URL/strapi-google-auth-with-token/auth',
        data: {
            token: idToken // get the token from the google sign-in button
        }
    }
```

## PS: if you want to save the first and last name of the user
add `firstName` and `lastName` attributes to user entity in `Content Type Builder`

# Report Bugs/Issues

Any bugs/issues you may face can be submitted as issues in the Github repo.
