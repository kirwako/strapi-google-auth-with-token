"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeUser = exports.AUTHENTICATED_ROLE_ID = exports.googleCredentialEntityService = void 0;
const google_auth_library_1 = require("google-auth-library");
var fetch = require('node-fetch');
const utils = require('@strapi/utils');
const fs = require('fs');
const rootDir = process.cwd();
const mime = require('mime-types'); //used to detect file's mime type
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
        const { email, given_name, picture, family_name } = payload;
        const username = email.split('@')[0];
        if (!strapi.entityService) {
            throw new Error('Strapi entity service not found');
        }
        const authUser = await strapi.entityService.findMany('plugin::users-permissions.user', {
            filters: {
                email,
            },
        });
        if (!authUser || !authUser.length) {
            let userPicture = null;
            if (picture && picture.length > 0) {
                // download the picture and upload it to strapi media library and then use the url to save it in the user
                let fileName = `${username}.jpeg`;
                // generate file extension from the mime type
                let filePath = `${rootDir}/public/uploads/${fileName}`;
                let dest = fs.createWriteStream(filePath);
                await new Promise((resolve, reject) => fetch(picture)
                    .then((res) => res.body.pipe(dest).on('finish', () => resolve(true)))
                    .catch((e) => reject(e)));
                try {
                    const mimeType = mime.lookup(filePath);
                    const stats = fs.statSync(filePath);
                    // const extension = mime.extension(mimeType);
                    // if (extension === false) {
                    // 	fileName = `${fileName}.jpeg`;
                    // } else {
                    // 	fileName = `${fileName}.${extension}`;
                    // }
                    userPicture =
                        await strapi.plugins.upload.services.upload.upload({
                            data: {},
                            files: {
                                path: filePath,
                                name: fileName,
                                type: mimeType,
                                size: stats.size,
                            },
                        });
                    // remove the file after upload
                    fs.unlinkSync(filePath);
                }
                catch (e) {
                    console.error(e);
                }
            }
            const createdUser = await strapi.entityService.create('plugin::users-permissions.user', {
                data: {
                    email,
                    username: username,
                    firstName: given_name,
                    lastName: family_name,
                    confirmed: true,
                    blocked: false,
                    role: exports.AUTHENTICATED_ROLE_ID,
                    picture: userPicture,
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
