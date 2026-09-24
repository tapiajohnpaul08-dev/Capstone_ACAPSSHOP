// src/composables/usePhilippineAddress.js
import { ref, computed } from 'vue'
import {
  getAllRegions,
  getProvincesByRegion,
  getMunicipalitiesByProvince,
  getBarangaysByMunicipality,
} from '@aivangogh/ph-address'

// ─── ISLAND GROUP → PSGC REGION CODES ────────────────────────────────────
// These are the modern 10-digit PSGC codes.
// If the package you install uses a different code system, swap these out
// (or use name matching — see `ISLAND_GROUP_REGION_NAMES` below).
const ISLAND_GROUP_REGION_CODES = {
  Luzon: [
    '1300000000', // National Capital Region
    '1400000000', // Cordillera Administrative Region
    '0100000000', // Region I  – Ilocos Region
    '0200000000', // Region II – Cagayan Valley
    '0300000000', // Region III – Central Luzon
    '0400000000', // Region IV-A – CALABARZON
    '1700000000', // Region IV-B – MIMAROPA
    '0500000000', // Region V  – Bicol Region
  ],
  Visayas: [
    '0600000000', // Region VI – Western Visayas
    '0700000000', // Region VII – Central Visayas
    '0800000000', // Region VIII – Eastern Visayas
  ],
  Mindanao: [
    '0900000000', // Region IX – Zamboanga Peninsula
    '1000000000', // Region X  – Northern Mindanao
    '1100000000', // Region XI – Davao Region
    '1200000000', // Region XII – SOCCSKSARGEN
    '1600000000', // Region XIII – Caraga
    '1900000000', // BARMM
  ],
}

// Fallback name matching — used if a region code isn't found in the package.
const ISLAND_GROUP_REGION_NAMES = {
  Luzon: [
    'national capital region',
    'ncr',
    'cordillera administrative region',
    'car',
    'ilocos region',
    'region i',
    'cagayan valley',
    'region ii',
    'central luzon',
    'region iii',
    'calabarzon',
    'region iv-a',
    'mimaropa',
    'region iv-b',
    'bicol region',
    'region v',
  ],
  Visayas: [
    'western visayas',
    'region vi',
    'central visayas',
    'region vii',
    'eastern visayas',
    'region viii',
  ],
  Mindanao: [
    'zamboanga peninsula',
    'region ix',
    'northern mindanao',
    'region x',
    'davao region',
    'region xi',
    'soccsksargen',
    'region xii',
    'caraga',
    'region xiii',
    'bangsamoro autonomous region in muslim mindanao',
    'barmm',
  ],
}

// Regions with no provinces in the PSGC hierarchy.
// We surface a synthetic "province" entry so the dropdown is never empty,
// and route the municipality lookup through the region code instead.
const PROVINCELESS_REGIONS = {
  '1300000000': 'Metro Manila',
}

// ─── NORMALIZER ──────────────────────────────────────────────────────────
// The package may use different field names across versions. Normalize
// everything to { code, name } so the rest of the code is stable.
function normalizeList(list) {
  if (!Array.isArray(list)) return []
  return list
    .map((item) => ({
      code:
        item.psgcCode ||
        item.code ||
        item.province_code ||
        item.municipality_code ||
        item.barangay_code ||
        item.region_code ||
        '',
      name:
        item.name ||
        item.province_name ||
        item.municipality_name ||
        item.barangay_name ||
        item.region_name ||
        '',
    }))
    .filter((item) => item.code && item.name)
}

// ─── COMPOSABLE ──────────────────────────────────────────────────────────
export function usePhilippineAddress() {
  const provinces = ref([])
  const cities = ref([])
  const barangays = ref([])

  const loadingProvinces = ref(false)
  const loadingCities = ref(false)
  const loadingBarangays = ref(false)

  const errorMessage = ref('')

  const hasProvinces = computed(() => provinces.value.length > 0)

  // ── LOAD PROVINCES BY ISLAND GROUP ─────────────────────────────────────
  async function loadProvincesByIslandGroup(islandGroup) {
    loadingProvinces.value = true
    errorMessage.value = ''
    try {
      const regionCodes = ISLAND_GROUP_REGION_CODES[islandGroup] || []
      const regionNames = ISLAND_GROUP_REGION_NAMES[islandGroup] || []
      const collected = []

      // Try code-based lookup first.
      let matchedAny = false

      for (const regionCode of regionCodes) {
        // Province-less region → synthesize entry.
        if (PROVINCELESS_REGIONS[regionCode]) {
          collected.push({
            code: regionCode,
            name: PROVINCELESS_REGIONS[regionCode],
            isProvinceLess: true,
          })
          matchedAny = true
          continue
        }

        try {
          const list = normalizeList(getProvincesByRegion(regionCode))
          if (list.length) {
            collected.push(...list)
            matchedAny = true
          }
        } catch {
          // Skip silently — we may fall back to name matching below.
        }
      }

      // Name-based fallback if codes didn't match anything.
      if (!matchedAny) {
        const allRegions = normalizeList(getAllRegions())
        const targetRegions = allRegions.filter((r) =>
          regionNames.includes(r.name.trim().toLowerCase())
        )
        for (const region of targetRegions) {
          try {
            const list = normalizeList(getProvincesByRegion(region.code))
            collected.push(...list)
          } catch {
            /* ignore */
          }
        }
      }

      // De-duplicate by code (some packages alias region names).
      const seen = new Set()
      const unique = collected.filter((p) => {
        if (seen.has(p.code)) return false
        seen.add(p.code)
        return true
      })

      unique.sort((a, b) => a.name.localeCompare(b.name))
      provinces.value = unique
      cities.value = []
      barangays.value = []
    } catch (err) {
      console.error('[usePhilippineAddress] loadProvincesByIslandGroup failed:', err)
      errorMessage.value =
        'Unable to load province data. You can enter your address manually instead.'
      provinces.value = []
    } finally {
      loadingProvinces.value = false
    }
  }

  // ── LOAD CITIES ────────────────────────────────────────────────────────
  /**
   * @param {Object} params
   * @param {string} [params.provinceCode] — PSGC code of the province
   * @param {string} [params.regionCode]   — PSGC code of the region
   *
   * For province-less regions (e.g. NCR) the "province" entry's code
   * IS the region code, so passing it as provinceCode works fine.
   */
  async function loadCities({ provinceCode, regionCode } = {}) {
    loadingCities.value = true
    errorMessage.value = ''
    try {
      const code = provinceCode || regionCode
      if (!code) {
        cities.value = []
        barangays.value = []
        return
      }
      cities.value = normalizeList(getMunicipalitiesByProvince(code))
      cities.value.sort((a, b) => a.name.localeCompare(b.name))
      barangays.value = []
    } catch (err) {
      console.error('[usePhilippineAddress] loadCities failed:', err)
      errorMessage.value =
        'Unable to load city data. You can enter your address manually instead.'
      cities.value = []
    } finally {
      loadingCities.value = false
    }
  }

  // ── LOAD BARANGAYS ─────────────────────────────────────────────────────
  async function loadBarangays(municipalityCode) {
    loadingBarangays.value = true
    errorMessage.value = ''
    try {
      if (!municipalityCode) {
        barangays.value = []
        return
      }
      barangays.value = normalizeList(getBarangaysByMunicipality(municipalityCode))
      barangays.value.sort((a, b) => a.name.localeCompare(b.name))
    } catch (err) {
      console.error('[usePhilippineAddress] loadBarangays failed:', err)
      errorMessage.value =
        'Unable to load barangay data. You can enter your address manually instead.'
      barangays.value = []
    } finally {
      loadingBarangays.value = false
    }
  }

  // ── HELPERS ────────────────────────────────────────────────────────────
  function findByName(list, name) {
    if (!name) return undefined
    const needle = name.trim().toLowerCase()
    return list.find((item) => item.name?.trim().toLowerCase() === needle)
  }

  function resetBelow(level) {
    if (level === 'region') {
      provinces.value = []
      cities.value = []
      barangays.value = []
    } else if (level === 'province') {
      cities.value = []
      barangays.value = []
    } else if (level === 'municipality') {
      barangays.value = []
    }
  }

  return {
    // state
    provinces,
    cities,
    barangays,
    loadingProvinces,
    loadingCities,
    loadingBarangays,
    errorMessage,

    // derived
    hasProvinces,

    // actions
    loadProvincesByIslandGroup,
    loadCities,
    loadBarangays,

    // helpers
    findByName,
    resetBelow,
  }
}