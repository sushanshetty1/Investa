"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  FileImage,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";

interface ExportOptions {
  reportType: string;
  format: 'csv' | 'xlsx' | 'pdf';
  dateRange: string;
  warehouse: string;
  includeCharts: boolean;
}

interface Export {
  id: string;
  filename: string;
  reportType: string;
  format: string;
  size: number;
  generatedAt: string;
  expiresAt: string;
  downloadUrl: string;
}

interface ExportManagerProps {
  defaultReportType?: string;
  defaultDateRange?: string;
  defaultWarehouse?: string;
}

export function ExportManager({ 
  defaultReportType = 'inventory-summary',
  defaultDateRange = '30d',
  defaultWarehouse = 'all'
}: ExportManagerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [exports, setExports] = useState<Export[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    reportType: defaultReportType,
    format: 'csv',
    dateRange: defaultDateRange,
    warehouse: defaultWarehouse,
    includeCharts: false
  });

  // Fetch existing exports
  useEffect(() => {
    fetchExports();
  }, []);

  const fetchExports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/analytics/exports');
      const data = await response.json();
      if (data.success) {
        setExports(data.data.exports);
      }
    } catch (error) {
      console.error('Error fetching exports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateExport = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch('/api/analytics/exports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportOptions),
      });

      const data = await response.json();
      if (data.success) {
        // Add the new export to the list
        const newExport: Export = {
          id: Date.now().toString(),
          filename: data.data.filename,
          reportType: exportOptions.reportType,
          format: data.data.format,
          size: data.data.size,
          generatedAt: data.data.generatedAt,
          expiresAt: data.data.expiresAt,
          downloadUrl: data.data.downloadUrl
        };
        setExports(prev => [newExport, ...prev]);
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error generating export:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <FileText className="w-4 h-4" />;
      case 'xlsx':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'pdf':
        return <FileImage className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header with New Export Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Export Manager</h3>
          <p className="text-sm text-muted-foreground">
            Generate and download analytics reports
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              New Export
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Export</DialogTitle>
              <DialogDescription>
                Configure your report export settings
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Select 
                  value={exportOptions.reportType} 
                  onValueChange={(value) => setExportOptions(prev => ({ ...prev, reportType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inventory-summary">Inventory Summary</SelectItem>
                    <SelectItem value="financial-summary">Financial Summary</SelectItem>
                    <SelectItem value="abc-analysis">ABC Analysis</SelectItem>
                    <SelectItem value="aging-report">Aging Report</SelectItem>
                    <SelectItem value="forecast-data">Forecast Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="format">Format</Label>
                <Select 
                  value={exportOptions.format} 
                  onValueChange={(value: 'csv' | 'xlsx' | 'pdf') => setExportOptions(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dateRange">Date Range</Label>
                <Select 
                  value={exportOptions.dateRange} 
                  onValueChange={(value) => setExportOptions(prev => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="6m">Last 6 months</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="warehouse">Warehouse</Label>
                <Select 
                  value={exportOptions.warehouse} 
                  onValueChange={(value) => setExportOptions(prev => ({ ...prev, warehouse: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>
                    <SelectItem value="main">Main Warehouse</SelectItem>
                    <SelectItem value="secondary">Secondary Warehouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {exportOptions.format === 'pdf' && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeCharts"
                    checked={exportOptions.includeCharts}
                    onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeCharts: checked as boolean }))}
                  />
                  <Label htmlFor="includeCharts">Include charts and visualizations</Label>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={generateExport} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Exports List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
          <CardDescription>Your generated reports and downloads</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : exports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h4 className="font-medium mb-2">No exports yet</h4>
              <p className="text-sm">Generate your first report export to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exports.map((exportItem) => (
                <div key={exportItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFormatIcon(exportItem.format)}
                    <div>
                      <div className="font-medium">{exportItem.filename}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(exportItem.size)} • Generated {formatDate(exportItem.generatedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={exportItem.format === 'pdf' ? 'default' : 'secondary'}>
                      {exportItem.format.toUpperCase()}
                    </Badge>
                    {isExpired(exportItem.expiresAt) ? (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Expired
                      </Badge>
                    ) : (
                      <Button size="sm" variant="outline" asChild>
                        <a href={exportItem.downloadUrl} download>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
