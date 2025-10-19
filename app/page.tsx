"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import TimeoutModal from "@/components/ui/TimeoutModal"
import {
  Brain,
  TrendingUp,
  Bell,
  BarChart3,
  Zap,
  Search,
  Target,
  X,
  ChevronRight,
  Sparkles,
  Users,
  Globe,
  MessageSquare,
  AlertTriangle,
  Maximize2,
} from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [keyword, setKeyword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [pulseData, setPulseData] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showTimeoutModal, setShowTimeoutModal] = useState(false)
  const [timeoutMessage, setTimeoutMessage] = useState<string>("")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [expandedContent, setExpandedContent] = useState<{ title: string; content: string } | null>(null)

  const featuresRef = useRef<HTMLElement>(null)
  const demoRef = useRef<HTMLElement>(null)
  const howItWorksRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setIsVisible(true)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed")
          }
        })
      },
      { threshold: 0.1 },
    )

    const sections = [featuresRef.current, demoRef.current, howItWorksRef.current]
    sections.forEach((section) => {
      if (section) observer.observe(section)
    })

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      setMousePosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Check if we should reopen the modal (coming from details page)
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("showSummary") === "true") {
      const storedData = localStorage.getItem("pulseData")
      if (storedData) {
        setPulseData(JSON.parse(storedData))
        setShowModal(true)
        // Clean up URL
        window.history.replaceState({}, "", "/")
      }
    }

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section)
      })
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const handleGeneratePulse = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!keyword.trim()) {
      alert("Please enter a market or company keyword")
      return
    }

    setIsLoading(true)
    setPulseData(null)

    // Use AbortController to implement a client-side timeout (9s)
    const controller = new AbortController()
  const timeoutMs = 10000
    const timeoutHandle = setTimeout(() => {
      // abort the fetch; this will throw a DOMException with name 'AbortError'
      controller.abort()
      setTimeoutMessage(
        "The API is taking too long. It may be asleep. Please restart it using the link 'API Source (Hugging Face)' in the footer."
      )
      setShowTimeoutModal(true)
    }, timeoutMs)

    try {
      const response = await fetch("https://ItsMeArm00n-NexGen-API.hf.space/generate_pulse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company: keyword }),
        signal: controller.signal,
      })

      // clear the timeout once we have a response
      clearTimeout(timeoutHandle)

      if (!response.ok) {
        // unexpected non-2xx response
        console.error("[v0] Non-OK response status:", response.status)
        setTimeoutMessage(
          "The API returned an error status. It may be asleep or out of credits. Please restart it using the link 'API Source (Hugging Face)' in the footer.",
        )
        setShowTimeoutModal(true)
        return
      }

      const data = await response.json()
      console.log("[v0] API Response:", data)

      // basic validation: ensure we have useful fields
      if (!data || typeof data !== "object" || (!data.FullMarketAnalysis && !data.CompetitorActivity && !data.CustomerSentiment)) {
        setTimeoutMessage(
          "The API returned an unexpected response. It may be asleep or misconfigured. Please restart it using the link 'API Source (Hugging Face)' in the footer.",
        )
        setShowTimeoutModal(true)
        return
      }

      setPulseData(data)
      localStorage.setItem("pulseData", JSON.stringify(data))
      setShowModal(true)
    } catch (error: any) {
      // clear timeout if an exception occurred before it fired
      clearTimeout(timeoutHandle)

      // If fetch was aborted due to timeout, show the timeout modal with message
      if (error?.name === "AbortError") {
        console.warn("[v0] Fetch aborted (timeout)")
        setTimeoutMessage(
          "The API is taking too long. It may be asleep. Please restart it using the link 'API Source (Hugging Face)' in the footer.",
        )
        setShowTimeoutModal(true)
      } else {
        console.error("[v0] Error fetching pulse data:", error)
        setShowErrorModal(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToDemo = () => {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const closeErrorModal = () => {
    setShowErrorModal(false)
  }

  const closeTimeoutModal = () => {
    setShowTimeoutModal(false)
  }

  const handleExpand = (title: string, content: string) => {
    setExpandedContent({ title, content })
  }

  const closeExpandedModal = () => {
    setExpandedContent(null)
  }

  const analysisData = pulseData?.marketAnalysisDigest || pulseData

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 animate-gradient opacity-50 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`,
          }}
        />

        <div
          className="absolute top-20 left-10 w-3 h-3 bg-primary rounded-full animate-float opacity-70 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
          }}
        />
        <div
          className="absolute top-40 right-20 w-4 h-4 bg-secondary rounded-full animate-float opacity-60 transition-transform duration-300 ease-out"
          style={{
            animationDelay: "1s",
            transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)`,
          }}
        />
        <div
          className="absolute bottom-40 left-1/4 w-3 h-3 bg-accent rounded-full animate-float opacity-50 transition-transform duration-300 ease-out"
          style={{
            animationDelay: "2s",
            transform: `translate(${mousePosition.x * 25}px, ${mousePosition.y * 25}px)`,
          }}
        />
        <div
          className="absolute top-1/3 right-1/3 w-2 h-2 bg-primary rounded-full animate-float opacity-40 transition-transform duration-300 ease-out"
          style={{
            animationDelay: "3s",
            transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`,
          }}
        />
        <div
          className="absolute bottom-20 right-10 w-3 h-3 bg-secondary rounded-full animate-float opacity-70 transition-transform duration-300 ease-out"
          style={{
            animationDelay: "3.5s",
            transform: `translate(${mousePosition.x * -18}px, ${mousePosition.y * -18}px)`,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                NexGen AI
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                Features
              </a>
              <Link
                href="/demo"
                className="text-sm font-medium text-muted-foreground hover:text-secondary hover:scale-110 transition-all duration-300"
              >
                Demo
              </Link>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-300"
              >
                How It Works
              </a>
              <Button
                size="sm"
                onClick={scrollToDemo}
                className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 hover:scale-105 transition-all duration-300 glow-effect"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
  <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
        <div className="absolute inset-0 overflow-hidden">
          {/* Primary gradient layer */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient opacity-60 transition-transform duration-700 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px) rotate(${mousePosition.x * 2}deg)`,
            }}
          />
          {/* Secondary gradient layer */}
          <div
            className="absolute inset-0 bg-gradient-to-tr from-accent/15 via-primary/15 to-secondary/15 animate-gradient opacity-50 transition-transform duration-500 ease-out"
            style={{
              animationDelay: "2s",
              transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px) rotate(${mousePosition.x * -3}deg)`,
            }}
          />
          {/* Radial gradient overlays */}
          <div
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-primary/30 via-primary/10 to-transparent rounded-full blur-3xl animate-pulse-wave transition-transform duration-700 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 40}px, ${mousePosition.y * 40}px) scale(${1 + mousePosition.x * 0.1})`,
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-gradient-radial from-secondary/30 via-secondary/10 to-transparent rounded-full blur-3xl animate-pulse-wave transition-transform duration-700 ease-out"
            style={{
              animationDelay: "1.5s",
              transform: `translate(${mousePosition.x * -35}px, ${mousePosition.y * -35}px) scale(${1 + mousePosition.y * 0.1})`,
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-accent/25 via-accent/10 to-transparent rounded-full blur-3xl animate-pulse-wave transition-transform duration-700 ease-out"
            style={{
              animationDelay: "3s",
              transform: `translate(calc(-50% + ${mousePosition.x * 30}px), calc(-50% + ${mousePosition.y * 30}px))`,
            }}
          />
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Brain icons */}
          <Brain
            className="absolute top-20 left-[10%] w-8 h-8 text-primary/40 animate-float transition-all duration-500 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 25}px, ${mousePosition.y * 25}px) rotate(${mousePosition.x * 10}deg)`,
            }}
          />
          <Brain
            className="absolute bottom-32 right-[15%] w-10 h-10 text-secondary/30 animate-float transition-all duration-500 ease-out"
            style={{
              animationDelay: "2s",
              transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px) rotate(${mousePosition.x * -15}deg)`,
            }}
          />

          {/* Sparkles icons */}
          <Sparkles
            className="absolute top-1/4 right-[20%] w-6 h-6 text-accent/50 animate-float transition-all duration-500 ease-out"
            style={{
              animationDelay: "1s",
              transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px) rotate(${mousePosition.y * 20}deg)`,
            }}
          />
          <Sparkles
            className="absolute bottom-1/3 left-[25%] w-7 h-7 text-primary/40 animate-float transition-all duration-500 ease-out"
            style={{
              animationDelay: "3s",
              transform: `translate(${mousePosition.x * 28}px, ${mousePosition.y * 28}px) rotate(${mousePosition.y * -25}deg)`,
            }}
          />

          {/* Zap icons */}
          <Zap
            className="absolute top-1/3 left-[15%] w-7 h-7 text-secondary/45 animate-float transition-all duration-500 ease-out"
            style={{
              animationDelay: "1.5s",
              transform: `translate(${mousePosition.x * 22}px, ${mousePosition.y * 22}px) rotate(${mousePosition.x * 12}deg)`,
            }}
          />
          <Zap
            className="absolute bottom-1/4 right-[25%] w-6 h-6 text-accent/40 animate-float transition-all duration-500 ease-out"
            style={{
              animationDelay: "2.5s",
              transform: `translate(${mousePosition.x * -25}px, ${mousePosition.y * -25}px) rotate(${mousePosition.x * -18}deg)`,
            }}
          />

          {/* Target icons */}
          <Target
            className="absolute top-[40%] right-[12%] w-8 h-8 text-primary/35 animate-float transition-all duration-500 ease-out"
            style={{
              animationDelay: "0.5s",
              transform: `translate(${mousePosition.x * -18}px, ${mousePosition.y * -18}px) rotate(${mousePosition.y * 15}deg)`,
            }}
          />

          {/* TrendingUp icons */}
          <TrendingUp
            className="absolute top-[55%] left-[18%] w-9 h-9 text-secondary/40 animate-float transition-all duration-500 ease-out"
            style={{
              animationDelay: "3.5s",
              transform: `translate(${mousePosition.x * 32}px, ${mousePosition.y * 32}px) rotate(${mousePosition.x * -20}deg)`,
            }}
          />

          {/* BarChart3 icons */}
          <BarChart3
            className="absolute bottom-[45%] right-[18%] w-7 h-7 text-accent/45 animate-float transition-all duration-500 ease-out"
            style={{
              animationDelay: "4s",
              transform: `translate(${mousePosition.x * -27}px, ${mousePosition.y * -27}px) rotate(${mousePosition.y * -22}deg)`,
            }}
          />
        </div>

        <div
          className={`relative z-10 max-w-6xl mx-auto text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          {/* Badge with enhanced styling */}
          <div className="inline-flex items-center gap-2 mb-8 mt-8 px-5 py-2.5 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-md rounded-full text-sm border border-primary/40 hover:border-primary/60 hover:scale-105 transition-all duration-300 glow-effect">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              NexGen AI
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-foreground/90">Market Intelligence Platform</span>
          </div>

          {/* Main headline with enhanced typography */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold mb-8 text-balance leading-[1.1] tracking-tight">
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text animate-gradient">
              NexGen AI
            </span>
            <span className="block text-foreground mt-2">Your Market Health Pulse</span>
          </h1>

          {/* Subheadline with better hierarchy */}
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-balance leading-tight">
            <span className="bg-gradient-to-r from-primary/90 via-secondary/90 to-accent/90 bg-clip-text text-transparent">
              Track Competitors. Monitor Customers. Act Smarter.
            </span>
          </p>

          {/* Description with improved readability */}
          <p className="text-lg sm:text-xl text-muted-foreground/90 mb-12 max-w-3xl mx-auto text-pretty leading-relaxed font-medium">
            AI-powered market intelligence that delivers real-time insights about your competitors and customers in one
            unified dashboard. Make data-driven decisions with confidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Button
              size="lg"
              className="group relative bg-gradient-to-r from-primary via-secondary to-accent text-white hover:opacity-90 transition-all duration-300 text-lg px-10 py-7 font-semibold overflow-hidden glow-effect hover:glow-effect-strong hover:scale-105 hover:shadow-2xl"
              onClick={scrollToDemo}
            >
              {/* Button shine effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <span className="relative flex items-center gap-2">
                Generate My Market Health Pulse
                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Button>
          </div>
        </div>
      </section>

      <section id="features" ref={featuresRef} className="scroll-reveal relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Everything you need to stay ahead of the competition and understand your customers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group relative bg-card/50 backdrop-blur-sm border-primary/30 p-8 card-glow-primary neon-border hover:scale-105 hover:border-primary/60 transition-all duration-300">
              <div className="mb-6 w-14 h-14 bg-gradient-to-br from-primary to-primary/50 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 glow-effect">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">Competitor Tracker</h3>
              <p className="text-muted-foreground text-pretty leading-relaxed">
                Monitor competitor websites, social media activity, and news mentions. Get instant alerts when they make
                a move.
              </p>
            </Card>

            <Card className="group relative bg-card/50 backdrop-blur-sm border-secondary/30 p-8 card-glow-secondary neon-border hover:scale-105 hover:border-secondary/60 transition-all duration-300">
              <div className="mb-6 w-14 h-14 bg-gradient-to-br from-secondary to-secondary/50 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 glow-effect">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-secondary">Customer Sentiment Alerts</h3>
              <p className="text-muted-foreground text-pretty leading-relaxed">
                Detect negative sentiment in real-time across all channels. Flag urgent issues before they escalate.
              </p>
            </Card>

            <Card className="group relative bg-card/50 backdrop-blur-sm border-accent/30 p-8 card-glow-accent neon-border hover:scale-105 hover:border-accent/60 transition-all duration-300">
              <div className="mb-6 w-14 h-14 bg-gradient-to-br from-accent to-accent/50 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 glow-effect">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-accent">Weekly Health Pulse Digest</h3>
              <p className="text-muted-foreground text-pretty leading-relaxed">
                Summarized insights combining competitor moves and customer mood. Delivered straight to your inbox.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section id="demo" ref={demoRef} className="scroll-reveal relative py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Try It Now</h2>
            <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
              Enter a market or company keyword to generate your Market Health Pulse
            </p>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/30 p-8 sm:p-12 neon-border hover:border-primary/50 transition-all duration-300">
            <form onSubmit={handleGeneratePulse} className="space-y-6">
              <div>
                <label htmlFor="keyword" className="block text-sm font-medium mb-2 text-muted-foreground">
                  Market or Company Keyword
                </label>
                <div className="flex gap-3">
                  <Input
                    id="keyword"
                    type="text"
                    placeholder="e.g., SaaS analytics, Tesla, fintech"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="flex-1 bg-background/50 border-border text-lg transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 hover:scale-105 glow-effect transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Generate Pulse
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {isLoading && (
              <div className="mt-8 p-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-lg border border-primary/30 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-12 h-12 loading-spinner" />
                  <p className="text-xl font-bold animate-shimmer-text">Generating Market Insights...</p>
                </div>
                <div className="space-y-4">
                  <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent animate-progress" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex flex-col items-center gap-2 p-4 bg-background/50 rounded-lg border border-primary/20 animate-fade-in-stagger-1">
                      <Globe className="w-6 h-6 text-primary" />
                      <span className="text-center">Scanning competitor activity</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 bg-background/50 rounded-lg border border-secondary/20 animate-fade-in-stagger-2">
                      <MessageSquare className="w-6 h-6 text-secondary" />
                      <span className="text-center">Analyzing customer sentiment</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 bg-background/50 rounded-lg border border-accent/20 animate-fade-in-stagger-3">
                      <Sparkles className="w-6 h-6 text-accent" />
                      <span className="text-center">Generating insights</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-backdrop-fade-in">
          <div className="absolute inset-0 bg-background/95 backdrop-blur-lg" onClick={closeErrorModal} />

          <div className="relative w-full max-w-md bg-card border-2 border-destructive/50 rounded-2xl shadow-2xl animate-modal-slide-up p-8">
            <button
              onClick={closeErrorModal}
              className="absolute top-4 right-4 p-2 bg-muted/50 hover:bg-muted hover:scale-110 rounded-full transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>

              <h2 className="text-2xl font-bold mb-3 text-destructive">Backend API Error</h2>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                Please try again. The model may be asleep or out of usage credits.
              </p>

              <Button
                onClick={closeErrorModal}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 hover:scale-105 glow-effect transition-all duration-300"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

  {/* Timeout / Slow API Modal (reusable) */}
  <TimeoutModal open={showTimeoutModal} title="API Timeout" message={timeoutMessage} onClose={closeTimeoutModal} />

      {showModal && pulseData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-backdrop-fade-in">
          <div className="absolute inset-0 bg-background/95 backdrop-blur-lg" onClick={closeModal} />

          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-2 border-primary/50 rounded-2xl shadow-2xl animate-modal-slide-up">
            <button
              onClick={closeModal}
              className="sticky top-4 right-4 float-right z-10 p-2 bg-muted/50 hover:bg-muted hover:scale-110 rounded-full transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 border-b border-border bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">Market Health Pulse Summary</h2>
              </div>
              <p className="text-xl text-muted-foreground">Analysis for "{keyword}"</p>
              {pulseData.dateGenerated && (
                <p className="text-sm text-muted-foreground mt-1">Generated on {pulseData.dateGenerated}</p>
              )}
            </div>

            <div className="p-8 space-y-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <Card
                  className="bg-background/50 border-primary/30 p-6 card-glow-primary cursor-pointer hover:scale-105 transition-all duration-300"
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
                      <div className="text-sm text-muted-foreground">Competitor Activity</div>
                    </div>
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">
                      {pulseData.CompetitorActivity?.level || "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {pulseData.CompetitorActivity?.updateSummary || "No data available"}
                    </div>
                  </div>
                </Card>

                <Card
                  className="bg-background/50 border-secondary/30 p-6 card-glow-secondary cursor-pointer hover:scale-105 transition-all duration-300"
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
                      <div className="text-sm text-muted-foreground">Customer Sentiment</div>
                    </div>
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-secondary">
                      {pulseData.CustomerSentiment?.percentage || "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {pulseData.CustomerSentiment?.changeFromLastWeek || "No change data"}
                    </div>
                  </div>
                </Card>

                <Card
                  className="bg-background/50 border-destructive/30 p-6 hover:shadow-lg hover:shadow-destructive/20 cursor-pointer hover:scale-105 transition-all duration-300"
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
                      <div className="text-sm text-muted-foreground">Urgent Alerts</div>
                    </div>
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-destructive">{pulseData.UrgentAlerts?.count || 0}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {pulseData.UrgentAlerts?.summary || "No urgent alerts"}
                    </div>
                  </div>
                </Card>

                <Card
                  className="bg-background/50 border-accent/30 p-6 card-glow-accent cursor-pointer hover:scale-105 transition-all duration-300"
                  onClick={() =>
                    handleExpand(
                      "Market Share",
                      `Percentage: ${pulseData.MarketShare?.percentage || "N/A"}\n\nGrowth Potential: ${pulseData.MarketShare?.growthPotential || "No growth data"}`,
                    )
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-accent" />
                      <div className="text-sm text-muted-foreground">Market Share</div>
                    </div>
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-accent">{pulseData.MarketShare?.percentage || "N/A"}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {pulseData.MarketShare?.growthPotential || "No growth data"}
                    </div>
                  </div>
                </Card>
              </div>

              {pulseData.FullMarketAnalysis && (
                <Card
                  className="bg-background/50 border-primary/30 p-6 cursor-pointer hover:border-primary/50 transition-all duration-300"
                  onClick={() => handleExpand("Full Market Analysis", pulseData.FullMarketAnalysis)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                      <Brain className="w-6 h-6 text-primary" />
                      Full Market Analysis
                    </h3>
                    <Maximize2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground leading-relaxed line-clamp-4">{pulseData.FullMarketAnalysis}</p>
                  <p className="text-xs text-primary mt-2">Click to read full analysis</p>
                </Card>
              )}

              <div className="flex justify-center">
                <Link href="/details" className="w-full">
                  <Button className="w-full bg-gradient-to-r from-primary via-secondary to-accent text-white hover:opacity-90 hover:scale-105 glow-effect text-lg py-6 transition-all duration-300">
                    <ChevronRight className="w-5 h-5 mr-2" />
                    View Detailed Analysis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {expandedContent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-backdrop-fade-in">
          <div className="absolute inset-0 bg-background/95 backdrop-blur-lg" onClick={closeExpandedModal} />

          <div className="relative w-full max-w-3xl max-h-[80vh] overflow-y-auto bg-card border-2 border-primary/50 rounded-2xl shadow-2xl animate-modal-slide-up p-8">
            <button
              onClick={closeExpandedModal}
              className="absolute top-4 right-4 p-2 bg-muted/50 hover:bg-muted hover:scale-110 rounded-full transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold mb-6 pr-8">{expandedContent.title}</h2>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-line">{expandedContent.content}</div>
          </div>
        </div>
      )}

      <section id="how-it-works" ref={howItWorksRef} className="scroll-reveal relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
              Three simple steps to market intelligence mastery
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="mb-6 mx-auto w-24 h-24 bg-gradient-to-br from-primary to-primary/50 rounded-2xl flex items-center justify-center text-4xl font-bold text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 glow-effect">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">Collect Data</h3>
              <p className="text-muted-foreground text-pretty leading-relaxed">
                Our AI continuously monitors competitor websites, social media, customer reviews, and industry news
                across multiple channels.
              </p>
            </div>

            <div className="text-center group">
              <div className="mb-6 mx-auto w-24 h-24 bg-gradient-to-br from-secondary to-secondary/50 rounded-2xl flex items-center justify-center text-4xl font-bold text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 glow-effect">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-secondary">Analyze with AI</h3>
              <p className="text-muted-foreground text-pretty leading-relaxed">
                Advanced machine learning algorithms process thousands of data points to identify trends, sentiment
                shifts, and competitive threats.
              </p>
            </div>

            <div className="text-center group">
              <div className="mb-6 mx-auto w-24 h-24 bg-gradient-to-br from-accent to-accent/50 rounded-2xl flex items-center justify-center text-4xl font-bold text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 glow-effect">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-accent">Deliver Digest</h3>
              <p className="text-muted-foreground text-pretty leading-relaxed">
                Receive actionable insights in a clean, digestible format. Get instant alerts for urgent issues and
                weekly summaries for strategic planning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 glow-text">Stay Ahead. Stay Smarter.</h2>
          <p className="text-xl text-muted-foreground mb-10 text-pretty leading-relaxed">
            Join leading companies using NexGen AI to make data-driven decisions and outpace their competition.
          </p>
          <Button
            size="lg"
            onClick={scrollToDemo}
            className="bg-gradient-to-r from-primary via-secondary to-accent text-white hover:opacity-90 hover:scale-105 glow-effect text-lg px-10 py-7 group transition-all duration-300"
          >
            Try NexGen AI Now
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </section>

      <footer className="relative py-16 px-4 sm:px-6 lg:px-8 border-t border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Column 1: Branding */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-7 h-7 text-primary" />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  NexGen AI
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                Empowering businesses with AI-powered market intelligence to track competitors, monitor customer
                sentiment, and make data-driven decisions.
              </p>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-foreground">Navigation</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#features"
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    Features
                  </a>
                </li>
                <li>
                  <Link
                    href="/demo"
                    className="text-muted-foreground hover:text-secondary transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    Demo
                  </Link>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-muted-foreground hover:text-accent transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-foreground">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://huggingface.co/spaces/ItsMeArm00n/NexGen-API/tree/main"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <Globe className="w-4 h-4" />
                    API Source (Hugging Face)
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ItsMeArm00n/NexGenAI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-secondary transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <Globe className="w-4 h-4" />
                    Website Source (GitHub)
                  </a>
                </li>
                <li>
                  <a
                    href="https://armaan-ai.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-accent transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <Globe className="w-4 h-4" />
                    Developer Portfolio
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright and Developer Credit */}
          <div className="pt-6 border-t border-border/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>© 2025 NexGen AI. All rights reserved.</p>
              <p>
                Developed by{" "}
                <a
                  href="https://armaan-ai.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-secondary transition-colors duration-300 font-semibold hover:underline"
                >
                  Armaan
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
