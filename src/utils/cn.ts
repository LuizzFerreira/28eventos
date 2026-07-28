export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function formatPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

export function formatCEP(value: string) {
  return value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9)
}

export async function fetchAddressByCEP(cep: string) {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return null
  const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
  const data = await res.json()
  if (data.erro) return null
  return {
    endereco: data.logradouro,
    bairro: data.bairro,
    cidade: data.localidade,
    estado: data.uf,
  }
}

export const eventTypeLabels: Record<string, string> = {
  casamento: 'Casamento',
  '15_anos': '15 Anos',
  formatura: 'Formatura',
  corporativo: 'Corporativo',
  infantil: 'Infantil',
  aniversario: 'Aniversário',
  outro: 'Outro',
}
