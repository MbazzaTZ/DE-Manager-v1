import { Package, User, MapPin, Calendar, CheckCircle, Hand, Store, Phone, Mail, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

interface SearchResultCardProps {
  type: "inventory" | "agent";
  data: any;
  onClick?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onUpdateSale?: () => void;
}

const statusConfig = {
  in_store: { label: "In Store", icon: Store, color: "bg-info/10 text-info border-info/20" },
  in_hand: { label: "In Hand", icon: Hand, color: "bg-warning/10 text-warning border-warning/20" },
  sold: { label: "Sold", icon: CheckCircle, color: "bg-success/10 text-success border-success/20" },
};

const SearchResultCard = ({ type, data, onClick, onView, onEdit, onDelete, onUpdateSale }: SearchResultCardProps) => {
  if (type === "inventory") {
    const status = statusConfig[data.status as keyof typeof statusConfig];
    const StatusIcon = status?.icon || Package;

    return (
      <ContextMenu>
        <Card className="p-6 animate-slide-up" onClick={onClick}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="gradient-primary rounded-xl p-3">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Stock Item</h3>
              <p className="text-sm text-muted-foreground">
                {data.stock_type === "full_set" ? "Full Set" : "Decoder Only"}
              </p>
            </div>
          </div>
          <Badge className={cn("border", status?.color)}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status?.label}
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Smartcard</p>
              <p className="font-mono font-semibold text-foreground">{data.smartcard}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Serial Number</p>
              <p className="font-mono font-semibold text-foreground">{data.serial_number}</p>
            </div>
            {data.batch_number && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Batch</p>
                <p className="font-medium text-foreground">{data.batch_number}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {data.regions && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{data.regions.name}</span>
              </div>
            )}
            {data.agents && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Assigned to: {data.agents.name}</span>
              </div>
            )}
            {data.assigned_at && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Assigned: {format(new Date(data.assigned_at), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>
        </div>
        <div className="absolute right-4 top-4">
            <ContextMenuTrigger asChild>
              <button className="p-2 rounded hover:bg-accent/10">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onSelect={() => onView && onView()}>View</ContextMenuItem>
              <ContextMenuItem onSelect={() => onEdit && onEdit()}>Edit</ContextMenuItem>
              <ContextMenuItem onSelect={() => onDelete && onDelete()}>Delete</ContextMenuItem>
            </ContextMenuContent>
          </div>

        {data.sale && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="font-semibold text-foreground mb-3">Sale Information</h4>
            <div className="grid gap-2 sm:grid-cols-2 text-sm">
              <div>
                <span className="text-muted-foreground">Sold by:</span>{" "}
                <span className="font-medium">{data.sale.agents?.name || "N/A"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>{" "}
                <span className="font-medium">
                  {format(new Date(data.sale.sale_date), "MMM d, yyyy")}
                </span>
              </div>
              {data.sale.customer_name && (
                <div>
                  <span className="text-muted-foreground">Customer:</span>{" "}
                  <span className="font-medium">{data.sale.customer_name}</span>
                </div>
              )}
              {/* Price display removed */}
            </div>
          </div>
        )}
      </Card>
    </ContextMenu>
    );
  }

  // Agent result
  return (
    <ContextMenu>
      <Card className="p-6 animate-slide-up relative" onClick={onClick}>
        <div className="flex items-start gap-4">
        <div className="gradient-success rounded-xl p-3">
          <User className="h-6 w-6 text-accent-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground">{data.name}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {data.teams?.name || "No Team"} • {data.teams?.regions?.name || "No Region"}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {data.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {data.phone}
              </div>
            )}
            {data.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {data.email}
              </div>
            )}
          </div>
          <div className="mt-3">
            <Badge variant="secondary">
              {data.total_sales} Total Sales
            </Badge>
          </div>
        </div>
      </div>

      <div className="absolute right-4 top-4">
        <ContextMenuTrigger asChild>
          <button className="p-2 rounded hover:bg-accent/10">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </ContextMenuTrigger>
      </div>

      </Card>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => onView && onView()}>View</ContextMenuItem>
        <ContextMenuItem onSelect={() => onEdit && onEdit()}>Edit</ContextMenuItem>
        <ContextMenuItem onSelect={() => onDelete && onDelete()}>Delete</ContextMenuItem>
        <ContextMenuItem onSelect={() => onUpdateSale && onUpdateSale()}>Update Sale</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default SearchResultCard;
