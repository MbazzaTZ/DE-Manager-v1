import { Package, ShoppingCart, Users, Hand, Store, CheckCircle, TrendingUp, MapPin } from "lucide-react";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInventoryStats, useAgents, useSales, useRegions } from "@/hooks/useDatabase";
import { format } from "date-fns";

const Dashboard = () => {
  const { data: stats } = useInventoryStats();
  const { data: agents = [] } = useAgents();
  const { data: sales = [] } = useSales();
  const { data: regions = [] } = useRegions();
  // Helper: is agent active this month
  const isAgentActiveThisMonth = (agentId) =>
    sales.some(s => s.agent_id === agentId && new Date(s.sale_date).getMonth() === new Date().getMonth() && new Date(s.sale_date).getFullYear() === new Date().getFullYear());

  // Regional performance aggregation
  const regionStats = regions.map(region => {
    const regionAgents = agents.filter(a => a.region_id === region.id);
    const regionAgentIds = regionAgents.map(a => a.id);
    const regionSales = sales.filter(s => s.agent_id && regionAgentIds.includes(s.agent_id));
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

  // Totals
  const totalAgents = agents.length;
  const totalActiveAgents = agents.filter(a => isAgentActiveThisMonth(a.id)).length;
  const totalInactiveAgents = totalAgents - totalActiveAgents;

  // Top agents by sales
  const topAgents = agents
    ?.filter((a) => a.status === "active")
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, 5);

  // Recent sales
  const recentSales = sales?.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your inventory and sales</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Stock"
            value={stats?.total || 0}
            icon={Package}
            variant="primary"
          />
          <StatCard
            title="In Store"
            value={stats?.in_store || 0}
            icon={Store}
            variant="info"
          />
          <StatCard
            title="In Hand (Agents)"
            value={stats?.in_hand || 0}
            icon={Hand}
            variant="warning"
          />
          <StatCard
            title="Sold"
            value={stats?.sold || 0}
            icon={CheckCircle}
            variant="success"
          />
        </div>

        {/* Regional Performance */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2"><MapPin className="h-5 w-5" /> Regional Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border rounded-xl bg-card">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-2 text-left">Region</th>
                  <th className="px-4 py-2 text-left">Total Agents</th>
                  <th className="px-4 py-2 text-left">Active Agents</th>
                  <th className="px-4 py-2 text-left">Inactive Agents</th>
                  <th className="px-4 py-2 text-left">Sales (Units)</th>
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
                          {totalInactiveAgents}
                        </span>
                      </td>
                      <td className="px-4 py-2">{regionStats.reduce((sum, r) => sum + r.salesCount, 0) + unassignedSales.length}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <StatCard
            title="Total Agents"
            value={totalAgents}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Full Sets"
            value={stats?.full_set || 0}
            icon={Package}
          />
          <StatCard
            title="Decoder Only"
            value={stats?.decoder_only || 0}
            icon={Package}
          />
          <StatCard
            title="Active Agents"
            value={totalActiveAgents}
            icon={Users}
            variant="success"
          />
          <StatCard
            title="Inactive Agents"
            value={totalInactiveAgents}
            icon={Users}
            variant="destructive"
          />
        </div>

        {/* Tables Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Agents */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="gradient-success rounded-lg p-2">
                  <TrendingUp className="h-5 w-5 text-accent-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Top Agents</h2>
              </div>
              <Badge variant="secondary">{topAgents?.length || 0} agents</Badge>
            </div>

            {topAgents && topAgents.length > 0 ? (
              <div className="space-y-4">
                {topAgents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {agent.teams?.name || "No Team"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      {agent.total_sales} sales
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No agents yet</p>
              </div>
            )}
          </Card>

          {/* Recent Sales */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="gradient-primary rounded-lg p-2">
                  <ShoppingCart className="h-5 w-5 text-primary-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Recent Sales</h2>
              </div>
              <Badge variant="secondary">{sales?.length || 0} total</Badge>
            </div>

            {recentSales && recentSales.length > 0 ? (
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground font-mono">
                        {sale.inventory?.smartcard || "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {sale.agents?.name || "Unknown"} •{" "}
                        {format(new Date(sale.sale_date), "MMM d")}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={sale.is_paid ? "default" : "secondary"}>
                        {sale.is_paid ? "Paid" : "Unpaid"}
                      </Badge>
                      {/* Price display removed */}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No sales yet</p>
              </div>
            )}
          </Card>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
