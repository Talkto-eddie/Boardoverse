'use client'

import { useUserStore } from "@/store/userStore"
import React, { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"

type Props = {}

const UserInitializer = (props: Props) => {
  const { setUser, connected: userConnected } = useUserStore()
  const router = useRouter()
  const pathname = usePathname()
  const { connected: walletConnected, publicKey } = useWallet()

  useEffect(() => {
    const fetchUser = async () => {
      console.log('UserInitializer effect:', { 
        walletConnected, 
        userConnected, 
        publicKey: publicKey?.toBase58(), 
        pathname 
      })

      if (walletConnected && publicKey) {
        const userAddress = publicKey.toBase58() 
        setUser(userAddress) 
        console.log('User set in store:', userAddress)
        if (pathname === '/') {
          console.log('Redirecting to dashboard')
          router.push('/dashboard')
        }
      } else {
        
        if (pathname.startsWith('/dashboard')) {
          console.log('Redirecting from dashboard - no user connection')
          router.push('/')
        } else if (pathname.startsWith('/game/')) {
          setTimeout(() => {
            if (!userConnected) {
              console.log('UserInitializer redirecting from game page - no user connection')
              router.push('/')
            }
          }, 2000) 
        }
      }
    }

    fetchUser()
  }, [walletConnected, userConnected, publicKey, setUser, router, pathname])

  return null
}

export default UserInitializer
