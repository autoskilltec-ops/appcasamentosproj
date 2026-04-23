"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function useClientAuth() {
  const router = useRouter()
  const [eventId, setEventId] = useState<string | null>(null)
  const [clientPin, setClientPin] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const pin = sessionStorage.getItem("clientPin")
    const id = sessionStorage.getItem("clientEventId")

    if (!pin || !id) {
      router.replace("/")
      return
    }

    setEventId(id)
    setClientPin(pin)
    setLoading(false)
  }, [router])

  return { eventId, clientPin, loading }
}
