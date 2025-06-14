// src/lib/hsn-sac-data.ts
// Comprehensive HSN/SAC codes data for Indian businesses

export interface HsnSacCodeData {
    code: string;
    type: 'HSN' | 'SAC';
    description: string;
    category: string;
    subCategory?: string;
    gstRate: number;
    unitOfMeasurement: string;
  }
  
  export const commonHsnSacCodes: HsnSacCodeData[] = [
    // HSN Codes - Goods
    {
      code: "1001",
      type: "HSN",
      description: "Wheat and meslin",
      category: "Agricultural Products",
      subCategory: "Cereals",
      gstRate: 0,
      unitOfMeasurement: "KGS"
    },
    {
      code: "1006",
      type: "HSN", 
      description: "Rice",
      category: "Agricultural Products",
      subCategory: "Cereals",
      gstRate: 5,
      unitOfMeasurement: "KGS"
    },
    {
      code: "1701",
      type: "HSN",
      description: "Cane or beet sugar and chemically pure sucrose, in solid form",
      category: "Food Products",
      subCategory: "Sugar and Confectionery",
      gstRate: 5,
      unitOfMeasurement: "KGS"
    },
    {
      code: "2207",
      type: "HSN",
      description: "Undenatured ethyl alcohol of an alcoholic strength by volume of 80% vol or higher",
      category: "Beverages",
      subCategory: "Alcoholic Beverages",
      gstRate: 28,
      unitOfMeasurement: "LTR"
    },
    {
      code: "2710",
      type: "HSN",
      description: "Petroleum oils and oils obtained from bituminous minerals, other than crude",
      category: "Fuels",
      subCategory: "Petroleum Products",
      gstRate: 28,
      unitOfMeasurement: "LTR"
    },
    {
      code: "3004",
      type: "HSN",
      description: "Medicaments consisting of mixed or unmixed products for therapeutic or prophylactic uses",
      category: "Pharmaceuticals",
      subCategory: "Medicines",
      gstRate: 12,
      unitOfMeasurement: "NOS"
    },
    {
      code: "3926",
      type: "HSN",
      description: "Other articles of plastics and articles of other materials of headings 39.01 to 39.14",
      category: "Plastics",
      subCategory: "Plastic Articles",
      gstRate: 18,
      unitOfMeasurement: "NOS"
    },
    {
      code: "4901",
      type: "HSN",
      description: "Printed books, brochures, leaflets and similar printed matter",
      category: "Paper Products",
      subCategory: "Printed Materials",
      gstRate: 12,
      unitOfMeasurement: "NOS"
    },
    {
      code: "4911",
      type: "HSN",
      description: "Other printed matter, including printed pictures and photographs",
      category: "Paper Products",
      subCategory: "Printed Materials",
      gstRate: 12,
      unitOfMeasurement: "NOS"
    },
    {
      code: "5208",
      type: "HSN",
      description: "Woven fabrics of cotton",
      category: "Textiles",
      subCategory: "Cotton Fabrics",
      gstRate: 5,
      unitOfMeasurement: "MTR"
    },
    {
      code: "6109",
      type: "HSN",
      description: "T-shirts, singlets and other vests, knitted or crocheted",
      category: "Apparel",
      subCategory: "Knitted Garments",
      gstRate: 12,
      unitOfMeasurement: "NOS"
    },
    {
      code: "6204",
      type: "HSN",
      description: "Women's or girls' suits, ensembles, jackets, blazers, dresses, skirts",
      category: "Apparel",
      subCategory: "Women's Clothing",
      gstRate: 12,
      unitOfMeasurement: "NOS"
    },
    {
      code: "6403",
      type: "HSN",
      description: "Footwear with outer soles of rubber, plastics, leather",
      category: "Footwear",
      subCategory: "Shoes",
      gstRate: 18,
      unitOfMeasurement: "PAIRS"
    },
    {
      code: "7323",
      type: "HSN",
      description: "Table, kitchen or other household articles of iron or steel",
      category: "Metal Products",
      subCategory: "Household Items",
      gstRate: 18,
      unitOfMeasurement: "NOS"
    },
    {
      code: "8471",
      type: "HSN",
      description: "Automatic data processing machines and units thereof",
      category: "Electronics",
      subCategory: "Computers",
      gstRate: 18,
      unitOfMeasurement: "NOS"
    },
    {
      code: "8517",
      type: "HSN",
      description: "Telephone sets, including telephones for cellular networks",
      category: "Electronics",
      subCategory: "Telecommunications",
      gstRate: 12,
      unitOfMeasurement: "NOS"
    },
    {
      code: "8703",
      type: "HSN",
      description: "Motor cars and other motor vehicles for transport of persons",
      category: "Automobiles",
      subCategory: "Passenger Vehicles",
      gstRate: 28,
      unitOfMeasurement: "NOS"
    },
    {
      code: "9403",
      type: "HSN",
      description: "Other furniture and parts thereof",
      category: "Furniture",
      subCategory: "Office Furniture",
      gstRate: 18,
      unitOfMeasurement: "NOS"
    },
    {
      code: "9615",
      type: "HSN",
      description: "Combs, hair-slides and the like; hairpins, curling pins",
      category: "Personal Care",
      subCategory: "Hair Accessories",
      gstRate: 18,
      unitOfMeasurement: "NOS"
    },
  
    // SAC Codes - Services
    {
      code: "991111",
      type: "SAC",
      description: "Transport of goods by road",
      category: "Transportation",
      subCategory: "Goods Transport",
      gstRate: 5,
      unitOfMeasurement: "KMS"
    },
    {
      code: "991211",
      type: "SAC",
      description: "Transport of passengers by road",
      category: "Transportation",
      subCategory: "Passenger Transport",
      gstRate: 5,
      unitOfMeasurement: "KMS"
    },
    {
      code: "996511",
      type: "SAC",
      description: "Advertising services",
      category: "Business Services",
      subCategory: "Marketing Services",
      gstRate: 18,
      unitOfMeasurement: "NOS"
    },
    {
      code: "997212",
      type: "SAC",
      description: "Architectural services",
      category: "Professional Services",
      subCategory: "Architectural Services",
      gstRate: 18,
      unitOfMeasurement: "NOS"
    },
    {
      code: "997213",
      type: "SAC",
      description: "Engineering services",
      category: "Professional Services",
      subCategory: "Engineering Services",
      gstRate: 18,
      unitOfMeasurement: "NOS"
    },
    {
      code: "998211",
      type: "SAC",
      description: "Information technology consulting services",
      category: "IT Services",
      subCategory: "Consulting",
      gstRate: 18,
      unitOfMeasurement: "HRS"
    },
    {
      code: "998212",
      type: "SAC",
      description: "Information technology design and development services",
      category: "IT Services",
      subCategory: "Development",
      gstRate: 18,
      unitOfMeasurement: "NOS"
    },
    {
      code: "998213",
      type: "SAC",
      description: "Web design and development services",
      category: "IT Services",
      subCategory: "Web Development",
      gstRate: 18,
      unitOfMeasurement: "NOS"
    },
    {
      code: "998214",
      type: "SAC",
      description: "Software implementation services",
      category: "IT Services",
      subCategory: "Implementation",
      gstRate: 18,
      unitOfMeasurement: "NOS"
    },
    {
      code: "998311",
      type: "SAC",
      description: "Data processing services",
      category: "IT Services",
      subCategory: "Data Processing",
      gstRate: 18,
      unitOfMeasurement: "NOS"
    },
    {
      code: "999599",
      type: "SAC",
      description: "Business auxiliary services not elsewhere classified",
      category: "Business Services",
      subCategory: "Other Business Services",
      gstRate: 18,
      unitOfMeasurement: "NOS"
    },
    {
      code: "997311",
      type: "SAC",
      description: "Legal services",
      category: "Professional Services",
      subCategory: "Legal Services",
      gstRate: 18,
      unitOfMeasurement: "HRS"
    },
    {
      code: "997321",
      type: "SAC",
      description: "Accounting, bookkeeping and auditing services",
      category: "Professional Services",
      subCategory: "Accounting Services",
      gstRate: 18,
      unitOfMeasurement: "HRS"
    },
    {
      code: "996111",
      type: "SAC",
      description: "Insurance services",
      category: "Financial Services",
      subCategory: "Insurance",
      gstRate: 18,
      unitOfMeasurement: "NOS"
    },
    {
      code: "997331",
      type: "SAC",
      description: "Management consulting services",
      category: "Professional Services",
      subCategory: "Management Consulting",
      gstRate: 18,
      unitOfMeasurement: "HRS"
    },
    {
      code: "995411",
      type: "SAC",
      description: "Hotel and similar accommodation services",
      category: "Hospitality",
      subCategory: "Accommodation",
      gstRate: 12,
      unitOfMeasurement: "DAYS"
    },
    {
      code: "996331",
      type: "SAC",
      description: "Event management services",
      category: "Entertainment",
      subCategory: "Event Services",
      gstRate: 18,
      unitOfMeasurement: "NOS"
    },
    {
      code: "997111",
      type: "SAC",
      description: "Maintenance and repair of motor vehicles",
      category: "Repair Services",
      subCategory: "Vehicle Repair",
      gstRate: 18,
      unitOfMeasurement: "NOS"
    },
    {
      code: "994611",
      type: "SAC",
      description: "Construction services of buildings",
      category: "Construction",
      subCategory: "Building Construction",
      gstRate: 12,
      unitOfMeasurement: "SQM"
    },
    {
      code: "998919",
      type: "SAC",
      description: "Other professional, technical and business services",
      category: "Professional Services",
      subCategory: "Other Professional Services",
      gstRate: 18,
      unitOfMeasurement: "HRS"
    }
  ];
  
  // Unit of measurement options commonly used in India
  export const unitOfMeasurementOptions = [
    { value: "NOS", label: "Numbers (NOS)" },
    { value: "KGS", label: "Kilograms (KGS)" },
    { value: "MTR", label: "Meters (MTR)" },
    { value: "LTR", label: "Liters (LTR)" },
    { value: "SQM", label: "Square Meters (SQM)" },
    { value: "CUM", label: "Cubic Meters (CUM)" },
    { value: "HRS", label: "Hours (HRS)" },
    { value: "DAYS", label: "Days (DAYS)" },
    { value: "PAIRS", label: "Pairs (PAIRS)" },
    { value: "SETS", label: "Sets (SETS)" },
    { value: "KMS", label: "Kilometers (KMS)" },
    { value: "TON", label: "Metric Tons (TON)" },
    { value: "GMS", label: "Grams (GMS)" },
    { value: "ML", label: "Milliliters (ML)" },
    { value: "BOXES", label: "Boxes (BOXES)" },
    { value: "CARTONS", label: "Cartons (CARTONS)" },
    { value: "PACKETS", label: "Packets (PACKETS)" },
    { value: "BUNDLES", label: "Bundles (BUNDLES)" },
    { value: "ROLLS", label: "Rolls (ROLLS)" },
    { value: "SHEETS", label: "Sheets (SHEETS)" }
  ];
  
  // GST rate options as per Indian GST law
  export const gstRateOptions = [
    { value: 0, label: "0% - Exempted" },
    { value: 5, label: "5% - Essential goods" },
    { value: 12, label: "12% - Standard goods" },
    { value: 18, label: "18% - Most goods/services" },
    { value: 28, label: "28% - Luxury items" }
  ];
  
  // Common item categories for easy classification
  export const itemCategories = [
    "Agricultural Products",
    "Food Products", 
    "Beverages",
    "Textiles",
    "Apparel",
    "Footwear",
    "Electronics",
    "Automobiles",
    "Furniture",
    "Pharmaceuticals",
    "Cosmetics",
    "Plastics",
    "Metal Products",
    "Paper Products",
    "IT Services",
    "Professional Services",
    "Business Services",
    "Transportation",
    "Hospitality",
    "Construction",
    "Financial Services",
    "Entertainment",
    "Repair Services",
    "Personal Care",
    "Fuels",
    "Others"
  ];
  
  // Helper function to search HSN/SAC codes
  export function searchHsnSacCodes(query: string, type?: 'HSN' | 'SAC'): HsnSacCodeData[] {
    const searchTerm = query.toLowerCase();
    return commonHsnSacCodes.filter(item => {
      const matchesType = !type || item.type === type;
      const matchesQuery = 
        item.code.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm) ||
        (item.subCategory && item.subCategory.toLowerCase().includes(searchTerm));
      
      return matchesType && matchesQuery;
    });
  }
  
  // Helper function to get HSN/SAC code by exact code
  export function getHsnSacByCode(code: string): HsnSacCodeData | undefined {
    return commonHsnSacCodes.find(item => item.code === code);
  }