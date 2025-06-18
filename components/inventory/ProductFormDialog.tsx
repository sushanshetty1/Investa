'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, X, Plus } from 'lucide-react'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    unit: z.string().optional()
  }).optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  material: z.string().optional(),
  costPrice: z.number().min(0, 'Cost price must be positive').optional(),
  sellingPrice: z.number().min(0, 'Selling price must be positive').optional(),
  wholesalePrice: z.number().min(0, 'Wholesale price must be positive').optional(),
  minStockLevel: z.number().min(0, 'Minimum stock level must be positive').default(0),
  maxStockLevel: z.number().optional(),
  reorderPoint: z.number().optional(),
  reorderQuantity: z.number().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED', 'DRAFT']).default('ACTIVE'),
  isTrackable: z.boolean().default(true),
  isSerialized: z.boolean().default(false),
  primaryImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  tags: z.array(z.string()).optional(),
  leadTimeSupply: z.number().optional(),
  shelfLife: z.number().optional()
})

type ProductFormData = z.infer<typeof productSchema>

interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  description?: string
  categoryId?: string
  brandId?: string
  costPrice?: number
  sellingPrice?: number
  wholesalePrice?: number
  minStockLevel: number
  maxStockLevel?: number
  reorderPoint?: number
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DRAFT'
  primaryImage?: string
  isTrackable: boolean
  isSerialized: boolean
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
    unit?: string
  }
  color?: string
  size?: string
  material?: string
  images?: string[]
  metaTitle?: string
  metaDescription?: string
  tags?: string[]
  leadTimeSupply?: number
  shelfLife?: number
  category?: {
    id: string
    name: string
  }
  brand?: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
}

interface Brand {
  id: string
  name: string
}

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
  onSave: (data: ProductFormData) => Promise<void>
  categories: Category[]
  brands: Brand[]
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSave,
  categories,
  brands
}: ProductFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      barcode: '',
      categoryId: '',
      brandId: '',
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        unit: 'cm'
      },
      color: '',
      size: '',
      material: '',
      costPrice: 0,
      sellingPrice: 0,
      wholesalePrice: 0,
      minStockLevel: 0,
      maxStockLevel: 0,
      reorderPoint: 0,
      reorderQuantity: 0,
      status: 'ACTIVE',
      isTrackable: true,
      isSerialized: false,
      primaryImage: '',
      images: [],
      metaTitle: '',
      metaDescription: '',
      tags: [],
      leadTimeSupply: 0,
      shelfLife: 0
    }
  })

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || '',
        sku: product.sku,
        barcode: product.barcode || '',
        categoryId: product.categoryId || '',
        brandId: product.brandId || '',
        weight: product.weight || 0,
        dimensions: product.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
        color: product.color || '',
        size: product.size || '',
        material: product.material || '',
        costPrice: product.costPrice || 0,
        sellingPrice: product.sellingPrice || 0,
        wholesalePrice: product.wholesalePrice || 0,
        minStockLevel: product.minStockLevel,
        maxStockLevel: product.maxStockLevel || 0,
        reorderPoint: product.reorderPoint || 0,
        status: product.status,
        isTrackable: product.isTrackable,
        isSerialized: product.isSerialized,
        primaryImage: product.primaryImage || '',
        images: product.images || [],
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        tags: product.tags || [],
        leadTimeSupply: product.leadTimeSupply || 0,
        shelfLife: product.shelfLife || 0
      })
      setSelectedImages(product.images || [])
      setCurrentTags(product.tags || [])
    } else {
      form.reset()
      setSelectedImages([])
      setCurrentTags([])
    }
  }, [product, form])

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      await onSave({
        ...data,
        images: selectedImages,
        tags: currentTags
      })
      onOpenChange(false)
      form.reset()
      setSelectedImages([])
      setCurrentTags([])
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In a real app, you'd upload these to a file storage service
      // For now, we'll just create object URLs for preview
      const newImages = Array.from(files).map(file => URL.createObjectURL(file))
      setSelectedImages(prev => [...prev, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      setCurrentTags(prev => [...prev, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setCurrentTags(prev => prev.filter(t => t !== tag))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {product ? 'Update product information' : 'Add a new product to your inventory'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="media">Media & SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter SKU" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter product description" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands.map(brand => (
                              <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                            <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Red, Blue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., S, M, L, XL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Cotton, Plastic" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wholesalePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wholesale Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="inventory" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Stock Levels</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <FormField
                        control={form.control}
                        name="minStockLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Stock Level *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxStockLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Stock Level</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reorderPoint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reorder Point</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Tracking Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="isTrackable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Track Inventory</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Track stock levels for this product
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isSerialized"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Serial Numbers</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Track individual serial numbers
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="leadTimeSupply"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lead Time (Days)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Product Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Button type="button" variant="outline" size="sm" asChild>
                          <label className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Images
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                          </label>
                        </Button>
                      </div>

                      {selectedImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-4">
                          {selectedImages.map((image, index) => (
                            <div key={index} className="relative">                              <Image
                                src={image}
                                alt={`Product image ${index + 1}`}
                                width={96}
                                height={96}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" variant="outline" onClick={addTag}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {currentTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {currentTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="cursor-pointer">
                              {tag}
                              <X 
                                className="h-3 w-3 ml-1" 
                                onClick={() => removeTag(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title (SEO)</FormLabel>
                        <FormControl>
                          <Input placeholder="SEO title for search engines" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description (SEO)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="SEO description for search engines" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
