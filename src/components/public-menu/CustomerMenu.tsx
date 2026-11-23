"use client";

/* eslint-disable @next/next/no-img-element -- Dish images can be uploaded paths or demo data URLs. */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChefHat, Search, UtensilsCrossed, X } from "lucide-react";
import { DietaryBadge } from "@/components/shared/dietary-badge";
import { formatINR, resolveAssetUrl } from "@/lib/format";
import { api, dataMode } from "@/services/api";
import { browserStorage, loadPublicMenuCached } from "@/services/public-menu-cache";

export function CustomerMenu() {
  const { data: cached, isLoading, isError, refetch } = useQuery({
    queryKey: ["public-menu", dataMode],
    queryFn: () => loadPublicMenuCached(() => api.getPublicMenu(), dataMode, browserStorage()),
    staleTime: query => Math.max(0, (query.state.data?.expiresAt ?? 0) - query.state.dataUpdatedAt),
    refetchOnWindowFocus: true,
    refetchInterval: query => query.state.status === "error" ? 60_000 : Math.max(1_000, (query.state.data?.expiresAt ?? Date.now() + 300_000) - Date.now()),
  });
  const data = cached?.menu;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<number | null>(null);
  const [diet, setDiet] = useState<"ALL" | "VEG" | "NON_VEG" | "EGG">("ALL");
  const term = search.trim().toLowerCase();
  const visible = (data?.items ?? []).filter(item =>
    (category === null || item.categoryId === category) &&
    (diet === "ALL" || item.dietaryType === diet) &&
    (!term || item.name.toLowerCase().includes(term) || item.description?.toLowerCase().includes(term) ||
      data?.categories.find(c => c.id === item.categoryId)?.name.toLowerCase().includes(term)));

  return (
    <main className="min-h-screen bg-[#fbf8f2] text-[#27201a]" style={{ colorScheme: "light" }}>
      <header className="border-b border-[#eadfd0] bg-[#fffdf8]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#a64122] text-white"><ChefHat size={23} /></span>
            <div className="min-w-0"><p className="truncate text-lg font-extrabold tracking-tight">{data?.store.name || "Our menu"}</p><p className="text-xs font-medium text-[#806d5d]">Fresh food, made for you</p></div>
          </div>
          <span className="shrink-0 rounded-full border border-[#e5d6c6] bg-white px-3 py-1.5 text-xs font-bold text-[#8c482f]">DIGITAL MENU</span>
        </div>
      </header>
      <section className="bg-[#f2e6d7]">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-9 sm:px-6 sm:py-12 md:grid-cols-[1fr_230px] md:items-center">
          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#a64122]">Welcome to {data?.store.name || "our kitchen"}</p>
            <h1 className="max-w-xl font-serif text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl">Good food.<br /><span className="text-[#a64122]">Great moments.</span></h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#725e50] sm:text-base">Take a look at what&apos;s cooking today. Find your favourites and ask our team to place your order.</p>
            {data?.store.address && <p className="mt-4 text-xs font-medium text-[#725e50]">{data.store.address}</p>}
          </div>
          <div className="hidden h-44 overflow-hidden rounded-[2rem] bg-[#e4d1bb] md:block">
            {data?.items.find(item => item.imagePath) ? <img src={resolveAssetUrl(data.items.find(item => item.imagePath)?.imagePath, "/images/dish.svg")} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[#a64122]"><UtensilsCrossed size={52}/></div>}
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-7 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#a64122]">Explore the menu</p><h2 className="mt-1 font-serif text-3xl font-bold">Find your favourite</h2></div>
          {data && <p className="text-sm font-medium text-[#806d5d]">{visible.length} {visible.length === 1 ? "dish" : "dishes"} available</p>}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-[#e7d9ca] bg-white px-4 shadow-sm">
            <Search size={19} className="shrink-0 text-[#9b8170]" /><span className="sr-only">Search dishes</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search dishes or categories..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#a39183]" />
            {search && <button type="button" aria-label="Clear search" onClick={()=>setSearch("")} className="grid size-8 place-items-center rounded-full text-[#806d5d]"><X size={16}/></button>}
          </label>
          <div className="flex gap-1 overflow-x-auto rounded-2xl border border-[#e7d9ca] bg-white p-1" aria-label="Dietary filters">
            {([["ALL","All"],["VEG","Veg"],["NON_VEG","Non-veg"],["EGG","Egg"]] as const).map(([key,label])=><button key={key} type="button" aria-label={label} onClick={()=>setDiet(key)} aria-pressed={diet===key} className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold ${diet===key?"bg-[#a64122] text-white":"text-[#6a584a]"}`}>{key!=="ALL"&&<DietaryBadge type={key}/>} {label}</button>)}
          </div>
        </div>
        {data && data.categories.length > 0 && <nav aria-label="Menu categories" className="pos-scroll mt-4 flex gap-2 overflow-x-auto pb-2">
          <button type="button" onClick={()=>setCategory(null)} aria-pressed={category===null} className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-bold ${category===null?"border-[#a64122] bg-[#a64122] text-white":"border-[#e7d9ca] bg-white text-[#6a584a]"}`}>All dishes</button>
          {data.categories.map(c=><button key={c.id} type="button" onClick={()=>setCategory(c.id)} aria-pressed={category===c.id} className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-bold ${category===c.id?"border-[#a64122] bg-[#a64122] text-white":"border-[#e7d9ca] bg-white text-[#6a584a]"}`}>{c.name}</button>)}
        </nav>}
        {isError && data && <p role="status" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Showing the last loaded menu. Please confirm prices and availability with our team.</p>}
        {isLoading ? <p role="status" className="py-16 text-center text-[#806d5d]">Loading today&apos;s menu...</p> : isError && !data ? <div className="py-16 text-center"><p className="font-semibold">The menu could not be loaded.</p><button type="button" onClick={()=>void refetch()} className="mt-4 rounded-xl bg-[#a64122] px-5 py-3 text-sm font-bold text-white">Try again</button></div> : visible.length === 0 ? <div className="rounded-2xl border border-dashed border-[#ddcdbb] bg-white py-16 text-center"><UtensilsCrossed className="mx-auto text-[#b39c8b]" /><p className="mt-3 font-bold">No dishes found</p><p className="mt-1 text-sm text-[#806d5d]">{term || category || diet !== "ALL" ? "Try another search or filter." : "Please check back a little later."}</p></div> :
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {visible.map(item=><article key={item.id} className="min-w-0 overflow-hidden rounded-2xl border border-[#ebdfd2] bg-white shadow-[0_4px_20px_rgba(89,54,32,0.05)]">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f3e9dc]">
                <img loading="lazy" decoding="async" src={resolveAssetUrl(item.imagePath,"/images/dish.svg")} alt="" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src="/images/dish.svg";}} className="h-full w-full object-cover" />
                {item.dietaryType!=="UNSPECIFIED"&&<span className="absolute left-2 top-2 grid size-8 place-items-center rounded-lg bg-white shadow-sm"><DietaryBadge type={item.dietaryType}/></span>}
              </div>
              <div className="flex min-h-32 flex-col p-3 sm:p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#a86d53]">{data?.categories.find(c=>c.id===item.categoryId)?.name}</p>
                <h3 className="mt-1 break-words text-sm font-bold leading-5 sm:text-base">{item.name}</h3>
                {item.description&&<p className="mt-1 line-clamp-2 text-xs leading-5 text-[#806d5d]">{item.description}</p>}
                <div className="mt-auto pt-3"><span className="text-base font-extrabold text-[#a64122]">{formatINR(item.sellingPrice)}</span>{item.hasHalfPortion && item.halfSellingPrice != null && <p className="mt-0.5 text-xs text-[#806d5d]">Half {formatINR(item.halfSellingPrice)}</p>}</div>
              </div>
            </article>)}
          </div>}
        <p className="mt-10 text-center text-xs text-[#9a8779]">Prices are in Indian rupees. Please confirm availability and prices with our team when ordering.</p>
      </div>
    </main>
  );
}
