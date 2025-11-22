export function Card({ className = "", ...props }) {
    return (
      <div
        className={`rounded-xl border bg-white text-black shadow-sm p-4 ${className}`}
        {...props}
      />
    );
  }
  
  export function CardContent({ className = "", ...props }) {
    return (
      <div className={className} {...props} />
    );
  }
  