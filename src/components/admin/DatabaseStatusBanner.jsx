import { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { Database, CheckCircle2, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DatabaseStatusBanner() {
  const [status, setStatus] = useState({ isConnected: false, checking: true, message: '' });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setStatus((prev) => ({ ...prev, checking: true }));
    const res = await dataService.checkSupabaseConnection();
    setStatus({ isConnected: res.isConnected, checking: false, message: res.message });
  };

  const handleCopySQL = async () => {
    try {
      // Fetch or supply sql text
      const response = await fetch('/supabase-setup.sql');
      let sqlText = '';
      if (response.ok) {
        sqlText = await response.text();
      }
      if (!sqlText || sqlText.includes('<!doctype html>')) {
        // Fallback to essential table creation statement
        sqlText = `-- SMART HUB REPAIR - SUPABASE TABLES SETUP
-- Please copy full supabase-setup.sql from project repository root to run in Supabase SQL editor.
-- Project: https://supabase.com/dashboard/project/ojuqqaglqtcfpdprclgm/sql
`;
      }
      await navigator.clipboard.writeText(sqlText);
      toast.success('SQL copied to clipboard! Paste it in Supabase SQL Editor.');
    } catch (e) {
      toast.error('Could not copy SQL automatically. Open supabase-setup.sql from the repo.');
    }
  };

  return (
    <div className={`p-4 rounded-2xl border transition-all mb-6 ${
      status.isConnected
        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
        : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200 text-gray-800'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            status.isConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {status.isConnected ? <CheckCircle2 className="w-5 h-5" /> : <Database className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm">
                {status.isConnected ? 'Supabase PostgreSQL Cloud Synced' : 'Smart Hub Live Engine (Local + Cloud Ready)'}
              </h4>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                status.isConnected ? 'bg-emerald-200 text-emerald-800' : 'bg-blue-200 text-blue-800'
              }`}>
                {status.isConnected ? 'Active Cloud DB' : 'Dual-Engine Active'}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {status.isConnected
                ? 'All operations are persisting directly to your Supabase PostgreSQL cluster.'
                : 'All repairs, bookings, Razorpay test payments, and invoices are 100% operational. To persist directly into Supabase PostgreSQL, paste supabase-setup.sql in the SQL Editor.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {!status.isConnected && (
            <>
              <button
                type="button"
                onClick={handleCopySQL}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-blue-600" /> Copy Setup SQL
              </button>
              <a
                href="https://supabase.com/dashboard/project/ojuqqaglqtcfpdprclgm/sql"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Supabase SQL Editor
              </a>
            </>
          )}

          <button
            type="button"
            onClick={checkConnection}
            disabled={status.checking}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/80 hover:bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Check Supabase tables"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status.checking ? 'animate-spin text-blue-600' : 'text-gray-500'}`} />
            {status.checking ? 'Verifying...' : 'Test Connection'}
          </button>
        </div>
      </div>
    </div>
  );
}
