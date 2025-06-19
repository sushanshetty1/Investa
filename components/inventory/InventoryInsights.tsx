"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Clock,
  Target,
  Activity,
  Package,
  DollarSign
} from "lucide-react";

interface InventoryInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'risk' | 'optimization' | 'alert';
  priority: 'high' | 'medium' | 'low';
  impact: string;
  recommendation: string;
  metrics?: {
    current: number;
    target: number;
    unit: string;
  };
}

interface InventoryInsightsProps {
  insights?: InventoryInsight[];
  isLoading?: boolean;
}

const mockInsights: InventoryInsight[] = [
  {
    id: '1',
    title: 'Low Stock Alert - High Velocity Items',
    description: '8 fast-moving items are approaching reorder points',
    type: 'alert',
    priority: 'high',
    impact: 'Potential stockouts affecting $45,000 in monthly revenue',
    recommendation: 'Expedite purchase orders for critical items',
    metrics: {
      current: 8,
      target: 0,
      unit: 'items'
    }
  },
  {
    id: '2',
    title: 'Aged Inventory Optimization',
    description: 'Items over 90 days old represent 12% of total inventory value',
    type: 'optimization',
    priority: 'medium',
    impact: 'Free up $85,000 in working capital',
    recommendation: 'Implement clearance pricing for slow-moving items',
    metrics: {
      current: 12,
      target: 5,
      unit: '%'
    }
  },
  {
    id: '3',
    title: 'Category A Items - Margin Improvement',
    description: 'High-value items showing increased profit margins',
    type: 'opportunity',
    priority: 'medium',
    impact: 'Potential to increase overall margin by 2.3%',
    recommendation: 'Expand catalog of similar high-margin products',
    metrics: {
      current: 42.5,
      target: 45.0,
      unit: '%'
    }
  },
  {
    id: '4',
    title: 'Seasonal Demand Pattern Detected',
    description: 'Electronics category shows 15% increase in demand',
    type: 'opportunity',
    priority: 'high',
    impact: 'Capture additional $120,000 in seasonal revenue',
    recommendation: 'Increase safety stock for electronics by 20%',
    metrics: {
      current: 85,
      target: 102,
      unit: 'days'
    }
  },
  {
    id: '5',
    title: 'Supplier Lead Time Variance',
    description: 'Key supplier showing inconsistent delivery times',
    type: 'risk',
    priority: 'medium',
    impact: 'Increased safety stock requirements',
    recommendation: 'Diversify supplier base or negotiate SLA improvements',
    metrics: {
      current: 18,
      target: 12,
      unit: 'days'
    }
  }
];

export function InventoryInsights({ insights, isLoading = false }: InventoryInsightsProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [apiInsights, setApiInsights] = useState<InventoryInsight[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiSummaryStats, setApiSummaryStats] = useState<any>(null);

  // Fetch insights from API if not provided as props
  useEffect(() => {
    async function fetchInsights() {
      if (insights) {
        setApiInsights(insights);
        setApiLoading(false);
        return;
      }

      try {
        setApiLoading(true);
        const response = await fetch(`/api/analytics/insights?type=${selectedType}&priority=${selectedPriority}`);
        const data = await response.json();
        
        if (data.success) {
          setApiInsights(data.data.insights);
          setApiSummaryStats(data.data.summary);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
        setApiInsights(mockInsights);
      } finally {
        setApiLoading(false);
      }
    }

    fetchInsights();
  }, [insights, selectedType, selectedPriority]);

  const currentInsights = insights || apiInsights;
  const loading = isLoading || apiLoading;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'risk':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'optimization':
        return <Target className="w-4 h-4 text-blue-500" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'bg-green-50 border-green-200';
      case 'risk':
        return 'bg-red-50 border-red-200';
      case 'optimization':
        return 'bg-blue-50 border-blue-200';
      case 'alert':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const filteredInsights = currentInsights.filter(insight => {
    const typeMatch = selectedType === 'all' || insight.type === selectedType;
    const priorityMatch = selectedPriority === 'all' || insight.priority === selectedPriority;
    return typeMatch && priorityMatch;
  });

  // Use API summary stats if available, otherwise calculate from current insights
  const summaryStats = apiSummaryStats || {
    total: currentInsights.length,
    highPriority: currentInsights.filter(i => i.priority === 'high').length,
    opportunities: currentInsights.filter(i => i.type === 'opportunity').length,
    risks: currentInsights.filter(i => i.type === 'risk').length,
    alerts: currentInsights.filter(i => i.type === 'alert').length
  };
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{summaryStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Insights</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summaryStats.highPriority}</div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summaryStats.opportunities}</div>
              <div className="text-sm text-muted-foreground">Opportunities</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summaryStats.risks}</div>
              <div className="text-sm text-muted-foreground">Risk Items</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summaryStats.alerts}</div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex gap-2">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('all')}
          >
            All Types
          </Button>
          <Button
            variant={selectedType === 'opportunity' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('opportunity')}
          >
            Opportunities
          </Button>
          <Button
            variant={selectedType === 'risk' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('risk')}
          >
            Risks
          </Button>
          <Button
            variant={selectedType === 'alert' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('alert')}
          >
            Alerts
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPriority === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPriority('all')}
          >
            All Priorities
          </Button>
          <Button
            variant={selectedPriority === 'high' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPriority('high')}
          >
            High
          </Button>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => (
          <Card key={insight.id} className={getTypeColor(insight.type)}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getTypeIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      {getPriorityBadge(insight.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-sm mb-1">Impact</h5>
                        <p className="text-sm text-muted-foreground">{insight.impact}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-1">Recommendation</h5>
                        <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                      </div>
                    </div>
                    {insight.metrics && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress to Target</span>
                          <span>
                            {insight.metrics.current}{insight.metrics.unit} / {insight.metrics.target}{insight.metrics.unit}
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(100, (insight.metrics.current / insight.metrics.target) * 100)} 
                          className="h-2" 
                        />
                      </div>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Take Action
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInsights.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No insights found</h3>
            <p className="text-muted-foreground">
              No insights match your current filters. Try adjusting your selection.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
