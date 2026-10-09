// Preserve the exact Google verification URL while retaining normal asset routing.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/google39c57c24f9a4b784.html') {
      url.pathname = '/google39c57c24f9a4b784';
      return env.ASSETS.fetch(new Request(url, request));
    }
    return env.ASSETS.fetch(request);
  },
};
