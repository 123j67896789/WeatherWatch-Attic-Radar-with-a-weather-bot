const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { pathToFileURL } = require('url');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 3333);
const ROOT = __dirname;
const GRID_ROOT = 'C:\\Users\\elith\\Desktop\\storm-chaser-grid';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function resolveStaticPath(urlPath) {
  const safePath = decodeURIComponent(urlPath.split('?')[0]);
  const relative = safePath === '/' ? '/index.html' : safePath;
  const resolved = path.resolve(ROOT, `.${relative}`);
  if (!resolved.startsWith(ROOT)) return null;
  return resolved;
}

// The storm-grid-app is built with Vite's default base '/'.
// Its index.html uses absolute paths like /assets/... and /wasm/...
// When loaded as an iframe from /storm-grid-app/index.html, those absolute
// requests hit the root server. We resolve them by checking the
// storm-grid-app/ subdirectory as a fallback for asset requests.
const GRID_APP_ASSET_PREFIXES = ['/assets/', '/wasm/'];

async function serveStatic(req, res) {
  let filePath = resolveStaticPath(req.url || '/');
  if (!filePath) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  // For absolute asset paths emitted by the Vite build, fall back to the
  // storm-grid-app directory if the file doesn't exist at the root.
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const isGridAsset = GRID_APP_ASSET_PREFIXES.some((p) => urlPath.startsWith(p));

  try {
    let stat = await fsp.stat(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      stat = await fsp.stat(filePath);
    }

    const ext = path.extname(filePath).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    fs.createReadStream(filePath).pipe(res);
  } catch {
    // Try storm-grid-app subdirectory as a fallback for Vite asset paths
    if (isGridAsset) {
      const gridFallback = path.resolve(ROOT, 'storm-grid-app' + urlPath);
      if (gridFallback.startsWith(ROOT)) {
        try {
          const fallbackStat = await fsp.stat(gridFallback);
          if (fallbackStat.isFile()) {
            const ext = path.extname(gridFallback).toLowerCase();
            res.statusCode = 200;
            res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
            res.setHeader('Cache-Control', 'no-store');
            fs.createReadStream(gridFallback).pipe(res);
            return;
          }
        } catch {
          // fall through to 404
        }
      }
    }
    sendJson(res, 404, { error: 'Not found' });
  }
}

async function frontsHandler(req, res) {
  const HIRES_URL = 'https://tgftp.nws.noaa.gov/data/raw/as/asus02.kwbc.cod.sus.txt';
  const LOWRES_URL = 'https://tgftp.nws.noaa.gov/data/raw/as/asus01.kwbc.cod.sus.txt';
  const url = (req.url || '').includes('res=lo') ? LOWRES_URL : HIRES_URL;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'atticradar/surface-fronts' },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Fronts upstream error ${response.status}`);
    }
    const text = await response.text();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(text);
  } catch (error) {
    sendJson(res, 502, { error: error?.message || 'Failed to load fronts data.' });
  }
}

async function reportsHandler(req, res) {
  try {
    const response = await fetch('https://mesonet.agron.iastate.edu/geojson/lsr.php?sts=24&fmt=geojson', {
      headers: { 'User-Agent': 'atticradar/storm-grid-reports' },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Reports upstream error ${response.status}`);
    }
    const data = await response.json();
    const reports = Array.isArray(data?.features)
      ? data.features.map((feature, index) => {
          const coords = feature?.geometry?.coordinates || [NaN, NaN];
          const props = feature?.properties || {};
          return {
            id: String(feature?.id ?? `${props?.VALID ?? 'report'}-${index}`),
            type: String(props?.TYPETEXT || 'Storm report'),
            city: String(props?.CITY || ''),
            county: String(props?.COUNTY || ''),
            state: String(props?.STATE || ''),
            latitude: Number(coords[1]),
            longitude: Number(coords[0]),
            valid: String(props?.VALID || ''),
            source: String(props?.SOURCE || ''),
            remark: String(props?.REMARK || ''),
          };
        }).filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
      : [];
    sendJson(res, 200, { reports });
  } catch (error) {
    sendJson(res, 502, { error: error?.message || 'Failed to load reports.' });
  }
}

async function loadPluginMiddleware(modulePath, exportName) {
  const imported = await import(pathToFileURL(modulePath).href);
  const plugin = imported[exportName]();
  let middleware = null;
  const fakeServer = {
    middlewares: {
      use(fn) {
        middleware = fn;
      },
    },
  };
  if (typeof plugin.configureServer === 'function') {
    plugin.configureServer(fakeServer);
  } else if (typeof plugin.configurePreviewServer === 'function') {
    plugin.configurePreviewServer(fakeServer);
  }
  if (!middleware) {
    throw new Error(`Failed to initialize middleware for ${modulePath}`);
  }
  return middleware;
}

async function buildApiRouter() {
  const [frontsMw, stationsMw, weatherAiMw] = await Promise.all([
    loadPluginMiddleware(path.join(GRID_ROOT, 'server', 'frontsProxy.js'), 'frontsProxyPlugin'),
    loadPluginMiddleware(path.join(GRID_ROOT, 'server', 'radarStationsProxy.js'), 'radarStationsProxyPlugin'),
    loadPluginMiddleware(path.join(GRID_ROOT, 'server', 'weatherAiProxy.js'), 'weatherAiProxyPlugin'),
  ]);

  return async function routeApi(req, res) {
    if ((req.url || '').startsWith('/api/fronts')) {
      await frontsHandler(req, res);
      return true;
    }

    if ((req.url || '').startsWith('/api/reports')) {
      await reportsHandler(req, res);
      return true;
    }

    if ((req.url || '').startsWith('/api/raw-radar/')) {
      sendJson(res, 501, {
        error: 'Raw radar API is not mounted in AtticRadar yet.',
        details: 'Non-radar Storm Chaser Grid pages can run now. Radar backend port is still pending.',
      });
      return true;
    }

    const middlewareStack = [frontsMw, stationsMw, weatherAiMw];
    let index = 0;
    const next = async () => {
      const current = middlewareStack[index++];
      if (!current) return;
      await current(req, res, next);
    };
    await next();
    return res.writableEnded;
  };
}

async function main() {
  const routeApi = await buildApiRouter();
  const server = http.createServer(async (req, res) => {
    try {
      if ((req.url || '').startsWith('/api/')) {
        const handled = await routeApi(req, res);
        if (handled) return;
      }
      await serveStatic(req, res);
    } catch (error) {
      sendJson(res, 500, { error: error?.message || 'Server failed.' });
    }
  });

  server.listen(PORT, HOST, () => {
    console.log(`AtticRadar server running at http://${HOST}:${PORT}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
