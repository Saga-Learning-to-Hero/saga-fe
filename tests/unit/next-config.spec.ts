import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("next.config deployment routing", () => {
  it("UTCID01 - [N] Normal: chuyển www về origin canonical đã được backend cho phép CORS", async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/:path*",
          destination: "https://saga.autos/:path*",
          permanent: false,
          has: [
            {
              type: "host",
              value: "www.saga.autos",
            },
          ],
        }),
      ])
    );
  });

  it("UTCID02 - [B] Boundary: giữ rewrite same-origin cho API và OAuth fallback", async () => {
    const rewrites = await nextConfig.rewrites?.();

    expect(rewrites).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/api/:path*",
          destination: expect.stringMatching(/\/api\/:path\*$/),
        }),
        expect.objectContaining({
          source: "/oauth2/:path*",
          destination: expect.stringMatching(/\/oauth2\/:path\*$/),
        }),
      ])
    );
  });
});
