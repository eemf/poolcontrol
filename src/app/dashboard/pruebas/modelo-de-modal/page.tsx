
'use client'

import Head from 'next/head';

export default function ModeloDeModalPage() {
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      <Head>
        <title>Redesigned Payment Modal - POS System</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
        <style>{`
          .material-symbols-rounded {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
        `}</style>
      </Head>
      <div className="font-display">
        <div className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
          <div className="px-8 pt-8 pb-4 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Liquidar Cuenta de Samuel</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Selecciona los ítems a pagar o realiza un abono.
                <span className="text-slate-900 dark:text-slate-200 font-semibold"> Saldo total: </span>
                <span className="text-rose-500 font-bold">Q12.00</span>
              </p>
            </div>
            <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>
          <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium mb-2 uppercase tracking-wider text-xs">Total a Pagar (Selección)</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-primary text-2xl font-bold">Q</span>
                  <span className="text-primary text-6xl font-black tabular-nums">12.00</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group">
                  <span className="material-symbols-rounded text-slate-500 group-hover:text-primary">payments</span>
                  Realizar un Abono
                </button>
                <button className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group">
                  <span className="material-symbols-rounded text-slate-500 group-hover:text-primary">credit_card</span>
                  Pagar con Tarjeta
                </button>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-rounded text-primary">list_alt</span>
                  Ítems Pendientes
                </h3>
              </div>
              <div className="p-2 overflow-y-auto max-h-[300px]">
                <label className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <div className="relative flex items-center">
                    <input defaultChecked className="w-6 h-6 rounded-lg border-slate-300 text-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600" type="checkbox"/>
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">2x Jugo de Vegetales</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Refrescos &amp; Naturales</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white">Q12.00</span>
                  </div>
                </label>
                <div className="border-t border-dashed border-slate-200 dark:border-slate-700 my-2"></div>
                <div className="p-4 text-center text-slate-400 dark:text-slate-600 italic text-sm">
                  No hay más productos en la cuenta.
                </div>
              </div>
              <div className="mt-auto p-5 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-2xl flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Items seleccionados: 1</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Total: Q12.00</span>
              </div>
            </div>
          </div>
          <div className="px-8 py-8 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50">
            <button className="px-8 py-3.5 rounded-2xl text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              Cerrar
            </button>
            <button className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-blue-700 active:scale-95 transition-all">
              <span className="material-symbols-rounded">currency_exchange</span>
              Pagar con Efectivo
            </button>
          </div>
        </div>
        <button className="fixed bottom-6 right-6 p-4 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:rotate-12 transition-all" onClick={toggleDarkMode}>
          <span className="material-symbols-rounded">dark_mode</span>
        </button>
      </div>
    </>
  );
}
