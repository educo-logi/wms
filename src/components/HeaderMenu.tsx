import { Menu, PackagePlus, ArrowRightLeft, Home, ClipboardList } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface HeaderMenuProps {
    onStockEntryClick: () => void;
    onStockMoveClick: () => void;
    onHomeClick: () => void;
    onInventoryStatusClick: () => void;
}

export const HeaderMenu: React.FC<HeaderMenuProps> = ({ onStockEntryClick, onStockMoveClick, onHomeClick, onInventoryStatusClick }) => {
    return (
        <header className="flex justify-between items-start mb-8">
            <div>
                <h1
                    className="text-2xl font-bold text-slate-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={onHomeClick}
                >
                    창고 재고 관리
                </h1>
                <p className="text-slate-500">재고 위치 및 수량을 검색하고 확인하세요</p>
            </div>

            <div className="flex gap-2">
                <button
                    className="p-2 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                    aria-label="Home"
                    onClick={onHomeClick}
                >
                    <Home className="w-6 h-6 text-slate-700" />
                </button>

                <button
                    className="p-2 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                    aria-label="Inventory Status"
                    onClick={onInventoryStatusClick}
                >
                    <ClipboardList className="w-6 h-6 text-slate-700" />
                </button>

                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button
                            className="p-2 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                            aria-label="Menu"
                        >
                            <Menu className="w-6 h-6 text-slate-700" />
                        </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            className="min-w-[220px] bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[transform,opacity] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade z-50"
                            sideOffset={5}
                        >
                            <DropdownMenu.Item
                                className="group text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1 cursor-pointer hover:bg-slate-100 hover:text-blue-600"
                                onSelect={onStockEntryClick}
                            >
                                <div className="absolute left-0 w-[25px] flex items-center justify-center">
                                    <PackagePlus className="w-4 h-4" />
                                </div>
                                재고 입력
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                className="group text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1 cursor-pointer hover:bg-slate-100 hover:text-blue-600 mt-1"
                                onSelect={onStockMoveClick}
                            >
                                <div className="absolute left-0 w-[25px] flex items-center justify-center">
                                    <ArrowRightLeft className="w-4 h-4" />
                                </div>
                                재고 이동
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>
        </header >
    );
};
