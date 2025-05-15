"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export default function FAQPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <div className="flex flex-col items-center text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h1>
                <p className="text-muted-foreground mt-3 max-w-2xl">
                    Find answers to common questions about BoardoVerse, gameplay, and rewards
                </p>
                <Badge variant="outline" className="mt-4 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>More content coming soon</span>
                </Badge>
            </div>

            <div className="max-w-3xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>General Questions</CardTitle>
                        <CardDescription>Basic information about BoardoVerse platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="what-is">
                                <AccordionTrigger>What is BoardoVerse?</AccordionTrigger>
                                <AccordionContent>
                                    BoardoVerse is a decentralized gaming platform where players can enjoy classic board games like Ludo while staking cryptocurrency. All games are secured by blockchain technology, ensuring fair play and automatic rewards distribution.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="how-to-play">
                                <AccordionTrigger>How do I start playing?</AccordionTrigger>
                                <AccordionContent>
                                    To start playing, connect your wallet, navigate to the dashboard, choose a game, stake the required amount, and wait for other players to join. Once all players are ready, the game will start automatically.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="cost">
                                <AccordionTrigger>How much does it cost to play?</AccordionTrigger>
                                <AccordionContent>
                                    The minimum stake amount is 0.1 USDC per game, plus a small platform fee (10% of stake). You can customize your stake amount when creating a game. Winners receive all staked amounts minus the platform fee.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="supported-wallets">
                                <AccordionTrigger>Which wallets are supported?</AccordionTrigger>
                                <AccordionContent>
                                    We currently support Solana-compatible wallets including Phantom, Solflare, and Backpack. More wallet integrations coming soon.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Technical Questions</CardTitle>
                        <CardDescription>Information about gameplay mechanics and technical details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center py-8 text-muted-foreground">
                            More detailed technical FAQ coming soon...
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}