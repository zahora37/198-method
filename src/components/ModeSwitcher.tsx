'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { applyColorMode, type ColorMode } from '@/lib/appearance'

export default function ModeSwitcher({ compact=false }: { compact?: boolean }) {
  const [mode,setMode]=useState<ColorMode>('light')
  useEffect(()=>{
    const sync=()=>setMode(document.documentElement.dataset.appearance==='dark'?'dark':'light')
    sync()
    window.addEventListener('168-color-mode-change',sync)
    window.addEventListener('storage',sync)
    return()=>{window.removeEventListener('168-color-mode-change',sync);window.removeEventListener('storage',sync)}
  },[])
  return <div className={compact?'flex items-center':'space-y-2'}>
    {!compact&&<p className="text-xs font-medium text-stone-500">Display</p>}
    <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-1">
      {(['light','dark'] as const).map(option=><button type="button" key={option} aria-label={`${option} mode`} aria-pressed={mode===option} onClick={()=>{setMode(option);applyColorMode(option)}} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium ${mode===option?'bg-white text-stone-900 shadow-sm':'text-stone-500'}`}>
        {option==='light'?<Sun size={15} aria-hidden="true"/>:<Moon size={15} aria-hidden="true"/>}{!compact&&<span>{option==='light'?'Light':'Dark'}</span>}
      </button>)}
    </div>
  </div>
}
