export interface Accord {
  name: string;
  value: number;
  color: string;
}

export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface FragranceDNA {
  description: string;
  accords: Accord[];
  notes: FragranceNotes;
}

const DNA_DICTIONARY: Record<string, FragranceDNA> = {
  "hawas ice": {
    description: "A vibrant, icy blast of crisp apple and sweet plum that settles into a refreshing, mossy-wood finish. It is pure, mouth-watering energy built for the peak heat.",
    accords: [
      { name: "Fruity", value: 100, color: "fruity" },
      { name: "Citrus", value: 90, color: "citrus" },
      { name: "Sweet", value: 85, color: "sweet" },
      { name: "Fresh", value: 80, color: "fresh" },
      { name: "Aromatic", value: 75, color: "aromatic" },
      { name: "Musky", value: 65, color: "musky" },
      { name: "Powdery", value: 55, color: "powdery" },
      { name: "Fresh Spicy", value: 45, color: "fresh_spicy" },
      { name: "Green", value: 35, color: "green" },
      { name: "White Floral", value: 25, color: "white_floral" }
    ],
    notes: {
      top: ["Apple", "Italian Lemon", "Sicilian Bergamot", "Star Anise"],
      heart: ["Plum", "Orange Blossom", "Cardamon"],
      base: ["Musk", "Amber", "Driftwood", "Moss"]
    }
  },
  "hawas kobra": {
    description: "An invigorating, sharp strike of zesty ginger, sparkling citrus, and green tea, wrapped elegantly in a smooth, musky amber base.",
    accords: [
      { name: "Citrus", value: 100, color: "citrus" },
      { name: "Fresh Spicy", value: 90, color: "fresh_spicy" },
      { name: "Fresh", value: 80, color: "fresh" },
      { name: "Musky", value: 75, color: "musky" },
      { name: "Woody", value: 65, color: "woody" },
      { name: "Amber", value: 60, color: "amber" },
      { name: "Green", value: 50, color: "green" },
      { name: "Powdery", value: 45, color: "powdery" },
      { name: "Cinnamon", value: 35, color: "cinnamon" },
      { name: "Warm Spicy", value: 30, color: "warm_spicy" }
    ],
    notes: {
      top: ["Ginger", "Bergamot", "Tangerine"],
      heart: ["Green Tea", "Cinnamon", "Neroli"],
      base: ["Musk", "Woodsy Notes", "Amber"]
    }
  },
  "vulcan baie": {
    description: "A dark, boozy cocktail of crushed red berries, sharp vodka, and fresh rosemary, ultimately grounded by rich incense and sandalwood.",
    accords: [
      { name: "Fruity", value: 100, color: "fruity" },
      { name: "Sweet", value: 90, color: "sweet" },
      { name: "Aromatic", value: 80, color: "aromatic" },
      { name: "Fresh Spicy", value: 70, color: "fresh_spicy" },
      { name: "Woody", value: 60, color: "woody" },
      { name: "Vodka", value: 50, color: "vodka" }
    ],
    notes: {
      top: ["Blackberry", "Black Currant", "Rosemary", "Bergamot"],
      heart: ["Raspberry", "Vodka", "Basil", "Lily of the Valley"],
      base: ["Strawberry", "Musk", "Peach", "Amber", "Sandalwood", "Patchouli", "Incense"]
    }
  },
  "shiyaaka snow": {
    description: "A crisp, cooling rush of mandarin and pink pepper that dries down into a clean, earthy, and highly professional blend of cardamom and vetiver.",
    accords: [
      { name: "Citrus", value: 100, color: "citrus" },
      { name: "Fresh Spicy", value: 90, color: "fresh_spicy" },
      { name: "Aromatic", value: 85, color: "aromatic" },
      { name: "Warm Spicy", value: 75, color: "warm_spicy" },
      { name: "Soft Spicy", value: 70, color: "soft_spicy" },
      { name: "Woody", value: 60, color: "woody" },
      { name: "Floral", value: 55, color: "floral" },
      { name: "Green", value: 50, color: "green" },
      { name: "Earthy", value: 45, color: "earthy" },
      { name: "Musky", value: 40, color: "musky" }
    ],
    notes: {
      top: ["Bergamot", "Mandarin"],
      heart: ["Pink Pepper", "Nutmeg", "Neroli"],
      base: ["Cardamom", "Vetiver"]
    }
  },
  "liquid brun": {
    description: "A decadent, enveloping cloud of bourbon vanilla, roasted praline, and warm cinnamon. It is rich, exceptionally sweet, and undeniably cozy.",
    accords: [
      { name: "Sweet", value: 100, color: "sweet" },
      { name: "Warm Spicy", value: 95, color: "warm_spicy" },
      { name: "Vanilla", value: 85, color: "vanilla" },
      { name: "Cinnamon", value: 75, color: "cinnamon" },
      { name: "White Floral", value: 65, color: "white_floral" },
      { name: "Powdery", value: 60, color: "powdery" },
      { name: "Citrus", value: 55, color: "citrus" },
      { name: "Aromatic", value: 50, color: "aromatic" },
      { name: "Musky", value: 45, color: "musky" },
      { name: "Amber", value: 40, color: "amber" }
    ],
    notes: {
      top: ["Cinnamon", "Orange Blossom", "Cardamom", "Bergamot"],
      heart: ["Bourbon Vanilla", "Elemi"],
      base: ["Praline", "Ambroxan", "Guaiac Wood", "Musk"]
    }
  },
  "lion": {
    description: "A smooth, alluring contrast of fresh lavender and sweet pear, perfectly balanced by a warm, masculine foundation of vanilla and cedarwood.",
    accords: [
      { name: "Aromatic", value: 100, color: "aromatic" },
      { name: "Vanilla", value: 95, color: "vanilla" },
      { name: "Lavender", value: 85, color: "lavender" },
      { name: "Fresh Spicy", value: 80, color: "fresh_spicy" },
      { name: "Sweet", value: 70, color: "sweet" },
      { name: "Green", value: 65, color: "green" },
      { name: "Cinnamon", value: 60, color: "cinnamon" },
      { name: "Fruity", value: 55, color: "fruity" },
      { name: "Warm Spicy", value: 50, color: "warm_spicy" },
      { name: "Amber", value: 45, color: "amber" }
    ],
    notes: {
      top: ["Lavender", "Pear", "Mint", "Bergamot"],
      heart: ["Cinnamon", "Clary Sage", "Cumin"],
      base: ["Vanilla", "Amber", "Cedar", "Patchouli"]
    }
  },
  "elixir": {
    description: "A creamy, herbaceous dream where fresh mint and clean lavender melt seamlessly into a deeply rich, sweet base of tonka bean and vanilla.",
    accords: [
      { name: "Vanilla", value: 100, color: "vanilla" },
      { name: "Aromatic", value: 65, color: "aromatic" },
      { name: "Amber", value: 60, color: "amber" },
      { name: "Green", value: 55, color: "green" },
      { name: "Fresh Spicy", value: 50, color: "fresh_spicy" },
      { name: "Lavender", value: 45, color: "lavender" },
      { name: "Sweet", value: 40, color: "sweet" },
      { name: "Warm Spicy", value: 35, color: "warm_spicy" }
    ],
    notes: {
      top: ["Mint", "Bergamot"],
      heart: ["Lavender", "Benzoin"],
      base: ["Vanilla", "Tonka"]
    }
  },
  "obsidian": {
    description: "A commanding and powdery leather fragrance accented with rich iris, deeply rooted in earthy woods and subtle musks.",
    accords: [
      { name: "Woody", value: 100, color: "woody" },
      { name: "Iris", value: 98, color: "iris" },
      { name: "Powdery", value: 95, color: "powdery" },
      { name: "Violet", value: 78, color: "violet" },
      { name: "Leather", value: 78, color: "leather" },
      { name: "Earthy", value: 72, color: "earthy" },
      { name: "Floral", value: 68, color: "floral" },
      { name: "Musky", value: 67, color: "musky" },
      { name: "Citrus", value: 66, color: "citrus" },
      { name: "Animalic", value: 63, color: "animalic" }
    ],
    notes: {
      top: ["Iris", "Citrus"],
      heart: ["Leather"],
      base: ["Sandalwood", "Ambrette", "Cedar", "Oud"]
    }
  },
  "delilah blanc": {
    description: "Soft, elegant, and effortlessly clean. A gentle, soapy breeze of white peach, delicate orange blossom, and powdery musk.",
    accords: [
      { name: "Citrus", value: 100, color: "citrus" },
      { name: "Musky", value: 60, color: "musky" },
      { name: "Powdery", value: 50, color: "powdery" },
      { name: "White Floral", value: 45, color: "white_floral" },
      { name: "Aromatic", value: 40, color: "aromatic" },
      { name: "Sweet", value: 35, color: "sweet" },
      { name: "Fruity", value: 30, color: "fruity" },
      { name: "Fresh Spicy", value: 25, color: "fresh_spicy" },
      { name: "Woody", value: 20, color: "woody" }
    ],
    notes: {
      top: ["Bergamot", "White Peach", "Mandarin"],
      heart: ["Orange Blossom", "Vetiver"],
      base: ["Musk", "Vanilla"]
    }
  },
  "club de nuit intense man": {
    description: "A bold, smoky powerhouse of sharp lemon, tart pineapple, and smoldering birch wood. It is loud, unapologetic, and the ultimate statement of confidence.",
    accords: [
      { name: "Citrus", value: 100, color: "citrus" },
      { name: "Fruity", value: 75, color: "fruity" },
      { name: "Leather", value: 65, color: "leather" },
      { name: "Smoky", value: 60, color: "smoky" },
      { name: "Woody", value: 55, color: "woody" },
      { name: "Aromatic", value: 50, color: "aromatic" },
      { name: "Sweet", value: 45, color: "sweet" },
      { name: "Fresh", value: 40, color: "fresh" },
      { name: "Musky", value: 35, color: "musky" }
    ],
    notes: {
      top: ["Lemon", "Pineapple", "Bergamot", "Black Currant", "Apple"],
      heart: ["Birch", "Jasmine", "Rose"],
      base: ["Musk", "Ambergris", "Patchouli", "Vanilla"]
    }
  },
  "vanguard": {
    description: "A commanding and vibrant burst of tart pineapple, crisp apple, and sharp grapefruit that settles into a highly masculine, powerful base of rich leather, earthy moss, and deep woods. It is bold, confident, and built to leave a lasting impression.",
    accords: [
      { name: "Fruity", value: 100, color: "fruity" },
      { name: "Citrus", value: 75, color: "citrus" },
      { name: "Fresh", value: 60, color: "fresh" },
      { name: "Fresh Spicy", value: 58, color: "fresh_spicy" },
      { name: "Woody", value: 55, color: "woody" },
      { name: "Sweet", value: 53, color: "sweet" },
      { name: "Aromatic", value: 52, color: "aromatic" },
      { name: "Animalic", value: 48, color: "animalic" },
      { name: "Warm Spicy", value: 46, color: "warm_spicy" },
      { name: "Musky", value: 45, color: "musky" }
    ],
    notes: {
      top: ["Pineapple", "Blackcurrant", "Grapefruit", "Pink Pepper", "Apple", "Bergamot"],
      heart: ["Cardamom", "Lily of the Valley", "Ginger", "Carnation"],
      base: ["Musk", "Cashmere Musk", "Ambergris", "Leather", "Cedarwood", "Moss"]
    }
  },
  "hawas black": {
    description: "A bold, dark, and powerful aromatic woody scent with crisp top notes of grapefruit, bergamot, and pineapple, drying down into an earthy blend of oakmoss, amber, and patchouli.",
    accords: [
      { name: "Woody", value: 100, color: "woody" },
      { name: "Citrus", value: 85, color: "citrus" },
      { name: "Mossy", value: 70, color: "mossy" },
      { name: "Earthy", value: 65, color: "earthy" },
      { name: "Fresh Spicy", value: 50, color: "fresh_spicy" },
      { name: "Fruity", value: 48, color: "fruity" },
      { name: "Patchouli", value: 47, color: "patchouli" },
      { name: "Sweet", value: 46, color: "sweet" },
      { name: "Aromatic", value: 45, color: "aromatic" }
    ],
    notes: {
      top: ["Bergamot", "Pineapple", "Grapefruit"],
      heart: ["Patchouli", "Cedarwood", "Jasmine"],
      base: ["Oakmoss", "Woody Notes", "Amber"]
    }
  },
  "hunter men": {
    description: "A rich, woody aromatic fragrance with clean herbal and floral hints of ylang-ylang and tuberose, anchored by cedarwood, sandalwood, and earthy vetiver.",
    accords: [
      { name: "Woody", value: 100, color: "woody" },
      { name: "Aromatic", value: 75, color: "aromatic" },
      { name: "Citrus", value: 60, color: "citrus" },
      { name: "Yellow Floral", value: 58, color: "yellow_floral" },
      { name: "Fresh Spicy", value: 58, color: "fresh_spicy" },
      { name: "Warm Spicy", value: 45, color: "warm_spicy" },
      { name: "Tuberose", value: 44, color: "tuberose" },
      { name: "White Floral", value: 40, color: "white_floral" },
      { name: "Sweet", value: 35, color: "sweet" }
    ],
    notes: {
      top: ["Grapefruit", "Cedar Needles", "Rosemary", "Cardamom"],
      heart: ["Ylang-Ylang", "Tuberose", "Olibanum"],
      base: ["Cedar", "Sandalwood", "Vetiver"]
    }
  },
  "hawas": {
    description: "An aquatic, fruity masterpiece blending fresh apple, sparkling citrus, and warm cinnamon, settling into a gorgeous, long-lasting base of ambergris and musk.",
    accords: [
      { name: "Fruity", value: 100, color: "fruity" },
      { name: "Citrus", value: 95, color: "citrus" },
      { name: "Aquatic", value: 85, color: "aquatic" },
      { name: "Fresh", value: 75, color: "fresh" },
      { name: "Warm Spicy", value: 60, color: "warm_spicy" },
      { name: "Amber", value: 55, color: "amber" },
      { name: "Sweet", value: 55, color: "sweet" },
      { name: "Musky", value: 50, color: "musky" },
      { name: "Aromatic", value: 50, color: "aromatic" },
      { name: "Animalic", value: 48, color: "animalic" }
    ],
    notes: {
      top: ["Apple", "Bergamot", "Lemon", "Cinnamon"],
      heart: ["Watery Notes", "Plum", "Orange Blossom", "Cardamon"],
      base: ["Ambergris", "Musk", "Patchouli", "Driftwood"]
    }
  },
  "pacific aloha": {
    description: "An incredibly fresh, tropical marine blend of sweet melon and blood orange layered with rich coconut, transitioning into a warm amberwood and cacao base.",
    accords: [
      { name: "Aquatic", value: 100, color: "aquatic" },
      { name: "Ozonic", value: 100, color: "ozonic" },
      { name: "Coconut", value: 70, color: "coconut" },
      { name: "Citrus", value: 65, color: "citrus" },
      { name: "Marine", value: 55, color: "marine" },
      { name: "Sweet", value: 53, color: "sweet" },
      { name: "Fruity", value: 50, color: "fruity" },
      { name: "Aromatic", value: 48, color: "aromatic" },
      { name: "Amber", value: 45, color: "amber" },
      { name: "Lactonic", value: 43, color: "lactonic" }
    ],
    notes: {
      top: ["Melon", "Blood Orange", "Lemon"],
      heart: ["Watermelon", "Coconut"],
      base: ["Marine notes", "Amberwood", "Cacao"]
    }
  },
  "aquatica": {
    description: "A gorgeous, sweet citrus-coconut escape with vanilla highlights, supported by sugarcane, fresh jasmine, warm rum, and deep patchouli.",
    accords: [
      { name: "Citrus", value: 100, color: "citrus" },
      { name: "Sweet", value: 75, color: "sweet" },
      { name: "Coconut", value: 65, color: "coconut" },
      { name: "Vanilla", value: 55, color: "vanilla" },
      { name: "Fresh Spicy", value: 45, color: "fresh_spicy" }
    ],
    notes: {
      top: ["Lime", "Coconut Milk", "Bergamot", "Mandarin"],
      heart: ["Sugar Cane", "Jasmine", "Hibiscus", "Gardenia"],
      base: ["Rum", "Musk", "Tonka Bean", "Patchouli"]
    }
  },
  "nocturno elixir": {
    description: "A fresh and herbal aromatic powerhouse of lavender, mint, and zesty citrus, finished with rich sandalwood.",
    accords: [
      { name: "Aromatic", value: 100, color: "aromatic" },
      { name: "Citrus", value: 98, color: "citrus" },
      { name: "Fresh Spicy", value: 98, color: "fresh_spicy" },
      { name: "Woody", value: 75, color: "woody" },
      { name: "Herbal", value: 65, color: "herbal" },
      { name: "Green", value: 55, color: "green" },
      { name: "Lavender", value: 55, color: "lavender" },
      { name: "Powdery", value: 55, color: "powdery" },
      { name: "Warm Spicy", value: 53, color: "warm_spicy" },
      { name: "Fruity", value: 45, color: "fruity" }
    ],
    notes: {
      top: ["Lemon Zest", "Bergamot", "Mint", "Artemisia"],
      heart: ["Geranium", "Lavender", "Pineapple"],
      base: ["Sandalwood"]
    }
  },
  "divine": {
    description: "A fresh, fruity, and floral delight featuring litchi, ginger, and rose, finished with deep patchouli and chocolate.",
    accords: [
      { name: "Fresh", value: 100, color: "fresh" },
      { name: "Patchouli", value: 88, color: "patchouli" },
      { name: "Fresh Spicy", value: 85, color: "fresh_spicy" },
      { name: "Floral", value: 83, color: "floral" },
      { name: "Rose", value: 80, color: "rose" },
      { name: "Citrus", value: 78, color: "citrus" },
      { name: "Fruity", value: 75, color: "fruity" },
      { name: "Warm Spicy", value: 70, color: "warm_spicy" },
      { name: "Woody", value: 68, color: "woody" },
      { name: "Tropical", value: 60, color: "tropical" }
    ],
    notes: {
      top: ["Litchi", "Ginger", "Bergamot"],
      heart: ["Peony", "Rose", "Vanilla"],
      base: ["Patchouli", "Chocolate"]
    }
  },
  "supremacy collector's edition": {
    description: "A commanding sweet and fruity blend with sharp pineapple, bright white florals, and a rich, amber-moss base.",
    accords: [
      { name: "Fruity", value: 100, color: "fruity" },
      { name: "Sweet", value: 90, color: "sweet" },
      { name: "White Floral", value: 85, color: "white_floral" },
      { name: "Citrus", value: 83, color: "citrus" },
      { name: "Amber", value: 70, color: "amber" },
      { name: "Mossy", value: 65, color: "mossy" },
      { name: "Tropical", value: 60, color: "tropical" },
      { name: "Animalic", value: 60, color: "animalic" },
      { name: "Fresh", value: 55, color: "fresh" },
      { name: "Musky", value: 55, color: "musky" }
    ],
    notes: {
      top: ["Pineapple", "Bergamot", "White Flowers", "Apple"],
      heart: ["Orange Blossom", "Birch", "Amber"],
      base: ["Oak Moss", "Musk", "Ambergris"]
    }
  },
  "varakh silver": {
    description: "An elegant, aromatic and fresh spicy profile characterized by juniper berry and nutmeg, with a soft musky-amber dry down.",
    accords: [
      { name: "Aromatic", value: 100, color: "aromatic" },
      { name: "Fresh Spicy", value: 95, color: "fresh_spicy" },
      { name: "Woody", value: 60, color: "woody" },
      { name: "Musky", value: 58, color: "musky" },
      { name: "Powdery", value: 55, color: "powdery" },
      { name: "Amber", value: 50, color: "amber" },
      { name: "Soft Spicy", value: 48, color: "soft_spicy" }
    ],
    notes: {
      top: ["Juniper Berry", "Coriander Leaf"],
      heart: ["Nutmeg"],
      base: ["Musk", "Amber", "Vanilla"]
    }
  },
  "daarej sport pour homme": {
    description: "A fresh and dynamic scent blending aquatic and aromatic notes with a crisp finish.",
    accords: [
      { name: "Aquatic", value: 100, color: "aquatic" },
      { name: "Fresh", value: 95, color: "fresh" },
      { name: "Aromatic", value: 85, color: "aromatic" },
      { name: "Woody", value: 70, color: "woody" },
      { name: "Musky", value: 65, color: "musky" },
      { name: "Green", value: 60, color: "green" },
      { name: "Fresh Spicy", value: 50, color: "fresh_spicy" }
    ],
    notes: {
      top: ["Crisp Fresh Accords", "Marine Notes"],
      heart: ["Aromatic Nuances", "Green Nuances", "Subtle Spicy Touches"],
      base: ["Clean Woody Finishes", "Musky Finishes"]
    }
  },
  "rose of dreams": {
    description: "A captivating, powdery floral fragrance grounded by deep woods and a touch of fruit.",
    accords: [
      { name: "Green", value: 100, color: "green" },
      { name: "Woody", value: 90, color: "woody" },
      { name: "Rose", value: 85, color: "rose" },
      { name: "Powdery", value: 75, color: "powdery" },
      { name: "Fresh Spicy", value: 70, color: "fresh_spicy" },
      { name: "Iris", value: 65, color: "iris" },
      { name: "Fruity", value: 55, color: "fruity" },
      { name: "Floral", value: 50, color: "floral" },
      { name: "Musky", value: 45, color: "musky" },
      { name: "Ozonic", value: 40, color: "ozonic" }
    ],
    notes: {
      top: ["Green Notes", "Blackcurrant", "Peach"],
      heart: ["Cedarwood", "Black Pepper", "White Musk", "Violet Leaf", "Orris Root"],
      base: ["Rose", "Iris"]
    }
  },
  "ameerat al arab asdaaf": {
    description: "A beautifully composed citrus and white floral blend wrapped in soft musk and woods.",
    accords: [
      { name: "Citrus", value: 100, color: "citrus" },
      { name: "White Floral", value: 85, color: "white_floral" },
      { name: "Musky", value: 70, color: "musky" },
      { name: "Woody", value: 65, color: "woody" },
      { name: "Fresh", value: 60, color: "fresh" },
      { name: "Fresh Spicy", value: 55, color: "fresh_spicy" },
      { name: "Powdery", value: 50, color: "powdery" },
      { name: "Green", value: 45, color: "green" },
      { name: "Floral", value: 40, color: "floral" }
    ],
    notes: {
      top: ["Citruses", "Bergamot"],
      heart: ["White Musk", "Aloe Vera"],
      base: ["Jasmine", "Musk", "Woody Notes", "Oud"]
    }
  },
  "freeze": {
    description: "An ultra-cooling mix of spearmint and citrus set against icy herbs and ambermax.",
    accords: [
      { name: "Fresh", value: 100, color: "fresh" },
      { name: "Citrus", value: 95, color: "citrus" },
      { name: "Green", value: 75, color: "green" },
      { name: "Fresh Spicy", value: 68, color: "fresh_spicy" },
      { name: "Aromatic", value: 50, color: "aromatic" }
    ],
    notes: {
      top: ["Spearmint", "Lemon Zest", "Calabrian bergamot", "Grapefruit", "Snow"],
      heart: ["Ice", "Tea", "Ginger", "Sage"],
      base: ["Ambermax™", "Peony", "Cedar"]
    }
  }
};

// Returns fragrance DNA profile with safety fallbacks
export function getFragranceDNA(scentName: string): FragranceDNA {
  const key = scentName.toLowerCase().trim().replace(/\s+/g, " ");
  if (DNA_DICTIONARY[key]) {
    return DNA_DICTIONARY[key];
  }
  
  // Check for partial or substring match
  for (const dictKey of Object.keys(DNA_DICTIONARY)) {
    if (key.includes(dictKey) || dictKey.includes(key)) {
      return DNA_DICTIONARY[dictKey];
    }
  }
  
  // Safe default fallback for custom fragrances
  return {
    description: "A beautifully balanced luxury fragrance crafted with premium essences.",
    accords: [
      { name: "Fresh", value: 75, color: "fresh" },
      { name: "Citrus", value: 65, color: "citrus" },
      { name: "Woody", value: 50, color: "woody" }
    ],
    notes: {
      top: ["Bergamot", "Citrus Accord"],
      heart: ["Lavender", "Floral Notes", "Geranium"],
      base: ["White Musk", "Cedarwood", "Amber"]
    }
  };
}
