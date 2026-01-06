import React, { useMemo } from 'react';
import { Warehouse, Package } from 'lucide-react';
import type { InventoryItem } from '../types';

interface WarehouseSummaryProps {
    items: InventoryItem[];
}

export const WarehouseSummary: React.FC<WarehouseSummaryProps> = ({ items }) => {
    const summary = useMemo(() => {
        const stats: Record<string, { palletCount: number; itemCount: number }> = {};

        items.forEach(item => {
            if (!stats[item.warehouse]) {
                stats[item.warehouse] = { palletCount: 0, itemCount: 0 };
            }
            stats[item.warehouse].palletCount += item.palletCount;
            stats[item.warehouse].itemCount += 1;
        });

        return Object.entries(stats).sort((a, b) => a[0].localeCompare(b[0]));
    }, [items]);

    return (
        <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-slate-600" />
                창고별 적재 현황
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary.map(([warehouse, stat]) => (
                    <div key={warehouse} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Warehouse className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                                {stat.itemCount}개 품목
                            </span>
                        </div>

                        <h3 className="text-slate-500 text-sm font-medium mb-1">{warehouse}</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-slate-900">{stat.palletCount}</span>
                            <span className="text-slate-500 font-medium">팔레트</span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-sm text-slate-500">
                            <Package className="w-4 h-4 mr-1.5" />
                            <span>총 적재 수량 합계</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
