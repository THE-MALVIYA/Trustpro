import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { NFTItem } from '../types';
import { Layers, Search, ExternalLink, X, Shield, Sparkles } from 'lucide-react';

export const NftGalleryView: React.FC = () => {
  const { nfts } = useWallet();
  const [search, setSearch] = useState('');
  const [selectedNft, setSelectedNft] = useState<NFTItem | null>(null);

  const filtered = nfts.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.collection.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-blue-300" />
            <span>Web3 NFT Collectibles Gallery</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View, track rarity ranks, and manage cross-chain digital collectibles.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search NFT collection..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-300"
          />
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((nft) => (
          <div
            key={nft.id}
            onClick={() => setSelectedNft(nft)}
            className="group rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden hover:border-blue-300/40 transition-all cursor-pointer shadow-xl"
          >
            <div className="relative h-60 w-full overflow-hidden bg-slate-950">
              <img
                src={nft.image}
                alt={nft.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-3 right-3 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-blue-300 border border-blue-300/30">
                Rank #{nft.rarityRank}
              </span>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">{nft.collection}</p>
              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">{nft.name}</h3>

              <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
                <div>
                  <p className="text-[10px] text-slate-500">Floor Price</p>
                  <p className="font-bold font-mono text-white">{nft.floorPriceEth} ETH</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">Value USD</p>
                  <p className="font-bold font-mono text-[#38B6FF]">${nft.floorPriceUsd.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NFT Detail Modal */}
      {selectedNft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0e1015] border border-slate-800 p-6 lg:p-8 shadow-2xl">
            <button
              onClick={() => setSelectedNft(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              id="close-nft-modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="rounded-2xl overflow-hidden border border-slate-800">
                <img src={selectedNft.image} alt={selectedNft.name} className="w-full h-auto object-cover" />
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-mono text-blue-300 font-bold uppercase">{selectedNft.collection}</span>
                  <h2 className="text-2xl font-black text-white">{selectedNft.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">Network: {selectedNft.network} • Token #{selectedNft.tokenId}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 font-mono">
                  <p className="text-slate-400">Owner: {selectedNft.owner}</p>
                  <p className="text-slate-400">Rarity Tier: Top {selectedNft.rarityRank} Global</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-300 mb-2">Traits Rarity</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedNft.traits.map((t, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                        <p className="text-slate-500 font-medium">{t.trait_type}</p>
                        <p className="font-bold text-white truncate">{t.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
