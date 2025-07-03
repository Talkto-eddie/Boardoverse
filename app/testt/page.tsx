"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, CheckCircle, XCircle, Clock, Wallet } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import useGameSol from "@/hooks/use_game_sol";

interface TestResult {
    functionName: string;
    status: "idle" | "loading" | "success" | "error";
    result?: string;
    error?: string;
    timestamp?: Date;
}

export default function TestSolanaFunctionsPage() {
    const { publicKey, connected } = useWallet();
    const { createGameTrx, joinGameTrx, stopGameTrx, declareGameWinnerTrx } = useGameSol();

    // Form states
    const [gameId, setGameId] = useState("");
    const [stakeAmount, setStakeAmount] = useState("0.1");
    const [player1Address, setPlayer1Address] = useState("");
    const [player2Address, setPlayer2Address] = useState("");
    const [winnerAddress, setWinnerAddress] = useState("");

    // Test results
    const [testResults, setTestResults] = useState<TestResult[]>([]);

    // Loading states
    const [loadingStates, setLoadingStates] = useState({
        createGame: false,
        joinGame: false,
        stopGame: false,
        declareWinner: false,
    });

    const updateTestResult = (functionName: string, status: TestResult["status"], result?: string, error?: string) => {
        const newResult: TestResult = {
            functionName,
            status,
            result,
            error,
            timestamp: new Date(),
        };

        setTestResults(prev => {
            const filtered = prev.filter(r => r.functionName !== functionName);
            return [newResult, ...filtered];
        });
    };

    const setLoading = (functionName: keyof typeof loadingStates, loading: boolean) => {
        setLoadingStates(prev => ({ ...prev, [functionName]: loading }));
    };

    const generateRandomGameId = () => {
        const id = `test_game_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        setGameId(id);
        return id;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const validatePublicKey = (address: string): boolean => {
        try {
            new PublicKey(address);
            return true;
        } catch {
            return false;
        }
    };

    // Test functions
    const testCreateGame = async () => {
        if (!connected || !publicKey) {
            toast.error("Please connect your wallet first");
            return;
        }

        const testGameId = gameId || generateRandomGameId();
        const stake = parseFloat(stakeAmount);

        if (stake <= 0) {
            toast.error("Stake amount must be greater than 0");
            return;
        }

        setLoading("createGame", true);
        updateTestResult("createGame", "loading");

        try {
            const signature = await createGameTrx(testGameId, stake, publicKey);
            updateTestResult("createGame", "success", signature);
            toast.success("Game created successfully!");

            // Auto-fill addresses for next tests
            if (!player1Address) setPlayer1Address(publicKey.toString());
        } catch (error: any) {
            updateTestResult("createGame", "error", undefined, error.message);
            toast.error(`Failed to create game: ${error.message}`);
        } finally {
            setLoading("createGame", false);
        }
    };

    const testJoinGame = async () => {
        if (!connected || !publicKey) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (!gameId) {
            toast.error("Please enter a game ID");
            return;
        }

        if (!player1Address || !validatePublicKey(player1Address)) {
            toast.error("Please enter a valid player 1 address");
            return;
        }

        setLoading("joinGame", true);
        updateTestResult("joinGame", "loading");

        try {
            const signature = await joinGameTrx(
                gameId,
                new PublicKey(player1Address),
                publicKey
            );
            updateTestResult("joinGame", "success", signature);
            toast.success("Joined game successfully!");

            // Auto-fill player2 address
            if (!player2Address) setPlayer2Address(publicKey.toString());
        } catch (error: any) {
            updateTestResult("joinGame", "error", undefined, error.message);
            toast.error(`Failed to join game: ${error.message}`);
        } finally {
            setLoading("joinGame", false);
        }
    };

    const testStopGame = async () => {
        if (!connected || !publicKey) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (!gameId || !player1Address || !player2Address) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (!validatePublicKey(player1Address) || !validatePublicKey(player2Address)) {
            toast.error("Please enter valid player addresses");
            return;
        }

        setLoading("stopGame", true);
        updateTestResult("stopGame", "loading");

        try {
            const signature = await stopGameTrx(
                gameId,
                publicKey,
                new PublicKey(player1Address),
                new PublicKey(player2Address)
            );
            updateTestResult("stopGame", "success", signature);
            toast.success("Game stopped successfully!");
        } catch (error: any) {
            updateTestResult("stopGame", "error", undefined, error.message);
            toast.error(`Failed to stop game: ${error.message}`);
        } finally {
            setLoading("stopGame", false);
        }
    };

    const testDeclareWinner = async () => {
        if (!gameId || !winnerAddress || !player1Address || !player2Address) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (!validatePublicKey(winnerAddress) || !validatePublicKey(player1Address) || !validatePublicKey(player2Address)) {
            toast.error("Please enter valid addresses");
            return;
        }

        setLoading("declareWinner", true);
        updateTestResult("declareWinner", "loading");

        try {
            const signature = await declareGameWinnerTrx(
                gameId,
                new PublicKey(winnerAddress),
                new PublicKey(player1Address),
                new PublicKey(player2Address)
            );
            updateTestResult("declareWinner", "success", signature);
            toast.success("Winner declared successfully!");
        } catch (error: any) {
            updateTestResult("declareWinner", "error", undefined, error.message);
            toast.error(`Failed to declare winner: ${error.message}`);
        } finally {
            setLoading("declareWinner", false);
        }
    };

    const getStatusIcon = (status: TestResult["status"]) => {
        switch (status) {
            case "loading":
                return <Clock className="h-4 w-4 animate-spin" />;
            case "success":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "error":
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Solana Game Functions Test</h1>
                <p className="text-muted-foreground mt-2">
                    Test your blockchain game functions in a controlled environment
                </p>
            </div>

            {/* Wallet Status */}
            <Alert className="mb-6">
                <Wallet className="h-4 w-4" />
                <AlertDescription>
                    {connected ? (
                        <span className="flex items-center gap-2">
                            <Badge variant="secondary">Connected</Badge>
                            <span className="font-mono text-sm">{publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}</span>
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Badge variant="destructive">Not Connected</Badge>
                            <span>Please connect your wallet to test functions</span>
                        </span>
                    )}
                </AlertDescription>
            </Alert>

            <Tabs defaultValue="test" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="test">Test Functions</TabsTrigger>
                    <TabsTrigger value="results">Test Results</TabsTrigger>
                </TabsList>

                <TabsContent value="test" className="space-y-6">
                    {/* Global Test Data */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Configuration</CardTitle>
                            <CardDescription>Set up common parameters for all tests</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="gameId">Game ID</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="gameId"
                                            value={gameId}
                                            onChange={(e) => setGameId(e.target.value)}
                                            placeholder="Enter game ID"
                                            className="font-mono"
                                        />
                                        <Button variant="outline" onClick={generateRandomGameId}>
                                            Generate
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stakeAmount">Stake Amount (USDC)</Label>
                                    <Input
                                        id="stakeAmount"
                                        type="number"
                                        value={stakeAmount}
                                        onChange={(e) => setStakeAmount(e.target.value)}
                                        placeholder="0.1"
                                        min="0.01"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="player1">Player 1 Address</Label>
                                    <Input
                                        id="player1"
                                        value={player1Address}
                                        onChange={(e) => setPlayer1Address(e.target.value)}
                                        placeholder="Player 1 public key"
                                        className="font-mono text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="player2">Player 2 Address</Label>
                                    <Input
                                        id="player2"
                                        value={player2Address}
                                        onChange={(e) => setPlayer2Address(e.target.value)}
                                        placeholder="Player 2 public key"
                                        className="font-mono text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="winner">Winner Address</Label>
                                    <Input
                                        id="winner"
                                        value={winnerAddress}
                                        onChange={(e) => setWinnerAddress(e.target.value)}
                                        placeholder="Winner public key"
                                        className="font-mono text-xs"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Test Functions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Create Game */}
                        <Card>
                            <CardHeader>
                                <CardTitle>1. Create Game</CardTitle>
                                <CardDescription>Creates a new game on the blockchain</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    onClick={testCreateGame}
                                    disabled={!connected || loadingStates.createGame}
                                    className="w-full"
                                >
                                    {loadingStates.createGame ? "Creating..." : "Create Game"}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Join Game */}
                        <Card>
                            <CardHeader>
                                <CardTitle>2. Join Game</CardTitle>
                                <CardDescription>Join an existing game</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    onClick={testJoinGame}
                                    disabled={!connected || loadingStates.joinGame}
                                    className="w-full"
                                >
                                    {loadingStates.joinGame ? "Joining..." : "Join Game"}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Stop Game */}
                        <Card>
                            <CardHeader>
                                <CardTitle>3. Stop Game</CardTitle>
                                <CardDescription>Stop an active game</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    onClick={testStopGame}
                                    disabled={!connected || loadingStates.stopGame}
                                    className="w-full"
                                    variant="destructive"
                                >
                                    {loadingStates.stopGame ? "Stopping..." : "Stop Game"}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Declare Winner */}
                        <Card>
                            <CardHeader>
                                <CardTitle>4. Declare Winner</CardTitle>
                                <CardDescription>Declare the winner and settle rewards</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    onClick={testDeclareWinner}
                                    disabled={loadingStates.declareWinner}
                                    className="w-full"
                                    variant="secondary"
                                >
                                    {loadingStates.declareWinner ? "Declaring..." : "Declare Winner"}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="results">
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Results</CardTitle>
                            <CardDescription>View the results of your function tests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {testResults.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No test results yet. Run some tests to see results here.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {testResults.map((result, index) => (
                                        <div key={`${result.functionName}-${index}`} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(result.status)}
                                                    <span className="font-medium">{result.functionName}</span>
                                                    <Badge variant={result.status === "success" ? "secondary" : result.status === "error" ? "destructive" : "outline"}>
                                                        {result.status}
                                                    </Badge>
                                                </div>
                                                {result.timestamp && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {result.timestamp.toLocaleTimeString()}
                                                    </span>
                                                )}
                                            </div>

                                            {result.result && (
                                                <div className="space-y-2">
                                                    <Label>Transaction Signature:</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Textarea
                                                            value={result.result}
                                                            readOnly
                                                            className="font-mono text-xs resize-none"
                                                            rows={2}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => copyToClipboard(result.result!)}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {result.error && (
                                                <div className="space-y-2">
                                                    <Label className="text-red-500">Error:</Label>
                                                    <Textarea
                                                        value={result.error}
                                                        readOnly
                                                        className="text-red-500 border-red-200 resize-none"
                                                        rows={3}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}