import { useEffect, useRef } from "react";

export default function AnnouncementBar() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const scrollText = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += 1;
        }
      }
    };
    
    const timer = setInterval(scrollText, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-black text-white text-xs py-2 overflow-hidden whitespace-nowrap">
      <div 
        ref={containerRef}
        className="flex items-center tracking-wider announcement-text"
        style={{ overflow: "hidden" }}
      >
        <div className="flex space-x-6 items-center animate-scroll">
          <span>★ FREE UK SHIPPING ON ORDERS OVER £49 ★</span>
          <span>★ FREE INTERNATIONAL SHIPPING OVER £80 ★</span>
          <span>★ LIFETIME WARRANTY ★</span>
          <span>★ FREE UK SHIPPING ON ORDERS OVER £49 ★</span>
          <span>★ FREE INTERNATIONAL SHIPPING OVER £80 ★</span>
          <span>★ LIFETIME WARRANTY ★</span>
        </div>
      </div>
    </div>
  );
}
