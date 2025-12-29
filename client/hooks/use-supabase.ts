import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const processDictionary: Array<{ synonyms: string[]; ua: string; ru: string }> = [
  {
    synonyms: ['washed', 'митий', 'мита', 'мытый', 'мытая', 'washed process', 'мытый процесс', 'мытая обработка'],
    ua: 'Мита',
    ru: 'Мытый',
  },
  {
    synonyms: ['semi-washed', 'semi washed', 'semiwashed', 'напівмита', 'напівмитий', 'полумытая', 'полумытый', 'semi-washed process'],
    ua: 'Напівмита',
    ru: 'Полумытой',
  },
  {
    synonyms: ['natural', 'натуральна', 'натуральний', 'натуральная', 'натуральный', 'natural process'],
    ua: 'Натуральна',
    ru: 'Натуральный',
  },
  {
    synonyms: ['honey', 'хані', 'хані-процес', 'медова', 'медовий', 'медовый', 'honey process'],
    ua: 'Хані',
    ru: 'Хани',
  },
  {
    synonyms: ['anaerobic', 'анаеробна', 'анаеробний', 'анаэробная', 'анаэробный', 'anaerobic process'],
    ua: 'Анаеробна',
    ru: 'Анаэробный',
  },
  {
    synonyms: ['carbonic maceration', 'carbonic', 'карбонік', 'карбонік мацерація', 'карбоник', 'карбоник мацерация', 'carbonic process'],
    ua: 'Карбонік мацерація',
    ru: 'Карбоник мацерация',
  },
  {
    synonyms: ['experimental', 'експериментальна', 'експериментальний', 'экспериментальная', 'экспериментальный'],
    ua: 'Експериментальна',
    ru: 'Экспериментальный',
  },
];

const normalizeProcessValue = (value: string) =>
  value
    .toLowerCase()
    .replace(/[‐‑‒–—―]/g, '-') // normalize various dash characters
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const translateProcessValue = (value: string | null | undefined, target: 'ua' | 'ru'): string => {
  if (!value) return '';
  const normalized = normalizeProcessValue(value);
  const dictionaryEntry = processDictionary.find(({ synonyms }) =>
    synonyms.some((synonym) => {
      const normalizedSynonym = normalizeProcessValue(synonym);
      return normalized === normalizedSynonym || normalized.includes(normalizedSynonym) || normalizedSynonym.includes(normalized);
    }),
  );

  if (dictionaryEntry) {
    return target === 'ru' ? dictionaryEntry.ru : dictionaryEntry.ua;
  }

  // Explicit fallback for the most common mismatch
  if (target === 'ru' && /^мита$/i.test(value.trim())) {
    return 'Мытый';
  }

  return value;
};

export interface HomepageSettings {
  id: number;
  // Legacy fields (keep for backward compatibility)
  hero_title_line1?: string | null;
  hero_title_line2?: string | null;
  hero_title_line3?: string | null;
  hero_cta_text?: string | null;
  season_title?: string | null;
  hero_video?: string | null;

  // Hero section i18n fields
  hero_title_line1_ua?: string | null;
  hero_title_line2_ua?: string | null;
  hero_title_line3_ua?: string | null;
  hero_title_line1_ru?: string | null;
  hero_title_line2_ru?: string | null;
  hero_title_line3_ru?: string | null;
  hero_cta_text_ua?: string | null;
  hero_cta_text_ru?: string | null;
  hero_cta_link?: string | null;
  hero_video_url?: string | null;
  
  // Season section i18n fields
  season_title_ua?: string | null;
  season_title_ru?: string | null;
  season_cta_text_ua?: string | null;
  season_cta_text_ru?: string | null;
  season_cta_link?: string | null;
  
  // Video section i18n fields
  video_title1_ua?: string | null;
  video_title2_ua?: string | null;
  video_desc_ua?: string | null;
  video_feature1_ua?: string | null;
  video_feature2_ua?: string | null;
  video_feature3_ua?: string | null;
  video_title1_ru?: string | null;
  video_title2_ru?: string | null;
  video_desc_ru?: string | null;
  video_feature1_ru?: string | null;
  video_feature2_ru?: string | null;
  video_feature3_ru?: string | null;
  video_url?: string | null;
  
  // About section i18n fields
  about_badge_ua?: string | null;
  about_badge_ru?: string | null;
  about_title_ua?: string | null;
  about_title_ru?: string | null;
  about_desc1_ua?: string | null;
  about_desc2_ua?: string | null;
  about_desc1_ru?: string | null;
  about_desc2_ru?: string | null;
  about_cta_text_ua?: string | null;
  about_cta_text_ru?: string | null;
  about_cta_link?: string | null;
  about_image_url?: string | null;
  
  // visibility toggles
  hide_season?: boolean | null;
  hide_video?: boolean | null;
  hide_about?: boolean | null;
  hide_cafes?: boolean | null;
  hide_news?: boolean | null;
}

export interface FeaturedSlide {
  id: number;
  sort: number | null;
  status: string | null;
  title_ua: string;
  description_ua: string | null;
  title_ru: string;
  description_ru: string | null;
  image_url: string | null;
  hover_image_url: string | null;
  link_url: string | null;
  custom_label_ua: string | null;
  custom_label_ru: string | null;
  custom_label_color: string | null;
  custom_label_text_color: string | null;
  label_image_url: string | null;
}

export interface OfficeSettings {
  id: number;
  hero_title_ua: string | null;
  hero_title_ru: string | null;
  hero_subtitle_ua: string | null;
  hero_subtitle_ru: string | null;

  supply_title_ua: string | null;
  supply_title_ru: string | null;
  supply_subtitle_ua: string | null;
  supply_subtitle_ru: string | null;

  supply_coffee_title_ua: string | null;
  supply_coffee_title_ru: string | null;
  supply_coffee_desc_ua: string | null;
  supply_coffee_desc_ru: string | null;
  supply_coffee_point1_ua: string | null;
  supply_coffee_point1_ru: string | null;
  supply_coffee_point2_ua: string | null;
  supply_coffee_point2_ru: string | null;
  supply_coffee_point3_ua: string | null;
  supply_coffee_point3_ru: string | null;

  supply_machines_title_ua: string | null;
  supply_machines_title_ru: string | null;
  supply_machines_desc_ua: string | null;
  supply_machines_desc_ru: string | null;
  supply_machines_point1_ua: string | null;
  supply_machines_point1_ru: string | null;
  supply_machines_point2_ua: string | null;
  supply_machines_point2_ru: string | null;
  supply_machines_point3_ua: string | null;
  supply_machines_point3_ru: string | null;

  supply_water_title_ua: string | null;
  supply_water_title_ru: string | null;
  supply_water_desc_ua: string | null;
  supply_water_desc_ru: string | null;
  supply_water_point1_ua: string | null;
  supply_water_point1_ru: string | null;
  supply_water_point2_ua: string | null;
  supply_water_point2_ru: string | null;

  supply_cups_title_ua: string | null;
  supply_cups_title_ru: string | null;
  supply_cups_desc_ua: string | null;
  supply_cups_desc_ru: string | null;
  supply_cups_point1_ua: string | null;
  supply_cups_point1_ru: string | null;
  supply_cups_point2_ua: string | null;
  supply_cups_point2_ru: string | null;

  discounts_badge_ua: string | null;
  discounts_badge_ru: string | null;
  discounts_title_ua: string | null;
  discounts_title_ru: string | null;
  discounts_desc_ua: string | null;
  discounts_desc_ru: string | null;
  tier1_title_ua: string | null;
  tier1_title_ru: string | null;
  tier1_desc_ua: string | null;
  tier1_desc_ru: string | null;
  tier2_title_ua: string | null;
  tier2_title_ru: string | null;
  tier2_desc_ua: string | null;
  tier2_desc_ru: string | null;
  tier3_title_ua: string | null;
  tier3_title_ru: string | null;
  tier3_desc_ua: string | null;
  tier3_desc_ru: string | null;
  combos_title_ua: string | null;
  combos_title_ru: string | null;
  combos_point1_ua: string | null;
  combos_point1_ru: string | null;
  combos_point2_ua: string | null;
  combos_point2_ru: string | null;

  benefits_delivery_title_ua: string | null;
  benefits_delivery_title_ru: string | null;
  benefits_delivery_desc_ua: string | null;
  benefits_delivery_desc_ru: string | null;
  benefits_schedule_title_ua: string | null;
  benefits_schedule_title_ru: string | null;
  benefits_schedule_desc_ua: string | null;
  benefits_schedule_desc_ru: string | null;
  benefits_support_title_ua: string | null;
  benefits_support_title_ru: string | null;
  benefits_support_desc_ua: string | null;
  benefits_support_desc_ru: string | null;

  cta_title_ua: string | null;
  cta_title_ru: string | null;
  cta_subtitle_ua: string | null;
  cta_subtitle_ru: string | null;
  cta_call_text_ua: string | null;
  cta_call_text_ru: string | null;
  cta_email_text_ua: string | null;
  cta_email_text_ru: string | null;
  cta_phone: string | null;
  cta_email: string | null;
  // visibility toggles
  hide_supply?: boolean | null;
  hide_discounts?: boolean | null;
  hide_benefits?: boolean | null;
  hide_cta?: boolean | null;
}

export function useOfficeSettings() {
  return useQuery({
    queryKey: ['office-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('office_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as OfficeSettings | null;
    },
  });
}

export interface ContactSettings {
  id: number;
  title_ua: string | null;
  title_ru: string | null;
  phone_title_ua: string | null;
  phone_title_ru: string | null;
  phone1: string | null;
  phone2: string | null;
  phone_desc_ua: string | null;
  phone_desc_ru: string | null;
  email_title_ua: string | null;
  email_title_ru: string | null;
  email1: string | null;
  email2: string | null;
  email_desc_ua: string | null;
  email_desc_ru: string | null;
  hours_title_ua: string | null;
  hours_title_ru: string | null;
  hours_details_ua: string | null;
  hours_details_ru: string | null;
  hours_desc_ua: string | null;
  hours_desc_ru: string | null;
  trading_title_ua: string | null;
  trading_title_ru: string | null;
  trading_desc_ua: string | null;
  trading_desc_ru: string | null;
  // visibility toggles
  hide_contact_info?: boolean | null;
  hide_trade_points?: boolean | null;
}

export interface ContactPoint {
  id: number;
  sort: number | null;
  name_ua: string | null;
  name_ru: string | null;
  address: string | null;
  hours_ua: string | null;
  hours_ru: string | null;
  lat?: number | null;
  lng?: number | null;
  open_day?: number | null; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  open_hour?: number | null; // Opening hour (0-23)
  close_hour?: number | null; // Closing hour (0-23)
}

export interface FooterSettings {
  id: number;
  description_ua: string | null;
  description_ru: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  telegram_url: string | null;
  viber_url: string | null;
  whatsapp_url: string | null;
  show_facebook: boolean | null;
  show_instagram: boolean | null;
  show_telegram: boolean | null;
  show_viber: boolean | null;
  show_whatsapp: boolean | null;
  quick_links_title_ua: string | null;
  quick_links_title_ru: string | null;
  contact_title_ua: string | null;
  contact_title_ru: string | null;
  phone_label_ua: string | null;
  phone_label_ru: string | null;
  phone_number: string | null;
  phone_desc_ua: string | null;
  phone_desc_ru: string | null;
  email_label_ua: string | null;
  email_label_ru: string | null;
  email_address: string | null;
  email_desc_ua: string | null;
  email_desc_ru: string | null;
  address_label_ua: string | null;
  address_label_ru: string | null;
  address_text_ua: string | null;
  address_text_ru: string | null;
  address_desc_ua: string | null;
  address_desc_ru: string | null;
  show_phone: boolean | null;
  show_email: boolean | null;
  show_address: boolean | null;
  copyright_text_ua: string | null;
  copyright_text_ru: string | null;
  made_by_text: string | null;
  made_by_url: string | null;
}

export function useContactSettings() {
  return useQuery({
    queryKey: ['contact-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as ContactSettings | null;
    },
  });
}

export interface WaterSettings {
  id: number;
  why_title_ua: string | null;
  why_title_ru: string | null;
  why_desc_ua: string | null;
  why_desc_ru: string | null;
  benefit_natural_title_ua: string | null;
  benefit_natural_title_ru: string | null;
  benefit_natural_desc_ua: string | null;
  benefit_natural_desc_ru: string | null;
  benefit_tested_title_ua: string | null;
  benefit_tested_title_ru: string | null;
  benefit_tested_desc_ua: string | null;
  benefit_tested_desc_ru: string | null;
  benefit_quality_title_ua: string | null;
  benefit_quality_title_ru: string | null;
  benefit_quality_desc_ua: string | null;
  benefit_quality_desc_ru: string | null;
  cta_title_ua: string | null;
  cta_title_ru: string | null;
  cta_desc_ua: string | null;
  cta_desc_ru: string | null;
  cta_view_coffee_ua: string | null;
  cta_view_coffee_ru: string | null;
  cta_contact_ua: string | null;
  cta_contact_ru: string | null;
  test_pdf_url: string | null;
}

export function useWaterSettings() {
  return useQuery({
    queryKey: ['water-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('water_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as WaterSettings | null;
    },
  });
}

export function useContactPoints() {
  return useQuery({
    queryKey: ['contact-points'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_trade_points')
        .select('*')
        .order('sort', { ascending: true, nullsFirst: true });
      if (error) throw error;
      return (data || []) as ContactPoint[];
    },
    refetchOnWindowFocus: true, // Refetch when window regains focus
    staleTime: 0, // Always consider data stale, fetch fresh data
  });
}

export function useFooterSettings() {
  return useQuery({
    queryKey: ['footer-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('footer_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as FooterSettings | null;
    },
  });
}

export interface LegalPage {
  id: number;
  page_type: 'delivery' | 'terms' | 'returns';
  title_ua: string | null;
  title_ru: string | null;
  content_ua: string | null;
  content_ru: string | null;
}

export function useLegalPage(pageType: 'delivery' | 'terms' | 'returns') {
  return useQuery({
    queryKey: ['legal-page', pageType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_pages')
        .select('*')
        .eq('page_type', pageType)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as LegalPage | null;
    },
  });
}

export interface DeliverySettings {
  id: number;
  courier_price: number | null;
  free_delivery_threshold: number | null;
}

export function useDeliverySettings() {
  return useQuery({
    queryKey: ['delivery-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as DeliverySettings | null;
    },
  });
}

// Hook to fetch homepage settings from Supabase
export function useHomepageSettings() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up realtime subscription for homepage settings
    const channel = supabase
      .channel('homepage-settings-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'homepage_settings' 
      }, (payload) => {
        console.log('Homepage settings changed:', payload);
        // Force refetch immediately
        queryClient.invalidateQueries({ queryKey: ['homepage-settings'] });
        queryClient.refetchQueries({ queryKey: ['homepage-settings'] });
      })
      .subscribe((status) => {
        console.log('Homepage settings subscription status:', status);
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['homepage-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as HomepageSettings | null;
    },
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when connection is restored
    staleTime: 0, // Always consider data stale, fetch fresh data
    gcTime: 0, // Don't cache, always fetch fresh
  });
}

// Hook to fetch featured slides from Supabase
export function useFeaturedSlides() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up realtime subscription for featured slides
    const channel = supabase
      .channel('featured-slides-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'featured_products' 
      }, (payload) => {
        console.log('Featured slides changed:', payload);
        queryClient.invalidateQueries({ queryKey: ['featured-slides'] });
        queryClient.refetchQueries({ queryKey: ['featured-slides'] });
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['featured-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_products')
        .select('*')
        .order('sort', { ascending: true, nullsFirst: true })
        .limit(3);
      if (error) throw error;
      return (data || []) as FeaturedSlide[];
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
    gcTime: 0,
  });
}

// ===== Custom Page Sections =====
export interface DBPageSection {
  id: number;
  created_at: string;
  page: 'home' | 'office' | 'contact';
  anchor_key: string;
  sort: number | null;
  active: boolean | null;
  title_ua: string | null;
  title_ru: string | null;
  body_ua: string | null;
  body_ru: string | null;
  media_url: string | null;
  media_type: 'none' | 'image' | 'video' | null;
  button_text_ua: string | null;
  button_text_ru: string | null;
  button_url: string | null;
  bg_color: string | null;
  text_color: string | null;
  accent_color: string | null;
  layout: 'text-left' | 'text-right' | 'center' | null;
  full_width: boolean | null;
}

export function usePageSections(page: 'home' | 'office' | 'contact') {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`page-sections-${page}-realtime`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'page_sections', filter: `page=eq.${page}` }, () => {
        try { queryClient.invalidateQueries({ queryKey: ['page-sections', page] }); } catch {}
      })
      .subscribe();
    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [page, queryClient]);

  return useQuery({
    queryKey: ['page-sections', page],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page', page)
        .order('anchor_key', { ascending: true, nullsFirst: true })
        .order('sort', { ascending: true, nullsFirst: true });
      if (error) throw error;
      return (data || []) as DBPageSection[];
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });
}

// Coffee types from Supabase
export interface DBCoffeeSize {
  id: number;
  product_id: number;
  sort: number | null;
  enabled: boolean | null;
  label_ua: string | null;
  label_ru: string | null;
  weight: number | null;
  price: number | null;
  image_url: string | null;
  special: boolean | null;
}

export interface DBCoffeeProduct {
  id: number;
  slug: string | null;
  sort: number | null;
  name_ua: string;
  name_ru: string;
  description_ua: string | null;
  description_ru: string | null;
  image_url: string | null;
  origin: string | null;
  roast: string | null; // 'light' | 'medium' | 'dark'
  process: string | null; // processing method
  in_stock: boolean | null;
  custom_label: string | null;
  custom_label_ru: string | null;
  custom_label_color: string | null;
  custom_label_text_color: string | null;
  active: boolean | null;
  flavor_notes_array: string[] | null;
  aftertaste_ua?: string[] | null;
  aftertaste_ru?: string[] | null;
  metric_label_strength?: string | null;
  metric_label_acidity?: string | null;
  metric_label_roast?: string | null;
  metric_label_body?: string | null;
  strength_level?: number | null;
  acidity_level?: number | null;
  roast_level?: number | null;
  body_level?: number | null;
  label_data?: any | null;
  label_image_url?: string | null;
  seo_keywords_ua?: string[] | null;
  seo_keywords_ru?: string[] | null;
  coffee_sizes?: DBCoffeeSize[];
}

function mapLevelToString(level: number | null | undefined, low: string, medium: string, high: string): string {
  if (!level) return medium;
  if (level <= 2) return low;
  if (level >= 4) return high;
  return medium;
}

export function useCoffeeProducts() {
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  // Realtime updates for coffee products and sizes
  useEffect(() => {
    const channel = supabase
      .channel('coffee-products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coffee_products' }, () => {
        try { queryClient.invalidateQueries({ queryKey: ['coffee-products'] }); } catch {}
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coffee_sizes' }, () => {
        try { queryClient.invalidateQueries({ queryKey: ['coffee-products'] }); } catch {}
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['coffee-products', language], // Include language to refetch when locale changes
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coffee_products')
        .select('*, coffee_sizes(*)')
        .order('sort', { ascending: true, nullsFirst: false });
      if (error) throw error;
      const list = (data as DBCoffeeProduct[] | null) || [];
      const mappedData = list.map((p) => {
        const sizes = (p.coffee_sizes || []).filter(s => s.price != null);
        const minPrice = sizes.length ? Math.min(...sizes.map(s => s.price || 0)) : 0;
        const name = language === 'ru' ? (p.name_ru || p.name_ua || '') : (p.name_ua || p.name_ru || '');
        const description = language === 'ru' ? (p.description_ru || p.description_ua || '') : (p.description_ua || p.description_ru || '');
        // Choose aftertaste by language, fallback to flavor_notes_array
        const flavorNotes = language === 'ru'
          ? (Array.isArray(p.aftertaste_ru) ? p.aftertaste_ru : (Array.isArray(p.flavor_notes_array) ? p.flavor_notes_array : []))
          : (Array.isArray(p.aftertaste_ua) ? p.aftertaste_ua : (Array.isArray(p.flavor_notes_array) ? p.flavor_notes_array : []));
        const acidity = mapLevelToString(p.acidity_level, 'low', 'medium', 'high');
        const body = mapLevelToString(p.body_level, 'light', 'medium', 'full');
        const rawProcess = (p.process || '').trim();
        const processDisplay = translateProcessValue(rawProcess, language === 'ru' ? 'ru' : 'ua') || rawProcess;
        const mappedSizes = sizes
          .filter((s: DBCoffeeSize) => s.enabled !== false)
          .sort((a: DBCoffeeSize, b: DBCoffeeSize) => (a.sort || 0) - (b.sort || 0))
          .map((s: DBCoffeeSize) => ({
            id: String(s.id),
            label_ua: s.label_ua || (s.weight ? `${s.weight}g` : ''),
            label_ru: s.label_ru || (s.weight ? `${s.weight}g` : ''),
            weight: s.weight || null,
            price: s.price || 0,
            image_url: s.image_url || null,
            special: s.special || false,
          }));
        
        const mappedProduct = {
          id: String(p.id),
          slug: p.slug || String(p.id),
          name,
          origin: p.origin || '',
          roast: p.roast || 'medium',
          price: minPrice,
          image: p.image_url || '/250-g_Original.PNG',
          description,
          weight: sizes.length ? Math.min(...sizes.map(s => s.weight || 0)) : 250,
          flavorNotes,
          acidity,
          body,
          process: processDisplay,
          processDisplay,
          processRaw: rawProcess,
          elevation: 0,
          inStock: !!p.in_stock,
          active: p.active !== false, // Default to true if not explicitly set to false
          custom_label: p.custom_label || null,
          custom_label_ru: p.custom_label_ru || null,
          custom_label_color: p.custom_label_color || '#f59e0b',
          custom_label_text_color: p.custom_label_text_color || '#92400e',
          // Expose numeric metrics and label data for custom labels
          strength_level: p.strength_level || 0,
          acidity_level: p.acidity_level || 0,
          roast_level: p.roast_level || 0,
          body_level: p.body_level || 0,
          label_data: p.label_data || null,
          label_image_url: p.label_image_url || null,
          seo_keywords_ua: p.seo_keywords_ua || null,
          seo_keywords_ru: p.seo_keywords_ru || null,
          sizes: mappedSizes,
        };
        return mappedProduct;
      });
      return mappedData;
    },
    // Refetch behaviours to feel "live"
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });
}

export function useCoffeeProduct(id: string | number) {
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  // Realtime updates for a single product
  useEffect(() => {
    const channel = supabase
      .channel(`coffee-product-${id}-realtime`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coffee_products', filter: `id=eq.${Number(id)}` }, () => {
        try { queryClient.invalidateQueries({ queryKey: ['coffee-product', id] }); } catch {}
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coffee_sizes', filter: `product_id=eq.${Number(id)}` }, () => {
        try { queryClient.invalidateQueries({ queryKey: ['coffee-product', id] }); } catch {}
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [id, queryClient]);

  return useQuery({
    queryKey: ['coffee-product', id, language], // Include language to refetch when locale changes
    queryFn: async () => {
      const idNum = Number(id);
      let p: DBCoffeeProduct | null = null;
      if (!Number.isNaN(idNum) && idNum > 0) {
        const { data, error } = await supabase
          .from('coffee_products')
          .select('*, coffee_sizes(*)')
          .eq('id', idNum)
          .single();
        if (!error && data) p = data as DBCoffeeProduct;
      }
      if (!p && typeof id === 'string') {
        const { data } = await supabase
          .from('coffee_products')
          .select('*, coffee_sizes(*)')
          .eq('slug', id as string)
          .maybeSingle();
        if (data) p = data as DBCoffeeProduct;
      }
      if (!p) return null as any;
      const sizes = (p.coffee_sizes || []).filter(s => s.price != null);
      const minPrice = sizes.length ? Math.min(...sizes.map(s => s.price || 0)) : 0;
      const rawProcess = (p.process || '').trim();
      const processDisplay = translateProcessValue(rawProcess, language === 'ru' ? 'ru' : 'ua') || rawProcess;
      return {
        id: String(p.id),
        slug: p.slug || String(p.id),
        name: language === 'ru' ? (p.name_ru || p.name_ua || '') : (p.name_ua || p.name_ru || ''),
        origin: p.origin || '',
        roast: p.roast || 'medium',
        price: minPrice,
        image: p.image_url || '/250-g_Original.PNG',
        description: language === 'ru' ? (p.description_ru || p.description_ua || '') : (p.description_ua || p.description_ru || ''),
        weight: sizes.length ? Math.min(...sizes.map(s => s.weight || 0)) : 250,
        // Choose aftertaste by language, fallback to flavor_notes_array
        flavorNotes: language === 'ru'
          ? (Array.isArray(p.aftertaste_ru) ? p.aftertaste_ru : (Array.isArray(p.flavor_notes_array) ? p.flavor_notes_array : []))
          : (Array.isArray(p.aftertaste_ua) ? p.aftertaste_ua : (Array.isArray(p.flavor_notes_array) ? p.flavor_notes_array : [])),
        acidity: mapLevelToString(p.acidity_level, 'low', 'medium', 'high'),
        body: mapLevelToString(p.body_level, 'light', 'medium', 'full'),
        process: processDisplay,
        processDisplay,
        processRaw: rawProcess,
        elevation: 0,
        inStock: !!p.in_stock,
        active: p.active !== false,
        custom_label: p.custom_label || null,
        custom_label_ru: p.custom_label_ru || null,
        custom_label_color: p.custom_label_color || '#f59e0b',
        custom_label_text_color: p.custom_label_text_color || '#92400e',
        sizes,
        strength_level: p.strength_level || 0,
        acidity_level: p.acidity_level || 0,
        roast_level: p.roast_level || 0,
        body_level: p.body_level || 0,
        label_data: p.label_data || null,
        label_image_url: p.label_image_url || null,
        seo_keywords_ua: (p as any).seo_keywords_ua || null,
        seo_keywords_ru: (p as any).seo_keywords_ru || null,
      };
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });
}

// Water types from Supabase
export interface DBWaterSize {
  id: number;
  product_id: number;
  sort: number | null;
  enabled: boolean | null;
  label_ua: string | null;
  label_ru: string | null;
  volume: string | null;
  price: number | null;
  image_url: string | null;
}

export interface DBWaterProduct {
  id: number;
  sort: number | null;
  name_ua: string;
  name_ru: string;
  description_ua: string | null;
  description_ru: string | null;
  image_url: string | null;
  volume: string | null;
  price: number | null;
  active: boolean | null;
  features_ua: string[] | null;
  features_ru: string[] | null;
  water_sizes?: DBWaterSize[];
}

export function useWaterProducts() {
  const queryClient = useQueryClient();

  // Realtime updates for water products and sizes
  useEffect(() => {
    const channel = supabase
      .channel('water_products_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'water_products' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['water-products'] });
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'water_sizes' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['water-products'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['water-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('water_products')
        .select('*, water_sizes(*)')
        .order('sort', { ascending: true, nullsFirst: false });
      if (error) throw error;
      const list = (data as DBWaterProduct[] | null) || [];
      const mappedData = list.map((p) => {
        const name = p.name_ua || p.name_ru || '';
        const description = p.description_ua || p.description_ru || '';
        const features = Array.isArray(p.features_ua) ? p.features_ua : [];
        const mappedProduct = {
          id: String(p.id),
          name,
          description,
          image: p.image_url || '/dreamstime_xl_12522351.jpg',
          price: p.price || 0,
          volume: p.volume || '',
          active: p.active !== false,
          features,
        };
        return mappedProduct;
      });
      return mappedData;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });
}

export function useWaterProduct(id: string | number) {
  const queryClient = useQueryClient();

  // Realtime updates for a single product
  useEffect(() => {
    const channel = supabase
      .channel('water_product_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'water_products', filter: `id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['water-product', id] });
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'water_sizes' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['water-product', id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, id]);

  return useQuery({
    queryKey: ['water-product', id],
    queryFn: async () => {
      const idNum = Number(id);
      let p: DBWaterProduct | null = null;
      if (!Number.isNaN(idNum) && idNum > 0) {
        const { data, error } = await supabase
          .from('water_products')
          .select('*, water_sizes(*)')
          .eq('id', idNum)
          .single();
        if (!error && data) p = data as DBWaterProduct;
      }
      if (!p && typeof id === 'string') {
        const { data } = await supabase
          .from('water_products')
          .select('*, water_sizes(*)')
          .eq('slug', id as string)
          .maybeSingle();
        if (data) p = data as DBWaterProduct;
      }
      if (!p) return null as any;
      return {
        id: String(p.id),
        name: p.name_ua || p.name_ru || '',
        description: p.description_ua || p.description_ru || '',
        image: p.image_url || '/dreamstime_xl_12522351.jpg',
        price: p.price || 0,
        volume: p.volume || '',
        active: p.active !== false,
        features: Array.isArray(p.features_ua) ? p.features_ua : [],
      };
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });
}

export function useFilterOptions(language: string = 'ua') {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`filter-options-realtime`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'filter_options' }, () => {
        try {
          queryClient.invalidateQueries({ queryKey: ['filter-options'] });
          queryClient.invalidateQueries({ queryKey: ['filter-options', language] });
        } catch {}
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [queryClient, language]);

  return useQuery({
    queryKey: ['filter-options', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('filter_options')
        .select('*')
        .eq('active', true)
        .order('filter_type', { ascending: true })
        .order('sort', { ascending: true, nullsFirst: true });

      if (error) {
        console.error('Error fetching filter options:', error);
        return { origins: [], roasts: [], originPairs: [], roastPairs: [], processes: [], processPairs: [] } as {
          origins: string[];
          roasts: string[];
          originPairs: { ua: string; ru: string }[];
          roastPairs: { ua: string; ru: string }[];
          processes: string[];
          processPairs: { ua: string; ru: string }[];
        };
      }

      // Use value_ru for Russian, value for Ukrainian/English
      const all = (data || []) as Array<{ filter_type: string; value: string; value_ru?: string | null }>;
      const origins = all
        .filter(f => f.filter_type === 'origin')
        .map(f => language === 'ru' ? (f.value_ru || f.value) : f.value);
      
      const roasts = all
        .filter(f => f.filter_type === 'roast')
        .map(f => language === 'ru' ? (f.value_ru || f.value) : f.value);

      const originPairs = all
        .filter(f => f.filter_type === 'origin')
        .map(f => ({ ua: f.value, ru: f.value_ru || f.value }));

      const roastPairs = all
        .filter(f => f.filter_type === 'roast')
        .map(f => ({ ua: f.value, ru: f.value_ru || f.value }));

      const processOptions = all.filter(f => f.filter_type === 'process');

      const processes = processOptions
        .map((f) => {
          const base = (f.value || '').trim();
          const fallbackUa = translateProcessValue(base, 'ua') || base;
          const fallbackRu = translateProcessValue(base, 'ru') || base;
          if (language === 'ru') {
            return (f.value_ru && f.value_ru.trim()) ? f.value_ru : fallbackRu;
          }
          return fallbackUa;
        })
        .filter((val, idx, arr) => val !== '' && arr.indexOf(val) === idx);

      const processPairs = processOptions.map((f) => {
        const base = (f.value || '').trim();
        const uaValue = translateProcessValue(base, 'ua') || base;
        const ruValue = (f.value_ru && f.value_ru.trim()) ? f.value_ru : (translateProcessValue(base, 'ru') || base);
        return { ua: uaValue, ru: ruValue };
      });

      return { origins, roasts, originPairs, roastPairs, processes, processPairs };
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });
}
