"use client";

import { useState, useEffect, JSX } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, FileText, Folder } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { FsNodeTreeResponse } from "@detective-quill/shared-types";

interface SearchResult {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  word_count?: number;
}

interface SearchInputProps {
  nodes: FsNodeTreeResponse[];
  onResultSelect: (nodeId: string) => void;
  className?: string;
}

const SearchInput = ({
  nodes,
  onResultSelect,
  className,
}: SearchInputProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Flatten nodes for searching
  const flattenNodes = (nodeList: FsNodeTreeResponse[]): SearchResult[] => {
    const flattened: SearchResult[] = [];

    const traverse = (nodes: FsNodeTreeResponse[]) => {
      nodes.forEach((node) => {
        flattened.push({
          id: node.id,
          name: node.name,
          type: node.node_type,
          path: node.path || `/${node.name}`,
          word_count: node.word_count,
        });

        if (node.children) {
          traverse(node.children);
        }
      });
    };

    traverse(nodeList);
    return flattened;
  };

  // Search function
  const searchNodes = (searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return [];

    const allNodes = flattenNodes(nodes);
    const lowercaseQuery = searchQuery.toLowerCase();

    return allNodes
      .filter(
        (node) =>
          node.name.toLowerCase().includes(lowercaseQuery) ||
          node.path.toLowerCase().includes(lowercaseQuery)
      )
      .sort((a, b) => {
        // Prioritize exact name matches
        const aNameMatch = a.name.toLowerCase().indexOf(lowercaseQuery);
        const bNameMatch = b.name.toLowerCase().indexOf(lowercaseQuery);

        if (aNameMatch !== bNameMatch) {
          return aNameMatch - bNameMatch;
        }

        // Then prioritize files over folders
        if (a.type !== b.type) {
          return a.type === "file" ? -1 : 1;
        }

        // Finally sort alphabetically
        return a.name.localeCompare(b.name);
      })
      .slice(0, 10); // Limit to 10 results
  };

  // Update results when query changes
  useEffect(() => {
    const newResults = searchNodes(query);
    setResults(newResults);
    setSelectedIndex(-1);
    setIsOpen(query.trim().length > 0 && newResults.length > 0);
  }, [query, nodes]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        clearSearch();
        break;
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    onResultSelect(result.id);
    clearSearch();
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search files and folders..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={clearSearch}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={result.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                selectedIndex === index && "bg-accent text-accent-foreground"
              )}
              onClick={() => handleResultSelect(result)}
            >
              {result.type === "file" ? (
                <FileText className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-amber-500" />
              )}

              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {highlightMatch(result.name, query)}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {result.path}
                  {result.type === "file" &&
                    result.word_count &&
                    result.word_count > 0 && (
                      <span className="ml-2">• {result.word_count} words</span>
                    )}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">{result.type}</div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 p-3">
          <div className="text-sm text-muted-foreground text-center">
            No files or folders found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to highlight matching text
function highlightMatch(text: string, query: string): JSX.Element {
  if (!query.trim()) return <span>{text}</span>;

  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <span>{text}</span>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <span>
      {before}
      <span className="bg-yellow-200 dark:bg-yellow-800 font-semibold">
        {match}
      </span>
      {after}
    </span>
  );
}

export default SearchInput;