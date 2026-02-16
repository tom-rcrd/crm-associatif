import { useState, useEffect } from 'react'
import { Map, Info, Compass, Book, Phone, ExternalLink, Navigation, Shield } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Plan {
  id: string
  title: string
  content: string
  image_url: string
  type: string
}

export default function Plans() {
  const [items, setItems] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('plans')
        .select('*')
      
      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors du chargement des informations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Plans & Infos Utiles</h1>
        <p className="text-muted-foreground">Tout ce qu'il faut savoir sur les locaux et le fonctionnement de l'asso.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)
        ) : items.length === 0 ? (
          <Card className="col-span-full flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
            <Info className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <CardTitle className="text-xl mb-1">Aucune information</CardTitle>
            <CardDescription>
              Il n'y a pas encore d'information ou de plan disponible.
            </CardDescription>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="group overflow-hidden border-none shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="relative aspect-video w-full bg-muted overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    {item.type === 'plan' ? <Compass className="h-12 w-12 text-primary/20" /> : <Info className="h-12 w-12 text-primary/20" />}
                  </div>
                )}
                <div className="absolute left-4 top-4">
                  <Badge className={item.type === 'plan' ? 'bg-blue-500' : 'bg-primary'}>
                    {item.type === 'plan' ? 'Plan' : 'Information'}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">{item.title}</CardTitle>
                <CardDescription className="line-clamp-2">{item.content}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    <span>Dernière mise à jour: 12/05/2024</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Voir les détails
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Emergency / Contact section */}
      <Card className="border-none shadow-lg bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <Phone className="h-6 w-6" />
            Contacts d'urgence
          </CardTitle>
          <CardDescription className="text-primary-foreground/70">En cas de problème technique ou d'incident au local.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Président', name: 'Jean Dupont', phone: '06 12 34 56 78', icon: Shield },
              { label: 'Technique', name: 'Luc Martin', phone: '06 87 65 43 21', icon: Navigation },
              { label: 'Secrétariat', name: 'Marie Curie', phone: '01 23 45 67 89', icon: Phone },
              { label: 'Local (Fixe)', name: 'Accueil', phone: '01 98 76 54 32', icon: Map },
            ].map((contact, i) => (
              <div key={i} className="flex flex-col gap-1 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <span className="text-xs font-bold uppercase opacity-60">{contact.label}</span>
                <span className="text-lg font-bold">{contact.name}</span>
                <span className="text-sm font-medium text-primary-foreground/80">{contact.phone}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}