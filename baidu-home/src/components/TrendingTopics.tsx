import { TrendingUp } from "lucide-react";

const trendingTopics = [
  { rank: 1, title: "AI Technology Breakthrough", isHot: true },
  { rank: 2, title: "Climate Change Summit 2024", isNew: true },
  { rank: 3, title: "Space Exploration Updates", isHot: false },
  { rank: 4, title: "Economic Market Analysis", isNew: false },
  { rank: 5, title: "Digital Currency Trends", isHot: true },
  { rank: 6, title: "Renewable Energy Progress", isNew: true },
  { rank: 7, title: "Medical Research News", isHot: false },
  { rank: 8, title: "Technology Innovation", isNew: false },
];

export const TrendingTopics = () => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-accent-red" />
        <h2 className="text-lg font-semibold text-foreground">Trending Now</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trendingTopics.map((topic) => (
          <div
            key={topic.rank}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
          >
            <span className="text-sm font-medium text-muted-foreground min-w-[1.5rem]">
              {topic.rank}
            </span>
            <span className="flex-1 text-sm group-hover:text-primary transition-colors">
              {topic.title}
            </span>
            {topic.isHot && (
              <span className="px-2 py-1 text-xs bg-accent-red text-accent-red-foreground rounded-full">
                Hot
              </span>
            )}
            {topic.isNew && (
              <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                New
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};