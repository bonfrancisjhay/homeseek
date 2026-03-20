import { Link } from 'react-router-dom';

function Home() {
    return (
        <div style={styles.container}>
            <div style={styles.hero}>
                <h1 style={styles.title}>Find your perfect<br />place to stay</h1>
                <p style={styles.sub}>
                    Discover unique homes and properties across the Philippines
                </p>
                <Link to="/listings" style={styles.btn}>
                    Browse Listings
                </Link>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)'
    },
    hero: { textAlign: 'center', padding: '24px' },
    title: {
        fontSize: 'clamp(36px, 6vw, 64px)',
        fontWeight: 'bold',
        color: '#222',
        lineHeight: '1.2',
        marginBottom: '16px'
    },
    sub: {
        fontSize: '18px',
        color: '#666',
        marginBottom: '32px',
        maxWidth: '480px',
        margin: '0 auto 32px'
    },
    btn: {
        display: 'inline-block',
        background: '#ff385c',
        color: '#fff',
        textDecoration: 'none',
        padding: '14px 32px',
        borderRadius: '30px',
        fontSize: '16px',
        fontWeight: '600'
    }
};

export default Home;