import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Search, ArrowUpRight, Wallet } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Transaction {
  id: string
  amount: number
  description: string
  date: string
  category: string
}

export default function Treasury() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const fetchTreasury = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('treasury')
        .select('*')
        .order('date', { ascending: false })
      
      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors du chargement de la trésorerie')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTreasury()
  }, [])

  const totalBalance = transactions.reduce((acc, t) => acc + Number(t.amount), 0)
  const totalIncome = transactions.filter(t => Number(t.amount) > 0).reduce((acc, t) => acc + Number(t.amount), 0)
  const totalExpense = Math.abs(transactions.filter(t => Number(t.amount) < 0).reduce((acc, t) => acc + Number(t.amount), 0))

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(filter.toLowerCase()) || 
    t.category?.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Trésorerie</h1>
        <p className="text-muted-foreground">Suivi financier de l'association en temps réel. (Lecture seule)</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none bg-primary text-primary-foreground shadow-lg overflow-hidden relative">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <Wallet className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wider">Solde Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium">
              <span className="flex items-center text-green-400">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                8.2%
              </span>
              <span className="opacity-60">Depuis le mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-green-500/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Revenus</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">+{totalIncome.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
            <p className="text-xs text-muted-foreground mt-1">Saison 2024-2025</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-red-500/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Dépenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">-{totalExpense.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
            <p className="text-xs text-muted-foreground mt-1">Dépenses opérationnelles</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-4">
          <div>
            <CardTitle className="text-lg">Historique des Transactions</CardTitle>
            <CardDescription>Liste complète des entrées et sorties</CardDescription>
          </div>
          <div className="flex items-center gap-2">
             <Input 
              placeholder="Rechercher une transaction..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-[300px] bg-background"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="px-6 py-4">Date</TableHead>
                <TableHead className="py-4">Description</TableHead>
                <TableHead className="py-4">Catégorie</TableHead>
                <TableHead className="py-4 text-right pr-6">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><div className="h-4 w-24 rounded bg-muted animate-pulse" /></TableCell>
                    <TableCell className="py-4"><div className="h-4 w-48 rounded bg-muted animate-pulse" /></TableCell>
                    <TableCell className="py-4"><div className="h-4 w-20 rounded bg-muted animate-pulse" /></TableCell>
                    <TableCell className="py-4 pr-6"><div className="ml-auto h-4 w-16 rounded bg-muted animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    Aucune transaction trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="px-6 py-4 font-medium text-muted-foreground">
                      {new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="py-4 font-semibold">{t.description}</TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className="font-medium bg-background">{t.category}</Badge>
                    </TableCell>
                    <TableCell className={`py-4 text-right pr-6 font-bold ${Number(t.amount) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(t.amount) > 0 ? '+' : ''}{Number(t.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}