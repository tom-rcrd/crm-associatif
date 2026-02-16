import './style.css'
import { setupCounter } from './components/ui/counter.tsx'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>

  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
