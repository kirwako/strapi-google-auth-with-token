import { Strapi } from '@strapi/strapi';
import { IAddGoogleCredentialBody } from '../../types/requests/body';
import { OAuth2Client } from 'google-auth-library';
const utils = require('@strapi/utils');

const { sanitize } = utils;

export const googleCredentialEntityService =
	'plugin::strapi-google-auth-with-token.google-credential';

export const AUTHENTICATED_ROLE_ID = 1;

export const sanitizeUser = async (strapi: Strapi, user: any) => {
	const sanitizedUser = await sanitize.contentAPI.output(
		user,
		strapi.getModel('plugin::users-permissions.user')
		// { auth }
	);

	if (Array.isArray(sanitizedUser)) {
		return sanitizedUser[0];
	}

	return sanitizedUser;
};

export default ({ strapi }: { strapi: Strapi }) => ({
	async getGoogleCredentials() {
		let data = await strapi.entityService?.findMany(
			googleCredentialEntityService
		);
		return data;
	},
	async createGoogleCredentials(body: IAddGoogleCredentialBody) {
		if (!strapi.entityService) {
			return;
		}

		return new Promise<void>(async (resolve, reject) => {
			if (!strapi.entityService) {
				return;
			}
			try {
				let credentials: any = await this.getGoogleCredentials();
				if (!credentials) {
					await strapi.entityService.create(
						googleCredentialEntityService,
						{
							data: {
								client_id: body.clientID,
							},
						}
					);
				} else {
					await (strapi as any).entityService.update(
						googleCredentialEntityService,
						credentials.id,
						{
							data: {
								client_id: body.clientID,
							},
						}
					);
				}
				resolve();
			} catch (error) {
				reject(error);
			}
		});
	},

	async auth(body: { token: string }) {
		if (!body || !body.token) {
			throw new Error('token is required');
		}

		let ticket;
		let credentials: any = await this.getGoogleCredentials();
		if (!credentials) {
			throw new Error('Google credentials not found');
		}
		try {
			const client = new OAuth2Client(credentials.client_id);
			ticket = await client.verifyIdToken({
				idToken: body.token,
				audience: [credentials.client_id],
			});
		} catch (e) {
			throw new Error(
				'Error with invalid token or invalid Google client ID please try again later'
			);
		}

		const payload = ticket.getPayload();

		if (!payload) {
			throw new Error('Error connecting to google please try again');
		}

		const { email, given_name, family_name } = payload;

		if (!strapi.entityService) {
			throw new Error('Strapi entity service not found');
		}

		const authUser = await strapi.entityService.findMany(
			'plugin::users-permissions.user',
			{
				filters: {
					email,
				},
			}
		);
		if (!authUser || !authUser.length) {
			const createdUser = await strapi.entityService.create(
				'plugin::users-permissions.user',
				{
					data: {
						email,
						username: email.split('@')[0],
						firstName: given_name,
						lastName: family_name,
						confirmed: true,
						blocked: false,
						role: AUTHENTICATED_ROLE_ID,
					},
				}
			);

			const sanitizedUser = await sanitizeUser(strapi, createdUser);

			return {
				jwt: strapi.plugins['users-permissions'].services.jwt.issue({
					id: sanitizedUser.id,
				}),
				user: sanitizedUser,
			};
		} else {
			const sanitizedUser = await sanitizeUser(strapi, authUser);

			return {
				jwt: strapi.plugins['users-permissions'].services.jwt.issue({
					id: sanitizedUser.id,
				}),
				user: sanitizedUser,
			};
		}
	},
});
