import React from 'react';
import { SiteSettings, Category } from '../types';
import { Send, Newspaper, ArrowUp, Rss, Phone, Mail, MapPin, ExternalLink, Youtube, MessageCircle } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  categories: Category[];
  onSelectCategory: (slug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, categories, onSelectCategory }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isValid = (val?: string) => !!val && val.trim() !== '' && val.trim() !== '#';

  const social = settings.socialLinks || {};
  const hasTelegram = isValid(social.telegram);
  const hasInstagram = isValid(social.instagram);
  const hasTwitter = isValid(social.twitter);
  const hasYoutube = isValid(social.youtube);
  const hasBale = isValid(social.bale);
  const hasWhatsapp = isValid(social.whatsapp);
  const hasRss = isValid(social.rss);

  const hasPhone = isValid(settings.contactPhone);
  const hasEmail = isValid(settings.contactEmail);
  const hasAddress = isValid(settings.contactAddress);
  const hasContactPage = isValid(settings.contactPageUrl);

  const hasSocials = hasTelegram || hasInstagram || hasTwitter || hasYoutube || hasBale || hasWhatsapp || hasRss;
  const hasContact = hasPhone || hasEmail || hasAddress || hasContactPage;
  const hasContactOrSocial = hasSocials || hasContact;

  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-12 pb-24 md:pb-12 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`grid grid-cols-1 ${hasContactOrSocial ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-8 pb-10 border-b border-slate-800`}>
          {/* Column 1: About & Logo */}
          <div className={hasContactOrSocial ? 'md:col-span-2' : 'md:col-span-2'}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md"
                style={{ backgroundColor: settings.primaryColor || '#2563eb' }}
              >
                <Newspaper className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white">{settings.siteName}</h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-lg">{settings.footerText}</p>

            {/* Newsletter Subscription Form */}
            <div className="mt-6 max-w-md">
              <label className="block text-xs font-bold text-white mb-2">عضویت در خبرنامه ایمیلی:</label>
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="ایمیل یا شماره همراه خود را وارد کنید..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>عضویت</span>
                </button>
              </form>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h4 className="text-sm font-extrabold text-white mb-4 border-r-2 border-blue-500 pr-2">
              دسته‌بندی‌های خبری
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.slug)}
                    className="hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    <span>{cat.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Us & Social Media (Only shown if links/info exist) */}
          {hasContactOrSocial && (
            <div>
              <h4 className="text-sm font-extrabold text-white mb-4 border-r-2 border-blue-500 pr-2">
                ارتباط با ما و شبکه اجتماعی
              </h4>

              {/* Social links row */}
              {hasSocials && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {hasTelegram && (
                    <a
                      href={social.telegram}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-blue-500 text-white flex items-center justify-center transition-colors text-xs font-bold"
                      title="تلگرام"
                    >
                      ت
                    </a>
                  )}
                  {hasInstagram && (
                    <a
                      href={social.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-pink-600 text-white flex items-center justify-center transition-colors text-xs font-bold"
                      title="اینستاگرام"
                    >
                      ا
                    </a>
                  )}
                  {hasTwitter && (
                    <a
                      href={social.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-sky-500 text-white flex items-center justify-center transition-colors text-xs font-bold"
                      title="توییتر X"
                    >
                      X
                    </a>
                  )}
                  {hasBale && (
                    <a
                      href={social.bale}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors text-xs font-bold"
                      title="بله"
                    >
                      بله
                    </a>
                  )}
                  {hasWhatsapp && (
                    <a
                      href={social.whatsapp}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-green-600 text-white flex items-center justify-center transition-colors"
                      title="واتس‌اپ"
                    >
                      <MessageCircle className="w-4 h-4 text-green-400" />
                    </a>
                  )}
                  {hasYoutube && (
                    <a
                      href={social.youtube}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                      title="یوتیوب"
                    >
                      <Youtube className="w-4 h-4 text-red-500" />
                    </a>
                  )}
                  {hasRss && (
                    <a
                      href={social.rss}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-amber-600 text-white flex items-center justify-center transition-colors"
                      title="خوراک RSS"
                    >
                      <Rss className="w-4 h-4 text-amber-500" />
                    </a>
                  )}
                </div>
              )}

              {/* Contact Information list */}
              {hasContact && (
                <div className="space-y-2 text-xs text-slate-400">
                  {hasPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span dir="ltr" className="font-mono text-slate-300">{settings.contactPhone}</span>
                    </div>
                  )}
                  {hasEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <a href={`mailto:${settings.contactEmail}`} className="hover:text-white transition-colors">
                        {settings.contactEmail}
                      </a>
                    </div>
                  )}
                  {hasAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{settings.contactAddress}</span>
                    </div>
                  )}
                  {hasContactPage && (
                    <div className="flex items-center gap-2 pt-1">
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <a
                        href={settings.contactPageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline font-bold"
                      >
                        صفحه اصلی ارتباط با ما
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Bar & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p className="text-center sm:text-right">{settings.copyrightText}</p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>بازگشت به بالا</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
