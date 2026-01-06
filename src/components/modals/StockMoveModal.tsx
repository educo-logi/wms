import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { InventoryItem } from '../../types';

interface StockMoveModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: InventoryItem[];
    onMove: (itemId: string, updates: { warehouse: string; rack: string }) => void;
}

export const StockMoveModal: React.FC<StockMoveModalProps> = ({ isOpen, onClose, items, onMove }) => {
    const [selectedItemId, setSelectedItemId] = useState('');
    const [locationData, setLocationData] = useState({
        warehouse: '',
        rack: '',
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedItemId('');
            setLocationData({ warehouse: '', rack: '' });
        }
    }, [isOpen]);

    // Auto-fill current location when item is selected
    useEffect(() => {
        if (selectedItemId) {
            const item = items.find(i => i.id === selectedItemId);
            if (item) {
                setLocationData({
                    warehouse: item.warehouse,
                    rack: item.rack,
                });
            }
        }
    }, [selectedItemId, items]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItemId) {
            onMove(selectedItemId, locationData);
            onClose();
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-overlayShow" />
                <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none data-[state=open]:animate-contentShow">
                    <div className="flex justify-between items-center mb-4">
                        <Dialog.Title className="text-xl font-bold text-slate-900">
                            재고 이동
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button
                                className="text-slate-400 hover:text-slate-500 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">이동할 재고 선택</label>
                            <select
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedItemId}
                                onChange={(e) => setSelectedItemId(e.target.value)}
                            >
                                <option value="">재고를 선택하세요</option>
                                {items.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} ({item.warehouse} / {item.rack})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="border-t border-slate-100 my-4"></div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-2">변경할 위치 정보</h4>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">새 창고명</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={locationData.warehouse}
                                    onChange={(e) => setLocationData({ ...locationData, warehouse: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">새 랙 위치</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={locationData.rack}
                                    onChange={(e) => setLocationData({ ...locationData, rack: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                disabled={!selectedItemId}
                                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                이동 확인
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
