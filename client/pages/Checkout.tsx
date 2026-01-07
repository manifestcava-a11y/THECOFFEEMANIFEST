import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../contexts/CartContext";
import { useState, useMemo, useEffect } from "react";
import type { UIEvent } from "react";
import emailjs from "@emailjs/browser";
import { useDeliverySettings } from "../hooks/use-supabase";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

type ShippingMethod = "nova_department" | "nova_courier" | "own_courier" | "nova_postomat";
type PaymentMethod = "liqpay" | "apple_pay" | "google_pay" | "cash";

type WarehouseMeta = {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  nextPage: number | null;
};

const WAREHOUSE_PAGE_SIZE = 100;
const DEFAULT_WAREHOUSE_META: WarehouseMeta = {
  page: 1,
  pageSize: WAREHOUSE_PAGE_SIZE,
  total: 0,
  hasMore: false,
  nextPage: null,
};

export default function Checkout() {
  const { items, totalPrice, clear } = useCart();
  const navigate = useNavigate();
  const { data: deliverySettings } = useDeliverySettings();
  const { t, language } = useLanguage();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [cityRef, setCityRef] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("nova_department");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("liqpay");
  const [department, setDepartment] = useState("");
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [manualWarehouseEnabled, setManualWarehouseEnabled] = useState(false);
  const [manualWarehouseValue, setManualWarehouseValue] = useState("");
  const [postomatNumber, setPostomatNumber] = useState("");
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingMoreWarehouses, setLoadingMoreWarehouses] = useState(false);
  const [warehouseMeta, setWarehouseMeta] =
    useState<WarehouseMeta>({ ...DEFAULT_WAREHOUSE_META });
  const [settlements, setSettlements] = useState<any[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to allow only numbers
  const handleNumberInput = (value: string): string => {
    return value.replace(/\D/g, '');
  };

  // Format shipping address based on shipping method
  const formatShippingAddress = (): string => {
    let addr = city || '';
    if (shippingMethod === 'nova_postomat') {
      // For postomats, use the postomat number input
      if (postomatNumber.trim()) {
        addr = addr ? `${addr}, ${t('checkout.postomat')} ${postomatNumber.trim()}` : `${t('checkout.postomat')} ${postomatNumber.trim()}`;
        return addr || t('checkout.notSpecified');
      }
    }
    const manualActive = manualWarehouseEnabled && manualWarehouseValue.trim();
    if (manualActive) {
      const manualLabel = `${t('checkout.department')} №${manualWarehouseValue.trim()}`;
      addr = addr ? `${addr}, ${manualLabel}` : manualLabel;
      return addr || t('checkout.notSpecified');
    }
    if (selectedWarehouse) {
      const selectedWh = warehouses.find((wh: any) => wh.Ref === selectedWarehouse);
      if (selectedWh) {
        const whDesc = selectedWh.Description || selectedWh.ShortAddress || '';
        // Extract department number from description
        const deptMatch = whDesc.match(/№(\d+)/);
        const deptNum = deptMatch ? deptMatch[1] : (department || '');
        if (deptNum) {
          addr += addr ? `, ${t('checkout.department')} №${deptNum}` : `${t('checkout.department')} №${deptNum}`;
        } else {
          addr += addr ? `, ${whDesc}` : whDesc;
        }
      } else if (department) {
        addr += addr ? `, ${t('checkout.department')} №${department}` : `${t('checkout.department')} №${department}`;
      }
    } else if (department) {
      addr += addr ? `, ${t('checkout.department')} №${department}` : `${t('checkout.department')} №${department}`;
    }
    return addr || t('checkout.notSpecified');
  };

  // Format shipping method display name
  const formatShippingMethodName = (): string => {
    switch (shippingMethod) {
      case 'nova_department':
        return t('checkout.novaDepartment');
      case 'nova_postomat':
        return t('checkout.novaPostomat');
      case 'nova_courier':
        return t('checkout.novaCourier');
      case 'own_courier':
        return t('checkout.courierKyiv');
      default:
        return t('checkout.notSpecified');
    }
  };


  // Fallback: send order emails via EmailJS browser SDK (same logic as test button)
  // Used when server-side email sending is unavailable or misconfigured
  // Works in dev with VITE_* vars; in production we also try using safe defaults (public key + template/service IDs)
  async function sendOrderEmailsClientSide(orderIdFromServer?: string) {
    try {
      const serviceId = (import.meta.env.VITE_EMAILJS_SERVICE_ID as string) || 'service_kifgtn2';
      const templateIdCustomer = (import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CUSTOMER as string) || 'template_gjxblw6';
      const templateIdAdmin = (import.meta.env.VITE_EMAILJS_TEMPLATE_ID_ADMIN as string) || 'template_4ft87b9';
      const publicKey = (import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string) || 'dK2FblsCDGEM8ZpPq';
      const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS as string) || 'dovedem2014@gmail.com,manifestcava@gmail.com';

      if (!serviceId || !templateIdCustomer || !templateIdAdmin || !publicKey) {
        console.warn("[Email Fallback] EmailJS config missing; cannot send client-side");
        return;
      }

      const customerEmail = email;
      if (!customerEmail || !/\S+@\S+\.\S+/.test(customerEmail)) {
        console.warn("[Email Fallback] Invalid customer email; skipping client send");
        return;
      }

      const formattedShippingAddress = formatShippingAddress();
      const formattedShippingMethod = formatShippingMethodName();
      const orderId = orderIdFromServer || `ORDER-${Date.now()}`;

      const templateParams: Record<string, any> = {
        to_email: customerEmail,
        to_name: fullName || t('checkout.email.client'),
        order_id: orderId,
        order_date: new Date().toLocaleDateString(language === 'ru' ? 'ru-RU' : 'uk-UA'),
        order_items_html: items.length > 0 ? items.map((item: any) => {
          const itemName = item.name || t('checkout.email.product');
          const variantText = item.variant ? ` (${item.variant})` : '';
          const quantity = item.quantity || 1;
          const price = item.price || 0;
          const total = (price * quantity).toFixed(2);
          return `${itemName}${variantText} - ${quantity} ${t('checkout.email.unit')} × ${price.toFixed(2)} ${t('checkout.email.currency')} = ${total} ${t('checkout.email.currency')}`;
        }).join('\n') : t('checkout.email.productsNotFound'),
        customer_name: fullName || t('checkout.email.client'),
        billing_address: formattedShippingAddress,
        information: formattedShippingAddress, // Alias for "Information" label
        customer_phone: phone || '—',
        customer_email: customerEmail,
        shipping_address: formattedShippingAddress,
        order_notes: notes || '', // Leave empty if no notes
        order_total: `₴${(totalPrice + shippingPrice).toFixed(2)}`,
        shipping_method: formattedShippingMethod,
        shipping_cost: shippingCostLabel,
        payment_method: paymentMethod === 'cash' ? t('checkout.email.paymentCash') : paymentMethod === 'liqpay' ? t('checkout.email.paymentLiqpay') : paymentMethod || t('checkout.notSpecified'),
        reply_to: customerEmail,
        shipping_city: city || null,
        shipping_department: shippingMethod === 'nova_postomat' ? (postomatNumber.trim() || null) : (department || null),
        shipping_warehouse_ref: selectedWarehouse || null,
      };

      // Customer email
      const customerTemplateParams = { to_email: customerEmail.trim(), ...templateParams };
      Object.keys(customerTemplateParams).forEach(key => {
        if (customerTemplateParams[key] === undefined || customerTemplateParams[key] === '') delete (customerTemplateParams as any)[key];
      });
      const customerRes = await emailjs.send(serviceId, templateIdCustomer, customerTemplateParams, publicKey);
      console.log('[Email Fallback] Customer email result:', customerRes?.status, customerRes?.text);

      // Admin emails
      const admins = adminEmails.split(',').map((e) => e.trim()).filter(Boolean);
      for (const admin of admins) {
        if (!admin || !admin.includes('@')) continue;
        const adminTemplateParams: Record<string, any> = { ...templateParams, to_email: admin.trim(), to_name: t('checkout.email.admin') };
        Object.keys(adminTemplateParams).forEach(key => {
          if (adminTemplateParams[key] === undefined || adminTemplateParams[key] === '') delete adminTemplateParams[key];
        });
        const r = await emailjs.send(serviceId, templateIdAdmin, adminTemplateParams, publicKey);
        console.log('[Email Fallback] Admin email to', admin, '=>', r?.status, r?.text);
      }
    } catch (e) {
      console.error('[Email Fallback] Error sending emails via browser:', e);
    }
  }

  // Check if cart contains water items
  const hasWaterItems = useMemo(() => {
    return items.some(item => item.type === 'water');
  }, [items]);

  // Auto-set shipping method to own_courier if water is in cart
  useEffect(() => {
    if (hasWaterItems && shippingMethod !== 'own_courier') {
      setShippingMethod('own_courier');
      setCityRef('');
      setCity('');
      setCityQuery('');
      setSelectedWarehouse('');
      setWarehouses([]);
    }
  }, [hasWaterItems, shippingMethod]);

  const courierPrice = deliverySettings?.courier_price || 200;
  const freeDeliveryThreshold = deliverySettings?.free_delivery_threshold || 1500;

  const isNovaPoshtaMethod =
    shippingMethod === 'nova_department' ||
    shippingMethod === 'nova_postomat' ||
    shippingMethod === 'nova_courier';
  const qualifiesForFreeDelivery = isNovaPoshtaMethod && totalPrice >= freeDeliveryThreshold;

  const shippingPrice = useMemo(() => {
    if (shippingMethod === "own_courier") return courierPrice;
    // Nova Poshta pricing handled on delivery, but show 0 here when free delivery applies
    return 0;
  }, [shippingMethod, courierPrice]);

  // Calculate price specifically for own_courier button display
  const ownCourierPrice = useMemo(() => {
    return courierPrice;
  }, [courierPrice]);

  const shippingIsFree = useMemo(() => {
    if (qualifiesForFreeDelivery) {
      return true;
    }
    if (shippingMethod === 'own_courier') {
      return shippingPrice === 0;
    }
    return false;
  }, [qualifiesForFreeDelivery, shippingMethod, shippingPrice]);

  const shippingCarrierRates = useMemo(() => {
    return isNovaPoshtaMethod && !shippingIsFree;
  }, [isNovaPoshtaMethod, shippingIsFree]);

  const shippingCostLabel = useMemo(() => {
    if (shippingIsFree) {
      return t('checkout.free');
    }
    if (shippingMethod === 'own_courier' && shippingPrice > 0) {
      return `₴${shippingPrice.toFixed(2)}`;
    }
    if (shippingCarrierRates) {
      return t('checkout.carrierRates');
    }
    if (shippingPrice > 0) {
      return `₴${shippingPrice.toFixed(2)}`;
    }
    if (shippingPrice === 0) {
      return t('checkout.free');
    }
    return t('checkout.notSpecified');
  }, [shippingIsFree, shippingMethod, shippingPrice, shippingCarrierRates, t]);

  const makeWarehouseKey = (wh: any): string => {
    return (
      wh?.Ref ||
      wh?.SiteKey ||
      wh?.Number ||
      wh?.PostomatNumber ||
      wh?.Description ||
      wh?.ShortAddress ||
      ""
    );
  };

  const mergeWarehouseLists = (
    existing: any[],
    incoming: any[]
  ): { list: any[]; added: number } => {
    const result: any[] = [...existing];
    const seen = new Set<string>();
    for (const wh of existing) {
      const key = makeWarehouseKey(wh);
      if (key) {
        seen.add(key);
      }
    }
    let added = 0;
    for (const wh of incoming) {
      const key = makeWarehouseKey(wh);
      if (key && seen.has(key)) {
        continue;
      }
      if (key) {
        seen.add(key);
      }
      result.push(wh);
      added += 1;
    }
    return { list: result, added };
  };

  // Load warehouses when city is selected (only for departments, not postomats)
  const loadWarehouses = async (page: number = 1, append = false) => {
    const currentCityRef = cityRef;
    const currentShippingMethod = shippingMethod;

    // Only load warehouses for departments, not postomats
    if (!currentCityRef || currentShippingMethod !== "nova_department") {
      return;
    }

    const pageSize = warehouseMeta.pageSize || WAREHOUSE_PAGE_SIZE;

    if (append) {
      if (loadingMoreWarehouses || loadingWarehouses) {
        return;
      }
      setLoadingMoreWarehouses(true);
    } else {
      setLoadingWarehouses(true);
      setWarehouseMeta({ ...DEFAULT_WAREHOUSE_META, pageSize });
    }

    try {
      console.log(
        "Loading warehouses for cityRef:",
        currentCityRef,
        "page:",
        page,
        "append:",
        append
      );

      const params = new URLSearchParams();
      params.append("cityRef", currentCityRef);
      params.append("type", "department");
      const cityNameParam = (city || cityQuery || "").trim();
      if (cityNameParam) {
        params.append("cityName", cityNameParam);
      }
      params.append("countryCode", "UA");
      params.append("page", String(page));
      params.append("pageSize", String(pageSize));

      const res = await fetch(`/api/warehouses?${params.toString()}`, {
        headers: {
          "Accept-Language": language === "ru" ? "ru" : "uk",
        },
      });
      const data = await res.json();
      console.log("Warehouses API response:", data);

      if (cityRef !== currentCityRef || shippingMethod !== currentShippingMethod) {
        return;
      }

      const items = Array.isArray(data?.data) ? data.data : [];
      const existingList = append ? warehouses : [];
      const { list: mergedList } = mergeWarehouseLists(existingList, items);
      setWarehouses(mergedList);

      const meta = data?.meta || {};
      const metaPage =
        typeof meta.page === "number" && meta.page > 0 ? meta.page : page;
      const metaPageSize =
        typeof meta.pageSize === "number" && meta.pageSize > 0
          ? meta.pageSize
          : pageSize;
      const totalFromMeta =
        typeof meta.total === "number" && meta.total >= 0
          ? meta.total
          : mergedList.length;
      const hasMoreFromMeta =
        typeof meta.hasMore === "boolean"
          ? meta.hasMore
          : mergedList.length < totalFromMeta;
      const nextPageFromMeta =
        typeof meta.nextPage === "number" && meta.nextPage > metaPage
          ? meta.nextPage
          : hasMoreFromMeta
          ? metaPage + 1
          : null;

      setWarehouseMeta({
        page: metaPage,
        pageSize: metaPageSize,
        total: totalFromMeta,
        hasMore: hasMoreFromMeta,
        nextPage: nextPageFromMeta,
      });

      // No auto-fetch fallback; rely on explicit user scroll or button to load more

      if (!data?.success && data?.status !== "200") {
        console.warn("Warehouses API returned unexpected response shape:", data);
      }
    } catch (err) {
      console.error("Failed to load warehouses:", err);
      if (!append) {
        setWarehouses([]);
        setWarehouseMeta({ ...DEFAULT_WAREHOUSE_META });
      }
    } finally {
      if (append) {
        setLoadingMoreWarehouses(false);
      } else {
        setLoadingWarehouses(false);
      }
    }
  };

  const loadMoreWarehouses = async () => {
    if (
      !warehouseMeta.hasMore ||
      loadingMoreWarehouses ||
      loadingWarehouses
    ) {
      return;
    }
    const nextPage =
      warehouseMeta.nextPage ?? warehouseMeta.page + 1;
    await loadWarehouses(nextPage, true);
  };

  const handleWarehouseScroll = (event: UIEvent<HTMLDivElement>) => {
    if (
      !warehouseMeta.hasMore ||
      loadingMoreWarehouses ||
      loadingWarehouses
    ) {
      return;
    }
    const target = event.currentTarget;
    const threshold = 24;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - threshold) {
      loadMoreWarehouses();
    }
  };

  // Load warehouses when cityRef changes (only for departments, not postomats)
  useEffect(() => {
    if (cityRef && shippingMethod === 'nova_department') {
      setSelectedWarehouse(""); // Clear selection when switching
      setManualWarehouseEnabled(false);
      setManualWarehouseValue("");
      loadWarehouses(1, false);
    } else if (shippingMethod === 'nova_postomat') {
      // For postomats, clear warehouse-related state but don't load from API
      setSelectedWarehouse("");
      setWarehouses([]);
      setManualWarehouseEnabled(false);
      setManualWarehouseValue("");
      setWarehouseMeta({ ...DEFAULT_WAREHOUSE_META });
      setLoadingWarehouses(false);
      setLoadingMoreWarehouses(false);
    } else {
      setWarehouseMeta({ ...DEFAULT_WAREHOUSE_META });
      setLoadingMoreWarehouses(false);
    }
  }, [cityRef, shippingMethod]);

  // Clear warehouse selection when switching shipping methods
  useEffect(() => {
    if (shippingMethod !== 'nova_department' && shippingMethod !== 'nova_postomat') {
      setSelectedWarehouse("");
      setWarehouses([]);
      setManualWarehouseEnabled(false);
      setManualWarehouseValue("");
      setPostomatNumber("");
      setWarehouseMeta({ ...DEFAULT_WAREHOUSE_META });
      setLoadingWarehouses(false);
      setLoadingMoreWarehouses(false);
    } else if (shippingMethod === 'nova_postomat') {
      // Clear department-related state when switching to postomat
      setSelectedWarehouse("");
      setWarehouses([]);
      setManualWarehouseEnabled(false);
      setManualWarehouseValue("");
      setDepartment("");
      setWarehouseMeta({ ...DEFAULT_WAREHOUSE_META });
      setLoadingWarehouses(false);
      setLoadingMoreWarehouses(false);
    }
  }, [shippingMethod]);

  // Debounced city search suggestions
  useEffect(() => {
    const q = cityQuery.trim();
    if (hasWaterItems || (shippingMethod !== 'nova_department' && shippingMethod !== 'nova_postomat')) {
      setSettlements([]);
      setShowCityDropdown(false);
      return;
    }
    // Don't show dropdown if city is already selected (we have cityRef)
    if (cityRef) {
      setShowCityDropdown(false);
      return;
    }
    if (q.length < 2) {
      setSettlements([]);
      setShowCityDropdown(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        console.log('Searching for city:', q);
        const res = await fetch(`/api/settlements?cityName=${encodeURIComponent(q)}`);
        const json = await res.json();
        console.log('Settlements response:', json);

        let results: any[] = [];
        const ok = (json?.success === true) || (json?.status === '200');
        if (ok && Array.isArray(json.data) && json.data.length > 0) {
          // Nova Poshta response may nest addresses under data[0].Addresses
          const firstEntry = json.data[0];
          if (Array.isArray(firstEntry?.Addresses)) {
            results = firstEntry.Addresses;
          } else {
            results = json.data;
          }
        }
        console.log('Parsed settlements:', results);
        setSettlements(results);
        // Only show dropdown if we don't have a cityRef selected
        setShowCityDropdown(results.length > 0 && !cityRef);
      } catch (err) {
        console.error('Error fetching settlements:', err);
        setSettlements([]);
        setShowCityDropdown(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [cityQuery, shippingMethod, cityRef, hasWaterItems]);

  function handleSelectSettlement(s: any) {
    const name = s?.Present || s?.Description || s?.MainDescription || s?.City || "";
    const ref = s?.Ref || s?.DeliveryCity || s?.SettlementRef || s?.RefAddress || "";
    setCity(name);
    setCityQuery(name);
    setCityRef(ref);
    setShowCityDropdown(false);
    setSettlements([]); // Clear settlements to prevent dropdown from showing again
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailValid = /\S+@\S+\.\S+/.test(email);
    const phoneValid = phone.trim().length >= 7;
    let valid = !!fullName && phoneValid && emailValid;
    
    const hasWarehouses = (shippingMethod === 'nova_department' || shippingMethod === 'nova_postomat');
    const hasWaterRestriction = hasWaterItems && shippingMethod !== 'own_courier';
    const manualActive = manualWarehouseEnabled && manualWarehouseValue.trim().length > 0;
    if (shippingMethod === 'nova_postomat') {
      // For postomats, require city and postomat number
      valid = valid && !!cityRef && !!postomatNumber.trim();
    } else if (shippingMethod === 'nova_department') {
      const hasWarehouseSelection = manualActive || !!selectedWarehouse;
      valid = valid && !!cityRef && hasWarehouseSelection;
    } else {
      valid = valid && !!address;
    }
    if (!valid) {
      toast({ title: t('checkout.error.general'), description: t('checkout.error.fillFields'), variant: "destructive" as any });
      return;
    }
    if (items.length === 0) {
      navigate("/basket");
      return;
    }

    try {
      setIsSubmitting(true);
      // Reset pending purchase marker before a new payment attempt
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pendingPurchase");
      }
      
      // Debug: Log what we're sending - VERIFY VARIANT IS IN ITEMS
      console.log('=== CHECKOUT SUBMIT DEBUG ===');
      console.log('Items being sent:', items.map((it: any) => ({ 
        name: it.name, 
        variant: it.variant, 
        hasVariant: !!it.variant,
        variantType: typeof it.variant,
        fullItem: it
      })));
      console.log('Shipping:', {
        method: shippingMethod,
        city,
        cityRef,
        address,
        warehouseRef: manualActive ? `manual::${manualWarehouseValue.trim()}` : selectedWarehouse,
        department: manualActive ? manualWarehouseValue.trim() : (department || null),
      });
      console.log('Payment method:', paymentMethod);
      
      const orderPayload = {
        customer: { fullName, phone, email },
        shipping: { 
          method: shippingMethod, 
          city, 
          cityRef, 
          address, 
          warehouseRef: shippingMethod === 'nova_postomat' 
            ? `postomat::${postomatNumber.trim()}` 
            : (manualActive ? `manual::${manualWarehouseValue.trim()}` : selectedWarehouse),
          department: shippingMethod === 'nova_postomat' 
            ? postomatNumber.trim() 
            : (manualActive ? manualWarehouseValue.trim() : (department || null)),
          price: shippingPrice,
          free: shippingIsFree,
          carrierRates: shippingCarrierRates,
        },
        payment: { method: paymentMethod },
        notes,
        items,
      };
      
      console.log('Full payload items:', JSON.stringify(orderPayload.items, null, 2));
      
      const res = await fetch("/api/orders/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      console.log("Order prepare response:", data);
      
      if (!res.ok) throw new Error(data?.error || t('checkout.error.createOrder'));
      
      // Log email sending status if available
      if (data.emailStatus) {
        console.log("=== EMAIL STATUS FROM SERVER ===");
        console.log("Email attempted:", data.emailStatus.attempted);
        console.log("Email configured:", data.emailStatus.configured);
        if (!data.emailStatus.attempted) {
          console.warn("Email not sent - reason:", data.emailStatus.reason);
        }
        if (data.emailStatus.attempted && !data.emailStatus.configured) {
          console.warn("Email attempted but EmailJS not configured!");
        }
        console.log("=== END EMAIL STATUS ===");
      }

      // Client-side fallback: if server-side emails failed/misconfigured, try sending via browser (public key)
      try {
        if (paymentMethod === 'cash' || data.paymentMethod === 'cash') {
          let shouldFallback = false;
          if (data.emailStatus) {
            const attempted = !!data.emailStatus.attempted;
            const configured = !!data.emailStatus.configured;
            // Only fallback when server email wasn't attempted or not configured.
            // Do NOT fallback on individual send failures to avoid client 422 due to domain restrictions.
            shouldFallback = !attempted || !configured;
          } else {
            shouldFallback = true; // no status info, attempt fallback
          }
          // Never run fallback outside local dev. Only allow on localhost.
          const isLocalhost = typeof window !== 'undefined' && (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1'
          );
          if (!isLocalhost) {
            console.warn('[Email Fallback] Disabled outside localhost; relying on server-side email.');
            shouldFallback = false;
          }
          if (shouldFallback) {
            console.log('[Email Fallback] Trying client-side EmailJS send...');
            await sendOrderEmailsClientSide(data?.orderId);
          }
        }
      } catch (fallbackErr) {
        console.warn('[Email Fallback] Client-side send failed:', fallbackErr);
      }

      // Handle different payment methods
      if (paymentMethod === "cash" || data.paymentMethod === "cash") {
        // For cash payment, clear cart and show success message
        clear();
        toast({ 
          title: t('checkout.success.title'), 
          description: t('checkout.success.desc'),
          variant: "default" as any 
        });
        navigate("/");
        return;
      }

      // For online payments (LiqPay, Apple Pay, Google Pay), redirect to payment
      if (data.data && data.signature) {
        // Persist purchase details so we can fire conversion after confirmed return
        if (typeof window !== "undefined" && data.orderId) {
          const purchaseValue = Number((totalPrice + shippingPrice).toFixed(2));
          sessionStorage.setItem(
            "pendingPurchase",
            JSON.stringify({
              orderId: data.orderId,
              value: purchaseValue,
              currency: "UAH",
              createdAt: Date.now(),
            })
          );
        }

        // Redirect to LiqPay page with prepared data/signature
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://www.liqpay.ua/api/3/checkout';
        form.style.display = 'none';

        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'data';
        dataInput.value = data.data;
        const signatureInput = document.createElement('input');
        signatureInput.type = 'hidden';
        signatureInput.name = 'signature';
        signatureInput.value = data.signature;
        form.appendChild(dataInput);
        form.appendChild(signatureInput);
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err: any) {
      toast({ title: t('checkout.error.general'), description: err?.message || t('checkout.error.general'), variant: "destructive" as any });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-coffee-background">
      <Header />
      <section className="pt-28 pb-16" style={{ backgroundColor: '#361c0c' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-black mb-8 leading-tight font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>
            {t('checkout.title')}
          </h1>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="font-bold mb-2" style={{ color: '#361c0c' }}>{t('checkout.contactInfo')}</div>
              <Input placeholder={t('checkout.fullName')} value={fullName} onChange={e => setFullName(e.target.value)} className="mb-3" />
              <Input placeholder={t('checkout.phone')} value={phone} onChange={e => setPhone(handleNumberInput(e.target.value))} className="mb-3" />
              <Input placeholder={t('checkout.email')} type="email" value={email} onChange={e => setEmail(e.target.value)} className="mb-3" />
            </div>

            <div className="md:col-span-2">
              <div className="font-bold mb-2" style={{ color: '#361c0c' }}>{t('checkout.delivery')}</div>
              {hasWaterItems ? (
                <div className="mb-3">
                  <button type="button" className="border p-3 text-left w-full border-[#361c0c] bg-[#fcf4e4] cursor-default">
                    <div className="font-bold" style={{ color: '#361c0c' }}>{t('checkout.courierKyiv')}</div>
                    <div className="text-sm text-gray-600">{ownCourierPrice === 0 ? t('checkout.free') : `₴${ownCourierPrice}`}</div>
                    {hasWaterItems && (
                      <div className="text-xs text-gray-500 mt-1">{t('checkout.requiredForWater')}</div>
                    )}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  <button type="button" onClick={() => setShippingMethod('nova_department')} className={`border p-3 text-left ${shippingMethod==='nova_department' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                    <div className="font-bold" style={{ color: '#361c0c' }}>{t('checkout.novaDepartment')}</div>
                    <div className="text-sm text-gray-600">{t('checkout.carrierRates')}</div>
                  </button>
                  <button type="button" onClick={() => setShippingMethod('nova_postomat')} className={`border p-3 text-left ${shippingMethod==='nova_postomat' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                    <div className="font-bold" style={{ color: '#361c0c' }}>{t('checkout.novaPostomat')}</div>
                    <div className="text-sm text-gray-600">{t('checkout.carrierRates')}</div>
                  </button>
                  <button type="button" onClick={() => setShippingMethod('nova_courier')} className={`border p-3 text-left ${shippingMethod==='nova_courier' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                    <div className="font-bold" style={{ color: '#361c0c' }}>{t('checkout.novaCourier')}</div>
                    <div className="text-sm text-gray-600">{t('checkout.carrierRates')}</div>
                  </button>
                  <button type="button" onClick={() => setShippingMethod('own_courier')} className={`border p-3 text-left ${shippingMethod==='own_courier' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                    <div className="font-bold" style={{ color: '#361c0c' }}>{t('checkout.courierKyiv')}</div>
                    <div className="text-sm text-gray-600">{ownCourierPrice === 0 ? t('checkout.free') : `₴${ownCourierPrice}`}</div>
                  </button>
                </div>
              )}

              {!hasWaterItems && (
                <>
                  {/* City field only for Nova Poshta (postomat/department) */}
                  {(shippingMethod === 'nova_department' || shippingMethod === 'nova_postomat') && (
                <>
                  <div className="relative mb-2">
                    <Input placeholder={t('checkout.city')} value={cityQuery} onChange={e => { setCityQuery(e.target.value); setCityRef(""); setCity(""); }} />
                    {showCityDropdown && settlements.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 border border-gray-300 rounded bg-white shadow-lg max-h-56 overflow-auto z-50">
                        {settlements.slice(0, 12).map((s: any, i: number) => (
                          <button type="button" key={i} onClick={() => handleSelectSettlement(s)} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">
                            {(s?.Present || s?.Description || s?.MainDescription || s?.City) as string}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                      {city && !cityRef && (
                    <div className="text-sm text-orange-600 mb-2">
                      {t('checkout.selectCityFromList')} {shippingMethod === 'nova_postomat' ? t('checkout.postomats') : t('checkout.departments')}
                    </div>
                  )}
                    {shippingMethod === 'nova_postomat' ? (
                      /* Postomat: Simple input field for locker number */
                      <div className="mb-3">
                        <Input 
                          placeholder={t('checkout.postomatNumber')} 
                          value={postomatNumber} 
                          onChange={e => setPostomatNumber(e.target.value)} 
                        />
                      </div>
                    ) : (
                      /* Department: Select dropdown with manual entry option */
                      <div className="mb-3">
                        <Select value={manualWarehouseEnabled ? '' : selectedWarehouse} onValueChange={(value) => {
                          setManualWarehouseEnabled(false);
                          setManualWarehouseValue("");
                          setSelectedWarehouse(value);
                          // Extract department number from selected warehouse
                          const selectedWh = warehouses.find((wh: any) => wh.Ref === value);
                          if (selectedWh) {
                            // Extract number from Description (e.g., "Відділення №1" -> "1")
                            const desc = selectedWh.Description || '';
                            const match = desc.match(/№\s*(\d+)/i) || desc.match(/(\d+)/);
                            if (match) {
                              setDepartment(match[1]);
                            } else {
                              setDepartment('');
                            }
                          } else {
                            setDepartment('');
                          }
                        }}>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingWarehouses ? t('checkout.loading') : t('checkout.selectDepartment')} />
                        </SelectTrigger>
                        <SelectContent onViewportScroll={handleWarehouseScroll}>
                          {warehouses.length > 0 ? (
                            <>
                              {warehouses.map((wh: any) => (
                                <SelectItem key={wh.Ref} value={wh.Ref}>
                                  {wh.Description} - {wh.ShortAddress}
                                </SelectItem>
                              ))}
                              {warehouseMeta.hasMore && (
                                <div className="px-2 pb-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      loadMoreWarehouses();
                                    }}
                                    className="w-full rounded-md border border-dashed border-[#361c0c] bg-white px-3 py-2 text-sm font-semibold text-[#361c0c] transition hover:bg-[#fcf4e4] disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={loadingMoreWarehouses}
                                  >
                                    {loadingMoreWarehouses
                                      ? t('checkout.loadingMoreWarehouses')
                                      : t('checkout.loadMoreWarehouses')}
                                  </button>
                                </div>
                              )}
                              {!warehouseMeta.hasMore && warehouses.length > 0 && (
                                <div className="px-3 pb-2 pt-1 text-xs text-gray-500">
                                  {t('checkout.noMoreWarehouses')}
                                </div>
                              )}
                            </>
                          ) : (
                            <SelectItem value="no-data" disabled>
                              {cityRef ? (loadingWarehouses ? t('checkout.loading') : t('checkout.noDepartments')) : t('checkout.selectCityFirst')}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {shippingMethod === 'nova_department' && (
                        <div className="mt-2">
                          {!manualWarehouseEnabled ? (
                            <button
                              type="button"
                              className="text-sm text-[#361c0c] underline hover:no-underline"
                              onClick={() => {
                                setManualWarehouseEnabled(true);
                                setManualWarehouseValue("");
                                setSelectedWarehouse("");
                                setDepartment("");
                              }}
                            >
                              {t('checkout.manualPromptDepartment')}
                            </button>
                          ) : (
                            <div className="space-y-2">
                              <Input
                                placeholder={t('checkout.manualEntryPlaceholder')}
                                value={manualWarehouseValue}
                                onChange={(e) => {
                                  const value = handleNumberInput(e.target.value);
                                  setManualWarehouseValue(value);
                                  setDepartment(value.trim());
                                }}
                              />
                              <button
                                type="button"
                                className="text-sm text-[#361c0c] underline hover:no-underline"
                                onClick={() => {
                                  setManualWarehouseEnabled(false);
                                  setManualWarehouseValue("");
                                  setDepartment("");
                                }}
                              >
                                {t('checkout.cancelManualEntry')}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    )}
                    </>
                  )}
                  {/* Address field for courier options (no city field) */}
                  {(shippingMethod === 'nova_courier' || shippingMethod === 'own_courier') && (
                    <Input placeholder={t('checkout.deliveryAddress')} value={address} onChange={e => setAddress(e.target.value)} className="mb-3" />
                  )}
                </>
              )}
              {hasWaterItems && (
                <Input placeholder={t('checkout.deliveryAddress')} value={address} onChange={e => setAddress(e.target.value)} className="mb-3" />
              )}
              
              {isNovaPoshtaMethod && !qualifiesForFreeDelivery && (
                <div className="text-sm text-gray-700 mb-4 font-bold">
                  {t('checkout.addItemsForFreeDeliveryNova').replace('{amount}', (freeDeliveryThreshold - totalPrice).toFixed(2))}
                </div>
              )}
              
              <div className="font-bold mb-2" style={{ color: '#361c0c' }}>{t('checkout.paymentMethod')}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <button type="button" onClick={() => setPaymentMethod('liqpay')} className={`border p-3 text-left flex items-center gap-2 ${paymentMethod==='liqpay' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                  <img src="/unnamed (2).png" alt="LiqPay" className="w-6 h-6 object-contain" />
                  <div>
                    <div className="font-bold" style={{ color: '#361c0c' }}>LiqPay</div>
                    <div className="text-sm text-gray-600">{t('checkout.cardOnline')}</div>
                  </div>
                </button>
                <button type="button" onClick={() => setPaymentMethod('apple_pay')} className={`border p-3 text-left flex items-center gap-2 ${paymentMethod==='apple_pay' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#000"/>
                  </svg>
                  <div>
                    <div className="font-bold" style={{ color: '#361c0c' }}>Apple Pay</div>
                    <div className="text-sm text-gray-600">{t('checkout.onlinePayment')}</div>
                  </div>
                </button>
                <button type="button" onClick={() => setPaymentMethod('google_pay')} className={`border p-3 text-left flex items-center gap-2 ${paymentMethod==='google_pay' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <div>
                    <div className="font-bold" style={{ color: '#361c0c' }}>Google Pay</div>
                    <div className="text-sm text-gray-600">{t('checkout.onlinePayment')}</div>
                  </div>
                </button>
                <button type="button" onClick={() => setPaymentMethod('cash')} className={`border p-3 text-left ${paymentMethod==='cash' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                  <div className="font-bold" style={{ color: '#361c0c' }}>{t('checkout.cash')}</div>
                  <div className="text-sm text-gray-600">{t('checkout.uponReceipt')}</div>
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="font-bold mb-2" style={{ color: '#361c0c' }}>{t('checkout.comment')}</div>
              <Textarea placeholder={t('checkout.orderNotes')} value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <aside className="order-1 md:order-none md:col-span-1 md:col-start-3 md:row-start-1 md:row-end-4 md:sticky md:top-28 self-start">
              <div className="border rounded-lg p-4 shadow-sm bg-white">
                <div className="font-bold mb-3" style={{ color: '#361c0c' }}>{t('checkout.orderSummary')}</div>
                
                {/* Order Items List */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 text-sm">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-16 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{item.name}</div>
                          {item.variant && (
                            <div className="text-xs text-gray-500 mt-1">{item.variant}</div>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-gray-600">×{item.quantity}</span>
                            <span className="font-semibold text-gray-900">₴{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-700 mb-4">
                  <div className="flex justify-between"><span>{t('checkout.items')}</span><span>₴{totalPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between items-start">
                    <span className="pr-2">{t('checkout.shipping')}</span>
                    <span className="text-right">
                      {qualifiesForFreeDelivery
                        ? t('checkout.free')
                        : shippingMethod === 'own_courier' 
                        ? (shippingPrice === 0 ? t('checkout.free') : `₴${shippingPrice.toFixed(2)}`)
                        : <span className="text-xs leading-tight">{t('checkout.carrierRates')}</span>
                      }
                    </span>
                  </div>
                  <div className="flex justify-between font-black" style={{ color: '#361c0c' }}><span>{t('checkout.total')}</span><span>₴{(totalPrice + shippingPrice).toFixed(2)}</span></div>
                </div>
                <button 
                  disabled={isSubmitting} 
                  type="submit" 
                  className="w-full px-6 py-3 font-black border-2 bg-transparent hover:bg-[#361c0c] hover:!text-white transition-all duration-300 disabled:opacity-60 group" 
                  style={{ borderColor: '#361c0c', color: '#361c0c' }}
                >
                  <span className="group-hover:text-white transition-colors">
                    {isSubmitting ? t('checkout.wait') : t('checkout.proceedToPayment')}
                  </span>
                </button>
              </div>
            </aside>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}


