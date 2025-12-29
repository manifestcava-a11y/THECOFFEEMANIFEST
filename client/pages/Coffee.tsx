import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, X, Heart, ShoppingCart, Star, MapPin, Coffee as CoffeeIcon, ArrowUpDown, Plus, Minus } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CoffeeProduct, CoffeeFilters } from "@shared/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Slider } from "../components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { cn } from "../lib/utils";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import AddToCartModal from "../components/AddToCartModal";
import { useToast } from "../hooks/use-toast";
import { useCoffeeProducts, useFilterOptions } from "../hooks/use-supabase";
import { CoffeeLabel } from "../components/CoffeeLabel";
import { getWeightString } from "../lib/weight";


// Helper function to get translated description
const getCoffeeDescription = (coffeeId: string, language: string) => {
  const descriptions = {
    ua: {
      "1": "Насичений та повнотілий з нотами шоколаду та карамелі",
      "2": "Яскравий та квітковий з нотами цитрусових та ягід", 
      "3": "М'який та горіховий з низькою кислотністю",
      "4": "Винна кислотність з нотами чорної смородини",
      "5": "Складний з пряними та димчастими відтінками",
      "6": "М'який та гладкий без гіркоти",
      "7": "Чистий та яскравий з трав'яними нотами",
      "8": "Яскрава кислотність з медовою солодкістю",
      "9": "Повнотілий з земними та трав'яними нотами",
      "10": "Гладкий та м'який з тонкою солодкістю"
    },
    ru: {
      "1": "Насыщенный и полнотелый с нотами шоколада и карамели",
      "2": "Яркий и цветочный с нотами цитрусовых и ягод",
      "3": "Мягкий и ореховый с низкой кислотностью", 
      "4": "Винная кислотность с нотами черной смородины",
      "5": "Сложный с пряными и дымчатыми оттенками",
      "6": "Мягкий и гладкий без горечи",
      "7": "Чистый и яркий с травяными нотами",
      "8": "Яркая кислотность с медовой сладостью",
      "9": "Полнотелый с земляными и травяными нотами",
      "10": "Гладкий и мягкий с тонкой сладостью"
    }
  };
  return descriptions[language as keyof typeof descriptions]?.[coffeeId as keyof typeof descriptions.ua] || descriptions.ua[coffeeId as keyof typeof descriptions.ua];
};

// Helper function to translate flavor notes
const translateFlavorNote = (note: string, language: string) => {
  const translations = {
    ua: {
      "chocolate": "шоколад",
      "caramel": "карамель", 
      "nuts": "горіхи",
      "citrus": "цитрусові",
      "berry": "ягоди",
      "floral": "квітковий",
      "black currant": "чорна смородина",
      "wine": "вино",
      "spicy": "пряний",
      "smoky": "димчастий",
      "mild": "м'який",
      "smooth": "гладкий",
      "balanced": "збалансований",
      "herbal": "трав'яний",
      "clean": "чистий",
      "honey": "мед",
      "bright": "яскравий",
      "earthy": "земний",
      "full-bodied": "повнотілий",
      "sweet": "солодкий",
      "vanilla": "ваніль"
    },
    ru: {
      "chocolate": "шоколад",
      "caramel": "карамель",
      "nuts": "орехи", 
      "citrus": "цитрусовые",
      "berry": "ягоды",
      "floral": "цветочный",
      "black currant": "черная смородина",
      "wine": "вино",
      "spicy": "пряный",
      "smoky": "дымчатый",
      "mild": "мягкий",
      "smooth": "гладкий",
      "balanced": "сбалансированный",
      "herbal": "травяной",
      "clean": "чистый",
      "honey": "мед",
      "bright": "яркий",
      "earthy": "земляной",
      "full-bodied": "полнотелый",
      "sweet": "сладкий",
      "vanilla": "ваниль"
    }
  };
  return translations[language as keyof typeof translations]?.[note as keyof typeof translations.ua] || note;
};

// Helper function to translate origins - now also handles reverse lookup (UA/RU -> EN)
const translateOrigin = (origin: string, language: string) => {
  const translations = {
    ua: {
      "Colombia": "Колумбія",
      "Колумбія": "Колумбія", // Handle reverse
      "Колумбия": "Колумбія", // Handle RU
      "Ethiopia": "Ефіопія",
      "Ефіопія": "Ефіопія",
      "Эфиопия": "Ефіопія",
      "Brazil": "Бразилія",
      "Бразилія": "Бразилія",
      "Бразилия": "Бразилія",
      "Kenya": "Кенія",
      "Кенія": "Кенія",
      "Кения": "Кенія",
      "Guatemala": "Гватемала",
      "Гватемала": "Гватемала",
      "Jamaica": "Ямайка",
      "Ямайка": "Ямайка",
      "Peru": "Перу",
      "Перу": "Перу",
      "Costa Rica": "Коста-Рика",
      "Коста-Рика": "Коста-Рика",
      "Indonesia": "Індонезія",
      "Індонезія": "Індонезія",
      "Индонезия": "Індонезія",
      "Hawaii": "Гаваї",
      "Гаваї": "Гаваї",
      "Гавайи": "Гаваї"
    },
    ru: {
      "Colombia": "Колумбия",
      "Колумбія": "Колумбия", // Handle UA
      "Колумбия": "Колумбия", // Handle reverse
      "Ethiopia": "Эфиопия",
      "Ефіопія": "Эфиопия",
      "Эфиопия": "Эфиопия",
      "Brazil": "Бразилия",
      "Бразилія": "Бразилия",
      "Бразилия": "Бразилия",
      "Kenya": "Кения",
      "Кенія": "Кения",
      "Кения": "Кения",
      "Guatemala": "Гватемала",
      "Гватемала": "Гватемала",
      "Jamaica": "Ямайка",
      "Ямайка": "Ямайка",
      "Peru": "Перу",
      "Перу": "Перу",
      "Costa Rica": "Коста-Рика",
      "Коста-Рика": "Коста-Рика",
      "Indonesia": "Индонезия",
      "Індонезія": "Индонезия",
      "Индонезия": "Индонезия",
      "Hawaii": "Гавайи",
      "Гаваї": "Гавайи",
      "Гавайи": "Гавайи"
    }
  };
  return translations[language as keyof typeof translations]?.[origin as keyof typeof translations.ua] || origin;
};

// Placeholder coffee data
const placeholderCoffees: CoffeeProduct[] = [
  {
    id: "1",
    name: "Colombia Supremo",
    origin: "Colombia",
    roast: "medium",
    price: 249.90,
    image: "/250-g_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["chocolate", "caramel", "nuts"],
    acidity: "medium",
    body: "full",
    process: "washed",
    elevation: 1800,
    inStock: true,
  },
  {
    id: "2",
    name: "Ethiopia Guji Organic",
    origin: "Ethiopia",
    roast: "light",
    price: 149.90,
    image: "/500_Manifestcoffee_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["citrus", "berry", "floral"],
    acidity: "high",
    body: "light",
    process: "natural",
    elevation: 2200,
    inStock: true,
  },
  {
    id: "3",
    name: "Brazil Santos",
    origin: "Brazil",
    roast: "dark",
    price: 199.90,
    image: "/250-g_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["nuts", "chocolate", "vanilla"],
    acidity: "low",
    body: "medium",
    process: "semi-washed",
    elevation: 1200,
    inStock: true,
  },
  {
    id: "4",
    name: "Kenya AA",
    origin: "Kenya",
    roast: "medium",
    price: 279.90,
    image: "/500_Manifestcoffee_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["black currant", "wine", "citrus"],
    acidity: "high",
    body: "full",
    process: "washed",
    elevation: 1600,
    inStock: false,
  },
  {
    id: "5",
    name: "Guatemala Antigua",
    origin: "Guatemala",
    roast: "medium",
    price: 269.90,
    image: "/250-g_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["spicy", "smoky", "chocolate"],
    acidity: "medium",
    body: "full",
    process: "washed",
    elevation: 1500,
    inStock: true,
  },
  {
    id: "6",
    name: "Jamaica Blue Mountain",
    origin: "Jamaica",
    roast: "medium",
    price: 899.90,
    image: "/500_Manifestcoffee_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["mild", "smooth", "balanced"],
    acidity: "low",
    body: "medium",
    process: "washed",
    elevation: 1000,
    inStock: true,
  },
  {
    id: "7",
    name: "Peru Organic",
    origin: "Peru",
    roast: "light",
    price: 229.90,
    image: "/250-g_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["herbal", "citrus", "clean"],
    acidity: "medium",
    body: "light",
    process: "natural",
    elevation: 1800,
    inStock: true,
  },
  {
    id: "8",
    name: "Costa Rica Tarrazú",
    origin: "Costa Rica",
    roast: "medium",
    price: 259.90,
    image: "/500_Manifestcoffee_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["honey", "citrus", "bright"],
    acidity: "high",
    body: "medium",
    process: "honey",
    elevation: 1400,
    inStock: true,
  },
  {
    id: "9",
    name: "Sumatra Mandheling",
    origin: "Indonesia",
    roast: "dark",
    price: 239.90,
    image: "/250-g_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["earthy", "herbal", "full-bodied"],
    acidity: "low",
    body: "full",
    process: "semi-washed",
    elevation: 1000,
    inStock: false,
  },
  {
    id: "10",
    name: "Hawaii Kona",
    origin: "Hawaii",
    roast: "medium",
    price: 699.90,
    image: "/500_Manifestcoffee_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["smooth", "sweet", "mild"],
    acidity: "low",
    body: "medium",
    process: "washed",
    elevation: 800,
    inStock: true,
  },
];

// Default fallback values if database is empty
const defaultOrigins = ["Colombia", "Ethiopia", "Brazil", "Kenya", "Guatemala", "Jamaica", "Peru", "Costa Rica", "Indonesia", "Hawaii"];
const defaultRoasts = ["light", "medium", "dark"];

export default function Coffee() {
  const { t, language } = useLanguage();
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();
  const { data: filterOptions } = useFilterOptions(language);
  const [modalOpen, setModalOpen] = useState(false);
  const [addedItem, setAddedItem] = useState<{name: string, image?: string, quantity: number} | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  // Check if user has seen the modal before
  const hasSeenModal = () => {
    return localStorage.getItem('manifest_cart_modal_seen') === 'true';
  };

  const markModalAsSeen = () => {
    localStorage.setItem('manifest_cart_modal_seen', 'true');
  };

  const getCartItemForProduct = (productId: string) => {
    return items.find(item => item.productId === productId);
  };

  const handleQuantityChange = (productId: string, change: number) => {
    const cartItem = getCartItemForProduct(productId);
    if (cartItem) {
      const newQuantity = cartItem.quantity + change;
      if (newQuantity <= 0) {
        removeItem(cartItem.id);
      } else {
        updateQuantity(cartItem.id, newQuantity);
      }
    }
  };
  const [filters, setFilters] = useState<CoffeeFilters>({
    search: "",
    origins: [],
    roasts: [],
    processes: [],
    priceRange: [0, 1000],
    inStock: null,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("default");

  const { data: supaProducts } = useCoffeeProducts();

  // Filter coffee products based on current filters
  const filteredCoffees = useMemo(() => {
    // Helpers for robust matching
    const normalize = (s: string) => (s || '').trim().toLowerCase();
    const defaultOriginPairs = defaultOrigins.map((en) => ({ ua: translateOrigin(en, 'ua'), ru: translateOrigin(en, 'ru') }));
    const originPairs = (filterOptions as any)?.originPairs && (filterOptions as any)?.originPairs.length
      ? (filterOptions as any).originPairs
      : defaultOriginPairs;

    const roastPairs = (filterOptions as any)?.roastPairs || [];
    
    const roastToCode = (r: string): string => {
      const v = normalize(r);
      if (['light', 'світле', 'светлое'].includes(v)) return 'light';
      if (['medium', 'середнє', 'среднее', 'середньосвітле', 'среднесветлое', 'середньотемне', 'среднетемное', 'medium-dark', 'light-medium'].includes(v)) return 'medium';
      if (['dark', 'темне', 'темное', 'дуже темне', 'очень темное', 'very-dark'].includes(v)) return 'dark';
      return v; // fallback to raw
    };

    const source = (supaProducts && supaProducts.length) ? supaProducts : placeholderCoffees;
    const filtered = source.filter((coffee) => {
      // Only show active products
      if (coffee.active === false) {
        return false;
      }

      // Search filter
      if (filters.search && !coffee.name.toLowerCase().includes(filters.search.toLowerCase()) && 
          !coffee.origin.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Origin filter (match UA/RU synonyms)
      if (filters.origins.length > 0) {
        const coffeeOrigin = normalize(coffee.origin);
        let anyOriginMatch = false;
        for (const sel of filters.origins) {
          const selNorm = normalize(sel);
          const pair = originPairs.find((p: any) => normalize(p.ua) === selNorm || normalize(p.ru) === selNorm);
          if (pair) {
            const ua = normalize(pair.ua);
            const ru = normalize(pair.ru);
            if (coffeeOrigin === ua || coffeeOrigin === ru) {
              anyOriginMatch = true;
              break;
            }
          } else {
            // Fallback to direct comparison when using defaults (EN)
            if (coffeeOrigin === selNorm) {
              anyOriginMatch = true;
              break;
            }
          }
        }
        if (!anyOriginMatch) return false;
      }

      // Roast filter (match UA/RU synonyms using roastPairs)
      if (filters.roasts.length > 0) {
        const coffeeRoast = normalize(coffee.roast);
        let anyRoastMatch = false;
        for (const sel of filters.roasts) {
          const selNorm = normalize(sel);
          const pair = roastPairs.find((p: any) => normalize(p.ua) === selNorm || normalize(p.ru) === selNorm);
          if (pair) {
            const ua = normalize(pair.ua);
            const ru = normalize(pair.ru);
            // Match coffee roast against both UA and RU versions, or use code matching as fallback
            if (coffeeRoast === ua || coffeeRoast === ru) {
              anyRoastMatch = true;
              break;
            }
            // Also try code matching for English values
            const coffeeCode = roastToCode(coffee.roast);
            const selCode = roastToCode(sel);
            if (coffeeCode === selCode && coffeeCode !== coffeeRoast) {
              anyRoastMatch = true;
              break;
            }
          } else {
            // Fallback to direct comparison or code matching
            if (coffeeRoast === selNorm) {
              anyRoastMatch = true;
              break;
            }
            const coffeeCode = roastToCode(coffee.roast);
            const selCode = roastToCode(sel);
            if (coffeeCode === selCode) {
              anyRoastMatch = true;
              break;
            }
          }
        }
        if (!anyRoastMatch) return false;
      }

      // Stock filter
      if (filters.inStock !== null && coffee.inStock !== filters.inStock) {
        return false;
      }

      return true;
    });

    // Sort based on selected criteria
    return filtered.sort((a, b) => {
      // Always prioritize in-stock items first
      if (a.inStock && !b.inStock) return -1;
      if (!a.inStock && b.inStock) return 1;
      
      // Then apply selected sorting
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "origin-asc":
          return a.origin.localeCompare(b.origin);
        case "origin-desc":
          return b.origin.localeCompare(a.origin);
        default:
          return 0; // Default order (as they appear in the array)
      }
    });
  }, [filters, sortBy, supaProducts, filterOptions]);

  const handleFilterChange = (key: keyof CoffeeFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      origins: [],
      roasts: [],
      processes: [],
      priceRange: [0, 100],
      inStock: null,
    });
  };

  return (
    <div className="min-h-screen bg-coffee-background">
      <Header />
      
      <div className="pt-20">

        {/* Main Content */}
        <section className="py-16 px-6">
          <div className="max-w-8xl mx-auto">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-8">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="w-full justify-between"
                style={{ borderColor: '#361c0c', color: '#361c0c' }}
              >
                <span className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>{t('coffee.filters')}</span>
                </span>
                <span>{showFilters ? t('coffee.hideFilters') : t('coffee.showFilters')}</span>
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <div className={cn(
                "lg:w-80 lg:block",
                showFilters ? "block" : "hidden"
              )}>
                <div className="bg-white p-6 rounded-lg shadow-lg sticky top-24">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black font-coolvetica tracking-wider" style={{ color: '#361c0c' }}>
                      {t('coffee.filters')}
                    </h3>
                    <Button
                      onClick={clearFilters}
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {t('coffee.clearAll')}
                    </Button>
                  </div>

                  {/* Search */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2" style={{ color: '#361c0c' }}>
                      {t('coffee.search')}
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder={t('coffee.search')}
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                        className="pl-10"
                        style={{ borderColor: '#361c0c' }}
                      />
                    </div>
                  </div>

                  {/* Origins */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3" style={{ color: '#361c0c' }}>
                      {t('coffee.origins')}
                    </label>
                    <div className="space-y-2">
                      {(filterOptions?.origins || defaultOrigins).map((origin) => (
                        <div key={origin} className="flex items-center space-x-2">
                          <Checkbox
                            id={origin}
                            checked={filters.origins.includes(origin)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleFilterChange("origins", [...filters.origins, origin]);
                              } else {
                                handleFilterChange("origins", filters.origins.filter(o => o !== origin));
                              }
                            }}
                          />
                          <label htmlFor={origin} className="text-sm font-medium">
                            {translateOrigin(origin, language)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Roasts */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3" style={{ color: '#361c0c' }}>
                      {t('coffee.roastLevel')}
                    </label>
                    <div className="space-y-2">
                      {(filterOptions?.roasts || defaultRoasts).map((roast) => (
                        <div key={roast} className="flex items-center space-x-2">
                          <Checkbox
                            id={roast}
                            checked={filters.roasts.includes(roast)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleFilterChange("roasts", [...filters.roasts, roast]);
                              } else {
                                handleFilterChange("roasts", filters.roasts.filter(r => r !== roast));
                              }
                            }}
                          />
                          <label htmlFor={roast} className="text-sm font-medium">
                            {roast}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stock Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3" style={{ color: '#361c0c' }}>
                      {t('coffee.availability')}
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inStock"
                          checked={filters.inStock === true}
                          onCheckedChange={(checked) => 
                            handleFilterChange("inStock", checked ? true : null)
                          }
                        />
                        <label htmlFor="inStock" className="text-sm font-medium">
                          {t('coffee.inStockOnly')}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coffee Grid */}
              <div className="flex-1">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-8">
                  <p className="text-lg font-medium" style={{ color: '#361c0c' }}>
                    {filteredCoffees.length} {t('coffee.found')}
                  </p>
                  
                  {/* Sort Dropdown */}
                  <div className="flex items-center space-x-2">
                    <ArrowUpDown className="w-4 h-4 text-gray-500" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">{t('coffee.sort.default')}</SelectItem>
                        <SelectItem value="price-low">{t('coffee.sort.priceLow')}</SelectItem>
                        <SelectItem value="price-high">{t('coffee.sort.priceHigh')}</SelectItem>
                        <SelectItem value="name-asc">{t('coffee.sort.nameAsc')}</SelectItem>
                        <SelectItem value="name-desc">{t('coffee.sort.nameDesc')}</SelectItem>
                        <SelectItem value="origin-asc">{t('coffee.sort.originAsc')}</SelectItem>
                        <SelectItem value="origin-desc">{t('coffee.sort.originDesc')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Coffee Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredCoffees.map((coffee) => (
                    <Link 
                      key={coffee.id} 
                      to={`/product/${coffee.slug || coffee.id}`}
                      className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: '#fcf4e4' }}>
                        <img
                          src={coffee.image}
                          alt={coffee.name}
                          className="object-cover group-hover:scale-105 transition-transform duration-300 absolute bottom-0 left-0"
                          style={{ width: '80%', height: '80%' }}
                        />
                        
                        {/* Stock Status */}
                        {!coffee.inStock && (
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded">
                              {t('coffee.outOfStock')}
                            </span>
                          </div>
                        )}

                        {/* Custom Label */}
                        {((coffee.custom_label && language === 'ua') || (coffee.custom_label_ru && language === 'ru')) && (
                          <div className={`absolute left-4 ${!coffee.inStock ? 'top-12' : 'top-4'}`}>
                            <span 
                              className="px-3 py-1 text-sm font-bold rounded-full shadow-lg"
                              style={{
                                backgroundColor: coffee.custom_label_color || '#f59e0b',
                                color: coffee.custom_label_text_color || '#92400e'
                              }}
                            >
                              {language === 'ru' ? (coffee.custom_label_ru || coffee.custom_label) : (coffee.custom_label || coffee.custom_label_ru)}
                            </span>
                          </div>
                        )}

                        {/* External Label Image (preferred), fallback to generated label - scales with card */}
                        {(coffee as any).label_image_url ? (
                          <div className="absolute top-2 right-2" style={{ width: 'clamp(120px, 30%, 250px)' }}>
                            <img src={(coffee as any).label_image_url} alt="label" className="w-full h-auto" />
                          </div>
                        ) : coffee.label_data ? (
                          <div className="absolute top-2 right-2" style={{ width: 'clamp(120px, 30%, 250px)' }}>
                            <CoffeeLabel
                              coffeeName={coffee.name}
                              strength={coffee.strength_level || 3}
                              acidity={coffee.acidity_level || 3}
                              roast={coffee.roast_level || 3}
                              body={coffee.body_level || 3}
                              labelData={coffee.label_data}
                              className="w-full"
                            />
                          </div>
                        ) : (
                          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg" style={{ width: 'clamp(120px, 30%, 250px)' }}>
                            <div className="text-center">
                              <div className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: '#361c0c' }}>
                                {translateOrigin(coffee.origin, language).toUpperCase()}
                              </div>
                              
                              {/* Metrics */}
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600 font-medium mr-3">{t('coffee.strength')}:</span>
                                  <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                      <div
                                        key={level}
                                        className={`w-2 h-2 rounded-full ${
                                          level <= (coffee.body === 'full' ? 4 : coffee.body === 'medium' ? 3 : 2)
                                            ? 'bg-orange-500'
                                            : 'bg-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600 font-medium mr-3">{t('coffee.acidity')}:</span>
                                  <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                      <div
                                        key={level}
                                        className={`w-2 h-2 rounded-full ${
                                          level <= (coffee.acidity === 'high' ? 4 : coffee.acidity === 'medium' ? 3 : 2)
                                            ? 'bg-orange-500'
                                            : 'bg-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600 font-medium mr-3">{t('coffee.roast')}:</span>
                                  <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                      <div
                                        key={level}
                                        className={`w-2 h-2 rounded-full ${
                                          level <= (coffee.roast === 'dark' ? 5 : coffee.roast === 'medium' ? 3 : 2)
                                            ? 'bg-orange-500'
                                            : 'bg-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600 font-medium mr-3">{t('coffee.body')}:</span>
                                  <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                      <div
                                        key={level}
                                        className={`w-2 h-2 rounded-full ${
                                          level <= (coffee.body === 'full' ? 5 : coffee.body === 'medium' ? 3 : 2)
                                            ? 'bg-orange-500'
                                            : 'bg-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">{translateOrigin(coffee.origin, language)}</span>
                          <span className="text-sm text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            {(() => {
                              // Use roastPairs to get correct language version (like origin)
                              const { roastPairs = [] } = filterOptions || {};
                              const normalize = (s: string) => (s || '').trim().toLowerCase();
                              const roastValue = (coffee.roast || '').trim();
                              const roastNorm = normalize(roastValue);
                              
                              // Find matching pair by checking both UA and RU values
                              const pair = roastPairs.find((p: { ua: string; ru: string }) => {
                                const uaNorm = normalize(p.ua);
                                const ruNorm = normalize(p.ru);
                                return uaNorm === roastNorm || ruNorm === roastNorm ||
                                       uaNorm.includes(roastNorm) || roastNorm.includes(uaNorm) ||
                                       ruNorm.includes(roastNorm) || roastNorm.includes(ruNorm);
                              });
                              
                              // Return correct language version from pair
                              if (pair) {
                                return language === 'ru' ? pair.ru : pair.ua;
                              }
                              
                              // Fallback to original value
                              return roastValue || '-';
                            })()}
                          </span>
                        </div>

                        <h3 className="text-xl font-black font-coolvetica tracking-wider mb-2" style={{ color: '#361c0c' }}>
                          {coffee.name}
                        </h3>

                        <p className="text-gray-600 mb-4 text-sm leading-relaxed flex-grow">
                          {coffee.description}
                        </p>


                        {/* Price and Add to Cart */}
                        <div className="flex flex-col space-y-4 mt-auto">
                          <div className="text-center">
                            <span className="text-2xl font-black" style={{ color: '#361c0c' }}>
                              ₴{coffee.price}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">/ {coffee.weight}g</span>
                          </div>
                          
                          {(() => {
                            const cartItem = getCartItemForProduct(coffee.id);
                            const isInCart = cartItem && cartItem.quantity > 0;
                            
                            if (isInCart) {
                              return (
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleQuantityChange(coffee.id, -1);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center border-2 border-[#361c0c] text-[#361c0c] hover:bg-[#361c0c] hover:text-white transition-all duration-300"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <div className="w-12 text-center font-black text-lg" style={{ color: '#361c0c' }}>
                                    {cartItem!.quantity}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleQuantityChange(coffee.id, 1);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center border-2 border-[#361c0c] text-[#361c0c] hover:bg-[#361c0c] hover:text-white transition-all duration-300"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            } else {
                              const availableSizes = (coffee as any).sizes || [];
                              const hasSizes = availableSizes.length > 0;
                              const selectedSizeId = selectedSizes[coffee.id];
                              const selectedSize = availableSizes.find((s: any) => s.id === selectedSizeId);
                              
                              return (
                                <div className="space-y-3">
                                  {hasSizes && (
                                    <Select
                                      value={selectedSizeId || ''}
                                      onValueChange={(value) => {
                                        setSelectedSizes(prev => ({ ...prev, [coffee.id]: value }));
                                      }}
                                    >
                                      <SelectTrigger className="w-full border-2 border-[#361c0c] bg-transparent text-[#361c0c] font-medium">
                                        <SelectValue placeholder={t('coffee.selectSize') || 'Виберіть вагу'} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableSizes.map((size: any) => (
                                          <SelectItem key={size.id} value={size.id}>
                                            {language === 'ua' ? size.label_ua : size.label_ru || (size.weight ? `${size.weight}g` : '')}
                                            {size.price && size.price !== coffee.price && ` - ₴${size.price}`}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                  <Button
                                    disabled={!coffee.inStock || (hasSizes && !selectedSizeId)}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const sizePrice = selectedSize?.price || coffee.price;
                                      const sizeLabel = selectedSize 
                                        ? (language === 'ua' ? selectedSize.label_ua : selectedSize.label_ru) || (selectedSize.weight ? `${selectedSize.weight}g` : '')
                                        : (() => {
                                            const weightLabel = getWeightString(coffee.weight ?? null, '');
                                            return weightLabel || '250g';
                                          })();
                                      
                                      addItem({
                                        productId: coffee.id,
                                        name: coffee.name,
                                        image: coffee.image,
                                        price: sizePrice,
                                        quantity: 1,
                                        variant: `${sizeLabel} - ${t('product.grindBeans')}`, // Default to beans if not selected
                                        type: 'coffee'
                                      });
                                      
                                      // Show toast notification
                                      toast({
                                        title: t('coffee.addedToCart'),
                                        description: `${coffee.name} ${t('coffee.addedToCartDesc')}`,
                                        duration: 3000,
                                      });
                                      
                                      // Only show modal if user hasn't seen it before
                                      if (!hasSeenModal()) {
                                        setAddedItem({
                                          name: coffee.name,
                                          image: coffee.image,
                                          quantity: 1
                                        });
                                        setModalOpen(true);
                                        markModalAsSeen();
                                      }
                                    }}
                                    className="w-full px-6 py-3 bg-transparent border-2 font-black text-sm text-[#361c0c] border-[#361c0c] hover:bg-[#361c0c] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    {coffee.inStock ? t('coffee.addToCart') : t('coffee.outOfStock')}
                                  </Button>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* No Results */}
                {filteredCoffees.length === 0 && (
                  <div className="text-center py-16">
                    <CoffeeIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-black mb-2" style={{ color: '#361c0c' }}>
                      {t('coffee.noCoffeeFound')}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {t('coffee.tryAdjustingFilters')}
                    </p>
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      style={{ borderColor: '#361c0c', color: '#361c0c' }}
                    >
                      {t('coffee.clearAll')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
      
      {/* Add to Cart Modal */}
      {addedItem && (
        <AddToCartModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onContinueShopping={() => setModalOpen(false)}
          itemName={addedItem.name}
          itemImage={addedItem.image}
          quantity={addedItem.quantity}
        />
      )}
    </div>
  );
}
