import { useState, useEffect } from "react";

export function useCountdown(endDateStr: string | null) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(() => !endDateStr);

  useEffect(() => {
    if (!endDateStr) {
      return;
    }

    const endDate = new Date(endDateStr).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = endDate - now;

      if (distance <= 0) {
        setTimeLeft(null);
        setIsExpired(true);
        return;
      }

      setIsExpired(false);
      
      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const formatted = [
        hours.toString().padStart(2, "0"),
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0")
      ].join(":");

      setTimeLeft(formatted);
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endDateStr]);

  return { timeLeft, isExpired };
}
