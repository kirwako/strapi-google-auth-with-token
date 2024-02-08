"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeUser = exports.AUTHENTICATED_ROLE_ID = exports.googleCredentialEntityService = void 0;
const google_auth_library_1 = require("google-auth-library");
const utils = require('@strapi/utils');
const { sanitize } = utils;
exports.googleCredentialEntityService = 'plugin::strapi-google-auth-with-token.google-credential';
exports.AUTHENTICATED_ROLE_ID = 1;
const sanitizeUser = async (strapi, user) => {
    const sanitizedUser = await sanitize.contentAPI.output(user, strapi.getModel('plugin::users-permissions.user')
    // { auth }
    );
    if (Array.isArray(sanitizedUser)) {
        return sanitizedUser[0];
    }
    return sanitizedUser;
};
exports.sanitizeUser = sanitizeUser;
exports.default = ({ strapi }) => ({
    async getGoogleCredentials() {
        var _a;
        let data = await ((_a = strapi.entityService) === null || _a === void 0 ? void 0 : _a.findMany(exports.googleCredentialEntityService));
        return data;
    },
    async createGoogleCredentials(body) {
        if (!strapi.entityService) {
            return;
        }
        return new Promise(async (resolve, reject) => {
            if (!strapi.entityService) {
                return;
            }
            try {
                let credentials = await this.getGoogleCredentials();
                if (!credentials) {
                    await strapi.entityService.create(exports.googleCredentialEntityService, {
                        data: {
                            client_id: body.clientID,
                        },
                    });
                }
                else {
                    await strapi.entityService.update(exports.googleCredentialEntityService, credentials.id, {
                        data: {
                            client_id: body.clientID,
                        },
                    });
                }
                resolve();
            }
            catch (error) {
                reject(error);
            }
        });
    },
    async auth(body) {
        if (!body || !body.token) {
            throw new Error('token is required');
        }
        let ticket;
        let credentials = await this.getGoogleCredentials();
        if (!credentials) {
            throw new Error('Google credentials not found');
        }
        try {
            const client = new google_auth_library_1.OAuth2Client(credentials.client_id);
            ticket = await client.verifyIdToken({
                idToken: body.token,
                audience: [credentials.client_id],
            });
        }
        catch (e) {
            throw new Error('Error with invalid token or invalid Google client ID please try again later');
        }
        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error('Error connecting to google please try again');
        }
        const { email, given_name, family_name } = payload;
        if (!strapi.entityService) {
            throw new Error('Strapi entity service not found');
        }
        const authUser = await strapi.entityService.findMany('plugin::users-permissions.user', {
            filters: {
                email,
            },
        });
        if (!authUser || !authUser.length) {
            const createdUser = await strapi.entityService.create('plugin::users-permissions.user', {
                data: {
                    email,
                    username: email.split('@')[0],
                    firstName: given_name,
                    lastName: family_name,
                    confirmed: true,
                    blocked: false,
                    role: exports.AUTHENTICATED_ROLE_ID,
                },
            });
            const sanitizedUser = await (0, exports.sanitizeUser)(strapi, createdUser);
            return {
                jwt: strapi.plugins['users-permissions'].services.jwt.issue({
                    id: sanitizedUser.id,
                }),
                user: sanitizedUser,
            };
        }
        else {
            const sanitizedUser = await (0, exports.sanitizeUser)(strapi, authUser);
            return {
                jwt: strapi.plugins['users-permissions'].services.jwt.issue({
                    id: sanitizedUser.id,
                }),
                user: sanitizedUser,
            };
        }
    },
});
