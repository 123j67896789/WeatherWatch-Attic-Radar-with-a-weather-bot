const HIRES_URL = "https://tgftp.nws.noaa.gov/data/raw/as/asus02.kwbc.cod.sus.txt";
const LOWRES_URL = "https://tgftp.nws.noaa.gov/data/raw/as/asus01.kwbc.cod.sus.txt";

async function fetchFronts(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "atticradar/surface-fronts" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Fronts upstream error ${response.status}`);
  }

  return response.text();
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).send("Method not allowed.");
    return;
  }

  const wantsLowRes = String(req.query?.res || "").toLowerCase() === "lo";
  const primaryUrl = wantsLowRes ? LOWRES_URL : HIRES_URL;
  const fallbackUrl = wantsLowRes ? null : LOWRES_URL;

  try {
    const text = await fetchFronts(primaryUrl);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(text);
  } catch (error) {
    if (!fallbackUrl) {
      res.status(502).send(error?.message || "Failed to load fronts data.");
      return;
    }

    try {
      const text = await fetchFronts(fallbackUrl);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.status(200).send(text);
    } catch (fallbackError) {
      res.status(502).send(fallbackError?.message || "Failed to load fronts data.");
    }
  }
};
