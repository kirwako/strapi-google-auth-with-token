"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthPluginName = exports.googleServiceName = void 0;
exports.googleServiceName = "googleService";
exports.googleAuthPluginName = "strapi-google-auth-with-token";
exports.default = ({ strapi }) => ({
    async getCredentials(ctx) {
        ctx.body = await strapi
            .plugin(exports.googleAuthPluginName)
            .service(exports.googleServiceName)
            .getGoogleCredentials();
    },
    async createCredentials(ctx) {
        try {
            await strapi
                .plugin(exports.googleAuthPluginName)
                .service(exports.googleServiceName)
                .createGoogleCredentials(ctx.request.body);
            ctx.body = { ok: true };
        }
        catch (error) {
            console.log(error);
            ctx.body = { ok: false };
        }
    },
    async auth(ctx) {
        try {
            const res = await strapi
                .plugin(exports.googleAuthPluginName)
                .service(exports.googleServiceName)
                .auth(ctx.request.body);
            ctx.body = res;
        }
        catch (error) {
            console.error(error);
            ctx.body = { ok: false, error: error.message };
            ctx.status = 400;
        }
    },
});
