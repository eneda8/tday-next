/**
 * Client-safe utility functions for t'day
 */

/**
 * Convert a 2-letter country code to emoji flag.
 * "US" → "🇺🇸", "AL" → "🇦🇱"
 */
export function codeToFlag(code: string): string {
  if (!code || code.length !== 2) return "";
  const codePoints = code
    .toUpperCase()
    .split("")
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

/**
 * Convert old-style flag path "/images/flags/US.png" to emoji flag.
 * Also handles already-emoji strings and plain 2-letter codes.
 */
export function flagToEmoji(flag: string): string {
  if (!flag) return "";
  if (flag.codePointAt(0)! > 127) return flag;
  const pathMatch = flag.match(/\/([A-Z]{2})\.png$/i);
  if (pathMatch) return codeToFlag(pathMatch[1]);
  if (/^[A-Z]{2}$/i.test(flag)) return codeToFlag(flag);
  return flag;
}

/**
 * Get Cloudinary thumbnail URL from avatar path.
 */
export function avatarThumbnail(path: string | undefined): string {
  if (!path) return "";
  return path.replace("/upload", "/upload/w_40,h_40,c_thumb,c_fill,r_max");
}

/**
 * Check if a date is within 24 hours of now (client-safe version).
 */
export function within24Hours(createdAt: Date | string): boolean {
  const now = new Date().getTime();
  const then = new Date(createdAt).getTime();
  return now - then < 86400000;
}

/**
 * Map full country names (as stored in the DB) to emoji flags.
 */
const COUNTRY_TO_CODE: Record<string, string> = {
  "Afghanistan": "AF", "Albania": "AL", "Algeria": "DZ", "Andorra": "AD",
  "Angola": "AO", "Antigua and Barbuda": "AG", "Argentina": "AR", "Armenia": "AM",
  "Australia": "AU", "Austria": "AT", "Azerbaijan": "AZ", "Bahamas": "BS",
  "Bahrain": "BH", "Bangladesh": "BD", "Barbados": "BB", "Belarus": "BY",
  "Belgium": "BE", "Belize": "BZ", "Benin": "BJ", "Bhutan": "BT",
  "Bolivia": "BO", "Bosnia and Herzegovina": "BA", "Botswana": "BW", "Brazil": "BR",
  "Brunei": "BN", "Bulgaria": "BG", "Burkina Faso": "BF", "Burundi": "BI",
  "Cabo Verde": "CV", "Cambodia": "KH", "Cameroon": "CM", "Canada": "CA",
  "Central African Republic": "CF", "Chad": "TD", "Chile": "CL", "China": "CN",
  "Colombia": "CO", "Comoros": "KM", "Congo": "CG",
  "Congo, Democratic Republic of the": "CD", "Costa Rica": "CR", "Croatia": "HR",
  "Cuba": "CU", "Cyprus": "CY", "Czech Republic": "CZ", "Czechia": "CZ",
  "Denmark": "DK", "Djibouti": "DJ", "Dominica": "DM", "Dominican Republic": "DO",
  "Ecuador": "EC", "Egypt": "EG", "El Salvador": "SV", "Equatorial Guinea": "GQ",
  "Eritrea": "ER", "Estonia": "EE", "Eswatini": "SZ", "Ethiopia": "ET",
  "Fiji": "FJ", "Finland": "FI", "France": "FR", "Gabon": "GA", "Gambia": "GM",
  "Georgia": "GE", "Germany": "DE", "Ghana": "GH", "Greece": "GR",
  "Grenada": "GD", "Guatemala": "GT", "Guinea": "GN", "Guinea-Bissau": "GW",
  "Guyana": "GY", "Haiti": "HT", "Honduras": "HN", "Hungary": "HU",
  "Iceland": "IS", "India": "IN", "Indonesia": "ID", "Iran": "IR", "Iraq": "IQ",
  "Ireland": "IE", "Israel": "IL", "Italy": "IT", "Ivory Coast": "CI",
  "Jamaica": "JM", "Japan": "JP", "Jordan": "JO", "Kazakhstan": "KZ",
  "Kenya": "KE", "Kiribati": "KI", "Kosovo": "XK", "Kuwait": "KW",
  "Kyrgyzstan": "KG", "Laos": "LA", "Latvia": "LV", "Lebanon": "LB",
  "Lesotho": "LS", "Liberia": "LR", "Libya": "LY", "Liechtenstein": "LI",
  "Lithuania": "LT", "Luxembourg": "LU", "Madagascar": "MG", "Malawi": "MW",
  "Malaysia": "MY", "Maldives": "MV", "Mali": "ML", "Malta": "MT",
  "Marshall Islands": "MH", "Mauritania": "MR", "Mauritius": "MU", "Mexico": "MX",
  "Micronesia": "FM", "Moldova": "MD", "Monaco": "MC", "Mongolia": "MN",
  "Montenegro": "ME", "Morocco": "MA", "Mozambique": "MZ", "Myanmar": "MM",
  "Namibia": "NA", "Nauru": "NR", "Nepal": "NP", "Netherlands": "NL",
  "New Zealand": "NZ", "Nicaragua": "NI", "Niger": "NE", "Nigeria": "NG",
  "North Korea": "KP", "North Macedonia": "MK", "Norway": "NO", "Oman": "OM",
  "Pakistan": "PK", "Palau": "PW", "Palestine": "PS", "Panama": "PA",
  "Papua New Guinea": "PG", "Paraguay": "PY", "Peru": "PE", "Philippines": "PH",
  "Poland": "PL", "Portugal": "PT", "Qatar": "QA", "Romania": "RO",
  "Russia": "RU", "Rwanda": "RW", "Saint Kitts and Nevis": "KN",
  "Saint Lucia": "LC", "Saint Vincent and the Grenadines": "VC", "Samoa": "WS",
  "San Marino": "SM", "Sao Tome and Principe": "ST", "Saudi Arabia": "SA",
  "Senegal": "SN", "Serbia": "RS", "Seychelles": "SC", "Sierra Leone": "SL",
  "Singapore": "SG", "Slovakia": "SK", "Slovenia": "SI", "Solomon Islands": "SB",
  "Somalia": "SO", "South Africa": "ZA", "South Korea": "KR", "South Sudan": "SS",
  "Spain": "ES", "Sri Lanka": "LK", "Sudan": "SD", "Suriname": "SR",
  "Sweden": "SE", "Switzerland": "CH", "Syria": "SY", "Taiwan": "TW",
  "Tajikistan": "TJ", "Tanzania": "TZ", "Thailand": "TH", "Timor-Leste": "TL",
  "Togo": "TG", "Tonga": "TO", "Trinidad and Tobago": "TT", "Tunisia": "TN",
  "Turkey": "TR", "Turkmenistan": "TM", "Tuvalu": "TV", "Uganda": "UG",
  "Ukraine": "UA", "United Arab Emirates": "AE", "United Kingdom": "GB",
  "United States": "US", "United States of America": "US", "Uruguay": "UY",
  "Uzbekistan": "UZ", "Vanuatu": "VU", "Vatican City": "VA", "Venezuela": "VE",
  "Vietnam": "VN", "Yemen": "YE", "Zambia": "ZM", "Zimbabwe": "ZW",
  // Common alternate names
  "USA": "US", "UK": "GB", "UAE": "AE", "South Korea, Republic of": "KR",
  "Korea, Republic of": "KR", "Russian Federation": "RU",
  "Iran, Islamic Republic of": "IR", "Cote d'Ivoire": "CI",
  "Côte d'Ivoire": "CI", "Türkiye": "TR",
};

export function countryNameToEmoji(name: string): string {
  if (!name) return "";
  // Check direct match
  const code = COUNTRY_TO_CODE[name];
  if (code) return codeToFlag(code);
  // Case-insensitive search
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(COUNTRY_TO_CODE)) {
    if (key.toLowerCase() === lower) return codeToFlag(val);
  }
  // Try as 2-letter code directly
  if (/^[A-Z]{2}$/i.test(name)) return codeToFlag(name);
  return "";
}
