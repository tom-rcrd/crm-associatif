import { useState, useEffect } from 'react'
import { LayoutDashboard, FileText, Landmark, Map, Settings, LogOut, Search } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { supabase } from './lib/supabase'
import { Button } from './components/ui/button'
import { Skeleton } from './components/ui/skeleton'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog'
import { Switch } from './components/ui/switch'
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger, SidebarInset } from './components/ui/sidebar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'

// Pages
import Dashboard from './features/dashboard/Dashboard'
import Documents from './features/documents/Documents'
import Treasury from './features/treasury/Treasury'
import Plans from './features/plans/Plans'

function LoginPage({ onLogin, onRegister }: { 
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (email: string, password: string, name?: string) => Promise<void>
}) {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      if (isRegister) {
        await onRegister(email, password, name)
        toast.success('Compte créé ! Vérifiez votre email si nécessaire.')
      } else {
        await onLogin(email, password)
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
        <Landmark className="h-8 w-8" />
      </div>
      <h1 className="mb-2 text-4xl font-bold tracking-tight">AssoBoard CRM</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        La plateforme de gestion collaborative pour votre association.
      </p>
      
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{isRegister ? 'Créer un compte' : 'Se connecter'}</CardTitle>
          <CardDescription>
            {isRegister ? 'Remplissez les informations ci-dessous' : 'Entrez vos identifiants'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Votre nom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Chargement...' : (isRegister ? 'Créer le compte' : 'Se connecter')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function App() {
  const { user, loading, login, register, logout, isAuthenticated } = useAuth()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [settings, setSettings] = useState({ show_weather: true, show_speed: true })
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    if (user) {
      supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (data) {
            setSettings({
              show_weather: data.show_weather,
              show_speed: data.show_speed
            })
          } else if (error?.code === 'PGRST116') {
            // Pas de settings, on les crée
            supabase.from('user_settings').insert({
              user_id: user.id,
              show_weather: true,
              show_speed: true
            })
          }
        })
    }
  }, [user])

  const toggleSetting = async (key: 'show_weather' | 'show_speed') => {
    const newVal = !settings[key]
    setSettings(prev => ({ ...prev, [key]: newVal }))
    
    await supabase
      .from('user_settings')
      .update({ [key]: newVal })
      .eq('user_id', user!.id)
    
    toast.success('Paramètres mis à jour')
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    )
  }

if (!isAuthenticated) {
  return <LoginPage onLogin={login} onRegister={register} />
}

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-muted/30 overflow-hidden">
        <Sidebar className="border-r border-border/50 bg-background/50 backdrop-blur-xl">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Landmark className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">AssoBoard</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarMenu>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'treasury', label: 'Trésorerie', icon: Landmark },
                { id: 'plans', label: 'Plans & Infos', icon: Map },
              ].map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    className="py-6 transition-all hover:bg-muted"
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="flex flex-col gap-4">
              <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => setSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Button>

              <div className="flex items-center gap-3 px-2">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold">{user?.displayName?.[0] || 'U'}</span>
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold truncate">{user?.displayName || 'Membre'}</span>
                  <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                </div>
              </div>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="flex flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-background/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-4 w-[1px] bg-border mx-2" />
              <h2 className="text-lg font-semibold capitalize">{activeTab}</h2>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="rounded-full">
                <Search className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium text-muted-foreground hidden sm:block">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'dashboard' && <Dashboard settings={settings} />}
              {activeTab === 'documents' && <Documents />}
              {activeTab === 'treasury' && <Treasury />}
              {activeTab === 'plans' && <Plans />}
            </div>
          </main>
        </SidebarInset>
      </div>

      {/* Dialog Paramètres */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paramètres du Dashboard</DialogTitle>
            <DialogDescription>Personnalisez les widgets affichés sur votre accueil.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="weather" className="flex flex-col gap-1">
                <span>Afficher la météo</span>
                <span className="text-xs font-normal text-muted-foreground">Données locales en temps réel</span>
              </Label>
              <Switch id="weather" checked={settings.show_weather} onCheckedChange={() => toggleSetting('show_weather')} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="speed" className="flex flex-col gap-1">
                <span>Afficher le débit internet</span>
                <span className="text-xs font-normal text-muted-foreground">Box de l'association</span>
              </Label>
              <Switch id="speed" checked={settings.show_speed} onCheckedChange={() => toggleSetting('show_speed')} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
} 