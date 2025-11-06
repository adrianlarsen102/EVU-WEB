import Link from 'next/link';
import Layout from '../components/Layout';

export async function getStaticProps() {
  return {
    props: {},
  };
}

export default function Custom404() {
  return (
    <Layout title="404 - Page Not Found">
      <div className="hero">
        <div className="container">
          <h1>404 - Page Not Found</h1>
          <p>The page you are looking for does not exist.</p>
        </div>
      </div>

      <div className="container main-content">
        <div className="connection-box">
          <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
            The page you requested could not be found. It may have been moved or deleted.
          </p>
          <div style={{ textAlign: 'center' }}>
            <Link href="/">
              <button className="btn-primary btn-large">
                Go Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
