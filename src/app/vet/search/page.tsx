import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function VetSearchPage() {
  const [province, setProvince] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [minRating, setMinRating] = useState('0');
  const [results, setResults] = useState<any[]>([]);

  const search = async () => {
    let query = supabase.from('veterinarians').select('*');
    if (province) query = query.eq('province', province);
    if (specialty) query = query.eq('specialty', specialty);
    if (minRating) query = query.gte('rating', Number(minRating));
    const { data, error } = await query;
    if (!error && data) setResults(data);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">بحث عن أطباء بيطريين</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input placeholder="المحافظة" value={province} onChange={e => setProvince(e.target.value)} />
        <Input placeholder="التخصص" value={specialty} onChange={e => setSpecialty(e.target.value)} />
        <Select value={minRating} onValueChange={setMinRating}>
          <Select.Trigger />
          <Select.Content>
            {[0, 1, 2, 3, 4, 5].map(v => (
              <Select.Item key={v} value={String(v)}>{v} نجوم أو أكثر</Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Button onClick={search} className="col-span-3">بحث</Button>
      </div>

      <div className="space-y-4">
        {results.map(vet => (
          <Card key={vet.id}>
            <CardHeader className="flex flex-col space-y-1">
              <CardTitle>{vet.full_name}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 text-sm">
              <div>المحافظة: {vet.province}</div>
              <div>التخصص: {vet.specialty}</div>
              <div>التقييم: {vet.rating} / 5</div>
              <div>حالة الاعتماد: {vet.is_verified ? (<CheckCircle2 className="inline text-green-600" />) : (<XCircle className="inline text-red-600" />)}</div>
              <div>ساعات العمل: {vet.working_hours || 'غير محددة'}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
