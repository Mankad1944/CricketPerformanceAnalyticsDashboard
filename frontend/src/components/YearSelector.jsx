import { Calendar } from "lucide-react";

const YearSelector = ({ selectedYear, onYearChange }) => {
  const currentYear = new Date().getFullYear();
  const years = [2025, 2024, 2023, 2022, 2021, 2020];

  return (
    <div className="flex items-center gap-2 bg-slate-800/50 border border-white/5 px-4 py-2 rounded-xl">
      <Calendar size={14} className="text-blue-400" />
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mr-2">Season</span>
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(parseInt(e.target.value))}
        className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
      >
        {years.map((y) => (
          <option key={y} value={y} className="bg-slate-900 text-white">
            {y}
          </option>
        ))}
      </select>
    </div>
  );
};

export default YearSelector;
