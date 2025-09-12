export const SearchLogo = () => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="text-6xl md:text-7xl font-bold tracking-tight">
        <span className="text-accent-red">Bai</span>
        <span className="relative">
          <span className="text-primary">du</span>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-primary-foreground rounded-full relative">
              <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-primary rounded-full"></div>
              <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-primary rounded-full"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>
            </div>
          </div>
        </span>
      </div>
    </div>
  );
};