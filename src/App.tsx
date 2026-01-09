import { useState, useMemo, useEffect } from 'react';
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
import { sheetsApi, type GoogleSheetItem } from './lib/sheets';

function App() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // View state
  const [currentView, setCurrentView] = useState<'home' | 'status'>('home');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await sheetsApi.getInventory();
      // Ensure data conforms to InventoryItem
      const formattedData: InventoryItem[] = data.map((item: GoogleSheetItem) => ({
        id: item.id.toString(),
        name: item.name,
        category: item.category,
        warehouse: item.warehouse,
        rack: item.rack,
        quantity: item.quantity,
        palletCount: item.palletCount
      }));
      setItems(formattedData);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleStockEntry = async (newItem: Omit<InventoryItem, 'id'>) => {
    // TODO: Implement create in Google Script
    alert('구글 시트 연동: 추가 기능은 아직 스크립트에 구현되지 않았습니다.');
    console.log('Would add:', newItem);
  };

  const handleBulkEntry = async (newItems: Omit<InventoryItem, 'id'>[]) => {
    // TODO: Implement bulk create in Google Script
    alert('구글 시트 연동: 일괄 추가 기능은 아직 스크립트에 구현되지 않았습니다.');
    console.log('Would bulk add:', newItems);
  };

  const handleStockMove = async (itemId: string, updates: { warehouse: string; rack: string }) => {
    // TODO: Implement update in Google Script
    alert('구글 시트 연동: 이동 기능은 아직 스크립트에 구현되지 않았습니다.');
    console.log('Would move:', itemId, updates);
  };

  const handleUpdateItem = async (updatedItem: InventoryItem) => {
    // TODO: Implement update in Google Script
    alert('구글 시트 연동: 수정 기능은 아직 스크립트에 구현되지 않았습니다.');
    console.log('Would update:', updatedItem);
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('정말 이 재고 항목을 삭제하시겠습니까?')) {
      await handleBulkDelete([id]);
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setIsEditOpen(true);
  };

  const handleToggleGgadegi = async (id: string, currentStatus: boolean | undefined) => {
    const newStatus = !currentStatus;

    // Optimistic update
    setItems(prevItems => prevItems.map(item =>
      item.id === id ? { ...item, isGgadegi: newStatus } : item
    ));

    // API call in background
    const success = await sheetsApi.toggleGgadegi(id, newStatus);

    // Revert if failed
    if (!success) {
      console.error('Toggle failed, reverting');
      setItems(prevItems => prevItems.map(item =>
        item.id === id ? { ...item, isGgadegi: currentStatus } : item
      ));
      alert('상태 변경에 실패했습니다.');
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      setLoading(true);
      const success = await sheetsApi.deleteItems(ids);
      if (success) {
        // Optimistic update or refetch
        setItems(prev => prev.filter(item => !ids.includes(item.id)));
        alert('삭제되었습니다.');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting items:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="text-slate-500">데이터를 불러오는 중...</div>
      </div>
    );
  }

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
            <InventoryStatus
              items={items}
              onDelete={handleBulkDelete}
              onToggleGgadegi={handleToggleGgadegi}
            />
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
