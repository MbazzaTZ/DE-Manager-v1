import { useState } from "react";
import {
  Package,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Loader2,
  Store,
  Hand,
  CheckCircle,
} from "lucide-react";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import CSVImportDialog from "@/components/CSVImportDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useInventory,
  useInventoryStats,
  useCreateInventory,
  useAssignInventory,
  useDeleteInventory,
  useAgents,
  useRegions,
  StockType,
  StockStatus,
} from "@/hooks/useDatabase";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const statusConfig = {
  in_store: { label: "In Store", icon: Store, color: "bg-info/10 text-info border-info/20" },
  in_hand: { label: "In Hand", icon: Hand, color: "bg-warning/10 text-warning border-warning/20" },
  sold: { label: "Sold", icon: CheckCircle, color: "bg-success/10 text-success border-success/20" },
};

const Inventory = () => {
  const { data: inventory = [], isLoading } = useInventory();
  const { data: stats } = useInventoryStats();
  const { data: agents = [] } = useAgents();
  const { data: regions = [] } = useRegions();
  const createInventory = useCreateInventory();
  const assignInventory = useAssignInventory();
  const deleteInventory = useDeleteInventory();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Form state
  const [newItem, setNewItem] = useState({
    smartcard: "",
    serial_number: "",
    batch_number: "",
    stock_type: "full_set" as StockType,
    region_id: "",
  });
  const [selectedAgentId, setSelectedAgentId] = useState("");

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.smartcard.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serial_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "all" || item.stock_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInventory.mutateAsync({
      ...newItem,
      region_id: newItem.region_id || undefined,
    });
    setNewItem({
      smartcard: "",
      serial_number: "",
      batch_number: "",
      stock_type: "full_set",
      region_id: "",
    });
    setAddDialogOpen(false);
  };

  const handleAssign = async () => {
    if (selectedItem && selectedAgentId) {
      await assignInventory.mutateAsync({
        id: selectedItem.id,
        agent_id: selectedAgentId,
      });
      setAssignDialogOpen(false);
      setSelectedItem(null);
      setSelectedAgentId("");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteInventory.mutateAsync(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Inventory</h1>
            <p className="text-muted-foreground">Manage your stock items</p>
          </div>

          <div className="flex gap-2">
            <CSVImportDialog />
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary hover:opacity-90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Stock Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddItem} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                  <Label>Smartcard</Label>
                  <Input
                    value={newItem.smartcard}
                    onChange={(e) => setNewItem({ ...newItem, smartcard: e.target.value })}
                    placeholder="Enter smartcard number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Serial Number</Label>
                  <Input
                    value={newItem.serial_number}
                    onChange={(e) => setNewItem({ ...newItem, serial_number: e.target.value })}
                    placeholder="Enter serial number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Batch Number (Optional)</Label>
                  <Input
                    value={newItem.batch_number}
                    onChange={(e) => setNewItem({ ...newItem, batch_number: e.target.value })}
                    placeholder="Enter batch number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock Type</Label>
                  <Select
                    value={newItem.stock_type}
                    onValueChange={(v) => setNewItem({ ...newItem, stock_type: v as StockType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_set">Full Set</SelectItem>
                      <SelectItem value="decoder_only">Decoder Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Region (Optional)</Label>
                  <Select
                    value={newItem.region_id}
                    onValueChange={(v) => setNewItem({ ...newItem, region_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-primary"
                  disabled={createInventory.isPending}
                >
                  {createInventory.isPending ? "Adding..." : "Add Item"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Total" value={stats?.total || 0} icon={Package} variant="primary" />
          <StatCard title="In Store" value={stats?.in_store || 0} icon={Store} variant="info" />
          <StatCard title="In Hand" value={stats?.in_hand || 0} icon={Hand} variant="warning" />
          <StatCard title="Sold" value={stats?.sold || 0} icon={CheckCircle} variant="success" />
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by smartcard or serial..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_store">In Store</SelectItem>
                <SelectItem value="in_hand">In Hand</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full_set">Full Set</SelectItem>
                <SelectItem value="decoder_only">Decoder Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="glass rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No inventory items found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Smartcard</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => {
                  const status = statusConfig[item.status as keyof typeof statusConfig];
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono font-medium">{item.smartcard}</TableCell>
                      <TableCell className="font-mono">{item.serial_number}</TableCell>
                      <TableCell>
                        {item.stock_type === "full_set" ? "Full Set" : "Decoder Only"}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("border", status?.color)}>{status?.label}</Badge>
                      </TableCell>
                      <TableCell>{item.agents?.name || "-"}</TableCell>
                      <TableCell>{item.regions?.name || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {item.status === "in_store" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setAssignDialogOpen(true);
                              }}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                          {item.status !== "sold" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Assign Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign to Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Assign <strong>{selectedItem?.smartcard}</strong> to an agent
              </p>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents
                    .filter((a) => a.status === "active")
                    .map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.teams?.name || "No Team"})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAssign}
                className="w-full gradient-primary"
                disabled={!selectedAgentId || assignInventory.isPending}
              >
                {assignInventory.isPending ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Inventory;
