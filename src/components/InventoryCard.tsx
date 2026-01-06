import React from 'react';
import { Building, MapPin, Pencil, Trash2, Package } from 'lucide-react';
import type { InventoryItem } from '../types';

interface InventoryCardProps {
    item: InventoryItem;
    onEdit: (item: InventoryItem) => void;
    onDelete: (id: string) => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ item, onEdit, onDelete }) => {
    const palletPerQuantity = Math.round(item.quantity / item.palletCount);

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow hover:shadow-md transition-shadow p-5 flex flex-col h-full">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            {item.category}
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <button
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors group"
                            title="수정"
                            onClick={() => onEdit(item)}
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                        <button
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors group"
                            title="삭제"
                            onClick={() => onDelete(item.id)}
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Location Info Section */}
            <div className="border-t border-slate-100 pt-4 mb-4 space-y-2.5">
                <div className="flex items-center">
                    <Building className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500">창고</span>
                        <span className="text-sm font-medium text-slate-700">{item.warehouse}</span>
                    </div>
                </div>

                <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500">랙 위치</span>
                        <span className="text-sm font-medium text-slate-700">{item.rack}</span>
                    </div>
                </div>
            </div>

            {/* Quantity Section */}
            <div className="bg-slate-50 rounded-md p-3 mt-auto">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">총 수량</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                        {item.quantity.toLocaleString()}개
                    </span>
                </div>

                <div className="border-t border-slate-200 my-2"></div>

                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500">팔레트 수</span>
                    <span className="text-sm font-medium text-slate-700">{item.palletCount}개</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">팔레트당</span>
                    <span className="text-sm font-medium text-slate-700">{palletPerQuantity.toLocaleString()}개</span>
                </div>
            </div>
        </div>
    );
};
