export default async function handler(req, res) {
    try {
        const projectId = process.env.VERCEL_PROJECT_ID;
        const token = process.env.VERCEL_API_TOKEN;

        const url = `https://api.vercel.com/v1/analytics/overview?projectId=${projectId}&from=7d`;

        const apiRes = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const result = await apiRes.json();

        const daily = result?.metrics?.visitors?.daily || [];

        const today = daily[daily.length - 1]?.count || 0;

        const avg =
            daily.reduce((sum, d) => sum + d.count, 0) /
            (daily.length || 1);

        res.status(200).json({
            dailyVisits: today,
            dailyAvg: Math.round(avg),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}