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
        palletCount: item.palletCount,
        isGgadegi: item.isGgadegi
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
    try {
      setLoading(true);
      const success = await sheetsApi.createItem({
        name: newItem.name,
        category: newItem.category,
        warehouse: newItem.warehouse,
        rack: newItem.rack,
        quantity: newItem.quantity,
        palletCount: newItem.palletCount,
        isGgadegi: newItem.isGgadegi || false
      });

      if (success) {
        alert('성공적으로 추가되었습니다.');
        setIsEntryOpen(false);
        // Refresh items to get the new ID and data
        await fetchItems();
      } else {
        alert('추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      alert('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkEntry = async (newItems: Omit<InventoryItem, 'id'>[]) => {
    try {
      setLoading(true);
      const itemsToCreate = newItems.map(item => ({
        ...item,
        isGgadegi: item.isGgadegi || false
      }));

      const success = await sheetsApi.createItemsBulk(itemsToCreate);

      if (success) {
        alert(`${newItems.length}개 항목이 추가되었습니다.`);
        setIsBulkOpen(false);
        await fetchItems();
      } else {
        alert('일괄 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error bulk creating items:', error);
      alert('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStockMove = async (itemId: string, updates: { warehouse: string; rack: string }) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const updatedItem = { ...item, ...updates };
    // Optimistic update: Fire and forget (don't await)
    handleUpdateItem(updatedItem);
    setIsMoveOpen(false);
  };

  const handleUpdateItem = async (updatedItem: InventoryItem) => {
    // 1. Snapshot previous state for rollback
    const oldItem = items.find(i => i.id === updatedItem.id);
    if (!oldItem) return;

    // 2. Optimistic Update: Update UI immediately
    setItems(prevItems => prevItems.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    ));

    // 3. Close Modal Immediately
    setIsEditOpen(false);

    try {
      // 4. Background API Call
      // Convert to GoogleSheetItem format if needed (remove extra props if any)
      const success = await sheetsApi.updateItem({
        id: updatedItem.id,
        name: updatedItem.name,
        category: updatedItem.category,
        warehouse: updatedItem.warehouse,
        rack: updatedItem.rack,
        quantity: updatedItem.quantity,
        palletCount: updatedItem.palletCount,
        isGgadegi: updatedItem.isGgadegi
      });

      if (!success) {
        throw new Error('Update failed');
      }

      // Optional: Silent verify/refresh in background
      // fetchItems(); 
    } catch (error) {
      console.error('Error updating item:', error);
      alert('수정에 실패했습니다. 변경사항이 취소됩니다.');

      // 5. Revert on Failure
      setItems(prevItems => prevItems.map(item =>
        item.id === updatedItem.id ? oldItem : item
      ));
    }
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
              onEdit={openEditModal}
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
