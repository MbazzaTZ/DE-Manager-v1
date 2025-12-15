import { useState } from "react";
import {
  ShoppingCart,
  Plus,
  Search,
  Loader2,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  useSales,
  useCreateSale,
  useUpdateSale,
  useInventory,
  useAgents,
  SaleType,
} from "@/hooks/useDatabase";
import { DSTV_PACKAGES } from "@/lib/dstvPackages";
import { format } from "date-fns";

const Sales = () => {
  const { data: sales = [], isLoading } = useSales();
  const { data: inventory = [] } = useInventory();
  const { data: agents = [] } = useAgents();
  const createSale = useCreateSale();
  const updateSale = useUpdateSale();

  const [searchQuery, setSearchQuery] = useState("");
  const [addSaleOpen, setAddSaleOpen] = useState(false);
  const [paidFilter, setPaidFilter] = useState<string>("all");
  const [agentSearchOpen, setAgentSearchOpen] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);

  const [newSale, setNewSale] = useState({
    inventory_id: "",
    agent_id: "",
    sale_type: "normal" as SaleType,
    package_type: "",
    // sale_price removed
    customer_name: "",
    customer_phone: "",
    manual_smartcard: "",
    manual_serial: "",
  });

  // Available for sale (in_hand items)
  const availableItems = inventory.filter((item) => item.status === "in_hand");

  // Filter sales
  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.inventory?.smartcard?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.agents?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPaid =
      paidFilter === "all" ||
      (paidFilter === "paid" && sale.is_paid) ||
      (paidFilter === "unpaid" && !sale.is_paid);
    return matchesSearch && matchesPaid;
  });

  // Stats
  const totalSales = sales.length;
  const paidSales = sales.filter((s) => s.is_paid).length;
  const unpaidSales = sales.filter((s) => !s.is_paid).length;
  // totalRevenue removed

  const handlePackageChange = (packageValue: string) => {
    setNewSale({
      ...newSale,
      package_type: packageValue,
    });
  };

  const handleSaleTypeChange = (value: string) => {
    const isDvs = value === "dvs";
    setNewSale({ ...newSale, sale_type: value as SaleType, inventory_id: isDvs ? "" : newSale.inventory_id });
    // Force manual entry for DVS
    setIsManualEntry(isDvs || isManualEntry);
  };

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSale.mutateAsync({
      inventory_id: isManualEntry ? undefined : newSale.inventory_id,
      agent_id: newSale.agent_id || undefined,
      sale_type: newSale.sale_type,
      package_type: newSale.package_type || undefined,
      // sale_price removed
      customer_name: newSale.customer_name || undefined,
      customer_phone: newSale.customer_phone || undefined,
      manual_smartcard: isManualEntry ? newSale.manual_smartcard : undefined,
      manual_serial: isManualEntry ? newSale.manual_serial : undefined,
    });
    setNewSale({
      inventory_id: "",
      agent_id: "",
      sale_type: "normal",
      package_type: "",
      // sale_price removed
      customer_name: "",
      customer_phone: "",
      manual_smartcard: "",
      manual_serial: "",
    });
    setIsManualEntry(false);
    setAddSaleOpen(false);
  };

  const togglePaid = async (sale: any) => {
    await updateSale.mutateAsync({
      id: sale.id,
      is_paid: !sale.is_paid,
    });
  };

  const canSubmit = isManualEntry
    ? newSale.manual_smartcard && newSale.manual_serial
    : newSale.inventory_id;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Sales</h1>
            <p className="text-muted-foreground">Track and manage sales</p>
          </div>

          <Dialog open={addSaleOpen} onOpenChange={setAddSaleOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Record Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record Sale</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSale} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* Manual Entry Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <Label className="font-medium">Manual Entry</Label>
                    <p className="text-xs text-muted-foreground">
                      Enter smartcard & serial manually
                    </p>
                  </div>
                  <Switch checked={isManualEntry} onCheckedChange={setIsManualEntry} disabled={newSale.sale_type === "dvs"} />
                </div>

                {isManualEntry ? (
                  <>
                    <div className="space-y-2">
                      <Label>Smartcard *</Label>
                      <Input
                        value={newSale.manual_smartcard}
                        onChange={(e) =>
                          setNewSale({ ...newSale, manual_smartcard: e.target.value })
                        }
                        placeholder="Enter smartcard number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Serial Number *</Label>
                      <Input
                        value={newSale.manual_serial}
                        onChange={(e) =>
                          setNewSale({ ...newSale, manual_serial: e.target.value })
                        }
                        placeholder="Enter serial number"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label>Stock Item *</Label>
                    <Select
                      value={newSale.inventory_id}
                      onValueChange={(v) => {
                        const item = availableItems.find((i) => i.id === v);
                        setNewSale({
                          ...newSale,
                          inventory_id: v,
                          agent_id: item?.assigned_to_agent_id || "",
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stock item" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableItems.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No items in hand. Use manual entry.
                          </div>
                        ) : (
                          availableItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.smartcard} ({item.agents?.name || "Unassigned"})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Agent</Label>
                  <div>
                    <CommandDialog open={agentSearchOpen} onOpenChange={setAgentSearchOpen}>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => setAgentSearchOpen(true)}
                      >
                        {newSale.agent_id
                          ? agents.find((a) => a.id === newSale.agent_id)?.name || "Select agent"
                          : "Select agent"}
                      </Button>
                      <CommandInput placeholder="Search agent by name..." autoFocus />
                      <CommandList>
                        <CommandEmpty>No agents found.</CommandEmpty>
                        <CommandGroup>
                          {agents
                            .filter((a) => a.status === "active")
                            .map((agent) => (
                              <CommandItem
                                key={agent.id}
                                value={agent.id}
                                onSelect={() => {
                                  setNewSale({ ...newSale, agent_id: agent.id });
                                  setAgentSearchOpen(false);
                                }}
                              >
                                {agent.name}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </CommandDialog>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sale Type</Label>
                    <Select
                      value={newSale.sale_type}
                      onValueChange={(v) => handleSaleTypeChange(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="dvs">DVS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>DStv Package</Label>
                    <Select
                      value={newSale.package_type}
                      onValueChange={handlePackageChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select package" />
                      </SelectTrigger>
                      <SelectContent>
                        {DSTV_PACKAGES.map((pkg) => (
                          <SelectItem key={pkg.value} value={pkg.value}>
                            {pkg.label} {pkg.price > 0 && `(TZS ${pkg.price.toLocaleString()})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Sale Price input removed */}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer Name</Label>
                    <Input
                      value={newSale.customer_name}
                      onChange={(e) => setNewSale({ ...newSale, customer_name: e.target.value })}
                      placeholder="Customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Customer Phone</Label>
                    <Input
                      value={newSale.customer_phone}
                      onChange={(e) => setNewSale({ ...newSale, customer_phone: e.target.value })}
                      placeholder="+255..."
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary"
                  disabled={!canSubmit || createSale.isPending}
                >
                  {createSale.isPending ? "Recording..." : "Record Sale"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Total Sales (Units)" value={totalSales} icon={ShoppingCart} variant="primary" />
          <StatCard title="Paid (Units)" value={paidSales} icon={CheckCircle} variant="success" />
          <StatCard title="Unpaid (Units)" value={unpaidSales} icon={Clock} variant="warning" />
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by smartcard, agent, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={paidFilter} onValueChange={setPaidFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
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
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No sales found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Smartcard</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Customer</TableHead>
                  {/* Price column removed */}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{format(new Date(sale.sale_date), "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-mono">{sale.inventory?.smartcard || "N/A"}</TableCell>
                    <TableCell>{sale.agents?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{sale.sale_type.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      {sale.package_type
                        ? DSTV_PACKAGES.find((p) => p.value === sale.package_type)?.label ||
                          sale.package_type
                        : "-"}
                    </TableCell>
                    <TableCell>{sale.customer_name || "-"}</TableCell>
                    {/* Price cell removed */}
                    <TableCell>
                      <Badge variant={sale.is_paid ? "default" : "secondary"}>
                        {sale.is_paid ? "Paid" : "Unpaid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePaid(sale)}
                        disabled={updateSale.isPending}
                      >
                        {sale.is_paid ? "Mark Unpaid" : "Mark Paid"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Sales;
