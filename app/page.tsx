"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, Search, Grid, List, Trash2, Eye, Download, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

interface ImageFile {
  id: string
  name: string
  url: string
  downloadUrl: string
  size: number
  uploadedAt: string
  type: string
}

export default function ImageFileManager() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Load images on component mount
  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      const response = await fetch("/api/images")
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
      }
    } catch (error) {
      console.error("Failed to load images:", error)
      toast({
        title: "Error",
        description: "Failed to load images",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    setUploading(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        })
        return null
      }

      const formData = new FormData()
      formData.append("file", file)

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          return data.image
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || "Upload failed")
        }
      } catch (error) {
        console.error("Upload error:", error)
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}: ${error.message}`,
          variant: "destructive",
        })
        return null
      }
    })

    const uploadedImages = await Promise.all(uploadPromises)
    const validImages = uploadedImages.filter(Boolean) as ImageFile[]

    if (validImages.length > 0) {
      setImages((prev) => [...validImages, ...prev])
      toast({
        title: "Success",
        description: `Uploaded ${validImages.length} image(s)`,
      })
    }

    setUploading(false)
  }

  const handleDelete = async (imageId: string) => {
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setImages((prev) => prev.filter((img) => img.id !== imageId))
        toast({
          title: "Success",
          description: "Image deleted successfully",
        })
      } else {
        throw new Error("Delete failed")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const filteredImages = images.filter((image) => image.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading images...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Image File Manager</h1>
          <p className="text-gray-600">Upload, organize, and manage your image files</p>
        </div>

        {/* Database Setup Section */}
        <Card className="mb-4 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-yellow-800">Database Setup</h3>
                <p className="text-sm text-yellow-700">Click to setup the database table (one-time setup)</p>
              </div>
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/setup-db", { method: "POST" })
                    const data = await response.json()
                    if (data.success) {
                      toast({
                        title: "Success",
                        description: data.message,
                      })
                    } else {
                      toast({
                        title: "Setup Failed",
                        description: data.error || "Unknown error",
                        variant: "destructive",
                      })
                    }
                  } catch (error) {
                    console.error("Setup error:", error)
                    toast({
                      title: "Setup Failed",
                      description: "Failed to setup database",
                      variant: "destructive",
                    })
                  }
                }}
                variant="outline"
                size="sm"
              >
                Setup Database
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upload Area */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{uploading ? "Uploading..." : "Upload Images"}</h3>
              <p className="text-gray-600 mb-4">Drag and drop your images here, or click to select files</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <Button asChild disabled={uploading}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  {uploading ? "Uploading..." : "Select Images"}
                </label>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Images Display */}
        {filteredImages.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search terms" : "Upload some images to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={viewMode} className="w-full">
            <TabsContent value="grid">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative bg-gray-100">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=200&width=200&text=Image"
                        }}
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>{image.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <img
                                src={image.url || "/placeholder.svg"}
                                alt={image.name}
                                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                              />
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Size:</span> {formatFileSize(image.size)}
                                </div>
                                <div>
                                  <span className="font-medium">Type:</span> {image.type}
                                </div>
                                <div className="col-span-2">
                                  <span className="font-medium">Uploaded:</span> {formatDate(image.uploadedAt)}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDelete(image.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium truncate" title={image.name}>
                        {image.name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {image.type.split("/")[1]?.toUpperCase() || "IMG"}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatFileSize(image.size)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="list">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredImages.map((image) => (
                      <div key={image.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=64&width=64&text=Img"
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{image.name}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>{formatFileSize(image.size)}</span>
                            <Badge variant="secondary" className="text-xs">
                              {image.type.split("/")[1]?.toUpperCase() || "IMG"}
                            </Badge>
                            <span>{formatDate(image.uploadedAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>{image.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <img
                                  src={image.url || "/placeholder.svg"}
                                  alt={image.name}
                                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                                />
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Size:</span> {formatFileSize(image.size)}
                                  </div>
                                  <div>
                                    <span className="font-medium">Type:</span> {image.type}
                                  </div>
                                  <div className="col-span-2">
                                    <span className="font-medium">Uploaded:</span> {formatDate(image.uploadedAt)}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button asChild size="sm" variant="outline">
                            <a href={image.downloadUrl} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(image.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
