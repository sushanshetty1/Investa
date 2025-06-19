'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Edit, Trash2, FolderOpen, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  slug: z.string().min(1, 'Slug is required'),
  parentId: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean()
})

type CategoryFormData = z.infer<typeof categorySchema>

interface Category {
  id: string
  name: string
  description?: string
  slug: string
  parentId?: string
  level: number
  path?: string
  icon?: string
  color?: string
  image?: string
  isActive: boolean
  productCount?: number
  parent?: Category
  children?: Category[]
  createdAt: string
  updatedAt: string
}

interface CategoryManagerProps {
  categories: Category[]
  onCategoryCreate: (data: CategoryFormData) => Promise<void>
  onCategoryUpdate: (categoryId: string, data: CategoryFormData) => Promise<void>
  onCategoryDelete: (categoryId: string) => Promise<void>
}

export function CategoryManager({
  categories,
  onCategoryCreate,
  onCategoryUpdate,
  onCategoryDelete
}: CategoryManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      parentId: '',
      icon: '',
      color: '',
      image: '',
      isActive: true
    }
  })

  const handleCreate = () => {
    setSelectedCategory(null)
    form.reset()
    setShowCreateDialog(true)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    form.reset({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      parentId: category.parentId || '',
      icon: category.icon || '',
      color: category.color || '',
      image: category.image || '',
      isActive: category.isActive
    })
    setShowEditDialog(true)
  }

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true)
    try {
      if (selectedCategory) {
        await onCategoryUpdate(selectedCategory.id, data)
        setShowEditDialog(false)
      } else {
        await onCategoryCreate(data)
        setShowCreateDialog(false)
      }
      form.reset()
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      setLoading(true)
      try {
        await onCategoryDelete(categoryId)
      } catch (error) {
        console.error('Error deleting category:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    form.setValue('name', name)
    if (!selectedCategory) {
      form.setValue('slug', generateSlug(name))
    }
  }

  const flattenCategories = (cats: Category[], level = 0): Category[] => {
    const result: Category[] = []
    cats.forEach(cat => {
      result.push({ ...cat, level })
      if (cat.children && cat.children.length > 0) {
        result.push(...flattenCategories(cat.children, level + 1))
      }
    })
    return result
  }

  const getParentOptions = (currentCategory?: Category) => {
    return categories.filter(cat => 
      cat.id !== currentCategory?.id && 
      !cat.parentId // Only top-level categories can be parents for now
    )
  }

  const CategoryFormDialog = ({ open, onOpenChange, title }: {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
  }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {selectedCategory ? 'Update category information' : 'Create a new product category'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter category name" 
                        {...field}
                        onChange={(e) => handleNameChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="category-slug" {...field} />
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
                      placeholder="Enter category description" 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No parent (Top level)</SelectItem>
                        {getParentOptions(selectedCategory || undefined).map(category => (
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input 
                        type="color" 
                        placeholder="#000000" 
                        {...field} 
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Whether this category is active and visible
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (selectedCategory ? 'Update' : 'Create')} Category
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Category Management</CardTitle>
            <CardDescription>
              Organize your products with hierarchical categories
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No categories found</h3>
            <p className="text-muted-foreground mb-4">
              Create categories to organize your products effectively.
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Category
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flattenCategories(categories).map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div style={{ marginLeft: `${category.level * 20}px` }}>
                        {category.level > 0 && (
                          <ChevronRight className="h-4 w-4 inline mr-1 text-muted-foreground" />
                        )}
                        <div className="flex items-center gap-2">
                          {category.color && (
                            <div 
                              className="w-3 h-3 rounded-full border" 
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                          <div>
                            <div className="font-medium">{category.name}</div>
                            {category.description && (
                              <div className="text-sm text-muted-foreground">
                                {category.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      /{category.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {category.productCount} products
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          ⋮
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(category.id)}
                          className="text-destructive"
                          disabled={!!category.productCount && category.productCount > 0}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <CategoryFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          title="Create New Category"
        />

        <CategoryFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          title="Edit Category"
        />
      </CardContent>
    </Card>
  )
}
