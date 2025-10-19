"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Brain,
  ArrowLeft,
  TrendingUp,
  Users,
  AlertTriangle,
  MessageSquare,
  Target,
  BarChart3,
  Send,
  Sparkles,
  Globe,
  X,
  Maximize2,
  List,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

export default function DetailsPage() {
  const router = useRouter()
  const [chatMessage, setChatMessage] = useState("")
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      message: "Hello! I'm your AI market intelligence assistant. Ask me anything about your market analysis.",
    },
  ])
  const [pulseData, setPulseData] = useState<any>(null)
  const [expandedContent, setExpandedContent] = useState<{ title: string; content: any } | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isChatLoading, setIsChatLoading] = useState(false)

  useEffect(() => {
    const storedData = localStorage.getItem("pulseData")
    if (storedData) {
      setPulseData(JSON.parse(storedData))
    }

    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim() || !pulseData) return

    const newHistory = [...chatHistory, { role: "user", message: chatMessage }]
    setChatHistory(newHistory)
    setIsChatLoading(true)

    try {
      // Call the real chatbot API
      const response = await fetch("https://ItsMeArm00n-NexGen-API.hf.space/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: chatMessage,
          analysis_json: pulseData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from chatbot API")
      }

      const data = await response.json()

      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          message: data.answer || "I'm sorry, I couldn't generate a response. Please try again.",
        },
      ])
    } catch (error) {
      console.error("[v0] Chatbot API error:", error)
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          message:
            "I'm having trouble connecting to the AI service. The model may be asleep or out of usage credits. Please try again in a moment.",
        },
      ])
    } finally {
      setIsChatLoading(false)
    }

    setChatMessage("")
  }

  const handleExpand = (title: string, content: any) => {
    setExpandedContent({ title, content })
  }

  const closeExpandedModal = () => {
    setExpandedContent(null)
  }

  const handleBackToSummary = () => {
    router.push("/?showSummary=true")
  }

  const prepareSentimentData = () => {
    if (!pulseData?.CustomerSentimentAnalysis) return []

    const data = []
    if (pulseData.CustomerSentimentAnalysis.Positive) {
      data.push({
        name: "Positive",
        value: Number.parseFloat(pulseData.CustomerSentimentAnalysis.Positive.percentage) || 0,
        color: "#10b981", // Emerald green
      })
    }
    if (pulseData.CustomerSentimentAnalysis.Neutral) {
      data.push({
        name: "Neutral",
        value: Number.parseFloat(pulseData.CustomerSentimentAnalysis.Neutral.percentage) || 0,
        color: "#a3a3a3", // Neutral gray
      })
    }
    if (pulseData.CustomerSentimentAnalysis.Negative) {
      data.push({
        name: "Negative",
        value: Number.parseFloat(pulseData.CustomerSentimentAnalysis.Negative.percentage) || 0,
        color: "#ef4444", // Red
      })
    }
    return data
  }

  const prepareMarketShareData = () => {
    if (!pulseData?.MarketShare || !pulseData?.CompetitorAnalysis) return []

    const data = [
      {
        name: "Your Company",
        share: Number.parseFloat(pulseData.MarketShare.percentage) || 0,
        isMainCompany: true,
      },
    ]

    pulseData.CompetitorAnalysis.forEach((comp: any) => {
      data.push({
        name: comp.name,
        share: Number.parseFloat(comp.marketShare) || 0,
        isMainCompany: false,
      })
    })

    const sortedData = data.sort((a, b) => b.share - a.share)
    const colors = ["#22c55e", "#3b82f6", "#eab308", "#ef4444", "#f97316", "#8b5cf6"]
    return sortedData.map((item, index) => ({
      ...item,
      color: colors[index % colors.length],
    }))
  }

  const prepareTimelineData = () => {
    if (!pulseData?.CompetitorAnalysis) return []

    // Use vibrant colors for timeline
    const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"]
    const timeline: any[] = []
    pulseData.CompetitorAnalysis.forEach((comp: any, compIndex: number) => {
      if (comp.updates && comp.updates.length > 0) {
        comp.updates.forEach((update: string) => {
          timeline.push({
            competitor: comp.name,
            update: update,
            color: colors[compIndex % colors.length],
          })
        })
      }
    })
    return timeline
  }

  const prepareWordCloudData = () => {
    if (!pulseData?.TopCustomerFeedbackThemes) return []

    const maxMentions = Math.max(...pulseData.TopCustomerFeedbackThemes.map((item: any) => item.mentions))

    return pulseData.TopCustomerFeedbackThemes.map((item: any) => ({
      theme: item.theme,
      mentions: item.mentions,
      size: (item.mentions / maxMentions) * 100,
    }))
  }

  if (!pulseData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 loading-spinner mx-auto mb-6" />
          <p className="text-2xl font-bold animate-shimmer-text mb-2">Loading Market Analysis</p>
          <p className="text-muted-foreground">Preparing your insights...</p>
        </div>
      </div>
    )
  }

  const sentimentData = prepareSentimentData()
  const marketShareData = prepareMarketShareData()
  const timelineData = prepareTimelineData()
  const wordCloudData = prepareWordCloudData()

  return (
    <div className="min-h-screen bg-background text-foreground animate-page-fade-in">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 animate-gradient opacity-50" />
        <div className="absolute top-20 left-10 w-3 h-3 bg-primary rounded-full animate-float opacity-70" />
        <div
          className="absolute top-40 right-20 w-4 h-4 bg-secondary rounded-full animate-float opacity-60"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-40 left-1/4 w-3 h-3 bg-accent rounded-full animate-float opacity-50"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                NexGen AI
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="group border-secondary/50 hover:border-secondary bg-transparent hover:bg-secondary/10 transition-all duration-300 overflow-hidden relative"
                onClick={handleBackToSummary}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-secondary/10 to-secondary/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <span className="relative flex items-center">
                  <List className="w-4 h-4 mr-2" />
                  Back to Summary
                </span>
              </Button>
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="group border-primary/50 hover:border-primary bg-transparent hover:bg-primary/10 transition-all duration-300 overflow-hidden relative"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <span className="relative flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`mb-8 transition-all duration-800 ${isVisible ? "animate-page-slide-up" : "opacity-0"}`}>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 glow-text">Full Market Analysis</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">Comprehensive market intelligence insights</p>
          </div>

          <div
            className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-800 delay-100 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <Card
              className="bg-card/50 backdrop-blur-sm border-primary/30 p-6 card-glow-primary cursor-pointer hover:scale-105 hover:border-primary/60 transition-all duration-300"
              onClick={() =>
                handleExpand(
                  "Competitor Activity",
                  `Level: ${pulseData.CompetitorActivity?.level || "N/A"}\n\n${pulseData.CompetitorActivity?.updateSummary || "No data available"}`,
                )
              }
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <div className="text-sm font-medium text-muted-foreground">Competitor Activity</div>
                </div>
                <Maximize2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{pulseData.CompetitorActivity?.level || "N/A"}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {pulseData.CompetitorActivity?.updateSummary || "No data available"}
              </div>
            </Card>

            <Card
              className="bg-card/50 backdrop-blur-sm border-secondary/30 p-6 card-glow-secondary cursor-pointer hover:scale-105 hover:border-secondary/60 transition-all duration-300"
              onClick={() =>
                handleExpand(
                  "Customer Sentiment",
                  `Percentage: ${pulseData.CustomerSentiment?.percentage || "N/A"}\n\n${pulseData.CustomerSentiment?.changeFromLastWeek || "No change data"}`,
                )
              }
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-secondary" />
                  <div className="text-sm font-medium text-muted-foreground">Customer Sentiment</div>
                </div>
                <Maximize2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-secondary mb-1">
                {pulseData.CustomerSentiment?.percentage || "N/A"}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {pulseData.CustomerSentiment?.changeFromLastWeek || "No change data"}
              </div>
            </Card>

            <Card
              className="bg-card/50 backdrop-blur-sm border-destructive/30 p-6 hover:shadow-lg hover:shadow-destructive/20 cursor-pointer hover:scale-105 hover:border-destructive/60 transition-all duration-300"
              onClick={() =>
                handleExpand(
                  "Urgent Alerts",
                  `Count: ${pulseData.UrgentAlerts?.count || 0}\n\n${pulseData.UrgentAlerts?.summary || "No urgent alerts"}`,
                )
              }
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div className="text-sm font-medium text-muted-foreground">Urgent Alerts</div>
                </div>
                <Maximize2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-destructive mb-1">{pulseData.UrgentAlerts?.count || 0}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {pulseData.UrgentAlerts?.summary || "No urgent alerts"}
              </div>
            </Card>

            <Card
              className="bg-card/50 backdrop-blur-sm border-accent/30 p-6 card-glow-accent cursor-pointer hover:scale-105 hover:border-accent/60 transition-all duration-300"
              onClick={() =>
                handleExpand(
                  "Market Share",
                  `Percentage: ${pulseData.MarketShare?.percentage || "N/A"}\n\nGrowth Potential: ${pulseData.MarketShare?.growthPotential || "No growth data"}`,
                )
              }
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-accent" />
                  <div className="text-sm font-medium text-muted-foreground">Market Share</div>
                </div>
                <Maximize2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-accent mb-1">{pulseData.MarketShare?.percentage || "N/A"}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {pulseData.MarketShare?.growthPotential || "No growth data"}
              </div>
            </Card>
          </div>

          <div
            className={`mb-12 transition-all duration-800 delay-200 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">📊 Visual Insights</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm border-secondary/30 p-6 hover:border-secondary/50 transition-all duration-300 animate-chart-fill">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                  <Users className="w-5 h-5 text-secondary" />
                  Customer Sentiment Distribution
                </h3>
                {sentimentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => {
                          const name = entry?.name ?? ''
                          const percentRaw = entry?.percent
                          const percent = typeof percentRaw === 'number' ? percentRaw : Number(percentRaw) || 0
                          return `${name}: ${(percent * 100).toFixed(0)}%`
                        }}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[320px] flex items-center justify-center text-muted-foreground">
                    No sentiment data available
                  </div>
                )}
              </Card>

              <Card
                className="bg-card/50 backdrop-blur-sm border-accent/30 p-6 hover:border-accent/50 transition-all duration-300 animate-chart-fill"
                style={{ animationDelay: "0.1s" }}
              >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                  <Target className="w-5 h-5 text-accent" />
                  Market Share Comparison
                </h3>
                {marketShareData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={marketShareData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#64748b" opacity={0.3} />
                      <XAxis
                        type="number"
                        stroke="#64748b"
                        tick={{ fill: "#ffffff", fontSize: 14, fontWeight: 600 }}
                        label={{
                          position: "insideBottom",
                          offset: -5,
                          fill: "#ffffff",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#64748b"
                        tick={{ fill: "#ffffff", fontSize: 14, fontWeight: 700 }}
                        width={90}
                      />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Market Share"]}
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "2px solid #3b82f6",
                          borderRadius: "0.75rem",
                          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                        }}
                        labelStyle={{ color: "#ffffff", fontWeight: 600 }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "10px" }} iconType="circle" />
                      <Bar dataKey="share" name="Market Share %" radius={[0, 8, 8, 0]}>
                        {marketShareData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[320px] flex items-center justify-center text-muted-foreground">
                    No market share data available
                  </div>
                )}
              </Card>

              <Card
                className="bg-card/50 backdrop-blur-sm border-primary/30 p-6 hover:border-primary/50 transition-all duration-300 animate-chart-fill"
                style={{ animationDelay: "0.2s" }}
              >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Competitor Updates Timeline
                </h3>
                {timelineData.length > 0 ? (
                  <div className="h-[300px] overflow-y-auto space-y-4 pr-2">
                    {timelineData.map((item, index) => (
                      <div
                        key={index}
                        className="relative pl-8 pb-4 border-l-2 border-border last:border-l-0 animate-timeline-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div
                          className="absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 border-background"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="bg-muted/30 p-3 rounded-lg border border-border hover:border-primary/50 transition-all duration-300">
                          <div className="font-semibold text-sm mb-1 text-foreground" style={{ color: item.color }}>
                            {item.competitor}
                          </div>
                          <div className="text-xs text-foreground">{item.update}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No competitor updates available
                  </div>
                )}
              </Card>

              <Card
                className="bg-card/50 backdrop-blur-sm border-secondary/30 p-6 hover:border-secondary/50 transition-all duration-300 animate-chart-fill"
                style={{ animationDelay: "0.3s" }}
              >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                  <MessageSquare className="w-5 h-5 text-secondary" />
                  Customer Feedback Themes
                </h3>
                {wordCloudData.length > 0 ? (
                  <div className="h-[300px] flex flex-wrap items-center justify-center gap-4 p-4">
                    {wordCloudData.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="inline-block px-3 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg border border-primary/30 hover:border-primary/60 hover:scale-110 transition-all duration-300 cursor-pointer animate-word-scale-in"
                        style={{
                          fontSize: `${Math.max(12, item.size / 5)}px`,
                          animationDelay: `${index * 0.05}s`,
                        }}
                        title={`${item.mentions} mentions`}
                      >
                        <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          {item.theme}
                        </span>
                        <span className="text-xs text-foreground ml-2">({item.mentions})</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No feedback themes available
                  </div>
                )}
              </Card>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {pulseData.FullMarketAnalysis && (
                <Card
                  className="bg-card/50 backdrop-blur-sm border-primary/30 p-6 cursor-pointer hover:border-primary/50 transition-all duration-300"
                  onClick={() => handleExpand("Full Market Analysis", pulseData.FullMarketAnalysis)}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Brain className="w-6 h-6 text-primary" />
                      Full Market Analysis
                    </h2>
                    <Maximize2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground leading-relaxed line-clamp-6">{pulseData.FullMarketAnalysis}</p>
                  <p className="text-xs text-primary mt-2">Click to read full analysis</p>
                </Card>
              )}

              {pulseData.CompetitorAnalysis && pulseData.CompetitorAnalysis.length > 0 && (
                <Card
                  className="bg-card/50 backdrop-blur-sm border-primary/30 p-6 cursor-pointer hover:border-primary/50 transition-all duration-300"
                  onClick={() => handleExpand("Competitor Analysis", pulseData.CompetitorAnalysis)}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-primary" />
                      Competitor Analysis
                    </h2>
                    <Maximize2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-4">
                    {pulseData.CompetitorAnalysis.slice(0, 2).map((comp: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/40 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-semibold text-lg">{comp.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {comp.position} • Market Share: {comp.marketShare}
                            </div>
                          </div>
                        </div>
                        {comp.updates && comp.updates.length > 0 && (
                          <ul className="space-y-2 mt-3">
                            {comp.updates.slice(0, 2).map((update: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <span className="line-clamp-2">{update}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-primary mt-4">Click to view all competitors</p>
                </Card>
              )}

              {pulseData.CustomerSentimentAnalysis && (
                <Card
                  className="bg-card/50 backdrop-blur-sm border-secondary/30 p-6 cursor-pointer hover:border-secondary/50 transition-all duration-300"
                  onClick={() => handleExpand("Customer Sentiment Analysis", pulseData.CustomerSentimentAnalysis)}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-secondary" />
                      Customer Sentiment Analysis
                    </h2>
                    <Maximize2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-6">
                    {pulseData.CustomerSentimentAnalysis.Positive && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Positive Sentiment</span>
                          <span className="text-sm font-semibold text-secondary">
                            {pulseData.CustomerSentimentAnalysis.Positive.percentage}
                          </span>
                        </div>
                        <div className="h-4 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-secondary to-accent rounded-full"
                            style={{
                              width: pulseData.CustomerSentimentAnalysis.Positive.percentage,
                            }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {pulseData.CustomerSentimentAnalysis.Positive.summary}
                        </p>
                      </div>
                    )}

                    {pulseData.CustomerSentimentAnalysis.Neutral && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Neutral Sentiment</span>
                          <span className="text-sm font-semibold">
                            {pulseData.CustomerSentimentAnalysis.Neutral.percentage}
                          </span>
                        </div>
                        <div className="h-4 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-muted-foreground rounded-full"
                            style={{
                              width: pulseData.CustomerSentimentAnalysis.Neutral.percentage,
                            }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {pulseData.CustomerSentimentAnalysis.Neutral.summary}
                        </p>
                      </div>
                    )}

                    {pulseData.CustomerSentimentAnalysis.Negative && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Negative Sentiment</span>
                          <span className="text-sm font-semibold text-destructive">
                            {pulseData.CustomerSentimentAnalysis.Negative.percentage}
                          </span>
                        </div>
                        <div className="h-4 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-destructive rounded-full"
                            style={{
                              width: pulseData.CustomerSentimentAnalysis.Negative.percentage,
                            }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {pulseData.CustomerSentimentAnalysis.Negative.summary}
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-primary mt-4">Click to view full sentiment breakdown</p>
                </Card>
              )}

              {pulseData.TopCustomerFeedbackThemes && pulseData.TopCustomerFeedbackThemes.length > 0 && (
                <Card
                  className="bg-card/50 backdrop-blur-sm border-secondary/30 p-6 cursor-pointer hover:border-secondary/50 transition-all duration-300"
                  onClick={() => handleExpand("Top Customer Feedback Themes", pulseData.TopCustomerFeedbackThemes)}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-secondary" />
                      Top Customer Feedback Themes
                    </h2>
                    <Maximize2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    {pulseData.TopCustomerFeedbackThemes.slice(0, 3).map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-secondary font-bold">{index + 1}.</span>
                          <span className="text-sm">{item.theme}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.mentions} mentions</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-primary mt-4">Click to view all themes</p>
                </Card>
              )}

              {pulseData.MarketTrendsInsights && pulseData.MarketTrendsInsights.length > 0 && (
                <Card
                  className="bg-card/50 backdrop-blur-sm border-accent/30 p-6 cursor-pointer hover:border-accent/50 transition-all duration-300"
                  onClick={() => handleExpand("Market Trends & Insights", pulseData.MarketTrendsInsights)}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-accent" />
                      Market Trends & Insights
                    </h2>
                    <Maximize2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-4">
                    {pulseData.MarketTrendsInsights.slice(0, 2).map((item: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 bg-muted/30 rounded-lg border border-border hover:border-accent/50 hover:bg-muted/40 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-secondary" />
                            <span className="font-semibold">{item.trend}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{item.mentions} mentions</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              item.trendDirection === "Trending Up"
                                ? "bg-secondary/20 text-secondary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.trendDirection}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-primary mt-4">Click to view all trends</p>
                </Card>
              )}

              {pulseData.RecommendedActions && pulseData.RecommendedActions.length > 0 && (
                <Card
                  className="bg-card/50 backdrop-blur-sm border-primary/30 p-6 cursor-pointer hover:border-primary/50 transition-all duration-300"
                  onClick={() => handleExpand("Recommended Actions", pulseData.RecommendedActions)}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-primary" />
                      Recommended Actions
                    </h2>
                    <Maximize2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    {pulseData.RecommendedActions.slice(0, 3).map((action: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <span className="text-primary font-bold text-lg">{index + 1}.</span>
                        <span className="text-sm line-clamp-2">{action}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-primary mt-4">Click to view all actions</p>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/30 p-6 sticky top-24 hover:border-primary/50 transition-all duration-300">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  AI Assistant
                </h2>

                <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
                  {chatHistory.map((chat, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg transition-all duration-300 ${
                        chat.role === "user"
                          ? "bg-primary/20 border border-primary/30 ml-4 hover:border-primary/50"
                          : "bg-muted/30 border border-border mr-4 hover:border-secondary/50"
                      }`}
                    >
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        {chat.role === "user" ? "You" : "AI Assistant"}
                      </div>
                      <div className="text-sm leading-relaxed whitespace-pre-line">{chat.message}</div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="p-4 rounded-lg bg-muted/30 border border-border mr-4">
                      <div className="text-xs font-medium text-muted-foreground mb-1">AI Assistant</div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        />
                        <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Ask me anything about your market..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    disabled={isChatLoading}
                    className="bg-background/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                  <Button
                    type="submit"
                    disabled={isChatLoading}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 hover:scale-105 glow-effect transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isChatLoading ? "Sending..." : "Send Message"}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Suggested Questions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setChatMessage("What are top customer concerns?")}
                      disabled={isChatLoading}
                      className="w-full text-left p-3 bg-muted/30 hover:bg-muted/50 hover:border-primary/50 border border-transparent rounded-lg text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      What are top customer concerns?
                    </button>
                    <button
                      onClick={() => setChatMessage("How do I respond to competitor moves?")}
                      disabled={isChatLoading}
                      className="w-full text-left p-3 bg-muted/30 hover:bg-muted/50 hover:border-primary/50 border border-transparent rounded-lg text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      How do I respond to competitor moves?
                    </button>
                    <button
                      onClick={() => setChatMessage("What are the biggest risks?")}
                      disabled={isChatLoading}
                      className="w-full text-left p-3 bg-muted/30 hover:bg-muted/50 hover:border-primary/50 border border-transparent rounded-lg text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      What are the biggest risks?
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {expandedContent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-backdrop-fade-in">
          <div className="absolute inset-0 bg-background/95 backdrop-blur-lg" onClick={closeExpandedModal} />

          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-card border-2 border-primary/50 rounded-2xl shadow-2xl animate-modal-slide-up p-8">
            <button
              onClick={closeExpandedModal}
              className="absolute top-4 right-4 p-2 bg-muted/50 hover:bg-muted hover:scale-110 rounded-full transition-all duration-300 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-3xl font-bold mb-6 pr-12">{expandedContent.title}</h2>

            <div className="text-muted-foreground leading-relaxed">
              {typeof expandedContent.content === "string" ? (
                <div className="whitespace-pre-line">{expandedContent.content}</div>
              ) : Array.isArray(expandedContent.content) ? (
                <div className="space-y-4">
                  {expandedContent.content.map((item: any, index: number) => {
                    if (typeof item === "string") {
                      return (
                        <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border">
                          <div className="flex items-start gap-3">
                            <span className="text-primary font-bold text-lg">{index + 1}.</span>
                            <span>{item}</span>
                          </div>
                        </div>
                      )
                    } else if (item.name) {
                      return (
                        <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border">
                          <div className="font-semibold text-lg mb-2">{item.name}</div>
                          <div className="text-sm text-muted-foreground mb-3">
                            {item.position} • Market Share: {item.marketShare}
                          </div>
                          {item.updates && item.updates.length > 0 && (
                            <ul className="space-y-2">
                              {item.updates.map((update: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
                                  <span>{update}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )
                    } else if (item.theme) {
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-secondary font-bold">{index + 1}.</span>
                            <span>{item.theme}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{item.mentions} mentions</span>
                        </div>
                      )
                    } else if (item.trend) {
                      return (
                        <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-secondary" />
                              <span className="font-semibold">{item.trend}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{item.mentions} mentions</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                item.trendDirection === "Trending Up"
                                  ? "bg-secondary/20 text-secondary"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {item.trendDirection}
                            </span>
                          </div>
                          <p className="text-sm">{item.summary}</p>
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              ) : typeof expandedContent.content === "object" ? (
                <div className="space-y-6">
                  {Object.entries(expandedContent.content).map(([key, value]: [string, any]) => (
                    <div key={key} className="p-4 bg-muted/30 rounded-lg border border-border">
                      <h3 className="font-semibold text-lg mb-3">{key}</h3>
                      {value.percentage && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Percentage</span>
                            <span className="text-sm font-semibold">{value.percentage}</span>
                          </div>
                          <div className="h-4 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                key === "Positive"
                                  ? "bg-gradient-to-r from-secondary to-accent"
                                  : key === "Negative"
                                    ? "bg-destructive"
                                    : "bg-muted-foreground"
                              }`}
                              style={{ width: value.percentage }}
                            />
                          </div>
                        </div>
                      )}
                      {value.summary && <p className="text-sm">{value.summary}</p>}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
