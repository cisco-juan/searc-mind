"use client"

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, AlertCircle, CheckCircle, X, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api"

interface UploadedFile {
  name: string
  size: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

interface DocumentUploadProps {
  onUploadComplete?: (totalDocuments: number) => void
  className?: string
}

export function DocumentUpload({ onUploadComplete, className }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptedTypes = '.pdf,.txt,.md'
  const maxSize = 10 * 1024 * 1024 // 10MB

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['.pdf', '.txt', '.md']
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!allowedTypes.includes(extension)) {
      return 'Solo se permiten archivos PDF, TXT y MD'
    }
    
    if (file.size > maxSize) {
      return 'El archivo debe ser menor a 10MB'
    }
    
    return null
  }

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return

    const newFiles: UploadedFile[] = []
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const error = validateFile(file)
      
      if (error) {
        newFiles.push({
          name: file.name,
          size: file.size,
          status: 'error',
          error
        })
      } else {
        newFiles.push({
          name: file.name,
          size: file.size,
          status: 'uploading'
        })
      }
    }

    setFiles(prev => [...prev, ...newFiles])
    
    // Upload files that passed validation
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const fileIndex = files.length + i
      
      if (!validateFile(file)) {
        try {
          setIsUploading(true)
          const response = await apiClient.uploadDocument(file)
          
          setFiles(prev => prev.map((f, idx) => 
            idx === fileIndex 
              ? { ...f, status: 'success' as const }
              : f
          ))
          
          if (onUploadComplete) {
            onUploadComplete(response.totalDocuments)
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error subiendo archivo'
          
          setFiles(prev => prev.map((f, idx) => 
            idx === fileIndex 
              ? { ...f, status: 'error' as const, error: errorMessage }
              : f
          ))
        }
      }
    }
    
    setIsUploading(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const clearAll = async () => {
    try {
      await apiClient.clearDocuments()
      setFiles([])
      if (onUploadComplete) {
        onUploadComplete(0)
      }
    } catch (error) {
      console.error('Error clearing documents:', error)
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Subir Documentos
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sube documentos PDF, TXT o MD para que el asistente pueda responder basándose en su contenido
            </p>
          </div>
          {files.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAll}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar Todo
            </Button>
          )}
        </div>

        {/* Drop Zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            isDragging 
              ? "border-blue-400 bg-blue-50 dark:bg-blue-950" 
              : "border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleFileSelect}
        >
          <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300 mb-2">
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Máximo 10MB • PDF, TXT, MD
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Archivos ({files.length})
            </h4>
            
            {files.map((file, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(file.size)}
                  </p>
                  {file.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {file.error}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {file.status === 'uploading' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  )}
                  
                  {file.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  
                  {file.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isUploading && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              <span className="text-sm text-blue-600 dark:text-blue-400">
                Procesando documentos...
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}