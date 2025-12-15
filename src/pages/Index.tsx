import { useState } from "react";
import { Search, Package, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import SearchResultCard from "@/components/SearchResultCard";
import { useNavigate } from "react-router-dom";
import { useSearch, useDeleteInventory, useDeleteAgent, useUpdateSale, useCreateSale, useAgents, useInventory } from "@/hooks/useDatabase";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const { data: searchResults, isLoading, refetch } = useSearch(submittedQuery);
  const deleteInventory = useDeleteInventory();
  const deleteAgent = useDeleteAgent();
  const updateSale = useUpdateSale();
  const createSale = useCreateSale();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSubmittedQuery(searchQuery.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const [selectedInventory, setSelectedInventory] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [saleMode, setSaleMode] = useState<"create" | "update">("create");
  const [editingSale, setEditingSale] = useState<any>(null);
  const [saleForm, setSaleForm] = useState<any>({
    inventory_id: "",
    manual_smartcard: "",
    manual_serial: "",
    agent_id: "",
    sale_type: "normal",
    package_type: "",
    sale_price: "",
    customer_name: "",
    customer_phone: "",
    sale_date: new Date().toISOString().slice(0,10),
  });

  const { data: allAgents = [] } = useAgents();
  const { data: allInventory = [] } = useInventory();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="flex justify-center mb-6">
              <div className="gradient-primary rounded-2xl p-4 shadow-lg">
                <Package className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              DE Manager
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Search for stock items by smartcard or serial number, or find agents by name
            </p>
          </div>

          {/* Search Box */}
          <div className="glass rounded-2xl p-6 mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter smartcard, serial number, or agent name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-12 h-12 text-base bg-background border-border"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isLoading || !searchQuery.trim()}
                className="h-12 px-6 gradient-primary hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {submittedQuery && !isLoading && (
              <>
                    {searchResults?.inventory && (
                      <SearchResultCard
                        type="inventory"
                        data={searchResults.inventory}
                        onClick={() => setSelectedInventory(searchResults.inventory)}
                        onView={() => setSelectedInventory(searchResults.inventory)}
                        onEdit={() => navigate(`/inventory?edit=${searchResults.inventory.id}`)}
                        onDelete={async () => {
                          if (!confirm("Delete this inventory item?")) return;
                          try {
                            await deleteInventory.mutateAsync(searchResults.inventory.id);
                            await refetch?.();
                          } catch (err: any) {
                            toast({ title: "Error", description: err?.message || String(err), variant: "destructive" });
                          }
                        }}
                        onUpdateSale={async () => {
                          const sale = searchResults.inventory.sale;
                          if (!sale) {
                            // open modal to create sale for this inventory
                            setSaleMode("create");
                            setEditingSale(null);
                            setSaleForm((f: any) => ({ ...f, inventory_id: searchResults.inventory.id, agent_id: searchResults.inventory.assigned_to_agent_id || "" }));
                            setSaleModalOpen(true);
                            return;
                          }
                          // open modal to edit existing sale
                          setSaleMode("update");
                          setEditingSale(sale);
                          setSaleForm({
                            inventory_id: sale.inventory_id || "",
                            manual_smartcard: "",
                            manual_serial: "",
                            agent_id: sale.agent_id || "",
                            sale_type: sale.sale_type || "normal",
                            package_type: sale.package_type || "",
                            sale_price: sale.sale_price ?? "",
                            customer_name: sale.customer_name || "",
                            customer_phone: sale.customer_phone || "",
                            sale_date: sale.sale_date ? sale.sale_date.slice(0,10) : new Date().toISOString().slice(0,10),
                          });
                          setSaleModalOpen(true);
                        }}
                      />
                    )}
                
                {searchResults?.agents && searchResults.agents.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Matching Agents</h3>
                    {searchResults.agents.map((agent: any) => (
                      <SearchResultCard
                        key={agent.id}
                        type="agent"
                        data={agent}
                        onClick={() => setSelectedAgent(agent)}
                        onView={() => setSelectedAgent(agent)}
                        onEdit={() => navigate(`/agents?edit=${agent.id}`)}
                        onDelete={async () => {
                          if (!confirm('Delete agent?')) return;
                          try {
                            await deleteAgent.mutateAsync(agent.id);
                            await refetch?.();
                          } catch (err: any) {
                            toast({ title: 'Error', description: err?.message || String(err), variant: 'destructive' });
                          }
                        }}
                        onUpdateSale={async () => {
                          // Open sale modal prefilled for this agent (create mode)
                          setSaleMode("create");
                          setEditingSale(null);
                          setSaleForm((f: any) => ({ ...f, inventory_id: "", agent_id: agent.id, manual_smartcard: "", manual_serial: "" }));
                          setSaleModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                )}

                {!searchResults?.inventory && 
                 (!searchResults?.agents || searchResults.agents.length === 0) && (
                  <div className="text-center py-12 glass rounded-2xl animate-fade-in">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Results Found
                    </h3>
                    <p className="text-muted-foreground">
                      No stock items or agents match "{submittedQuery}"
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Instructions when no search */}
          {!submittedQuery && (
            <div className="text-center text-muted-foreground animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <p className="text-sm">
                Enter a smartcard number, serial number, or agent name to search
              </p>
            </div>
          )}
        </div>
      </main>
      {/* Inventory Detail Dialog */}
      <Dialog open={!!selectedInventory} onOpenChange={(open) => !open && setSelectedInventory(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Inventory Details</DialogTitle>
          </DialogHeader>
          {selectedInventory && (
            <div className="space-y-3">
              <div className="font-bold text-lg text-foreground">{selectedInventory.smartcard}</div>
              <div className="text-sm text-muted-foreground">Serial: {selectedInventory.serial_number}</div>
              <div className="mt-2">
                <div className="text-xs text-muted-foreground">Status</div>
                <div className="font-medium">{selectedInventory.status}</div>
              </div>
              {selectedInventory.sale && (
                <div className="mt-3 bg-muted rounded p-3">
                  <div className="text-xs text-muted-foreground">Sale Info</div>
                  <div className="font-medium">Sold by: {selectedInventory.sale.agents?.name || 'N/A'}</div>
                  <div className="text-sm">Date: {new Date(selectedInventory.sale.sale_date).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Agent Detail Dialog */}
      <Dialog open={!!selectedAgent} onOpenChange={(open) => !open && setSelectedAgent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agent Details</DialogTitle>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-3">
              <div className="font-bold text-lg text-foreground">{selectedAgent.name}</div>
              <div className="text-sm text-muted-foreground">{selectedAgent.teams?.name || 'No Team'} • {selectedAgent.regions?.name || 'No Region'}</div>
              <div className="mt-2">
                {selectedAgent.phone && <div className="text-sm">Phone: {selectedAgent.phone}</div>}
                {selectedAgent.email && <div className="text-sm">Email: {selectedAgent.email}</div>}
              </div>
              <div className="mt-2">
                <div className="text-xs text-muted-foreground">This Month Sales</div>
                <div className="font-medium">{selectedAgent.total_sales ?? 0}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Sale Modal Dialog */}
      <Dialog open={saleModalOpen} onOpenChange={(open) => !open && setSaleModalOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{saleMode === "create" ? "Record Sale" : "Edit Sale"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const payload: any = {
                  inventory_id: saleForm.inventory_id || undefined,
                  manual_smartcard: saleForm.manual_smartcard || undefined,
                  manual_serial: saleForm.manual_serial || undefined,
                  agent_id: saleForm.agent_id || undefined,
                  sale_type: saleForm.sale_type || "normal",
                  package_type: saleForm.package_type || undefined,
                  sale_price: saleForm.sale_price ? Number(saleForm.sale_price) : undefined,
                  customer_name: saleForm.customer_name || undefined,
                  customer_phone: saleForm.customer_phone || undefined,
                  sale_date: saleForm.sale_date ? new Date(saleForm.sale_date).toISOString() : undefined,
                };
                if (saleMode === "create") {
                  await createSale.mutateAsync(payload);
                } else if (saleMode === "update" && editingSale) {
                  await updateSale.mutateAsync({ id: editingSale.id, ...payload });
                }
                setSaleModalOpen(false);
                setEditingSale(null);
                await refetch?.();
              } catch (err: any) {
                toast({ title: "Error", description: err?.message || String(err), variant: "destructive" });
              }
            }}
            className="space-y-3"
          >
            <div>
              <label className="text-xs text-muted-foreground">Agent</label>
              <select
                value={saleForm.agent_id}
                onChange={(e) => setSaleForm({ ...saleForm, agent_id: e.target.value })}
                className="w-full border px-2 py-2 rounded mt-1 bg-background"
              >
                <option value="">Select agent (optional)</option>
                {allAgents.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Inventory (optional)</label>
              <select
                value={saleForm.inventory_id}
                onChange={(e) => setSaleForm({ ...saleForm, inventory_id: e.target.value })}
                className="w-full border px-2 py-2 rounded mt-1 bg-background"
              >
                <option value="">Use manual smartcard</option>
                {allInventory.map((it: any) => (
                  <option key={it.id} value={it.id}>{it.smartcard} — {it.serial_number}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Manual Smartcard</label>
              <Input value={saleForm.manual_smartcard} onChange={(e) => setSaleForm({ ...saleForm, manual_smartcard: e.target.value })} placeholder="Smartcard" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Manual Serial</label>
              <Input value={saleForm.manual_serial} onChange={(e) => setSaleForm({ ...saleForm, manual_serial: e.target.value })} placeholder="Serial number" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Package Type</label>
              <Input value={saleForm.package_type} onChange={(e) => setSaleForm({ ...saleForm, package_type: e.target.value })} placeholder="e.g., Yanga, Compact" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Sale Price</label>
              <Input value={saleForm.sale_price} onChange={(e) => setSaleForm({ ...saleForm, sale_price: e.target.value })} placeholder="Price" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Customer Name</label>
              <Input value={saleForm.customer_name} onChange={(e) => setSaleForm({ ...saleForm, customer_name: e.target.value })} placeholder="Customer" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Customer Phone</label>
              <Input value={saleForm.customer_phone} onChange={(e) => setSaleForm({ ...saleForm, customer_phone: e.target.value })} placeholder="Phone" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Sale Date</label>
              <Input type="date" value={saleForm.sale_date} onChange={(e) => setSaleForm({ ...saleForm, sale_date: e.target.value })} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setSaleModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-primary">{saleMode === "create" ? "Record Sale" : "Save Changes"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
