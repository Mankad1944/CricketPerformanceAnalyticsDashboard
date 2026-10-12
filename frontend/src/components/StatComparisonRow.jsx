import React from 'react';

const StatComparisonRow = ({ label, v1, v2, inverse = false, theme }) => {
    const val1 = parseFloat(v1) || 0;
    const val2 = parseFloat(v2) || 0;
    const total = (val1 + val2) || 1;
    const diff = val1 - val2;
    const winner = inverse ? (diff < 0 ? 1 : diff > 0 ? 2 : 0) : (diff > 0 ? 1 : diff < 0 ? 2 : 0);

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-[15px] font-black text-slate-500 uppercase tracking-widest">
                <span>{v1} {winner === 1 && "★"}</span>
                <span className="text-slate-600">{label}</span>
                <span>{winner === 2 && "★"} {v2}</span>
            </div>
            <div className="h-1.5 flex gap-1 bg-white/5 rounded-full overflow-hidden">
                <div
                    style={{ width: `${(val1 / total) * 100}%` }}
                    className={`h-full ${winner === 1 ? 'bg-amber-500' : 'bg-slate-700'} rounded-full transition-all duration-1000`}
                />
                <div
                    style={{ width: `${(val2 / total) * 100}%` }}
                    className={`h-full ${winner === 2 ? 'bg-slate-400' : 'bg-slate-700'} rounded-full transition-all duration-1000`}
                />
            </div>
        </div>
    );
};

export default StatComparisonRow;
