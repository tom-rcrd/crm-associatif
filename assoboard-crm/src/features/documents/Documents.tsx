import { useState, useEffect, useRef } from 'react'
import { FileText, Trash2, Download, Search, File, Upload, ExternalLink } from 'lucide-react'
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface Doc {
  id: string
  name: string
  url: string
  type: string
  size: string
  user_id?: string
  created_at: string
}

export default function Documents() {
  const { user } = useAuth()
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchDocs = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Récupérer les docs personnels
      const { data: personal, error: personalError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
      
      // Récupérer les docs partagés
      const { data: shared, error: sharedError } = await supabase
        .from('documents')
        .select('*')
        .eq('type', 'shared')
      
      if (personalError) console.error(personalError)
      if (sharedError) console.error(sharedError)
      
      setDocs([...(personal || []), ...(shared || [])])
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors du chargement des documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchDocs()
  }, [user])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    const toastId = toast.loading('Téléchargement du document...')
    try {
      const fileName = `${user.id}/${Date.now()}-${file.name}`
      
      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)
      
      if (uploadError) throw uploadError
      
      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)
      
      // Créer l'entrée en base
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          name: file.name,
          url: publicUrl,
          type: 'personal',
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        })
      
      if (dbError) throw dbError
      
      toast.success('Document ajouté avec succès', { id: toastId })
      fetchDocs()
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors du téléchargement', { id: toastId })
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce document ?')) return
    
    try {
      // Supprimer de la base
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setDocs(prev => prev.filter(d => d.id !== id))
      toast.success('Document supprimé')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const filteredDocs = docs.filter(d => d.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Gérez vos fichiers personnels et accédez aux ressources de l'asso.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Rechercher..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-[250px] bg-background"
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-4 bg-muted/50 p-1">
          <TabsTrigger value="personal" className="px-6">Mes Documents</TabsTrigger>
          <TabsTrigger value="shared" className="px-6">Documents Communs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <DocGrid 
            docs={filteredDocs.filter(d => d.type === 'personal')} 
            onDelete={handleDelete}
            loading={loading}
          />
        </TabsContent>
        
        <TabsContent value="shared">
          <DocGrid 
            docs={filteredDocs.filter(d => d.type === 'shared')} 
            isShared
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DocGrid({ docs, onDelete, isShared, loading }: { docs: Doc[], onDelete?: (id: string, url: string) => void, isShared?: boolean, loading: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
      </div>
    )
  }

  if (docs.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
        <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        <CardTitle className="text-xl mb-1">Aucun document trouvé</CardTitle>
        <CardDescription>
          {isShared ? "Il n'y a pas encore de document partagé." : "Commencez par ajouter votre premier document."}
        </CardDescription>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {docs.map((doc) => (
        <Card key={doc.id} className="group relative overflow-hidden transition-all hover:shadow-lg border-border/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <File className="h-6 w-6" />
              </div>
              {!isShared && onDelete && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(doc.id, doc.url)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm truncate pr-8" title={doc.name}>{doc.name}</h3>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                <span>{doc.size}</span>
                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Ouvrir
                </a>
              </Button>
              <Button size="sm" className="w-full text-xs h-8" asChild>
                <a href={doc.url} download={doc.name}>
                  <Download className="mr-1 h-3 w-3" />
                  Télécharger
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}