const styles = {
    shell: {
        display: 'flex',
        minHeight: '100vh',
        background: '#f7f7f7',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    
     // Sidebar
    sidebar: {
        width: '240px',
        flexShrink: 0,
        background: '#fff',
        borderRight: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
    },
    sidebarLogo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '24px 20px 20px',
        cursor: 'pointer',
        borderBottom: '1px solid #f0f0f0',
        marginBottom: '8px',
    },
    logoText: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#222',
        letterSpacing: '-0.3px',
    },
    logoTag: {
        fontSize: '11px',
        fontWeight: '600',
        color: '#ff385c',
        background: '#fff0f3',
        padding: '2px 7px',
        borderRadius: '20px',
    },
    sidebarNav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        padding: '0 12px',
        flex: 1,
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '11px 14px',
        borderRadius: '10px',
        border: 'none',
        background: 'transparent',
        fontSize: '14px',
        fontWeight: '500',
        color: '#555',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s, color 0.15s',
        width: '100%',
    },
    navItemActive: {
        background: '#f7f7f7',
        color: '#222',
        fontWeight: '600',
    },
    navIcon: {
        fontSize: '17px',
        width: '22px',
        textAlign: 'center',
        flexShrink: 0,
    },
    sidebarBottom: {
        padding: '12px',
    },
    dividerLine: {
        height: '1px',
        background: '#f0f0f0',
        margin: '12px 0',
    },
    profileRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 6px',
    },
    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: '#222',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: '700',
        flexShrink: 0,
    },
    profileInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    profileName: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#222',
    },
    profileRole: {
        fontSize: '11px',
        color: '#ff385c',
        fontWeight: '500',
    },
    logoutBtn: {
        width: '100%',
        padding: '10px 14px',
        background: 'none',
        border: '1px solid #eee',
        borderRadius: '10px',
        fontSize: '13px',
        color: '#888',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s',
    },

    // Main
    main: {
        flex: 1,
        padding: '40px 40px',
        overflowY: 'auto',
        maxWidth: '1000px',
    },
    pageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
    },
    pageTitle: {
        fontSize: '26px',
        fontWeight: '700',
        color: '#222',
        margin: 0,
    },
    pageSub: {
        fontSize: '14px',
        color: '#888',
        marginTop: '4px',
    },
    addBtn: {
        background: '#ff385c',
        color: '#fff',
        border: 'none',
        padding: '12px 22px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },

    // Stats
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '40px',
    },
    statCard: {
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: '14px',
        padding: '22px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    statIcon: { fontSize: '20px' },
    statNum: { fontSize: '28px', fontWeight: '700', color: '#222' },
    statLabel: { fontSize: '13px', color: '#888' },

    // Section header
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#222',
        margin: 0,
    },
    seeAllBtn: {
        background: 'none',
        border: 'none',
        fontSize: '14px',
        color: '#ff385c',
        fontWeight: '600',
        cursor: 'pointer',
    },

    // Listing cards
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
    },
    listingCard: {
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: '14px',
        overflow: 'hidden',
    },
    listingCardImg: {
        height: '140px',
        background: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    listingCardBody: {
        padding: '14px 16px',
    },
    listingCardTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#222',
        margin: '0 0 4px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    listingCardLocation: {
        fontSize: '12px',
        color: '#888',
        margin: '0 0 12px',
    },
    listingCardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    listingCardPrice: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#222',
    },

    // Table
    table: {
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: '14px',
        overflow: 'hidden',
    },
    tableHeader: {
        display: 'flex',
        padding: '14px 20px',
        background: '#f9f9f9',
        borderBottom: '1px solid #eee',
        fontSize: '12px',
        fontWeight: '700',
        color: '#aaa',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
    },
    tableRow: {
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #f5f5f5',
        fontSize: '14px',
        transition: 'background 0.15s',
    },

    // Buttons
    editBtn: {
        background: '#f5f5f5',
        border: 'none',
        padding: '6px 14px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        color: '#444',
    },
    deleteBtn: {
        background: '#fff0f2',
        color: '#ff385c',
        border: 'none',
        padding: '6px 14px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
    },

    // Empty
    emptyBox: {
        textAlign: 'center',
        padding: '64px 40px',
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: '14px',
    },
    emptyIcon: { fontSize: '40px', margin: '0 0 12px' },
    emptyTitle: { fontSize: '17px', fontWeight: '700', color: '#222', margin: '0 0 6px' },
    emptyText: { fontSize: '14px', color: '#888', margin: '0 0 20px' },

    // Skeleton
    skeletonGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
    },
    skeleton: {
        height: '220px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
        borderRadius: '14px',
    },

    // Settings
    settingsCard: {
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: '14px',
        padding: '8px 24px',
        maxWidth: '560px',
    },
    settingsRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px 0',
    },
    settingsLabel: {
        fontSize: '12px',
        color: '#888',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        margin: '0 0 4px',
    },
    settingsValue: {
        fontSize: '15px',
        fontWeight: '500',
        color: '#222',
        margin: 0,
    },
    
};

export default styles;