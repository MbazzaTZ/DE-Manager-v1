import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useBulkCreateAgents } from "@/hooks/useDatabase";

interface AgentCSVRow {
  name: string;
  phone?: string;
  email?: string;
}

const AgentCSVImportDialog = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<AgentCSVRow[]>([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkCreate = useBulkCreateAgents();

  const parseCSV = (text: string): AgentCSVRow[] => {
    const lines = text.trim().split("\n");
    const rows: AgentCSVRow[] = [];
    const startIndex = lines[0].toLowerCase().includes("name") ? 1 : 0;
    for (let i = startIndex; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
      if (values.length >= 1 && values[0]) {
        rows.push({
          name: values[0],
          phone: values[1] || undefined,
          email: values[2] || undefined,
        });
      }
    }
    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError("");
    setParsedData([]);
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = parseCSV(text);
        if (data.length === 0) {
          setError("No valid data found. CSV should have columns: name, phone (optional), email (optional)");
        } else {
          setParsedData(data);
        }
      } catch (err) {
        setError("Failed to parse CSV file");
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    await bulkCreate.mutateAsync(parsedData);
    setOpen(false);
    setFile(null);
    setParsedData([]);
  };

  const reset = () => {
    setFile(null);
    setParsedData([]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import Agents CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Agents from CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* File upload */}
          <div className="space-y-2">
            <Label>CSV File</Label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-foreground">
                  <FileText className="h-5 w-5" />
                  <span>{file.name}</span>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <Upload className="h-8 w-8 mx-auto mb-2" />
                  <p>Click to upload CSV</p>
                  <p className="text-xs mt-1">Columns: name, phone (optional), email (optional)</p>
                </div>
              )}
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          {parsedData.length > 0 && (
            <>
              <div className="flex items-center gap-2 text-success text-sm">
                <CheckCircle className="h-4 w-4" />
                Found {parsedData.length} agents to import
              </div>
              {/* Preview */}
              <div className="max-h-32 overflow-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-2 py-1 text-left">Name</th>
                      <th className="px-2 py-1 text-left">Phone</th>
                      <th className="px-2 py-1 text-left">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-2 py-1">{row.name}</td>
                        <td className="px-2 py-1">{row.phone || "-"}</td>
                        <td className="px-2 py-1">{row.email || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 5 && (
                  <p className="px-2 py-1 text-xs text-muted-foreground bg-muted">
                    ...and {parsedData.length - 5} more
                  </p>
                )}
              </div>
            </>
          )}
          <div className="flex gap-2">
            {file && (
              <Button variant="outline" onClick={reset}>
                Clear
              </Button>
            )}
            <Button
              onClick={handleImport}
              disabled={parsedData.length === 0 || bulkCreate.isPending}
              className="flex-1 gradient-primary"
            >
              {bulkCreate.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${parsedData.length} Agents`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentCSVImportDialog;
