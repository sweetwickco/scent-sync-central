import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CSVImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tableName: "design_ideas" | "new_product_ideas";
  onImportComplete: () => void;
}

interface CSVRow {
  [key: string]: string;
}

interface ColumnMapping {
  csvColumn: string;
  tableColumn: string;
}

const TABLE_COLUMNS = {
  design_ideas: [
    { key: "name", label: "Name", required: true },
    { key: "product_type", label: "Product Type", required: true },
    { key: "collection_targeting", label: "Collection/Targeting", required: false },
    { key: "description", label: "Description", required: false },
  ],
  new_product_ideas: [
    { key: "name", label: "Name", required: true },
    { key: "product_type", label: "Product Type", required: true },
    { key: "collection_targeting", label: "Collection/Targeting", required: false },
    { key: "description", label: "Description", required: false },
  ],
};

export const CSVImportDialog = ({ isOpen, onClose, tableName, onImportComplete }: CSVImportDialogProps) => {
  const [step, setStep] = useState(1);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const resetDialog = () => {
    setStep(1);
    setCsvFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMappings([]);
    setImporting(false);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file",
        variant: "destructive",
      });
    }
  };

  const parseCSV = (text: string): { headers: string[], data: CSVRow[] } => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
    return { headers, data };
  };

  const handleFileUpload = async () => {
    if (!csvFile) return;

    const text = await csvFile.text();
    const { headers, data } = parseCSV(text);
    
    setCsvHeaders(headers);
    setCsvData(data);
    
    // Initialize column mappings
    const initialMappings = TABLE_COLUMNS[tableName].map(col => ({
      csvColumn: headers.find(h => h.toLowerCase().includes(col.key.toLowerCase())) || '',
      tableColumn: col.key,
    }));
    setColumnMappings(initialMappings);
    
    setStep(2);
  };

  const handleColumnMappingChange = (tableColumn: string, csvColumn: string) => {
    setColumnMappings(prev => 
      prev.map(mapping => 
        mapping.tableColumn === tableColumn 
          ? { ...mapping, csvColumn }
          : mapping
      )
    );
  };

  const validateMappings = () => {
    const requiredColumns = TABLE_COLUMNS[tableName].filter(col => col.required);
    return requiredColumns.every(col => 
      columnMappings.find(mapping => 
        mapping.tableColumn === col.key && mapping.csvColumn
      )
    );
  };

  const handleImport = async () => {
    if (!validateMappings()) {
      toast({
        title: "Incomplete Mapping",
        description: "Please map all required columns",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const rowsToInsert = csvData.map(row => {
        const mappedRow: any = { user_id: user.user.id };
        columnMappings.forEach(mapping => {
          if (mapping.csvColumn && mapping.tableColumn) {
            const value = row[mapping.csvColumn]?.trim();
            mappedRow[mapping.tableColumn] = value || null;
          }
        });
        return mappedRow;
      });

      const { error } = await supabase
        .from(tableName)
        .insert(rowsToInsert);

      if (error) throw error;

      toast({
        title: "Import Successful",
        description: `Imported ${rowsToInsert.length} rows successfully`,
      });

      onImportComplete();
      handleClose();
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: "Failed to import CSV data",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const tableColumns = TABLE_COLUMNS[tableName];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import CSV - {tableName === "new_product_ideas" ? "New Product Ideas" : "Design Ideas"}</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="border-2 border-dashed border-border rounded-lg p-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Select CSV File</h3>
                  <p className="text-muted-foreground">
                    Choose a CSV file with your {tableName === "new_product_ideas" ? "product ideas" : "design ideas"} data
                  </p>
                </div>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="mt-4"
                />
              </div>
            </div>
            
            {csvFile && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Selected: {csvFile.name}
                </span>
                <Button onClick={handleFileUpload}>
                  Parse & Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Map CSV Columns</h3>
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </div>
            
            <div className="space-y-4">
              {tableColumns.map(column => (
                <div key={column.key} className="flex items-center gap-4">
                  <div className="w-48">
                    <span className="text-sm font-medium">
                      {column.label}
                      {column.required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                  </div>
                  <div className="flex-1">
                    <Select 
                      value={columnMappings.find(m => m.tableColumn === column.key)?.csvColumn || ""} 
                      onValueChange={(value) => handleColumnMappingChange(column.key, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select CSV column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- No mapping --</SelectItem>
                        {csvHeaders.map(header => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Preview ({csvData.length} rows)</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    {tableColumns.map(col => (
                      <TableHead key={col.key}>{col.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.slice(0, 3).map((row, index) => (
                    <TableRow key={index}>
                      {tableColumns.map(col => {
                        const mapping = columnMappings.find(m => m.tableColumn === col.key);
                        const value = mapping?.csvColumn ? row[mapping.csvColumn] : '-';
                        return (
                          <TableCell key={col.key} className="max-w-32 truncate">
                            {value || '-'}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {csvData.length > 3 && (
                <p className="text-xs text-muted-foreground mt-2">
                  ... and {csvData.length - 3} more rows
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleImport} 
                disabled={!validateMappings() || importing}
              >
                <Upload className="mr-2 h-4 w-4" />
                {importing ? "Importing..." : `Import ${csvData.length} Rows`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};