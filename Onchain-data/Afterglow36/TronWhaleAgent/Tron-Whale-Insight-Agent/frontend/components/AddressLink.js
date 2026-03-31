import Link from "next/link";

function shortAddr(addr = "") {
  if (!addr) return "-";
  if (addr.length <= 18) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

export default function AddressLink({ address }) {
  if (!address) return <span>-</span>;

  return (
    <Link
      href={`/address?address=${encodeURIComponent(address)}`}
      style={styles.link}
      title={address}
    >
      {shortAddr(address)}
    </Link>
  );
}

const styles = {
  link: {
    color: "#60a5fa",
    textDecoration: "none",
    fontWeight: 500,
  },
};