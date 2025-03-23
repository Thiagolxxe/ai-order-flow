
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface NotesSectionProps {
  notes: string;
  setNotes: (notes: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, setNotes }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="font-medium mb-4 text-lg">Observações para Entrega</h2>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Observações (opcional)</Label>
          <Textarea 
            id="notes" 
            placeholder="Ex: Apartamento sem campainha, ligar quando chegar." 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotesSection;
