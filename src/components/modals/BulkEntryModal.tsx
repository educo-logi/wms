import React, { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Upload, FileSpreadsheet, Download, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { InventoryItem } from '../../types';

interface BulkEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (items: Omit<InventoryItem, 'id'>[]) => void;
}

export const BulkEntryModal: React.FC<BulkEntryModalProps> = ({ isOpen, onClose, onSave }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string>('');

    const handleDownloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { name: '예시품목', category: '예시카테고리', warehouse: 'A창고', rack: 'A-01', quantity: 100, palletCount: 10 },
        ], { header: ['name', 'category', 'warehouse', 'rack', 'quantity', 'palletCount'] });

        // Set column widths
        ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];

        // Replace headers with Korean
        XLSX.utils.sheet_add_aoa(ws, [['제품명', '카테고리', '창고', '랙위치', '총수량', '팔레트수']], { origin: 'A1' });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '재고입력양식');
        XLSX.writeFile(wb, '재고입력_샘플양식.xlsx');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsName = wb.SheetNames[0];
                const ws = wb.Sheets[wsName];

                // Convert array of arrays to handle Korean headers manually
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
                if (data.length < 2) throw new Error('데이터가 없습니다.');

                const rows = data.slice(1);

                const newItems: Omit<InventoryItem, 'id'>[] = [];

                rows.forEach((row) => {
                    if (row.length === 0) return;

                    // Map columns based on Korean headers or fallback to index
                    // Assuming template order: Name, Category, Warehouse, Rack, Qty, Pallet
                    const item = {
                        name: row[0] || '',
                        category: row[1] || '',
                        warehouse: row[2] || '',
                        rack: row[3] || '',
                        quantity: Number(row[4]) || 0,
                        palletCount: Number(row[5]) || 1,
                    };

                    if (item.name) {
                        newItems.push(item);
                    }
                });

                if (newItems.length > 0) {
                    onSave(newItems);
                    // Optional: Don't close immediately to show success message, or close
                    alert(`${newItems.length}건의 데이터를 성공적으로 읽었습니다.`);
                    onClose();
                } else {
                    setError('유효한 데이터가 없습니다.');
                }

            } catch (err) {
                console.error(err);
                setError('엑셀 파일을 읽는 중 오류가 발생했습니다. 양식을 확인해주세요.');
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-overlayShow" />
                <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none data-[state=open]:animate-contentShow">
                    <div className="flex justify-between items-center mb-6">
                        <Dialog.Title className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <FileSpreadsheet className="w-6 h-6 text-green-600" />
                            엑셀 대량 등록
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-slate-400 hover:text-slate-500">
                                <X className="w-5 h-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <div className="space-y-6">
                        {/* Step 1: Download Template */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                <span className="bg-slate-200 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                양식 다운로드
                            </h3>
                            <p className="text-sm text-slate-500 mb-3 ml-8">
                                데이터를 올바르게 입력하기 위해 샘플 양식을 다운로드하세요.
                            </p>
                            <button
                                onClick={handleDownloadTemplate}
                                className="ml-8 text-sm flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <Download className="w-4 h-4" />
                                엑셀 샘플 양식 받기
                            </button>
                        </div>

                        {/* Step 2: Upload File */}
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                <span className="bg-slate-200 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                엑셀 파일 업로드
                            </h3>
                            <div
                                className="ml-8 mt-2 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-sm text-slate-600 font-medium">
                                    여기를 클릭하여 파일을 선택하세요
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    .xlsx, .xls 파일만 가능
                                </p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
