import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Types
export type StockType = "full_set" | "decoder_only";
export type StockStatus = "in_store" | "in_hand" | "sold";
export type SaleType = "normal" | "dvs";

export interface Region {
  id: string;
  name: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  region_id: string | null;
  created_at: string;
  regions?: Region;
}

export interface Agent {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  team_id: string | null;
  region_id: string | null;
  district: string | null;
  physical_location: string | null;
  status: string;
  total_sales: number;
  created_at: string;
  updated_at: string;
  teams?: Team;
  regions?: Region;
}

export interface InventoryItem {
  id: string;
  smartcard: string;
  serial_number: string;
  batch_number: string | null;
  stock_type: StockType;
  status: StockStatus;
  region_id: string | null;
  assigned_to_agent_id: string | null;
  assigned_at: string | null;
  created_at: string;
  updated_at: string;
  regions?: Region;
  agents?: Agent;
}

export interface Sale {
  id: string;
  inventory_id: string;
  agent_id: string | null;
  sale_date: string;
  sale_type: SaleType;
  package_type: string | null;
  sale_price: number | null;
  customer_name: string | null;
  customer_phone: string | null;
  is_paid: boolean;
  created_at: string;
  inventory?: InventoryItem;
  agents?: Agent;
}

// Regions hooks
export const useRegions = () => {
  return useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Region[];
    },
  });
};

export const useCreateRegion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("regions")
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast({ title: "Success", description: "Region created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

// Teams hooks
export const useTeams = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*, regions(*)")
        .order("name");
      if (error) throw error;
      return data as Team[];
    },
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, region_id }: { name: string; region_id?: string }) => {
      const { data, error } = await supabase
        .from("teams")
        .insert({ name, region_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({ title: "Success", description: "Team created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

// Agents hooks
export const useAgents = () => {
  return useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("*, teams(*, regions(*)), regions(*)")
        .order("name");
      if (error) throw error;
      return data as Agent[];
    },
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agent: { 
      name: string; 
      phone?: string; 
      email?: string; 
      region_id?: string;
      district?: string;
      physical_location?: string;
    }) => {
      const { data, error } = await supabase
        .from("agents")
        .insert(agent)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast({ title: "Success", description: "Agent created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Agent>) => {
      const { data, error } = await supabase
        .from("agents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast({ title: "Success", description: "Agent updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast({ title: "Success", description: "Agent deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useBulkCreateAgents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agents: { name: string; phone?: string; email?: string }[]) => {
      const { data, error } = await supabase
        .from("agents")
        .insert(agents)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast({ title: "Success", description: `${data.length} agents imported successfully` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

// Inventory hooks
export const useInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*, regions(*), agents(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as InventoryItem[];
    },
  });
};

export const useInventoryStats = () => {
  return useQuery({
    queryKey: ["inventory-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory").select("status, stock_type");
      if (error) throw error;
      
      const stats = {
        total: data.length,
        in_store: data.filter((i) => i.status === "in_store").length,
        in_hand: data.filter((i) => i.status === "in_hand").length,
        sold: data.filter((i) => i.status === "sold").length,
        full_set: data.filter((i) => i.stock_type === "full_set").length,
        decoder_only: data.filter((i) => i.stock_type === "decoder_only").length,
      };
      return stats;
    },
  });
};

export const useCreateInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: {
      smartcard: string;
      serial_number: string;
      batch_number?: string;
      stock_type: StockType;
      region_id?: string;
    }) => {
      const { data, error } = await supabase
        .from("inventory")
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      toast({ title: "Success", description: "Stock item added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useBulkCreateInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: {
      smartcard: string;
      serial_number: string;
      batch_number?: string;
      stock_type: StockType;
      region_id?: string;
    }[]) => {
      const { data, error } = await supabase
        .from("inventory")
        .insert(items)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      toast({ title: "Success", description: `${data.length} stock items imported successfully` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useAssignInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, agent_id }: { id: string; agent_id: string }) => {
      const { data, error } = await supabase
        .from("inventory")
        .update({ 
          assigned_to_agent_id: agent_id, 
          status: "in_hand",
          assigned_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      toast({ title: "Success", description: "Stock assigned to agent" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeleteInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inventory").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      toast({ title: "Success", description: "Stock item deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

// Sales hooks
export const useSales = () => {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*, inventory(*), agents(*)")
        .order("sale_date", { ascending: false });
      if (error) throw error;
      return data as Sale[];
    },
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sale: {
      inventory_id?: string;
      agent_id?: string;
      sale_type: SaleType;
      package_type?: string;
      sale_price?: number;
      customer_name?: string;
      customer_phone?: string;
      manual_smartcard?: string;
      manual_serial?: string;
    }) => {
      let inventoryId = sale.inventory_id;

      // If manual entry, create inventory item first
      if (!inventoryId && sale.manual_smartcard && sale.manual_serial) {
        const { data: newInventory, error: invCreateError } = await supabase
          .from("inventory")
          .insert({
            smartcard: sale.manual_smartcard,
            serial_number: sale.manual_serial,
            stock_type: "full_set" as StockType,
            status: "sold" as StockStatus,
            assigned_to_agent_id: sale.agent_id,
          })
          .select()
          .single();
        if (invCreateError) throw invCreateError;
        inventoryId = newInventory.id;
      }

      if (!inventoryId) throw new Error("No inventory item specified");

      // Create the sale
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert({
          inventory_id: inventoryId,
          agent_id: sale.agent_id,
          sale_type: sale.sale_type,
          package_type: sale.package_type,
          sale_price: sale.sale_price,
          customer_name: sale.customer_name,
          customer_phone: sale.customer_phone,
        })
        .select()
        .single();
      if (saleError) throw saleError;

      // Update inventory status to sold if from existing item
      if (sale.inventory_id) {
        const { error: invError } = await supabase
          .from("inventory")
          .update({ status: "sold" })
          .eq("id", sale.inventory_id);
        if (invError) throw invError;
      }

      return saleData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast({ title: "Success", description: "Sale recorded successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Sale>) => {
      const { data, error } = await supabase
        .from("sales")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast({ title: "Success", description: "Sale updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

// Search hook
export const useSearch = (query: string) => {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!query.trim()) return { inventory: null, agent: null };
      
      // Search inventory
      const { data: inventory } = await supabase
        .from("inventory")
        .select("*, regions(*), agents(*)")
        .or(`smartcard.eq.${query.trim()},serial_number.eq.${query.trim()}`)
        .maybeSingle();

      // Search agents
      const { data: agents } = await supabase
        .from("agents")
        .select("*, teams(*, regions(*))")
        .or(`name.ilike.%${query.trim()}%,phone.ilike.%${query.trim()}%`)
        .limit(5);

      // Get sale info if inventory is sold
      let sale = null;
      if (inventory?.status === "sold") {
        const { data: saleData } = await supabase
          .from("sales")
          .select("*, agents(*)")
          .eq("inventory_id", inventory.id)
          .maybeSingle();
        sale = saleData;
      }

      return { 
        inventory: inventory ? { ...inventory, sale } : null, 
        agents: agents || [] 
      };
    },
    enabled: query.length > 0,
  });
};
