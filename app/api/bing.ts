import ky from "ky";
import { env } from "~/env.server";
import type { BingSearchResponse } from "~/types";

const client = ky.create({
  prefixUrl: "https://api.bing.microsoft.com/v7.0/",
  headers: {
    "Ocp-Apim-Subscription-Key": env.BING_API_KEY,
  },
});

export const Bing = {
  async imageSearch(query: string): Promise<BingSearchResponse> {
    const searchParams = new URLSearchParams({
      q: query,
      count: "8",
    });
    const response = await client.get(`images/search?${searchParams}`);
    return response.json();
  },
};
