export default function TimeText({ timestamp }) {
  if (!timestamp) return <span>-</span>;

  const date = new Date(timestamp * 1000);
  return <span>{date.toLocaleString()}</span>;
}