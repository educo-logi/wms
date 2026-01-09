import React, { useState, useMemo } from 'react';
import type { InventoryItem } from '../types';
import { Search, Filter, Trash2 } from 'lucide-react';

interface InventoryStatusProps {
    items: InventoryItem[];

    onDelete: (ids: string[]) => void;
    onToggleGgadegi: (id: string, currentStatus: boolean | undefined) => Promise<void>;
}

export const InventoryStatus: React.FC<InventoryStatusProps> = ({ items, onDelete, onToggleGgadegi }) => {
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
    const [selectedLine, setSelectedLine] = useState<string>('all');
    const [isGgadegiOnly, setIsGgadegiOnly] = useState<boolean>(false);
    const [localSearch, setLocalSearch] = useState<string>('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Extract unique warehouses
    const warehouses = useMemo(() => {
        const unique = new Set(items.map(item => item.warehouse));
        return Array.from(unique).sort();
    }, [items]);

    // Extract unique lines (first letter of rack)
    const lines = useMemo(() => {
        const unique = new Set(items.map(item => {
            const rackParts = item.rack.split('-');
            return rackParts[0] || 'Unknown';
        }));
        return Array.from(unique).sort();
    }, [items]);

    // Filter items
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchWarehouse = selectedWarehouse === 'all' || item.warehouse === selectedWarehouse;

            const line = item.rack.split('-')[0] || 'Unknown';
            const matchLine = selectedLine === 'all' || line === selectedLine;

            const matchGgadegi = !isGgadegiOnly || !!item.isGgadegi;

            const searchLower = localSearch.toLowerCase();
            const matchSearch = !localSearch ||
                item.name.toLowerCase().includes(searchLower) ||
                item.rack.toLowerCase().includes(searchLower) ||
                item.category.toLowerCase().includes(searchLower);

            return matchWarehouse && matchLine && matchSearch && matchGgadegi;
        });
    }, [items, selectedWarehouse, selectedLine, localSearch, isGgadegiOnly]);

    // Selection Logic
    const toggleSelectAll = () => {
        if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredItems.map(item => item.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) return;

        if (window.confirm(`선택한 ${selectedIds.size}개 항목을 삭제하시겠습니까?`)) {
            onDelete(Array.from(selectedIds));
            setSelectedIds(new Set());
        }
    };

    const handleToggleGgadegi = async (e: React.MouseEvent, item: InventoryItem) => {
        e.stopPropagation();
        await onToggleGgadegi(item.id, item.isGgadegi);
    };

    const handleDebug = () => {
        if (items.length > 0) {
            const firstItem = items[0];
            const keys = Object.keys(firstItem).join(', ');
            alert(`[Debug Info]\nID: ${firstItem.id}\nName: ${firstItem.name}\nisGgadegi (Value): ${firstItem.isGgadegi}\n\n[All Keys Found]\n${keys}`);
        } else {
            alert('데이터가 없습니다.');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-slate-900">재고 현황</h2>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Bulk Delete Button */}
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleDeleteSelected}
                            className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors border border-red-100"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm font-medium">선택 삭제 ({selectedIds.size})</span>
                        </button>
                    )}

                    {/* Ggadegi Filter */}
                    <button
                        onClick={() => setIsGgadegiOnly(!isGgadegiOnly)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors border ${isGgadegiOnly
                            ? 'bg-orange-50 text-orange-600 border-orange-200'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        <span className="text-lg">💪</span>
                        <span className="text-sm font-medium">까데기만 보기</span>
                    </button>

                    {/* Debug Button (Temp) */}
                    <button
                        onClick={handleDebug}
                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md text-xs hover:bg-gray-200"
                    >
                        데이터 확인(디버그)
                    </button>

                    {/* Warehouse Filter */}
                    <div className="relative">
                        <select
                            className="w-full sm:w-auto pl-3 pr-8 py-2 border border-slate-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                            value={selectedWarehouse}
                            onChange={(e) => setSelectedWarehouse(e.target.value)}
                        >
                            <option value="all">전체 창고</option>
                            {warehouses.map(w => (
                                <option key={w} value={w}>{w}</option>
                            ))}
                        </select>
                        <Filter className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Line Filter */}
                    <div className="relative">
                        <select
                            className="w-full sm:w-auto pl-3 pr-8 py-2 border border-slate-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                            value={selectedLine}
                            onChange={(e) => setSelectedLine(e.target.value)}
                        >
                            <option value="all">전체 라인</option>
                            {lines.map(l => (
                                <option key={l} value={l}>{l} 라인</option>
                            ))}
                        </select>
                        <Filter className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Search */}
                    <div className="relative flex-grow sm:flex-grow-0">
                        <input
                            type="text"
                            placeholder="검색..."
                            className="w-full sm:w-64 pl-9 pr-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 w-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        checked={filteredItems.length > 0 && selectedIds.size === filteredItems.length}
                                        onChange={toggleSelectAll}
                                    />
                                </div>
                            </th>
                            <th className="px-6 py-3 font-medium">제품명</th>
                            <th className="px-2 py-3 font-medium text-center w-10">💪</th>
                            <th className="px-6 py-3 font-medium">카테고리</th>
                            <th className="px-6 py-3 font-medium">창고</th>
                            <th className="px-6 py-3 font-medium">구역(Rack)</th>
                            <th className="px-6 py-3 font-medium text-right">수량</th>
                            <th className="px-6 py-3 font-medium text-right">팔레트</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                    데이터가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map((item) => (
                                <tr
                                    key={item.id}
                                    className={`hover:bg-slate-50 transition-colors ${selectedIds.has(item.id) ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => toggleSelect(item.id)}
                                >
                                    <td className="px-6 py-4 w-4">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                checked={selectedIds.has(item.id)}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    toggleSelect(item.id);
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                                    <td className="px-2 py-4 text-center">
                                        <button
                                            onClick={(e) => handleToggleGgadegi(e, item)}
                                            className={`p-1 rounded-full hover:bg-slate-100 transition-colors ${item.isGgadegi ? 'opacity-100 grayscale-0' : 'opacity-20 grayscale'
                                                }`}
                                            title={item.isGgadegi ? '까데기 해제' : '까데기 설정'}
                                        >
                                            <span className="text-xl">💪</span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{item.warehouse}</td>
                                    <td className="px-6 py-4 text-slate-600 font-mono">{item.rack}</td>
                                    <td className="px-6 py-4 text-right font-medium text-blue-600">
                                        {item.quantity.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-600">
                                        {item.palletCount}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-xs text-slate-400 text-right">
                총 {filteredItems.length}개 항목 표시 중
            </div>
        </div>
    );
};
