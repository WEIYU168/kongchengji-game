const origin = "https://weiyu168.github.io";
const gamePath = "/kongchengji-game";

export default {
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    const url = new URL(request.url);
    const upstream = new URL(origin);
    upstream.pathname = gamePath + url.pathname;
    upstream.search = url.search;

    const headers = new Headers();
    // Preserve video seeking and conditional requests without forwarding credentials.
    for (const name of ["Range", "If-Range", "If-None-Match", "If-Modified-Since"]) {
      if (request.headers.has(name)) headers.set(name, request.headers.get(name));
    }

    const isPage = url.pathname.endsWith("/") || url.pathname.endsWith(".html");
    const response = await fetch(upstream, {
      method: request.method,
      headers,
      redirect: "manual",
      cf: {
        cacheEverything: true,
        cacheTtlByStatus: { 200: isPage ? 60 : 3600, "300-599": 0 },
      },
    });

    const location = response.headers.get("Location");
    if (location) {
      const destination = new URL(location, upstream);
      if (destination.origin === origin && destination.pathname.startsWith(gamePath + "/")) {
        const redirected = new URL(url);
        redirected.pathname = destination.pathname.slice(gamePath.length);
        redirected.search = destination.search;
        const result = new Response(response.body, response);
        result.headers.set("Location", redirected.href);
        return result;
      }
    }

    return response;
  },
};
