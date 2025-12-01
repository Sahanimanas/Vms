export default function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-[#111827] rounded-2xl p-4 shadow-md ${className}`}>
      {title && (
        <div className="text-gray-400 text-sm mb-3 border-b border-gray-700 pb-2">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
