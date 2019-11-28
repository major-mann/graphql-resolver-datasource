module.exports = {
    google: {
        auth: {
            JWT: jest.fn(function () { return new JwtClient(); })
        }
    }
};

function JwtClient() {
    return {
        authorize: callback => callback(null, { access_token: `fake-token` })
    };
}
