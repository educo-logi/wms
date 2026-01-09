export interface GoogleSheetItem {
    id: string;
    name: string;
    category: string;
    warehouse: string;
    rack: string;
    quantity: number;
    palletCount: number;
    isGgadegi?: boolean;
}

// TODO: Replace with the actual Web App URL provided by the user
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxXaMnOM7hGbs7u6wL4YFobX4KplSjLPfnVUxchJV2HSEKgkb7hVI1fX3j1xgaTBY-g/exec';

export const sheetsApi = {
    // Fetch all inventory items
    async getInventory(): Promise<GoogleSheetItem[]> {
        try {
            // Add cache buster to prevent browser caching
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?t=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            console.log('Raw data from Sheet:', data); // Debug log

            // Convert numbers if necessary (sheets might return strings)
            return data.map((item: any) => ({
                ...item,
                quantity: Number(item.quantity) || 0,
                palletCount: Number(item.palletCount) || 0,
                isGgadegi: item.isGgadegi === true || String(item.isGgadegi).toLowerCase() === 'true'
            }));
        } catch (error) {
            console.error('Error fetching inventory:', error);
            return [];
        }
    },

    // Delete items by ID
    async deleteItems(ids: string[]): Promise<boolean> {

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: JSON.stringify({ action: 'delete', ids }),
            });
            return true;
        } catch (error) {
            console.error('Error deleting items:', error);
            return false;
        }
    },

    // Toggle Ggadegi status
    async toggleGgadegi(id: string, isGgadegi: boolean): Promise<boolean> {
        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: JSON.stringify({ action: 'toggleGgadegi', id, isGgadegi }),
            });
            return true;
        } catch (error) {
            console.error('Error toggling Ggadegi:', error);
            return false;
        }
    }
};
