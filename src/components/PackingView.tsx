import React, { useState } from 'react';
import { Trip, PackingItem } from '../types';
import { 
  CheckSquare, 
  Square, 
  CloudSun, 
  Plus, 
  Sparkles, 
  Trash2, 
  ShieldCheck, 
  Luggage,
  Filter
} from 'lucide-react';

interface PackingViewProps {
  trip: Trip;
  onUpdateTrip: (updatedTrip: Trip) => void;
}

export const PackingView: React.FC<PackingViewProps> = ({ trip, onUpdateTrip }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Clothing');
  const [newItemEssential, setNewItemEssential] = useState(false);
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [isGenerating, setIsGenerating] = useState(false);

  const totalItems = trip.packingList.length;
  const packedItems = trip.packingList.filter((item) => item.packed).length;
  const essentialTotal = trip.packingList.filter((item) => item.essential).length;
  const essentialPacked = trip.packingList.filter((item) => item.essential && item.packed).length;
  const progressPercent = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  const categories = Array.from(new Set(trip.packingList.map((item) => item.category)));

  const togglePacked = (id: string) => {
    const updated = trip.packingList.map((item) =>
      item.id === id ? { ...item, packed: !item.packed } : item
    );
    onUpdateTrip({ ...trip, packingList: updated });
  };

  const deleteItem = (id: string) => {
    const updated = trip.packingList.filter((item) => item.id !== id);
    onUpdateTrip({ ...trip, packingList: updated });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: PackingItem = {
      id: `pack-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      essential: newItemEssential,
      quantity: parseInt(newItemQuantity, 10) || 1,
      packed: false,
    };

    onUpdateTrip({
      ...trip,
      packingList: [...trip.packingList, newItem],
    });

    setNewItemName('');
    setShowAddForm(false);
  };

  const handleGenerateWeatherGear = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/packing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: trip.destination,
          durationDays: trip.durationDays,
          travelStyle: trip.travelStyle,
          month: trip.startDate ? new Date(trip.startDate).toLocaleString('default', { month: 'long' }) : 'October',
        }),
      });

      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        // Merge without duplicating existing names
        const existingNames = new Set(trip.packingList.map((i) => i.name.toLowerCase()));
        const newItems: PackingItem[] = data.items
          .filter((i: any) => !existingNames.has(i.name.toLowerCase()))
          .map((i: any) => ({
            id: `pack-ai-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: i.name,
            category: i.category || 'Gear',
            essential: Boolean(i.essential),
            quantity: i.quantity || 1,
            packed: false,
          }));

        onUpdateTrip({
          ...trip,
          packingList: [...trip.packingList, ...newItems],
        });
      }
    } catch (err) {
      console.error('Failed to generate packing list:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredItems = trip.packingList.filter((item) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'essential') return item.essential;
    return item.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Progress & Weather Banner */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Luggage className="h-5 w-5 text-amber-600" />
              <h2 className="text-base font-semibold text-stone-900">
                Luggage & Gear Intelligence
              </h2>
            </div>
            <p className="text-xs text-stone-500">
              Climate-calibrated checklist for {trip.destination}. Essential documents, electronics, and seasonal clothing.
            </p>
          </div>

          <button
            id="btn-ai-packing-sync"
            onClick={handleGenerateWeatherGear}
            disabled={isGenerating}
            className="inline-flex items-center space-x-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            <CloudSun className={`h-4 w-4 text-amber-400 ${isGenerating ? 'animate-bounce' : ''}`} />
            <span>{isGenerating ? 'Analyzing Climate Forecast...' : 'Gemini Climate Sync'}</span>
          </button>
        </div>

        {/* Packing Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-stone-700">
              Packed: <strong className="text-stone-900">{packedItems}</strong> of {totalItems} items ({progressPercent}%)
            </span>
            <span className="text-stone-500">
              Essentials: <strong className="text-amber-700">{essentialPacked}/{essentialTotal}</strong>
            </span>
          </div>

          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Categories & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors capitalize ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white font-medium'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            All ({totalItems})
          </button>
          <button
            onClick={() => setSelectedCategory('essential')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
              selectedCategory === 'essential'
                ? 'bg-amber-600 text-white font-medium'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
            <span>Essentials ({essentialTotal})</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white font-medium'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center space-x-1 text-xs font-medium text-amber-700 hover:text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Custom Item</span>
        </button>
      </div>

      {/* Add Item Inline Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleAddItem}
          className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-wrap items-center gap-3 animate-fade-in"
        >
          <input
            type="text"
            required
            placeholder="Item name (e.g., Waterproof daypack)"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1 min-w-[200px] text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          />

          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
            className="text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          >
            <option value="Documents">Documents</option>
            <option value="Clothing">Clothing</option>
            <option value="Tech">Tech & Cables</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Health">Health & Medicine</option>
            <option value="Accessories">Accessories</option>
          </select>

          <input
            type="number"
            min="1"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(e.target.value)}
            className="w-16 text-xs px-2 py-2 border border-stone-300 rounded-lg text-center"
            title="Quantity"
          />

          <label className="flex items-center space-x-1.5 text-xs text-stone-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={newItemEssential}
              onChange={(e) => setNewItemEssential(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span>Must-Have</span>
          </label>

          <div className="flex items-center space-x-2 ml-auto">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-stone-500 hover:text-stone-700 px-2 py-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium px-3 py-1.5 rounded-lg"
            >
              Add Item
            </button>
          </div>
        </form>
      )}

      {/* Items List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            id={`pack-item-${item.id}`}
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
              item.packed
                ? 'bg-stone-50/70 border-stone-200 text-stone-400'
                : 'bg-white border-stone-200 shadow-xs hover:border-amber-300 text-stone-800'
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <button
                onClick={() => togglePacked(item.id)}
                className="text-stone-400 hover:text-amber-600 transition-colors shrink-0"
              >
                {item.packed ? (
                  <CheckSquare className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>

              <div className="truncate">
                <span
                  className={`text-xs sm:text-sm font-medium block truncate ${
                    item.packed ? 'line-through text-stone-400' : 'text-stone-900'
                  }`}
                >
                  {item.name}
                  {item.quantity > 1 && (
                    <span className="text-xs text-stone-400 font-normal ml-1">
                      (×{item.quantity})
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                  {item.category}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {item.essential && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  Vital
                </span>
              )}
              <button
                onClick={() => deleteItem(item.id)}
                className="text-stone-300 hover:text-red-500 p-1 transition-colors"
                title="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
