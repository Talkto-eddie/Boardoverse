"use client"

import { RootState } from "@/redux/store"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "./ui/button"
import { useUser } from "@civic/auth-web3/react";
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { connectWallet, connectWalletSuccess } from "@/redux/features/wallet/walletSlice"

export default function ConnectButton() {
    const [isHovering, setIsHovering] = useState(false)
    const router = useRouter()
    const [showUserSelect, setShowUserSelect] = useState(false)
    const { connected, isConnecting, currentUser } = useSelector((state: RootState) => state.wallet)
    const { signIn, user } = useUser()
    const dispatch = useDispatch()

    const handleConnectWallet = async () => {
        toast("Signing in...")

        signIn()
            .catch((error) => {
                console.error("Error signing in:", error);
                toast.error("Error signing in. Please try again.");
            });
        dispatch(connectWallet())
    }

    // When user state changes and we were in signing in process, navigate
    useEffect(() => {
        if (user && isConnecting) {
            dispatch(connectWalletSuccess());
            router.push("/dashboard")
            toast.success("Signed in successfully");
        }
    }, [user, isConnecting]);

    return (
        <Button
            className="web3-button"
            size="lg"
            onClick={handleConnectWallet}
            disabled={isConnecting}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {connected ? "Go to Dashboard" : "Sign in"}
            {isHovering && !connected && !isConnecting && (
                <div className="absolute inset-0 -z-10 animate-pulse rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 opacity-75 blur-lg"></div>
            )}
        </Button>
    )
}