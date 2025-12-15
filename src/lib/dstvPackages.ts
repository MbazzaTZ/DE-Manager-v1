// Tanzania DSTV Packages
export const DSTV_PACKAGES = [
  { value: "premium", label: "DStv Premium", price: 189000 },
  { value: "compact_plus", label: "DStv Compact Plus", price: 118000 },
  { value: "compact", label: "DStv Compact", price: 68000 },
  { value: "family", label: "DStv Family", price: 40000 },
  { value: "access", label: "DStv Access", price: 27500 },
 

] as const;

export type DstvPackage = typeof DSTV_PACKAGES[number]["value"];
