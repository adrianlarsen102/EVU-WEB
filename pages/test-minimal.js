export default function TestMinimal() {
  return (
    <div>
      <h1>Test Minimal Page</h1>
      <p>This is a minimal test page.</p>
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
