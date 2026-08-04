import React from 'react';
import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  sheetId: string;
  source: 'google_sheets_live' | 'mock_default' | 'user_csv';
  lastUpdated: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  email: string;
}

export const Header: React.FC<HeaderProps> = ({
  isRefreshing,
  onRefresh,
  email
}) => {
  const mgLogoDriveId = '1-DwiIHJBs66nkmZ17khO2EwX19pgK9zJ';
  const mgLogoUrl = `https://lh3.googleusercontent.com/d/${mgLogoDriveId}`;
  const mgLogoFallback = `https://drive.google.com/thumbnail?id=${mgLogoDriveId}&sz=w800`;

  return (
    <header className="bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: MG Logo Badge + Title & Subtitle */}
          <div className="flex items-center gap-3.5">
            {/* MG Consultores S.A.S Logo Badge (Preserving Original Shape) */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-2xs h-12 w-auto min-w-[3rem]">
              <img
                src={mgLogoUrl}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== mgLogoFallback) {
                    target.src = mgLogoFallback;
                  }
                }}
                alt="MG Consultores S.A.S"
                className="h-9 w-auto object-contain max-w-full"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-0.5">
              <h1 id="app-main-title" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-sans">
                Dashboard Acompañamiento Poscosecha
              </h1>
              <p className="text-xs text-slate-500 font-normal">
                MG Excelencia Operativa • Google Workspace Live Sync
              </p>
            </div>
          </div>

          {/* Right: Actualizar datos de Drive */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Button: Actualizar datos de Drive */}
            <button
              id="btn-actualizar-datos-drive"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0a2958] hover:bg-[#123873] active:bg-[#082046] text-white shadow-2xs transition-all disabled:opacity-50 cursor-pointer shrink-0 border border-blue-900/20"
              title="Sincronizar y actualizar datos desde Google Drive"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-200' : 'text-white'}`} />
              <span>{isRefreshing ? 'Actualizando...' : 'Actualizar datos de Drive'}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

