import React, { useState, useEffect } from 'react';
import { X, User, CreditCard, Plus, Trash2, Save, Award, Utensils, Armchair, Plane, Building, Scale, Gauge, DollarSign, Compass, CheckCircle2 } from 'lucide-react';
import { UserProfile, LoyaltyProgram } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  savedTripsCount: number;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  userProfile, 
  onSave,
  savedTripsCount
}) => {
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    email: '',
    preferences: {
      dietary: '',
      seatPreference: 'any',
      cabinClass: 'economy',
      preferredAirlines: '',
      preferredHotelChains: '',
      travelPace: 'balanced',
      budgetPriority: 'value',
      travelVibe: 'mix',
      askOnConflict: true
    },
    loyaltyPrograms: []
  });

  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile);
    }
  }, [userProfile]);

  if (!isOpen) return null;

  const handlePreferenceChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const addLoyaltyProgram = () => {
    const newProgram: LoyaltyProgram = {
      id: Date.now().toString(),
      provider: '',
      membershipId: ''
    };
    setFormData(prev => ({
      ...prev,
      loyaltyPrograms: [...prev.loyaltyPrograms, newProgram]
    }));
  };

  const removeLoyaltyProgram = (id: string) => {
    setFormData(prev => ({
      ...prev,
      loyaltyPrograms: prev.loyaltyPrograms.filter(p => p.id !== id)
    }));
  };

  const updateLoyaltyProgram = (id: string, field: 'provider' | 'membershipId', value: string) => {
    setFormData(prev => ({
      ...prev,
      loyaltyPrograms: prev.loyaltyPrograms.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-2xl h-[85vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden m-4">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Traveller Profile</h2>
              <p className="text-xs text-slate-500">{savedTripsCount} saved trips in history</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Personal Info */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <User size={16} className="text-blue-500" /> Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Email (Optional)</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Travel Preferences */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Armchair size={16} className="text-blue-500" /> Travel Preferences
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Utensils size={12} /> Dietary Restrictions
                  </label>
                  <input
                    type="text"
                    value={formData.preferences.dietary || ''}
                    onChange={e => handlePreferenceChange('dietary', e.target.value)}
                    placeholder="e.g. Vegetarian, Gluten-free"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                     <Armchair size={12} /> Seat Preference
                  </label>
                  <select
                    value={formData.preferences.seatPreference}
                    onChange={e => handlePreferenceChange('seatPreference', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="any">Any</option>
                    <option value="aisle">Aisle</option>
                    <option value="window">Window</option>
                  </select>
                </div>

                 <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                     <Plane size={12} /> Preferred Cabin
                  </label>
                  <select
                    value={formData.preferences.cabinClass}
                    onChange={e => handlePreferenceChange('cabinClass', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="economy">Economy</option>
                    <option value="premium">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                </div>
                 
                 <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                     <Building size={12} /> Preferred Hotel Chains
                  </label>
                  <input
                    type="text"
                    value={formData.preferences.preferredHotelChains || ''}
                    onChange={e => handlePreferenceChange('preferredHotelChains', e.target.value)}
                    placeholder="e.g. Marriott, Hyatt"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Travel Dilemmas & Conflict Resolution */}
            <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm bg-gradient-to-br from-amber-50/40 via-white to-blue-50/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Scale size={16} className="text-amber-600" /> Trip Dilemmas & Conflict Resolution
                </h3>
                <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                  Personalized
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                When trips have competing priorities (speed vs. relaxation, budget vs. luxury, direct vs. layover), configure your baseline preference or have Voyager AI prompt you.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Gauge size={12} className="text-blue-500" /> Default Pacing
                  </label>
                  <select
                    value={formData.preferences.travelPace || 'balanced'}
                    onChange={e => handlePreferenceChange('travelPace', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                  >
                    <option value="fast">⚡ Fast-Paced (See everything)</option>
                    <option value="balanced">⚖️ Balanced (Sights + Downtime)</option>
                    <option value="relaxed">🌿 Relaxed (Slow travel & cafes)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <DollarSign size={12} className="text-emerald-500" /> Budget Philosophy
                  </label>
                  <select
                    value={formData.preferences.budgetPriority || 'value'}
                    onChange={e => handlePreferenceChange('budgetPriority', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                  >
                    <option value="budget">💰 Budget-Conscious / Value</option>
                    <option value="value">⚖️ Comfort & High Value</option>
                    <option value="luxury">✨ Luxury & Premium Splurge</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Compass size={12} className="text-indigo-500" /> Preferred Vibe
                  </label>
                  <select
                    value={formData.preferences.travelVibe || 'mix'}
                    onChange={e => handlePreferenceChange('travelVibe', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                  >
                    <option value="mix">🌐 Balanced Mix</option>
                    <option value="city">🏙️ City, Culture & Dining</option>
                    <option value="nature">🌲 Nature, Scenic & Serenity</option>
                    <option value="adventure">🧗 Adventure & Outdoors</option>
                  </select>
                </div>
              </div>

              {/* Conflict Prompt Checkbox */}
              <div className="p-3 bg-white border border-amber-200/80 rounded-xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="askOnConflict"
                  checked={formData.preferences.askOnConflict !== false}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      askOnConflict: e.target.checked
                    }
                  }))}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="askOnConflict" className="text-xs text-slate-700 leading-snug cursor-pointer select-none">
                  <span className="font-semibold block text-slate-800">
                    Always prompt me when ideas or options conflict
                  </span>
                  Whenever an itinerary or choice has trade-offs (e.g. scenic detour vs. quick highway, direct vs. layover, packed vs. chill), the AI will present both sides and ask what I prefer.
                </label>
              </div>
            </div>

            {/* Loyalty Programs */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Award size={16} className="text-blue-500" /> Loyalty Programs
                </h3>
                <button
                  type="button"
                  onClick={addLoyaltyProgram}
                  className="text-xs flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md"
                >
                  <Plus size={12} /> Add Program
                </button>
              </div>

              {formData.loyaltyPrograms.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-lg">
                  <p className="text-xs text-slate-400">No loyalty programs added yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.loyaltyPrograms.map((program) => (
                    <div key={program.id} className="flex gap-2 items-start">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={program.provider}
                          onChange={e => updateLoyaltyProgram(program.id, 'provider', e.target.value)}
                          placeholder="Provider (e.g. Delta)"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                         <input
                          type="text"
                          value={program.membershipId}
                          onChange={e => updateLoyaltyProgram(program.id, 'membershipId', e.target.value)}
                          placeholder="Membership ID"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLoyaltyProgram(program.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                    <Save size={18} />
                    Save Profile
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};