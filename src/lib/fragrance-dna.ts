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
  accords: Accord[];
  notes: FragranceNotes;
}

const DNA_DICTIONARY: Record<string, FragranceDNA> = {
  "vulcan baie": {
    accords: [
      { name: "Warm", value: 85, color: "warm" },
      { name: "Fresh", value: 60, color: "fresh" },
      { name: "Spice", value: 72, color: "spice" },
      { name: "Woody", value: 68, color: "woody" },
      { name: "Sweet", value: 50, color: "sweet" }
    ],
    notes: {
      top: ["Bergamot", "Black Pepper", "Cardamom"],
      heart: ["Saffron", "Leather", "Cedar"],
      base: ["Amber", "Musk", "Vetiver"]
    }
  },
  "liquid brun": {
    accords: [
      { name: "Sweet", value: 90, color: "sweet" },
      { name: "Warm", value: 85, color: "warm" },
      { name: "Musk", value: 70, color: "musk" },
      { name: "Woody", value: 55, color: "woody" }
    ],
    notes: {
      top: ["Hazelnut", "Caramel"],
      heart: ["Vanilla", "Tonka Bean", "Praline"],
      base: ["Sandalwood", "Musk", "Benzoin"]
    }
  },
  "hawas ice": {
    accords: [
      { name: "Fresh", value: 95, color: "fresh" },
      { name: "Aquatic", value: 88, color: "aquatic" },
      { name: "Citrus", value: 75, color: "citrus" },
      { name: "Musk", value: 50, color: "musk" }
    ],
    notes: {
      top: ["Lemon", "Mint", "Grapefruit"],
      heart: ["Marine Notes", "Apple", "Violet Leaf"],
      base: ["White Musk", "Amber", "Driftwood"]
    }
  },
  "hawas kobra": {
    accords: [
      { name: "Warm", value: 88, color: "warm" },
      { name: "Spice", value: 82, color: "spice" },
      { name: "Leather", value: 65, color: "leather" },
      { name: "Woody", value: 60, color: "woody" },
      { name: "Smoky", value: 55, color: "smoky" }
    ],
    notes: {
      top: ["Cinnamon", "Bergamot", "Saffron"],
      heart: ["Leather", "Tobacco", "Oud"],
      base: ["Patchouli", "Smoky Woods", "Amber"]
    }
  },
  "delilah blanc": {
    accords: [
      { name: "Floral", value: 92, color: "floral" },
      { name: "Rose", value: 88, color: "rose" },
      { name: "Sweet", value: 60, color: "sweet" },
      { name: "Musk", value: 72, color: "musk" },
      { name: "Warm", value: 55, color: "warm" }
    ],
    notes: {
      top: ["Rose", "Peony", "Litchi"],
      heart: ["White Rose", "Magnolia", "Freesia"],
      base: ["White Musk", "Vanilla", "Cashmere Wood"]
    }
  },
  "elixir": {
    accords: [
      { name: "Sweet", value: 85, color: "sweet" },
      { name: "Warm", value: 80, color: "warm" },
      { name: "Aromatic", value: 60, color: "aromatic" },
      { name: "Musk", value: 65, color: "musk" }
    ],
    notes: {
      top: ["Bergamot", "Lavender", "Apple"],
      heart: ["Caramel", "Tonka Bean", "Coumarin"],
      base: ["Vanilla", "Musk", "Sandalwood"]
    }
  },
  "lion": {
    accords: [
      { name: "Warm", value: 90, color: "warm" },
      { name: "Woody", value: 85, color: "woody" },
      { name: "Spice", value: 75, color: "spice" },
      { name: "Leather", value: 70, color: "leather" }
    ],
    notes: {
      top: ["Saffron", "Cinnamon", "Bergamot"],
      heart: ["Leather", "Oud", "Rosewood"],
      base: ["Patchouli", "Tonka Bean", "Cedarwood"]
    }
  },
  "club de nuit intense man": {
    accords: [
      { name: "Citrus", value: 92, color: "citrus" },
      { name: "Smoky", value: 78, color: "smoky" },
      { name: "Woody", value: 82, color: "woody" },
      { name: "Musk", value: 68, color: "musk" },
      { name: "Sweet", value: 55, color: "sweet" }
    ],
    notes: {
      top: ["Pineapple", "Bergamot", "Apple", "Blackcurrant"],
      heart: ["Rose", "Birch", "Jasmine"],
      base: ["Musk", "Ambergris", "Patchouli", "Vanilla"]
    }
  },
  "shiyaaka snow": {
    accords: [
      { name: "Fresh", value: 88, color: "fresh" },
      { name: "Aquatic", value: 82, color: "aquatic" },
      { name: "Aromatic", value: 70, color: "aromatic" },
      { name: "Woody", value: 60, color: "woody" },
      { name: "Musk", value: 55, color: "musk" }
    ],
    notes: {
      top: ["Frost Mint", "Grapefruit", "Lavender"],
      heart: ["Marine Accord", "Geranium", "Sage"],
      base: ["Cedarwood", "White Musk", "Ambroxan"]
    }
  }
};

// Returns fragrance DNA profile with safety fallbacks
export function getFragranceDNA(scentName: string): FragranceDNA {
  const key = scentName.toLowerCase().trim().replace(/\s+/g, " ");
  if (DNA_DICTIONARY[key]) {
    return DNA_DICTIONARY[key];
  }
  
  // Safe default fallback for custom fragrances
  return {
    accords: [
      { name: "Fresh", value: 75, color: "fresh" },
      { name: "Warm", value: 65, color: "warm" },
      { name: "Woody", value: 50, color: "woody" }
    ],
    notes: {
      top: ["Bergamot", "Citrus Accord"],
      heart: ["Lavender", "Floral Notes", "Geranium"],
      base: ["White Musk", "Cedarwood", "Amber"]
    }
  };
}
