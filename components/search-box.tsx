"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X } from "lucide-react"

interface SearchBoxProps {
  onSearch: (query: string) => void
  onClear: () => void
  hasResults: boolean
}

export function SearchBox({ onSearch, onClear, hasResults }: SearchBoxProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }

  const handleClear = () => {
    setSearchQuery("")
    onClear()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-card-foreground flex items-center gap-2">
          <Search className="w-4 h-4" />
          Search Nodes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 text-sm"
          />
          <Button onClick={handleSearch} size="sm" variant="outline" disabled={!searchQuery.trim()}>
            <Search className="w-3 h-3" />
          </Button>
        </div>
        {hasResults && (
          <Button onClick={handleClear} size="sm" variant="ghost" className="w-full text-xs">
            <X className="w-3 h-3 mr-2" />
            Clear Search
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
