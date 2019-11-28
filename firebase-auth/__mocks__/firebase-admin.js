module.exports = {
    credential: {
        cert: jest.fn(data => data)
    },
    initializeApp: jest.fn(() => new App())
};

function App() {
    return {
        auth: cached(() => new Auth()),
        delete: jest.fn()
    };
}

function Auth() {
    return {
        tenantManager: jest.fn(cached(() => new TenantManager()))
    };
}

function TenantManager() {
    return {
        authForTenant: jest.fn(cached(() => new Auth()))
    };
}

function cached(handler) {
    let result;
    return () => {
        if (!result) {
            result = handler();
        }
        return result;
    };
}
