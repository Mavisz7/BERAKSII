import { Phone, MapPin, Clock, MessageCircle, Instagram, HeartPulse } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useSettings } from '@/hooks/useSettings';
import { waLink, igLink } from '@/lib/format';

export function ContactPage() {
  const { settings } = useSettings();
  return (
    <div>
      <PageHeader title="Kontak Puskesmas" subtitle="Hubungi Puskesmas Ambacang" icon={<Phone className="w-6 h-6" />} />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-leaf-500 flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{settings.contact_info}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{settings.program_name}</p>
            </div>
          </div>
          <div className="space-y-4">
            <ContactRow icon={<MapPin className="w-5 h-5" />} label="Alamat" value={settings.address} />
            <ContactRow icon={<Phone className="w-5 h-5" />} label="Telepon / WhatsApp" value={settings.whatsapp} />
            <ContactRow icon={<Instagram className="w-5 h-5" />} label="Instagram" value={settings.instagram} />
            <ContactRow icon={<Clock className="w-5 h-5" />} label="Jam Operasional" value={settings.hours} />
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <a href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" className="btn-leaf">
              <MessageCircle className="w-4 h-4" /> Hubungi WhatsApp
            </a>
            <a href={igLink(settings.instagram)} target="_blank" rel="noreferrer" className="btn-outline">
              <Instagram className="w-4 h-4" /> Instagram
            </a>
          </div>
        </div>
        <div className="card overflow-hidden min-h-[320px]">
          <iframe
            title="Lokasi Puskesmas Ambacang"
            src="https://www.google.com/maps?q=Puskesmas+Ambacang+Padang&output=embed"
            className="w-full h-full min-h-[320px] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
