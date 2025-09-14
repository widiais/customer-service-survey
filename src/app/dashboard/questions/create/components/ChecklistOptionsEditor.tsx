'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Settings } from 'lucide-react';
import { ChecklistLimits } from '@/lib/types';

interface ChecklistOptionsEditorProps {
  options: string[];
  onOptionsChange: (options: string[]) => void;
  limits: ChecklistLimits;
  onLimitsChange: (limits: ChecklistLimits) => void;
}

export default function ChecklistOptionsEditor({
  options,
  onOptionsChange,
  limits,
  onLimitsChange
}: ChecklistOptionsEditorProps) {
  const [showLimits, setShowLimits] = useState(false);

  const addOption = () => {
    onOptionsChange([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onOptionsChange(newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onOptionsChange(newOptions);
  };

  const updateLimits = (field: keyof ChecklistLimits, value: string) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    onLimitsChange({
      ...limits,
      [field]: numValue
    });
  };

  return (
    <div className="space-y-6">
      {/* Options Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Opsi Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Opsi ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addOption}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Opsi
            </Button>
            
            <p className="text-sm text-gray-500">
              Minimal 2 opsi diperlukan. Klik tombol di atas untuk menambah opsi baru.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Limits Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Batasan Pilihan</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowLimits(!showLimits)}
            >
              {showLimits ? 'Sembunyikan' : 'Tampilkan'} Pengaturan
            </Button>
          </CardTitle>
        </CardHeader>
        {showLimits && (
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minSelections">Minimum Pilihan</Label>
                  <Input
                    id="minSelections"
                    type="number"
                    min="1"
                    max={options.length}
                    value={limits.minSelections || ''}
                    onChange={(e) => updateLimits('minSelections', e.target.value)}
                    placeholder="Kosongkan untuk tidak ada batas minimum"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Jumlah minimum opsi yang harus dipilih customer
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="maxSelections">Maksimum Pilihan</Label>
                  <Input
                    id="maxSelections"
                    type="number"
                    min="1"
                    max={options.length}
                    value={limits.maxSelections || ''}
                    onChange={(e) => updateLimits('maxSelections', e.target.value)}
                    placeholder="Kosongkan untuk unlimited"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Jumlah maksimum opsi yang boleh dipilih customer
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Contoh Batasan:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Min: 1, Max: 1</strong> = Pilih tepat 1 opsi (seperti pilihan ganda)</li>
                  <li>• <strong>Min: 2, Max: 3</strong> = Pilih 2-3 opsi</li>
                  <li>• <strong>Min: 1, Max: kosong</strong> = Pilih minimal 1 opsi (unlimited)</li>
                  <li>• <strong>Min: kosong, Max: 2</strong> = Pilih maksimal 2 opsi</li>
                  <li>• <strong>Min: kosong, Max: kosong</strong> = Pilih bebas (unlimited)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
