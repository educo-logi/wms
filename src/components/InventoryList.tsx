import React from 'react';
import type { InventoryItem } from '../types';
import { InventoryCard } from './InventoryCard';

interface InventoryListProps {
    items: InventoryItem[];
    onEdit: (item: InventoryItem) => void;
    onDelete: (id: string) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({ items, onEdit, onDelete }) => {
    const totalItems = items.length;

    return (
        <div>
            <div className="mb-4">
                <span className="text-slate-600">총 <span className="font-bold text-slate-900">{totalItems}</span>개의 재고 항목</span>
            </div>

            {totalItems === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                    <p className="text-slate-500">검색 결과가 없습니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                        <InventoryCard
                            key={item.id}
                            item={item}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
