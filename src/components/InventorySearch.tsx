import React from 'react';
import { PackageSearch } from 'lucide-react';

interface InventorySearchProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

export const InventorySearch: React.FC<InventorySearchProps> = ({ searchTerm, onSearchChange }) => {
    return (
        <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <PackageSearch className="h-5 w-5 text-slate-400" />
            </div>
            <input
                type="text"
                className="block w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="제품명, 창고, 랙 위치 검색..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
    );
};
