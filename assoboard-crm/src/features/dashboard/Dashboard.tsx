import { useState, useEffect } from 'react'
import { Sun, Cloud, CloudRain, Wind, Wifi, Activity, TrendingUp, Users, Calendar, FileText } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase'

export default function Dashboard({ settings = { show_weather: true, show_speed: true } }: { settings?: { show_weather: boolean, show_speed: boolean } }) {
  const [weather, setWeather] = useState({ temp: 22, condition: 'Ensoleillé', city: 'Paris' })
  const [speed, setSpeed] = useState({ download: 450, upload: 120, latency: 12 })
  const [stats, setStats] = useState({ members: 0, balance: 0, events: 3 })

  useEffect(() => {
    // Charger les stats depuis Supabase
    const loadStats = async () => {
      // Récupérer le solde de la trésorerie
      const { data: treasuryData } = await supabase
        .from('treasury')
        .select('amount')
      
      if (treasuryData) {
        const balance = treasuryData.reduce((acc, t) => acc + Number(t.amount), 0)
        setStats(prev => ({ ...prev, balance }))
      }
    }

    loadStats()
  }, [])

  // Mock weather update
  useEffect(() => {
    const timer = setInterval(() => {
      setWeather(prev => ({ ...prev, temp: prev.temp + (Math.random() > 0.5 ? 1 : -1) }))
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">Bienvenue sur l'AssoBoard. Voici les dernières nouvelles de l'association.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none bg-primary text-primary-foreground shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-80">Trésorerie Actuelle</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.balance.toLocaleString()} €</div>
            <p className="text-xs opacity-70 mt-1">+12% par rapport au mois dernier</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Membres Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.members || 42}</div>
            <p className="text-xs text-muted-foreground mt-1">3 nouveaux cette semaine</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Événements à venir</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.events}</div>
            <p className="text-xs text-muted-foreground mt-1">Prochain: Assemblée Générale (J-5)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Weather Widget */}
        {settings.show_weather && (
          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-blue-500/10 to-transparent">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Météo Local</CardTitle>
                <Cloud className="h-5 w-5 text-blue-500" />
              </div>
              <CardDescription>{weather.city}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col">
                  <span className="text-4xl font-bold">{weather.temp}°C</span>
                  <span className="text-sm text-muted-foreground font-medium">{weather.condition}</span>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                  <Sun className="h-8 w-8 text-blue-500 animate-pulse" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-muted-foreground" />
                  <span>12 km/h</span>
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain className="h-4 w-4 text-muted-foreground" />
                  <span>5%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Internet Speed Widget */}
        {settings.show_speed && (
          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-purple-500/10 to-transparent">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Box Association</CardTitle>
                <Wifi className="h-5 w-5 text-purple-500" />
              </div>
              <CardDescription>Performance réseau en temps réel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Download</span>
                  <span className="font-bold">{speed.download} Mbps</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Upload</span>
                  <span className="font-bold">{speed.upload} Mbps</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div className="flex justify-between pt-2 border-t text-sm">
                <span className="text-muted-foreground">Latence</span>
                <span className="font-bold text-green-500">{speed.latency} ms</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Links / Activity */}
        <Card className={`md:col-span-2 lg:col-span-1 border-none shadow-md ${(!settings.show_weather && !settings.show_speed) ? 'lg:col-span-3' : ''}`}>
          <CardHeader>
            <CardTitle className="text-lg">Activité Récente</CardTitle>
            <CardDescription>Dernières mises à jour du CRM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Document partagé ajouté', time: 'Il y a 2h', icon: FileText },
                { label: 'Cotisation reçue (M. Martin)', time: 'Il y a 5h', icon: TrendingUp },
                { label: 'Nouveau membre inscrit', time: 'Hier', icon: Users },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 last:pb-0 last:border-0 border-b border-border/50">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}