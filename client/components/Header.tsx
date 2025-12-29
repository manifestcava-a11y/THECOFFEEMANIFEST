import { Search, ShoppingCart, Menu, X, Coffee, Heart, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useLanguage } from "../contexts/LanguageContext";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSecondHeaderVisible, setIsSecondHeaderVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const { items, totalQuantity } = useCart();
  
  // Check if we're on the main landing page
  const isMainPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50; // First header appears after first scroll
      const secondHeaderVisible = window.scrollY > 250; // Second header appears after 5th scroll
      setIsScrolled(scrolled);
      setIsSecondHeaderVisible(secondHeaderVisible);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{ backgroundColor: isMainPage ? (isScrolled ? '#361c0c' : 'transparent') : '#361c0c' }}
      >
        <div className="w-full h-full">
        <div className="w-full px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Left Side - Page Navigation Only */}
            <div className="flex items-center">
              {/* Desktop Navigation - Clean & Minimalistic */}
              <nav className="hidden lg:flex items-center space-x-12">
              <Link to="/coffee" className="group relative">
                <span className="text-white font-medium text-lg tracking-wide hover:text-white/80 transition-all duration-300">
                  {t('nav.coffee')}
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: '#fcf4e4' }}></div>
              </Link>
              <Link to="/water" className="group relative">
                <span className="text-white font-medium text-lg tracking-wide hover:text-white/80 transition-all duration-300">
                  {t('nav.water')}
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: '#fcf4e4' }}></div>
              </Link>
              <Link to="/office" className="group relative">
                <span className="text-white font-medium text-lg tracking-wide hover:text-white/80 transition-all duration-300">
                  {t('nav.office')}
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: '#fcf4e4' }}></div>
              </Link>
              {/* <a href="#drinks" className="group relative">
                <span className="text-white font-medium text-lg tracking-wide hover:text-white/80 transition-all duration-300">
                  {t('nav.drinks')}
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: '#fcf4e4' }}></div>
              </a> */}
              
              {/* Dropdown Menu */}
              <div className="relative group">
                <button 
                  className="flex items-center space-x-1 text-white font-medium text-lg tracking-wide hover:text-white/80 transition-all duration-300"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <span>{t('nav.more')}</span>
                  <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                </button>
              </div>
              </nav>
            </div>

            {/* Logo - Centered on Desktop, Left on Mobile */}
            <div className="absolute left-4 lg:left-1/2 lg:transform lg:-translate-x-1/2 z-50">
              <Link to="/" className="group">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src="/manifest-site-logo.png" 
                      alt="THE COFFEE Manifest" 
                      className="h-12 w-auto transition-transform group-hover:scale-105"
                    />
                  </div>
                </div>
              </Link>
            </div>

            {/* Right Side - Actions */}
            <div className="hidden lg:flex items-center space-x-8">
              {/* Search - Clean Icon */}

              {/* Cart - Badge and hover preview */}
              <div className="relative group">
                <Link to="/basket" className="relative p-3 transition-all duration-300 block" style={{ backgroundColor: '#fcf4e4' + '20' }}>
                  <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" style={{ color: '#fcf4e4' }} />
                  {totalQuantity > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center" style={{ backgroundColor: '#fcf4e4' }}>
                      <span className="font-bold text-xs" style={{ color: '#361c0c' }}>{totalQuantity}</span>
                    </div>
                  )}
                </Link>
                {/* Hover preview */}
                {items.length > 0 && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="space-y-3 max-h-64 overflow-auto">
                      {items.slice(0, 5).map((it) => (
                        <div key={it.id} className="flex items-center gap-3">
                          {it.image && <img src={it.image} alt={it.name} className="w-12 h-12 object-cover rounded" />}
                          <div className="flex-1">
                            <div className="text-sm font-bold" style={{ color: '#361c0c' }}>{it.name}</div>
                            {it.variant && <div className="text-xs text-gray-500">{it.variant}</div>}
                            <div className="text-xs text-gray-600">x{it.quantity} • ₴{(it.price * it.quantity).toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                      {items.length > 5 && (
                        <div className="text-xs text-gray-500 text-center py-2">
                          +{items.length - 5} більше товарів
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold" style={{ color: '#361c0c' }}>Разом:</span>
                        <span className="font-black" style={{ color: '#361c0c' }}>₴{items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                      </div>
                      <Link to="/basket" className="w-full block text-center py-2 font-black border-2 bg-transparent transition-all duration-300" style={{ borderColor: '#361c0c', color: '#361c0c' }}>
                        Перейти в кошик
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Header Actions */}
            <div className="lg:hidden flex items-center space-x-2">
              {/* Mobile Basket Button */}
              <Link 
                to="/basket" 
                className="relative p-3 transition-all duration-300"
                style={{ backgroundColor: '#fcf4e4' + '20' }}
              >
                <ShoppingCart className="w-6 h-6" style={{ color: '#fcf4e4' }} />
                {totalQuantity > 0 && (
                  <span
                    className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-xs font-black leading-none"
                    style={{ backgroundColor: '#fcf4e4', color: '#361c0c', width: '1rem', height: '1rem' }}
                  >
                    {totalQuantity}
                  </span>
                )}
              </Link>
              {/* Mobile Menu Button - Clean */}
              <button 
                className="p-3 transition-all duration-300"
                style={{ backgroundColor: '#fcf4e4' + '20' }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" style={{ color: '#fcf4e4' }} />
                ) : (
                  <Menu className="w-6 h-6" style={{ color: '#fcf4e4' }} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Clean Slide Implementation */}
        <div className={`lg:hidden fixed inset-0 z-40 pointer-events-none ${isMobileMenuOpen ? 'pointer-events-auto' : ''}`}>
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black/50 transition-opacity duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          {/* Mobile menu slides from right full screen */}
          <div className={`fixed top-0 right-0 h-full w-full transform transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ backgroundColor: '#361c0c' }}>
              <Link
                to="/basket"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`absolute top-6 right-20 w-12 h-12 flex items-center justify-center transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                style={{ backgroundColor: '#fcf4e4' + '20' }}
              >
                <ShoppingCart className="w-6 h-6" style={{ color: '#fcf4e4' }} />
                {totalQuantity > 0 && (
                  <span
                    className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-xs font-black leading-none"
                    style={{ backgroundColor: '#fcf4e4', color: '#361c0c', width: '1rem', height: '1rem' }}
                  >
                    {totalQuantity}
                  </span>
                )}
              </Link>
              <div className="px-6 pt-24 pb-8 space-y-8">
              <nav className="space-y-6">
                <Link to="/coffee" className="block text-white font-bold text-2xl hover:text-white/80 transition-colors">
                  {t('nav.coffee')}
                </Link>
                <Link to="/water" className="block text-white font-bold text-2xl hover:text-white/80 transition-colors">
                  {t('nav.water')}
                </Link>
                <Link to="/office" className="block text-white font-bold text-2xl hover:text-white/80 transition-colors">
                  {t('nav.office')}
                </Link>
                {/* <a href="#drinks" className="block text-white font-bold text-2xl hover:text-white/80 transition-colors">
                  {t('nav.drinks')}
                </a> */}
                <Link to="/news" className="block text-white font-bold text-2xl hover:text-white/80 transition-colors">
                  {t('nav.news')}
                </Link>
                <Link to="/contact" className="block text-white font-bold text-2xl hover:text-white/80 transition-colors">
                  {t('nav.contacts')}
                </Link>
                <Link to="/delivery" className="block text-white font-bold text-2xl hover:text-white/80 transition-colors">
                  {language === 'ru' ? 'Доставка и оплата' : 'Доставка та оплата'}
                </Link>
                <Link to="/terms" className="block text-white font-bold text-2xl hover:text-white/80 transition-colors">
                  {language === 'ru' ? 'Условия использования' : 'Умови використання'}
                </Link>
                <Link to="/returns" className="block text-white font-bold text-2xl hover:text-white/80 transition-colors">
                  {language === 'ru' ? 'Политика возврата' : 'Політика повернення'}
                </Link>
              </nav>
                
              </div>
            </div>
            
            {/* Close button in top right of sliding panel */}
            <button 
              className={`absolute top-6 right-6 w-12 h-12 flex items-center justify-center hover:scale-110 transition-all duration-300 z-50 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              style={{ backgroundColor: '#fcf4e4' + '20' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" style={{ color: '#fcf4e4' }} />
            </button>
          </div>
        </div>

      </header>

      {/* Desktop Dropdown Bar - Slides from Under Header */}
      <div
        className={`fixed left-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDropdownOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ 
          backgroundColor: isMainPage ? (isSecondHeaderVisible ? '#361c0c' : 'transparent') : '#361c0c', 
          top: '80px' 
        }}
        onMouseEnter={() => setIsDropdownOpen(true)}
        onMouseLeave={() => setIsDropdownOpen(false)}
      >
        <div className="px-4 lg:px-8">
          <div className="flex items-center h-20">
            {/* Additional Navigation - Left Aligned */}
            <div className="flex items-center space-x-12">
              <Link to="/news" className="group relative">
                 <span className={`font-medium text-lg tracking-wide transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'text-white hover:text-white/80' : 'text-transparent'
                 }`}>
                  {t('nav.news')}
                </span>
                 <div className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'bg-[#fcf4e4]' : 'bg-transparent'
                 }`}></div>
              </Link>
              <Link to="/contact" className="group relative">
                 <span className={`font-medium text-lg tracking-wide transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'text-white hover:text-white/80' : 'text-transparent'
                 }`}>
                  {t('nav.contacts')}
                </span>
                 <div className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'bg-[#fcf4e4]' : 'bg-transparent'
                 }`}></div>
              </Link>
              <Link to="/delivery" className="group relative lg:hidden">
                 <span className={`font-medium text-lg tracking-wide transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'text-white hover:text-white/80' : 'text-transparent'
                 }`}>
                  {language === 'ru' ? 'Доставка и оплата' : 'Доставка та оплата'}
                </span>
                 <div className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'bg-[#fcf4e4]' : 'bg-transparent'
                 }`}></div>
              </Link>
              <Link to="/delivery" className="group relative">
                 <span className={`font-medium text-lg tracking-wide transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'text-white hover:text-white/80' : 'text-transparent'
                 }`}>
                  {language === 'ru' ? 'Доставка и оплата' : 'Доставка та оплата'}
                </span>
                 <div className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'bg-[#fcf4e4]' : 'bg-transparent'
                 }`}></div>
              </Link>
              <Link to="/terms" className="group relative">
                 <span className={`font-medium text-lg tracking-wide transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'text-white hover:text-white/80' : 'text-transparent'
                 }`}>
                  {language === 'ru' ? 'Условия использования' : 'Умови використання'}
                </span>
                 <div className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'bg-[#fcf4e4]' : 'bg-transparent'
                 }`}></div>
              </Link>
              <Link to="/returns" className="group relative">
                 <span className={`font-medium text-lg tracking-wide transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'text-white hover:text-white/80' : 'text-transparent'
                 }`}>
                  {language === 'ru' ? 'Политика возврата' : 'Політика повернення'}
                </span>
                 <div className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'bg-[#fcf4e4]' : 'bg-transparent'
                 }`}></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
