import React, { useState } from 'react';
import {
  X, Mail, Check, Copy, ExternalLink, Sparkles, ShieldCheck,
  Send, Eye, Code, ArrowRight, Laptop, Smartphone
} from 'lucide-react';
import { generateMerlotResetEmailHtml, getSupabaseResetEmailTemplate } from '../lib/emailTemplate';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientEmail: string;
  resetUrl: string;
  token?: string;
  onNavigateToReset?: () => void;
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  recipientName,
  recipientEmail,
  resetUrl,
  token,
  onNavigateToReset,
}: EmailPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'supabase'>('preview');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  if (!isOpen) return null;

  const emailHtml = generateMerlotResetEmailHtml({
    recipientName,
    recipientEmail,
    resetUrl,
    token,
  });

  const supabaseTemplate = getSupabaseResetEmailTemplate();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(resetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(supabaseTemplate);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(emailHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleOpenResetPage = () => {
    if (onNavigateToReset) {
      onNavigateToReset();
    } else {
      window.location.href = resetUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#12070a] border border-[#D4AF37]/30 shadow-2xl overflow-hidden my-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#16080d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#722F37] to-[#3a141b] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-lg">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg text-white font-medium">
                  Previzualizare Email Resetare Parolă
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-medium tracking-wider uppercase">
                  Merlot VIP
                </span>
              </div>
              <p className="text-xs text-white/50">
                Design de lux responsive optimizat pentru Gmail, Apple Mail și Supabase Auth
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls & View Mode Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-[#0f0508] border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-[#722F37] text-white shadow border border-[#D4AF37]/40'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Previzualizare Vizuală (Client)
            </button>
            <button
              onClick={() => setActiveTab('supabase')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'supabase'
                  ? 'bg-[#722F37] text-white shadow border border-[#D4AF37]/40'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Cod Șablon Supabase
            </button>
          </div>

          {activeTab === 'preview' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg bg-white/[0.04] p-0.5 border border-white/[0.06]">
                <button
                  onClick={() => setDeviceView('desktop')}
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    deviceView === 'desktop' ? 'bg-[#D4AF37] text-[#12070a]' : 'text-white/50 hover:text-white'
                  }`}
                  title="Desktop View"
                >
                  <Laptop className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceView('mobile')}
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    deviceView === 'mobile' ? 'bg-[#D4AF37] text-[#12070a]' : 'text-white/50 hover:text-white'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleOpenResetPage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#c49f2f] text-[#12070a] font-semibold text-xs transition-all shadow"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Deschide Linkul de Resetare
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0a0406]">
          {activeTab === 'preview' ? (
            <div className="space-y-4">
              {/* Envelope meta header */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs space-y-1.5">
                <div className="flex items-center justify-between text-white/50">
                  <span><strong>Expeditor:</strong> Merlot VIP &lt;vip@merlot.ro&gt;</span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Semnătură DKIM / SPF Validată
                  </span>
                </div>
                <div className="text-white/70">
                  <strong>Destinatar:</strong> {recipientName} &lt;<span className="text-[#D4AF37]">{recipientEmail}</span>&gt;
                </div>
                <div className="text-white font-medium">
                  <strong>Subiect:</strong> Merlot VIP — Resetare Securizată a Parolei Tale
                </div>
              </div>

              {/* Rendered HTML inside iframe */}
              <div
                className={`mx-auto rounded-xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl transition-all duration-300 ${
                  deviceView === 'mobile' ? 'max-w-[390px]' : 'max-w-full'
                }`}
                style={{ height: '520px' }}
              >
                <iframe
                  title="Previzualizare Email Merlot"
                  srcDoc={emailHtml}
                  className="w-full h-full bg-[#080305]"
                  sandbox="allow-same-origin allow-popups"
                />
              </div>

              {/* Quick direct actions toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-xs transition-colors"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Link Copiat!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Copiază Linkul Direct</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopyHtml}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-xs transition-colors"
                  >
                    {copiedHtml ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">HTML Copiat!</span>
                      </>
                    ) : (
                      <>
                        <Code className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Copiază Codul HTML</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleOpenResetPage}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#b38f2a] text-[#12070a] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Testează Resetarea Parolei Acum
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Supabase code configuration tab */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#722F37]/30 to-[#1e0a11] border border-[#D4AF37]/30">
                <h4 className="font-display text-white text-sm font-semibold mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  Cum activezi acest design în Supabase:
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-white/70 mt-2">
                  <li>
                    Deschide consola <strong className="text-white">Supabase</strong> &rarr; Mergi la proiectul tău &rarr; <strong className="text-[#D4AF37]">Authentication</strong>.
                  </li>
                  <li>
                    Selectează tab-ul <strong className="text-white">Email Templates</strong> din meniul lateral stânga.
                  </li>
                  <li>
                    Alege secțiunea <strong className="text-white">Reset Password</strong>.
                  </li>
                  <li>
                    Schimbă subiectul (Subject) în: <code className="bg-black/40 px-2 py-0.5 rounded text-[#D4AF37]">Merlot VIP — Resetare Securizată a Parolei Tale</code>
                  </li>
                  <li>
                    Apasă pe butonul de mai jos <strong className="text-white">Copiază Șablonul pentru Supabase</strong> și lipește-l în câmpul de conținut (Message Body).
                  </li>
                  <li>
                    Apasă <strong className="text-white">Save Changes</strong>. De acum, orice email de resetare trimis de Supabase va fi de lux!
                  </li>
                </ol>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-white/50 font-mono">
                  Variabile acceptate: {'{{ .ConfirmationURL }}'}, {'{{ .Email }}'}
                </span>
                <button
                  onClick={handleCopyTemplate}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2f] text-[#12070a] font-bold text-xs uppercase tracking-wider transition-all shadow"
                >
                  {copiedTemplate ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-900" />
                      <span>Copiat în Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiază Șablonul pentru Supabase</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#070204]">
                <pre className="p-4 text-[11px] font-mono text-[#D4AF37]/90 overflow-x-auto max-h-[380px] leading-relaxed">
                  {supabaseTemplate}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-white/[0.06] bg-[#12070a] flex items-center justify-between text-xs text-white/40">
          <span>Merlot VIP Identity Engine • Sistem de Notificări Securizate</span>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            Închide Fereastra
          </button>
        </div>

      </div>
    </div>
  );
}
