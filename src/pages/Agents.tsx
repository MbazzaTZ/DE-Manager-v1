import { useState } from "react";
import { Users, Plus, Search, Edit, Trash2, Loader2, Phone, Mail, MapPin } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  useAgents,
  useCreateAgent,
  useUpdateAgent,
  useDeleteAgent,
  useRegions,
  useCreateRegion,
  useSales,
  useInventory,
} from "@/hooks/useDatabase";
import AgentCSVImportDialog from "@/components/AgentCSVImportDialog";

const Agents = () => {
  const { data: agents = [], isLoading } = useAgents();
  const { data: regions = [] } = useRegions();
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();
  const deleteAgent = useDeleteAgent();
  const createRegion = useCreateRegion();

  const [searchQuery, setSearchQuery] = useState("");
  const [addAgentOpen, setAddAgentOpen] = useState(false);
  const [editAgent, setEditAgent] = useState<any>(null);
  const [addRegionOpen, setAddRegionOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const { data: sales = [] } = useSales();
  const { data: inventory = [] } = useInventory();

  const [newAgent, setNewAgent] = useState({
    name: "",
    phone: "",
    email: "",
    region_id: "",
    district: "",
    physical_location: "",
  });

  const [newRegion, setNewRegion] = useState("");

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.district?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAgent.mutateAsync({
      name: newAgent.name,
      phone: newAgent.phone || undefined,
      email: newAgent.email || undefined,
      region_id: newAgent.region_id || undefined,
      district: newAgent.district || undefined,
      physical_location: newAgent.physical_location || undefined,
    });
    setNewAgent({ name: "", phone: "", email: "", region_id: "", district: "", physical_location: "" });
    setAddAgentOpen(false);
  };

  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateAgent.mutateAsync({
      id: editAgent.id,
      name: editAgent.name,
      phone: editAgent.phone,
      email: editAgent.email,
      region_id: editAgent.region_id || null,
      district: editAgent.district || null,
      physical_location: editAgent.physical_location || null,
      status: editAgent.status,
    });
    setEditAgent(null);
  };

  const handleDeleteAgent = async (id: string) => {
    if (confirm("Are you sure you want to delete this agent?")) {
      await deleteAgent.mutateAsync(id);
    }
  };

  const handleAddRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRegion.mutateAsync(newRegion);
    setNewRegion("");
    setAddRegionOpen(false);
  };

  // Regional performance aggregation

  // Helper: is agent active this month
  const isAgentActiveThisMonth = (agentId: string) =>
    sales.some(s => s.agent_id === agentId && new Date(s.sale_date).getMonth() === new Date().getMonth() && new Date(s.sale_date).getFullYear() === new Date().getFullYear());

  const regionStats = regions.map(region => {
    const regionAgents = agents.filter(a => a.region_id === region.id);
    const regionAgentIds = regionAgents.map(a => a.id);
    const regionSales = sales.filter(s => s.agent_id && regionAgentIds.includes(s.agent_id));
    // Active = sold at least once this month
    const regionActiveAgents = regionAgents.filter(a => isAgentActiveThisMonth(a.id)).length;
    const regionInactiveAgents = regionAgents.length - regionActiveAgents;
    return {
      id: region.id,
      name: region.name,
      agentCount: regionAgents.length,
      activeAgentCount: regionActiveAgents,
      inactiveAgentCount: regionInactiveAgents,
      salesCount: regionSales.length,
    };
  });

  // Unassigned agents (no region_id)
  const unassignedAgents = agents.filter(a => !a.region_id);
  const unassignedAgentIds = unassignedAgents.map(a => a.id);
  const unassignedSales = sales.filter(s => s.agent_id && unassignedAgentIds.includes(s.agent_id));
  const unassignedActive = unassignedAgents.filter(a => isAgentActiveThisMonth(a.id)).length;
  const unassignedInactive = unassignedAgents.length - unassignedActive;

  // Totals for all regions
  const totalAgents = agents.length;
  const totalActiveAgents = agents.filter(a => isAgentActiveThisMonth(a.id)).length;
  const totalSales = sales.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Agents</h1>
            <p className="text-muted-foreground">Manage your sales agents</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog open={addRegionOpen} onOpenChange={setAddRegionOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Region
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Region</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddRegion} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label>Region Name</Label>
                    <Input
                      value={newRegion}
                      onChange={(e) => setNewRegion(e.target.value)}
                      placeholder="e.g., Dar es Salaam"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createRegion.isPending}>
                    {createRegion.isPending ? "Adding..." : "Add Region"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <AgentCSVImportDialog />
            <Dialog open={addAgentOpen} onOpenChange={setAddAgentOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary hover:opacity-90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Agent
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Agent</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddAgent} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={newAgent.name}
                      onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={newAgent.phone}
                      onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                      placeholder="+255 xxx xxx xxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newAgent.email}
                      onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                      placeholder="agent@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Region</Label>
                    <Select
                      value={newAgent.region_id}
                      onValueChange={(v) => setNewAgent({ ...newAgent, region_id: v })}
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
                  <div className="space-y-2">
                    <Label>District</Label>
                    <Input
                      value={newAgent.district}
                      onChange={(e) => setNewAgent({ ...newAgent, district: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Physical Location</Label>
                    <Input
                      value={newAgent.physical_location}
                      onChange={(e) => setNewAgent({ ...newAgent, physical_location: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-primary" disabled={createAgent.isPending}>
                    {createAgent.isPending ? "Saving..." : "Add Agent"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* Regional Performance */}
        <div className="glass rounded-xl p-4 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2"><MapPin className="h-5 w-5" /> Regional Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border rounded-xl bg-card">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-2 text-left">Region</th>
                  <th className="px-4 py-2 text-left">Total Agents<br /><span className='text-xs text-muted-foreground'>(Active + Inactive)</span></th>
                  <th className="px-4 py-2 text-left">Active Agents</th>
                  <th className="px-4 py-2 text-left">Inactive Agents</th>
                  <th className="px-4 py-2 text-left">Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {regionStats.length === 0 && unassignedAgents.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-muted-foreground">No regions found</td></tr>
                ) : (
                  <>
                    {regionStats.map(region => (
                      <tr key={region.id} className="border-b last:border-0">
                        <td className="px-4 py-2 font-medium">{region.name}</td>
                        <td className="px-4 py-2">{region.agentCount}</td>
                        <td className="px-4 py-2">
                          <span className="inline-block rounded px-2 py-1 text-xs font-semibold bg-green-500 text-white">
                            {region.activeAgentCount}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-block rounded px-2 py-1 text-xs font-semibold bg-red-500 text-white">
                            {region.inactiveAgentCount}
                          </span>
                        </td>
                        <td className="px-4 py-2">{region.salesCount}</td>
                      </tr>
                    ))}
                    {/* Unassigned row */}
                    {unassignedAgents.length > 0 && (
                      <tr className="border-b last:border-0">
                        <td className="px-4 py-2 font-medium italic text-muted-foreground">Unassigned</td>
                        <td className="px-4 py-2">{unassignedAgents.length}</td>
                        <td className="px-4 py-2">
                          <span className="inline-block rounded px-2 py-1 text-xs font-semibold bg-green-500 text-white">
                            {unassignedActive}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-block rounded px-2 py-1 text-xs font-semibold bg-red-500 text-white">
                            {unassignedInactive}
                          </span>
                        </td>
                        <td className="px-4 py-2">{unassignedSales.length}</td>
                      </tr>
                    )}
                    {/* Total Row */}
                    <tr className="font-bold bg-muted/50">
                      <td className="px-4 py-2">Total</td>
                      <td className="px-4 py-2">{totalAgents}</td>
                      <td className="px-4 py-2">
                        <span className="inline-block rounded px-2 py-1 text-xs font-semibold bg-green-500 text-white">
                          {totalActiveAgents}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-block rounded px-2 py-1 text-xs font-semibold bg-red-500 text-white">
                          {totalAgents - totalActiveAgents}
                        </span>
                      </td>
                      <td className="px-4 py-2">{totalSales}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Search Bar */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents by name, phone, email, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12 glass rounded-xl">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No agents found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedAgent(agent)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {agent.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {agent.regions?.name || "No Region"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      isAgentActiveThisMonth(agent.id)
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }
                  >
                    {isAgentActiveThisMonth(agent.id) ? "active" : "inactive"}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  {agent.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {agent.phone}
                    </div>
                  )}
                  {agent.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {agent.email}
                    </div>
                  )}
                  {(agent.district || agent.physical_location) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {[agent.district, agent.physical_location].filter(Boolean).join(" - ")}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Badge variant="secondary" className="font-mono">
                    {agent.total_sales} sales
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditAgent(agent);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAgent(agent.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        {/* Agent Details Dialog */}
        <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agent Details</DialogTitle>
            </DialogHeader>
            {selectedAgent && (
              <div className="space-y-3">
                <div className="font-bold text-lg text-foreground">{selectedAgent.name}</div>
                <div className="text-sm text-muted-foreground">{selectedAgent.teams?.name || "No Team"} • {selectedAgent.regions?.name || "No Region"}</div>
                <div className="flex flex-wrap gap-2 text-sm">
                  {selectedAgent.phone && <span><Phone className="h-4 w-4 inline" /> {selectedAgent.phone}</span>}
                  {selectedAgent.email && <span><Mail className="h-4 w-4 inline" /> {selectedAgent.email}</span>}
                </div>
                <div className="text-sm">Location: {selectedAgent.district || "-"}, {selectedAgent.physical_location || "-"}</div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {/* Last Month Sales */}
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">Last Month Sales</div>
                    <div className="font-bold text-xl">
                      {sales.filter(s => s.agent_id === selectedAgent.id && new Date(s.sale_date).getMonth() === new Date().getMonth() - 1 && new Date(s.sale_date).getFullYear() === new Date().getFullYear()).length}
                    </div>
                  </div>
                  {/* This Month Sales */}
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">This Month Sales</div>
                    <div className="font-bold text-xl">
                      {sales.filter(s => s.agent_id === selectedAgent.id && new Date(s.sale_date).getMonth() === new Date().getMonth() && new Date(s.sale_date).getFullYear() === new Date().getFullYear()).length}
                    </div>
                  </div>
                  {/* Stock Available */}
                  <div className="bg-muted rounded-lg p-3 col-span-2">
                    <div className="text-xs text-muted-foreground">Stock Available</div>
                    <div className="font-bold text-xl">
                      {inventory.filter(i => i.assigned_to_agent_id === selectedAgent.id && i.status === "in_hand").length}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={!!editAgent} onOpenChange={(open) => !open && setEditAgent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Agent</DialogTitle>
            </DialogHeader>
            {editAgent && (
              <form onSubmit={handleUpdateAgent} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={editAgent.name}
                    onChange={(e) => setEditAgent({ ...editAgent, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editAgent.phone || ""}
                    onChange={(e) => setEditAgent({ ...editAgent, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editAgent.email || ""}
                    onChange={(e) => setEditAgent({ ...editAgent, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select
                    value={editAgent.region_id || ""}
                    onValueChange={(v) => setEditAgent({ ...editAgent, region_id: v })}
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
                <div className="space-y-2">
                  <Label>District</Label>
                  <Input
                    value={editAgent.district || ""}
                    onChange={(e) => setEditAgent({ ...editAgent, district: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Physical Location</Label>
                  <Input
                    value={editAgent.physical_location || ""}
                    onChange={(e) => setEditAgent({ ...editAgent, physical_location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editAgent.status}
                    onValueChange={(v) => setEditAgent({ ...editAgent, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full gradient-primary" disabled={updateAgent.isPending}>
                  {updateAgent.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Agents;
