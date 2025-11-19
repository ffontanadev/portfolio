---
title: "TypeScript Tips and Tricks para Desarrolladores React"
date: "2025-01-10"
description: "Descubre técnicas avanzadas de TypeScript que mejorarán la calidad de tu código React y reducirán bugs en producción."
tags: ["TypeScript", "React", "JavaScript", "Best Practices"]
published: true
---

# TypeScript Tips and Tricks para Desarrolladores React

TypeScript se ha convertido en un estándar de facto para desarrollo de aplicaciones React profesionales. Aquí comparto mis técnicas favoritas.

## 1. Tipos Utilitarios

TypeScript incluye tipos utilitarios poderosos que simplifican el trabajo diario:

```typescript
// Pick: Selecciona propiedades específicas
type User = {
  id: string
  name: string
  email: string
  password: string
}

type PublicUser = Pick<User, 'id' | 'name'>

// Omit: Excluye propiedades
type UserWithoutPassword = Omit<User, 'password'>

// Partial: Hace todas las propiedades opcionales
type PartialUser = Partial<User>
```

## 2. Tipado de Props en React

Siempre define tipos para tus componentes:

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
}

export function Button({ variant, size, onClick, children, disabled }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
```

## 3. Type Guards

Crea funciones de type guard para validar tipos en runtime:

```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function processData(data: unknown) {
  if (isString(data)) {
    // TypeScript sabe que data es string aquí
    console.log(data.toUpperCase())
  }
}
```

## 4. Generics en Custom Hooks

Los generics hacen tus hooks reutilizables y type-safe:

```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}
```

## Conclusión

Estas técnicas te ayudarán a escribir código TypeScript más robusto y mantenible. La inversión en tipado fuerte se paga con creces en bugs evitados y mejor DX.

¿Cuál es tu tip favorito de TypeScript? Comparte en los comentarios.
