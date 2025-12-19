function BreakingNewsBanner() {
  return (
    <div 
      className="w-full py-1.5 sm:py-2 overflow-hidden relative"
      style={{ backgroundColor: '#F4C20D' }}
    >
      <div className="flex items-center">
        {/* Red Circle Icon */}
        <div className="flex-shrink-0 px-2 sm:px-3 z-10">
          <div 
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
            style={{ backgroundColor: '#E21E26' }}
          ></div>
        </div>
        
        {/* Marquee Text */}
        <div className="flex-1 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            <span className="text-black font-medium text-xs sm:text-sm md:text-base mr-6 sm:mr-8">
              Breaking News Update — New Headlines — Live Now
            </span>
            <span className="text-black font-medium text-xs sm:text-sm md:text-base mr-6 sm:mr-8">
              Breaking News Update — New Headlines — Live Now
            </span>
            <span className="text-black font-medium text-xs sm:text-sm md:text-base mr-6 sm:mr-8">
              Breaking News Update — New Headlines — Live Now
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BreakingNewsBanner;

