"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ComponentType<any>;
  description?: string;
  target?: number;
  unit?: string;
  format?: 'number' | 'currency' | 'percentage';
  status?: 'good' | 'warning' | 'danger' | 'neutral';
}

export function MetricCard({
  title,
  value,
  change,
  trend = 'stable',
  icon: Icon,
  description,
  target,
  unit = '',
  format = 'number',
  status = 'neutral'
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val;

    switch (format) {
      case 'currency':
        return `$${numVal.toLocaleString()}`;
      case 'percentage':
        return `${numVal}%`;
      default:
        return numVal.toLocaleString();
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'danger':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 mr-1" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 mr-1" />;
      default:
        return <Minus className="w-3 h-3 mr-1" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className={`h-4 w-4 ${getStatusColor()}`} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(value)}{unit}
        </div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground">
            <span className={`flex items-center ${getTrendColor()}`}>
              {getTrendIcon()}
              {change > 0 ? '+' : ''}{change}%
            </span>
            {description || 'from last period'}
          </p>
        )}
        {target !== undefined && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Target: {formatValue(target)}{unit}</span>
              <span>{Math.round((typeof value === 'string' ? parseFloat(value) : value) / target * 100)}%</span>
            </div>
            <Progress
              value={Math.min(100, (typeof value === 'string' ? parseFloat(value) : value) / target * 100)}
              className="h-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AnalyticsDashboardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  filters?: React.ReactNode;
  lastUpdated?: string;
}

export function AnalyticsDashboard({
  title,
  description,
  children,
  isLoading = false,
  onRefresh,
  onExport,
  filters,
  lastUpdated
}: AnalyticsDashboardProps) {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {filters}
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

interface AlertCardProps {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function AlertCard({ title, message, type, action }: AlertCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <Card className={`${getBorderColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getIcon()}
            <div>
              <h4 className="font-medium text-sm">{title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{message}</p>
            </div>
          </div>
          {action && (
            <Button size="sm" variant="outline" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { Card, CardContent, CardDescription, CardHeader, CardTitle };
