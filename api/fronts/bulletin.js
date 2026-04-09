const NWS_FRONTS_SOURCES = {
  hires: "https://tgftp.nws.noaa.gov/data/raw/as/asus02.kwbc.cod.sus.txt",
  lowres: "https://tgftp.nws.noaa.gov/data/raw/as/asus01.kwbc.cod.sus.txt",
};

function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

async function fetchBulletin(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "weatherwatch/fronts-proxy" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Fronts bulletin error ${response.status}`);
  }

  return response.text();
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  const resolution = String(req.query?.resolution || "hires").toLowerCase();
  const target = NWS_FRONTS_SOURCES[resolution] || NWS_FRONTS_SOURCES.hires;
  const fallback = resolution === "hires" ? NWS_FRONTS_SOURCES.lowres : null;

  try {
    const text = await fetchBulletin(target);
    sendJson(res, 200, { resolution, text });
  } catch (error) {
    if (!fallback) {
      sendJson(res, 502, { error: error?.message || "Failed to fetch fronts bulletin." });
      return;
    }

    try {
      const text = await fetchBulletin(fallback);
      sendJson(res, 200, { resolution: "lowres", text, fallback: true });
    } catch (fallbackError) {
      sendJson(res, 502, { error: fallbackError?.message || "Failed to fetch fronts bulletin." });
    }
  }
};
