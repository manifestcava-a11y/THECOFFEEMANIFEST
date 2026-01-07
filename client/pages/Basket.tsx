import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../contexts/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useEffect, useRef } from "react";

// Declare dataLayer for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
  }
}

export default function Basket() {
  const { items, updateQuantity, removeItem, totalPrice, clear } = useCart();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasFiredPurchase = useRef(false);

  // Clear cart when returning from LiqPay payment
  useEffect(() => {
    const paymentReturn = searchParams.get('payment');
    if (paymentReturn !== 'return' || hasFiredPurchase.current) return;

    hasFiredPurchase.current = true;

    // Remove the query parameter from URL ASAP
    setSearchParams({}, { replace: true });

    const pendingRaw =
      typeof window !== "undefined" ? sessionStorage.getItem("pendingPurchase") : null;

    let purchaseData: { orderId: string; value: number; currency?: string } | null = null;
    if (pendingRaw) {
      try {
        purchaseData = JSON.parse(pendingRaw);
      } catch (e) {
        console.warn("Failed to parse pendingPurchase data", e);
      }
    }

    // Clear cart and show success toast only if we still have items
    if (items.length > 0) {
      clear();
      toast({
        title: t('checkout.success.title'),
        description: t('checkout.success.desc'),
        variant: "default" as any
      });
    }

    // Push purchase event to dataLayer (once)
    if (purchaseData && typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'purchase',
        transaction_id: purchaseData.orderId,
        value: purchaseData.value,
        currency: purchaseData.currency || 'UAH',
      });
    }

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pendingPurchase");
    }
  }, [searchParams, items.length, clear, setSearchParams, t]);

  async function handleCheckout() {
    // Navigate to Checkout flow instead of direct payment
    navigate('/checkout');
    return;

    try {
      const amount = totalPrice;
      if (amount <= 0) {
        throw new Error(t('basket.error.orderAmount'));
      }

      // Generate unique order ID
      const orderId = `cm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create description from cart items
      const description = items
        .map((it) => `${it.name}${it.variant ? ` (${it.variant})` : ""} x${it.quantity}`)
        .join(", ");

      // Helper function to encode Unicode strings for btoa
      const encodeForBtoa = (str: string): string => {
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(str);
        let binaryString = '';
        uint8Array.forEach(byte => {
          binaryString += String.fromCharCode(byte);
        });
        return binaryString;
      };

      // Helper function to generate LiqPay signature
      const generateSignature = async (data: string, privateKey: string): Promise<string> => {
        // Create a simple string concatenation
        const str = privateKey + data + privateKey;
        
        // Hash with SHA-1
        const encoder = new TextEncoder();
        const dataBytes = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-1', dataBytes);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        
        // Convert to binary string for btoa
        let binaryString = '';
        hashArray.forEach(byte => {
          binaryString += String.fromCharCode(byte);
        });
        
        return btoa(binaryString);
      };

      // LiqPay configuration
      const params = {
        version: 3,
        public_key: import.meta.env.VITE_LIQPAY_PUBLIC_KEY || "i93329818953",
        action: "pay",
        amount: Number(amount.toFixed(2)),
        currency: "UAH",
        description: `Замовлення ${orderId} — THE COFFEE MANIFEST`,
        order_id: orderId,
        result_url: `${window.location.origin}/basket?payment=return`,
        language: "uk",
        paytypes: "card",
        sandbox: 1,
        info: description,
      };

      // Encode params to base64
      const jsonString = JSON.stringify(params);
      const encodedString = encodeForBtoa(jsonString);
      const data = btoa(encodedString);

      // Get signature from server (or generate client-side fallback)
      let signature = "";
      const privateKey = import.meta.env.VITE_LIQPAY_PRIVATE_KEY || "sandbox_key";
      
      try {
        const signatureResponse = await fetch('/api/liqpay-signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data }),
        });

        if (signatureResponse.ok) {
          const result = await signatureResponse.json();
          signature = result.signature;
        } else {
          console.warn("Could not get signature from server, generating client-side");
          signature = await generateSignature(data, privateKey);
        }
      } catch (error) {
        console.warn("Signature endpoint not available, generating client-side:", error);
        signature = await generateSignature(data, privateKey);
      }

      // Log for debugging
      console.log("LiqPay Data:", data);
      console.log("LiqPay Signature:", signature);
      console.log("Signature length:", signature.length);
      
      if (!signature || signature.trim() === '') {
        const errorMsg = t('basket.error.signature');
        console.error(errorMsg);
        toast({ 
          title: t('basket.error.payment'), 
          description: errorMsg, 
          variant: "destructive" as any 
        });
        return;
      }
      
      // Create and submit LiqPay form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://www.liqpay.ua/api/3/checkout';
      form.style.display = 'none';
      
      const dataInput = document.createElement('input');
      dataInput.type = 'hidden';
      dataInput.name = 'data';
      dataInput.value = data;
      
      const signatureInput = document.createElement('input');
      signatureInput.type = 'hidden';
      signatureInput.name = 'signature';
      signatureInput.value = signature;
      
      form.appendChild(dataInput);
      form.appendChild(signatureInput);
      
      document.body.appendChild(form);
      form.submit();
      
    } catch (e: any) {
      toast({ 
        title: t('basket.error.payment'), 
        description: e?.message || t('basket.error.paymentDesc'), 
        variant: "destructive" as any 
      });
    }
  }

  return (
    <div className="min-h-screen bg-coffee-background">
      <Header />

      <section className="pt-28 pb-16" style={{ backgroundColor: '#361c0c' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-black mb-8 leading-tight font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>
            {t('basket.title')}
          </h1>
          {items.length === 0 ? (
            <div className="bg-white/10 p-8 rounded-lg" style={{ color: '#fcf4e4' }}>
              <p className="text-lg font-medium mb-6">{t('basket.empty')}</p>
              <div className="flex gap-4">
                <Link to="/coffee" className="px-6 py-3 border-2 font-black hover:bg-[#fcf4e4] hover:text-[#361c0c] transition-all duration-300 group" style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}>
                  <span className="group-hover:text-[#361c0c] transition-colors">
                    {t('basket.toCoffee')}
                  </span>
                </Link>
                <Link to="/water" className="px-6 py-3 border-2 font-black hover:bg-[#fcf4e4] hover:text-[#361c0c] transition-all duration-300 group" style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}>
                  <span className="group-hover:text-[#361c0c] transition-colors">
                    {t('basket.toWater')}
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg mb-1" style={{ color: '#361c0c' }}>{item.name}</div>
                        {item.variant && (
                          <div className="text-sm text-gray-600 mb-1">{item.variant}</div>
                        )}
                        <div className="text-sm text-gray-600">₴{item.price.toFixed(2)} {t('basket.perUnit')}</div>
                      </div>
                      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-all duration-200">
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <div className="w-10 text-center font-bold text-gray-800">{item.quantity}</div>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-all duration-200">
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right font-bold" style={{ color: '#361c0c' }}>
                            ₴{(item.quantity * item.price).toFixed(2)}
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-700 p-1">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:sticky lg:top-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold" style={{ color: '#361c0c' }}>{t('basket.summary')}</span>
                    <span className="font-black" style={{ color: '#361c0c' }}>₴{totalPrice.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={handleCheckout} 
                    disabled={items.length === 0} 
                    className="w-full py-3 font-black border-2 bg-transparent hover:bg-[#361c0c] hover:text-white transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed" 
                    style={{ borderColor: '#361c0c', color: '#361c0c' }}
                  >
                    <span className="group-hover:text-white transition-colors">
                      {t('basket.checkout')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}


