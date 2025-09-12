import { useState } from "react";
import { Search, Mic, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export const SearchBox = () => {
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    toast({
      title: "Searching...",
      description: `Looking for: "${query}"`,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative group">
        <div className="relative flex items-center bg-search border border-search-border rounded-full shadow-[var(--shadow-search)] hover:shadow-lg transition-all duration-300 group-focus-within:border-search-focus group-focus-within:shadow-lg">
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything..."
            className="flex-1 border-0 bg-transparent pl-12 pr-24 py-4 text-base focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted/80"
              title="Voice search"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted/80"
              title="Search by image"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mt-8">
          <Button type="submit" variant="search" size="lg">
            Search
          </Button>
          <Button type="button" variant="secondary" size="lg">
            I'm Feeling Lucky
          </Button>
        </div>
      </form>
    </div>
  );
};