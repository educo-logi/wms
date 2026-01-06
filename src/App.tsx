import { useState, useMemo } from 'react';
import { HeaderMenu } from './components/HeaderMenu';
import { InventorySearch } from './components/InventorySearch';
import { InventoryList } from './components/InventoryList';
import { InventoryStatus } from './components/InventoryStatus';
import { WarehouseSummary } from './components/WarehouseSummary';
import { StockEntryModal } from './components/modals/StockEntryModal';
import { StockMoveModal } from './components/modals/StockMoveModal';
import { StockEditModal } from './components/modals/StockEditModal';
import { BulkEntryModal } from './components/modals/BulkEntryModal';
import type { InventoryItem } from './types';

// Sample Data
const initialInventory: InventoryItem[] = [
  { id: '1', name: '프리스텔라 A3교재', warehouse: '1번 창고', rack: 'A-12', quantity: 2400, palletCount: 4, category: '교재' },
  { id: '2', name: '프리스텔라 B4교재', warehouse: '1번 창고', rack: 'A-13', quantity: 1800, palletCount: 3, category: '교재' },
  { id: '3', name: '수학 워크북 초급', warehouse: '2번 창고', rack: 'B-05', quantity: 3200, palletCount: 5, category: '워크북' },
  { id: '4', name: '영어 교재 중급', warehouse: '2번 창고', rack: 'C-08', quantity: 1600, palletCount: 2, category: '교재' },
  { id: '5', name: '과학 실험 키트', warehouse: '1번 창고', rack: 'D-20', quantity: 800, palletCount: 2, category: '키트' },
  { id: '6', name: '미술 도구 세트', warehouse: '3번 창고', rack: 'E-15', quantity: 1200, palletCount: 3, category: '도구' },
  { id: '7', name: '프리스텔라 C5교재', warehouse: '1번 창고', rack: 'A-14', quantity: 2000, palletCount: 4, category: '교재' },
  { id: '8', name: '독서 워크북', warehouse: '2번 창고', rack: 'B-10', quantity: 2800, palletCount: 4, category: '워크북' },
];

function App() {
  const [items, setItems] = useState<InventoryItem[]>(initialInventory);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // View state
  const [currentView, setCurrentView] = useState<'home' | 'status'>('home');

  // Filter logic
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;

    const lowerTerm = searchTerm.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(lowerTerm) ||
      item.warehouse.toLowerCase().includes(lowerTerm) ||
      item.rack.toLowerCase().includes(lowerTerm) ||
      item.category.toLowerCase().includes(lowerTerm)
    );
  }, [searchTerm, items]);

  const handleStockEntry = (newItem: Omit<InventoryItem, 'id'>) => {
    const id = (Math.max(...items.map(i => parseInt(i.id))) + 1).toString();
    setItems([...items, { ...newItem, id }]);
  };

  const handleBulkEntry = (newItems: Omit<InventoryItem, 'id'>[]) => {
    let maxId = Math.max(...items.map(i => parseInt(i.id)));
    const itemsWithIds = newItems.map(item => {
      maxId += 1;
      return { ...item, id: maxId.toString() };
    });
    setItems([...items, ...itemsWithIds]);
  };

  const handleStockMove = (itemId: string, updates: { warehouse: string; rack: string }) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, ...updates }
        : item
    ));
  };

  const handleUpdateItem = (updatedItem: InventoryItem) => {
    setItems(items.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('정말 이 재고 항목을 삭제하시겠습니까?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setIsEditOpen(true);
  };

  const handleBulkDelete = (ids: string[]) => {
    setItems(items.filter(item => !ids.includes(item.id)));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <HeaderMenu
          onStockEntryClick={() => setIsEntryOpen(true)}
          onStockMoveClick={() => setIsMoveOpen(true)}
          onHomeClick={() => {
            setSearchTerm('');
            setCurrentView('home');
          }}
          onInventoryStatusClick={() => setCurrentView('status')}
        />

        <main>
          {currentView === 'home' ? (
            <>
              <InventorySearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />

              {searchTerm.trim() ? (
                <InventoryList
                  items={filteredItems}
                  onEdit={openEditModal}
                  onDelete={handleDeleteItem}
                />
              ) : (
                <WarehouseSummary items={items} />
              )}
            </>
          ) : (
            <InventoryStatus items={items} onDelete={handleBulkDelete} />
          )}
        </main>

        <StockEntryModal
          isOpen={isEntryOpen}
          onClose={() => setIsEntryOpen(false)}
          onSave={handleStockEntry}
          onBulkClick={() => setIsBulkOpen(true)}
        />

        <StockMoveModal
          isOpen={isMoveOpen}
          onClose={() => setIsMoveOpen(false)}
          items={items}
          onMove={handleStockMove}
        />

        <BulkEntryModal
          isOpen={isBulkOpen}
          onClose={() => setIsBulkOpen(false)}
          onSave={handleBulkEntry}
        />

        <StockEditModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={handleUpdateItem}
          item={editingItem}
        />
      </div>
    </div>
  );
}

export default App;
