/**
 * Google Sheet → map JSON sync
 * Tabs: 서핑스팟, 숙소, 서핑샵강습게하
 *
 * Coordinates: match existing spots by name first, then Nominatim geocode
 * for new addresses. Cache in data/coords-cache.json.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const SHEET_ID = "1mEVtl-VkfA0nzFCS-w9KuZGnA0tyZP2A-MkG_M928Hg";
const tabs = {
  spots: "서핑스팟",
  stays: "숙소",
  shops: "서핑샵강습게하",
};

const REGION_WIND = { 동해: 270, 남해: 0, 제주: 0, 서해: 90 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function sheetCsvUrl(name) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (q) {
      if (c === '"' && n === '"') {
        cell += '"';
        i++;
      } else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && n === "\n") i++;
      row.push(cell);
      if (row.some((x) => String(x).trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell.length || row.length) {
    row.push(cell);
    if (row.some((x) => String(x).trim())) rows.push(row);
  }
  return rows;
}

function normName(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/해수욕장/g, "해변")
    .replace(/[()（）·\-_]/g, "");
}

function slugify(name, fallbackId) {
  const base = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `spot-${fallbackId}`;
}

function inferRegionFromText(text) {
  const t = String(text || "");
  if (/제주|애월|중문|표선|성산|함덕|협재|월정|사계|하귀/.test(t)) return "제주";
  // 울산·포항은 동해 서핑권
  if (/포항|경주|울진|영덕|울산|진하|일산|나사리|사천진|강릉|속초|양양|고성|삼척/.test(t)) return "동해";
  if (/부산|기장|송정|다대|경남|남해|통영|거제|여수|완도|진도|해남/.test(t)) return "남해";
  if (/인천|시흥|태안|대천|보령|서산|당진|강화|영종|을왕|왕산|무창포|서해/.test(t)) return "서해";
  if (/강원|동해시|울릉/.test(t)) return "동해";
  return "미분류";
}

function subRegionFromLocation(location, region) {
  const loc = String(location || "").trim();
  if (!loc) return region;
  const city = loc.split(/[\s/]/)[0];
  const prefix =
    region === "동해"
      ? /고성|속초|양양|강릉|동해|삼척|울진|영덕|포항|경주/.test(city)
        ? `강원 ${city}`
        : loc
      : region === "제주"
        ? `제주 ${city}`
        : region === "남해"
          ? loc
          : region === "서해"
            ? loc
            : loc;
  return prefix.length > 24 ? loc.slice(0, 24) : prefix;
}

function tokensFromLocation(location) {
  return String(location || "")
    .split(/[\s/,·]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .flatMap((t) => {
      // also try shorter beach tokens: 사천진 → 사천, 진하
      const extra = [];
      if (t.endsWith("진") && t.length >= 3) extra.push(t.slice(0, -1));
      if (t.length >= 4) extra.push(t.slice(-2));
      return [t, ...extra];
    });
}

function findBestSpot(spots, location) {
  const tokens = tokensFromLocation(location);
  if (!tokens.length) return null;
  let best = null;
  let bestScore = 0;
  for (const spot of spots) {
    const hay = `${spot.name} ${spot.subRegion} ${spot.zoneName || ""} ${spot.address || ""}`;
    let score = 0;
    for (const t of tokens) {
      if (hay.includes(t)) score += t.length >= 3 ? 2 : 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = spot;
    }
  }
  return bestScore > 0 ? best : null;
}

async function loadJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function geocode(query, cache) {
  const key = String(query || "").trim();
  if (!key) return null;
  if (cache[key]?.lat && cache[key]?.lng) return cache[key];
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=kr&q=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "SurfWikiKoreaSheetSync/1.0 (contact: surfwikikorea)" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || !data[0]) {
    cache[key] = { lat: null, lng: null, failed: true };
    return null;
  }
  const hit = {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
    display: data[0].display_name || "",
  };
  cache[key] = hit;
  await sleep(1100);
  return hit;
}

async function main() {
  const oldSpots = await loadJson(path.join(root, "data", "spots.json"), []);
  const cachePath = path.join(root, "data", "coords-cache.json");
  const cache = await loadJson(cachePath, {});
  const byOldName = new Map(oldSpots.map((s) => [normName(s.name), s]));

  const [spotsCsv, staysCsv, shopsCsv] = await Promise.all([
    fetch(sheetCsvUrl(tabs.spots)).then((r) => r.text()),
    fetch(sheetCsvUrl(tabs.stays)).then((r) => r.text()),
    fetch(sheetCsvUrl(tabs.shops)).then((r) => r.text()),
  ]);

  const spotRows = parseCsv(spotsCsv).slice(1);
  const stayRows = parseCsv(staysCsv).slice(1);
  const shopRows = parseCsv(shopsCsv).slice(1);

  const spots = [];
  const usedIds = new Set();
  let matched = 0;
  let geocoded = 0;
  let missingCoords = 0;

  for (const row of spotRows) {
    const idNum = String(row[0] || "").trim();
    const group = String(row[1] || "").trim();
    const zoneName = String(row[2] || "").trim();
    const regionRaw = String(row[3] || "").trim();
    const name = String(row[4] || "").trim();
    const address = String(row[5] || "").trim();
    if (!name) continue;

    const region = ["동해", "남해", "제주", "서해"].includes(regionRaw)
      ? regionRaw
      : inferRegionFromText(`${regionRaw} ${zoneName} ${address} ${name}`);

    const old = byOldName.get(normName(name));
    let lat = old?.lat;
    let lng = old?.lng;
    let source = old ? "legacy-name" : "";

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const hit = await geocode(address || name, cache);
      if (hit?.lat && hit?.lng) {
        lat = hit.lat;
        lng = hit.lng;
        source = "geocode";
        geocoded += 1;
      } else {
        missingCoords += 1;
        source = "missing";
      }
    } else matched += 1;

    let id = old?.id || slugify(name, idNum);
    if (usedIds.has(id)) id = `${id}-${idNum}`;
    usedIds.add(id);

    const subRegion =
      old?.subRegion ||
      (zoneName ? zoneName.replace(/\s*\(.*\)\s*/g, "").trim() : subRegionFromLocation(name, region));

    spots.push({
      id,
      name,
      region,
      subRegion,
      lat: Number.isFinite(lat) ? Number(lat) : null,
      lng: Number.isFinite(lng) ? Number(lng) : null,
      bottomType: old?.bottomType || "모래 (Sand)",
      optimalWindDir: Number.isFinite(old?.optimalWindDir)
        ? old.optimalWindDir
        : REGION_WIND[region] ?? 270,
      difficulty: old?.difficulty || "All",
      description:
        old?.description ||
        `${zoneName || subRegion} 권역 서핑 스팟. 시트 기준으로 관리됩니다.`,
      group,
      zoneName,
      address,
      sheetNo: Number(idNum) || spots.length + 1,
      _coordSource: source,
    });
  }

  const spotsWithCoords = spots.filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng));

  function placeNear(location, regionHint) {
    const region = regionHint || inferRegionFromText(location);
    const pool = spotsWithCoords.filter((s) => s.region === region);
    let hit = findBestSpot(pool.length ? pool : spotsWithCoords, location);
    if (!hit) hit = findBestSpot(spotsWithCoords, location);
    if (hit) {
      const n = (location.length % 7) - 3;
      return {
        lat: hit.lat + n * 0.0012,
        lng: hit.lng + ((location.length % 5) - 2) * 0.0012,
        region: hit.region,
        subRegion: hit.subRegion,
        nearSpotId: hit.id,
        nearSpotName: hit.name,
      };
    }
    return { lat: null, lng: null, region, subRegion: subRegionFromLocation(location, region) };
  }

  const stays = [];
  for (const row of stayRows) {
    const no = String(row[0] || "").trim();
    const group = String(row[1] || "").trim();
    const location = String(row[2] || "").trim();
    const name = String(row[3] || "").trim();
    const bookingUrl = String(row[4] || "").trim();
    if (!name || !bookingUrl) continue;
    const placed = placeNear(location);
    stays.push({
      id: `stay-${no || stays.length + 1}`,
      name,
      region: placed.region,
      subRegion: placed.subRegion || location,
      location,
      group,
      desc: `${location} 인근 서핑 숙소`,
      bookingUrl,
      localSiteUrl: bookingUrl,
      couponUrl: bookingUrl,
      address: location,
      lat: placed.lat,
      lng: placed.lng,
      nearSpotId: placed.nearSpotId || "",
      nearSpotName: placed.nearSpotName || "",
      image: "",
    });
  }

  const shops = [];
  for (const row of shopRows) {
    const no = String(row[0] || "").trim();
    const group = String(row[1] || "").trim();
    const location = String(row[2] || "").trim();
    const name = String(row[3] || "").trim();
    const type = String(row[4] || "").trim() || "서핑샵";
    const bookingUrl = String(row[5] || "").trim();
    if (!name || !bookingUrl) continue;
    const placed = placeNear(location);
    shops.push({
      id: `shop-${no || shops.length + 1}`,
      name,
      type,
      region: placed.region,
      subRegion: placed.subRegion || location,
      location,
      group,
      desc: type,
      bookingUrl,
      address: location,
      lat: placed.lat,
      lng: placed.lng,
      nearSpotId: placed.nearSpotId || "",
      nearSpotName: placed.nearSpotName || "",
    });
  }

  const publicSpots = spots.map(({ _coordSource, ...rest }) => rest);
  await fs.mkdir(path.join(root, "data"), { recursive: true });
  await fs.writeFile(path.join(root, "data", "spots.json"), `${JSON.stringify(publicSpots, null, 2)}\n`);
  await fs.writeFile(path.join(root, "data", "accommodations.json"), `${JSON.stringify(stays, null, 2)}\n`);
  await fs.writeFile(path.join(root, "data", "shops.json"), `${JSON.stringify(shops, null, 2)}\n`);
  await fs.writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`);

  const stayMapped = stays.filter((s) => Number.isFinite(s.lat)).length;
  const shopMapped = shops.filter((s) => Number.isFinite(s.lat)).length;
  console.log(
    JSON.stringify(
      {
        spots: publicSpots.length,
        spotsWithCoords: spotsWithCoords.length,
        matchedLegacy: matched,
        geocoded,
        missingCoords,
        stays: stays.length,
        staysMapped: stayMapped,
        shops: shops.length,
        shopsMapped: shopMapped,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
