import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';
import {
  PriceList,
  PriceListInput,
  getUserPriceLists,
  createPriceList,
  updatePriceList,
  deletePriceList,
} from '../services/priceListService';

interface PriceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (priceList: PriceList) => void;
  currencySymbol: string;
}

export default function PriceListModal({
  isOpen,
  onClose,
  onSelect,
  currencySymbol,
}: PriceListModalProps) {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PriceListInput>({
    name: '',
    battery_value: '',
    battery_price: 0,
    battery_brand: '',
    inverter_value: '',
    inverter_price: 0,
    inverter_brand: '',
    panel_value: '',
    panel_price: 0,
    panel_brand: '',
    charge_controller_value: '',
    charge_controller_price: 0,
    charge_controller_brand: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadPriceLists();
    }
  }, [isOpen]);

  const loadPriceLists = async () => {
    setLoading(true);
    try {
      const lists = await getUserPriceLists();
      setPriceLists(lists);
    } catch (error) {
      console.error('Error loading price lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await updatePriceList(editingId, formData);
      } else {
        await createPriceList(formData);
      }
      await loadPriceLists();
      resetForm();
    } catch (error) {
      console.error('Error saving price list:', error);
      alert(error instanceof Error ? error.message : 'Failed to save price list');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (priceList: PriceList) => {
    setFormData({
      name: priceList.name,
      battery_value: priceList.battery_value,
      battery_price: priceList.battery_price,
      battery_brand: priceList.battery_brand,
      inverter_value: priceList.inverter_value,
      inverter_price: priceList.inverter_price,
      inverter_brand: priceList.inverter_brand,
      panel_value: priceList.panel_value,
      panel_price: priceList.panel_price,
      panel_brand: priceList.panel_brand,
      charge_controller_value: priceList.charge_controller_value,
      charge_controller_price: priceList.charge_controller_price,
      charge_controller_brand: priceList.charge_controller_brand,
    });
    setEditingId(priceList.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price list?')) {
      return;
    }

    setLoading(true);
    try {
      await deletePriceList(id);
      await loadPriceLists();
    } catch (error) {
      console.error('Error deleting price list:', error);
      alert('Failed to delete price list');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPriceList = (priceList: PriceList) => {
    onSelect(priceList);
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      battery_value: '',
      battery_price: 0,
      battery_brand: '',
      inverter_value: '',
      inverter_price: 0,
      inverter_brand: '',
      panel_value: '',
      panel_price: 0,
      panel_brand: '',
      charge_controller_value: '',
      charge_controller_price: 0,
      charge_controller_brand: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            {showForm ? (editingId ? 'Edit Price List' : 'Add New Price List') : 'Select Price List'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price List Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Battery</h3>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Value (e.g., 200Ah)</label>
                    <input
                      type="text"
                      value={formData.battery_value}
                      onChange={(e) => setFormData({ ...formData, battery_value: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Price</label>
                    <input
                      type="number"
                      value={formData.battery_price}
                      onChange={(e) => setFormData({ ...formData, battery_price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Brand (optional)</label>
                    <input
                      type="text"
                      value={formData.battery_brand}
                      onChange={(e) => setFormData({ ...formData, battery_brand: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Inverter</h3>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Value (e.g., 3KVA)</label>
                    <input
                      type="text"
                      value={formData.inverter_value}
                      onChange={(e) => setFormData({ ...formData, inverter_value: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Price</label>
                    <input
                      type="number"
                      value={formData.inverter_price}
                      onChange={(e) => setFormData({ ...formData, inverter_price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Brand (optional)</label>
                    <input
                      type="text"
                      value={formData.inverter_brand}
                      onChange={(e) => setFormData({ ...formData, inverter_brand: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Solar Panel</h3>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Value (e.g., 400W)</label>
                    <input
                      type="text"
                      value={formData.panel_value}
                      onChange={(e) => setFormData({ ...formData, panel_value: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Price</label>
                    <input
                      type="number"
                      value={formData.panel_price}
                      onChange={(e) => setFormData({ ...formData, panel_price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Brand (optional)</label>
                    <input
                      type="text"
                      value={formData.panel_brand}
                      onChange={(e) => setFormData({ ...formData, panel_brand: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Charge Controller</h3>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Value (e.g., 60A)</label>
                    <input
                      type="text"
                      value={formData.charge_controller_value}
                      onChange={(e) => setFormData({ ...formData, charge_controller_value: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Price</label>
                    <input
                      type="number"
                      value={formData.charge_controller_price}
                      onChange={(e) => setFormData({ ...formData, charge_controller_price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Brand (optional)</label>
                    <input
                      type="text"
                      value={formData.charge_controller_brand}
                      onChange={(e) => setFormData({ ...formData, charge_controller_brand: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          ) : (
            <>
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-gray-600">Loading price lists...</div>
                </div>
              ) : priceLists.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No price lists saved yet</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={20} />
                    Create Your First Price List
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {priceLists.map((priceList) => (
                    <div
                      key={priceList.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{priceList.name}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(priceList)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(priceList.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Battery</div>
                          <div className="font-medium">{priceList.battery_value}</div>
                          <div className="text-sm text-gray-900">
                            {currencySymbol}{priceList.battery_price.toLocaleString()}
                          </div>
                          {priceList.battery_brand && (
                            <div className="text-xs text-gray-500 mt-1">{priceList.battery_brand}</div>
                          )}
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Inverter</div>
                          <div className="font-medium">{priceList.inverter_value}</div>
                          <div className="text-sm text-gray-900">
                            {currencySymbol}{priceList.inverter_price.toLocaleString()}
                          </div>
                          {priceList.inverter_brand && (
                            <div className="text-xs text-gray-500 mt-1">{priceList.inverter_brand}</div>
                          )}
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Solar Panel</div>
                          <div className="font-medium">{priceList.panel_value}</div>
                          <div className="text-sm text-gray-900">
                            {currencySymbol}{priceList.panel_price.toLocaleString()}
                          </div>
                          {priceList.panel_brand && (
                            <div className="text-xs text-gray-500 mt-1">{priceList.panel_brand}</div>
                          )}
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Charge Controller</div>
                          <div className="font-medium">{priceList.charge_controller_value}</div>
                          <div className="text-sm text-gray-900">
                            {currencySymbol}{priceList.charge_controller_price.toLocaleString()}
                          </div>
                          {priceList.charge_controller_brand && (
                            <div className="text-xs text-gray-500 mt-1">{priceList.charge_controller_brand}</div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectPriceList(priceList)}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Use This Price List
                      </button>
                    </div>
                  ))}

                  {priceLists.length < 5 && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Add New Price List
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
