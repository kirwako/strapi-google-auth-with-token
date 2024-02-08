import { Strapi } from "@strapi/strapi";

export const googleServiceName = "googleService";
export const googleAuthPluginName = "strapi-google-auth-with-token";

export default ({ strapi }: { strapi: Strapi }) => ({
  async getCredentials(ctx) {
    ctx.body = await strapi
      .plugin(googleAuthPluginName)
      .service(googleServiceName)
      .getGoogleCredentials();
  },
  async createCredentials(ctx) {
    try {
      await strapi
        .plugin(googleAuthPluginName)
        .service(googleServiceName)
        .createGoogleCredentials(ctx.request.body);

      ctx.body = { ok: true };
    } catch (error) {
      console.log(error);
      ctx.body = { ok: false };
    }
  },
  async auth(ctx) {
    try {
      const res = await strapi
        .plugin(googleAuthPluginName)
        .service(googleServiceName)
        .auth(ctx.request.body);

      ctx.body = res;
    } catch (error) {
      console.error(error);
      ctx.body = { ok: false, error: error.message };
      ctx.status = 400;
    }
  },
});
