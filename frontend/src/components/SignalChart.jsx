import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, defs, linearGradient,
} from "recharts";

export function SignalChart({ signalBuffer }) {
  const data = signalBuffer.map((v, i) => ({ i, v: +v.toFixed(2) }));

  return (
    <div className="glass rounded-2xl p-4">
      <span className="text-xs font-medium uppercase tracking-widest text-gray-500">
        Green Channel Signal
      </span>

      {data.length === 0 ? (
        <div className="h-[80px] flex items-center justify-center text-gray-600 text-xs">
          Waiting for signal…
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="i" hide />
            <YAxis domain={["auto", "auto"]} hide />
            <Tooltip
              contentStyle={{
                background: "rgba(5,8,15,0.9)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                fontSize: 11,
                color: "#d1fae5",
              }}
              formatter={(v) => [v, "green avg"]}
              labelFormatter={() => ""}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke="#10b981"
              strokeWidth={1.5}
              fill="url(#greenGrad)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
