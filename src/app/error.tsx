"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="standalone">
      <h1>Chưa thể tải trang</h1>
      <p>Vui lòng thử lại để tiếp tục.</p>
      <button className="btn primary" onClick={reset}>
        Thử lại
      </button>
    </main>
  );
}
