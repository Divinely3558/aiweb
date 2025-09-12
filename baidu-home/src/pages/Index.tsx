import { Navigation } from "@/components/Navigation";
import { SearchLogo } from "@/components/SearchLogo";
import { SearchBox } from "@/components/SearchBox";
import { TrendingTopics } from "@/components/TrendingTopics";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          {/* Logo and Search */}
          <div className="flex flex-col items-center mb-12">
            <SearchLogo />
            <SearchBox />
          </div>
          
          {/* Trending Topics */}
          <TrendingTopics />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Search Engine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
